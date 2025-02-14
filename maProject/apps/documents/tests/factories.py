# tests/factories.py

import factory
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from maProject.apps.documents.models import Document
from django.contrib.auth import get_user_model

User = get_user_model()  # This will reference your custom user model

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User  # Now uses accounts.CustomUser

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password123')



class DocumentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Document

    user = factory.SubFactory(UserFactory)
    file = SimpleUploadedFile("dummy.pdf", b"Test content", content_type="application/pdf")
    file_type = "pdf"
    status = "pending"
    original_text = "Sample extracted text"
    metadata = {"pages": 10}
    title = "Generated Title"
