# accounts/tests/test_forms.py
import pytest
from django.contrib.auth import get_user_model
from maProject.apps.accounts.forms import RegistrationForm, CustomAuthenticationForm, ProfileUpdateForm


User = get_user_model()

@pytest.mark.django_db
def test_registration_form_valid_data():
    """
    Test that the registration form is valid when provided correct data,
    and that it properly creates a new user.
    """
    form_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password1": "ComplexPassword123",
        "password2": "ComplexPassword123",
    }
    form = RegistrationForm(data=form_data)
    assert form.is_valid(), form.errors
    user = form.save()
    assert user.username == "testuser"
    assert user.email == "testuser@example.com"
    # Verify the password is set correctly (hashed, so check using check_password)
    assert user.check_password("ComplexPassword123")


@pytest.mark.django_db
def test_registration_form_password_mismatch():
    """
    Test that the registration form detects mismatched passwords.
    """
    form_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password1": "ComplexPassword123",
        "password2": "DifferentPassword123",
    }
    form = RegistrationForm(data=form_data)
    assert not form.is_valid()
    assert "password2" in form.errors


@pytest.mark.django_db
def test_authentication_form():
    """
    Test the custom authentication form by creating a user and attempting
    to authenticate with the correct credentials.
    """
    # Create a user for testing authentication.
    user = User.objects.create_user(username="testuser", email="testuser@example.com", password="ComplexPassword123")
    form_data = {"username": "testuser", "password": "ComplexPassword123"}
    form = CustomAuthenticationForm(data=form_data)
    
    # The AuthenticationForm performs authentication in its clean() method.
    assert form.is_valid(), form.errors
    # After a successful clean, form.get_user() should return the authenticated user.
    authenticated_user = form.get_user()
    assert authenticated_user.pk == user.pk


@pytest.mark.django_db
def test_profile_update_form():
    """
    Test that the profile update form properly updates a user's details.
    """
    user = User.objects.create_user(username="testuser", email="testuser@example.com", password="ComplexPassword123")
    # Simulate updating the user's profile.
    form_data = {
        "username": "testuser",
        "email": "newemail@example.com",
        "first_name": "Test",
        "last_name": "User",
        "subscription_status": "premium",
    }
    form = ProfileUpdateForm(data=form_data, instance=user)
    assert form.is_valid(), form.errors
    updated_user = form.save()
    assert updated_user.email == "newemail@example.com"
    assert updated_user.first_name == "Test"
    assert updated_user.last_name == "User"
    assert updated_user.subscription_status == "premium"
