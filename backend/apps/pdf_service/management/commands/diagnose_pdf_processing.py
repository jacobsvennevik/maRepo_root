import sys
import subprocess
import psutil
import redis
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.test.utils import get_runner
from django.conf import settings
from celery import current_app
from backend.apps.pdf_service.django_models import Document
from backend.apps.accounts.tests.factories import CustomUserFactory
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Run comprehensive diagnostics for PDF processing system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--quick',
            action='store_true',
            help='Run only quick checks (no full test suite)',
        )
        parser.add_argument(
            '--celery-only',
            action='store_true',
            help='Run only Celery-related diagnostics',
        )
        parser.add_argument(
            '--database-only',
            action='store_true',
            help='Run only database-related diagnostics',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔍 PDF Processing System Diagnostics')
        )
        self.stdout.write("=" * 60)

        if options['quick']:
            self.run_quick_diagnostics()
        elif options['celery_only']:
            self.run_celery_diagnostics()
        elif options['database_only']:
            self.run_database_diagnostics()
        else:
            self.run_full_diagnostics()

    def run_quick_diagnostics(self):
        """Run quick system checks"""
        self.stdout.write("\n🚀 Quick Diagnostics")
        self.stdout.write("-" * 30)
        
        # Check Redis
        self.check_redis()
        
        # Check Celery workers
        self.check_celery_processes()
        
        # Check database connectivity
        self.check_database()
        
        # Check recent documents
        self.check_recent_documents()

    def run_celery_diagnostics(self):
        """Run Celery-specific diagnostics"""
        self.stdout.write("\n⚙️ Celery Diagnostics")
        self.stdout.write("-" * 30)
        
        self.check_redis()
        self.check_celery_processes()
        self.check_celery_configuration()
        self.run_celery_tests()

    def run_database_diagnostics(self):
        """Run database-specific diagnostics"""
        self.stdout.write("\n🗄️ Database Diagnostics")
        self.stdout.write("-" * 30)
        
        self.check_database()
        self.check_recent_documents()
        self.run_database_tests()

    def run_full_diagnostics(self):
        """Run complete diagnostic suite"""
        self.run_quick_diagnostics()
        
        self.stdout.write("\n🧪 Running Full Test Suite")
        self.stdout.write("-" * 30)
        
        # Run the actual test classes
        self.run_test_class('backend.apps.pdf_service.tests.test_celery_diagnostics.SystemDiagnosticsTests')
        self.run_test_class('backend.apps.pdf_service.tests.test_celery_diagnostics.DatabaseDiagnosticsTests')
        self.run_test_class('backend.apps.pdf_service.tests.test_celery_diagnostics.CeleryDiagnosticsTests')

    def check_redis(self):
        """Check Redis connectivity"""
        try:
            r = redis.Redis(host='localhost', port=6379, db=0)
            r.ping()
            self.stdout.write(self.style.SUCCESS("✅ Redis: Running and accessible"))
            
            # Check if Redis has Celery data
            celery_keys = r.keys('celery*')
            if celery_keys:
                self.stdout.write(f"   📊 Found {len(celery_keys)} Celery-related keys in Redis")
            else:
                self.stdout.write(self.style.WARNING("   ⚠️ No Celery data found in Redis"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Redis: Not accessible - {e}"))
            self.stdout.write("   💡 Start Redis with: brew services start redis")

    def check_celery_processes(self):
        """Check for running Celery worker processes"""
        try:
            celery_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if proc.info['cmdline']:  # Check if cmdline exists and is not None
                        cmdline = ' '.join(proc.info['cmdline']).lower()
                        if 'celery' in cmdline and 'worker' in cmdline:
                            celery_processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied, TypeError):
                    pass
            
            if celery_processes:
                self.stdout.write(self.style.SUCCESS(f"✅ Celery Workers: {len(celery_processes)} running"))
                for proc in celery_processes:
                    self.stdout.write(f"   🔧 PID {proc['pid']}: {' '.join(proc['cmdline'])}")
            else:
                self.stdout.write(self.style.ERROR("❌ Celery Workers: None found"))
                self.stdout.write("   💡 Start worker with: celery -A backend worker --loglevel=info")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Could not check processes: {e}"))

    def check_celery_configuration(self):
        """Check Celery configuration"""
        try:
            # Check if Celery app is configured
            self.stdout.write(f"📋 Celery app name: {current_app.main}")
            
            # Check broker settings
            if hasattr(settings, 'CELERY_BROKER_URL'):
                self.stdout.write(f"📋 Broker URL: {settings.CELERY_BROKER_URL}")
            
            # Check registered tasks
            pdf_task = 'backend.apps.pdf_service.tasks.process_document'
            if pdf_task in current_app.tasks:
                self.stdout.write(self.style.SUCCESS(f"✅ Task registered: {pdf_task}"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ Task not registered: {pdf_task}"))
                
            # Try to inspect workers
            try:
                inspect = current_app.control.inspect()
                stats = inspect.stats()
                if stats:
                    self.stdout.write(self.style.SUCCESS("✅ Can communicate with workers"))
                    for worker, stat in stats.items():
                        self.stdout.write(f"   👷 Worker: {worker}")
                else:
                    self.stdout.write(self.style.WARNING("⚠️ No workers responding to inspection"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Cannot inspect workers: {e}"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Celery configuration issue: {e}"))

    def check_database(self):
        """Check database connectivity and PDF service tables"""
        try:
            # Test basic database connection
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                
            self.stdout.write(self.style.SUCCESS("✅ Database: Connected"))
            
            # Check if PDF service tables exist
            if Document._meta.db_table in connection.introspection.table_names():
                self.stdout.write(self.style.SUCCESS("✅ PDF Service tables: Present"))
                
                # Count documents
                doc_count = Document.objects.count()
                self.stdout.write(f"   📊 Total documents: {doc_count}")
                
                # Count by status
                statuses = Document.objects.values_list('status', flat=True).distinct()
                for status in statuses:
                    count = Document.objects.filter(status=status).count()
                    self.stdout.write(f"   📋 {status}: {count}")
                    
            else:
                self.stdout.write(self.style.ERROR("❌ PDF Service tables: Missing"))
                self.stdout.write("   💡 Run migrations: python manage.py migrate")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Database issue: {e}"))

    def check_recent_documents(self):
        """Check recent document activity"""
        try:
            # Get recent documents (using upload_date instead of created_at)
            recent_docs = Document.objects.order_by('-upload_date')[:5]
            
            if recent_docs:
                self.stdout.write(f"\n📄 Recent Documents (last 5):")
                for doc in recent_docs:
                    status_icon = {
                        'pending': '⏳',
                        'processing': '⚙️',
                        'completed': '✅',
                        'error': '❌'
                    }.get(doc.status, '❓')
                    
                    self.stdout.write(
                        f"   {status_icon} ID:{doc.id} | {doc.title or 'No title'} | "
                        f"{doc.status} | {doc.upload_date.strftime('%Y-%m-%d %H:%M')}"
                    )
            else:
                self.stdout.write(self.style.WARNING("⚠️ No documents found in database"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Could not check recent documents: {e}"))

    def run_test_class(self, test_class_path):
        """Run a specific test class"""
        self.stdout.write(f"\n🧪 Running {test_class_path.split('.')[-1]}...")
        
        try:
            # Run the test using Django's test runner
            call_command('test', test_class_path, verbosity=2)
            self.stdout.write(self.style.SUCCESS(f"✅ {test_class_path.split('.')[-1]} completed"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Test failed: {e}"))

    def run_celery_tests(self):
        """Run Celery-specific tests"""
        self.run_test_class('backend.apps.pdf_service.tests.test_celery_diagnostics.CeleryDiagnosticsTests')

    def run_database_tests(self):
        """Run database-specific tests"""
        self.run_test_class('backend.apps.pdf_service.tests.test_celery_diagnostics.DatabaseDiagnosticsTests') 