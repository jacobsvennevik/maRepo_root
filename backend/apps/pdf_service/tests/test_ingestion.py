import pytest
from unittest.mock import MagicMock, patch
from ..ingestion import ingest_pdf

@pytest.fixture
def mock_pymupdf4llm():
    with patch('pymupdf4llm.to_markdown') as mock_to_markdown:
        mock_to_markdown.return_value = "Test page content"
        yield mock_to_markdown

def test_ingest_pdf(mock_pymupdf4llm, tmp_path):
    """Test that PDF ingestion works correctly with pymupdf4llm."""
    test_file = tmp_path / "test.pdf"
    test_file.write_bytes(b"Test PDF content")
    
    chunks, metadata = ingest_pdf(str(test_file))
    
    mock_pymupdf4llm.assert_called_once_with(file_path=str(test_file))
    assert len(chunks) > 0
    assert chunks[0] == "Test page content"
    assert metadata["source"] == str(test_file)

# Add more tests for other methods in PdfIngestionService 