# accounts/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class RegistrationForm(UserCreationForm):
    """
    A registration form that uses email as the primary identifier.
    """
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'you@example.com'})
    )

    class Meta:
        model = CustomUser
        fields = ("email", "password1", "password2")
        
    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user


class CustomAuthenticationForm(AuthenticationForm):
    """
    A custom authentication form that uses email for login.
    """
    username = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={'placeholder': 'you@example.com'})
    )


class ProfileUpdateForm(forms.ModelForm):
    """
    A profile update form allowing users to update their basic profile details.
    """
    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "last_name", "subscription_status")

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and CustomUser.objects.filter(email=email).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError('A user with that email already exists.')
        return email
