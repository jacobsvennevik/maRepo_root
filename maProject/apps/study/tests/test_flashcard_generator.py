#this is where the pyTest discover error happens
# tests/test_flashcard_generator.py
import csv
import pytest
from maProject.apps.study.services.flashcard_generator import (
    parse_flashcards,
    export_to_csv,
    get_auto_output_filename,
)

def test_parse_flashcards_empty_content():
    """Test that parse_flashcards returns an empty list for empty content."""
    content = ""
    flashcards = parse_flashcards(content)
    assert flashcards == []

def test_parse_flashcards_single_flashcard():
    """Test that parse_flashcards returns a single flashcard for simple content."""
    # Corrected content with the expected markers.
    content = "Front: What is AI? Back: Artificial Intelligence"
    flashcards = parse_flashcards(content)
    # The function returns a list of tuples.
    assert len(flashcards) == 1
    front, back = flashcards[0]
    assert front == "What is AI?"
    assert back == "Artificial Intelligence"

def test_parse_flashcards_multiple_flashcards():
    """Test that parse_flashcards returns multiple flashcards for complex content."""
    # Corrected content with proper markers for multiple flashcards.
    content = (
        "Front: What is AI? Back: Artificial Intelligence\n"
        "Front: What is ML? Back: Machine Learning"
    )
    flashcards = parse_flashcards(content)
    assert len(flashcards) == 2
    
    # First flashcard.
    first_front, first_back = flashcards[0]
    assert first_front == "What is AI?"
    assert first_back == "Artificial Intelligence"
    
    # Second flashcard.
    second_front, second_back = flashcards[1]
    assert second_front == "What is ML?"
    assert second_back == "Machine Learning"


def test_export_to_csv_empty_flashcards(tmp_path):
    """Test that export_to_csv does not raise an error for empty flashcards."""
    flashcards = []
    output_file = tmp_path / "test_empty.csv"
    export_to_csv(flashcards, str(output_file))
    assert output_file.exists()

def test_export_to_csv_single_flashcard(tmp_path):
    """Test that export_to_csv writes a single flashcard to a CSV file."""
    flashcards = [("What is AI?", "Artificial Intelligence")]
    output_file = tmp_path / "test_single.csv"
    
    export_to_csv(flashcards, str(output_file))
    
    assert output_file.exists()
    
    with open(output_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
        # There should be two rows: one header row and one data row.
        assert len(rows) == 2
        assert rows[0] == ["Front", "Back"]
        assert rows[1] == ["What is AI?", "Artificial Intelligence"]

def test_export_to_csv_multiple_flashcards(tmp_path):
    """Test that export_to_csv writes multiple flashcards to a CSV file."""
    flashcards = [
        ("What is AI?", "Artificial Intelligence"),
        ("What is ML?", "Machine Learning"),
    ]
    output_file = tmp_path / "test_multiple.csv"
    export_to_csv(flashcards, str(output_file))
    
    assert output_file.exists()
    
    with open(output_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
        # Expect 3 rows: one header row plus one row per flashcard.
        assert len(rows) == 3
        assert rows[0] == ["Front", "Back"]
        assert rows[1] == ["What is AI?", "Artificial Intelligence"]
        assert rows[2] == ["What is ML?", "Machine Learning"]



def test_get_auto_output_filename():
    """Test that get_auto_output_filename returns a timestamped filename."""
    extension = "csv"
    filename = get_auto_output_filename(extension)
    assert filename.startswith("flashcards_")
    assert filename.endswith(".csv")

