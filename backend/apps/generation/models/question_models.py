# Question Models
from django.db import models
from django.conf import settings
from backend.apps.pdf_service.django_models import Document


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
