#!/usr/bin/env python
"""
Standalone script to backfill STI (Study Type Identifier) structures for existing projects.
This script migrates existing flat projects to subtype rows using the hybrid model approach.

Usage:
    python scripts/backfill_sti.py [--chunk 1000] [--resume-from 0] [--dry-run]

Example:
    python scripts/backfill_sti.py --chunk 1000 --dry-run
    python scripts/backfill_sti.py --chunk 2000 --resume-from 5000
"""

import os
import sys
import django
import logging
from django.core.management import execute_from_command_line
from django.db import transaction
from django.utils import timezone
from decouple import config

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import after Django setup
from backend.apps.projects.models import Project, SchoolProject, SelfStudyProject, migrate_existing_project_to_sti

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Prometheus metrics (if available)
try:
    from prometheus_client import Counter
    sti_backfill_processed_total = Counter(
        'sti_backfill_processed_total',
        'Total number of projects processed during STI backfill',
        ['status', 'project_type']
    )
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    logger.warning("Prometheus client not available. Metrics will be logged only.")


def backfill_sti_chunk(chunk_size=1000, offset=0, dry_run=False):
    """
    Backfill STI structures for a chunk of existing projects.
    
    Args:
        chunk_size (int): Number of projects to process in this chunk
        offset (int): Starting offset for pagination
        dry_run (bool): If True, don't make any database changes
    
    Returns:
        dict: Statistics about the processing
    """
    # Get projects that need STI backfill
    # Skip drafts and projects that already have STI structures
    projects = Project.objects.filter(
        is_draft=False
    ).exclude(
        # Skip projects that already have STI structures
        school_project__isnull=False
    ).exclude(
        self_study_project__isnull=False
    ).order_by('id')[offset:offset + chunk_size]
    
    total_in_chunk = projects.count()
    logger.info(f"Processing chunk: {total_in_chunk} projects (offset: {offset})")
    
    stats = {
        'processed': 0,
        'created_school': 0,
        'created_self_study': 0,
        'skipped': 0,
        'errors': 0
    }
    
    if dry_run:
        logger.info("DRY RUN MODE - No database changes will be made")
    
    for project in projects:
        try:
            if dry_run:
                # Just simulate the process
                if project.project_type == 'school':
                    stats['created_school'] += 1
                elif project.project_type == 'self_study':
                    stats['created_self_study'] += 1
                else:
                    stats['skipped'] += 1
                stats['processed'] += 1
                continue
            
            # Use the existing migration function
            migrated_project = migrate_existing_project_to_sti(project)
            
            # Count what was created
            if migrated_project.project_type == 'school':
                if hasattr(migrated_project, 'school_project_data'):
                    stats['created_school'] += 1
                    if PROMETHEUS_AVAILABLE:
                        sti_backfill_processed_total.labels(status='created', project_type='school').inc()
                else:
                    stats['skipped'] += 1
                    if PROMETHEUS_AVAILABLE:
                        sti_backfill_processed_total.labels(status='skipped', project_type='school').inc()
            elif migrated_project.project_type == 'self_study':
                if hasattr(migrated_project, 'self_study_project_data'):
                    stats['created_self_study'] += 1
                    if PROMETHEUS_AVAILABLE:
                        sti_backfill_processed_total.labels(status='created', project_type='self_study').inc()
                else:
                    stats['skipped'] += 1
                    if PROMETHEUS_AVAILABLE:
                        sti_backfill_processed_total.labels(status='skipped', project_type='self_study').inc()
            else:
                stats['skipped'] += 1
                if PROMETHEUS_AVAILABLE:
                    sti_backfill_processed_total.labels(status='skipped', project_type='unknown').inc()
            
            stats['processed'] += 1
            
            # Log progress every 100 projects
            if stats['processed'] % 100 == 0:
                logger.info(f"Processed {stats['processed']}/{total_in_chunk} projects in current chunk")
                
        except Exception as e:
            logger.error(f"Error processing project {project.id}: {e}")
            stats['errors'] += 1
            if PROMETHEUS_AVAILABLE:
                sti_backfill_processed_total.labels(status='error', project_type='unknown').inc()
    
    return stats


