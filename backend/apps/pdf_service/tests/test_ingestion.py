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

def test_ingest_pdf(mock_pdf, tmp_path):
    """Test that PDF ingestion works correctly."""
    test_file = tmp_path / "test.pdf"
    test_file.write_bytes(b"Test PDF content")
    
    chunks, metadata = ingest_pdf(str(test_file))
    
    assert len(chunks) > 0
    assert metadata["source"] == str(test_file)
    assert metadata["pages"] == 1

# Add more tests for other methods in PdfIngestionService 