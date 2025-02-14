# documents/tests/test_models.py

import pytest
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile

# Import the factories
from .factories import DocumentFactory
from maProject.apps.documents.models import Document, FILE_TYPE_CHOICES, STATUS_CHOICES


@pytest.mark.django_db
def test_document_creation():
    """
    Test that a Document instance is properly created using the DocumentFactory
    with the expected default field values.
    """
    document = DocumentFactory.create()

    # Check that the document has been saved (has a primary key)
    assert document.pk is not None

    # Verify the user is associated
    assert document.user is not None

    # Verify file field is set (the factory uses a dummy file)
    assert document.file is not None

    # Verify file_type is one of the allowed choices and matches the default 'pdf'
    allowed_file_types = [choice[0] for choice in FILE_TYPE_CHOICES]
    assert document.file_type in allowed_file_types
    assert document.file_type == 'pdf'

    # Verify status is set to its default value
    allowed_statuses = [choice[0] for choice in STATUS_CHOICES]
    assert document.status in allowed_statuses
    assert document.status == 'pending'

    # Verify additional fields
    assert document.original_text == 'Sample extracted text'
    assert document.metadata == {'pages': 10}

    # Verify auto_now_add for upload_date is set
    assert document.upload_date is not None


@pytest.mark.django_db
def test_document_str_method():
    """
    Test that the __str__ method returns the expected string format.
    """
    document = DocumentFactory.create()
    expected_str = f"Document {document.id} uploaded by {document.user.username}"
    assert str(document) == expected_str


@pytest.mark.django_db
def test_document_status_update():
    """
    Test that the status field can be updated and saved correctly.
    """
    document = DocumentFactory.create()
    # Update the status to a new valid choice
    document.status = 'completed'
    document.save()

    # Refresh from database to ensure changes are persisted
    document.refresh_from_db()
    assert document.status == 'completed'