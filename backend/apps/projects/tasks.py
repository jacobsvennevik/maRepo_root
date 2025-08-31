import logging
import time
from celery import shared_task
from django.conf import settings
from decouple import config
from django.utils import timezone
from datetime import timedelta
from django.db import models

from .models import Project, ProjectMeta
from backend.apps.generation.services.api_client import AIClient
from .metrics import (
    record_metadata_generation_success,
    record_metadata_generation_failure,
    record_metadata_generation_start,
    record_metadata_generation_end,
    record_content_length,
    record_metadata_quality,
    update_queue_size
)

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def generate_project_meta(self, project_id: str):
    """
    Generate smart metadata for a project using AI.
    
    Args:
        project_id: UUID of the project to generate metadata for
    """
    start_time = time.time()
    record_metadata_generation_start()
    
    try:
        # Get the project
        project = Project.objects.get(id=project_id)
        logger.info(f"Starting metadata generation for project: {project.name}")
        
        # Check if STI is enabled
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        if not enable_sti:
            logger.info(f"STI disabled, skipping metadata generation for project: {project.name}")
            record_metadata_generation_end()
            return
        
        # Collect project content for analysis
        project_content = []
        
        # Add project name and type
        project_content.append(f"Project Name: {project.name}")
        project_content.append(f"Project Type: {project.project_type}")
        
        # Add type-specific content
        if project.project_type == 'school' and hasattr(project, 'school_project_data'):
            school_data = project.school_project_data
            project_content.append(f"Course Name: {school_data.course_name}")
            project_content.append(f"Course Code: {school_data.course_code}")
            project_content.append(f"Teacher: {school_data.teacher_name}")
        elif project.project_type == 'self_study' and hasattr(project, 'self_study_project_data'):
            self_study_data = project.self_study_project_data
            project_content.append(f"Goal Description: {self_study_data.goal_description}")
            project_content.append(f"Study Frequency: {self_study_data.study_frequency}")
        
        # Add uploaded files content
        for uploaded_file in project.uploaded_files.all():
            if uploaded_file.raw_text:
                project_content.append(f"File Content: {uploaded_file.raw_text[:1000]}...")
        
        # Add important dates
        for important_date in project.important_dates.all():
            project_content.append(f"Important Date: {important_date.title} - {important_date.date}")
        
        # Combine all content
        full_content = "\n".join(project_content)
        
        if not full_content.strip():
            logger.warning(f"No content found for project: {project.name}")
            record_metadata_generation_end()
            return
        
        # Record content length for metrics
        record_content_length(len(full_content), project.project_type)
        
        # Generate metadata using AI
        ai_client = AIClient(model="gpt-4")
        meta_data = ai_client.generate_meta(full_content)
        
        # Store the generated metadata
        # First, remove any existing AI-generated metadata
        project.metadata.filter(key__startswith='ai_').delete()
        
        # Store the metadata
        ProjectMeta.objects.create(
            project=project,
            key='ai_generated_metadata',
            value={
                'ai_generated_tags': meta_data.get('ai_generated_tags', []),
                'content_summary': meta_data.get('content_summary', ''),
                'difficulty_level': meta_data.get('difficulty_level', 'intermediate'),
                'model_used': 'gpt-4',
                'prompt_version': '1.0'
            }
        )
        
        # Record success metrics
        duration = time.time() - start_time
        record_metadata_generation_success('gpt-4', project.project_type, duration)
        
        # Record quality metrics
        tags_count = len(meta_data.get('ai_generated_tags', []))
        summary_length = len(meta_data.get('content_summary', ''))
        record_metadata_quality(tags_count, summary_length, project.project_type)
        
        logger.info(f"Successfully generated metadata for project: {project.name}")
        
    except Project.DoesNotExist:
        logger.error(f"Project with id {project_id} not found")
        record_metadata_generation_failure('project_not_found', 'unknown')
    except Exception as e:
        logger.error(f"Error generating metadata for project {project_id}: {str(e)}")
        duration = time.time() - start_time
        record_metadata_generation_failure('general_error', 'gpt-4', duration)
        # Update task state to failed
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise
    finally:
        record_metadata_generation_end()


@shared_task
def generate_missing_metadata_nightly():
    """
    Nightly task to generate metadata for projects that don't have it.
    This task runs via Celery Beat to ensure all projects have metadata.
    """
    logger.info("Starting nightly metadata generation for missing projects")
    
    # Check if STI is enabled
    enable_sti = config('ENABLE_STI', default=False, cast=bool)
    if not enable_sti:
        logger.info("STI disabled, skipping nightly metadata generation")
        return
    
    # Find projects without AI-generated metadata
    projects_without_meta = Project.objects.filter(
        # Projects that don't have ai_generated_metadata
        ~models.Q(metadata__key='ai_generated_metadata'),
        # Only non-draft projects
        is_draft=False,
        # Only projects created more than 1 hour ago (to avoid processing new projects)
        created_at__lt=timezone.now() - timedelta(hours=1)
    ).distinct()
    
    total_projects = projects_without_meta.count()
    logger.info(f"Found {total_projects} projects without metadata")
    
    if total_projects == 0:
        logger.info("No projects need metadata generation")
        update_queue_size(0)
        return
    
    # Update queue size metric
    update_queue_size(total_projects)
    
    # Process projects in batches to avoid overwhelming the system
    batch_size = 10
    processed_count = 0
    
    for i in range(0, total_projects, batch_size):
        batch = projects_without_meta[i:i + batch_size]
        
        for project in batch:
            try:
                # Trigger metadata generation for each project
                generate_project_meta.delay(str(project.id))
                processed_count += 1
                
                logger.info(f"Queued metadata generation for project: {project.name} ({processed_count}/{total_projects})")
                
            except Exception as e:
                logger.error(f"Failed to queue metadata generation for project {project.id}: {str(e)}")
        
        # Small delay between batches to be nice to the system
        time.sleep(1)
    
    logger.info(f"Nightly metadata generation completed. Queued {processed_count}/{total_projects} projects")
    update_queue_size(0)


@shared_task
def cleanup_old_metadata():
    """
    Clean up old metadata entries that are no longer needed.
    This task runs periodically to maintain data hygiene.
    """
    logger.info("Starting metadata cleanup task")
    
    # Remove metadata for deleted projects
    orphaned_metadata = ProjectMeta.objects.filter(
        project__isnull=True
    )
    
    orphaned_count = orphaned_metadata.count()
    if orphaned_count > 0:
        orphaned_metadata.delete()
        logger.info(f"Cleaned up {orphaned_count} orphaned metadata entries")
    
    # Remove old metadata for draft projects (older than 7 days)
    old_draft_metadata = ProjectMeta.objects.filter(
        project__is_draft=True,
        project__created_at__lt=timezone.now() - timedelta(days=7)
    )
    
    old_draft_count = old_draft_metadata.count()
    if old_draft_count > 0:
        old_draft_metadata.delete()
        logger.info(f"Cleaned up {old_draft_count} old draft metadata entries")
    
    logger.info("Metadata cleanup task completed") 