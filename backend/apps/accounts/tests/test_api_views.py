import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from backend.apps.accounts.models import CustomUser
from backend.apps.accounts.tests.factories import CustomUserFactory

@pytest.mark.django_db
def test_user_list_api():
    """
    Test that the user list API endpoint returns a list of users.
    """
    client = APIClient()
    # Create a test user using your factory
    test_user = CustomUserFactory.create(username="testuser", email="testuser@example.com")
    
    # Authenticate the client with the test user
    client.force_authenticate(user=test_user)
    
    url = reverse('user-list')  # router basename was set as 'user'
    response = client.get(url)
    
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_create_user_api():
    """
    Test creating a new user via the API.
    """
    client = APIClient()
    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        # Depending on your serializer, you might need to handle password separately.
        "password": "newpass123"
    }
    url = reverse('user-list')
    response = client.post(url, payload, format="json")
    
    # Assuming creation returns HTTP 201
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == payload["username"]
    assert data["email"] == payload["email"]
