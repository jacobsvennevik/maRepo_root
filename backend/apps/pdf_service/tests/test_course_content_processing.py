import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch, MagicMock
from django.urls import reverse

from backend.apps.pdf_service.django_models import Document, ProcessedData
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.constants import DocumentType

class CourseContentProcessingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        
        # Create a test PDF file
        self.pdf_content = b'%PDF-1.4 Course content test'
        self.test_file = SimpleUploadedFile(
            name='test_course_content.pdf',
            content=self.pdf_content,
            content_type='application/pdf'
        )
        
        # Create a test document
        self.document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            title='Test Course Content',
            status='pending'
        )

    def test_upload_course_content(self):
        """Test uploading course content document"""
        url = reverse('document-list')  # Uses DRF router URL pattern
        
        # Create a new file for upload
        new_file = SimpleUploadedFile(
            name='new_course_content.pdf',
            content=b'%PDF-1.4 New course content test',
            content_type='application/pdf'
        )
        
        data = {
            'file': new_file,
            'file_type': 'pdf',
            'upload_type': 'course_files',
            'title': 'New Course Content'
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 2)  # Including setUp document
        
        new_document = Document.objects.latest('id')
        self.assertEqual(new_document.title, 'New Course Content')
        self.assertEqual(new_document.file_type, 'pdf')
        self.assertEqual(new_document.upload_type, 'course_files')

    @patch('backend.apps.pdf_service.tasks.process_document.delay')
    def test_process_course_content(self, mock_process):
        """Test processing course content document"""
        mock_process.return_value = MagicMock(id='test-task-id')
        
        url = reverse('document-process', kwargs={'pk': self.document.id})  # Custom action URL
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        
        # Verify task was queued
        mock_process.assert_called_once_with(self.document.id)
        
        # Verify response structure
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'processing_started')
        self.assertIn('task_id', response.data)
        self.assertEqual(response.data['task_id'], 'test-task-id')
        self.assertIn('document_id', response.data)
        self.assertEqual(response.data['document_id'], self.document.id)

    def test_get_processed_data(self):
        """Test retrieving processed data"""
        # Create processed data
        processed_data = ProcessedData.objects.create(
            document=self.document,
            data={
                'topics': ['Topic 1', 'Topic 2'],
                'extracted_text': 'Sample course content'
            }
        )
        
        url = reverse('document-processed-data', kwargs={'pk': self.document.id})  # Custom action URL
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify response structure
        self.assertIn('data', response.data)
        self.assertIn('timestamp', response.data)
        self.assertIn('document_id', response.data)
        self.assertIn('document_status', response.data)
        
        # Verify data content
        self.assertEqual(response.data['document_id'], self.document.id)
        self.assertEqual(response.data['data']['topics'], ['Topic 1', 'Topic 2'])
        self.assertEqual(response.data['data']['extracted_text'], 'Sample course content')

    def test_error_handling(self):
        """Test error handling during processing"""
        url = reverse('document-process', kwargs={'pk': self.document.id})
        with patch('backend.apps.pdf_service.tasks.process_document.delay') as mock_process:
            mock_process.side_effect = Exception('Processing error')
            response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Failed to queue processing task')

    def test_unauthorized_access(self):
        """Test that users cannot access other users' course content"""
        # Create another user and their document
        other_user = CustomUserFactory()
        other_document = Document.objects.create(
            user=other_user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            title='Other User Document',
            status='pending'
        )
        
        # Try to access the other user's document
        url = reverse('document-detail', kwargs={'pk': other_document.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # DRF returns 404 for other users' documents

    def test_multiple_course_content_files(self):
        """Test processing multiple course content files"""
        # Create additional test files
        files = []
        for i in range(3):
            test_file = SimpleUploadedFile(
                name=f'test_content_{i}.pdf',
                content=b'%PDF-1.4 Test content',
                content_type='application/pdf'
            )
            document = Document.objects.create(
                user=self.user,
                file=test_file,
                file_type='pdf',
                upload_type='course_files',
                title=f'Test Content {i}',
                status='pending'
            )
            files.append(document)
        
        # Process each file
        with patch('backend.apps.pdf_service.tasks.process_document.delay') as mock_process:
            mock_process.return_value = MagicMock(id='test-task-id')
            
            for doc in files:
                url = reverse('document-process', kwargs={'pk': doc.id})
                response = self.client.post(url)
                self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                
                # Verify response structure
                self.assertEqual(response.data['status'], 'processing_started')
                self.assertEqual(response.data['task_id'], 'test-task-id')
                self.assertEqual(response.data['document_id'], doc.id)

    @patch('backend.apps.pdf_service.tasks.process_document.delay')
    def test_course_content_processing_task(self, mock_process):
        """Test that course content processing task is triggered"""
        mock_process.return_value = MagicMock(id='test-task-id')
        
        url = reverse('document-process', kwargs={'pk': self.document.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        mock_process.assert_called_once_with(self.document.id)
        
        # Verify response structure
        self.assertEqual(response.data['status'], 'processing_started')
        self.assertEqual(response.data['task_id'], 'test-task-id')
        self.assertEqual(response.data['document_id'], self.document.id)

    @patch('backend.apps.pdf_service.tasks.process_document.delay')
    def test_course_content_processing_flow(self, mock_process):
        """Test the course content processing flow with mocked services"""
        # Setup mock
        mock_process.return_value = MagicMock(id='test-task-id')
        
        # Trigger processing
        url = reverse('document-process', kwargs={'pk': self.document.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        mock_process.assert_called_once_with(self.document.id)
        
        # Verify response structure
        self.assertEqual(response.data['status'], 'processing_started')
        self.assertEqual(response.data['task_id'], 'test-task-id')
        self.assertEqual(response.data['document_id'], self.document.id) 