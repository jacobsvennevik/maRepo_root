import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.apps.accounts.tests.factories import CustomUserFactory

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