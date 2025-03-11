import pytest
from django.contrib.auth import get_user_model
from unittest.mock import patch
import os
from backend.apps.documents.models import Document
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.documents.services.pdf_reader import read_pdf
from django.core.files.uploadedfile import SimpleUploadedFile
from backend.apps.generation.services.flashcard_generator import (
    parse_flashcards,
    save_flashcards_to_db,
    generate_flashcards,
    generate_flashcards_from_document,
)

User = get_user_model()

# ✅ Test parsing flashcards from AI response
@pytest.mark.django_db
def test_parse_flashcards_empty_content():
    """Test that parse_flashcards returns an empty list for empty content."""
    content = ""
    flashcards = parse_flashcards(content)
    assert flashcards == []

@pytest.mark.django_db
def test_parse_flashcards_single_flashcard():
    content = "Front: What is AI? Back: Artificial Intelligence"
    flashcards = parse_flashcards(content)

    print(f"Extracted flashcards: {flashcards}")  # 🔍 Debug output

    assert len(flashcards) == 1
    assert flashcards[0] == ("What is AI?", "Artificial Intelligence")

@pytest.mark.django_db
def test_parse_flashcards_multiple_flashcards():
    """Test that parse_flashcards correctly extracts multiple flashcards."""
    content = (
        "Front: What is AI? Back: Artificial Intelligence\n"
        "Front: What is ML? Back: Machine Learning"
    )
    flashcards = parse_flashcards(content)
    assert len(flashcards) == 2
    assert flashcards[0] == ("What is AI?", "Artificial Intelligence")
    assert flashcards[1] == ("What is ML?", "Machine Learning")


# ✅ Test saving flashcards to the database
@pytest.mark.django_db
def test_save_flashcards_to_db():
    """
    Test that flashcards are correctly saved to the database when passed to save_flashcards_to_db.
    """
    user = User.objects.create_user(username="testuser", email="testuser@example.com", password="testpass")
    document = Document.objects.create(user=user, file="uploads/test.pdf", file_type="pdf", title="Test Document")

    # Create a flashcard set linked to the document
    flashcard_set = FlashcardSet.objects.create(title="Test Set", owner=user, document=document)

    # Sample flashcards
    flashcards = [
        ("What is AI?", "Artificial Intelligence"),
        ("What is ML?", "Machine Learning"),
    ]

    # Save to DB
    save_flashcards_to_db(flashcards, flashcard_set)

    # Retrieve from DB
    stored_flashcards = Flashcard.objects.filter(flashcard_set=flashcard_set).order_by("id")

    assert stored_flashcards.count() == 2
    assert stored_flashcards[0].question == "What is AI?"
    assert stored_flashcards[0].answer == "Artificial Intelligence"
    assert stored_flashcards[1].question == "What is ML?"
    assert stored_flashcards[1].answer == "Machine Learning"


# ✅ Test generating flashcards from AI
@pytest.mark.django_db
def test_generate_flashcards(mocker):
    """
    Test generate_flashcards by mocking the AI response.
    """
    mocker.patch(
        "backend.apps.generation.services.api_client.AIClient.get_response",
        return_value="Front: What is AI? Back: Artificial Intelligence"
    )

    flashcards = generate_flashcards("Some text about AI", "gemini-2.0-flash")

    assert len(flashcards) == 1
    assert flashcards[0] == ("What is AI?", "Artificial Intelligence")


# ✅ Test generating flashcards from a document
@pytest.mark.django_db
@patch("backend.apps.generation.services.flashcard_generator.read_pdf", return_value="Front: What is AI? Back: Artificial Intelligence")
@patch("backend.apps.generation.services.flashcard_generator.AIClient.get_response", return_value="Front: What is AI? Back: Artificial Intelligence")
def test_generate_flashcards_from_document(mock_ai_response, mock_read_pdf):
    """
    Test that generate_flashcards_from_document extracts text, generates flashcards, and saves them to the database.
    """
    user = User.objects.create_user(username="testuser", email="testuser@example.com", password="testpass")
    
    # Use `tmp_path` to create a real test file
   # Create a dummy PDF file using SimpleUploadedFile
    uploaded_file = SimpleUploadedFile("test.pdf", b"Dummy PDF content", content_type="application/pdf")
    document = Document.objects.create(user=user, file=uploaded_file, file_type="pdf", title="Test Document")


    # Ensure file exists before running test
    assert os.path.exists(document.file.path), "Test PDF file was not created!"

    flashcard_set = generate_flashcards_from_document(document.id, user)

    # ✅ Verify that the flashcard set was created
    assert flashcard_set is not None

    # 🔥 Ensure mocks were called!
    mock_read_pdf.assert_called_once_with(document.id)
    mock_ai_response.assert_called_once()

    
    assert flashcard_set.title == f"Flashcards for {document.title}"

    # ✅ Verify that flashcards were saved to the database
    stored_flashcards = Flashcard.objects.filter(flashcard_set=flashcard_set).order_by("id")
    assert stored_flashcards.count() == 1
    assert stored_flashcards[0].question == "What is AI?"
    assert stored_flashcards[0].answer == "Artificial Intelligence"

    # ✅ Ensure `read_pdf` was called once to extract text
    mock_read_pdf.assert_called_once_with(document.id)
