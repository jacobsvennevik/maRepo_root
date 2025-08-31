"""
Model Mixins for Enhanced Functionality

This module provides reusable mixin classes that can be applied to models
to add common functionality like validation, computed properties, and utility methods.
"""

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from typing import Dict, Any, List, Optional
from datetime import timedelta
import json


class TimestampMixin:
    """
    Mixin to add automatic timestamp fields and related functionality.
    
    Provides:
    - created_at: Auto-set timestamp when object is created
    - updated_at: Auto-updated timestamp when object is modified
    - age calculation methods
    - time-based queries
    """
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        abstract = True
    
    @property
    def age_days(self) -> int:
        """Get the age of the object in days."""
        return (timezone.now() - self.created_at).days
    
    @property
    def age_hours(self) -> int:
        """Get the age of the object in hours."""
        return int((timezone.now() - self.created_at).total_seconds() / 3600)
    
    @property
    def is_recent(self) -> bool:
        """Check if object was created in the last 24 hours."""
        return self.age_hours < 24
    
    @property
    def is_old(self) -> bool:
        """Check if object is older than 30 days."""
        return self.age_days > 30
    
    def get_time_since_update(self) -> timedelta:
        """Get time since last update."""
        return timezone.now() - self.updated_at


class StatusMixin:
    """
    Mixin to add status management functionality.
    
    Provides:
    - status field with choices
    - status transition validation
    - status-based queries
    - status change tracking
    """
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ARCHIVED', 'Archived'),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        db_index=True
    )
    
    class Meta:
        abstract = True
    
    @property
    def is_draft(self) -> bool:
        """Check if object is in draft status."""
        return self.status == 'DRAFT'
    
    @property
    def is_active(self) -> bool:
        """Check if object is active."""
        return self.status == 'ACTIVE'
    
    @property
    def is_archived(self) -> bool:
        """Check if object is archived."""
        return self.status == 'ARCHIVED'
    
    def can_transition_to(self, new_status: str) -> bool:
        """Check if status transition is valid."""
        valid_transitions = {
            'DRAFT': ['ACTIVE', 'ARCHIVED'],
            'ACTIVE': ['INACTIVE', 'ARCHIVED'],
            'INACTIVE': ['ACTIVE', 'ARCHIVED'],
            'ARCHIVED': ['ACTIVE'],  # Can be reactivated
        }
        return new_status in valid_transitions.get(self.status, [])
    
    def transition_status(self, new_status: str, save: bool = True) -> bool:
        """Transition to a new status if valid."""
        if not self.can_transition_to(new_status):
            raise ValidationError(f"Invalid status transition from {self.status} to {new_status}")
        
        old_status = self.status
        self.status = new_status
        
        if save:
            self.save(update_fields=['status', 'updated_at'])
        
        return True


class ValidationMixin:
    """
    Mixin to add validation functionality.
    
    Provides:
    - Field validation methods
    - Business rule validation
    - Validation error handling
    - Clean method enhancements
    """
    
    class Meta:
        abstract = True
    
    def validate_required_fields(self) -> List[str]:
        """Validate that all required fields are filled."""
        errors = []
        for field in self._meta.fields:
            if field.blank is False and not field.has_default():
                value = getattr(self, field.name)
                if value is None or (isinstance(value, str) and not value.strip()):
                    errors.append(f"{field.name} is required")
        return errors
    
    def validate_business_rules(self) -> List[str]:
        """Validate business-specific rules. Override in subclasses."""
        return []
    
    def clean(self):
        """Enhanced clean method with validation."""
        super().clean()
        
        # Validate required fields
        required_errors = self.validate_required_fields()
        if required_errors:
            raise ValidationError(required_errors)
        
        # Validate business rules
        business_errors = self.validate_business_rules()
        if business_errors:
            raise ValidationError(business_errors)
    
    def is_valid_for_save(self) -> bool:
        """Check if object is valid for saving."""
        try:
            self.clean()
            return True
        except ValidationError:
            return False


