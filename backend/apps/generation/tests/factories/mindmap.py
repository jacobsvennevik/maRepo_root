import factory
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from backend.apps.documents.models import Document
from backend.apps.documents.tests.factories import DocumentFactory
from backend.apps.generation.flashcards.models import FlashcardSet, Flashcard
from backend.apps.accounts.tests.factories import CustomUserFactory


User = get_user_model()  # This references your custom user model

class MindMapFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MindMap

    owner = factory.SubFactory(CustomUserFactory)
    title = factory.Faker("sentence")
    content = factory.Faker("text")