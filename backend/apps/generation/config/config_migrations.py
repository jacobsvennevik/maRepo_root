"""
Configuration Migration Manager

This module provides configuration migration functionality for handling
schema evolution and configuration updates across different versions.
"""

import json
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional, Union, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class ConfigMigration:
    """Represents a configuration migration."""
    
    def __init__(self, version: str, description: str, 
                 migration_func: callable, rollback_func: Optional[callable] = None):
        """
        Initialize a configuration migration.
        
        Args:
            version: Migration version
            description: Description of what the migration does
            migration_func: Function to perform the migration
            rollback_func: Optional function to rollback the migration
        """
        self.version = version
        self.description = description
        self.migration_func = migration_func
        self.rollback_func = rollback_func
        self.applied_at: Optional[datetime] = None
        self.status: str = "pending"  # pending, applied, failed, rolled_back
    
    def apply(self, config: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Apply the migration to a configuration.
        
        Args:
            config: Configuration to migrate
            
        Returns:
            Tuple of (success, message)
        """
        try:
            logger.info(f"Applying migration {self.version}: {self.description}")
            
            # Apply the migration
            migrated_config = self.migration_func(config)
            
            # Update migration status
            self.applied_at = datetime.now()
            self.status = "applied"
            
            logger.info(f"Migration {self.version} applied successfully")
            return True, f"Migration {self.version} applied successfully"
            
        except Exception as e:
            self.status = "failed"
            error_msg = f"Migration {self.version} failed: {e}"
            logger.error(error_msg)
            return False, error_msg
    
    def rollback(self, config: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Rollback the migration.
        
        Args:
            config: Configuration to rollback
            
        Returns:
            Tuple of (success, message)
        """
        if not self.rollback_func:
            return False, f"No rollback function available for migration {self.version}"
        
        try:
            logger.info(f"Rolling back migration {self.version}")
            
            # Perform rollback
            rolled_back_config = self.rollback_func(config)
            
            # Update migration status
            self.status = "rolled_back"
            
            logger.info(f"Migration {self.version} rolled back successfully")
            return True, f"Migration {self.version} rolled back successfully"
            
        except Exception as e:
            error_msg = f"Rollback of migration {self.version} failed: {e}"
            logger.error(error_msg)
            return False, error_msg


class ConfigMigrationManager:
    """
    Manages configuration migrations and schema evolution.
    
    This class provides:
    - Migration registration and management
    - Automatic migration detection and application
    - Rollback functionality
    - Migration history tracking
    - Schema version compatibility checking
    """
    
    def __init__(self, migrations_dir: Optional[str] = None):
        """
        Initialize the migration manager.
        
        Args:
            migrations_dir: Directory containing migration files
        """
        self.migrations: List[ConfigMigration] = []
        self.migrations_dir = migrations_dir
        self.migration_history: List[Dict[str, Any]] = []
        self.current_version = "1.0.0"
        
        # Register default migrations
        self._register_default_migrations()
        
        # Load migration history if available
        self._load_migration_history()
    
    def _register_default_migrations(self):
        """Register default configuration migrations."""
        # Migration 1.1.0: Add AI provider configuration
        self.register_migration(
            ConfigMigration(
                version="1.1.0",
                description="Add AI provider configuration with fallback support",
                migration_func=self._migrate_to_1_1_0,
                rollback_func=self._rollback_from_1_1_0
            )
        )
        
        # Migration 1.2.0: Add feature flags
        self.register_migration(
            ConfigMigration(
                version="1.2.0",
                description="Add feature flags and rollout configuration",
                migration_func=self._migrate_to_1_2_0,
                rollback_func=self._rollback_from_1_2_0
            )
        )
        
        # Migration 1.3.0: Enhanced validation
        self.register_migration(
            ConfigMigration(
                version="1.3.0",
                description="Add enhanced validation and business rules",
                migration_func=self._migrate_to_1_3_0,
                rollback_func=self._rollback_from_1_3_0
            )
        )
    
    def register_migration(self, migration: ConfigMigration):
        """
        Register a new migration.
        
        Args:
            migration: ConfigurationMigration instance
        """
        # Check if migration with this version already exists
        existing = next((m for m in self.migrations if m.version == migration.version), None)
        if existing:
            logger.warning(f"Migration {migration.version} already registered, replacing")
            self.migrations.remove(existing)
        
        self.migrations.append(migration)
        
        # Sort migrations by version
        self.migrations.sort(key=lambda m: self._parse_version(m.version))
        
        logger.info(f"Registered migration {migration.version}: {migration.description}")
    
    def _parse_version(self, version: str) -> Tuple[int, int, int]:
        """Parse version string into tuple for comparison."""
        try:
            parts = version.split('.')
            return tuple(int(part) for part in parts[:3])
        except (ValueError, IndexError):
            return (0, 0, 0)
    
    def get_pending_migrations(self, current_version: str) -> List[ConfigMigration]:
        """
        Get migrations that need to be applied.
        
        Args:
            current_version: Current configuration version
            
        Returns:
            List of pending migrations
        """
        current = self._parse_version(current_version)
        
        pending = []
        for migration in self.migrations:
            migration_version = self._parse_version(migration.version)
            if migration_version > current and migration.status == "pending":
                pending.append(migration)
        
        return pending
    
    def migrate_configuration(self, config: Dict[str, Any], 
                            target_version: Optional[str] = None) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Migrate configuration to target version.
        
        Args:
            config: Configuration to migrate
            target_version: Target version (defaults to latest)
            
        Returns:
            Tuple of (success, message, migrated_config)
        """
        try:
            current_version = config.get('version', '1.0.0')
            
            if target_version is None:
                target_version = self._get_latest_version()
            
            if current_version == target_version:
                return True, f"Configuration already at version {target_version}", config
            
            # Get pending migrations
            pending_migrations = self.get_pending_migrations(current_version)
            
            if not pending_migrations:
                return True, f"No migrations needed to reach version {target_version}", config
            
            # Apply migrations
            migrated_config = config.copy()
            applied_migrations = []
            
            for migration in pending_migrations:
                if self._parse_version(migration.version) > self._parse_version(target_version):
                    break
                
                success, message = migration.apply(migrated_config)
                if not success:
                    # Rollback applied migrations
                    self._rollback_migrations(applied_migrations, migrated_config)
                    return False, f"Migration failed: {message}", config
                
                applied_migrations.append(migration)
                
                # Update version in config
                migrated_config['version'] = migration.version
                
                # Record migration in history
                self._record_migration(migration, success=True)
            
            # Update to final version
            migrated_config['version'] = target_version
            migrated_config['last_migrated'] = datetime.now().isoformat()
            
            logger.info(f"Configuration migrated from {current_version} to {target_version}")
            return True, f"Successfully migrated to version {target_version}", migrated_config
            
        except Exception as e:
            error_msg = f"Migration process failed: {e}"
            logger.error(error_msg)
            return False, error_msg, config
    
    def _rollback_migrations(self, migrations: List[ConfigMigration], config: Dict[str, Any]):
        """Rollback a list of migrations."""
        for migration in reversed(migrations):
            try:
                migration.rollback(config)
            except Exception as e:
                logger.error(f"Failed to rollback migration {migration.version}: {e}")
    
    def _record_migration(self, migration: ConfigMigration, success: bool):
        """Record a migration in the history."""
        record = {
            'version': migration.version,
            'description': migration.description,
            'applied_at': migration.applied_at.isoformat() if migration.applied_at else None,
            'status': migration.status,
            'success': success,
            'timestamp': datetime.now().isoformat()
        }
        
        self.migration_history.append(record)
        self._save_migration_history()
    
    def _get_latest_version(self) -> str:
        """Get the latest available migration version."""
        if not self.migrations:
            return "1.0.0"
        
        return max(self.migrations, key=lambda m: self._parse_version(m.version)).version
    
    def rollback_to_version(self, config: Dict[str, Any], 
                           target_version: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Rollback configuration to a specific version.
        
        Args:
            config: Configuration to rollback
            target_version: Version to rollback to
            
        Returns:
            Tuple of (success, message, rolled_back_config)
        """
        try:
            current_version = config.get('version', '1.0.0')
            
            if current_version == target_version:
                return True, f"Configuration already at version {target_version}", config
            
            # Find migrations to rollback
            migrations_to_rollback = []
            for migration in reversed(self.migrations):
                migration_version = self._parse_version(migration.version)
                target_ver = self._parse_version(target_version)
                
                if migration_version <= target_ver:
                    break
                
                if migration.status == "applied":
                    migrations_to_rollback.append(migration)
            
            if not migrations_to_rollback:
                return True, f"No rollbacks needed to reach version {target_version}", config
            
            # Perform rollbacks
            rolled_back_config = config.copy()
            
            for migration in migrations_to_rollback:
                success, message = migration.rollback(rolled_back_config)
                if not success:
                    return False, f"Rollback failed: {message}", config
                
                # Update version in config
                rolled_back_config['version'] = migration.version
            
            # Update to target version
            rolled_back_config['version'] = target_version
            rolled_back_config['last_rolled_back'] = datetime.now().isoformat()
            
            logger.info(f"Configuration rolled back from {current_version} to {target_version}")
            return True, f"Successfully rolled back to version {target_version}", rolled_back_config
            
        except Exception as e:
            error_msg = f"Rollback process failed: {e}"
            logger.error(error_msg)
            return False, error_msg, config
    
    def get_migration_status(self) -> Dict[str, Any]:
        """
        Get the status of all migrations.
        
        Returns:
            Dictionary with migration status information
        """
        status = {
            'current_version': self.current_version,
            'total_migrations': len(self.migrations),
            'applied_migrations': len([m for m in self.migrations if m.status == "applied"]),
            'pending_migrations': len([m for m in self.migrations if m.status == "pending"]),
            'failed_migrations': len([m for m in self.migrations if m.status == "failed"]),
            'migrations': []
        }
        
        for migration in self.migrations:
            status['migrations'].append({
                'version': migration.version,
                'description': migration.description,
                'status': migration.status,
                'applied_at': migration.applied_at.isoformat() if migration.applied_at else None
            })
        
        return status
    
    def _load_migration_history(self):
        """Load migration history from file."""
        if not self.migrations_dir:
            return
        
        history_file = Path(self.migrations_dir) / "migration_history.json"
        if history_file.exists():
            try:
                with open(history_file, 'r') as f:
                    self.migration_history = json.load(f)
                logger.info(f"Loaded migration history from {history_file}")
            except Exception as e:
                logger.warning(f"Failed to load migration history: {e}")
    
    def _save_migration_history(self):
        """Save migration history to file."""
        if not self.migrations_dir:
            return
        
        history_file = Path(self.migrations_dir) / "migration_history.json"
        try:
            history_file.parent.mkdir(parents=True, exist_ok=True)
            with open(history_file, 'w') as f:
                json.dump(self.migration_history, f, indent=2)
        except Exception as e:
            logger.warning(f"Failed to save migration history: {e}")
    
    # Default migration functions
    
    def _migrate_to_1_1_0(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Migrate configuration to version 1.1.0."""
        migrated_config = config.copy()
        
        # Add AI provider configuration if not present
        if 'ai_provider' not in migrated_config:
            migrated_config['ai_provider'] = {
                'primary_provider': 'gemini',
                'fallback_providers': ['openai', 'mock'],
                'api_keys': {},
                'request_timeout_seconds': 30,
                'max_retries': 3,
                'connection_pool_size': 10,
                'keep_alive_timeout': 60,
                'cache_responses': True,
                'cache_ttl_seconds': 3600
            }
        
        return migrated_config
    
    def _rollback_from_1_1_0(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Rollback from version 1.1.0."""
        rolled_back_config = config.copy()
        
        # Remove AI provider configuration
        if 'ai_provider' in rolled_back_config:
            del rolled_back_config['ai_provider']
        
        return rolled_back_config
    
    def _migrate_to_1_2_0(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Migrate configuration to version 1.2.0."""
        migrated_config = config.copy()
        
        # Add feature flags configuration if not present
        if 'feature_flags' not in migrated_config:
            migrated_config['feature_flags'] = {
                'spaced_repetition_enabled': True,
                'interleaving_enabled': True,
                'diagnostic_assessments_enabled': True,
                'ai_generation_enabled': True,
                'adaptive_learning_enabled': False,
                'social_learning_enabled': False,
                'gamification_enabled': False,
                'analytics_dashboard_enabled': True,
                'feature_rollouts': {
                    'adaptive_learning': 0.1,
                    'social_learning': 0.05,
                    'gamification': 0.2,
                    'advanced_analytics': 0.3
                },
                'beta_users': [],
                'admin_users': [],
                'feature_groups': {},
                'development_features': False,
                'staging_features': False,
                'production_features': True
            }
        
        return migrated_config
    
    def _rollback_from_1_2_0(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Rollback from version 1.2.0."""
        rolled_back_config = config.copy()
        
        # Remove feature flags configuration
        if 'feature_flags' in rolled_back_config:
            del rolled_back_config['feature_flags']
        
        return rolled_back_config
    
    def _migrate_to_1_3_0(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Migrate configuration to version 1.3.0."""
        migrated_config = config.copy()
        
        # Add enhanced validation configuration
        if 'validation' not in migrated_config:
            migrated_config['validation'] = {
                'strict_mode': False,
                'auto_fix': True,
                'custom_rules': [],
                'cross_field_validation': True,
                'performance_checks': True,
                'security_checks': True
            }
        
        # Add performance monitoring
        if 'monitoring' not in migrated_config:
            migrated_config['monitoring'] = {
                'enabled': True,
                'metrics_collection': True,
                'performance_tracking': True,
                'alert_thresholds': {
                    'cache_hit_rate': 0.8,
                    'response_time_ms': 1000,
                    'error_rate': 0.05
                }
            }
        
        return migrated_config
    
    def _rollback_from_1_3_0(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Rollback from version 1.3.0."""
        rolled_back_config = config.copy()
        
        # Remove enhanced validation and monitoring
        if 'validation' in rolled_back_config:
            del rolled_back_config['validation']
        
        if 'monitoring' in rolled_back_config:
            del rolled_back_config['monitoring']
        
        return rolled_back_config
    
    def validate_migration_path(self, from_version: str, to_version: str) -> Dict[str, Any]:
        """
        Validate if a migration path is possible.
        
        Args:
            from_version: Starting version
            to_version: Target version
            
        Returns:
            Dictionary with validation results
        """
        result = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'migrations_needed': [],
            'estimated_time': '0 minutes'
        }
        
        try:
            from_ver = self._parse_version(from_version)
            to_ver = self._parse_version(to_version)
            
            if from_ver == to_ver:
                result['migrations_needed'] = []
                return result
            
            if from_ver > to_ver:
                # Rollback scenario
                migrations_needed = [
                    m for m in self.migrations
                    if self._parse_version(m.version) <= from_ver and 
                       self._parse_version(m.version) > to_ver and
                       m.status == "applied"
                ]
            else:
                # Upgrade scenario
                migrations_needed = [
                    m for m in self.migrations
                    if self._parse_version(m.version) > from_ver and 
                       self._parse_version(m.version) <= to_ver and
                       m.status == "pending"
                ]
            
            result['migrations_needed'] = [
                {
                    'version': m.version,
                    'description': m.description,
                    'type': 'rollback' if from_ver > to_ver else 'upgrade'
                }
                for m in migrations_needed
            ]
            
            # Estimate time (rough estimate: 1 minute per migration)
            estimated_minutes = len(migrations_needed)
            result['estimated_time'] = f"{estimated_minutes} minute{'s' if estimated_minutes != 1 else ''}"
            
            # Check for potential issues
            if len(migrations_needed) > 10:
                result['warnings'].append("Large number of migrations may take significant time")
            
            # Check if all required migrations have rollback functions
            if from_ver > to_ver:  # Rollback scenario
                missing_rollbacks = [m for m in migrations_needed if not m.rollback_func]
                if missing_rollbacks:
                    result['warnings'].append(f"{len(missing_rollbacks)} migrations lack rollback functions")
            
        except Exception as e:
            result['valid'] = False
            result['errors'].append(f"Validation failed: {e}")
        
        return result