class MetricsMixin:
    """
    Mixin to add metrics and analytics functionality.
    
    Provides:
    - JSON metrics field
    - Metric calculation methods
    - Performance tracking
    - Analytics helpers
    """
    
    metrics = models.JSONField(default=dict, blank=True)
    
    class Meta:
        abstract = True
    
    def set_metric(self, key: str, value: Any) -> None:
        """Set a metric value."""
        if not hasattr(self, 'metrics'):
            self.metrics = {}
        self.metrics[key] = value
    
    def get_metric(self, key: str, default: Any = None) -> Any:
        """Get a metric value."""
        return self.metrics.get(key, default) if hasattr(self, 'metrics') else default
    
    def increment_metric(self, key: str, amount: int = 1) -> None:
        """Increment a numeric metric."""
        current = self.get_metric(key, 0)
        self.set_metric(key, current + amount)
    
    def calculate_success_rate(self, success_key: str, total_key: str) -> float:
        """Calculate success rate from two metrics."""
        success = self.get_metric(success_key, 0)
        total = self.get_metric(total_key, 0)
        return (success / total * 100) if total > 0 else 0.0
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get a summary of all metrics."""
        if not hasattr(self, 'metrics'):
            return {}
        
        summary = {}
        for key, value in self.metrics.items():
            if isinstance(value, (int, float)):
                summary[key] = value
            elif isinstance(value, str):
                summary[key] = value[:100]  # Truncate long strings
            else:
                summary[key] = str(type(value))
        
        return summary


class SearchMixin:
    """
    Mixin to add search functionality.
    
    Provides:
    - Search index fields
    - Search query methods
    - Full-text search support
    - Search result ranking
    """
    
    search_vector = models.TextField(null=True, blank=True, db_index=True)
    
    class Meta:
        abstract = True
    
    def get_search_fields(self) -> List[str]:
        """Get fields to include in search. Override in subclasses."""
        return []
    
    def get_search_text(self) -> str:
        """Get concatenated search text from all search fields."""
        search_fields = self.get_search_fields()
        text_parts = []
        
        for field_name in search_fields:
            if hasattr(self, field_name):
                value = getattr(self, field_name)
                if value:
                    text_parts.append(str(value))
        
        return ' '.join(text_parts)
    
    def update_search_vector(self) -> None:
        """Update the search vector field."""
        if hasattr(self, 'search_vector'):
            search_text = self.get_search_text()
            self.search_vector = search_text
    
    def matches_search(self, query: str) -> bool:
        """Check if object matches a search query."""
        search_text = self.get_search_text().lower()
        query_terms = query.lower().split()
        return all(term in search_text for term in query_terms)


class CacheMixin:
    """
    Mixin to add caching functionality.
    
    Provides:
    - Cache key generation
    - Cache invalidation
    - Performance optimization
    - Query result caching
    """
    
    class Meta:
        abstract = True
    
    def get_cache_key(self, prefix: str = None) -> str:
        """Generate a cache key for this object."""
        model_name = self._meta.model_name
        prefix = prefix or model_name
        return f"{prefix}:{self.pk}:{self.updated_at.timestamp()}"
    
    def invalidate_cache(self, prefix: str = None) -> None:
        """Invalidate cached data for this object."""
        from django.core.cache import cache
        cache_key = self.get_cache_key(prefix)
        cache.delete(cache_key)
    
    def get_cached_property(self, property_name: str, ttl: int = 300) -> Any:
        """Get a cached property value."""
        from django.core.cache import cache
        cache_key = f"{self.get_cache_key()}:{property_name}"
        
        cached_value = cache.get(cache_key)
        if cached_value is not None:
            return cached_value
        
        # Calculate and cache the value
        if hasattr(self, property_name):
            value = getattr(self, property_name)
            cache.set(cache_key, value, ttl)
            return value
        
        return None


class AuditMixin:
    """
    Mixin to add audit trail functionality.
    
    Provides:
    - Change tracking
    - User attribution
    - Modification history
    - Audit logging
    """
    
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created'
    )
    modified_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_modified'
    )
    
    class Meta:
        abstract = True
    
    def track_change(self, user, field_name: str, old_value: Any, new_value: Any) -> None:
        """Track a field change for audit purposes."""
        if old_value != new_value:
            # This could be extended to log to an audit table
            pass
    
    def get_change_summary(self) -> Dict[str, Any]:
        """Get a summary of recent changes."""
        return {
            'created_by': self.created_by.username if self.created_by else None,
            'modified_by': self.modified_by.username if self.modified_by else None,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
    
    def save(self, *args, **kwargs):
        """Override save to track modifications."""
        # Track who is making the change
        if hasattr(self, 'modified_by') and 'request' in kwargs:
            self.modified_by = kwargs['request'].user
            del kwargs['request']
        
        super().save(*args, **kwargs)
