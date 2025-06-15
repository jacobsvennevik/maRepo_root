# accounts/tests/test_forms.py
import pytest
from django.contrib.auth import get_user_model
from backend.apps.accounts.forms import RegistrationForm, CustomAuthenticationForm, ProfileUpdateForm


User = get_user_model()

@pytest.mark.django_db
def test_registration_form_valid_data():
    """
    Test that the registration form is valid when provided correct data,
    and that it properly creates a new user.
    """
    form_data = {
        "email": "testuser@example.com",
        "password1": "ComplexPassword123",
        "password2": "ComplexPassword123",
    }
    form = RegistrationForm(data=form_data)
    assert form.is_valid(), form.errors
    user = form.save()
    assert user.email == "testuser@example.com"
    assert user.check_password("ComplexPassword123")


@pytest.mark.django_db
def test_registration_form_duplicate_email():
    """
    Test that the registration form is invalid when email is already taken.
    """
    User.objects.create_user(email="testuser@example.com", password="ComplexPassword123")
    form_data = {
        "email": "testuser@example.com",
        "password1": "ComplexPassword123",
        "password2": "ComplexPassword123",
    }
    form = RegistrationForm(data=form_data)
    assert not form.is_valid()
    assert "email" in form.errors


@pytest.mark.django_db
def test_authentication_form():
    """
    Test the custom authentication form by creating a user and attempting
    to authenticate with the correct credentials.
    """
    # Create a user for testing authentication.
    user = User.objects.create_user(
        email="testuser@example.com",
        password="ComplexPassword123"
    )
    
    form_data = {
        "username": "testuser@example.com",  # Django's auth form uses username field
        "password": "ComplexPassword123",
    }
    form = CustomAuthenticationForm(data=form_data)
    assert form.is_valid(), form.errors


@pytest.mark.django_db
def test_profile_update_form():
    """
    Test that the profile update form properly updates a user's details.
    """
    user = User.objects.create_user(
        email="testuser@example.com",
        password="ComplexPassword123"
    )
    
    form_data = {
        "email": "newemail@example.com",
        "first_name": "Test",
        "last_name": "User",
        "subscription_status": "premium",
    }
    form = ProfileUpdateForm(instance=user, data=form_data)
    assert form.is_valid(), form.errors
    updated_user = form.save()
    assert updated_user.email == "newemail@example.com"
    assert updated_user.first_name == "Test"
    assert updated_user.last_name == "User"
    assert updated_user.subscription_status == "premium"
