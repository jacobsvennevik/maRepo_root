from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Backfill STI (Study Type Identifier) structures for existing projects'

    def add_arguments(self, parser):
        parser.add_argument(
            '--chunk',
            type=int,
            default=1000,
            help='Number of projects to process per chunk (default: 1000)'
        )
        parser.add_argument(
            '--resume-from',
            type=int,
            default=0,
            help='Offset to resume from for resumability (default: 0)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without making database changes'
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Enable verbose output'
        )

    def handle(self, *args, **options):
        chunk_size = options['chunk']
        resume_from = options['resume_from']
        dry_run = options['dry_run']
        verbose = options['verbose']
        
        self.stdout.write(
            self.style.SUCCESS('🔄 Starting STI Backfill Process')
        )
        self.stdout.write("=" * 60)
        
        # Import the backfill function from the standalone script
        import sys
        import os
        
        # Add scripts directory to path
        scripts_dir = os.path.join(settings.BASE_DIR, 'scripts')
        sys.path.insert(0, scripts_dir)
        
        try:
            # Import the module and get the function
            import importlib.util
            script_path = os.path.join(scripts_dir, "backfill_sti.py")
            if not os.path.exists(script_path):
                self.stdout.write(
                    self.style.ERROR(f"Script not found at: {script_path}")
                )
                return
            spec = importlib.util.spec_from_file_location("backfill_sti", script_path)
            backfill_sti = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(backfill_sti)
            backfill_sti_func = backfill_sti.backfill_sti
            
            # Run the backfill
            stats = backfill_sti_func(
                chunk_size=chunk_size,
                resume_from=resume_from,
                dry_run=dry_run
            )
            
            # Display results
            self.stdout.write("\n📊 Backfill Results:")
            self.stdout.write("-" * 30)
            self.stdout.write(f"Chunks processed: {stats['chunks_processed']}")
            self.stdout.write(f"Total projects processed: {stats['processed']}")
            self.stdout.write(f"SchoolProject created: {stats['created_school']}")
            self.stdout.write(f"SelfStudyProject created: {stats['created_self_study']}")
            self.stdout.write(f"Projects skipped: {stats['skipped']}")
            self.stdout.write(f"Errors: {stats['errors']}")
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(
                        "\n⚠️ DRY RUN MODE - No database changes were made"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        "\n✅ STI backfill completed successfully!"
                    )
                )
                
                # Show next steps
                self.stdout.write("\n📋 Next Steps:")
                self.stdout.write("1. Verify the created STI structures")
                self.stdout.write("2. Test API endpoints with ENABLE_STI=true")
                self.stdout.write("3. Monitor application performance")
                self.stdout.write("4. Consider enabling STI for all new projects")
            
        except ImportError as e:
            self.stdout.write(
                self.style.ERROR(
                    f"❌ Could not import backfill script: {e}"
                )
            )
            self.stdout.write(
                "💡 Make sure scripts/backfill_sti.py exists and is accessible"
            )
            return
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Backfill failed: {e}")
            )
            if verbose:
                import traceback
                self.stdout.write(traceback.format_exc())
            return 