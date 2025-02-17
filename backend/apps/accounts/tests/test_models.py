# accounts/tests/test_models.py

import pytest
from django.contrib.auth import get_user_model
from .factories import CustomUserFactory

User = get_user_model()

@pytest.mark.django_db
def test_custom_user_creation():
    """
    Test that a CustomUser instance is properly created using the factory
    with the expected default field values.
    """
    user = CustomUserFactory.create()
    
    # Verify that the user has been saved (has a primary key)
    assert user.pk is not None
    # Verify that username and email are correctly set
    assert user.username.startswith('user')
    assert user.email == f"{user.username}@example.com"
    # Verify that the default subscription_status is 'free'
    assert user.subscription_status == 'free'
    # Verify that the default preferences are an empty dict
    assert user.preferences == {}

@pytest.mark.django_db
def test_custom_user_str_method():
    """
    Test that the __str__ method returns the username.
    """
    user = CustomUserFactory.create(username="testuser")
    expected_str = "testuser"  # Expected output of __str__
    assert str(user) == expected_str

@pytest.mark.django_db
def test_custom_user_update_preferences():
    """
    Test that the preferences field can be updated and saved correctly.
    """
    user = CustomUserFactory.create()
    new_preferences = {"theme": "dark", "notifications": True}
    user.preferences = new_preferences
    user.save()
    user.refresh_from_db()
    assert user.preferences == new_preferences

@pytest.mark.django_db
def test_custom_user_password_check():
    """
    Test that the password is properly hashed and can be validated.
    """
    password = "password123"
    user = CustomUserFactory.create(password=password)
    # The raw password is not stored; use check_password for verification.
    assert user.check_password(password)
