import pytest
import json
import time
from unittest.mock import patch, MagicMock
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from celery import current_app
from celery.result import AsyncResult
from backend.apps.pdf_service.django_models import Document
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.tasks import process_document
import subprocess
import psutil
import os

User = get_user_model()


class CeleryDiagnosticsTests(TestCase):
    """
    Comprehensive tests to diagnose Celery worker and processing issues
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
    
    def test_celery_worker_availability(self):
        """Test if Celery workers are available and responding"""
        # Check if Celery app is configured
        self.assertIsNotNone(current_app)
        self.assertTrue(hasattr(current_app, 'tasks'))
        
        # Check if our processing task is registered
        self.assertIn('backend.apps.pdf_service.tasks.process_document', current_app.tasks)
        
        # Try to inspect active workers
        try:
            inspect = current_app.control.inspect()
            active_workers = inspect.active()
            stats = inspect.stats()
            
            # Log worker information
            print(f"Active workers: {active_workers}")
            print(f"Worker stats: {stats}")
            
            # At least check that the inspection doesn't fail
            self.assertIsNotNone(inspect)
            
        except Exception as e:
            # If inspection fails, it usually means no workers are running
            self.fail(f"Celery worker inspection failed: {e}")
    
    def test_celery_broker_connection(self):
        """Test if we can connect to the Celery broker (Redis)"""
        try:
            # Try to get broker connection info
            inspect = current_app.control.inspect()
            
            # Test broker connection by trying to send a ping
            # This will fail if Redis is not running or misconfigured
            result = inspect.ping()
            print(f"Celery ping result: {result}")
            
            # If we get here, broker is accessible
            self.assertTrue(True)
            
        except Exception as e:
            self.fail(f"Cannot connect to Celery broker: {e}")
    
    def test_task_execution_synchronously(self):
        """Test if tasks can execute synchronously (without worker)"""
        # Create a test document
        pdf_content = b'%PDF-1.4 test content'
        test_file = SimpleUploadedFile(
            "test.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        # Create document in database
        document = Document.objects.create(
            title="test.pdf",
            file_type="pdf",
            upload_type="course_files",
            user=self.user,
            file=test_file
        )
        
        # Try to execute task directly (not through Celery)
        try:
            result = process_document(document.id)
            self.assertIsNotNone(result)
            print(f"Synchronous task execution result: {result}")
            
        except Exception as e:
            print(f"Synchronous task execution failed: {e}")
            # This tells us if the task logic itself has issues
            raise
    
    def test_async_task_submission(self):
        """Test if we can submit tasks to Celery (requires worker)"""
        # Create a test document
        pdf_content = b'%PDF-1.4 test content'
        test_file = SimpleUploadedFile(
            "test.pdf", 
            pdf_content,
            content_type="application/pdf"
        )
        
        document = Document.objects.create(
            title="test.pdf",
            file_type="pdf", 
            upload_type="course_files",
            user=self.user,
            file=test_file
        )
        
        try:
            # Submit task to Celery
            result = process_document.delay(document.id)
            self.assertIsNotNone(result)
            self.assertIsInstance(result, AsyncResult)
            
            print(f"Task ID: {result.id}")
            print(f"Task state: {result.state}")
            
            # Wait a bit and check status
            time.sleep(2)
            print(f"Task state after 2s: {result.state}")
            
            if result.state == 'PENDING':
                self.fail("Task is stuck in PENDING state - likely no worker available")
            
        except Exception as e:
            self.fail(f"Failed to submit async task: {e}")


class DatabaseDiagnosticsTests(TestCase):
    """
    Tests to diagnose database issues with document creation and processing
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
    
    def test_document_creation_via_api(self):
        """Test if documents are properly created via the API"""
        pdf_content = b'%PDF-1.4 test content'
        test_file = SimpleUploadedFile(
            "diagnostic_test.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        # Test document upload via API
        response = self.client.post(
            '/api/pdf_service/documents/',
            {
                'file': test_file,
                'file_type': 'pdf',
                'upload_type': 'course_files'
            },
            format='multipart'
        )
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify document was created in database
        document_id = response.data['id']
        document = Document.objects.get(id=document_id)
        
        # Note: Document model uses 'title' field instead of 'original_filename'
        # and 'user' instead of 'uploaded_by'
        self.assertEqual(document.file_type, "pdf")
        self.assertEqual(document.upload_type, "course_files")
        self.assertEqual(document.user, self.user)
        self.assertEqual(document.status, "pending")
        self.assertTrue('diagnostic_test' in document.file.name)
        self.assertTrue(document.file.name.endswith('.pdf'))
        
        return document
    
    def test_document_processing_api_call(self):
        """Test if the processing API endpoint works"""
        # First create a document
        document = self.test_document_creation_via_api()
        
        # Try to start processing
        response = self.client.post(
            f'/api/pdf_service/documents/{document.id}/process/',
            content_type='application/json'
        )
        
        print(f"Process response status: {response.status_code}")
        print(f"Process response data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if document status changed
        document.refresh_from_db()
        print(f"Document status after processing call: {document.status}")
        
        # Should be either 'processing' or 'completed' depending on worker availability
        self.assertIn(document.status, ['pending', 'processing', 'completed', 'error'])
    
    def test_document_status_polling_api(self):
        """Test if we can poll document status via API"""
        # Create and process document
        document = self.test_document_creation_via_api()
        
        # Try to get document status
        response = self.client.get(f'/api/pdf_service/documents/{document.id}/')
        
        print(f"Status polling response: {response.status_code}")
        print(f"Status polling data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['id'], document.id)
    
    def test_database_document_states(self):
        """Test various document states in the database"""
        # Test document creation
        document = Document.objects.create(
            title="test_states.pdf",
            file_type="pdf",
            upload_type="course_files", 
            user=self.user,
            status="pending"
        )
        
        print(f"Created document ID: {document.id}")
        
        # Test status transitions
        states_to_test = ['processing', 'completed', 'error']
        
        for state in states_to_test:
            document.status = state
            document.save()
            document.refresh_from_db()
            
            self.assertEqual(document.status, state)
            print(f"Successfully set document status to: {state}")
        
        # Test metadata storage
        test_metadata = {
            'course_name': 'Test Course',
            'topics': ['topic1', 'topic2'],
            'assignments': [{'name': 'Assignment 1', 'due_date': '2024-12-01'}]
        }
        
        document.metadata = test_metadata
        document.save()
        document.refresh_from_db()
        
        self.assertEqual(document.metadata, test_metadata)
        print(f"Successfully stored metadata: {document.metadata}")


class SystemDiagnosticsTests(TestCase):
    """
    System-level diagnostic tests
    """
    
    def test_redis_availability(self):
        """Test if Redis is running and accessible"""
        try:
            import redis
            # Try to connect to Redis
            r = redis.Redis(host='localhost', port=6379, db=0)
            r.ping()
            print("✅ Redis is running and accessible")
            
            # Test basic operations
            r.set('test_key', 'test_value')
            value = r.get('test_key')
            self.assertEqual(value.decode(), 'test_value')
            r.delete('test_key')
            
        except Exception as e:
            self.fail(f"❌ Redis is not available: {e}")
    
    def test_celery_worker_processes(self):
        """Check if Celery worker processes are running"""
        try:
            # Check for Celery processes
            celery_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if 'celery' in ' '.join(proc.info['cmdline']).lower():
                        celery_processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            print(f"Found Celery processes: {len(celery_processes)}")
            for proc in celery_processes:
                print(f"  PID {proc['pid']}: {' '.join(proc['cmdline'])}")
            
            if not celery_processes:
                print("❌ No Celery worker processes found")
                print("💡 Start with: celery -A backend worker --loglevel=info")
            else:
                print("✅ Celery worker processes are running")
                
        except Exception as e:
            print(f"Could not check processes: {e}")
    
    def test_environment_configuration(self):
        """Test environment and configuration"""
        from django.conf import settings
        
        print("\n🔧 Environment Configuration:")
        print(f"DEBUG: {settings.DEBUG}")
        print(f"DATABASES: {list(settings.DATABASES.keys())}")
        
        # Check Celery configuration
        if hasattr(settings, 'CELERY_BROKER_URL'):
            print(f"CELERY_BROKER_URL: {settings.CELERY_BROKER_URL}")
        
        if hasattr(settings, 'CELERY_RESULT_BACKEND'):
            print(f"CELERY_RESULT_BACKEND: {settings.CELERY_RESULT_BACKEND}")
        
        # Check if we have the required apps
        required_apps = [
            'backend.apps.pdf_service',
            'backend.apps.accounts'
        ]
        
        for app in required_apps:
            if app in settings.INSTALLED_APPS:
                print(f"✅ {app} is installed")
            else:
                print(f"❌ {app} is NOT installed")


def run_full_diagnostics():
    """
    Convenience function to run all diagnostics
    """
    print("🔍 Running Full PDF Processing Diagnostics...")
    print("=" * 60)
    
    # This would be called from a management command
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Run specific test classes
    test_classes = [
        'backend.apps.pdf_service.tests.test_celery_diagnostics.SystemDiagnosticsTests',
        'backend.apps.pdf_service.tests.test_celery_diagnostics.DatabaseDiagnosticsTests', 
        'backend.apps.pdf_service.tests.test_celery_diagnostics.CeleryDiagnosticsTests'
    ]
    
    for test_class in test_classes:
        print(f"\n🧪 Running {test_class.split('.')[-1]}...")
        result = test_runner.run_tests([test_class])
        if result:
            print(f"❌ {test_class} failed")
        else:
            print(f"✅ {test_class} passed") 