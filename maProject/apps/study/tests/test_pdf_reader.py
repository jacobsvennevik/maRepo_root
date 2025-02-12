import pytest
from maProject.apps.study.services.api_client import AIClient


def test_format_message():
    """Test that format_message returns the expected dictionary structure."""
    ai_client = AIClient(model="gemini-2.0-flash")
    message = ai_client.format_message("user", "Hello, AI!")
    assert isinstance(message, dict)
    assert message["role"] == "user"
    assert message["content"] == "Hello, AI!"


def test_get_response_invalid_model():
    """
    Test that get_response raises a ValueError when an unsupported model is provided.
    """
    ai_client = AIClient(model="unsupported-model")
    with pytest.raises(ValueError):
        ai_client.get_response([ai_client.format_message("user", "Test")])
