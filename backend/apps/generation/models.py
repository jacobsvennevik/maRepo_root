#backend/apps/generation/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from backend.apps.pdf_service.django_models import Document

class FlashcardSet(models.Model):
    """
    A set of flashcards generated from a document.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="flashcards", null=True, blank=True)
    title = models.CharField(max_length=255, default="Untitled Flashcard Set")  # Default title
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Owner: {self.owner.username})"

class Flashcard(models.Model):
    """
    A single flashcard with a question and an answer.
    """
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Q: {self.question[:50]}..."


class MindMap(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mindmaps"
    )
    title = models.CharField(max_length=255)
    # Store the mind map content (for example, XML, markdown, or JSON)
    content = models.TextField(default="", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class MindMapSet(models.Model):
    """
    Model to store generated mind maps.
    """
    document = models.ForeignKey(
        Document, 
        on_delete=models.CASCADE, 
        related_name="mindmaps", 
        null=True, 
        blank=True
    )
    title = models.CharField(max_length=255, default="Untitled MindMap")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    mindmap_data = models.JSONField()  # Requires Django 3.1+; use postgres JSONField otherwise.

    def __str__(self):
        return f"{self.title} (Owner: {self.owner.username})"


class QuestionSet(models.Model):
    """
    A set of multiple-choice questions generated from a document.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="question_sets", null=True, blank=True)
    title = models.CharField(max_length=255, default="Untitled Question Set")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} (Owner: {self.owner.username})"


class Question(models.Model):
    """
    A single multiple-choice question.
    """
    question_set = models.ForeignKey(QuestionSet, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    explanation = models.TextField()
    question_type = models.CharField(max_length=50, default="memory")  # memory, application, cause_effect, methods
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q: {self.question_text[:50]}..."


class Choice(models.Model):
    """
    A choice for a multiple-choice question.
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    choice_letter = models.CharField(max_length=1)  # A, B, C, D

    def __str__(self):
        return f"{self.choice_letter}. {self.choice_text[:30]}..."

class GeneratedContent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='generated_contents')