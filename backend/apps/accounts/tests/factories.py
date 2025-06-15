# accounts/tests/factories.py

import factory
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password123')
    subscription_status = 'free'
    preferences = {}
    is_active = True
