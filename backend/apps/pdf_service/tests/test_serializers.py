import os
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.apps.pdf_service.django_models import Document
from backend.apps.pdf_service.serializers import DocumentSerializer
from backend.apps.accounts.tests.factories import CustomUserFactory

@pytest.mark.django_db
def test_document_serializer_output():
    """
    Test that the DocumentSerializer correctly serializes a document instance.
    """
    user = CustomUserFactory.create()
    
    # Create a dummy file instance
    file_content = b"Dummy PDF content for serialization test."
    uploaded_file = SimpleUploadedFile("serialized_test.pdf", file_content, content_type="application/pdf")
    
    # Create a Document instance
    document = Document.objects.create(
        user=user,
        file=uploaded_file,
        file_type="pdf",
        title="Serialized Document"
    )
    
    serializer = DocumentSerializer(document)
    data = serializer.data
    
    # Verify that basic fields are correctly serialized.
    assert data["id"] == document.id
    assert data["title"] == document.title
    assert data["file_type"] == document.file_type
    # Depending on your implementation, you might verify additional fields (e.g., status, original_text)
    
    # Optionally, verify that the serialized file URL exists if you expose it.
    assert "file" in data

@pytest.mark.django_db
def test_document_serializer_validation():
    """
    Test serializer validation when required fields are missing.
    """
    serializer = DocumentSerializer(data={
        "file_type": "pdf",
        # Both title and file are missing in this case.
    })
    assert not serializer.is_valid()
    # Expect an error for the missing file field.
    assert "file" in serializer.errors
