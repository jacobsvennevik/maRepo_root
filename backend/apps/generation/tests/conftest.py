# conftest.py or tests/conftest.py

import pytest
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.generation.models import Flashcard
from backend.apps.generation.tests.factories import FlashcardSetFactory

@pytest.fixture
def auth_client_with_flashcard_permission():
    # ... fixture code ...

    client = APIClient()
    user = CustomUserFactory.create()
    flashcard_set = FlashcardSetFactory(owner=user)

    # Assign the 'add_flashcard' permission to the test user
    content_type = ContentType.objects.get_for_model(Flashcard)
    add_permission = Permission.objects.get(codename='add_flashcard', content_type=content_type)
    user.user_permissions.add(add_permission)
    user.save()

    client.force_authenticate(user=user)
    return client, user, flashcard_set
