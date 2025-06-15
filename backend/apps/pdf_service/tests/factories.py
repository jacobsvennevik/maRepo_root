# tests/factories.py

import factory
from factory.django import DjangoModelFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.apps.pdf_service.django_models import Document
from backend.apps.accounts.tests.factories import CustomUserFactory
from django.contrib.auth import get_user_model

User = get_user_model()  # This will reference your custom user model



class DocumentFactory(DjangoModelFactory):
    class Meta:
        model = Document

    user = factory.SubFactory(CustomUserFactory)
    file = SimpleUploadedFile("dummy.pdf", b"Test content", content_type="application/pdf")
    file_type = "pdf"
    status = "pending"
    original_text = "Sample extracted text"
    metadata = {"pages": 10}
    title = "Generated Title"
