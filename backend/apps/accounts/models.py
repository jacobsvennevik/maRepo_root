# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser to include additional
    fields for subscription status and user preferences.
    """
    SUBSCRIPTION_CHOICES = [
        ('free', 'Free'),
        ('premium', 'Premium'),
    ]
    
    subscription_status = models.CharField(
        max_length=10,
        choices=SUBSCRIPTION_CHOICES,
        default='free'
    )
    # Using Django’s JSONField (available in Django 3.1+) for flexible preferences storage
    preferences = models.JSONField(blank=True, default=dict)

    def __str__(self):
        # Return the username as the string representation of the user
        return self.username
