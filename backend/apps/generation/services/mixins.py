"""
Service mixins for common functionality across services.

This module provides mixin classes that can be used to add common
functionality to service classes, reducing code duplication.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from django.core.cache import cache
from django.conf import settings
import time

logger = logging.getLogger(__name__)


class CachingMixin:
    """Mixin for adding caching functionality to services."""
    
    def get_cache_key(self, prefix: str, identifier: str) -> str:
        """Generate a cache key."""
        return f"{prefix}:{identifier}"
    
    def get_cached_data(self, cache_key: str, default: Any = None) -> Any:
        """Get data from cache."""
        try:
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_data
        except Exception as e:
            logger.warning(f"Cache retrieval failed for key {cache_key}: {e}")
        
        return default
    
    def set_cached_data(self, cache_key: str, data: Any, timeout: int = 3600) -> bool:
        """Set data in cache."""
        try:
            cache.set(cache_key, data, timeout)
            logger.debug(f"Data cached for key: {cache_key}")
            return True
        except Exception as e:
            logger.warning(f"Cache setting failed for key {cache_key}: {e}")
            return False
    
    def invalidate_cache(self, cache_key: str) -> bool:
        """Invalidate cached data."""
        try:
            cache.delete(cache_key)
            logger.debug(f"Cache invalidated for key: {cache_key}")
            return True
        except Exception as e:
            logger.warning(f"Cache invalidation failed for key {cache_key}: {e}")
            return False


class ErrorHandlingMixin:
    """Mixin for standardized error handling across services."""
    
    def handle_service_error(self, error: Exception, context: str = "") -> Dict[str, Any]:
        """
        Handle service errors in a standardized way.
        
        Args:
            error: The exception that occurred
            context: Additional context about where the error occurred
        
        Returns:
            Dict containing error information
        """
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'success': False
        }
        
        # Log the error
        logger.error(f"Service error in {context}: {error}", exc_info=True)
        
        return error_info
    
    def safe_execute(self, func, *args, default_return: Any = None, **kwargs) -> Any:
        """
        Safely execute a function with error handling.
        
        Args:
            func: Function to execute
            *args: Positional arguments for the function
            default_return: Value to return if execution fails
            **kwargs: Keyword arguments for the function
        
        Returns:
            Function result or default_return if execution fails
        """
        try:
            return func(*args, **kwargs)
        except Exception as e:
            self.handle_service_error(e, f"safe_execute: {func.__name__}")
            return default_return


class ValidationMixin:
    """Mixin for common validation functionality."""
    
    def validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
        """
        Validate that required fields are present in data.
        
        Args:
            data: Data to validate
            required_fields: List of required field names
        
        Returns:
            Dict containing validation result
        """
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        
        if missing_fields:
            return {
                'valid': False,
                'missing_fields': missing_fields,
                'error': f"Missing required fields: {', '.join(missing_fields)}"
            }
        
        return {'valid': True, 'missing_fields': []}
    
    def validate_field_types(self, data: Dict[str, Any], field_specs: Dict[str, type]) -> Dict[str, Any]:
        """
        Validate field types in data.
        
        Args:
            data: Data to validate
            field_specs: Dict mapping field names to expected types
        
        Returns:
            Dict containing validation result
        """
        type_errors = []
        
        for field, expected_type in field_specs.items():
            if field in data and not isinstance(data[field], expected_type):
                type_errors.append(f"{field}: expected {expected_type.__name__}, got {type(data[field]).__name__}")
        
        if type_errors:
            return {
                'valid': False,
                'type_errors': type_errors,
                'error': f"Type validation failed: {'; '.join(type_errors)}"
            }
        
        return {'valid': True, 'type_errors': []}
    
    def sanitize_text(self, text: str, max_length: int = 10000) -> str:
        """
        Sanitize text input.
        
        Args:
            text: Text to sanitize
            max_length: Maximum allowed length
        
        Returns:
            Sanitized text
        """
        if not text:
            return ""
        
        # Remove null bytes and control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        return text.strip()


class RateLimitingMixin:
    """Mixin for rate limiting functionality."""
    
    def check_rate_limit(self, user_id: str, operation: str, limit: int, window_seconds: int = 3600) -> bool:
        """
        Check if a user has exceeded rate limits for an operation.
        
        Args:
            user_id: User identifier
            operation: Operation being performed
            limit: Maximum allowed operations in the time window
            window_seconds: Time window in seconds
        
        Returns:
            True if operation is allowed, False if rate limited
        """
        cache_key = f"rate_limit:{user_id}:{operation}"
        
        try:
            current_count = cache.get(cache_key, 0)
            if current_count >= limit:
                logger.warning(f"Rate limit exceeded for user {user_id}, operation {operation}")
                return False
            
            # Increment counter
            cache.set(cache_key, current_count + 1, window_seconds)
            return True
            
        except Exception as e:
            logger.warning(f"Rate limiting check failed: {e}")
            # Allow operation if rate limiting fails
            return True
    
    def get_rate_limit_info(self, user_id: str, operation: str) -> Dict[str, Any]:
        """
        Get current rate limit information for a user and operation.
        
        Args:
            user_id: User identifier
            operation: Operation name
        
        Returns:
            Dict containing rate limit information
        """
        cache_key = f"rate_limit:{user_id}:{operation}"
        
        try:
            current_count = cache.get(cache_key, 0)
            return {
                'current_count': current_count,
                'cache_key': cache_key
            }
        except Exception as e:
            logger.warning(f"Failed to get rate limit info: {e}")
            return {'current_count': 0, 'cache_key': cache_key}


class MetricsMixin:
    """Mixin for collecting service metrics."""
    
    def record_operation_metric(self, operation: str, duration_ms: float, success: bool, **kwargs):
        """
        Record metrics for an operation.
        
        Args:
            operation: Name of the operation
            duration_ms: Duration in milliseconds
            success: Whether the operation succeeded
            **kwargs: Additional metric data
        """
        try:
            metric_data = {
                'operation': operation,
                'duration_ms': duration_ms,
                'success': success,
                'timestamp': time.time(),
                **kwargs
            }
            
            # Store in cache for aggregation
            cache_key = f"metrics:{operation}:{int(time.time() // 3600)}"
            existing_metrics = cache.get(cache_key, [])
            existing_metrics.append(metric_data)
            
            # Keep only last 1000 metrics per hour
            if len(existing_metrics) > 1000:
                existing_metrics = existing_metrics[-1000:]
            
            cache.set(cache_key, existing_metrics, 7200)  # 2 hour TTL
            
        except Exception as e:
            logger.warning(f"Failed to record metric: {e}")
    
    def get_operation_metrics(self, operation: str, hours: int = 24) -> Dict[str, Any]:
        """
        Get aggregated metrics for an operation.
        
        Args:
            operation: Name of the operation
            hours: Number of hours to look back
        
        Returns:
            Dict containing aggregated metrics
        """
        try:
            metrics = []
            current_hour = int(time.time() // 3600)
            
            for hour_offset in range(hours):
                hour = current_hour - hour_offset
                cache_key = f"metrics:{operation}:{hour}"
                hour_metrics = cache.get(cache_key, [])
                metrics.extend(hour_metrics)
            
            if not metrics:
                return {
                    'total_operations': 0,
                    'success_rate': 0.0,
                    'avg_duration_ms': 0.0
                }
            
            total_ops = len(metrics)
            successful_ops = sum(1 for m in metrics if m.get('success', False))
            avg_duration = sum(m.get('duration_ms', 0) for m in metrics) / total_ops
            
            return {
                'total_operations': total_ops,
                'success_rate': successful_ops / total_ops if total_ops > 0 else 0.0,
                'avg_duration_ms': avg_duration
            }
            
        except Exception as e:
            logger.warning(f"Failed to get metrics: {e}")
            return {
                'total_operations': 0,
                'success_rate': 0.0,
                'avg_duration_ms': 0.0
            }
