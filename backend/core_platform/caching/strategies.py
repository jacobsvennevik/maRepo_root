"""
Caching strategies for read caching and invalidation.
"""
from django.core.cache import cache
from typing import Dict, Any, Optional, List
from functools import wraps
import hashlib
import json
from backend.core_platform.observability.logging import get_logger

logger = get_logger(__name__)


class CacheManager:
    """Centralized cache management with invalidation strategies."""
    
    def __init__(self, default_timeout: int = 300):
        self.default_timeout = default_timeout
        self.cache_patterns = {}
    
    def register_pattern(self, name: str, pattern: str, timeout: Optional[int] = None):
        """Register a cache pattern for invalidation."""
        self.cache_patterns[name] = {
            'pattern': pattern,
            'timeout': timeout or self.default_timeout,
        }
    
    def get_cache_key(self, pattern_name: str, **kwargs) -> str:
        """Generate a cache key from a registered pattern."""
        if pattern_name not in self.cache_patterns:
            raise ValueError(f"Unknown cache pattern: {pattern_name}")
        
        pattern = self.cache_patterns[pattern_name]['pattern']
        return pattern.format(**kwargs)
    
    def get(self, pattern_name: str, **kwargs) -> Optional[Any]:
        """Get a cached value using a registered pattern."""
        cache_key = self.get_cache_key(pattern_name, **kwargs)
        return cache.get(cache_key)
    
    def set(self, pattern_name: str, value: Any, **kwargs):
        """Set a cached value using a registered pattern."""
        cache_key = self.get_cache_key(pattern_name, **kwargs)
        timeout = self.cache_patterns[pattern_name]['timeout']
        cache.set(cache_key, value, timeout=timeout)
        logger.debug("Cache set", cache_key=cache_key, timeout=timeout)
    
    def invalidate_pattern(self, pattern_name: str, **kwargs):
        """Invalidate cache entries matching a pattern."""
        if pattern_name not in self.cache_patterns:
            logger.warning("Unknown cache pattern for invalidation", pattern_name=pattern_name)
            return
        
        pattern = self.cache_patterns[pattern_name]['pattern']
        cache_key = pattern.format(**kwargs)
        
        # For now, we'll just delete the specific key
        # In production, you might want to use Redis SCAN to find all matching keys
        cache.delete(cache_key)
        logger.info("Cache invalidated", cache_key=cache_key)
    
    def invalidate_user_cache(self, user_id: int):
        """Invalidate all cache entries for a specific user."""
        # This is a simplified implementation
        # In production, you'd iterate through all patterns and invalidate user-specific keys
        logger.info("Invalidating user cache", user_id=user_id)
        
        # Example: invalidate common user-specific patterns
        for pattern_name in self.cache_patterns:
            if '{user_id}' in self.cache_patterns[pattern_name]['pattern']:
                self.invalidate_pattern(pattern_name, user_id=user_id)


# Global cache manager instance
cache_manager = CacheManager(default_timeout=300)

# Register common cache patterns
cache_manager.register_pattern(
    'projects_list',
    'projects:list:{user_id}:{page}:{filters_hash}',
    timeout=120
)

cache_manager.register_pattern(
    'flashcards_list',
    'flashcards:list:{user_id}:{page}:{filters_hash}',
    timeout=180
)

cache_manager.register_pattern(
    'documents_list',
    'documents:list:{user_id}:{page}:{filters_hash}',
    timeout=300
)

cache_manager.register_pattern(
    'user_profile',
    'user:profile:{user_id}',
    timeout=600
)

cache_manager.register_pattern(
    'project_detail',
    'project:detail:{project_id}',
    timeout=300
)


def cache_result(pattern_name: str, timeout: Optional[int] = None):
    """
    Decorator to cache function results.
    
    Args:
        pattern_name: Name of the registered cache pattern
        timeout: Override the default timeout for this pattern
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            cache_key_data = {
                'func_name': func.__name__,
                'args': args,
                'kwargs': kwargs,
            }
            cache_key_hash = hashlib.md5(
                json.dumps(cache_key_data, sort_keys=True).encode()
            ).hexdigest()
            
            # Try to get from cache
            cached_result = cache.get(cache_key_hash)
            if cached_result is not None:
                logger.debug("Cache hit", func_name=func.__name__, cache_key=cache_key_hash)
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            actual_timeout = timeout or cache_manager.cache_patterns.get(pattern_name, {}).get('timeout', 300)
            cache.set(cache_key_hash, result, timeout=actual_timeout)
            
            logger.debug("Cache miss, stored result", func_name=func.__name__, cache_key=cache_key_hash)
            return result
        
        return wrapper
    return decorator


def invalidate_on_change(pattern_names: List[str]):
    """
    Decorator to invalidate cache patterns when a model is changed.
    
    Args:
        pattern_names: List of cache pattern names to invalidate
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Execute the function
            result = func(*args, **kwargs)
            
            # Invalidate cache patterns
            for pattern_name in pattern_names:
                try:
                    # Try to extract user_id from args/kwargs
                    user_id = None
                    if args and hasattr(args[0], 'user'):
                        user_id = args[0].user.id
                    elif 'user_id' in kwargs:
                        user_id = kwargs['user_id']
                    elif 'user' in kwargs:
                        user_id = kwargs['user'].id
                    
                    if user_id:
                        cache_manager.invalidate_pattern(pattern_name, user_id=user_id)
                    else:
                        logger.warning("Could not extract user_id for cache invalidation", pattern_name=pattern_name)
                except Exception as e:
                    logger.error("Error invalidating cache", pattern_name=pattern_name, error=str(e))
            
            return result
        
        return wrapper
    return decorator


def cache_queryset_result(queryset, pattern_name: str, **kwargs):
    """
    Cache a queryset result using a registered pattern.
    
    Args:
        queryset: The queryset to cache
        pattern_name: Name of the registered cache pattern
        **kwargs: Arguments to format the cache key
    """
    cache_key = cache_manager.get_cache_key(pattern_name, **kwargs)
    timeout = cache_manager.cache_patterns[pattern_name]['timeout']
    
    # Try to get from cache
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        logger.debug("Cache hit", cache_key=cache_key)
        return cached_result
    
    # Execute queryset and cache result
    result = list(queryset)
    cache.set(cache_key, result, timeout=timeout)
    
    logger.debug("Cache miss, stored result", cache_key=cache_key, result_count=len(result))
    return result


# Utility functions for common cache operations
def invalidate_user_data(user_id: int):
    """Invalidate all cache entries for a user."""
    cache_manager.invalidate_user_cache(user_id)


def invalidate_project_cache(project_id: int):
    """Invalidate project-specific cache entries."""
    cache_manager.invalidate_pattern('project_detail', project_id=project_id)


def clear_all_cache():
    """Clear all cache (use with caution)."""
    cache.clear()
    logger.warning("All cache cleared")
