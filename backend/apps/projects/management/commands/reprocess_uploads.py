from django.core.management.base import BaseCommand
from django.db.models import Q
from backend.apps.projects.models import UploadedFile
from backend.apps.projects.services import process_uploaded_file


class Command(BaseCommand):
    help = 'Reprocess failed or skipped file uploads'

    def add_arguments(self, parser):
        parser.add_argument(
            '--status',
            type=str,
            choices=['failed', 'skipped', 'both'],
            default='both',
            help='Which status to reprocess (default: both)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be reprocessed without doing it'
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Maximum number of files to reprocess'
        )

    def handle(self, *args, **options):
        status_filter = options['status']
        dry_run = options['dry_run']
        limit = options['limit']

        # Build query
        if status_filter == 'both':
            queryset = UploadedFile.objects.filter(
                Q(processing_status='failed') | Q(processing_status='skipped')
            )
        else:
            queryset = UploadedFile.objects.filter(processing_status=status_filter)

        if limit:
            queryset = queryset[:limit]

        count = queryset.count()
        
        if count == 0:
            self.stdout.write(
                self.style.WARNING(f'No files with status {status_filter} found to reprocess.')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'Found {count} files to reprocess (status: {status_filter})')
        )

        if dry_run:
            self.stdout.write('DRY RUN - No files will be processed')
            for uf in queryset:
                self.stdout.write(f'  - {uf.original_name} (Project: {uf.project.name}, Error: {uf.processing_error[:50]}...)')
            return

        # Process files
        processed = 0
        for uf in queryset:
            try:
                self.stdout.write(f'Reprocessing {uf.original_name}...')
                
                # Reset to pending
                uf.processing_status = 'pending'
                uf.processing_error = ''
                uf.processing_started_at = None
                uf.processing_completed_at = None
                uf.save()
                
                # Trigger reprocessing
                result = process_uploaded_file(str(uf.id))
                
                if result and result.get('status') == 'completed':
                    self.stdout.write(
                        self.style.SUCCESS(f'  ✓ Successfully reprocessed {uf.original_name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'  ⚠ Reprocessing failed for {uf.original_name}')
                    )
                
                processed += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error reprocessing {uf.original_name}: {e}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Reprocessing complete. Processed {processed}/{count} files.')
        )
