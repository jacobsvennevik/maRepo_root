# tests/test_api_client.py
import pytest
from maProject.apps.study.services.api_client import AIClient

def test_ai_client_init():
    """Test that the AIClient initializes correctly."""
    ai_client = AIClient(model="gemini-2.0-flash")
    assert ai_client.model == "gemini-2.0-flash"

def test_format_message():
    """Test that the format_message method returns the correct format."""
    ai_client = AIClient(model="gemini-2.0-flash")
    message = ai_client.format_message("user", "Hello, world!")
    assert message == {"role": "user", "content": "Hello, world!"}

@pytest.mark.skip(reason="Not nesescarry before real testing")
def test_get_response_gemini():
    """Test that the get_response method calls the Gemini API correctly."""
    ai_client = AIClient(model="gemini-2.0-flash")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    response = ai_client.get_response(messages)
    assert response != ""

@pytest.mark.skip(reason="Not nesescarry before real testing")
def test_get_response_gpt():
    """Test that the get_response method calls the GPT API correctly."""
    ai_client = AIClient(model="gpt-3.5-turbo")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    response = ai_client.get_response(messages)
    assert response != ""

def test_get_response_invalid_model():
    """Test that the get_response method raises an error for an invalid model."""
    ai_client = AIClient(model="invalid-model")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    with pytest.raises(ValueError):
        ai_client.get_response(messages)




