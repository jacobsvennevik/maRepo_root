"""
Configuration Management Package

This package provides centralized configuration management for the generation app,
including service configurations, algorithm parameters, and feature flags.
"""

from .config_manager import ConfigurationManager
from .config_schemas import (
    SpacedRepetitionConfig,
    InterleavingConfig,
    DiagnosticConfig,
    AIProviderConfig,
    FeatureFlagsConfig
)
from .config_validators import ConfigValidator
from .config_cache import ConfigCache
from .config_migrations import ConfigMigrationManager

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
]

# Version information
__version__ = "1.0.0"
__author__ = "Generation App Configuration Team"
__description__ = "Centralized configuration management for generation services"
