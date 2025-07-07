import pytest
import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch

from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.django_models import Document, ProcessedData
from backend.apps.pdf_service.tasks import process_document

User = get_user_model()


@pytest.mark.django_db
class FrontendIntegrationTests(TestCase):
    """
    Tests that specifically verify the API responses match what the frontend expects
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        
        # Create a test PDF file
        self.pdf_content = b'%PDF-1.4 Frontend integration test content'
        self.test_file = SimpleUploadedFile(
            "frontend_test.pdf",
            self.pdf_content,
            content_type="application/pdf"
        )
        
        # Sample data that matches your real syllabus extraction
        self.real_syllabus_data = {
            'course_title': 'Natural Language Interaction',
            'instructor': 'Antonio White',
            'semester': '2024/2025',
            'course_code': 'NLI-101',
            'course_description': 'Acquire core concepts and methods for computational modeling of knowledge, with a focus on linguistic knowledge.',
            'topics': [
                'Knowledge representation based on inference',
                'Syntactic analysis and parsing',
                'Semantic representation and logical form',
                'Language models and vector representation',
                'Neural networks, deep learning and Transformers',
                'AI, Cognition and open challenges'
            ],
            'meeting_times': 'Thursday, 1:00pm-4:30pm',
            'office_hours': 'Wednesday, 2:00pm-3:00pm',
            'location': 'room 8.2.13',
            'contact_info': 'Cabinet 6.3.24, 217500606 (from outside FCUL), 26324 (from inside FCUL)',
            'important_dates': [
                'February 20, Thursday',
                'May 29, Thursday', 
                'Monday 3 March to Wednesday 5 March',
                'Thu 17th April to Thu 24th April',
                'May 1st, Thursday'
            ],
            'required_materials': [
                'Jurafsky and Martin, 2025, Speech and Language Processing, Prentice Hall',
                'Tunstall, Werra and Wolf, 2022, Natural Language Processing with Transformers',
                'Goldberg, 2017, Neural Network Methods for Natural Language Processing'
            ],
            'forms_of_evaluation': [
                '4 Short Exercises (A to D)',
                'Test 1',
                'Test 2', 
                'Project',
                'Exam'
            ],
            'learning_outcomes': [
                'Acquire core concepts and methods for computational modeling',
                'Acquire introductory but effective experience in knowledge modeling',
                'Introduction to applications of computational modeling of natural language',
                'Understand contextualization within AI and Cognitive Science'
            ],
            'policies': None,
            'other_relevant_information': 'This subject does not have any other subject in the course syllabus as direct precedence. The workload is estimated at 6 ECTS credits, approximately 170 hours of work.'
        }

    def test_frontend_upload_and_poll_flow(self):
        """Test the exact flow that the frontend uses: upload -> process -> poll -> extract"""
        
        # Step 1: Upload file (what frontend does first)
        upload_data = {
            'file': self.test_file,
            'file_type': 'pdf',
            'upload_type': 'course_files'
        }
        
        upload_response = self.client.post('/api/pdf_service/documents/', upload_data, format='multipart')
        
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        
        upload_data = upload_response.json()
        document_id = upload_data['id']
        
        # Verify initial response structure
        required_upload_fields = ['id', 'title', 'file_type', 'upload_date', 'status']
        for field in required_upload_fields:
            self.assertIn(field, upload_data)
        
        self.assertEqual(upload_data['status'], 'pending')
        
        # Step 2: Start processing (what frontend does after upload)
        process_response = self.client.post(f'/api/pdf_service/documents/{document_id}/process/')
        
        self.assertEqual(process_response.status_code, status.HTTP_202_ACCEPTED)
        
        process_data = process_response.json()
        required_process_fields = ['status', 'task_id', 'document_id']
        for field in required_process_fields:
            self.assertIn(field, process_data)
        
        self.assertEqual(process_data['status'], 'processing_started')
        self.assertEqual(process_data['document_id'], document_id)
        
        # Step 3: Simulate processing completion (what Celery worker does)
        document = Document.objects.get(id=document_id)
        document.status = 'completed'
        document.original_text = 'Extracted text from the frontend test PDF'
        document.save()
        
        # Create processed data (what AI extraction produces)
        ProcessedData.objects.create(
            document=document,
            data=self.real_syllabus_data
        )
        
        # Step 4: Poll for status (what frontend does repeatedly)
        poll_response = self.client.get(f'/api/pdf_service/documents/{document_id}/')
        
        self.assertEqual(poll_response.status_code, status.HTTP_200_OK)
        
        poll_data = poll_response.json()
        
        # Verify polling response has all fields frontend needs
        required_poll_fields = ['id', 'status', 'original_text', 'processed_data', 'metadata']
        for field in required_poll_fields:
            self.assertIn(field, poll_data, f"Frontend polling requires field: {field}")
        
        # Verify status progression
        self.assertEqual(poll_data['status'], 'completed')
        self.assertIsNotNone(poll_data['processed_data'])
        
        # Step 5: Verify extracted data structure matches frontend expectations
        extracted_data = poll_data['processed_data']
        
        # Check all the fields that frontend transformation logic expects
        frontend_expected_fields = [
            'course_title', 'instructor', 'semester', 'topics',
            'meeting_times', 'important_dates', 'forms_of_evaluation'
        ]
        
        for field in frontend_expected_fields:
            self.assertIn(field, extracted_data, f"Frontend expects field: {field}")
        
        # Verify data types match frontend expectations
        self.assertIsInstance(extracted_data['topics'], list)
        self.assertIsInstance(extracted_data['important_dates'], list)
        self.assertIsInstance(extracted_data['forms_of_evaluation'], list)
        self.assertIsInstance(extracted_data['course_title'], str)
        self.assertIsInstance(extracted_data['instructor'], str)
        
        # Verify specific content matches real extraction
        self.assertEqual(extracted_data['course_title'], 'Natural Language Interaction')
        self.assertEqual(extracted_data['instructor'], 'Antonio White')
        self.assertEqual(extracted_data['semester'], '2024/2025')
        self.assertGreater(len(extracted_data['topics']), 0)

    def test_frontend_handles_missing_processed_data(self):
        """Test frontend can handle documents without processed data"""
        
        # Create document without processed data (processing failed)
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='error',
            original_text=None
        )
        
        # Frontend polls for status
        response = self.client.get(f'/api/pdf_service/documents/{document.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['status'], 'error')
        self.assertIsNone(data['processed_data'])
        
        # Frontend should be able to handle null processed_data gracefully

    def test_frontend_transformation_compatibility(self):
        """Test that extracted data can be transformed to frontend format"""
        
        # Create document with real extracted data
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='Sample text'
        )
        
        ProcessedData.objects.create(
            document=document,
            data=self.real_syllabus_data
        )
        
        # Get document data
        response = self.client.get(f'/api/pdf_service/documents/{document.id}/')
        data = response.json()
        
        # Simulate frontend transformation (from guided-setup.tsx)
        backend_data = data['processed_data']
        
        # Test the transformation logic that frontend uses
        transformed_data = {
            'courseName': backend_data.get('course_title', ''),
            'instructor': backend_data.get('instructor', ''),
            'semester': backend_data.get('semester', ''),
            'credits': backend_data.get('credits'),  # May be None
            'topics': backend_data.get('topics', []),
            'assignments': backend_data.get('important_dates', []),
            'testTypes': backend_data.get('forms_of_evaluation', []),
            'location': backend_data.get('location', ''),
            'meetingTimes': backend_data.get('meeting_times', ''),
            'officeHours': backend_data.get('office_hours', ''),
            'materials': backend_data.get('required_materials', [])
        }
        
        # Verify transformation works correctly
        self.assertEqual(transformed_data['courseName'], 'Natural Language Interaction')
        self.assertEqual(transformed_data['instructor'], 'Antonio White')
        self.assertEqual(transformed_data['semester'], '2024/2025')
        self.assertIsInstance(transformed_data['topics'], list)
        self.assertGreater(len(transformed_data['topics']), 0)
        self.assertEqual(transformed_data['location'], 'room 8.2.13')
        self.assertEqual(transformed_data['meetingTimes'], 'Thursday, 1:00pm-4:30pm')
        
        # Verify optional fields handle None gracefully
        self.assertIsNone(transformed_data['credits'])

    def test_console_logging_information(self):
        """Test that API responses provide information for console logging"""
        
        # Create document with processed data
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='completed',
            original_text='Console logging test text'
        )
        
        ProcessedData.objects.create(
            document=document,
            data=self.real_syllabus_data
        )
        
        # Get document status (what frontend logs)
        response = self.client.get(f'/api/pdf_service/documents/{document.id}/')
        data = response.json()
        
        # Verify all information needed for console logging is present
        self.assertIn('status', data)
        self.assertIn('processed_data', data)
        
        processed_data = data['processed_data']
        
        # Verify specific fields that frontend logs
        logging_fields = ['course_title', 'instructor', 'semester', 'topics', 'meeting_times', 'important_dates']
        
        for field in logging_fields:
            self.assertIn(field, processed_data, f"Console logging expects field: {field}")
        
        # Verify data can be safely logged (no sensitive info, proper types)
        self.assertIsInstance(processed_data['course_title'], str)
        self.assertIsInstance(processed_data['topics'], list)
        
        # Ensure there's meaningful content for logging
        self.assertGreater(len(processed_data['course_title']), 0)
        self.assertGreater(len(processed_data['topics']), 0)

    def test_api_error_responses_match_frontend_expectations(self):
        """Test that API error responses are in the format frontend expects"""
        
        # Test 404 error format
        response = self.client.get('/api/pdf_service/documents/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test 404 on processed_data endpoint
        processed_response = self.client.get('/api/pdf_service/documents/99999/processed_data/')
        self.assertEqual(processed_response.status_code, status.HTTP_404_NOT_FOUND)
        
        error_data = processed_response.json()
        self.assertIn('error', error_data)
        self.assertIsInstance(error_data['error'], str)
        
        # Test unauthorized access
        self.client.force_authenticate(user=None)
        
        unauth_response = self.client.get('/api/pdf_service/documents/1/')
        self.assertEqual(unauth_response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('backend.apps.pdf_service.tasks.process_document.delay')
    def test_processing_task_queuing_response(self, mock_process_task):
        """Test that task queuing returns proper response for frontend"""
        
        # Mock successful task queuing
        mock_task = type('MockTask', (), {'id': 'test-task-id-123'})()
        mock_process_task.return_value = mock_task
        
        # Create document
        document = Document.objects.create(
            user=self.user,
            file=self.test_file,
            file_type='pdf',
            upload_type='course_files',
            status='pending'
        )
        
        # Test process endpoint
        response = self.client.post(f'/api/pdf_service/documents/{document.id}/process/')
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        
        data = response.json()
        
        # Verify response structure matches frontend expectations
        self.assertIn('status', data)
        self.assertIn('task_id', data)
        self.assertIn('document_id', data)
        
        self.assertEqual(data['status'], 'processing_started')
        self.assertEqual(data['task_id'], 'test-task-id-123')
        self.assertEqual(data['document_id'], document.id)
        
        # Verify task was called
        mock_process_task.assert_called_once_with(document.id) 