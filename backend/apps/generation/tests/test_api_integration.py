"""
Integration tests for real API calls.
These tests are skipped by default to avoid hitting real APIs during CI/CD.
To run these tests, use: pytest -m "not skip_integration" or remove the skip decorators.
"""

import pytest
from backend.apps.generation.services.api_client import AIClient


@pytest.mark.skip(reason="Integration test - skipped to avoid real API calls during CI")
def test_gemini_api_integration():
    """
    Integration test for Gemini API - calls the real API.
    This test is skipped by default to avoid API costs and external dependencies.
    """
    # Arrange
    client = AIClient('gemini-2.0-flash')
    messages = [client.format_message('user', 'Say exactly: Hello from Gemini!')]
    
    # Act
    response = client.get_response(messages)
    
    # Assert
    assert response is not None
    assert len(response.strip()) > 0
    assert "Hello from Gemini" in response


@pytest.mark.skip(reason="Integration test - skipped to avoid real API calls during CI")
def test_gpt_api_integration():
    """
    Integration test for GPT API - calls the real API.
    This test is skipped by default to avoid API costs and external dependencies.
    Note: Requires valid OpenAI API key in api_client.py
    """
    # Arrange
    client = AIClient('gpt-3.5-turbo')
    messages = [client.format_message('user', 'Say exactly: Hello from GPT!')]
    
    # Act
    response = client.get_response(messages)
    
    # Assert
    assert response is not None
    assert len(response.strip()) > 0
    assert "Hello from GPT" in response


@pytest.mark.skip(reason="Integration test - skipped to avoid real API calls during CI")
def test_api_error_handling():
    """
    Integration test for API error handling with invalid model.
    This test is skipped by default.
    """
    # Arrange
    client = AIClient('invalid-model')
    messages = [client.format_message('user', 'Test message')]
    
    # Act & Assert
    with pytest.raises(ValueError, match="Unsupported AI model"):
        client.get_response(messages)


# Note: To run these integration tests, use one of these commands:
# pytest backend/apps/generation/tests/test_api_integration.py -v
# pytest backend/apps/generation/tests/test_api_integration.py::test_gemini_api_integration -s 