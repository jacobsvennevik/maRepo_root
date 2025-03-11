#backend/apps/generation/models.py
from django.db import models
from django.conf import settings
from backend.apps.documents.models import Document

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
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class MindMap(models.Model):
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