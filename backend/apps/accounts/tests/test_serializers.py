import pytest
from rest_framework import serializers
from backend.apps.accounts.models import CustomUser
from backend.apps.accounts.serializers import CustomUserSerializer

@pytest.mark.django_db
def test_customuser_serializer_output():
    """
    Test that the CustomUserSerializer correctly serializes a user instance.
    """
    user = CustomUser.objects.create_user(
        email="testuser@example.com",
        password="testpass123"
    )
    
    serializer = CustomUserSerializer(user)
    data = serializer.data
    
    assert data["email"] == "testuser@example.com"
    assert "password" not in data  # Password should not be serialized
