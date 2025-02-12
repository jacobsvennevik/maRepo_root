import os
import csv
import tempfile
from unittest.mock import patch, MagicMock

import pytest

# Import the functions/variables under test
from maProject.apps.study.services.flashcard_generator import (
    parse_flashcards,
    export_to_csv,
    get_auto_output_filename,
    generate_flashcards,
    MODEL,
)

def test_parse_flashcards():
    """
    Verify that the flashcards parser correctly extracts the front and back text.
    """
    # Sample AI response with two flashcards
    input_text = (
        "Front: What is Python? Back: A popular programming language.\n"
        "Front: What is Django? Back: A high-level Python web framework."
    )
    expected = [
        ("What is Python?", "A popular programming language."),
        ("What is Django?", "A high-level Python web framework."),
    ]
    result = parse_flashcards(input_text)
    assert result == expected

def test_export_to_csv():
    """
    Verify that export_to_csv writes the flashcards to a CSV file correctly.
    """
    flashcards = [("Question 1", "Answer 1"), ("Question 2", "Answer 2")]
    # Create a temporary file for CSV output
    with tempfile.NamedTemporaryFile(delete=False, mode='w+', newline='', encoding='utf-8') as tmp_file:
        filename = tmp_file.name
    try:
        export_to_csv(flashcards, filename)
        # Read the CSV file and check its contents
        with open(filename, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            rows = list(reader)
            # Verify header row and each flashcard row
            assert rows[0] == ['Front', 'Back']
            assert rows[1] == ["Question 1", "Answer 1"]
            assert rows[2] == ["Question 2", "Answer 2"]
    finally:
        os.remove(filename)

def test_get_auto_output_filename():
    """
    Verify that the generated filename follows the expected pattern.
    """
    filename = get_auto_output_filename("csv")
    assert filename.startswith("flashcards_")
    assert filename.endswith(".csv")

@patch("maProject.apps.study.services.flashcard_generator.AIClient")
def test_generate_flashcards(mock_ai_client):
    """
    Test the generate_flashcards function by mocking the AIClient.
    """
    # Create a dummy AIClient instance
    mock_instance = MagicMock()
    # Define a dummy response string that would be returned by the AI
    dummy_response = "Front: What is AI? Back: Artificial Intelligence."
    mock_instance.get_response.return_value = dummy_response
    mock_ai_client.return_value = mock_instance

    # Call generate_flashcards using dummy text and the MODEL constant
    result = generate_flashcards("dummy input text", MODEL)

    # Expected result after parsing dummy_response
    expected = [("What is AI?", "Artificial Intelligence.")]
    assert result == expected
