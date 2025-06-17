import pytest
from unittest.mock import MagicMock, patch
from ..ingestion import ingest_pdf

@pytest.fixture
def mock_pdf():
    with patch('pdfplumber.open') as mock_pdf:
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Test page content"
        mock_pdf.return_value.__enter__.return_value.pages = [mock_page]
        yield mock_pdf

@patch('backend.apps.pdf_service.ingestion.pymupdf4llm.to_markdown')
def test_ingest_pdf(mock_to_markdown, tmp_path):
    """Test that PDF ingestion works correctly."""
    # Arrange
    mock_to_markdown.return_value = "This is the content of the PDF."
    test_file = tmp_path / "test.pdf"
    test_file.write_bytes(b"some fake pdf content") # content doesn't matter as it's mocked

    # Act
    chunks, metadata = ingest_pdf(str(test_file))

    # Assert
    mock_to_markdown.assert_called_once_with(str(test_file))
    assert len(chunks) > 0
    assert chunks[0].content == "This is the content of the PDF."
    assert metadata["source"] == str(test_file)

# Add more tests for other methods in PdfIngestionService 