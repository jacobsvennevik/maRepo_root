import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from backend.apps.accounts.models import CustomUser

@pytest.mark.django_db
class TestJWTAuthentication:
    def test_obtain_jwt_token(self):
        """Test obtaining JWT token with email and password"""
        # Create a test user
        email = "test@example.com"
        password = "testpass123"
        user = CustomUser.objects.create_user(
            email=email,
            password=password
        )
        
        client = APIClient()
        url = reverse('token_obtain_pair')
        
        # Test with correct credentials using email field
        response = client.post(url, {
            'email': email,
            'password': password
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        
        # Test with wrong password
        response = client.post(url, {
            'email': email,
            'password': 'wrongpass'
        }, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Test with wrong email
        response = client.post(url, {
            'email': 'wrong@example.com',
            'password': password
        }, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_refresh_token(self):
        """Test refreshing JWT token"""
        # Create a test user
        email = "test@example.com"
        password = "testpass123"
        user = CustomUser.objects.create_user(
            email=email,
            password=password
        )
        
        client = APIClient()
        
        # First obtain tokens
        response = client.post(reverse('token_obtain_pair'), {
            'email': email,
            'password': password
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        refresh_token = response.data['refresh']
        
        # Test refreshing token
        response = client.post(reverse('token_refresh'), {
            'refresh': refresh_token
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        
        # Test with invalid refresh token
        response = client.post(reverse('token_refresh'), {
            'refresh': 'invalid-token'
        }, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_protected_endpoint_with_jwt(self):
        """Test accessing protected endpoint with JWT token"""
        # Create a test user
        email = "test@example.com"
        password = "testpass123"
        user = CustomUser.objects.create_user(
            email=email,
            password=password
        )
        
        client = APIClient()
        
        # First obtain token
        response = client.post(reverse('token_obtain_pair'), {
            'email': email,
            'password': password
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        access_token = response.data['access']
        
        # Test accessing protected endpoint
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = client.get(reverse('user-list'))
        
        assert response.status_code == status.HTTP_200_OK 