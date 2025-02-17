import os
import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from backend.apps.documents.models import Document
from backend.apps.documents.tests.factories import DocumentFactory
from backend.apps.accounts.tests.factories import CustomUserFactory

@pytest.mark.django_db
def test_document_list_api():
    """
    Test that the document list API endpoint returns a list of documents.
    """
    client = APIClient()
    # Create a test user and some documents using factories
    user = CustomUserFactory.create()
    DocumentFactory.create_batch(3, user=user)
    
    # If your endpoint is protected, you may need to authenticate:
    client.force_authenticate(user=user)
    
    url = reverse('document-list')  # Ensure the basename in your router is 'document'
    response = client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    # Check that at least one document belongs to the user
    assert any(doc["user"] == user.id for doc in data)

@pytest.mark.django_db
def test_document_create_api():
    """
    Test creating a new document via the API.
    """
    client = APIClient()
    user = CustomUserFactory.create()
    client.force_authenticate(user=user)
    
    # Create a dummy file to upload
    file_content = b"Dummy content for testing."
    uploaded_file = SimpleUploadedFile("test_document.pdf", file_content, content_type="application/pdf")
    
    payload = {
        "file": uploaded_file,
        "file_type": "pdf",
        "title": "Test Document",
    }
    
    url = reverse('document-list')
    response = client.post(url, payload, format="multipart")
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == payload["title"]
    # Depending on your serializer, you may also want to verify file_type and user assignment.
    
    # Optionally, verify that the file was saved in the expected location.
    document = Document.objects.get(pk=data["id"])
    assert os.path.exists(document.file.path)
