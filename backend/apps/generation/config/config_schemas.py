"""
Configuration Schemas

This module defines the structure and validation rules for different configuration types
used throughout the generation app.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Union
from enum import Enum
from datetime import timedelta


class DifficultyLevel(Enum):
    """Difficulty levels for learning content."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class AlgorithmType(Enum):
    """Types of spaced repetition algorithms."""
    SM2 = "sm2"
    LEITNER = "leitner"
    SUPER_MEMO_2 = "super_memo_2"
    CUSTOM = "custom"


class AIProvider(Enum):
    """Supported AI providers."""
    OPENAI = "openai"
    GEMINI = "gemini"
    ANTHROPIC = "anthropic"
    MOCK = "mock"


@dataclass
class SpacedRepetitionConfig:
    """
    Configuration for spaced repetition algorithms.
    
    This configuration controls the behavior of spaced repetition algorithms
    including intervals, ease factors, and algorithm-specific parameters.
    """
    
    # Algorithm selection
    default_algorithm: AlgorithmType = AlgorithmType.SM2
    available_algorithms: List[AlgorithmType] = field(default_factory=lambda: [
        AlgorithmType.SM2, AlgorithmType.LEITNER, AlgorithmType.SUPER_MEMO_2
    ])
    
    # SM2 Algorithm parameters
    sm2_initial_ease_factor: float = 2.5
    sm2_minimum_ease_factor: float = 1.3
    sm2_ease_factor_bonus: float = 0.1
    sm2_ease_factor_penalty: float = 0.15
    
    # Leitner Algorithm parameters
    leitner_box_count: int = 5
    leitner_promotion_threshold: int = 2
    leitner_demotion_threshold: int = 1
    leitner_interval_multiplier: float = 2.0
    
    # General parameters
    max_interval_days: int = 365
    min_interval_days: int = 1
    grace_period_hours: int = 12
    review_quality_threshold: float = 0.6
    
    # Performance tuning
    batch_size: int = 100
    cache_ttl_seconds: int = 300
    max_concurrent_reviews: int = 10
    
    # Validation rules
    def validate(self) -> List[str]:
        """Validate configuration parameters."""
        errors = []
        
        if self.sm2_initial_ease_factor < 1.0 or self.sm2_initial_ease_factor > 5.0:
            errors.append("SM2 initial ease factor must be between 1.0 and 5.0")
        
        if self.sm2_minimum_ease_factor < 1.0:
            errors.append("SM2 minimum ease factor must be at least 1.0")
        
        if self.leitner_box_count < 2 or self.leitner_box_count > 10:
            errors.append("Leitner box count must be between 2 and 10")
        
        if self.max_interval_days < self.min_interval_days:
            errors.append("Max interval must be greater than min interval")
        
        if self.batch_size < 1 or self.batch_size > 1000:
            errors.append("Batch size must be between 1 and 1000")
        
        return errors


@dataclass
class InterleavingConfig:
    """
    Configuration for interleaving session generation.
    
    This configuration controls how interleaving sessions are composed,
    including weights, constraints, and session parameters.
    """
    
    # Session composition weights
    default_weights: Dict[str, float] = field(default_factory=lambda: {
        'due': 0.6,
        'interleave': 0.25,
        'new': 0.15
    })
    
    # Session size configuration
    min_session_size: int = 5
    max_session_size: int = 50
    default_session_size: int = 15
    
    # Difficulty-based adjustments
    difficulty_multipliers: Dict[str, float] = field(default_factory=lambda: {
        'beginner': 0.8,
        'intermediate': 1.0,
        'advanced': 1.2,
        'expert': 1.5
    })
    
    # Topic constraints
    max_same_topic_streak: int = 3
    min_topic_variety: int = 2
    require_contrast_pairs: bool = True
    topic_balance_threshold: float = 0.3
    
    # Learning principle constraints
    max_same_principle_streak: int = 2
    principle_contrast_weight: float = 0.4
    adaptive_difficulty: bool = True
    
    # Performance tuning
    constraint_solver_timeout: int = 30
    relaxation_iterations: int = 5
    cache_session_results: bool = True
    
    # Validation rules
    def validate(self) -> List[str]:
        """Validate configuration parameters."""
        errors = []
        
        # Check weights sum to approximately 1.0
        total_weight = sum(self.default_weights.values())
        if abs(total_weight - 1.0) > 0.01:
            errors.append(f"Weights must sum to 1.0, got {total_weight:.3f}")
        
        # Check session size bounds
        if self.min_session_size < 1:
            errors.append("Min session size must be at least 1")
        if self.max_session_size < self.min_session_size:
            errors.append("Max session size must be greater than min session size")
        if self.default_session_size < self.min_session_size or self.default_session_size > self.max_session_size:
            errors.append("Default session size must be within min/max bounds")
        
        # Check difficulty multipliers
        for level, multiplier in self.difficulty_multipliers.items():
            if multiplier <= 0:
                errors.append(f"Difficulty multiplier for {level} must be positive")
        
        # Check constraint parameters
        if self.max_same_topic_streak < 1:
            errors.append("Max same topic streak must be at least 1")
        if self.topic_balance_threshold < 0 or self.topic_balance_threshold > 1:
            errors.append("Topic balance threshold must be between 0 and 1")
        
        return errors


