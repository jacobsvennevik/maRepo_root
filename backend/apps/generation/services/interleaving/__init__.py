# Interleaving Services Package
# 
# This package contains the refactored interleaving session generation
# services, broken down into focused, maintainable modules.
#
# Modules:
# - base_algorithm.py: Abstract base class for interleaving algorithms
# - weight_calculator.py: Scoring and prioritization algorithms
# - constraint_solver.py: Constraint satisfaction with relaxation ladder
# - session_validator.py: Session validation and quality assurance
# - session_generator.py: Core session generation logic
# - utils.py: Helper functions and utilities

from .base_algorithm import BaseInterleavingAlgorithm
from .weight_calculator import WeightCalculator
from .constraint_solver import ConstraintSolver
from .session_validator import SessionValidator
from .session_generator import SessionGenerator

# Import utility functions
from .utils import (
    generate_session_hash,
    create_stable_key_function,
    calculate_topic_diversity_score,
    calculate_difficulty_variance,
    normalize_scores,
    calculate_contrast_score,
    get_flashcard_profile_info,
    calculate_urgency_score,
    calculate_recency_score,
    validate_session_config,
    format_session_metadata,
    count_contrast_pairs,
    get_optimal_weights_for_difficulty,
    log_session_event
)

__all__ = [
    # Main classes
    'BaseInterleavingAlgorithm',
    'WeightCalculator',
    'ConstraintSolver',
    'SessionValidator',
    'SessionGenerator',
    
    # Utility functions
    'generate_session_hash',
    'create_stable_key_function',
    'calculate_topic_diversity_score',
    'calculate_difficulty_variance',
    'normalize_scores',
    'calculate_contrast_score',
    'get_flashcard_profile_info',
    'calculate_urgency_score',
    'calculate_recency_score',
    'validate_session_config',
    'format_session_metadata',
    'count_contrast_pairs',
    'get_optimal_weights_for_difficulty',
    'log_session_event'
]

# Version information
__version__ = "2.0.0"
__author__ = "Generation App Refactoring Team"
__description__ = "Refactored interleaving session generation services"
