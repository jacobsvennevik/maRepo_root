# maProject/apps/generation/forms.py

from django import forms
from .models import Flashcard, FlashcardSet
from django.forms import inlineformset_factory

class FlashcardForm(forms.ModelForm):
    """
    Form for creating or updating an individual flashcard.
    """
    class Meta:
        model = Flashcard
        fields = ['question', 'answer']
        widgets = {
            'question': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter the question'}),
            'answer': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Enter the answer'}),
        }

class FlashcardSetForm(forms.ModelForm):
    """
    Form for creating or updating a flashcard set.
    """
    class Meta:
        model = FlashcardSet
        fields = ['title', 'document']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Enter flashcard set title'}),
            # If you want the user to select a document, you can use a dropdown.
        }

class FlashcardDeleteForm(forms.Form):
    """
    A simple confirmation form for deleting a flashcard.
    """
    confirm = forms.BooleanField(
        required=True,
        label="I confirm I want to delete this flashcard."
    )

# Optionally, if you want to manage multiple flashcards within a set in one form,
# you can use an inline formset.
FlashcardFormSet = inlineformset_factory(
    FlashcardSet,
    Flashcard,
    form=FlashcardForm,
    extra=1,          # Number of extra forms to display
    can_delete=True   # Enables deletion of flashcards within the formset
)
