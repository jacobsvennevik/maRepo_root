"""
Enhanced Diagnostic Models with Mixins and Utility Methods

This module provides enhanced versions of the diagnostic models with:
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
from backend.apps.projects.models import Project
from .mixins import (
    TimestampMixin, StatusMixin, ValidationMixin, 
    MetricsMixin, SearchMixin, CacheMixin, AuditMixin
)
import uuid
from typing import Dict, Any, List, Optional, Tuple
from datetime import timedelta


class EnhancedDiagnosticSession(TimestampMixin, StatusMixin, ValidationMixin, MetricsMixin, SearchMixin, AuditMixin, models.Model):
    """
    Enhanced diagnostic session with advanced functionality.
    
    Features:
    - Automatic timestamps and status management
    - Metrics tracking and analytics
    - Search functionality
    - Audit trail
    - Enhanced validation and business rules
    """
    
    # Override status choices for diagnostic sessions
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SCHEDULED', 'Scheduled'),
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('CLOSED', 'Closed'),
        ('ARCHIVED', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='enhanced_diagnostic_sessions')
    topic = models.CharField(max_length=255, null=True, blank=True)
    content_source = models.ForeignKey(Document, null=True, blank=True, on_delete=models.SET_NULL)
    
    # Enhanced delivery options
    delivery_mode = models.CharField(
        max_length=18,
        choices=[
            ('IMMEDIATE', 'Immediate Feedback'),
            ('DEFERRED_FEEDBACK', 'Deferred Feedback'),
            ('ADAPTIVE', 'Adaptive Feedback'),
            ('BLIND', 'No Feedback'),
        ],
        default='DEFERRED_FEEDBACK'
    )
    
    # Scheduling and timing
    scheduled_for = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    time_limit_sec = models.PositiveIntegerField(null=True, blank=True)
    grace_period_minutes = models.PositiveIntegerField(default=15, help_text="Grace period after due time")
    
    # Question configuration
    max_questions = models.PositiveSmallIntegerField(default=3)
    min_questions = models.PositiveSmallIntegerField(default=1)
    questions_order = models.CharField(
        max_length=10,
        choices=[
            ('FIXED', 'Fixed Order'),
            ('SCRAMBLED', 'Scrambled Order'),
            ('ADAPTIVE', 'Adaptive Order'),
            ('RANDOM', 'Random Order'),
        ],
        default='SCRAMBLED'
    )
    
    # Advanced features
    seed = models.IntegerField(null=True, blank=True)
    variant = models.CharField(max_length=1, default='A')
    feature_flag_key = models.CharField(max_length=64, null=True, blank=True)
    
    # Enhanced metadata
    description = models.TextField(blank=True)
    learning_objectives = models.JSONField(default=list, blank=True)
    prerequisites = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Analytics and reporting
    target_participation_rate = models.FloatField(default=80.0, help_text="Target participation rate in percentage")
    difficulty_target = models.CharField(
        max_length=20,
        choices=[
            ('EASY', 'Easy'),
            ('MEDIUM', 'Medium'),
            ('HARD', 'Hard'),
            ('MIXED', 'Mixed'),
        ],
        default='MEDIUM'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['scheduled_for', 'due_at']),
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['delivery_mode', 'status']),
            models.Index(fields=['difficulty_target']),
        ]
    
    def __str__(self):
        return f"Diagnostic: {self.topic or 'Untitled'} ({self.project.name})"
    
    def get_search_fields(self) -> List[str]:
        """Get fields to include in search."""
        return ['topic', 'description', 'learning_objectives']
    
    def validate_business_rules(self) -> List[str]:
        """Validate business-specific rules."""
        errors = []
        
        # Check if scheduled time is in the future
        if self.scheduled_for and self.scheduled_for <= timezone.now():
            errors.append("Scheduled time must be in the future")
        
        # Check if due time is after scheduled time
        if self.scheduled_for and self.due_at and self.due_at <= self.scheduled_for:
            errors.append("Due time must be after scheduled time")
        
        # Check if time limit is reasonable
        if self.time_limit_sec and (self.time_limit_sec < 60 or self.time_limit_sec > 7200):
            errors.append("Time limit must be between 1 minute and 2 hours")
        
        # Check if question limits are valid
        if self.min_questions > self.max_questions:
            errors.append("Minimum questions cannot exceed maximum questions")
        
        # Check if target participation rate is valid
        if self.target_participation_rate < 0 or self.target_participation_rate > 100:
            errors.append("Target participation rate must be between 0 and 100")
        
        return errors
    
    # Enhanced computed properties
    @property
    def is_open(self) -> bool:
        """Check if session is currently open for responses."""
        now = timezone.now()
        if self.status not in ['OPEN', 'IN_PROGRESS']:
            return False
        if self.scheduled_for and now < self.scheduled_for:
            return False
        if self.due_at and now > self.due_at + timedelta(minutes=self.grace_period_minutes):
            return False
        return True
    
    @property
    def is_overdue(self) -> bool:
        """Check if session is overdue."""
        if not self.due_at:
            return False
        return timezone.now() > self.due_at + timedelta(minutes=self.grace_period_minutes)
    
    @property
    def time_until_due(self) -> Optional[timedelta]:
        """Get time until due date."""
        if not self.due_at:
            return None
        return self.due_at - timezone.now()
    
    @property
    def participation_rate(self) -> float:
        """Calculate participation rate based on project members."""
        if not hasattr(self.project, 'members'):
            return 0.0
        total_members = self.project.members.count()
        if total_members == 0:
            return 0.0
        
        from .enhanced_diagnostic_models import EnhancedDiagnosticResponse
        responses = EnhancedDiagnosticResponse.objects.filter(
            session=self
        ).values('user').distinct().count()
        
        return (responses / total_members) * 100
    
    @property
    def completion_rate(self) -> float:
        """Calculate completion rate of started sessions."""
        from .enhanced_diagnostic_models import EnhancedDiagnosticResponse
        
        total_responses = EnhancedDiagnosticResponse.objects.filter(session=self).count()
        if total_responses == 0:
            return 0.0
        
        completed_responses = EnhancedDiagnosticResponse.objects.filter(
            session=self,
            completed=True
        ).count()
        
        return (completed_responses / total_responses) * 100
    
    @property
    def average_score(self) -> float:
        """Calculate average score across all responses."""
        from .enhanced_diagnostic_models import EnhancedDiagnosticResponse
        
        responses = EnhancedDiagnosticResponse.objects.filter(
            session=self,
            score__isnull=False
        )
        
        if not responses:
            return 0.0
        
        total_score = sum(response.score for response in responses)
        return total_score / responses.count()
    
    @property
    def difficulty_distribution(self) -> Dict[str, int]:
        """Get distribution of question difficulties."""
        questions = self.questions.all()
        distribution = {'EASY': 0, 'MEDIUM': 0, 'HARD': 0}
        
        for question in questions:
            difficulty = question.difficulty_level
            if difficulty in distribution:
                distribution[difficulty] += 1
        
        return distribution
    
    # Enhanced utility methods
    def get_participation_analytics(self) -> Dict[str, Any]:
        """Get comprehensive participation analytics."""
        from .enhanced_diagnostic_models import EnhancedDiagnosticResponse
        
        responses = EnhancedDiagnosticResponse.objects.filter(session=self)
        total_responses = responses.count()
        
        if total_responses == 0:
            return {
                'total_responses': 0,
                'unique_participants': 0,
                'participation_rate': 0.0,
                'completion_rate': 0.0,
                'average_score': 0.0,
                'time_spent_stats': {},
                'difficulty_breakdown': {}
            }
        
        unique_participants = responses.values('user').distinct().count()
        completed_responses = responses.filter(completed=True).count()
        scores = [r.score for r in responses if r.score is not None]
        time_spent = [r.time_spent_seconds for r in responses if r.time_spent_seconds]
        
        return {
            'total_responses': total_responses,
            'unique_participants': unique_participants,
            'participation_rate': self.participation_rate,
            'completion_rate': (completed_responses / total_responses) * 100,
            'average_score': sum(scores) / len(scores) if scores else 0.0,
            'time_spent_stats': {
                'average': sum(time_spent) / len(time_spent) if time_spent else 0,
                'min': min(time_spent) if time_spent else 0,
                'max': max(time_spent) if time_spent else 0,
            },
            'difficulty_breakdown': self.difficulty_distribution
        }
    
    def get_question_analytics(self) -> Dict[str, Any]:
        """Get analytics for individual questions."""
        questions = self.questions.all()
        analytics = {}
        
        for question in questions:
            responses = question.responses.all()
            total_responses = responses.count()
            
            if total_responses == 0:
                analytics[question.id] = {
                    'total_responses': 0,
                    'correct_responses': 0,
                    'accuracy_rate': 0.0,
                    'average_time': 0,
                    'difficulty_level': question.difficulty_level
                }
                continue
            
            correct_responses = responses.filter(is_correct=True).count()
            time_spent = [r.time_spent_seconds for r in responses if r.time_spent_seconds]
            
            analytics[question.id] = {
                'total_responses': total_responses,
                'correct_responses': correct_responses,
                'accuracy_rate': (correct_responses / total_responses) * 100,
                'average_time': sum(time_spent) / len(time_spent) if time_spent else 0,
                'difficulty_level': question.difficulty_level
            }
        
        return analytics
    
    def schedule_session(self, scheduled_time: timezone.datetime, due_time: timezone.datetime = None) -> bool:
        """Schedule the diagnostic session."""
        if scheduled_time <= timezone.now():
            raise ValidationError("Scheduled time must be in the future")
        
        if due_time and due_time <= scheduled_time:
            raise ValidationError("Due time must be after scheduled time")
        
        self.scheduled_for = scheduled_time
        if due_time:
            self.due_at = due_time
        
        self.status = 'SCHEDULED'
        self.save(update_fields=['scheduled_for', 'due_at', 'status', 'updated_at'])
        return True
    
    def open_session(self) -> bool:
        """Open the diagnostic session for responses."""
        if self.status not in ['DRAFT', 'SCHEDULED']:
            raise ValidationError(f"Cannot open session in {self.status} status")
        
        self.status = 'OPEN'
        self.save(update_fields=['status', 'updated_at'])
        return True
    
    def close_session(self) -> bool:
        """Close the diagnostic session."""
        if self.status not in ['OPEN', 'IN_PROGRESS']:
            raise ValidationError(f"Cannot close session in {self.status} status")
        
        self.status = 'CLOSED'
        self.save(update_fields=['status', 'updated_at'])
        return True
    
    def add_learning_objective(self, objective: str) -> None:
        """Add a learning objective."""
        if not self.learning_objectives:
            self.learning_objectives = []
        if objective not in self.learning_objectives:
            self.learning_objectives.append(objective)
            self.save(update_fields=['learning_objectives', 'updated_at'])
    
    def add_prerequisite(self, prerequisite: str) -> None:
        """Add a prerequisite."""
        if not self.prerequisites:
            self.prerequisites = []
        if prerequisite not in self.prerequisites:
            self.prerequisites.append(prerequisite)
            self.save(update_fields=['prerequisites', 'updated_at'])
    
    def add_tag(self, tag: str) -> None:
        """Add a tag."""
        if not self.tags:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags', 'updated_at'])
    
    def get_recommendations(self) -> List[str]:
        """Get recommendations based on session performance."""
        recommendations = []
        
        # Participation recommendations
        if self.participation_rate < self.target_participation_rate:
            recommendations.append(f"Participation rate ({self.participation_rate:.1f}%) is below target ({self.target_participation_rate}%)")
            recommendations.append("Consider sending reminders or extending the deadline")
        
        # Difficulty recommendations
        difficulty_dist = self.difficulty_distribution
        if difficulty_dist.get('HARD', 0) > difficulty_dist.get('EASY', 0):
            recommendations.append("Session has more hard questions than easy ones")
            recommendations.append("Consider adjusting difficulty balance for better engagement")
        
        # Time recommendations
        if self.time_limit_sec and self.average_score < 70:
            recommendations.append("Average score is below 70%")
            recommendations.append("Consider increasing time limit or adjusting question difficulty")
        
        return recommendations


class EnhancedDiagnosticQuestion(TimestampMixin, StatusMixin, ValidationMixin, MetricsMixin, SearchMixin, models.Model):
    """
    Enhanced diagnostic question with advanced functionality.
    
    Features:
    - Multiple question types
    - Bloom's taxonomy levels
    - Difficulty assessment
    - Performance tracking
    - Adaptive features
    """
    
    # Override status choices for questions
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('TESTING', 'Testing'),
        ('ARCHIVED', 'Archived'),
    ]
    
    session = models.ForeignKey(EnhancedDiagnosticSession, on_delete=models.CASCADE, related_name='questions')
    
    # Question content
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=[
            ('MCQ', 'Multiple Choice'),
            ('SHORT_ANSWER', 'Short Answer'),
            ('PRINCIPLE', 'Principle'),
            ('TRUE_FALSE', 'True/False'),
            ('MATCHING', 'Matching'),
            ('FILL_BLANK', 'Fill in the Blank'),
        ],
        default='MCQ'
    )
    
    # Educational metadata
    bloom_level = models.CharField(
        max_length=20,
        choices=[
            ('Remember', 'Remember'),
            ('Understand', 'Understand'),
            ('Apply', 'Apply'),
            ('Analyze', 'Analyze'),
            ('Evaluate', 'Evaluate'),
            ('Create', 'Create'),
        ],
        default='Understand'
    )
    
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('EASY', 'Easy'),
            ('MEDIUM', 'Medium'),
            ('HARD', 'Hard'),
        ],
        default='MEDIUM'
    )
    
    # Question configuration
    points = models.PositiveIntegerField(default=1)
    time_limit_seconds = models.PositiveIntegerField(null=True, blank=True)
    hints_available = models.BooleanField(default=False)
    max_attempts = models.PositiveIntegerField(default=1)
    
    # Content and context
    learning_objective = models.TextField(blank=True)
    topic_area = models.CharField(max_length=100, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Performance tracking
    total_responses = models.PositiveIntegerField(default=0)
    correct_responses = models.PositiveIntegerField(default=0)
    average_time_spent = models.FloatField(default=0.0)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'question_type']),
            models.Index(fields=['difficulty_level', 'bloom_level']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Q: {self.question_text[:50]}..."
    
    def get_search_fields(self) -> List[str]:
        """Get fields to include in search."""
        return ['question_text', 'learning_objective', 'topic_area']
    
    def validate_business_rules(self) -> List[str]:
        """Validate business-specific rules."""
        errors = []
        
        # Check if question text is meaningful
        if len(self.question_text.strip()) < 10:
            errors.append("Question text must be at least 10 characters long")
        
        # Check if points are reasonable
        if self.points < 1 or self.points > 10:
            errors.append("Points must be between 1 and 10")
        
        # Check if time limit is reasonable
        if self.time_limit_seconds and (self.time_limit_seconds < 30 or self.time_limit_seconds > 600):
            errors.append("Time limit must be between 30 seconds and 10 minutes")
        
        # Check if max attempts is reasonable
        if self.max_attempts < 1 or self.max_attempts > 5:
            errors.append("Max attempts must be between 1 and 5")
        
        return errors
    
    # Enhanced computed properties
    @property
    def accuracy_rate(self) -> float:
        """Calculate accuracy rate."""
        if self.total_responses == 0:
            return 0.0
        return (self.correct_responses / self.total_responses) * 100
    
    @property
    def difficulty_score(self) -> float:
        """Calculate difficulty score based on performance."""
        if self.total_responses < 5:
            return 0.5  # Default to medium difficulty
        
        # Lower accuracy = higher difficulty
        difficulty = 1 - (self.accuracy_rate / 100)
        return max(0.0, min(1.0, difficulty))
    
    @property
    def is_performing_well(self) -> bool:
        """Check if question is performing well."""
        return self.accuracy_rate >= 70 and self.total_responses >= 10
    
    @property
    def needs_review(self) -> bool:
        """Check if question needs review."""
        return self.accuracy_rate < 50 and self.total_responses >= 5
    
    # Enhanced utility methods
    def update_performance_metrics(self, is_correct: bool, time_spent: float) -> None:
        """Update performance metrics after a response."""
        self.total_responses += 1
        if is_correct:
            self.correct_responses += 1
        
        # Update average time spent
        if self.average_time_spent == 0:
            self.average_time_spent = time_spent
        else:
            self.average_time_spent = (
                (self.average_time_spent * (self.total_responses - 1) + time_spent) / 
                self.total_responses
            )
        
        self.save(update_fields=['total_responses', 'correct_responses', 'average_time_spent', 'updated_at'])
    
    def get_difficulty_assessment(self) -> Dict[str, Any]:
        """Get comprehensive difficulty assessment."""
        return {
            'difficulty_level': self.difficulty_level,
            'difficulty_score': self.difficulty_score,
            'accuracy_rate': self.accuracy_rate,
            'total_responses': self.total_responses,
            'average_time_spent': self.average_time_spent,
            'performance_status': 'Good' if self.is_performing_well else 'Needs Review' if self.needs_review else 'Acceptable'
        }
    
    def add_tag(self, tag: str) -> None:
        """Add a tag."""
        if not self.tags:
            self.tags = []
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags', 'updated_at'])
    
    def archive_if_poor_performing(self) -> bool:
        """Archive question if it's performing poorly."""
        if self.needs_review and self.total_responses >= 10:
            self.status = 'ARCHIVED'
            self.save(update_fields=['status', 'updated_at'])
            return True
        return False
