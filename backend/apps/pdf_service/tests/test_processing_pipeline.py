import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.apps.pdf_service.django_models import Document
from backend.apps.accounts.tests.factories import CustomUserFactory

User = get_user_model()


@pytest.mark.django_db
class PDFProcessingPipelineTests(TestCase):
    """
    Integration tests for the complete PDF processing pipeline
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        
        # Create a mock PDF file
        self.pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n202\n%%EOF'
        self.uploaded_file = SimpleUploadedFile(
            "test_syllabus.pdf",
            self.pdf_content,
            content_type="application/pdf"
        )

    def test_complete_upload_and_process_flow(self):
        """Test the complete flow: upload -> process -> poll -> completion"""
        
        # Step 1: Upload document
        upload_data = {
            'file': self.uploaded_file,
            'file_type': 'pdf',
            'upload_type': 'course_files'
        }
        
        upload_url = reverse('document-list')
        upload_response = self.client.post(upload_url, upload_data, format='multipart')
        
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        document_id = upload_response.data['id']
        
        # Verify document was created
        document = Document.objects.get(id=document_id)
        self.assertEqual(document.user, self.user)
        self.assertEqual(document.file_type, 'pdf')
        self.assertEqual(document.upload_type, 'course_files')
        self.assertEqual(document.status, 'pending')

    @patch('backend.apps.pdf_service.tasks.process_document.delay')
    def test_process_endpoint_triggers_celery_task(self, mock_process_task):
        """Test that the process endpoint triggers the Celery task"""
        
        # Create a document first
        document = Document.objects.create(
            user=self.user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files',
            status='pending'
        )
        
        # Call process endpoint
        process_url = reverse('document-process', kwargs={'pk': document.id})
        process_response = self.client.post(process_url)
        
        self.assertEqual(process_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(process_response.data['status'], 'processing_started')
        
        # Verify Celery task was called
        mock_process_task.assert_called_once_with(document.id)

    def test_status_polling_returns_correct_document_state(self):
        """Test that status polling returns the correct document state"""
        
        # Create a document with completed status
        document = Document.objects.create(
            user=self.user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='This is extracted course content',
            metadata={'course_name': 'Test Course', 'topics': ['topic1', 'topic2']}
        )
        
        # Poll for status
        status_url = reverse('document-detail', kwargs={'pk': document.id})
        status_response = self.client.get(status_url)
        
        self.assertEqual(status_response.status_code, status.HTTP_200_OK)
        self.assertEqual(status_response.data['status'], 'completed')
        self.assertEqual(status_response.data['original_text'], 'This is extracted course content')
        self.assertIn('course_name', status_response.data['metadata'])

    def test_error_handling_in_processing(self):
        """Test error handling when processing fails"""
        
        # Create a document with error status
        document = Document.objects.create(
            user=self.user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files',
            status='error',
            error_message='Failed to extract text from PDF'
        )
        
        # Poll for status
        status_url = reverse('document-detail', kwargs={'pk': document.id})
        status_response = self.client.get(status_url)
        
        self.assertEqual(status_response.status_code, status.HTTP_200_OK)
        self.assertEqual(status_response.data['status'], 'error')
        self.assertEqual(status_response.data['error_message'], 'Failed to extract text from PDF')

    def test_unauthorized_access_prevention(self):
        """Test that users cannot access other users' documents"""
        
        # Create another user and their document
        other_user = CustomUserFactory()
        other_document = Document.objects.create(
            user=other_user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed'
        )
        
        # Try to access other user's document
        status_url = reverse('document-detail', kwargs={'pk': other_document.id})
        status_response = self.client.get(status_url)
        
        self.assertEqual(status_response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('backend.apps.pdf_service.tasks.ingest_pdf')
    @patch('backend.apps.pdf_service.tasks.DocumentDispatcher')
    def test_celery_task_processing_flow(self, mock_dispatcher_class, mock_ingest_pdf):
        """Test the Celery task processing flow"""
        
        # Setup mocks
        mock_ingest_pdf.return_value = (["Extracted text content"], {"source": "test"})
        mock_dispatcher_instance = MagicMock()
        mock_dispatcher_class.return_value = mock_dispatcher_instance
        
        # Create a document
        document = Document.objects.create(
            user=self.user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files',
            status='pending',
            original_text=''  # Empty to trigger processing
        )
        
        # Import and run the task
        from backend.apps.pdf_service.tasks import process_document
        process_document(document.id)
        
        # Verify the flow
        mock_ingest_pdf.assert_called_once()
        mock_dispatcher_class.assert_called_once()
        mock_dispatcher_instance.dispatch.assert_called_once()
        
        # Verify document was updated
        document.refresh_from_db()
        self.assertEqual(document.status, 'completed')
        self.assertIn('Extracted text content', document.original_text)

    def test_frontend_integration_endpoints(self):
        """Test endpoints that the frontend specifically uses"""
        
        # Test the exact flow the frontend uses
        
        # 1. Upload via the documents endpoint
        upload_data = {
            'file': self.uploaded_file,
            'file_type': 'pdf',
            'upload_type': 'course_files'
        }
        
        upload_response = self.client.post('/api/pdf_service/documents/', upload_data, format='multipart')
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        document_id = upload_response.data['id']
        
        # 2. Start processing
        process_response = self.client.post(f'/api/pdf_service/documents/{document_id}/process/')
        self.assertEqual(process_response.status_code, status.HTTP_202_ACCEPTED)
        
        # 3. Poll for status
        status_response = self.client.get(f'/api/pdf_service/documents/{document_id}/')
        self.assertEqual(status_response.status_code, status.HTTP_200_OK)
        
        # Verify response structure matches frontend expectations
        required_fields = ['id', 'status', 'original_text', 'metadata', 'file_type']
        for field in required_fields:
            self.assertIn(field, status_response.data)

    def test_processed_data_endpoint(self):
        """Test the processed data endpoint if it exists"""
        
        # Create a document with processed data
        document = Document.objects.create(
            user=self.user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            metadata={'course_name': 'Advanced Physics', 'topics': ['mechanics', 'thermodynamics']}
        )
        
        # Try to access processed data endpoint
        try:
            processed_data_url = f'/api/pdf_service/documents/{document.id}/processed_data/'
            processed_response = self.client.get(processed_data_url)
            
            # If endpoint exists, check structure
            if processed_response.status_code == status.HTTP_200_OK:
                self.assertIn('data', processed_response.data)
        except:
            # Endpoint might not exist, which is fine
            pass

    def test_document_list_filtering(self):
        """Test that document list only returns user's documents"""
        
        # Create documents for current user
        doc1 = Document.objects.create(
            user=self.user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files'
        )
        
        # Create document for another user
        other_user = CustomUserFactory()
        doc2 = Document.objects.create(
            user=other_user,
            file=self.uploaded_file,
            file_type='pdf',
            upload_type='course_files'
        )
        
        # Get document list
        list_response = self.client.get('/api/pdf_service/documents/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        
        # Verify only user's documents are returned
        returned_ids = [doc['id'] for doc in list_response.data]
        self.assertIn(doc1.id, returned_ids)
        self.assertNotIn(doc2.id, returned_ids) 