# File: backend/apps/generation/tests/test_mindmap_generator.py

import pytest
from backend.apps.generation.services.mindmap_generator import generate_mindmap
from unittest.mock import patch

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
