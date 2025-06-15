import pytest
from unittest.mock import MagicMock, patch
from ..classification import classify_syllabus

@pytest.fixture
def mock_openai_client():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "course_title": "Test Course",
        "education_level": "Bachelor",
        "exam_dates": [
            {"date": "2024-12-01", "description": "Final Exam"}
        ],
        "instructor": "Dr. Test",
        "topics": ["Topic 1", "Topic 2"]
    }
    '''
    mock_client.invoke.return_value = mock_response
    return mock_client

@pytest.fixture(autouse=True)
def mock_env_vars():
    with patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'}):
        yield

@patch('backend.apps.pdf_service.classification.ChatOpenAI')
def test_classify_syllabus(mock_chat_openai, mock_openai_client):
    """Test that the syllabus classification function works correctly."""
    mock_chat_openai.return_value = mock_openai_client
    test_text = "This is a test syllabus"
    result = classify_syllabus(test_text)
    assert result is not None
    assert result.course_title == "Test Course"
    assert result.education_level == "Bachelor"
    assert len(result.exam_dates) == 1
    assert result.instructor == "Dr. Test"
    assert len(result.topics) == 2

@patch('backend.apps.pdf_service.classification.ChatOpenAI')
def test_classify_document(mock_chat_openai, mock_openai_client):
    """Test the document classification function."""
    mock_chat_openai.return_value = mock_openai_client
    text_to_classify = "This is a test document."
    result = classify_syllabus(text_to_classify)
    assert result is not None
    assert result.course_title == "Test Course"

def test_classify_document_invalid_json(mock_openai_client):
    """Test handling of invalid JSON response."""
    mock_openai_client.invoke.return_value.content = "invalid json"
    with patch('backend.apps.pdf_service.classification.ChatOpenAI', return_value=mock_openai_client):
        result = classify_syllabus("test text")
        assert result is None 