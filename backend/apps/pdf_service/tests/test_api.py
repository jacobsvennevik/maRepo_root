import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.apps.pdf_service.django_models import Document

User = get_user_model()


class PDFServiceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_document_upload(self):
        """Test document upload endpoint"""
        # Create a fake PDF file
        pdf_content = b'%PDF-1.4 fake pdf content'
        uploaded_file = SimpleUploadedFile(
            "test.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        data = {
            'file': uploaded_file,
            'file_type': 'pdf',
            'upload_type': 'course_files'
        }
        
        url = reverse('document-list')  # This uses the router basename
        response = self.client.post(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Document.objects.filter(user=self.user).exists())
        
        return response.data['id']
    
    @patch('backend.apps.pdf_service.tasks.process_document.delay')
    def test_document_process(self, mock_process):
        """Test document processing endpoint"""
        # First upload a document
        document_id = self.test_document_upload()
        
        # Then try to process it
        url = reverse('document-process', kwargs={'pk': document_id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(response.data['status'], 'processing_started')
        mock_process.assert_called_once_with(document_id)
    
    def test_document_process_not_found(self):
        """Test processing non-existent document"""
        url = reverse('document-process', kwargs={'pk': 99999})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_unauthenticated_access(self):
        """Test that unauthenticated users can't access the API"""
        self.client.force_authenticate(user=None)
        
        url = reverse('document-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

@pytest.mark.django_db
def test_upload_course_files():
    """
    Test uploading a course file.
    """
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse('upload_course_files')
    file = SimpleUploadedFile("file.txt", b"file_content", content_type="text/plain")
    response = client.post(url, {'file': file}, format='multipart')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['title'] == 'file.txt'
    assert response.data['upload_type'] == 'course_files'
    assert response.data['user'] == user.id

@pytest.mark.django_db
def test_upload_test_files():
    """
    Test uploading a test file.
    """
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse('upload_test_files')
    file = SimpleUploadedFile("file.txt", b"file_content", content_type="text/plain")
    response = client.post(url, {'file': file}, format='multipart')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['title'] == 'file.txt'
    assert response.data['upload_type'] == 'test_files'
    assert response.data['user'] == user.id

@pytest.mark.django_db
def test_upload_learning_materials():
    """
    Test uploading a learning material.
    """
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse('upload_learning_materials')
    file = SimpleUploadedFile("file.txt", b"file_content", content_type="text/plain")
    response = client.post(url, {'file': file}, format='multipart')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['title'] == 'file.txt'
    assert response.data['upload_type'] == 'learning_materials'
    assert response.data['user'] == user.id 