import pytest
from backend.apps.generation.models import Flashcard, FlashcardSet, MindMap
from backend.apps.generation.serializers import FlashcardSerializer, FlashcardSetSerializer, MindMapSerializer
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.generation.tests.factories import FlashcardSetFactory, FlashcardFactory, MindMapFactory

@pytest.mark.django_db
def test_flashcard_serializer_output():
    """
    Test that the FlashcardSerializer serializes a flashcard correctly.
    """
    user = CustomUserFactory.create()
    flashcard_set = FlashcardSetFactory(owner=user)
    flashcard = FlashcardFactory(flashcard_set=flashcard_set,
                                 question="What is testing?",
                                 answer="Validating code behavior")
    
    serializer = FlashcardSerializer(flashcard)
    data = serializer.data
    assert data["question"] == flashcard.question
    assert data["answer"] == flashcard.answer
    # If flashcard_set is serialized as an ID or nested object, assert accordingly.

@pytest.mark.django_db
def test_flashcardset_serializer_output():
    """
    Test that the FlashcardSetSerializer serializes a flashcard set and its nested flashcards correctly.
    """
    user = CustomUserFactory.create()
    flashcard_set = FlashcardSetFactory(owner=user)
    # Create multiple flashcards for the set
    flashcard1 = FlashcardFactory(flashcard_set=flashcard_set, question="Q1", answer="A1")
    flashcard2 = FlashcardFactory(flashcard_set=flashcard_set, question="Q2", answer="A2")
    
    serializer = FlashcardSetSerializer(flashcard_set)
    data = serializer.data
    # Check basic fields
    assert data["id"] == flashcard_set.id
    # Check nested flashcards (assuming read_only nested representation)
    assert isinstance(data["flashcards"], list)
    assert len(data["flashcards"]) >= 2
    questions = [fc["question"] for fc in data["flashcards"]]
    assert "Q1" in questions and "Q2" in questions


@pytest.mark.django_db
def test_mindmap_serializer_output():
    """
    Test that the MindMapSerializer serializes a MindMap instance correctly.
    """
    user = CustomUserFactory.create()
    # Create a MindMap with a sample JSON structure.
    mindmap = MindMapFactory.create(
        owner=user,
        title="Serialized MindMap",
        mindmap_data={"root": {"name": "Root", "children": [{"name": "Child1"}]}}
    )
    serializer = MindMapSerializer(mindmap)
    data = serializer.data

    assert data["title"] == "Serialized MindMap"
    # Assuming the owner is serialized as an ID.
    assert data["owner"] == user.id
    assert data["mindmap_data"] == {"root": {"name": "Root", "children": [{"name": "Child1"}]}}