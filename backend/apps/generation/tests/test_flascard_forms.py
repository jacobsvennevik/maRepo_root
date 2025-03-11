# backend/apps/generation/tests/flashcards/test_flashcard_forms.py

import pytest
from backend.apps.generation.forms import (
    FlashcardForm,
    FlashcardSetForm,
    FlashcardDeleteForm,
    FlashcardFormSet,
)
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.documents.tests.factories import DocumentFactory
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.generation.tests.factories.flashcard import FlashcardSetFactory


# --- FlashcardForm Tests ---

@pytest.mark.django_db
def test_flashcard_form_valid():
    """
    Test that FlashcardForm is valid with proper question and answer data.
    """
    user = CustomUserFactory.create()  # Use CustomUserFactory here
    flashcard_set = FlashcardSetFactory(owner=user)
    
    form_data = {
        'question': 'What is the largest ocean?',
        'answer': 'Pacific Ocean',
    }
    form = FlashcardForm(data=form_data)
    assert form.is_valid(), form.errors

    # The flashcard_set field is not part of the form; assign it manually.
    flashcard = form.save(commit=False)
    flashcard.flashcard_set = flashcard_set
    flashcard.save()
    
    assert flashcard.question == 'What is the largest ocean?'
    assert flashcard.answer == 'Pacific Ocean'
    assert flashcard.flashcard_set == flashcard_set

@pytest.mark.django_db
def test_flashcard_form_missing_question():
    """
    Test that FlashcardForm is invalid if the question is missing.
    """
    form_data = {
        'question': '',
        'answer': 'Some answer',
    }
    form = FlashcardForm(data=form_data)
    assert not form.is_valid()
    assert 'question' in form.errors

@pytest.mark.django_db
def test_flashcard_form_missing_answer():
    """
    Test that FlashcardForm is invalid if the answer is missing.
    """
    form_data = {
        'question': 'Some question',
        'answer': '',
    }
    form = FlashcardForm(data=form_data)
    assert not form.is_valid()
    assert 'answer' in form.errors

# --- FlashcardSetForm Tests ---

@pytest.mark.django_db
def test_flashcard_set_form_valid_with_document():
    """
    Test that FlashcardSetForm is valid when provided with a title and a document.
    """
    document = DocumentFactory.create()
    form_data = {
        'title': 'My Flashcard Set',
        'document': document.pk,  # ModelChoiceField expects the primary key.
    }
    form = FlashcardSetForm(data=form_data)
    assert form.is_valid(), form.errors
    flashcard_set = form.save(commit=False)
    assert flashcard_set.title == 'My Flashcard Set'
    assert flashcard_set.document == document

@pytest.mark.django_db
def test_flashcard_set_form_valid_without_document():
    """
    Test that FlashcardSetForm is valid when no document is provided.
    """
    form_data = {
        'title': 'Set without Document',
        'document': '',  # Empty input should result in None.
    }
    form = FlashcardSetForm(data=form_data)
    assert form.is_valid(), form.errors
    flashcard_set = form.save(commit=False)
    assert flashcard_set.title == 'Set without Document'
    assert flashcard_set.document is None

@pytest.mark.django_db
def test_flashcard_set_form_invalid_missing_title():
    """
    Test that FlashcardSetForm is invalid when the title is missing.
    """
    form_data = {
        'title': '',
        'document': '',
    }
    form = FlashcardSetForm(data=form_data)
    assert not form.is_valid()
    assert 'title' in form.errors

# --- FlashcardDeleteForm Tests ---

@pytest.mark.django_db
def test_flashcard_delete_form_valid():
    """
    Test that the FlashcardDeleteForm validates correctly when confirmation is given.
    """
    form_data = {
        'confirm': True,
    }
    form = FlashcardDeleteForm(data=form_data)
    assert form.is_valid(), form.errors

@pytest.mark.django_db
def test_flashcard_delete_form_invalid():
    """
    Test that the FlashcardDeleteForm is invalid when confirmation is missing.
    """
    form_data = {}  # No 'confirm' field provided.
    form = FlashcardDeleteForm(data=form_data)
    assert not form.is_valid()
    assert 'confirm' in form.errors

# --- Inline FlashcardFormSet Tests ---

@pytest.mark.django_db
def test_flashcard_formset_valid():
    """
    Test that the inline FlashcardFormSet can create multiple flashcards.
    """
    user = CustomUserFactory.create()  # Use CustomUserFactory here as well
    flashcard_set = FlashcardSetFactory(owner=user)
    
    # Define management form data and two flashcard entries.
    formset_data = {
        'flashcards-TOTAL_FORMS': '2',
        'flashcards-INITIAL_FORMS': '0',
        'flashcards-MIN_NUM_FORMS': '0',
        'flashcards-MAX_NUM_FORMS': '1000',
        'flashcards-0-question': 'What is 2+2?',
        'flashcards-0-answer': '4',
        'flashcards-1-question': 'What is the capital of Italy?',
        'flashcards-1-answer': 'Rome',
    }
    formset = FlashcardFormSet(instance=flashcard_set, data=formset_data, prefix='flashcards')
    assert formset.is_valid(), formset.errors
    flashcards = formset.save()
    
    # Verify that two flashcards are now associated with the flashcard set.
    assert flashcard_set.flashcards.count() == 2
    first_flashcard = flashcard_set.flashcards.first()
    assert first_flashcard.question == 'What is 2+2?'
    assert first_flashcard.answer == '4'

@pytest.mark.django_db
def test_flashcard_formset_invalid():
    """
    Test that the inline FlashcardFormSet fails when required fields are missing.
    """
    user = CustomUserFactory.create()
    flashcard_set = FlashcardSetFactory(owner=user)
    
    formset_data = {
        'flashcards-TOTAL_FORMS': '1',
        'flashcards-INITIAL_FORMS': '0',
        'flashcards-MIN_NUM_FORMS': '0',
        'flashcards-MAX_NUM_FORMS': '1000',
        # Missing question field.
        'flashcards-0-question': '',
        'flashcards-0-answer': 'Answer without question',
    }
    formset = FlashcardFormSet(instance=flashcard_set, data=formset_data, prefix='flashcards')
    assert not formset.is_valid()
    errors = formset.errors[0]
    assert 'question' in errors

