"""
Configuration Manager

This module provides centralized configuration management for the generation app,
including loading configurations from multiple sources, validation, and caching.
"""

import os
import json
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from .config_schemas import GlobalConfig, SpacedRepetitionConfig, InterleavingConfig
from .config_validators import ConfigValidator
from .config_cache import ConfigCache
import logging

logger = logging.getLogger(__name__)


class ConfigurationManager:
    """
    Centralized configuration manager for the generation app.
    
    This class handles:
    - Loading configurations from multiple sources (files, environment, database)
    - Configuration validation and error handling
    - Configuration caching and performance optimization
    - Dynamic configuration updates
    - Environment-specific configuration overrides
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the configuration manager.
        
        Args:
            config_path: Optional path to configuration file
        """
        self.config_path = config_path or self._get_default_config_path()
        self._config: Optional[GlobalConfig] = None
        self._validator = ConfigValidator()
        self._cache = ConfigCache()
        self._config_sources = []
        self._load_order = []
        
        # Initialize configuration sources
        self._initialize_config_sources()
        
        # Load initial configuration
        self._load_configuration()
    
    def _get_default_config_path(self) -> str:
        """Get default configuration file path."""
        # Try to find config in multiple locations
        possible_paths = [
            os.path.join(settings.BASE_DIR, 'config', 'generation.yaml'),
            os.path.join(settings.BASE_DIR, 'config', 'generation.yml'),
            os.path.join(settings.BASE_DIR, 'config', 'generation.json'),
            os.path.join(settings.BASE_DIR, 'backend', 'apps', 'generation', 'config', 'default.yaml'),
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
        
        # Return a default path for creation
        return os.path.join(settings.BASE_DIR, 'config', 'generation.yaml')
    
    def _initialize_config_sources(self):
        """Initialize configuration sources in priority order."""
        self._config_sources = [
            ('environment', self._load_from_environment),
            ('file', self._load_from_file),
            ('database', self._load_from_database),
            ('defaults', self._load_defaults),
        ]
        
        self._load_order = ['environment', 'file', 'database', 'defaults']
    
    def _load_configuration(self):
        """Load configuration from all sources."""
        try:
            # Start with default configuration
            self._config = GlobalConfig()
            
            # Load from each source in priority order
            for source_name, source_loader in self._config_sources:
                try:
                    source_config = source_loader()
                    if source_config:
                        self._merge_configuration(source_config, source_name)
                        logger.info(f"Loaded configuration from {source_name}")
                except Exception as e:
                    logger.warning(f"Failed to load configuration from {source_name}: {e}")
            
            # Validate final configuration
            self._validate_configuration()
            
            # Cache the configuration
            self._cache.set_config(self._config)
            
            logger.info("Configuration loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            raise ImproperlyConfigured(f"Configuration loading failed: {e}")
    
    def _load_from_environment(self) -> Optional[Dict[str, Any]]:
        """Load configuration from environment variables."""
        config = {}
        
        # Environment-specific overrides
        env = os.getenv('DJANGO_ENV', 'development')
        config['environment'] = env
        
        # Debug mode
        debug = os.getenv('DEBUG', 'False').lower() == 'true'
        config['debug_mode'] = debug
        
        # Log level
        log_level = os.getenv('LOG_LEVEL', 'INFO')
        config['log_level'] = log_level
        
        # Cache settings
        cache_enabled = os.getenv('CACHE_ENABLED', 'True').lower() == 'true'
        config['cache_enabled'] = cache_enabled
        
        # AI Provider settings
        ai_config = {}
        ai_config['primary_provider'] = os.getenv('AI_PRIMARY_PROVIDER', 'gemini')
        ai_config['request_timeout_seconds'] = int(os.getenv('AI_TIMEOUT', '30'))
        ai_config['max_retries'] = int(os.getenv('AI_MAX_RETRIES', '3'))
        
        # API keys (sensitive - only load if explicitly set)
        gemini_key = os.getenv('GEMINI_API_KEY')
        openai_key = os.getenv('OPENAI_API_KEY')
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        
        if gemini_key:
            ai_config['api_keys'] = {'gemini': gemini_key}
        if openai_key:
            ai_config.setdefault('api_keys', {})['openai'] = openai_key
        if anthropic_key:
            ai_config.setdefault('api_keys', {})['anthropic'] = anthropic_key
        
        config['ai_provider'] = ai_config
        
        # Feature flags
        feature_config = {}
        feature_config['spaced_repetition_enabled'] = os.getenv('FEATURE_SPACED_REPETITION', 'True').lower() == 'true'
        feature_config['interleaving_enabled'] = os.getenv('FEATURE_INTERLEAVING', 'True').lower() == 'true'
        feature_config['diagnostic_assessments_enabled'] = os.getenv('FEATURE_DIAGNOSTIC', 'True').lower() == 'true'
        feature_config['ai_generation_enabled'] = os.getenv('FEATURE_AI_GENERATION', 'True').lower() == 'true'
        
        config['feature_flags'] = feature_config
        
        return config if config else None
    
    def _load_from_file(self) -> Optional[Dict[str, Any]]:
        """Load configuration from file."""
        if not os.path.exists(self.config_path):
            logger.info(f"Configuration file not found: {self.config_path}")
            return None
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                if self.config_path.endswith('.yaml') or self.config_path.endswith('.yml'):
                    config = yaml.safe_load(f)
                elif self.config_path.endswith('.json'):
                    config = json.load(f)
                else:
                    logger.warning(f"Unsupported configuration file format: {self.config_path}")
                    return None
                
                logger.info(f"Loaded configuration from file: {self.config_path}")
                return config
                
        except Exception as e:
            logger.error(f"Failed to load configuration file {self.config_path}: {e}")
            return None
    
    def _load_from_database(self) -> Optional[Dict[str, Any]]:
        """Load configuration from database."""
        try:
            # This would typically load from a Configuration model
            # For now, return None as we haven't implemented database storage yet
            return None
        except Exception as e:
            logger.warning(f"Failed to load configuration from database: {e}")
            return None
    
    def _load_defaults(self) -> Optional[Dict[str, Any]]:
        """Load default configuration values."""
        # Return None as defaults are already set in the GlobalConfig class
        return None
    
    def _merge_configuration(self, source_config: Dict[str, Any], source_name: str):
        """
        Merge configuration from a source into the current configuration.
        
        Args:
            source_config: Configuration data from the source
            source_name: Name of the source for logging
        """
        if not source_config:
            return
        
        try:
            # Convert current config to dict for merging
            current_dict = self._config.to_dict()
            
            # Deep merge the configurations
            merged = self._deep_merge(current_dict, source_config)
            
            # Create new GlobalConfig from merged data
            self._config = GlobalConfig.from_dict(merged)
            
            logger.debug(f"Merged configuration from {source_name}")
            
        except Exception as e:
            logger.error(f"Failed to merge configuration from {source_name}: {e}")
            raise
    
    def _deep_merge(self, base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep merge two dictionaries.
        
        Args:
            base: Base dictionary
            update: Dictionary with updates
            
        Returns:
            Merged dictionary
        """
        result = base.copy()
        
        for key, value in update.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def _validate_configuration(self):
        """Validate the current configuration."""
        if not self._config:
            raise ImproperlyConfigured("No configuration loaded")
        
        errors = self._config.validate()
        if errors:
            error_msg = "Configuration validation failed:\n" + "\n".join(f"- {error}" for error in errors)
            logger.error(error_msg)
            raise ImproperlyConfigured(error_msg)
    
    def reload_configuration(self):
        """Reload configuration from all sources."""
        logger.info("Reloading configuration...")
        self._load_configuration()
        logger.info("Configuration reloaded successfully")
    
    def get_config(self) -> GlobalConfig:
        """
        Get the current configuration.
        
        Returns:
            Current GlobalConfig instance
        """
        if not self._config:
            self._load_configuration()
        return self._config
    
    def get_spaced_repetition_config(self) -> SpacedRepetitionConfig:
        """
        Get spaced repetition configuration.
        
        Returns:
            SpacedRepetitionConfig instance
        """
        return self.get_config().spaced_repetition
    
    def get_interleaving_config(self) -> InterleavingConfig:
        """
        Get interleaving configuration.
        
        Returns:
            InterleavingConfig instance
        """
        return self.get_config().interleaving
    
    def get_feature_flag(self, feature_name: str, user_id: Optional[str] = None) -> bool:
        """
        Check if a feature flag is enabled for a user.
        
        Args:
            feature_name: Name of the feature to check
            user_id: Optional user ID for user-specific flags
            
        Returns:
            True if feature is enabled, False otherwise
        """
        config = self.get_config()
        feature_config = config.feature_flags
        
        # Check if feature is globally enabled
        if not getattr(feature_config, f"{feature_name}_enabled", False):
            return False
        
        # Check user-specific flags
        if user_id:
            if user_id in feature_config.admin_users:
                return True
            if user_id in feature_config.beta_users:
                return True
        
        # Check rollout percentage
        rollout_percentage = feature_config.feature_rollouts.get(feature_name, 0.0)
        if rollout_percentage >= 1.0:
            return True
        
        # For now, return based on rollout percentage (simplified)
        # In a real implementation, this would use consistent hashing or similar
        import random
        return random.random() < rollout_percentage
    
    def update_configuration(self, updates: Dict[str, Any], source: str = "runtime"):
        """
        Update configuration at runtime.
        
        Args:
            updates: Configuration updates to apply
            source: Source of the update for tracking
        """
        try:
            logger.info(f"Updating configuration from {source}")
            
            # Merge updates with current configuration
            self._merge_configuration(updates, source)
            
            # Validate updated configuration
            self._validate_configuration()
            
            # Update cache
            self._cache.set_config(self._config)
            
            logger.info(f"Configuration updated successfully from {source}")
            
        except Exception as e:
            logger.error(f"Failed to update configuration from {source}: {e}")
            raise
    
    def export_configuration(self, format: str = 'yaml') -> str:
        """
        Export current configuration to specified format.
        
        Args:
            format: Export format ('yaml', 'json')
            
        Returns:
            Configuration as string in specified format
        """
        if not self._config:
            raise ImproperlyConfigured("No configuration loaded")
        
        config_dict = self._config.to_dict()
        
        if format.lower() == 'json':
            return json.dumps(config_dict, indent=2, default=str)
        elif format.lower() == 'yaml':
            return yaml.dump(config_dict, default_flow_style=False, allow_unicode=True)
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def save_configuration_to_file(self, file_path: Optional[str] = None):
        """
        Save current configuration to file.
        
        Args:
            file_path: Optional file path (uses default if not specified)
        """
        file_path = file_path or self.config_path
        
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Export configuration
            if file_path.endswith('.yaml') or file_path.endswith('.yml'):
                content = self.export_configuration('yaml')
            elif file_path.endswith('.json'):
                content = self.export_configuration('json')
            else:
                # Default to YAML
                file_path = file_path + '.yaml' if '.' not in file_path else file_path.replace('.', '.yaml')
                content = self.export_configuration('yaml')
            
            # Write to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Configuration saved to {file_path}")
            
        except Exception as e:
            logger.error(f"Failed to save configuration to {file_path}: {e}")
            raise
    
    def get_configuration_summary(self) -> Dict[str, Any]:
        """
        Get a summary of the current configuration.
        
        Returns:
            Dictionary with configuration summary
        """
        if not self._config:
            return {'error': 'No configuration loaded'}
        
        config = self._config
        
        return {
            'environment': config.environment,
            'debug_mode': config.debug_mode,
            'log_level': config.log_level,
            'cache_enabled': config.cache_enabled,
            'features': {
                'spaced_repetition': config.feature_flags.spaced_repetition_enabled,
                'interleaving': config.feature_flags.interleaving_enabled,
                'diagnostic': config.feature_flags.diagnostic_assessments_enabled,
                'ai_generation': config.feature_flags.ai_generation_enabled,
            },
            'ai_provider': {
                'primary': config.ai_provider.primary_provider.value,
                'fallbacks': [p.value for p in config.ai_provider.fallback_providers],
                'timeout': config.ai_provider.request_timeout_seconds,
            },
            'sources_loaded': self._load_order,
            'config_file': self.config_path,
            'last_updated': getattr(self._cache, 'last_updated', None),
        }


# Global configuration manager instance
config_manager = ConfigurationManager()


def get_config() -> GlobalConfig:
    """
    Get the global configuration instance.
    
    Returns:
        GlobalConfig instance
    """
    return config_manager.get_config()


def get_spaced_repetition_config() -> SpacedRepetitionConfig:
    """
    Get spaced repetition configuration.
    
    Returns:
        SpacedRepetitionConfig instance
    """
    return config_manager.get_spaced_repetition_config()


def get_interleaving_config() -> InterleavingConfig:
    """
    Get interleaving configuration.
    
    Returns:
        InterleavingConfig instance
    """
    return config_manager.get_interleaving_config()


def is_feature_enabled(feature_name: str, user_id: Optional[str] = None) -> bool:
    """
    Check if a feature is enabled.
    
    Args:
        feature_name: Name of the feature to check
        user_id: Optional user ID for user-specific flags
        
    Returns:
        True if feature is enabled, False otherwise
    """
    return config_manager.get_feature_flag(feature_name, user_id)
