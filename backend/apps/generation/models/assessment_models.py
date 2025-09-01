# Assessment Models - Generalized for multiple assessment types
from django.db import models
from django.conf import settings
from django.utils import timezone
from backend.apps.pdf_service.django_models import Document
from datetime import timedelta
import json


class AssessmentSet(models.Model):
    """
    A generalized set of assessment items (flashcards, MCQ, etc.).
    Replaces FlashcardSet with a more flexible structure.
    """
    
    KIND_CHOICES = [
        ('FLASHCARDS', 'Flashcards'),
        ('MCQ', 'Multiple Choice'),
        ('MIXED', 'Mixed Assessment'),
        ('TRUE_FALSE', 'True/False'),
        ('FILL_BLANK', 'Fill in the Blank'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="assessments", null=True, blank=True)
    title = models.CharField(max_length=255, default="Untitled Assessment Set")
    description = models.TextField(blank=True, default="")
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default='FLASHCARDS')
    
    # Metadata
    learning_objectives = models.JSONField(default=list, blank=True)
    themes = models.JSONField(default=list, blank=True)
    difficulty_level = models.CharField(max_length=20, default='INTERMEDIATE')
    target_audience = models.CharField(max_length=255, blank=True, default="")
    estimated_study_time = models.PositiveIntegerField(default=30)  # minutes
    tags = models.JSONField(default=list, blank=True)
    
    # Ownership and timestamps
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Settings for mixed sets
    assessment_config = models.JSONField(default=dict, blank=True)  # e.g., {"flashcard_percentage": 60, "mcq_percentage": 40}
    
    class Meta:
        indexes = [
            models.Index(fields=['owner', 'kind']),
            models.Index(fields=['kind', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.kind}) - {self.owner.username}"


class AssessmentItem(models.Model):
    """
    A generalized assessment item that can be a flashcard, MCQ, etc.
    Replaces Flashcard with a polymorphic structure.
    """
    
    ITEM_TYPE_CHOICES = [
        ('FLASHCARD', 'Flashcard'),
        ('MCQ', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
        ('FILL_BLANK', 'Fill in the Blank'),
        ('MATCHING', 'Matching'),
        ('ORDERING', 'Ordering'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('EXPERT', 'Expert'),
    ]
    
    BLOOM_LEVEL_CHOICES = [
        ('remember', 'Remember'),
        ('understand', 'Understand'),
        ('apply', 'Apply'),
        ('analyze', 'Analyze'),
        ('evaluate', 'Evaluate'),
        ('create', 'Create'),
    ]
    
    # Core fields
    assessment_set = models.ForeignKey(AssessmentSet, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    order_index = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Content fields (polymorphic based on item_type)
    question = models.TextField()  # For flashcards: question; for MCQ: stem
    answer = models.TextField()    # For flashcards: answer; for MCQ: correct answer text
    
    # MCQ-specific fields
    choices = models.JSONField(default=list, blank=True)  # Array of choice strings
    correct_index = models.PositiveIntegerField(null=True, blank=True)  # Index of correct choice
    explanation = models.TextField(blank=True, default="")  # Explanation for correct answer
    
    # Metadata
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, default='INTERMEDIATE')
    bloom_level = models.CharField(max_length=15, choices=BLOOM_LEVEL_CHOICES, default='apply')
    concept_id = models.CharField(max_length=255, blank=True, default="")
    theme = models.CharField(max_length=100, blank=True, default="")
    related_concepts = models.JSONField(default=list, blank=True)
    hints = models.JSONField(default=list, blank=True)
    examples = models.JSONField(default=list, blank=True)
    common_misconceptions = models.JSONField(default=list, blank=True)
    learning_objective = models.CharField(max_length=500, blank=True, default="")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Spaced repetition fields (for flashcards and some other types)
    algorithm = models.CharField(
        max_length=20, 
        choices=[('sm2', 'SM-2'), ('leitner', 'Leitner')], 
        default='sm2'
    )
    learning_state = models.CharField(
        max_length=20,
        choices=[('new', 'New'), ('learning', 'Learning'), ('review', 'Review'), ('mastered', 'Mastered')],
        default='new'
    )
    interval = models.PositiveIntegerField(default=1)
    repetitions = models.PositiveIntegerField(default=0)
    ease_factor = models.FloatField(default=2.5)
    leitner_box = models.PositiveIntegerField(default=1)
    next_review = models.DateTimeField(default=timezone.now, db_index=True)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    
    # Review tracking
    total_reviews = models.PositiveIntegerField(default=0)
    correct_reviews = models.PositiveIntegerField(default=0)
    
    # Additional metrics
    metrics = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['order_index', 'next_review', 'updated_at']
        indexes = [
            models.Index(fields=['assessment_set', 'order_index']),
            models.Index(fields=['assessment_set', 'item_type']),
            models.Index(fields=['learning_state', 'next_review']),
            models.Index(fields=['next_review', 'assessment_set']),
        ]
    
    def __str__(self):
        return f"{self.item_type}: {self.question[:50]}... (Set: {self.assessment_set.title})"
    
    def save(self, *args, **kwargs):
        """Override save to update updated_at timestamp."""
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
    
    def reset_to_new(self):
        """Reset item to new state for relearning."""
        self.learning_state = 'new'
        self.interval = 1
        self.repetitions = 0
        self.ease_factor = 2.5
        self.leitner_box = 1
        self.next_review = timezone.now()
        self.last_reviewed = None
        if 'memory_strength' in self.metrics:
            self.metrics['memory_strength'] = 1.0
    
    @property
    def retention_rate(self):
        """Calculate retention rate as percentage."""
        if self.total_reviews == 0:
            return 0.0
        return (self.correct_reviews / self.total_reviews) * 100
    
    @property
    def is_due(self):
        """Check if item is due for review."""
        if not self.next_review:
            return True
        return self.next_review <= timezone.now()
    
    @property
    def is_overdue(self):
        """Check if item is overdue."""
        if not self.next_review:
            return False
        return self.next_review < timezone.now() - timedelta(days=1)
    
    @property
    def days_until_due(self):
        """Calculate days until next review."""
        if not self.next_review:
            return 0
        total_seconds = (self.next_review - timezone.now()).total_seconds()
        days = total_seconds / (24 * 3600)
        return round(days)
    
    # For backward compatibility with existing flashcard code
    @property
    def flashcard_set(self):
        """Alias for assessment_set to maintain backward compatibility."""
        return self.assessment_set
    
    @property
    def flashcard_set_id(self):
        """Alias for assessment_set_id to maintain backward compatibility."""
        return self.assessment_set_id


class AssessmentAttempt(models.Model):
    """
    Records user attempts/submissions for assessment items.
    Polymorphic payload to handle different item types.
    """
    
    ATTEMPT_TYPE_CHOICES = [
        ('SPACED_REPETITION', 'Spaced Repetition Review'),
        ('QUIZ', 'Quiz/Diagnostic'),
        ('PRACTICE', 'Practice Mode'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    assessment_item = models.ForeignKey(AssessmentItem, on_delete=models.CASCADE, related_name='attempts')
    attempt_type = models.CharField(max_length=20, choices=ATTEMPT_TYPE_CHOICES, default='SPACED_REPETITION')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    response_time_ms = models.PositiveIntegerField(default=0)
    
    # Polymorphic payload based on item type
    payload = models.JSONField(default=dict)  # Varies by item type
    
    # For spaced repetition (flashcards)
    quality = models.PositiveIntegerField(null=True, blank=True)  # 0-5 rating
    
    # For MCQ/objective items
    selected_index = models.PositiveIntegerField(null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True)  # 0-1 confidence rating
    
    # Additional fields
    notes = models.TextField(blank=True, default="")
    session_id = models.CharField(max_length=255, blank=True, default="")
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'assessment_item', 'created_at']),
            models.Index(fields=['assessment_item', 'attempt_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.assessment_item.item_type} - {self.created_at}"


# Backward compatibility aliases
class FlashcardSet(AssessmentSet):
    """Backward compatibility alias for FlashcardSet."""
    class Meta:
        proxy = True
        verbose_name = "Flashcard Set"
        verbose_name_plural = "Flashcard Sets"


class Flashcard(AssessmentItem):
    """Backward compatibility alias for Flashcard."""
    class Meta:
        proxy = True
        verbose_name = "Flashcard"
        verbose_name_plural = "Flashcards"

