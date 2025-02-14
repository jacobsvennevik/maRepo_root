# accounts/tests/factories.py

import factory
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User  # This will reference your custom user model

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    # The password is set using the provided post-generation hook so that
    # the .set_password() method is used (ensuring proper hashing)
    password = factory.PostGenerationMethodCall('set_password', 'password123')
    subscription_status = 'free'  # Default value for testing
    preferences = {}  # Default empty dict for JSONField
