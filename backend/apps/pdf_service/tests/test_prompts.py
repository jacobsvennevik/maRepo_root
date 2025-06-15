import pytest
from unittest.mock import patch, mock_open
from ..prompts import _load_prompt, SYLLABUS_EXTRACTOR_PROMPT

def test_load_prompt():
    """Test that the prompt loading function works correctly."""
    test_prompt = "This is a test prompt"
    mock_file = mock_open(read_data=test_prompt)
    
    with patch('builtins.open', mock_file):
        loaded_prompt = _load_prompt('test.txt')
    
    assert loaded_prompt == test_prompt

def test_syllabus_extractor_prompt():
    """Test that the syllabus extractor prompt is loaded."""
    assert SYLLABUS_EXTRACTOR_PROMPT is not None
    assert isinstance(SYLLABUS_EXTRACTOR_PROMPT, str)
    assert len(SYLLABUS_EXTRACTOR_PROMPT) > 0 