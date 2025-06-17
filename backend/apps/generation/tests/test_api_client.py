# tests/test_api_client.py
import pytest
from unittest.mock import patch, MagicMock
from backend.apps.generation.services.api_client import AIClient

def test_ai_client_init():
    """Test that the AIClient initializes correctly."""
    ai_client = AIClient(model="gemini-2.0-flash")
    assert ai_client.model == "gemini-2.0-flash"

def test_format_message():
    """Test that the format_message method returns the correct format."""
    ai_client = AIClient(model="gemini-2.0-flash")
    message = ai_client.format_message("user", "Hello, world!")
    assert message == {"role": "user", "content": "Hello, world!"}

@patch('google.generativeai.GenerativeModel')
def test_get_response_gemini(mock_genai_model):
    """Test that the get_response method calls the Gemini API correctly."""
    # Mock the response
    mock_chat = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "AI is a field of computer science..."
    mock_chat.send_message.return_value = mock_response
    mock_genai_model.return_value.start_chat.return_value = mock_chat
    
    ai_client = AIClient(model="gemini-2.0-flash")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    response = ai_client.get_response(messages)
    
    assert response == "AI is a field of computer science..."
    mock_genai_model.assert_called_once_with("gemini-2.0-flash")
    mock_chat.send_message.assert_called_once_with("Explain how AI works.")

@patch('backend.apps.generation.services.api_client.openai_client')
def test_get_response_gpt(mock_openai_client):
    """Test that the get_response method calls the GPT API correctly."""
    # Mock the response
    mock_completion = MagicMock()
    mock_completion.choices[0].message.content = "AI is a field of computer science..."
    mock_openai_client.chat.completions.create.return_value = mock_completion
    
    ai_client = AIClient(model="gpt-3.5-turbo")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    response = ai_client.get_response(messages)
    
    assert response == "AI is a field of computer science..."
    mock_openai_client.chat.completions.create.assert_called_once_with(
        model="gpt-3.5-turbo",
        messages=messages,
    )

def test_get_response_invalid_model():
    """Test that the get_response method raises an error for an invalid model."""
    ai_client = AIClient(model="invalid-model")
    messages = [ai_client.format_message("user", "Explain how AI works.")]
    with pytest.raises(ValueError):
        ai_client.get_response(messages)

@patch('google.generativeai.GenerativeModel')
def test_gemini_api_error_handling(mock_genai_model):
    """Test that Gemini API errors are handled gracefully."""
    mock_genai_model.return_value.start_chat.side_effect = Exception("API Error")
    
    ai_client = AIClient(model="gemini-2.0-flash")
    messages = [ai_client.format_message("user", "Test prompt")]
    response = ai_client.get_response(messages)
    
    assert response == ""  # Should return empty string on error

@patch('backend.apps.generation.services.api_client.openai_client')
def test_gpt_api_error_handling(mock_openai_client):
    """Test that GPT API errors are handled gracefully."""
    mock_openai_client.chat.completions.create.side_effect = Exception("API Error")
    
    ai_client = AIClient(model="gpt-3.5-turbo")
    messages = [ai_client.format_message("user", "Test prompt")]
    response = ai_client.get_response(messages)
    
    assert response == ""  # Should return empty string on error




