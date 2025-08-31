# Flashcard Models
from django.db import models
from django.conf import settings
from django.utils import timezone
from backend.apps.pdf_service.django_models import Document
from datetime import timedelta


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
    Enhanced with essential spaced repetition fields for learning optimization.
    """
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Essential SM-2 Algorithm Fields (Phase 1)
    algorithm = models.CharField(
        max_length=20, 
        choices=[('sm2', 'SM-2'), ('leitner', 'Leitner')], 
        default='sm2'
    )
    learning_state = models.CharField(
        max_length=20,
        choices=[('new', 'New'), ('learning', 'Learning'), ('review', 'Review')],
        default='new'
    )
    
    # SM-2 Core Fields
    interval = models.PositiveIntegerField(default=1)  # Days until next review (changed from 0 to 1)
    repetitions = models.PositiveIntegerField(default=0)  # Number of successful reviews
    ease_factor = models.FloatField(default=2.5)  # SM-2 ease factor
    
    # Leitner Box System
    leitner_box = models.PositiveIntegerField(default=1)  # Current Leitner box (1-5)
    
    # Scheduling
    next_review = models.DateTimeField(default=timezone.now, db_index=True)  # Changed from DateField to DateTimeField
    last_reviewed = models.DateTimeField(null=True, blank=True)
    
    # Review Tracking
    total_reviews = models.PositiveIntegerField(default=0)
    correct_reviews = models.PositiveIntegerField(default=0)
    
    # Optional Metrics (Phase 2) - Store in JSONB to avoid schema churn
    metrics = models.JSONField(default=dict, blank=True)  # memory_strength, difficulty_rating, tags, etc.
    
    class Meta:
        ordering = ['next_review', 'updated_at']
        indexes = [
            models.Index(fields=['flashcard_set', 'next_review']),
            models.Index(fields=['learning_state', 'next_review']),
            models.Index(fields=['next_review', 'flashcard_set']),  # Optimized for due queries
        ]

    def __str__(self):
        if self.next_review:
            return f"Q: {self.question[:50]}... (Due: {self.next_review.strftime('%Y-%m-%d')})"
        return f"Q: {self.question[:50]}..."

    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp."""
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
    
    def reset_to_new(self):
        """Reset card to new state for relearning."""
        self.learning_state = 'new'
        self.interval = 1  # Changed from 0 to 1 to match default
        self.repetitions = 0
        self.ease_factor = 2.5
        self.leitner_box = 1
        self.next_review = timezone.now()  # Set to current datetime instead of date
        self.last_reviewed = None
        # Reset memory strength to default
        if hasattr(self, '_metrics_cache'):
            delattr(self, '_metrics_cache')
        if 'memory_strength' in self.metrics:
            self.metrics['memory_strength'] = 1.0
        # Keep total_reviews and correct_reviews for analytics

    @property
    def retention_rate(self):
        """Calculate retention rate as percentage."""
        if self.total_reviews == 0:
            return 0.0
        return (self.correct_reviews / self.total_reviews) * 100

    @property
    def is_due(self):
        """Check if card is due for review."""
        if not self.next_review:
            return True
        return self.next_review <= timezone.now()
    
    @property
    def is_overdue(self):
        """Check if card is overdue."""
        if not self.next_review:
            return False
        return self.next_review < timezone.now() - timedelta(days=1)
    
    @property
    def days_until_due(self):
        """Calculate days until next review."""
        if not self.next_review:
            return 0
        # Calculate total seconds and convert to days, rounding to nearest day
        total_seconds = (self.next_review - timezone.now()).total_seconds()
        days = total_seconds / (24 * 3600)  # Convert seconds to days
        return round(days)  # Round to nearest day
    
    # JSONB property accessors for Phase 2 metrics
    @property
    def memory_strength(self):
        return self.metrics.get('memory_strength', 1.0)
    
    @memory_strength.setter
    def memory_strength(self, value):
        if not hasattr(self, '_metrics_cache'):
            self._metrics_cache = self.metrics.copy()
        self._metrics_cache['memory_strength'] = value
        self.metrics = self._metrics_cache
    
    @property
    def difficulty_rating(self):
        return self.metrics.get('difficulty_rating', 0.0)
    
    @difficulty_rating.setter
    def difficulty_rating(self, value):
        if not hasattr(self, '_metrics_cache'):
            self._metrics_cache = self.metrics.copy()
        self._metrics_cache['difficulty_rating'] = value
        self.metrics = self._metrics_cache
    
    @property
    def tags(self):
        return self.metrics.get('tags', [])
    
    @tags.setter
    def tags(self, value):
        if not hasattr(self, '_metrics_cache'):
            self._metrics_cache = self.metrics.copy()
        self._metrics_cache['tags'] = value
        self.metrics = self._metrics_cache
    
    @property
    def accuracy_rate(self):
        """Calculate accuracy rate as percentage."""
        if self.total_reviews == 0:
            return 0.0
        return (self.correct_reviews / self.total_reviews) * 100
