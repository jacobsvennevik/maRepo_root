# File: backend/apps/generation/tests/test_mindmap_generator.py

import pytest
from backend.apps.generation.services.mindmap_generator import generate_mindmap
from unittest.mock import patch, MagicMock
import json

@pytest.mark.django_db
def test_generate_mindmap_valid(mocker):
    """
    Test that generate_mindmap returns a valid dictionary when the AI response is valid JSON.
    """
    valid_json = '{"root": {"name": "Test", "children": [{"name": "Child1"}]}}'
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=valid_json
    )
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")

    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data
    assert mindmap_data["root"]["name"] == "Test"
    assert isinstance(mindmap_data["root"].get("children"), list)

@pytest.mark.django_db
def test_generate_mindmap_invalid_json(mocker):
    """
    Test that generate_mindmap returns an empty dictionary if the AI response is invalid JSON.
    """
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value="Invalid JSON"
    )
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    # Expect an empty dict on JSONDecodeError.
    assert mindmap_data == {}

@pytest.mark.django_db
def test_generate_mindmap_empty_response(mocker):
    """
    Test that generate_mindmap handles empty AI responses gracefully.
    """
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=""
    )
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert mindmap_data == {}

@pytest.mark.django_db
def test_generate_mindmap_none_response(mocker):
    """
    Test that generate_mindmap handles None AI responses gracefully.
    """
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=None
    )
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert mindmap_data == {}

@pytest.mark.django_db
def test_generate_mindmap_complex_structure(mocker):
    """
    Test that generate_mindmap handles complex mindmap structures with multiple levels.
    """
    complex_json = '''
    {
        "root": {
            "name": "Artificial Intelligence",
            "description": "The field of computer science",
            "children": [
                {
                    "name": "Machine Learning",
                    "description": "Subset of AI",
                    "children": [
                        {"name": "Supervised Learning"},
                        {"name": "Unsupervised Learning"},
                        {"name": "Reinforcement Learning"}
                    ]
                },
                {
                    "name": "Natural Language Processing",
                    "description": "Language understanding",
                    "children": [
                        {"name": "Text Analysis"},
                        {"name": "Language Generation"}
                    ]
                }
            ]
        }
    }
    '''
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=complex_json
    )
    mindmap_data = generate_mindmap("Text about AI and its subfields", model="gemini-2.0-mindmap")
    
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data
    assert mindmap_data["root"]["name"] == "Artificial Intelligence"
    assert mindmap_data["root"]["description"] == "The field of computer science"
    assert len(mindmap_data["root"]["children"]) == 2
    
    # Check first child
    ml_child = mindmap_data["root"]["children"][0]
    assert ml_child["name"] == "Machine Learning"
    assert len(ml_child["children"]) == 3
    
    # Check second child
    nlp_child = mindmap_data["root"]["children"][1]
    assert nlp_child["name"] == "Natural Language Processing"
    assert len(nlp_child["children"]) == 2

@pytest.mark.django_db
def test_generate_mindmap_malformed_json(mocker):
    """
    Test that generate_mindmap handles malformed JSON responses gracefully.
    """
    malformed_json = '{"root": {"name": "Test", "children": [{"name": "Child1"}]'  # Missing closing brace
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=malformed_json
    )
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert mindmap_data == {}

@pytest.mark.django_db
def test_generate_mindmap_ai_client_error(mocker):
    """
    Test that generate_mindmap handles AI client errors gracefully.
    """
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        side_effect=Exception("AI Client Error")
    )
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert mindmap_data == {}

@pytest.mark.django_db
def test_generate_mindmap_different_models(mocker):
    """
    Test that generate_mindmap works with different AI models.
    """
    valid_json = '{"root": {"name": "Test", "children": []}}'
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=valid_json
    )
    
    # Test with different model names
    models = ["gemini-2.0-mindmap", "gpt-4", "claude-3"]
    for model in models:
        mindmap_data = generate_mindmap("Some text about a topic", model=model)
        assert isinstance(mindmap_data, dict)
        assert "root" in mindmap_data

