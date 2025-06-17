import factory
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.pdf_service.tests.factories import DocumentFactory
from backend.apps.accounts.tests.factories import CustomUserFactory


class FlashcardSetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FlashcardSet

    title = factory.Sequence(lambda n: f"Flashcard Set {n}")
    owner = factory.SubFactory(CustomUserFactory)
    document = factory.SubFactory(DocumentFactory)


class FlashcardFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Flashcard

    question = factory.Sequence(lambda n: f"Question {n}")
    answer = factory.Sequence(lambda n: f"Answer {n}")
    flashcard_set = factory.SubFactory(FlashcardSetFactory) 