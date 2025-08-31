"""
Enhanced Flashcard Models with Mixins and Utility Methods

This module provides enhanced versions of the flashcard models with:
- Model mixins for common functionality
- Utility methods for common operations
- Computed properties for frequently accessed data
- Enhanced validation and business rules
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from backend.apps.pdf_service.django_models import Document
from .mixins import (
    TimestampMixin, StatusMixin, ValidationMixin, 
    MetricsMixin, SearchMixin, CacheMixin, AuditMixin
)
from datetime import timedelta
from typing import Dict, Any, List, Optional, Tuple


class EnhancedFlashcardSet(TimestampMixin, StatusMixin, ValidationMixin, MetricsMixin, SearchMixin, AuditMixin, models.Model):
    """
    Enhanced flashcard set with advanced functionality.
    
    Features:
    - Automatic timestamps and status management
    - Metrics tracking and analytics
    - Search functionality
    - Audit trail
    - Validation and business rules
    """
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="enhanced_flashcards", null=True, blank=True)
    title = models.CharField(max_length=255, default="Untitled Flashcard Set")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Additional fields for enhanced functionality
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('BEGINNER', 'Beginner'),
            ('INTERMEDIATE', 'Intermediate'),
            ('ADVANCED', 'Advanced'),
            ('EXPERT', 'Expert'),
        ],
        default='INTERMEDIATE'
    )
    target_audience = models.CharField(max_length=100, blank=True)
    estimated_study_time = models.PositiveIntegerField(help_text="Estimated study time in minutes", default=30)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} (Owner: {self.owner.username})"
    
    def get_search_fields(self) -> List[str]:
        """Get fields to include in search."""
        return ['title', 'description', 'target_audience']
    
    def validate_business_rules(self) -> List[str]:
        """Validate business-specific rules."""
        errors = []
        
        # Check if title is meaningful
        if len(self.title.strip()) < 3:
            errors.append("Title must be at least 3 characters long")
        
        # Check if estimated study time is reasonable
        if self.estimated_study_time < 5 or self.estimated_study_time > 480:  # 5 min to 8 hours
            errors.append("Estimated study time must be between 5 and 480 minutes")
        
        # Check if tags are valid
        if self.tags and not isinstance(self.tags, list):
            errors.append("Tags must be a list")
        
        return errors
    
    @property
    def total_cards(self) -> int:
        """Get total number of cards in this set."""
        return self.flashcards.count()
    
    @property
    def active_cards(self) -> int:
        """Get number of active cards."""
        return self.flashcards.filter(status='ACTIVE').count()
    
    @property
    def completion_rate(self) -> float:
        """Calculate completion rate based on card status."""
        if self.total_cards == 0:
            return 0.0
        
        completed_cards = self.flashcards.filter(status='COMPLETED').count()
        return (completed_cards / self.total_cards) * 100
    
    @property
    def average_difficulty(self) -> float:
        """Calculate average difficulty of cards in the set."""
        cards = self.flashcards.all()
        if not cards:
            return 0.0
        
        total_difficulty = sum(card.difficulty_rating for card in cards)
        return total_difficulty / len(cards)
    
    def get_study_progress(self, user) -> Dict[str, Any]:
        """Get study progress for a specific user."""
        user_cards = self.flashcards.filter(owner=user)
        
        if not user_cards:
            return {
                'total_cards': 0,
                'studied_cards': 0,
                'mastered_cards': 0,
                'progress_percentage': 0.0
            }
        
        total_cards = user_cards.count()
        studied_cards = user_cards.filter(total_reviews__gt=0).count()
        mastered_cards = user_cards.filter(learning_state='review', interval__gte=30).count()
        
        return {
            'total_cards': total_cards,
            'studied_cards': studied_cards,
            'mastered_cards': mastered_cards,
            'progress_percentage': (studied_cards / total_cards) * 100 if total_cards > 0 else 0.0
        }
    
    def add_tag(self, tag: str) -> None:
        """Add a tag to the flashcard set."""
        if not self.tags:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags', 'updated_at'])
    
    def remove_tag(self, tag: str) -> None:
        """Remove a tag from the flashcard set."""
        if self.tags and tag in self.tags:
            self.tags.remove(tag)
            self.save(update_fields=['tags', 'updated_at'])
    
    def get_related_sets(self, limit: int = 5) -> List['EnhancedFlashcardSet']:
        """Get related flashcard sets based on tags and difficulty."""
        from django.db.models import Q
        
        related_sets = EnhancedFlashcardSet.objects.filter(
            Q(tags__overlap=self.tags) | Q(difficulty_level=self.difficulty_level),
            status='ACTIVE'
        ).exclude(pk=self.pk)[:limit]
        
        return related_sets


class EnhancedFlashcard(TimestampMixin, StatusMixin, ValidationMixin, MetricsMixin, SearchMixin, CacheMixin, AuditMixin, models.Model):
    """
    Enhanced flashcard with advanced functionality.
    
    Features:
    - Spaced repetition algorithms (SM-2, Leitner)
    - Advanced metrics and analytics
    - Performance tracking
    - Difficulty assessment
    - Learning state management
    """
    
    # Override status choices for flashcards
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('REVIEW', 'In Review'),
        ('MASTERED', 'Mastered'),
        ('ARCHIVED', 'Archived'),
    ]
    
    flashcard_set = models.ForeignKey(EnhancedFlashcardSet, on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Enhanced spaced repetition fields
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
    
    # SM-2 Core Fields
    interval = models.PositiveIntegerField(default=0)
    repetitions = models.PositiveIntegerField(default=0)
    ease_factor = models.FloatField(default=2.5)
    
    # Scheduling
    next_review = models.DateField(null=True, blank=True, db_index=True)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    
    # Review Tracking
    total_reviews = models.PositiveIntegerField(default=0)
    correct_reviews = models.PositiveIntegerField(default=0)
    
    # Enhanced fields
    difficulty_rating = models.FloatField(default=0.0, help_text="User-rated difficulty (0-10)")
    confidence_level = models.FloatField(default=0.0, help_text="User confidence (0-10)")
    time_spent = models.PositiveIntegerField(default=0, help_text="Total time spent in seconds")
    hints_used = models.PositiveIntegerField(default=0, help_text="Number of hints used")
    
    # Additional metadata
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    source_material = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['next_review', 'updated_at']
        indexes = [
            models.Index(fields=['flashcard_set', 'next_review']),
            models.Index(fields=['learning_state', 'next_review']),
            models.Index(fields=['owner', 'next_review']),
            models.Index(fields=['algorithm', 'learning_state']),
            models.Index(fields=['difficulty_rating']),
        ]
    
    def __str__(self):
        return f"Q: {self.question[:50]}..."
    
    def get_search_fields(self) -> List[str]:
        """Get fields to include in search."""
        return ['question', 'answer', 'notes', 'source_material']
    
    def validate_business_rules(self) -> List[str]:
        """Validate business-specific rules."""
        errors = []
        
        # Check if question and answer are meaningful
        if len(self.question.strip()) < 5:
            errors.append("Question must be at least 5 characters long")
        
        if len(self.answer.strip()) < 2:
            errors.append("Answer must be at least 2 characters long")
        
        # Check difficulty rating range
        if self.difficulty_rating < 0 or self.difficulty_rating > 10:
            errors.append("Difficulty rating must be between 0 and 10")
        
        # Check confidence level range
        if self.confidence_level < 0 or self.confidence_level > 10:
            errors.append("Confidence level must be between 0 and 10")
        
        return errors
    
    # Enhanced computed properties
    @property
    def retention_rate(self) -> float:
        """Calculate retention rate as percentage."""
        if self.total_reviews == 0:
            return 0.0
        return (self.correct_reviews / self.total_reviews) * 100
    
    @property
    def is_due(self) -> bool:
        """Check if card is due for review."""
        if not self.next_review:
            return True
        return self.next_review <= timezone.now().date()
    
    @property
    def is_overdue(self) -> bool:
        """Check if card is overdue."""
        if not self.next_review:
            return False
        return self.next_review < timezone.now().date() - timedelta(days=1)
    
    @property
    def days_overdue(self) -> int:
        """Get number of days overdue."""
        if not self.is_overdue:
            return 0
        return (timezone.now().date() - self.next_review).days
    
    @property
    def mastery_level(self) -> str:
        """Get mastery level based on performance."""
        if self.total_reviews < 5:
            return 'Insufficient Data'
        
        if self.retention_rate >= 90 and self.interval >= 30:
            return 'Mastered'
        elif self.retention_rate >= 75 and self.interval >= 7:
            return 'Proficient'
        elif self.retention_rate >= 60:
            return 'Learning'
        else:
            return 'Needs Work'
    
    @property
    def study_efficiency(self) -> float:
        """Calculate study efficiency score."""
        if self.total_reviews == 0:
            return 0.0
        
        # Base efficiency on retention rate and time spent
        retention_score = self.retention_rate / 100
        time_efficiency = min(1.0, 300 / max(1, self.time_spent / self.total_reviews))  # Target: 5 min per review
        
        return (retention_score * 0.7) + (time_efficiency * 0.3)
    
    # Enhanced utility methods
    def update_difficulty(self, new_rating: float, user) -> None:
        """Update difficulty rating with user input."""
        if 0 <= new_rating <= 10:
            self.difficulty_rating = new_rating
            self.modified_by = user
            self.save(update_fields=['difficulty_rating', 'modified_by', 'updated_at'])
    
    def update_confidence(self, new_level: float, user) -> None:
        """Update confidence level with user input."""
        if 0 <= new_level <= 10:
            self.confidence_level = new_level
            self.modified_by = user
            self.save(update_fields=['confidence_level', 'modified_by', 'updated_at'])
    
    def add_note(self, note: str, user) -> None:
        """Add a note to the flashcard."""
        if note.strip():
            current_notes = self.notes or ""
            timestamp = timezone.now().strftime("%Y-%m-%d %H:%M")
            new_note = f"[{timestamp}] {note.strip()}\n"
            self.notes = new_note + current_notes
            self.modified_by = user
            self.save(update_fields=['notes', 'modified_by', 'updated_at'])
    
    def add_tag(self, tag: str) -> None:
        """Add a tag to the flashcard."""
        if not self.tags:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags', 'updated_at'])
    
    def remove_tag(self, tag: str) -> None:
        """Remove a tag from the flashcard."""
        if self.tags and tag in self.tags:
            self.tags.remove(tag)
            self.save(update_fields=['tags', 'updated_at'])
    
    def get_study_recommendations(self) -> List[str]:
        """Get personalized study recommendations."""
        recommendations = []
        
        if self.retention_rate < 60:
            recommendations.append("Consider reviewing this card more frequently")
            recommendations.append("Try breaking down the concept into smaller parts")
        
        if self.difficulty_rating > 7:
            recommendations.append("This card is rated as difficult - consider using hints")
            recommendations.append("Review related materials before attempting this card")
        
        if self.is_overdue:
            recommendations.append(f"This card is {self.days_overdue} days overdue")
            recommendations.append("Schedule a review session soon")
        
        if self.hints_used > 3:
            recommendations.append("You've used many hints - consider relearning the concept")
        
        return recommendations
    
    def get_performance_trend(self, days: int = 30) -> Dict[str, Any]:
        """Get performance trend over the specified days."""
        # This would typically query a separate review history table
        # For now, return basic metrics
        return {
            'total_reviews': self.total_reviews,
            'retention_rate': self.retention_rate,
            'mastery_level': self.mastery_level,
            'study_efficiency': self.study_efficiency,
            'days_overdue': self.days_overdue,
            'recommendations': self.get_study_recommendations()
        }
    
    def reset_progress(self, user) -> None:
        """Reset all progress and return to initial state."""
        self.interval = 0
        self.repetitions = 0
        self.ease_factor = 2.5
        self.next_review = timezone.now().date()
        self.last_reviewed = None
        self.total_reviews = 0
        self.correct_reviews = 0
        self.learning_state = 'new'
        self.modified_by = user
        self.save()
    
    def archive(self, user, reason: str = "") -> None:
        """Archive the flashcard."""
        self.status = 'ARCHIVED'
        self.modified_by = user
        if reason:
            self.add_note(f"Archived: {reason}", user)
        self.save(update_fields=['status', 'modified_by', 'updated_at'])
