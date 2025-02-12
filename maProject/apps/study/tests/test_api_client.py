import os
import pathlib
import pytest
from maProject.apps.study.services.pdf_reader import read_pdf


def test_read_pdf_success(tmp_path, monkeypatch):
    """
    Test that read_pdf returns the expected markdown text and writes to 'output.md'.
    We simulate the behavior of pymupdf4llm.to_markdown.
    """
    # Create a temporary dummy PDF file.
    dummy_pdf = tmp_path / "dummy.pdf"
    dummy_pdf.write_text("dummy content")

    # Monkey-patch os.path.exists to return True for our dummy PDF.
    monkeypatch.setattr(os.path, "exists", lambda path: True if path == str(dummy_pdf) else False)

    # Monkey-patch pymupdf4llm.to_markdown to return a fixed markdown string.
    import pymupdf4llm
    monkeypatch.setattr(pymupdf4llm, "to_markdown", lambda path: "Markdown content for testing.")

    markdown = read_pdf(str(dummy_pdf))
    assert markdown == "Markdown content for testing."

    # Check that the file 'output.md' is created with the expected content.
    output_file = pathlib.Path("output.md")
    assert output_file.exists()
    output_text = output_file.read_text(encoding="utf-8")
    assert output_text == "Markdown content for testing."

    # Clean up the generated file.
    output_file.unlink()


def test_read_pdf_file_not_found(tmp_path):
    """
    Test that read_pdf raises a FileNotFoundError if the specified PDF does not exist.
    """
    non_existent_file = tmp_path / "nonexistent.pdf"
    with pytest.raises(FileNotFoundError):
        read_pdf(str(non_existent_file))
