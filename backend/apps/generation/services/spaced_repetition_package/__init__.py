# Spaced Repetition Services Package
# 
# This package contains the refactored spaced repetition services,
# broken down into focused, maintainable modules.
#
# Modules:
# - base_algorithm.py: Abstract base class for spaced repetition algorithms
# - sm2_algorithm.py: SuperMemo 2 algorithm implementation
# - leitner_algorithm.py: Leitner box system implementation
# - state_manager.py: Card state and progress management
# - algorithm_factory.py: Algorithm selection and creation

from .base_algorithm import BaseSpacedRepetitionAlgorithm, ReviewQuality
from .sm2_algorithm import SM2Algorithm
from .leitner_algorithm import LeitnerAlgorithm
from .state_manager import CardStateManager
from .algorithm_factory import AlgorithmFactory

__all__ = [
    # Main classes
    'BaseSpacedRepetitionAlgorithm',
    'ReviewQuality',
    'SM2Algorithm',
    'LeitnerAlgorithm',
    'CardStateManager',
    'AlgorithmFactory'
]

# Version information
__version__ = "2.0.0"
__author__ = "Generation App Refactoring Team"
__description__ = "Refactored spaced repetition algorithm services"
