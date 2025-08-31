"""
Configuration Cache

This module provides caching functionality for configuration objects,
including performance optimization and cache invalidation strategies.
"""

import time
import hashlib
from typing import Dict, Any, Optional, Union
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ConfigCache:
    """
    Configuration cache with intelligent caching strategies.
    
    This class provides:
    - Multi-level caching (memory, Django cache, file)
    - Cache invalidation strategies
    - Performance optimization
    - Cache warming and preloading
    """
    
    def __init__(self, cache_ttl: int = 300, max_memory_items: int = 100):
        """
        Initialize the configuration cache.
        
        Args:
            cache_ttl: Cache TTL in seconds
            max_memory_items: Maximum items to keep in memory
        """
        self.cache_ttl = cache_ttl
        self.max_memory_items = max_memory_items
        self._memory_cache: Dict[str, Any] = {}
        self._cache_keys = {
            'config': 'generation:config:global',
            'spaced_repetition': 'generation:config:spaced_repetition',
            'interleaving': 'generation:config:interleaving',
            'diagnostic': 'generation:config:diagnostic',
            'ai_provider': 'generation:config:ai_provider',
            'feature_flags': 'generation:config:feature_flags',
        }
        self.last_updated = None
        self._cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'invalidations': 0,
        }
    
    def get_config(self, config_type: str = 'global') -> Optional[Any]:
        """
        Get configuration from cache.
        
        Args:
            config_type: Type of configuration to retrieve
            
        Returns:
            Cached configuration or None if not found
        """
        cache_key = self._cache_keys.get(config_type, f'generation:config:{config_type}')
        
        # Try memory cache first
        if config_type in self._memory_cache:
            cached_item = self._memory_cache[config_type]
            if self._is_cache_item_valid(cached_item):
                self._cache_stats['hits'] += 1
                logger.debug(f"Cache hit for {config_type} (memory)")
                return cached_item['data']
        
        # Try Django cache
        try:
            cached_data = cache.get(cache_key)
            if cached_data and self._is_cache_item_valid(cached_data):
                # Update memory cache
                self._set_memory_cache(config_type, cached_data)
                self._cache_stats['hits'] += 1
                logger.debug(f"Cache hit for {config_type} (Django cache)")
                return cached_data['data']
        except Exception as e:
            logger.warning(f"Failed to retrieve from Django cache: {e}")
        
        self._cache_stats['misses'] += 1
        logger.debug(f"Cache miss for {config_type}")
        return None
    
    def set_config(self, config: Any, config_type: str = 'global'):
        """
        Cache configuration data.
        
        Args:
            config: Configuration object to cache
            config_type: Type of configuration
        """
        cache_key = self._cache_keys.get(config_type, f'generation:config:{config_type}')
        
        # Create cache item
        cache_item = {
            'data': config,
            'timestamp': time.time(),
            'ttl': self.cache_ttl,
            'version': self._get_config_version(config),
        }
        
        # Update memory cache
        self._set_memory_cache(config_type, cache_item)
        
        # Update Django cache
        try:
            cache.set(cache_key, cache_item, self.cache_ttl)
        except Exception as e:
            logger.warning(f"Failed to set Django cache: {e}")
        
        self._cache_stats['sets'] += 1
        self.last_updated = time.time()
        
        logger.debug(f"Cached {config_type} configuration")
    
    def _set_memory_cache(self, key: str, value: Any):
        """Set item in memory cache with size management."""
        # Remove oldest items if cache is full
        if len(self._memory_cache) >= self.max_memory_items:
            oldest_key = min(self._memory_cache.keys(), 
                           key=lambda k: self._memory_cache[k].get('timestamp', 0))
            del self._memory_cache[oldest_key]
        
        self._memory_cache[key] = value
    
    def _is_cache_item_valid(self, cache_item: Dict[str, Any]) -> bool:
        """Check if a cache item is still valid."""
        if not isinstance(cache_item, dict):
            return False
        
        timestamp = cache_item.get('timestamp', 0)
        ttl = cache_item.get('ttl', 0)
        
        return time.time() - timestamp < ttl
    
    def _get_config_version(self, config: Any) -> str:
        """Generate a version hash for configuration."""
        try:
            # Convert config to string representation for hashing
            config_str = str(config)
            return hashlib.md5(config_str.encode()).hexdigest()[:8]
        except Exception:
            return str(time.time())
    
    def invalidate_config(self, config_type: str = 'global'):
        """
        Invalidate cached configuration.
        
        Args:
            config_type: Type of configuration to invalidate
        """
        cache_key = self._cache_keys.get(config_type, f'generation:config:{config_type}')
        
        # Remove from memory cache
        if config_type in self._memory_cache:
            del self._memory_cache[config_type]
        
        # Remove from Django cache
        try:
            cache.delete(cache_key)
        except Exception as e:
            logger.warning(f"Failed to delete from Django cache: {e}")
        
        self._cache_stats['invalidations'] += 1
        logger.info(f"Invalidated cache for {config_type}")
    
    def invalidate_all(self):
        """Invalidate all cached configurations."""
        for config_type in self._cache_keys.keys():
            self.invalidate_config(config_type)
        
        # Clear memory cache
        self._memory_cache.clear()
        
        logger.info("Invalidated all configuration caches")
    
    def warm_cache(self, configs: Dict[str, Any]):
        """
        Warm the cache with configuration data.
        
        Args:
            configs: Dictionary of configurations to cache
        """
        for config_type, config in configs.items():
            self.set_config(config, config_type)
        
        logger.info(f"Warmed cache with {len(configs)} configurations")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache performance statistics.
        
        Returns:
            Dictionary with cache statistics
        """
        return {
            'stats': self._cache_stats.copy(),
            'memory_cache_size': len(self._memory_cache),
            'memory_cache_keys': list(self._memory_cache.keys()),
            'last_updated': self.last_updated,
            'cache_ttl': self.cache_ttl,
            'max_memory_items': self.max_memory_items,
        }
    
    def clear_stats(self):
        """Clear cache statistics."""
        self._cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'invalidations': 0,
        }
        logger.info("Cleared cache statistics")
    
    def optimize_cache(self):
        """Optimize cache performance."""
        # Remove expired items from memory cache
        current_time = time.time()
        expired_keys = [
            key for key, item in self._memory_cache.items()
            if not self._is_cache_item_valid(item)
        ]
        
        for key in expired_keys:
            del self._memory_cache[key]
        
        if expired_keys:
            logger.info(f"Removed {len(expired_keys)} expired cache items")
        
        # Adjust cache TTL based on usage patterns
        hit_rate = self._cache_stats['hits'] / max(1, self._cache_stats['hits'] + self._cache_stats['misses'])
        
        if hit_rate < 0.5:
            # Low hit rate, increase TTL
            new_ttl = min(self.cache_ttl * 2, 3600)  # Max 1 hour
            if new_ttl != self.cache_ttl:
                self.cache_ttl = new_ttl
                logger.info(f"Adjusted cache TTL to {new_ttl}s due to low hit rate")
        
        elif hit_rate > 0.9:
            # High hit rate, decrease TTL for freshness
            new_ttl = max(self.cache_ttl // 2, 60)  # Min 1 minute
            if new_ttl != self.cache_ttl:
                self.cache_ttl = new_ttl
                logger.info(f"Adjusted cache TTL to {new_ttl}s due to high hit rate")
    
    def preload_configs(self, config_loader: callable):
        """
        Preload configurations using a loader function.
        
        Args:
            config_loader: Function that returns configurations to preload
        """
        try:
            configs = config_loader()
            if configs:
                self.warm_cache(configs)
                logger.info("Preloaded configurations successfully")
        except Exception as e:
            logger.error(f"Failed to preload configurations: {e}")
    
    def get_cache_health(self) -> Dict[str, Any]:
        """
        Get cache health information.
        
        Returns:
            Dictionary with cache health metrics
        """
        total_requests = self._cache_stats['hits'] + self._cache_stats['misses']
        hit_rate = self._cache_stats['hits'] / max(1, total_requests)
        
        # Check memory usage
        memory_usage = len(self._memory_cache) / max(1, self.max_memory_items)
        
        # Determine health status
        if hit_rate >= 0.8 and memory_usage <= 0.8:
            health_status = "healthy"
        elif hit_rate >= 0.6 and memory_usage <= 0.9:
            health_status = "warning"
        else:
            health_status = "critical"
        
        return {
            'status': health_status,
            'hit_rate': hit_rate,
            'memory_usage': memory_usage,
            'total_requests': total_requests,
            'cache_efficiency': self._cache_stats['sets'] / max(1, self._cache_stats['invalidations']),
            'last_optimization': getattr(self, '_last_optimization', None),
        }
    
    def auto_optimize(self, threshold: float = 0.1):
        """
        Automatically optimize cache based on performance thresholds.
        
        Args:
            threshold: Performance threshold for triggering optimization
        """
        health = self.get_cache_health()
        
        if health['status'] == 'critical' or health['hit_rate'] < threshold:
            self.optimize_cache()
            self._last_optimization = time.time()
            logger.info("Auto-optimized cache due to performance issues")
    
    def export_cache_data(self) -> Dict[str, Any]:
        """
        Export cache data for analysis.
        
        Returns:
            Dictionary with cache export data
        """
        return {
            'cache_stats': self._cache_stats.copy(),
            'memory_cache_keys': list(self._memory_cache.keys()),
            'cache_health': self.get_cache_health(),
            'configuration': {
                'cache_ttl': self.cache_ttl,
                'max_memory_items': self.max_memory_items,
                'last_updated': self.last_updated,
            }
        }
