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
    test_user = CustomUserFactory.create(email="test@example.com")
    
    # Authenticate the client with the test user
    client.force_authenticate(user=test_user)
    
    url = reverse('user-list')
    response = client.get(url)
    
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_create_user_api():
    client = APIClient()
    payload = {
        "email": "newuser@example.com",
        "password": "newpass123"
    }
    url = reverse('user-list')
    response = client.post(url, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert CustomUser.objects.filter(email="newuser@example.com").exists()

@pytest.mark.django_db
def test_login_api():
    """
    Test that users can login with email and password.
    """
    password = "testpass123"
    user = CustomUserFactory.create(
        email="test@example.com",
        password=password
    )
    
    client = APIClient()
    url = reverse('token_obtain_pair')
    response = client.post(url, {
        "email": user.email,  # Use email field instead of username
        "password": password
    }, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.json()
    assert "refresh" in response.json()
