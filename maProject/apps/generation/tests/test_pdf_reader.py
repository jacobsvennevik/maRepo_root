import os
import pathlib
import csv
import pytest
from maProject.apps.generation.services.pdf_reader import read_pdf

# Remove any custom definition of tmp_path; use the built-in fixture.

def test_read_pdf_file_exists(tmp_path, monkeypatch):
    """
    Test that read_pdf returns Markdown text when the file exists.
    We monkey-patch pymupdf4llm.to_markdown to return known content.
    """
    # Create a fake PDF file.
    pdf_path = tmp_path / 'test.pdf'
    pdf_path.write_text('Test PDF content', encoding='utf-8')

    # Monkey-patch the conversion function to return a known Markdown string.
    expected_md = "Markdown content for testing."
    monkeypatch.setattr(
        "maProject.apps.generation.services.pdf_reader.pymupdf4llm.to_markdown",
        lambda path: expected_md
    )

    # Call read_pdf (passing str(pdf_path) to match os.path.exists usage).
    md_text = read_pdf(str(pdf_path))
    assert md_text == expected_md

def test_read_pdf_file_not_exists():
    """
    Test that read_pdf raises FileNotFoundError for a non-existent PDF file.
    """
    pdf_path = 'non_existent_pdf.pdf'
    with pytest.raises(FileNotFoundError):
        read_pdf(pdf_path)

def test_read_pdf_output_file(tmp_path, monkeypatch):
    """
    Test that read_pdf saves the Markdown text to an output file.
    """
    # Create a fake PDF file.
    pdf_path = tmp_path / 'test.pdf'
    pdf_path.write_text('Test PDF content', encoding='utf-8')

    # Monkey-patch the conversion function.
    expected_md = "Markdown content for testing."
    monkeypatch.setattr(
        "maProject.apps.generation.services.pdf_reader.pymupdf4llm.to_markdown",
        lambda path: expected_md
    )

    # Call read_pdf.
    read_pdf(str(pdf_path))

    # The function writes the output to "output.md" in the current working directory.
    output_file = pathlib.Path("output.md")
    try:
        assert output_file.exists()
        # Optionally, check that the content is as expected.
        content = output_file.read_text(encoding="utf-8")
        assert content == expected_md
    finally:
        # Clean up the output file.
        if output_file.exists():
            output_file.unlink()

def test_read_pdf_empty_file(tmp_path, monkeypatch):
    """
    Test that read_pdf returns an empty string for an empty PDF file.
    """
    # Create an empty fake PDF file.
    pdf_path = tmp_path / 'empty_test.pdf'
    pdf_path.write_text('', encoding='utf-8')

    # Monkey-patch the conversion function to return an empty string.
    monkeypatch.setattr(
        "maProject.apps.generation.services.pdf_reader.pymupdf4llm.to_markdown",
        lambda path: ''
    )

    md_text = read_pdf(str(pdf_path))
    assert md_text == ''
