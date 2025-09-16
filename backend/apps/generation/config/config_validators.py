"""
Configuration Validators

This module provides advanced validation and constraint checking
for configuration objects and their relationships.
"""

from typing import Dict, Any, List, Optional, Union, Callable
from dataclasses import dataclass, field
from .config_schemas import GlobalConfig, SpacedRepetitionConfig, InterleavingConfig
import re
import logging

logger = logging.getLogger(__name__)


@dataclass
class ValidationRule:
    """A validation rule with condition and error message."""
    condition: Callable[[Any], bool]
    error_message: str
    severity: str = "error"  # error, warning, info
    field_path: Optional[str] = None


@dataclass
class ValidationResult:
    """Result of a validation operation."""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    info: List[str] = field(default_factory=list)
    field_errors: Dict[str, List[str]] = field(default_factory=dict)
    
    def add_error(self, error: str, field_path: Optional[str] = None):
        """Add an error message."""
        self.errors.append(error)
        self.is_valid = False
        
        if field_path:
            if field_path not in self.field_errors:
                self.field_errors[field_path] = []
            self.field_errors[field_path].append(error)
    
    def add_warning(self, warning: str, field_path: Optional[str] = None):
        """Add a warning message."""
        self.warnings.append(warning)
    
    def add_info(self, info: str, field_path: Optional[str] = None):
        """Add an info message."""
        self.info.append(info)
    
    def merge(self, other: 'ValidationResult'):
        """Merge another validation result into this one."""
        self.errors.extend(other.errors)
        self.warnings.extend(other.warnings)
        self.info.extend(other.info)
        self.is_valid = self.is_valid and other.is_valid
        
        for field_path, errors in other.field_errors.items():
            if field_path not in self.field_errors:
                self.field_errors[field_path] = []
            self.field_errors[field_path].extend(errors)


