import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.django_models import Document, ProcessedData

User = get_user_model()


@pytest.mark.django_db
class ProcessedDataEndpointTests(TestCase):
    """
    Tests for the processed_data API endpoint and related functionality
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        
        # Create a test PDF file
        self.pdf_content = b'%PDF-1.4 test content for processed data endpoint'
        self.test_file = SimpleUploadedFile(
            "test_processed_data.pdf",
            self.pdf_content,
            content_type="application/pdf"
        )
        
        # Sample extracted data that would come from AI processing
        self.sample_extracted_data = {
            'course_title': 'Advanced Machine Learning',
            'instructor': 'Dr. Jane Smith',
            'semester': '2024/2025',
            'course_code': 'CS-ML-401',
            'topics': [
                'Neural Networks',
                'Deep Learning',
                'Natural Language Processing',
                'Computer Vision'
            ],
            'meeting_times': 'Tuesday and Thursday, 2:00pm-3:30pm',
            'office_hours': 'Wednesday, 1:00pm-2:00pm',
            'important_dates': [
                'Midterm Exam: March 15, 2025',
                'Final Project Due: May 1, 2025',
                'Final Exam: May 15, 2025'
            ],
            'required_materials': [
                'Deep Learning by Ian Goodfellow',
                'Pattern Recognition and Machine Learning by Christopher Bishop'
            ],
            'forms_of_evaluation': [
                'Midterm Exam (30%)',
                'Final Project (40%)',
                'Final Exam (30%)'
            ],
            'course_description': 'Advanced concepts in machine learning including deep neural networks, natural language processing, and computer vision applications.',
            'learning_outcomes': [
                'Understand advanced ML algorithms',
                'Implement deep learning models',
                'Apply ML to real-world problems'
            ]
        }

    def test_processed_data_endpoint_with_data(self):
        """Test the processed_data endpoint when document has processed data"""
        
        # Create a document
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='Sample extracted text from PDF'
        )
        
        # Create processed data for the document
        processed_data = ProcessedData.objects.create(
            document=document,
            data=self.sample_extracted_data
        )
        
        # Test the endpoint
        url = reverse('document-processed-data', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response_data = response.json()
        self.assertIn('data', response_data)
        self.assertIn('timestamp', response_data)
        self.assertIn('document_id', response_data)
        self.assertIn('document_status', response_data)
        
        self.assertEqual(response_data['document_id'], document.id)
        self.assertEqual(response_data['document_status'], 'completed')
        self.assertEqual(response_data['data'], self.sample_extracted_data)
        
        # Verify specific extracted fields
        extracted_data = response_data['data']
        self.assertEqual(extracted_data['course_title'], 'Advanced Machine Learning')
        self.assertEqual(extracted_data['instructor'], 'Dr. Jane Smith')
        self.assertEqual(extracted_data['semester'], '2024/2025')
        self.assertIsInstance(extracted_data['topics'], list)
        self.assertEqual(len(extracted_data['topics']), 4)

    def test_processed_data_endpoint_without_data(self):
        """Test the processed_data endpoint when document has no processed data"""
        
        # Create a document without processed data
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='Sample extracted text from PDF'
        )
        
        # Test the endpoint (should return 404)
        url = reverse('document-processed-data', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        response_data = response.json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'No processed data available for this document')

    def test_processed_data_endpoint_nonexistent_document(self):
        """Test the processed_data endpoint with non-existent document"""
        
        url = reverse('document-processed-data', kwargs={'pk': 99999})
        response = self.client.get(url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        response_data = response.json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Document not found')

    def test_processed_data_endpoint_unauthorized(self):
        """Test the processed_data endpoint without authentication"""
        
        # Create a document
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed'
        )
        
        # Remove authentication
        self.client.force_authenticate(user=None)
        
        url = reverse('document-processed-data', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        # Should require authentication
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_processed_data_endpoint_other_user_document(self):
        """Test that users cannot access other users' document processed data"""
        
        # Create another user and their document
        other_user = CustomUserFactory()
        document = Document.objects.create(
            user=other_user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed'
        )
        
        # Try to access other user's document (authenticated as self.user)
        url = reverse('document-processed-data', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        # Should return 404 (not revealing that document exists)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


@pytest.mark.django_db 
class DocumentSerializerTests(TestCase):
    """
    Tests for the updated DocumentSerializer with processed_data field
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        
        self.pdf_content = b'%PDF-1.4 test content for serializer'
        self.test_file = SimpleUploadedFile(
            "test_serializer.pdf",
            self.pdf_content,
            content_type="application/pdf"
        )
        
        self.sample_extracted_data = {
            'course_title': 'Data Structures and Algorithms',
            'instructor': 'Prof. Alan Turing',
            'semester': 'Spring 2025',
            'topics': ['Arrays', 'Linked Lists', 'Trees', 'Graphs'],
            'meeting_times': 'Monday, Wednesday, Friday 10:00am-11:00am'
        }

    def test_document_serializer_includes_processed_data(self):
        """Test that DocumentSerializer includes processed_data field"""
        
        # Create document with processed data
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='Sample text',
            metadata={'source': 'test'}
        )
        
        processed_data = ProcessedData.objects.create(
            document=document,
            data=self.sample_extracted_data
        )
        
        # Get document via API
        url = reverse('document-detail', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response_data = response.json()
        
        # Check all expected fields are present
        expected_fields = [
            'id', 'title', 'file_type', 'upload_date', 'status',
            'original_text', 'metadata', 'file', 'user', 
            'upload_type', 'processed_data'
        ]
        
        for field in expected_fields:
            self.assertIn(field, response_data, f"Field '{field}' missing from response")
        
        # Check processed_data content
        self.assertIsNotNone(response_data['processed_data'])
        self.assertEqual(response_data['processed_data'], self.sample_extracted_data)
        
        # Verify specific fields in processed_data
        processed_data_response = response_data['processed_data']
        self.assertEqual(processed_data_response['course_title'], 'Data Structures and Algorithms')
        self.assertEqual(processed_data_response['instructor'], 'Prof. Alan Turing')
        self.assertEqual(len(processed_data_response['topics']), 4)

    def test_document_serializer_without_processed_data(self):
        """Test DocumentSerializer when document has no processed data"""
        
        # Create document without processed data
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='pending',
            original_text='Sample text'
        )
        
        # Get document via API
        url = reverse('document-detail', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response_data = response.json()
        
        # processed_data should be null
        self.assertIn('processed_data', response_data)
        self.assertIsNone(response_data['processed_data'])


@pytest.mark.django_db
class IntegrationExttractionFlowTests(TestCase):
    """
    Integration tests for the complete document processing and extraction flow
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        
        self.pdf_content = b'%PDF-1.4 Integration test content'
        self.test_file = SimpleUploadedFile(
            "integration_test.pdf",
            self.pdf_content,
            content_type="application/pdf"
        )

    def test_full_document_processing_flow(self):
        """Test the complete flow: upload -> process -> poll -> get processed data"""
        
        # Step 1: Upload document
        upload_data = {
            'file': self.test_file,
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
        self.assertEqual(document.status, 'pending')
        
        # Step 2: Simulate processing completion by manually setting up processed data
        # (In real scenario, this would be done by Celery task)
        document.status = 'completed'
        document.original_text = 'Extracted text from integration test PDF'
        document.save()
        
        sample_processed_data = {
            'course_title': 'Integration Test Course',
            'instructor': 'Test Instructor',
            'semester': 'Test Semester',
            'topics': ['Topic 1', 'Topic 2']
        }
        
        ProcessedData.objects.create(
            document=document,
            data=sample_processed_data
        )
        
        # Step 3: Poll for status (should show completed with processed_data)
        status_url = reverse('document-detail', kwargs={'pk': document_id})
        status_response = self.client.get(status_url)
        
        self.assertEqual(status_response.status_code, status.HTTP_200_OK)
        
        status_data = status_response.json()
        self.assertEqual(status_data['status'], 'completed')
        self.assertIsNotNone(status_data['processed_data'])
        self.assertEqual(status_data['processed_data']['course_title'], 'Integration Test Course')
        
        # Step 4: Get processed data via dedicated endpoint
        processed_data_url = reverse('document-processed-data', kwargs={'pk': document_id})
        processed_response = self.client.get(processed_data_url)
        
        self.assertEqual(processed_response.status_code, status.HTTP_200_OK)
        
        processed_data_response = processed_response.json()
        self.assertEqual(processed_data_response['document_id'], document_id)
        self.assertEqual(processed_data_response['data'], sample_processed_data)

    def test_frontend_expected_response_structure(self):
        """Test that API responses match what the frontend expects"""
        
        # Create a completed document with processed data
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='Frontend test text',
            metadata={'source': 'frontend_test.pdf'}
        )
        
        frontend_expected_data = {
            'course_title': 'Frontend Integration Course',
            'instructor': 'Frontend Test Prof',
            'semester': '2025 Spring',
            'course_code': 'FE-101',
            'topics': ['React', 'TypeScript', 'API Integration'],
            'meeting_times': 'Daily 9:00am-10:00am',
            'office_hours': 'By appointment',
            'important_dates': ['Project due: April 1', 'Final exam: May 1'],
            'required_materials': ['Frontend Development Guide'],
            'forms_of_evaluation': ['Project (50%)', 'Exam (50%)']
        }
        
        ProcessedData.objects.create(
            document=document,
            data=frontend_expected_data
        )
        
        # Test document detail endpoint (what frontend polls)
        url = reverse('document-detail', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        
        # Verify frontend can access all needed fields
        frontend_required_fields = [
            'id', 'status', 'original_text', 'processed_data'
        ]
        
        for field in frontend_required_fields:
            self.assertIn(field, data, f"Frontend requires field: {field}")
        
        # Verify processed_data structure matches frontend expectations
        processed_data = data['processed_data']
        self.assertIsNotNone(processed_data)
        
        frontend_expected_fields = [
            'course_title', 'instructor', 'semester', 'topics',
            'meeting_times', 'important_dates'
        ]
        
        for field in frontend_expected_fields:
            self.assertIn(field, processed_data, f"Frontend expects processed field: {field}")
        
        # Verify data types
        self.assertIsInstance(processed_data['topics'], list)
        self.assertIsInstance(processed_data['important_dates'], list)
        self.assertIsInstance(processed_data['course_title'], str)

    def test_error_handling_for_failed_processing(self):
        """Test error handling when document processing fails"""
        
        # Create a document that failed processing
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='error',
            original_text=None
        )
        
        # Test status polling
        url = reverse('document-detail', kwargs={'pk': document.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['status'], 'error')
        self.assertIsNone(data['processed_data'])
        
        # Test processed_data endpoint (should return 404)
        processed_url = reverse('document-processed-data', kwargs={'pk': document.id})
        processed_response = self.client.get(processed_url)
        
        self.assertEqual(processed_response.status_code, status.HTTP_404_NOT_FOUND) 