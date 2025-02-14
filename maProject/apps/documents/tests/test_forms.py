import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from maProject.apps.documents.forms import DocumentUploadForm
from maProject.apps.documents.models import FILE_TYPE_CHOICES

@pytest.mark.django_db
def test_document_upload_form_valid_data():
    """
    Test that the DocumentUploadForm is valid when provided a valid file
    with an allowed extension.
    """
    # Create a dummy PDF file.
    dummy_pdf = SimpleUploadedFile(
        "test.pdf", b"Dummy content", content_type="application/pdf"
    )
    
    form_data = {
        "file_type": "pdf",
    }
    form_files = {"file": dummy_pdf}
    
    form = DocumentUploadForm(data=form_data, files=form_files)
    assert form.is_valid(), form.errors
    
    # Optionally, you can also test that form.save() creates a Document instance.
    document = form.save(commit=False)
    assert document.file_type == "pdf"
    # file field will contain a FieldFile object that wraps our uploaded file.
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
        "file_type": "pdf",  # even if file_type is set, we validate the file's extension
    }
    form_files = {"file": dummy_txt}
    
    form = DocumentUploadForm(data=form_data, files=form_files)
    assert not form.is_valid()
    assert "file" in form.errors
    assert "Unsupported file extension." in form.errors["file"][0]