def backfill_sti(chunk_size=1000, resume_from=0, dry_run=False):
    """
    Main backfill function that processes all projects in chunks.
    
    Args:
        chunk_size (int): Number of projects to process per chunk
        resume_from (int): Offset to resume from (for resumability)
        dry_run (bool): If True, don't make any database changes
    """
    start_time = timezone.now()
    logger.info(f"Starting STI backfill at {start_time}")
    logger.info(f"Chunk size: {chunk_size}, Resume from: {resume_from}, Dry run: {dry_run}")
    
    # Check if STI is enabled
    enable_sti = config('ENABLE_STI', default=False, cast=bool)
    if not enable_sti and not dry_run:
        logger.warning("ENABLE_STI is False. STI structures won't be created.")
        logger.info("Continuing with dry-run mode to show what would be processed.")
        dry_run = True
    
    total_stats = {
        'processed': 0,
        'created_school': 0,
        'created_self_study': 0,
        'skipped': 0,
        'errors': 0,
        'chunks_processed': 0
    }
    
    offset = resume_from
    
    while True:
        # Process one chunk
        chunk_stats = backfill_sti_chunk(chunk_size, offset, dry_run)
        
        # Update total stats
        for key in chunk_stats:
            total_stats[key] += chunk_stats[key]
        total_stats['chunks_processed'] += 1
        
        # Log chunk results
        logger.info(f"Chunk {total_stats['chunks_processed']} completed:")
        logger.info(f"  - Processed: {chunk_stats['processed']}")
        logger.info(f"  - Created SchoolProject: {chunk_stats['created_school']}")
        logger.info(f"  - Created SelfStudyProject: {chunk_stats['created_self_study']}")
        logger.info(f"  - Skipped: {chunk_stats['skipped']}")
        logger.info(f"  - Errors: {chunk_stats['errors']}")
        
        # If we processed fewer projects than the chunk size, we're done
        if chunk_stats['processed'] < chunk_size:
            break
        
        offset += chunk_size
    
    end_time = timezone.now()
    duration = end_time - start_time
    
    # Final summary
    logger.info("=" * 60)
    logger.info("STI BACKFILL COMPLETED")
    logger.info("=" * 60)
    logger.info(f"Duration: {duration}")
    logger.info(f"Chunks processed: {total_stats['chunks_processed']}")
    logger.info(f"Total projects processed: {total_stats['processed']}")
    logger.info(f"SchoolProject created: {total_stats['created_school']}")
    logger.info(f"SelfStudyProject created: {total_stats['created_self_study']}")
    logger.info(f"Projects skipped: {total_stats['skipped']}")
    logger.info(f"Errors: {total_stats['errors']}")
    
    if PROMETHEUS_AVAILABLE:
        logger.info("Prometheus metrics updated")
    else:
        logger.info("Prometheus metrics not available (client not installed)")
    
    return total_stats


if __name__ == '__main__':
    # Parse command line arguments
    chunk_size = 1000
    resume_from = 0
    dry_run = False
    
    # Simple argument parsing
    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == '--chunk' and i < len(sys.argv):
            try:
                chunk_size = int(sys.argv[i])
            except (ValueError, IndexError):
                logger.error("--chunk requires a valid integer")
                sys.exit(1)
        elif arg == '--resume-from' and i < len(sys.argv):
            try:
                resume_from = int(sys.argv[i])
            except (ValueError, IndexError):
                logger.error("--resume-from requires a valid integer")
                sys.exit(1)
        elif arg == '--dry-run':
            dry_run = True
    
    # Run the backfill
    try:
        stats = backfill_sti(chunk_size, resume_from, dry_run)
        sys.exit(0)
    except KeyboardInterrupt:
        logger.info("Backfill interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Backfill failed: {e}")
        sys.exit(1) 