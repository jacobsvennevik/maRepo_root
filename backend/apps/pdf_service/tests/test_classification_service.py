# backend/apps/pdf_service/tests/test_classification_service.py
import pytest
from unittest.mock import MagicMock
from backend.apps.pdf_service.constants import DocumentType
from backend.apps.pdf_service.services.classification_service import DocumentClassifierService

# A mock AI client that can be used in tests
class MockAIClient:
    def __init__(self, response_text):
        self.response_text = response_text

    def get_response(self, messages):
        return self.response_text

    def format_message(self, role, content):
        return {"role": role, "content": content}

@pytest.mark.parametrize("input_text, mock_response, expected_type", [
    ("This is a syllabus for CS101", "syllabus", DocumentType.SYLLABUS),
    ("Midterm Exam, October 25th", "exam", DocumentType.EXAM),
    ("My notes on cellular biology", "note", DocumentType.NOTE),
    ("Some random text here", "unknown", DocumentType.UNKNOWN),
    ("Some unexpected response", "other", DocumentType.UNKNOWN), # Test fallback
])
def test_classify(input_text, mock_response, expected_type):
    # Arrange
    mock_client = MockAIClient(response_text=mock_response)
    classifier = DocumentClassifierService(client=mock_client)

    # Act
    result = classifier.classify(input_text)

    # Assert
    assert result == expected_type 