class ConfigValidator:
    """
    Advanced configuration validator with custom rules and constraint checking.
    
    This validator provides:
    - Custom validation rules
    - Cross-field validation
    - Business logic validation
    - Performance optimization
    - Detailed error reporting
    """
    
    def __init__(self):
        """Initialize the validator with default rules."""
        self._validation_rules: List[ValidationRule] = []
        self._custom_validators: Dict[str, Callable] = {}
        self._cross_field_validators: List[Callable] = []
        
        # Register default validation rules
        self._register_default_rules()
    
    def _register_default_rules(self):
        """Register default validation rules."""
        # Spaced Repetition validation rules
        self.add_rule(
            ValidationRule(
                condition=lambda config: config.spaced_repetition.sm2_initial_ease_factor >= 1.0,
                error_message="SM2 initial ease factor must be at least 1.0",
                field_path="spaced_repetition.sm2_initial_ease_factor"
            )
        )
        
        self.add_rule(
            ValidationRule(
                condition=lambda config: config.spaced_repetition.sm2_minimum_ease_factor >= 1.0,
                error_message="SM2 minimum ease factor must be at least 1.0",
                field_path="spaced_repetition.sm2_minimum_ease_factor"
            )
        )
        
        # Interleaving validation rules
        self.add_rule(
            ValidationRule(
                condition=lambda config: sum(config.interleaving.default_weights.values()) > 0.9,
                error_message="Interleaving weights must sum to approximately 1.0",
                field_path="interleaving.default_weights"
            )
        )
        
        # AI Provider validation rules
        self.add_rule(
            ValidationRule(
                condition=lambda config: config.ai_provider.request_timeout_seconds > 0,
                error_message="AI request timeout must be positive",
                field_path="ai_provider.request_timeout_seconds"
            )
        )
        
        # Feature flags validation rules
        self.add_rule(
            ValidationRule(
                condition=lambda config: all(0.0 <= p <= 1.0 for p in config.feature_flags.feature_rollouts.values()),
                error_message="Feature rollout percentages must be between 0.0 and 1.0",
                field_path="feature_flags.feature_rollouts"
            )
        )
        
        # Cross-field validators
        self._cross_field_validators.extend([
            self._validate_algorithm_consistency,
            self._validate_performance_settings,
            self._validate_environment_consistency,
        ])
    
    def add_rule(self, rule: ValidationRule):
        """Add a custom validation rule."""
        self._validation_rules.append(rule)
    
    def add_custom_validator(self, name: str, validator: Callable[[GlobalConfig], ValidationResult]):
        """Add a custom validator function."""
        self._custom_validators[name] = validator
    
    def validate(self, config: GlobalConfig) -> ValidationResult:
        """
        Validate a configuration object.
        
        Args:
            config: Configuration object to validate
            
        Returns:
            ValidationResult with validation details
        """
        result = ValidationResult(is_valid=True)
        
        try:
            # Run built-in validation from schemas
            schema_errors = config.validate()
            for error in schema_errors:
                result.add_error(error)
            
            # Run custom validation rules
            for rule in self._validation_rules:
                try:
                    if not rule.condition(config):
                        result.add_error(rule.error_message, rule.field_path)
                except Exception as e:
                    logger.warning(f"Validation rule failed: {e}")
                    result.add_error(f"Validation rule error: {e}", rule.field_path)
            
            # Run cross-field validators
            for validator in self._cross_field_validators:
                try:
                    validator_result = validator(config)
                    result.merge(validator_result)
                except Exception as e:
                    logger.warning(f"Cross-field validator failed: {e}")
                    result.add_error(f"Cross-field validation error: {e}")
            
            # Run custom validators
            for name, validator in self._custom_validators.items():
                try:
                    validator_result = validator(config)
                    result.merge(validator_result)
                except Exception as e:
                    logger.warning(f"Custom validator '{name}' failed: {e}")
                    result.add_error(f"Custom validation error in '{name}': {e}")
            
            # Performance and optimization checks
            performance_result = self._validate_performance_settings(config)
            result.merge(performance_result)
            
            # Security and best practices
            security_result = self._validate_security_settings(config)
            result.merge(security_result)
            
        except Exception as e:
            logger.error(f"Validation process failed: {e}")
            result.add_error(f"Validation process error: {e}")
        
        return result
    
    def _validate_algorithm_consistency(self, config: GlobalConfig) -> ValidationResult:
        """Validate consistency between algorithm configurations."""
        result = ValidationResult(is_valid=True)
        
        # Check if selected algorithms are available
        sr_config = config.spaced_repetition
        if sr_config.default_algorithm not in sr_config.available_algorithms:
            result.add_error(
                f"Default algorithm {sr_config.default_algorithm.value} is not in available algorithms",
                "spaced_repetition.default_algorithm"
            )
        
        # Check algorithm-specific parameter consistency
        if sr_config.default_algorithm.value == 'sm2':
            if sr_config.sm2_initial_ease_factor < sr_config.sm2_minimum_ease_factor:
                result.add_warning(
                    "SM2 initial ease factor is below minimum ease factor",
                    "spaced_repetition.sm2_initial_ease_factor"
                )
        
        elif sr_config.default_algorithm.value == 'leitner':
            if sr_config.leitner_box_count < 2:
                result.add_error(
                    "Leitner box count must be at least 2",
                    "spaced_repetition.leitner_box_count"
                )
        
        return result
    
    def _validate_performance_settings(self, config: GlobalConfig) -> ValidationResult:
        """Validate performance-related settings."""
        result = ValidationResult(is_valid=True)
        
        # Check batch sizes
        sr_config = config.spaced_repetition
        if sr_config.batch_size > 1000:
            result.add_warning(
                "Large batch size may impact performance",
                "spaced_repetition.batch_size"
            )
        
        # Check cache settings
        if config.cache_enabled:
            if sr_config.cache_ttl_seconds < 60:
                result.add_warning(
                    "Very short cache TTL may reduce cache effectiveness",
                    "spaced_repetition.cache_ttl_seconds"
                )
        
        # Check AI provider settings
        ai_config = config.ai_provider
        if ai_config.connection_pool_size > 50:
            result.add_warning(
                "Large connection pool may consume excessive resources",
                "ai_provider.connection_pool_size"
            )
        
        return result
    
    def _validate_environment_consistency(self, config: GlobalConfig) -> ValidationResult:
        """Validate environment-specific configuration consistency."""
        result = ValidationResult(is_valid=True)
        
        # Development environment checks
        if config.environment == "development":
            if not config.debug_mode:
                result.add_warning(
                    "Debug mode is recommended for development environment",
                    "debug_mode"
                )
            
            if config.log_level not in ["DEBUG", "INFO"]:
                result.add_info(
                    "Consider using DEBUG or INFO log level for development",
                    "log_level"
                )
        
        # Production environment checks
        elif config.environment == "production":
            if config.debug_mode:
                result.add_error(
                    "Debug mode should not be enabled in production",
                    "debug_mode"
                )
            
            if config.log_level == "DEBUG":
                result.add_warning(
                    "DEBUG log level in production may impact performance",
                    "log_level"
                )
            
            # Check for sensitive information exposure
            ai_config = config.ai_provider
            if ai_config.api_keys:
                for provider, key in ai_config.api_keys.items():
                    if key and len(key) < 10:
                        result.add_warning(
                            f"API key for {provider} appears to be invalid or too short",
                            f"ai_provider.api_keys.{provider}"
                        )
        
        return result
    
    def _validate_security_settings(self, config: GlobalConfig) -> ValidationResult:
        """Validate security-related settings."""
        result = ValidationResult(is_valid=True)
        
        # Check for weak security settings
        ai_config = config.ai_provider
        
        # Timeout validation
        if ai_config.request_timeout_seconds > 300:  # 5 minutes
            result.add_warning(
                "Very long request timeout may allow resource exhaustion attacks",
                "ai_provider.request_timeout_seconds"
            )
        
        # Rate limiting validation
        if ai_config.requests_per_minute > 1000:
            result.add_warning(
                "High rate limits may allow abuse",
                "ai_provider.requests_per_minute"
            )
        
        # Retry validation
        if ai_config.max_retries > 5:
            result.add_warning(
                "High retry counts may amplify attacks",
                "ai_provider.max_retries"
            )
        
        return result
    
    def validate_partial_config(self, config_dict: Dict[str, Any], 
                               config_type: str) -> ValidationResult:
        """
        Validate a partial configuration dictionary.
        
        Args:
            config_dict: Partial configuration data
            config_type: Type of configuration being validated
            
        Returns:
            ValidationResult with validation details
        """
        result = ValidationResult(is_valid=True)
        
        try:
            # Create a minimal config object for validation
            if config_type == "spaced_repetition":
                from .config_schemas import SpacedRepetitionConfig
                temp_config = SpacedRepetitionConfig(**config_dict)
                schema_errors = temp_config.validate()
            elif config_type == "interleaving":
                from .config_schemas import InterleavingConfig
                temp_config = InterleavingConfig(**config_dict)
                schema_errors = temp_config.validate()
            elif config_type == "ai_provider":
                from .config_schemas import AIProviderConfig
                temp_config = AIProviderConfig(**config_dict)
                schema_errors = temp_config.validate()
            elif config_type == "feature_flags":
                from .config_schemas import FeatureFlagsConfig
                temp_config = FeatureFlagsConfig(**config_dict)
                schema_errors = temp_config.validate()
            else:
                result.add_error(f"Unknown configuration type: {config_type}")
                return result
            
            # Add schema validation errors
            for error in schema_errors:
                result.add_error(error)
            
            # Add custom validation for the specific type
            if config_type == "spaced_repetition":
                result.merge(self._validate_spaced_repetition_partial(temp_config))
            elif config_type == "interleaving":
                result.merge(self._validate_interleaving_partial(temp_config))
            
        except Exception as e:
            result.add_error(f"Partial validation failed: {e}")
        
        return result
    
    def _validate_spaced_repetition_partial(self, config: SpacedRepetitionConfig) -> ValidationResult:
        """Validate partial spaced repetition configuration."""
        result = ValidationResult(is_valid=True)
        
        # Check algorithm-specific parameter consistency
        if hasattr(config, 'default_algorithm') and config.default_algorithm:
            if config.default_algorithm.value == 'sm2':
                if hasattr(config, 'sm2_initial_ease_factor') and hasattr(config, 'sm2_minimum_ease_factor'):
                    if config.sm2_initial_ease_factor < config.sm2_minimum_ease_factor:
                        result.add_warning(
                            "SM2 initial ease factor is below minimum ease factor",
                            "sm2_initial_ease_factor"
                        )
        
        return result
    
    def _validate_interleaving_partial(self, config: InterleavingConfig) -> ValidationResult:
        """Validate partial interleaving configuration."""
        result = ValidationResult(is_valid=True)
        
        # Check weight consistency if weights are provided
        if hasattr(config, 'default_weights') and config.default_weights:
            total_weight = sum(config.default_weights.values())
            if abs(total_weight - 1.0) > 0.01:
                result.add_error(
                    f"Weights must sum to 1.0, got {total_weight:.3f}",
                    "default_weights"
                )
        
        return result
    
    def get_validation_summary(self, result: ValidationResult) -> Dict[str, Any]:
        """
        Get a summary of validation results.
        
        Args:
            result: ValidationResult object
            
        Returns:
            Dictionary with validation summary
        """
        return {
            'is_valid': result.is_valid,
            'error_count': len(result.errors),
            'warning_count': len(result.warnings),
            'info_count': len(result.info),
            'field_error_count': len(result.field_errors),
            'summary': {
                'errors': result.errors[:5],  # First 5 errors
                'warnings': result.warnings[:5],  # First 5 warnings
                'field_errors': dict(list(result.field_errors.items())[:5]),  # First 5 field errors
            }
        }
    
    def suggest_fixes(self, result: ValidationResult) -> List[str]:
        """
        Suggest fixes for validation errors.
        
        Args:
            result: ValidationResult object
            
        Returns:
            List of suggested fixes
        """
        suggestions = []
        
        for error in result.errors:
            if "ease factor" in error.lower():
                if "minimum" in error.lower():
                    suggestions.append("Consider increasing the minimum ease factor to 1.0 or higher")
                elif "initial" in error.lower():
                    suggestions.append("Consider setting initial ease factor between 2.0 and 3.0")
            
            elif "weights" in error.lower():
                suggestions.append("Ensure weights sum to 1.0 (e.g., 0.6, 0.25, 0.15)")
            
            elif "timeout" in error.lower():
                suggestions.append("Set timeout to a reasonable value (30-120 seconds)")
            
            elif "batch size" in error.lower():
                suggestions.append("Consider reducing batch size to 100-500 for better performance")
        
        return suggestions[:10]  # Limit to 10 suggestions
