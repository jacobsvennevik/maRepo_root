from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from backend.apps.projects.models import Project
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clean up abandoned draft projects older than 24 hours'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Number of hours after which to consider drafts abandoned (default: 24)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        hours = options['hours']
        dry_run = options['dry_run']
        
        # Calculate cutoff time
        cutoff_time = timezone.now() - timedelta(hours=hours)
        
        # Find abandoned draft projects
        abandoned_drafts = Project.objects.filter(
            is_draft=True,
            created_at__lt=cutoff_time
        )
        
        count = abandoned_drafts.count()
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {count} abandoned draft projects older than {hours} hours'
                )
            )
            
            if count > 0:
                self.stdout.write('Abandoned drafts that would be deleted:')
                for project in abandoned_drafts[:10]:  # Show first 10
                    self.stdout.write(f'  - {project.name} (ID: {project.id}, Created: {project.created_at})')
                if count > 10:
                    self.stdout.write(f'  ... and {count - 10} more')
        else:
            if count > 0:
                # Log before deletion
                logger.info(f'Cleaning up {count} abandoned draft projects older than {hours} hours')
                
                # Delete abandoned drafts
                deleted_count = abandoned_drafts.delete()[0]
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully deleted {deleted_count} abandoned draft projects'
                    )
                )
                
                logger.info(f'Successfully deleted {deleted_count} abandoned draft projects')
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'No abandoned draft projects found older than {hours} hours'
                    )
                ) 