@dataclass
class DiagnosticConfig:
    """
    Configuration for diagnostic sessions and assessments.
    
    This configuration controls diagnostic session behavior,
    including timing, question selection, and feedback options.
    """
    
    # Session timing
    default_time_limit_minutes: int = 30
    grace_period_minutes: int = 5
    auto_submit_delay_seconds: int = 300
    
    # Question configuration
    min_questions_per_session: int = 3
    max_questions_per_session: int = 20
    default_questions_per_session: int = 10
    
    # Question selection
    question_types: List[str] = field(default_factory=lambda: [
        'MCQ', 'SHORT_ANSWER', 'TRUE_FALSE'
    ])
    bloom_levels: List[str] = field(default_factory=lambda: [
        'Remember', 'Understand', 'Apply', 'Analyze'
    ])
    difficulty_distribution: Dict[str, float] = field(default_factory=lambda: {
        'EASY': 0.3,
        'MEDIUM': 0.5,
        'HARD': 0.2
    })
    
    # Feedback and scoring
    immediate_feedback: bool = False
    show_correct_answers: bool = True
    partial_credit: bool = True
    adaptive_scoring: bool = True
    
    # Performance tracking
    track_response_time: bool = True
    track_hint_usage: bool = True
    track_attempts: bool = True
    analytics_enabled: bool = True
    
    # Validation rules
    def validate(self) -> List[str]:
        """Validate configuration parameters."""
        errors = []
        
        # Check timing parameters
        if self.default_time_limit_minutes < 5:
            errors.append("Default time limit must be at least 5 minutes")
        if self.grace_period_minutes < 0:
            errors.append("Grace period cannot be negative")
        
        # Check question parameters
        if self.min_questions_per_session < 1:
            errors.append("Min questions per session must be at least 1")
        if self.max_questions_per_session < self.min_questions_per_session:
            errors.append("Max questions must be greater than min questions")
        
        # Check difficulty distribution
        total_distribution = sum(self.difficulty_distribution.values())
        if abs(total_distribution - 1.0) > 0.01:
            errors.append(f"Difficulty distribution must sum to 1.0, got {total_distribution:.3f}")
        
        return errors


@dataclass
class AIProviderConfig:
    """
    Configuration for AI service providers.
    
    This configuration controls AI service behavior,
    including API keys, rate limits, and fallback strategies.
    """
    
    # Provider selection
    primary_provider: AIProvider = AIProvider.GEMINI
    fallback_providers: List[AIProvider] = field(default_factory=lambda: [
        AIProvider.OPENAI, AIProvider.MOCK
    ])
    
    # API configuration
    api_keys: Dict[str, str] = field(default_factory=dict)
    api_endpoints: Dict[str, str] = field(default_factory=dict)
    request_timeout_seconds: int = 30
    
    # Rate limiting
    requests_per_minute: int = 60
    requests_per_hour: int = 1000
    burst_limit: int = 10
    
    # Model configuration
    default_models: Dict[str, str] = field(default_factory=lambda: {
        'gemini': 'gemini-pro',
        'openai': 'gpt-4',
        'anthropic': 'claude-3-sonnet'
    })
    
    # Fallback and retry
    max_retries: int = 3
    retry_delay_seconds: int = 1
    exponential_backoff: bool = True
    circuit_breaker_enabled: bool = True
    
    # Performance tuning
    connection_pool_size: int = 10
    keep_alive_timeout: int = 60
    cache_responses: bool = True
    cache_ttl_seconds: int = 3600
    
    # Validation rules
    def validate(self) -> List[str]:
        """Validate configuration parameters."""
        errors = []
        
        # Check provider configuration
        if self.primary_provider not in [AIProvider.GEMINI, AIProvider.OPENAI, AIProvider.ANTHROPIC]:
            errors.append("Primary provider must be a valid AI provider")
        
        # Check rate limiting
        if self.requests_per_minute < 1:
            errors.append("Requests per minute must be at least 1")
        if self.requests_per_hour < self.requests_per_minute:
            errors.append("Requests per hour must be greater than per minute")
        
        # Check timeout and retry parameters
        if self.request_timeout_seconds < 1:
            errors.append("Request timeout must be at least 1 second")
        if self.max_retries < 0:
            errors.append("Max retries cannot be negative")
        
        # Check connection parameters
        if self.connection_pool_size < 1:
            errors.append("Connection pool size must be at least 1")
        
        return errors


