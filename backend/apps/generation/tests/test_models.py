import pytest
import time
from django.utils import timezone
from backend.apps.generation.flashcards.models import FlashcardSet, Flashcard
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.documents.tests.factories import DocumentFactory
from .factories.flashcard import FlashcardSetFactory, FlashcardFactory  # Adjust the import path if needed

# --- FlashcardSet Model Tests ---

@pytest.mark.django_db
def test_flashcard_set_creation():
    """
    Test that a FlashcardSet instance is created with the expected field values.
    """
    user = CustomUserFactory.create()
    document = DocumentFactory.create()
    title = "Test Flashcard Set"
    flashcard_set = FlashcardSet.objects.create(owner=user, document=document, title=title)

    # Verify that the instance is saved and fields are set
    assert flashcard_set.pk is not None
    assert flashcard_set.title == title
    assert flashcard_set.owner == user
    assert flashcard_set.document == document
    assert flashcard_set.created_at is not None

@pytest.mark.django_db
def test_flashcard_set_str():
    """
    Test that the __str__ method returns the expected string format.
    """
    user = CustomUserFactory.create()
    # Create a flashcard set using the factory with a custom title.
    flashcard_set = FlashcardSetFactory.create(owner=user, title="My Set")
    expected_str = f"My Set (Owner: {user.username})"
    assert str(flashcard_set) == expected_str

# --- Flashcard Model Tests ---

@pytest.mark.django_db
def test_flashcard_creation():
    """
    Test that a Flashcard instance is properly created and linked to its FlashcardSet.
    """
    flashcard_set = FlashcardSetFactory.create()
    question = "What is the capital of Italy?"
    answer = "Rome"
    flashcard = Flashcard.objects.create(
        flashcard_set=flashcard_set, question=question, answer=answer
    )
    
    assert flashcard.pk is not None
    assert flashcard.flashcard_set == flashcard_set
    assert flashcard.question == question
    assert flashcard.answer == answer
    # updated_at should be automatically set
    assert flashcard.updated_at is not None

@pytest.mark.django_db
def test_flashcard_str():
    """
    Test that the __str__ method of Flashcard returns the expected string.
    """
    flashcard_set = FlashcardSetFactory.create()
    question = "What is the capital of Germany?"
    answer = "Berlin"
    flashcard = Flashcard.objects.create(
        flashcard_set=flashcard_set, question=question, answer=answer
    )
    expected_str = f"Q: {question[:50]}..."
    assert str(flashcard) == expected_str

@pytest.mark.django_db
def test_flashcard_updated_at_changes():
    """
    Test that the updated_at field on a Flashcard instance is updated after a change.
    """
    flashcard_set = FlashcardSetFactory.create()
    flashcard = Flashcard.objects.create(
        flashcard_set=flashcard_set, question="Initial Q", answer="Initial A"
    )
    initial_updated_at = flashcard.updated_at

    # Ensure some time passes so the timestamp will differ.
    time.sleep(1)
    flashcard.question = "Updated Q"
    flashcard.save()
    flashcard.refresh_from_db()
    
    assert flashcard.updated_at > initial_updated_at
