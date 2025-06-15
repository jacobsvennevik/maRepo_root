import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

# ✅ Corrected import
from backend.apps.pdf_service.django_models import FILE_TYPE_CHOICES
from backend.apps.pdf_service.forms import DocumentUploadForm

@pytest.mark.django_db
def test_document_upload_form_valid_data():
    """
    Test that the DocumentUploadForm is valid when provided a valid file,
    a valid file type, and a title.
    """
    # Create a dummy PDF file.
    dummy_pdf = SimpleUploadedFile(
        "test.pdf", b"Dummy content", content_type="application/pdf"
    )
    
    form_data = {
        "file_type": "pdf",
        "title": "My Test Document",  # ✅ Ensure title is included
        "upload_type": "course_files",  # ✅ Add the required upload_type field
    }
    form_files = {"file": dummy_pdf}
    
    form = DocumentUploadForm(data=form_data, files=form_files)
    assert form.is_valid(), form.errors
    
    # Optionally, check that form.save() creates a Document instance.
    document = form.save(commit=False)
    assert document.file_type == "pdf"
    assert document.title == "My Test Document"  # ✅ Check that title is saved
    assert document.file.name.endswith("test.pdf")

@pytest.mark.django_db
def test_document_upload_form_invalid_extension():
    """
    Test that the DocumentUploadForm is invalid if the uploaded file
    does not have an allowed extension.
    """
    # Create a dummy file with an unsupported extension.
    dummy_txt = SimpleUploadedFile(
        "test.txt", b"Dummy text content", content_type="text/plain"
    )
    
    form_data = {
        "file_type": "pdf",
        "title": "Invalid File",  # ✅ Title must still be present
    }
    form_files = {"file": dummy_txt}
    
    form = DocumentUploadForm(data=form_data, files=form_files)
    assert not form.is_valid()
    assert "file" in form.errors
    assert "Unsupported file extension." in form.errors["file"][0]

@pytest.mark.django_db
def test_document_upload_form_missing_title():
    """
    Test that the DocumentUploadForm is invalid if the title is missing.
    """
    dummy_pdf = SimpleUploadedFile(
        "test.pdf", b"Dummy content", content_type="application/pdf"
    )
    
    form_data = {
        "file_type": "pdf",
    }
    form_files = {"file": dummy_pdf}
    
    form = DocumentUploadForm(data=form_data, files=form_files)
    assert not form.is_valid()
    assert "title" in form.errors  # ✅ Ensure title validation fails
    assert "This field is required." in form.errors["title"][0]
