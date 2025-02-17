import os
import pathlib
import csv
import pytest
from backend.apps.documents.services.pdf_reader import read_pdf
from .factories import DocumentFactory

# Remove any custom definition of tmp_path; use the built-in fixture.
def test_read_pdf_file_exists(db, tmp_path, monkeypatch):
    """
    Test that read_pdf extracts text from an existing PDF.
    """
    expected_md = "Markdown content for testing."
    monkeypatch.setattr(
        "backend.apps.documents.services.pdf_reader.pymupdf4llm.to_markdown",
        lambda _: expected_md
    )

    # Create a Document instance using the factory
    doc = DocumentFactory.create()
    
    # Call read_pdf with the document ID
    md_text = read_pdf(doc.id)

    assert md_text == expected_md
    doc.refresh_from_db()
    assert doc.original_text == expected_md
    
@pytest.mark.django_db
def test_read_pdf_file_not_exists(tmp_path):
    """
    Test that read_pdf raises FileNotFoundError when the document file is missing.
    """
    # Create a Document instance using the factory
    doc = DocumentFactory.create()
    
    # Obtain the file path before deleting the file.
    file_path = doc.file.path
    
    # Delete the file from storage; note that this does not clear doc.file.name.
    doc.file.delete(save=False)
    doc.refresh_from_db()  # Reload the instance from the DB

    # Verify that the file no longer exists in the filesystem.
    assert not os.path.exists(file_path), f"File still exists at {file_path}"

    # Ensure that read_pdf() raises the expected FileNotFoundError.
    with pytest.raises(FileNotFoundError):
        read_pdf(doc.id)
def test_read_pdf_output_file(db, tmp_path, monkeypatch):
    """
    Test that read_pdf correctly updates the Document model.
    """
    expected_md = "Markdown content for testing."
    monkeypatch.setattr(
        "backend.apps.documents.services.pdf_reader.pymupdf4llm.to_markdown",
        lambda _: expected_md
    )

    doc = DocumentFactory.create()
    
    read_pdf(doc.id)

    doc.refresh_from_db()
    assert doc.original_text == expected_md
@pytest.mark.django_db
def test_read_pdf_empty_file(monkeypatch):
    """
    Test that read_pdf returns an empty string for an empty PDF file.
    """
    doc = DocumentFactory.create()
    
    # Simulate an empty PDF
    monkeypatch.setattr(
        "backend.apps.documents.services.pdf_reader.pymupdf4llm.to_markdown",
        lambda _: ''
    )

    md_text = read_pdf(doc.id)
    assert md_text == ''