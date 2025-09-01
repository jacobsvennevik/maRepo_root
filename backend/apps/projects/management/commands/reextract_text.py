"""
Management command to re-extract text from uploaded files.
"""
from django.core.management.base import BaseCommand
from django.db.models import Q
from backend.apps.projects.models import UploadedFile
from backend.apps.projects.tasks import extract_text_from_file


class Command(BaseCommand):
    help = 'Re-extract text from uploaded files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Re-extract text from all files (including ones already processed)',
        )
        parser.add_argument(
            '--failed',
            action='store_true',
            help='Re-extract text only from files that previously failed',
        )
        parser.add_argument(
            '--pending',
            action='store_true',
            help='Process only files with pending status',
        )
        parser.add_argument(
            '--project-id',
            type=str,
            help='Process files only for a specific project ID',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without actually doing it',
        )

    def handle(self, *args, **options):
        # Build query based on options
        queryset = UploadedFile.objects.filter(file__isnull=False)
        
        if options['project_id']:
            queryset = queryset.filter(project_id=options['project_id'])
            
        if options['failed']:
            queryset = queryset.filter(text_extraction_status='failed')
        elif options['pending']:
            queryset = queryset.filter(text_extraction_status='pending')
        elif not options['all']:
            # Default: process pending and failed files
            queryset = queryset.filter(Q(text_extraction_status='pending') | Q(text_extraction_status='failed'))
        
        total_files = queryset.count()
        
        if total_files == 0:
            self.stdout.write(self.style.WARNING('No files match the criteria'))
            return
        
        # Show what will be processed
        status_counts = {}
        for status, _ in UploadedFile.TEXT_EXTRACTION_STATUS_CHOICES:
            count = queryset.filter(text_extraction_status=status).count()
            if count > 0:
                status_counts[status] = count
        
        self.stdout.write(f'Found {total_files} files to process:')
        for status, count in status_counts.items():
            self.stdout.write(f'  - {status}: {count}')
        
        if options['dry_run']:
            self.stdout.write(self.style.SUCCESS('Dry run completed - no changes made'))
            return
        
        # Confirm before processing
        if not options['all'] or input('Continue? (y/N): ').lower() != 'y':
            if options['all']:
                self.stdout.write('Cancelled by user')
                return
        
        # Schedule extraction tasks
        scheduled = 0
        failed_to_schedule = 0
        
        for uf in queryset:
            try:
                extract_text_from_file.delay(str(uf.id))
                scheduled += 1
                
                if scheduled % 10 == 0:
                    self.stdout.write(f'Scheduled {scheduled}/{total_files} files...')
                    
            except Exception as e:
                self.stderr.write(f'Failed to schedule extraction for {uf.id}: {e}')
                failed_to_schedule += 1
        
        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully scheduled text extraction for {scheduled}/{total_files} files'
            )
        )
        
        if failed_to_schedule > 0:
            self.stdout.write(
                self.style.ERROR(
                    f'Failed to schedule {failed_to_schedule} files'
                )
            )
        
        self.stdout.write('Text extraction tasks have been queued. Check Celery logs for progress.')
