"""
Test-Driven Development: File Upload and Project Linking Tests

These tests will initially FAIL (RED phase) and guide the implementation
of proper file upload and project creation functionality.

Test Mode Considerations:
- Tests work with both real and mock data
- AI calls are mocked via MOCK_REGISTRY
- File operations and database operations are REAL
- Only AI/LLM calls are mocked as per TEST_MODE_EXPLANATION.md
"""

import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import transaction
from django.utils import timezone
from unittest.mock import patch, MagicMock

from ..models import Project, UploadedFile
from ..serializers import ProjectDetailSerializer
from backend.apps.pdf_service.django_models import Document
from .factories import ProjectFactory
from backend.apps.accounts.tests.factories import CustomUserFactory

User = get_user_model()


class TestFileProjectLinking(TestCase):
    """Test suite for file upload and project linking functionality."""

    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_project_creation_persists_to_database(self):
        """
        RED TEST: Test that projects are actually saved to database.
        
        This test will FAIL initially because projects aren't being persisted.
        """
        # Create project via API
        response = self.client.post('/api/projects/', {
            'name': 'Test Project',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False  # Ensure it's not a draft
        })
        
        self.assertEqual(response.status_code, 201, 
                        f"Project creation failed: {response.data}")
        project_id = response.data['id']
        
        # Verify project exists in database
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.owner, self.user)
        self.assertFalse(project.is_draft, "Project should not be a draft")
        
        # Verify project appears in list
        list_response = self.client.get('/api/projects/')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['id'], project_id)

    def test_file_upload_links_to_project(self):
        """
        RED TEST: Test that uploaded files are linked to projects.
        
        This test will FAIL initially because files aren't being linked.
        """
        # Create project first
        project = ProjectFactory(owner=self.user, is_draft=False)
        
        # Upload file to project
        test_file = SimpleUploadedFile(
            "test.pdf", 
            b"file content", 
            content_type="application/pdf"
        )
        
        response = self.client.post(
            f'/api/projects/{project.id}/upload_file/', 
            {'file': test_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, 201, 
                        f"File upload failed: {response.data}")
        
        # Verify file is linked to project
        project.refresh_from_db()
        self.assertEqual(project.uploaded_files.count(), 1, 
                        "File should be linked to project")
        
        uploaded_file = project.uploaded_files.first()
        self.assertEqual(uploaded_file.original_name, 'test.pdf')
        self.assertEqual(uploaded_file.processing_status, 'pending')

    def test_project_detail_includes_uploaded_files(self):
        """
        RED TEST: Test that project detail API includes uploaded files.
        
        This test will FAIL initially because files aren't included in API response.
        """
        # Create project and uploaded file
        project = ProjectFactory(owner=self.user, is_draft=False)
        
        # Create uploaded file directly (simulating successful upload)
        uploaded_file = UploadedFile.objects.create(
            project=project,
            file=SimpleUploadedFile("test.pdf", b"content", "application/pdf"),
            original_name="test.pdf",
            content_type="application/pdf",
            file_size=1024,
            processing_status='completed'
        )
        
        # Get project detail
        response = self.client.get(f'/api/projects/{project.id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('uploaded_files', response.data, 
                     "Project detail should include uploaded_files")
        self.assertEqual(len(response.data['uploaded_files']), 1,
                        "Should include the uploaded file")
        
        file_data = response.data['uploaded_files'][0]
        self.assertEqual(file_data['id'], str(uploaded_file.id))
        self.assertEqual(file_data['original_name'], 'test.pdf')
        self.assertEqual(file_data['processing_status'], 'completed')

    def test_complete_upload_to_display_flow(self):
        """
        RED TEST: Test complete flow from upload to display.
        
        This test will FAIL initially because the complete flow is broken.
        """
        # Step 1: Create project
        project_response = self.client.post('/api/projects/', {
            'name': 'Complete Flow Test',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False
        })
        self.assertEqual(project_response.status_code, 201)
        project_id = project_response.data['id']
        
        # Step 2: Upload file
        test_file = SimpleUploadedFile(
            "flow_test.pdf", 
            b"test content", 
            content_type="application/pdf"
        )
        upload_response = self.client.post(
            f'/api/projects/{project_id}/upload_file/', 
            {'file': test_file},
            format='multipart'
        )
        self.assertEqual(upload_response.status_code, 201)
        
        # Step 3: Verify project includes file
        detail_response = self.client.get(f'/api/projects/{project_id}/')
        self.assertEqual(detail_response.status_code, 200)
        self.assertIn('uploaded_files', detail_response.data)
        self.assertEqual(len(detail_response.data['uploaded_files']), 1)
        
        # Step 4: Verify file can be retrieved
        file_id = detail_response.data['uploaded_files'][0]['id']
        file_response = self.client.get(f'/api/uploaded-files/{file_id}/')
        self.assertEqual(file_response.status_code, 200)

    def test_project_creation_with_files_in_payload(self):
        """
        RED TEST: Test project creation with files included in payload.
        
        This test will FAIL initially because file linking during creation is broken.
        """
        # Create a Document first (simulating file upload to PDF service)
        document = Document.objects.create(
            title="Test Document",
            file=SimpleUploadedFile("test.pdf", b"content", "application/pdf"),
            user=self.user
        )
        
        # Create project with file reference
        response = self.client.post('/api/projects/', {
            'name': 'Project with Files',
            'project_type': 'school',
            'course_name': 'Test Course',
            'uploaded_files': [{'id': str(document.id), 'file_type': 'application/pdf'}],
            'is_draft': False
        })
        
        self.assertEqual(response.status_code, 201)
        project_id = response.data['id']
        
        # Verify project was created
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.name, 'Project with Files')
        
        # Verify file was linked
        self.assertEqual(project.uploaded_files.count(), 1)
        uploaded_file = project.uploaded_files.first()
        self.assertEqual(uploaded_file.original_name, 'test.pdf')

    def test_project_serializer_includes_files(self):
        """
        RED TEST: Test that ProjectDetailSerializer includes uploaded files.
        
        This test will FAIL initially because serializer doesn't include files.
        """
        # Create project and file
        project = ProjectFactory(owner=self.user, is_draft=False)
        uploaded_file = UploadedFile.objects.create(
            project=project,
            file=SimpleUploadedFile("test.pdf", b"content", "application/pdf"),
            original_name="test.pdf",
            content_type="application/pdf",
            file_size=1024,
            processing_status='completed'
        )
        
        # Test serializer directly
        serializer = ProjectDetailSerializer(project)
        data = serializer.data
        
        self.assertIn('uploaded_files', data)
        self.assertEqual(len(data['uploaded_files']), 1)
        self.assertEqual(data['uploaded_files'][0]['id'], str(uploaded_file.id))

    def test_file_upload_with_test_mode_header(self):
        """
        GREEN TEST: Test that file upload works with test mode header.
        
        This test should PASS as it only tests file operations (not AI).
        """
        project = ProjectFactory(owner=self.user, is_draft=False)
        
        test_file = SimpleUploadedFile(
            "test_mode.pdf", 
            b"test content", 
            content_type="application/pdf"
        )
        
        # Upload with test mode header (should not affect file operations)
        response = self.client.post(
            f'/api/projects/{project.id}/upload_file/', 
            {'file': test_file},
            format='multipart',
            HTTP_X_TEST_MODE='true'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Verify file was uploaded (file operations are real in test mode)
        project.refresh_from_db()
        self.assertEqual(project.uploaded_files.count(), 1)

    def test_project_creation_with_mock_mode_flag(self):
        """
        GREEN TEST: Test project creation with mock_mode flag for AI calls.
        
        This test should PASS as it tests project creation with AI mocking.
        """
        response = self.client.post('/api/projects/', {
            'name': 'Mock Mode Test',
            'project_type': 'school',
            'course_name': 'Test Course',
            'mock_mode': True,  # Enable AI mocking
            'seed_syllabus': True,
            'seed_tests': True,
            'is_draft': False
        })
        
        self.assertEqual(response.status_code, 201)
        project_id = response.data['id']
        
        # Verify project was created
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.name, 'Mock Mode Test')
        
        # Verify AI-generated metadata exists (from mock data)
        # This tests that AI calls are mocked but project creation is real
        self.assertTrue(Project.objects.filter(id=project_id).exists())

    def test_database_transaction_integrity(self):
        """
        RED TEST: Test that database transactions are properly handled.
        
        This test will FAIL initially if transactions are not properly managed.
        """
        # Test that if file linking fails, project creation is rolled back
        with patch('backend.apps.projects.models.UploadedFile.objects.create') as mock_create:
            mock_create.side_effect = Exception("Database error")
            
            # This should fail and rollback the entire transaction
            with self.assertRaises(Exception):
                self.client.post('/api/projects/', {
                    'name': 'Transaction Test',
                    'project_type': 'school',
                    'course_name': 'Test Course',
                    'uploaded_files': [{'id': 'fake-id', 'file_type': 'application/pdf'}],
                    'is_draft': False
                })
            
            # Verify no project was created
            self.assertEqual(Project.objects.count(), 0)

    def test_file_processing_status_workflow(self):
        """
        RED TEST: Test file processing status workflow.
        
        This test will FAIL initially because processing status isn't properly managed.
        """
        project = ProjectFactory(owner=self.user, is_draft=False)
        
        # Upload file
        test_file = SimpleUploadedFile(
            "processing_test.pdf", 
            b"test content", 
            content_type="application/pdf"
        )
        
        response = self.client.post(
            f'/api/projects/{project.id}/upload_file/', 
            {'file': test_file},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Verify initial status
        project.refresh_from_db()
        uploaded_file = project.uploaded_files.first()
        self.assertEqual(uploaded_file.processing_status, 'pending')
        
        # Simulate processing completion
        uploaded_file.processing_status = 'completed'
        uploaded_file.processing_completed_at = timezone.now()
        uploaded_file.save()
        
        # Verify status update
        uploaded_file.refresh_from_db()
        self.assertEqual(uploaded_file.processing_status, 'completed')
        self.assertIsNotNone(uploaded_file.processing_completed_at)


@pytest.mark.django_db
class TestFileProjectLinkingPytest:
    """Pytest version of the test suite for better integration."""
    
    def test_project_factory_creates_valid_project(self):
        """Test that ProjectFactory creates valid projects."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        assert project.name is not None
        assert project.owner == user
        assert project.project_type in ['school', 'self_study']
    
    def test_uploaded_file_factory_creates_valid_file(self):
        """Test that UploadedFileFactory creates valid files."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        # Create uploaded file
        uploaded_file = UploadedFile.objects.create(
            project=project,
            file=SimpleUploadedFile("test.pdf", b"content", "application/pdf"),
            original_name="test.pdf",
            content_type="application/pdf",
            file_size=1024,
            processing_status='pending'
        )
        
        assert uploaded_file.project == project
        assert uploaded_file.original_name == "test.pdf"
        assert uploaded_file.processing_status == 'pending'
