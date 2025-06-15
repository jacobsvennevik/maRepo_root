# accounts/tests/test_models.py

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
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
    # Verify that email is correctly set and follows the expected pattern
    assert user.email.startswith('user')
    assert user.email.endswith('@example.com')
    # Verify that the default subscription_status is 'free'
    assert user.subscription_status == 'free'
    # Verify that the default preferences are an empty dict
    assert user.preferences == {}

@pytest.mark.django_db
def test_custom_user_str_method():
    """
    Test that the __str__ method returns the email.
    """
    user = CustomUserFactory.create(email="test@example.com")
    assert str(user) == "test@example.com"

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

@pytest.mark.django_db
def test_custom_user_email_unique():
    """
    Test that users cannot be created with duplicate emails.
    """
    email = "test@example.com"
    CustomUserFactory.create(email=email)
    
    with pytest.raises(ValidationError):
        user2 = CustomUserFactory.build(email=email)
        user2.full_clean()

@pytest.mark.django_db
def test_custom_user_email_required():
    """
    Test that email is required.
    """
    with pytest.raises(ValidationError):
        user = CustomUserFactory.build(email="")
        user.full_clean()
