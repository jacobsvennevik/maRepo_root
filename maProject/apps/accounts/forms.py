# accounts/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class RegistrationForm(UserCreationForm):
    """
    A registration form that extends Django's UserCreationForm to include an email field.
    """
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password1", "password2")
        
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class CustomAuthenticationForm(AuthenticationForm):
    """
    A custom authentication form that labels the username field as 'Username or Email'.
    """
    username = forms.CharField(label="Username or Email")


class ProfileUpdateForm(forms.ModelForm):
    """
    A profile update form allowing users to update their basic profile details.
    """
    class Meta:
        model = CustomUser
        # Update the fields as necessary.
        fields = ("username", "email", "first_name", "last_name", "subscription_status")
