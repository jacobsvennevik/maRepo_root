import pytest
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile

# Import the factories
from backend.apps.documents.models import Document, FILE_TYPE_CHOICES, STATUS_CHOICES
from .factories import DocumentFactory


@pytest.mark.django_db
def test_document_creation():
    """
    Test that a Document instance is properly created using the DocumentFactory
    with the expected default field values, including the title field.
    """
    document = DocumentFactory.create(title="Test Document")

    # ✅ Verify that the document has been saved (has a primary key)
    assert document.pk is not None

    # ✅ Ensure the user is associated
    assert document.user is not None

    # ✅ Ensure file field is set (factory should generate a dummy file)
    assert document.file is not None

    # ✅ Ensure file_type is valid and matches default 'pdf'
    assert document.file_type in dict(FILE_TYPE_CHOICES)
    assert document.file_type == 'pdf'

    # ✅ Ensure status is set to its default value ('pending')
    assert document.status in dict(STATUS_CHOICES)
    assert document.status == 'pending'

    # ✅ Ensure additional fields
    assert document.original_text == 'Sample extracted text'
    assert document.metadata == {'pages': 10}

    # ✅ Ensure auto_now_add for upload_date is working
    assert document.upload_date is not None

    # ✅ Ensure title is correctly set
    assert document.title == "Test Document"


@pytest.mark.django_db
def test_document_str_method():
    """
    Test that the __str__ method returns the expected string format, including the title.
    """
    document = DocumentFactory.create(title="Lecture Notes")
    expected_str = f"Document {document.id} - Lecture Notes uploaded by {document.user.username}"
    assert str(document) == expected_str


@pytest.mark.django_db
def test_document_status_update():
    """
    Test that the status field can be updated and saved correctly.
    """
    document = DocumentFactory.create()

    # ✅ Update the status and save
    document.status = 'completed'
    document.save()

    # ✅ Refresh from the database to ensure changes are persisted
    document.refresh_from_db()
    assert document.status == 'completed'


@pytest.mark.django_db
def test_document_title_update():
    """
    Test that the title field can be updated and saved correctly.
    """
    document = DocumentFactory.create(title="Initial Title")

    # ✅ Update the title and save
    document.title = "Updated Title"
    document.save()

    # ✅ Refresh from the database to ensure changes are persisted
    document.refresh_from_db()
    assert document.title == "Updated Title"


@pytest.mark.django_db
def test_document_original_text_update():
    """
    Test that the extracted original_text field can be updated.
    """
    document = DocumentFactory.create(original_text="Initial extracted text")

    # ✅ Simulate text extraction and update
    document.original_text = "Updated extracted text"
    document.save()

    # ✅ Refresh from the database to ensure changes are persisted
    document.refresh_from_db()
    assert document.original_text == "Updated extracted text"


@pytest.mark.django_db
def test_document_metadata_update():
    """
    Test that the metadata field (JSON) can be updated correctly.
    """
    document = DocumentFactory.create(metadata={'pages': 10})

    # ✅ Update the metadata (e.g., add word count)
    document.metadata = {'pages': 10, 'word_count': 2500}
    document.save()

    # ✅ Refresh from the database to ensure changes are persisted
    document.refresh_from_db()
    assert document.metadata == {'pages': 10, 'word_count': 2500}
