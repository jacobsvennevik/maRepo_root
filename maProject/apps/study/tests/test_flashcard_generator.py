import re
import csv
import os
import tempfile
import pytest

from maProject.apps.study.services.flashcard_generator import (
    parse_flashcards,
    export_to_csv,
    get_auto_output_filename,
    generate_flashcards,
)
from maProject.apps.study.services.api_client import AIClient


def test_parse_flashcards():
    """Test that flashcards are correctly parsed from a string."""
    content = (
        "Front: What is AI? Back: Artificial Intelligence\n"
        "Front: Define ML. Back: Machine Learning"
    )
    expected = [
        ("What is AI?", "Artificial Intelligence"),
        ("Define ML.", "Machine Learning"),
    ]
    flashcards = parse_flashcards(content)
    assert flashcards == expected


def test_export_to_csv(tmp_path):
    """Test that flashcards are correctly exported to a CSV file."""
    flashcards = [("Question 1", "Answer 1"), ("Question 2", "Answer 2")]
    output_file = tmp_path / "test_flashcards.csv"
    export_to_csv(flashcards, output_file)

    # Read back the CSV file and verify its content.
    with open(output_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    # The first row should be the header.
    assert rows[0] == ["Front", "Back"]
    # Verify that each flashcard row is written correctly.
    assert rows[1] == ["Question 1", "Answer 1"]
    assert rows[2] == ["Question 2", "Answer 2"]


def test_get_auto_output_filename():
    """Test that the auto-generated filename matches the expected format."""
    extension = "csv"
    filename = get_auto_output_filename(extension)
    assert filename.startswith("flashcards_")
    assert filename.endswith(".csv")
    # Use regex to check that the filename contains a valid timestamp.
    pattern = r"flashcards_\d{8}_\d{6}\.csv"
    assert re.match(pattern, filename)


def test_generate_flashcards(monkeypatch):
    """
    Test that generate_flashcards uses the AIClient correctly and returns
    parsed flashcards. We monkey-patch AIClient.get_response to simulate
    an API response.
    """
    def fake_get_response(self, messages):
        # Return a fixed response in the expected flashcard format.
        return (
            "Front: What is testing? Back: Testing is verifying code.\n"
            "Front: Define unit test. Back: A test that checks a small unit of code."
        )

    # Replace the real get_response with our fake version.
    monkeypatch.setattr(AIClient, "get_response", fake_get_response)

    user_text = "Some sample text for flashcard generation."
    flashcards = generate_flashcards(user_text, "gemini-2.0-flash")
    expected = [
        ("What is testing?", "Testing is verifying code."),
        ("Define unit test.", "A test that checks a small unit of code."),
    ]
    assert flashcards == expected