@pytest.mark.django_db
def test_generate_mindmap_empty_document_text():
    """
    Test that generate_mindmap handles empty document text gracefully.
    """
    with patch("backend.apps.generation.services.mindmap_generator.AIClient.get_response") as mock_get_response:
        mock_get_response.return_value = '{"root": {"name": "Empty", "children": []}}'
        
        mindmap_data = generate_mindmap("", model="gemini-2.0-mindmap")
        assert isinstance(mindmap_data, dict)
        assert "root" in mindmap_data

@pytest.mark.django_db
def test_generate_mindmap_very_long_document_text(mocker):
    """
    Test that generate_mindmap handles very long document text.
    """
    long_text = "This is a very long document text. " * 1000  # Create a long text
    valid_json = '{"root": {"name": "Long Document", "children": []}}'
    
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=valid_json
    )
    
    mindmap_data = generate_mindmap(long_text, model="gemini-2.0-mindmap")
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data

@pytest.mark.django_db
def test_generate_mindmap_special_characters(mocker):
    """
    Test that generate_mindmap handles special characters in document text.
    """
    special_text = "Text with special chars: éñüß@#$%^&*()_+-=[]{}|;':\",./<>?"
    valid_json = '{"root": {"name": "Special Chars", "children": []}}'
    
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=valid_json
    )
    
    mindmap_data = generate_mindmap(special_text, model="gemini-2.0-mindmap")
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data

@pytest.mark.django_db
def test_generate_mindmap_unicode_text(mocker):
    """
    Test that generate_mindmap handles unicode text properly.
    """
    unicode_text = "Text with unicode: 🚀🌟🎉中文日本語한국어"
    valid_json = '{"root": {"name": "Unicode Text", "children": []}}'
    
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=valid_json
    )
    
    mindmap_data = generate_mindmap(unicode_text, model="gemini-2.0-mindmap")
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data

@pytest.mark.django_db
def test_generate_mindmap_ai_response_with_extra_fields(mocker):
    """
    Test that generate_mindmap handles AI responses with extra fields beyond the expected structure.
    """
    json_with_extra = '''
    {
        "root": {
            "name": "Test Topic",
            "children": [],
            "extra_field": "should be ignored",
            "metadata": {"version": "1.0", "timestamp": "2024-01-01"}
        },
        "version": "1.0",
        "generated_at": "2024-01-01T00:00:00Z"
    }
    '''
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=json_with_extra
    )
    
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data
    assert mindmap_data["root"]["name"] == "Test Topic"
    # Extra fields should be preserved as they might be useful
    assert "extra_field" in mindmap_data["root"]
    assert "version" in mindmap_data

@pytest.mark.django_db
def test_generate_mindmap_ai_response_missing_root(mocker):
    """
    Test that generate_mindmap handles AI responses that don't have a root node.
    """
    json_without_root = '{"topic": "Test", "children": []}'
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=json_without_root
    )
    
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    # Should still return the data even if it doesn't have the expected structure
    assert isinstance(mindmap_data, dict)
    assert "topic" in mindmap_data
    assert mindmap_data["topic"] == "Test"

@pytest.mark.django_db
def test_generate_mindmap_ai_response_empty_children(mocker):
    """
    Test that generate_mindmap handles AI responses with empty children arrays.
    """
    json_empty_children = '{"root": {"name": "Test Topic", "children": []}}'
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=json_empty_children
    )
    
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data
    assert mindmap_data["root"]["name"] == "Test Topic"
    assert mindmap_data["root"]["children"] == []

@pytest.mark.django_db
def test_generate_mindmap_ai_response_null_values(mocker):
    """
    Test that generate_mindmap handles AI responses with null values.
    """
    json_with_nulls = '{"root": {"name": null, "children": null}}'
    mocker.patch(
        "backend.apps.generation.services.mindmap_generator.AIClient.get_response",
        return_value=json_with_nulls
    )
    
    mindmap_data = generate_mindmap("Some text about a topic", model="gemini-2.0-mindmap")
    assert isinstance(mindmap_data, dict)
    assert "root" in mindmap_data
    assert mindmap_data["root"]["name"] is None
    assert mindmap_data["root"]["children"] is None