@dataclass
class FeatureFlagsConfig:
    """
    Configuration for feature flags and experimental features.
    
    This configuration controls which features are enabled
    and their rollout percentages.
    """
    
    # Core features
    spaced_repetition_enabled: bool = True
    interleaving_enabled: bool = True
    diagnostic_assessments_enabled: bool = True
    ai_generation_enabled: bool = True
    
    # Experimental features
    adaptive_learning_enabled: bool = False
    social_learning_enabled: bool = False
    gamification_enabled: bool = False
    analytics_dashboard_enabled: bool = True
    
    # Rollout percentages (0.0 to 1.0)
    feature_rollouts: Dict[str, float] = field(default_factory=lambda: {
        'adaptive_learning': 0.1,
        'social_learning': 0.05,
        'gamification': 0.2,
        'advanced_analytics': 0.3
    })
    
    # User targeting
    beta_users: List[str] = field(default_factory=list)
    admin_users: List[str] = field(default_factory=list)
    feature_groups: Dict[str, List[str]] = field(default_factory=dict)
    
    # Environment-specific flags
    development_features: bool = False
    staging_features: bool = False
    production_features: bool = True
    
    # Validation rules
    def validate(self) -> List[str]:
        """Validate configuration parameters."""
        errors = []
        
        # Check rollout percentages
        for feature, percentage in self.feature_rollouts.items():
            if percentage < 0.0 or percentage > 1.0:
                errors.append(f"Rollout percentage for {feature} must be between 0.0 and 1.0")
        
        # Check user lists
        if not isinstance(self.beta_users, list):
            errors.append("Beta users must be a list")
        if not isinstance(self.admin_users, list):
            errors.append("Admin users must be a list")
        
        return errors


@dataclass
class GlobalConfig:
    """
    Global configuration that combines all configuration types.
    
    This is the main configuration object that contains all
    service-specific configurations.
    """
    
    # Service configurations
    spaced_repetition: SpacedRepetitionConfig = field(default_factory=SpacedRepetitionConfig)
    interleaving: InterleavingConfig = field(default_factory=InterleavingConfig)
    diagnostic: DiagnosticConfig = field(default_factory=DiagnosticConfig)
    ai_provider: AIProviderConfig = field(default_factory=AIProviderConfig)
    feature_flags: FeatureFlagsConfig = field(default_factory=FeatureFlagsConfig)
    
    # Global settings
    environment: str = "development"
    debug_mode: bool = False
    log_level: str = "INFO"
    cache_enabled: bool = True
    
    # Validation rules
    def validate(self) -> List[str]:
        """Validate all configuration components."""
        errors = []
        
        # Validate each service configuration
        errors.extend(self.spaced_repetition.validate())
        errors.extend(self.interleaving.validate())
        errors.extend(self.diagnostic.validate())
        errors.extend(self.ai_provider.validate())
        errors.extend(self.feature_flags.validate())
        
        # Validate global settings
        if self.environment not in ["development", "staging", "production"]:
            errors.append("Environment must be development, staging, or production")
        
        if self.log_level not in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]:
            errors.append("Log level must be a valid logging level")
        
        return errors
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            'spaced_repetition': self.spaced_repetition.__dict__,
            'interleaving': self.interleaving.__dict__,
            'diagnostic': self.diagnostic.__dict__,
            'ai_provider': self.ai_provider.__dict__,
            'feature_flags': self.feature_flags.__dict__,
            'environment': self.environment,
            'debug_mode': self.debug_mode,
            'log_level': self.log_level,
            'cache_enabled': self.cache_enabled,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GlobalConfig':
        """Create configuration from dictionary."""
        return cls(
            spaced_repetition=SpacedRepetitionConfig(**data.get('spaced_repetition', {})),
            interleaving=InterleavingConfig(**data.get('interleaving', {})),
            diagnostic=DiagnosticConfig(**data.get('diagnostic', {})),
            ai_provider=AIProviderConfig(**data.get('ai_provider', {})),
            feature_flags=FeatureFlagsConfig(**data.get('feature_flags', {})),
            environment=data.get('environment', 'development'),
            debug_mode=data.get('debug_mode', False),
            log_level=data.get('log_level', 'INFO'),
            cache_enabled=data.get('cache_enabled', True),
        )
