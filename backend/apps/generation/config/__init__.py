"""
Configuration Management Package

This package provides centralized configuration management for the generation app,
including service configurations, algorithm parameters, and feature flags.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .config_manager import ConfigurationManager
    from .config_schemas import (
        SpacedRepetitionConfig,
        InterleavingConfig,
        DiagnosticConfig,
        AIProviderConfig,
        FeatureFlagsConfig,
        GlobalConfig,
    )
    from .config_validators import ConfigValidator
    from .config_cache import ConfigCache
    from .config_migrations import ConfigMigrationManager

def get_configuration_manager():
    from .config_manager import ConfigurationManager, config_manager
    # Ensure config is loaded on first use
    if getattr(config_manager, '_config', None) is None:
        config_manager.reload_configuration()
    return config_manager

__all__ = [
    'ConfigurationManager',
    'SpacedRepetitionConfig',
    'InterleavingConfig', 
    'DiagnosticConfig',
    'AIProviderConfig',
    'FeatureFlagsConfig',
    'ConfigValidator',
    'ConfigCache',
    'ConfigMigrationManager',
    'get_configuration_manager',
]

# Version information
__version__ = "1.0.0"
__author__ = "Generation App Configuration Team"
__description__ = "Centralized configuration management for generation services"
