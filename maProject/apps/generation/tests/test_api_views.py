import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from maProject.apps.generation.tests.factories import FlashcardSetFactory
from maProject.apps.accounts.tests.factories import CustomUserFactory

@pytest.mark.django_db
def test_flashcardset_list_api():
    """
    Test that the flashcardset list API returns flashcard sets.
    """
    client = APIClient()
    user = CustomUserFactory.create()
    flashcard_set = FlashcardSetFactory(owner=user)
    
    url = reverse('flashcardset-list')  # router basename set as 'flashcardset'
    response = client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    # Verify that the created flashcard set is in the response
    assert any(fs["id"] == flashcard_set.id for fs in data)

@pytest.mark.django_db
def test_create_flashcard_api_with_permissions(auth_client_with_flashcard_permission):
    """
    Test creating a flashcard via the API with DjangoModelPermissions.
    """
    client, user, flashcard_set = auth_client_with_flashcard_permission

    payload = {
        "flashcard_set": flashcard_set.id,  # Expecting the foreign key
        "question": "What is an API?",
        "answer": "Application Programming Interface"
    }
    url = reverse('flashcard-list')  # router basename set as 'flashcard'
    response = client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
