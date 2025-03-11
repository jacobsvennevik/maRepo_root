import factory
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from backend.apps.documents.models import Document
from backend.apps.documents.tests.factories import DocumentFactory
from backend.apps.generation.models import FlashcardSet, Flashcard, MindMap
from backend.apps.accounts.tests.factories import CustomUserFactory

User = get_user_model()  # This references your custom user model



class FlashcardSetFactory(factory.django.DjangoModelFactory):
    """
    Factory for creating FlashcardSet instances.
    """

    class Meta:
        model = FlashcardSet

    owner = factory.SubFactory(CustomUserFactory)
    title = factory.Sequence(lambda n: f"Flashcard Set {n}")
    document = factory.SubFactory(DocumentFactory)

from backend.apps.generation.models import FlashcardSet

class FlashcardFactory(factory.django.DjangoModelFactory):
    """
    Factory for creating Flashcard instances.
    """

    class Meta:
        model = Flashcard

    flashcard_set = factory.SubFactory(FlashcardSetFactory)
    question = "What is the capital of France?"
    answer = "Paris"
    
class MindMapFactory(factory.django.DjangoModelFactory):
    """
    Factory for creating MindMap instances.
    """

    class Meta:
        model = MindMap

    owner = factory.SubFactory(CustomUserFactory)
    title = factory.Sequence(lambda n: f"MindMap {n}")
    mindmap_data = {"root": {"name": "Test MindMap", "children": []}}
    document = factory.SubFactory(DocumentFactory)
