# tests/test_flashcard_generator.py
import os
import csv
import pytest
from maProject.apps.study.services.flashcard_generator import (
    parse_flashcards,
    export_to_csv,
    get_auto_output_filename,
    generate_flashcards,
)

def test_parse_flashcards_empty_content():
    """Test that parse_flashcards returns an empty list for empty content."""
    content = ""
    flashcards = parse_flashcards(content)
    assert flashcards == []

def test_parse_flashcards_single_flashcard():
    """Test that parse_flashcards returns a single flashcard for simple content."""
    content = "What is AI? Artificial Intelligence"
    flashcards = parse_flashcards(content)
    assert len(flashcards) == 1
    assert flashcards[0]["question"] == "What is AI?"
    assert flashcards[0]["answer"] == "Artificial Intelligence"

def test_parse_flashcards_multiple_flashcards():
    """Test that parse_flashcards returns multiple flashcards for complex content."""
    content = "What is AI? Artificial Intelligence\nWhat is ML? Machine Learning"
    flashcards = parse_flashcards(content)
    assert len(flashcards) == 2
    assert flashcards[0]["question"] == "What is AI?"
    assert flashcards[0]["answer"] == "Artificial Intelligence"
    assert flashcards[1]["question"] == "What is ML?"
    assert flashcards[1]["answer"] == "Machine Learning"

def test_export_to_csv_empty_flashcards():
    """Test that export_to_csv does not raise an error for empty flashcards."""
    flashcards = []
    output_file = "test_empty.csv"
    export_to_csv(flashcards, output_file)
    assert os.path.exists(output_file)
    # Optionally, clean up the generated file.
    os.remove(output_file)

def test_export_to_csv_single_flashcard():
    """Test that export_to_csv writes a single flashcard to a CSV file."""
    flashcards = [{"question": "What is AI?", "answer": "Artificial Intelligence"}]
    output_file = "test_single.csv"
    export_to_csv(flashcards, output_file)
    assert os.path.exists(output_file)
    with open(output_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
        # Adjust this check based on whether export_to_csv writes a header.
        # Here we assume it writes only the flashcard rows without a header.
        assert len(rows) == 1
        assert rows[0][0] == "What is AI?"
        assert rows[0][1] == "Artificial Intelligence"
    os.remove(output_file)

def test_export_to_csv_multiple_flashcards():
    """Test that export_to_csv writes multiple flashcards to a CSV file."""
    flashcards = [
        {"question": "What is AI?", "answer": "Artificial Intelligence"},
        {"question": "What is ML?", "answer": "Machine Learning"},
    ]
    output_file = "test_multiple.csv"
    export_to_csv(flashcards, output_file)
    assert os.path.exists(output_file)
    with open(output_file, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
        # Adjust expected row count if a header is written.
        assert len(rows) == 2
        assert rows[0][0] == "What is AI?"
        assert rows[0][1] == "Artificial Intelligence"
        assert rows[1][0] == "What is ML?"
        assert rows[1][1] == "Machine Learning"
    os.remove(output_file)

def test_get_auto_output_filename():
    """Test that get_auto_output_filename returns a timestamped filename."""
    extension = "csv"
    filename = get_auto_output_filename(extension)
    assert filename.startswith("flashcards_")
    assert filename.endswith(".csv")

def test_generate_flashcards_empty_user_text():
    """Test that generate_flashcards returns an empty list for empty user text."""
    user_text = ""
    model = "gemini-2.0-flash"
    flashcards = generate_flashcards(user_text, model)
    assert flashcards == []

def test_generate_flashcards_single_flashcard():
    """Test that generate_flashcards returns a single flashcard for simple user text."""
    user_text = "What is AI?"
    model = "gemini-2.0-flash"
    flashcards = generate_flashcards(user_text, model)
    assert len(flashcards) == 1
    assert flashcards[0]["question"] == "What is AI?"
    assert flashcards[0]["answer"] == "Artificial Intelligence"

def test_generate_flashcards_multiple_flashcards():
    """Test that generate_flashcards returns multiple flashcards for complex user text."""
    user_text = "What is AI?\nWhat is ML?"
    model = "gemini-2.0-flash"
    flashcards = generate_flashcards(user_text, model)
    assert len(flashcards) == 2
    assert flashcards[0]["question"] == "What is AI?"
    assert flashcards[0]["answer"] == "Artificial Intelligence"
    assert flashcards[1]["question"] == "What is ML?"
    assert flashcards[1]["answer"] == "Machine Learning"
