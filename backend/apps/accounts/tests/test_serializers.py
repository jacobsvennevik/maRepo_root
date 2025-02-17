import pytest
from backend.apps.accounts.models import CustomUser
from backend.apps.accounts.serializers import CustomUserSerializer

@pytest.mark.django_db
def test_customuser_serializer_output():
    """
    Test that the CustomUserSerializer correctly serializes a user instance.
    """
    user = CustomUser.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="testpass123"
    )
    serializer = CustomUserSerializer(user)
    data = serializer.data
    assert data["username"] == user.username
    assert data["email"] == user.email
    # Add more assertions as needed
