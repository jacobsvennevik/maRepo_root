# Generation App Services Package
# 
# This package contains all the services for the generation app,
# including AI integration, flashcard generation, and spaced repetition.
#
# Main modules:
# - scheduler: Spaced repetition scheduling services
# - spaced_repetition: Core spaced repetition algorithms
# - interleaving: Interleaved study session management
# - diagnostic_generator: Pre-lecture diagnostic generation
# - flashcard_generator: Flashcard content generation

# Export scheduler module
from . import scheduler

# Export the main spaced_repetition module (not the package)
from .spaced_repetition import SpacedRepetitionScheduler, ReviewQuality, LeitnerBox

# Export core scheduler classes
from .scheduler_core import ReviewScheduleManager

# Export interleaving module
from . import interleaving

# Export core services
from .ai_client_factory import AIClientFactory
from .diagnostic_generator import DiagnosticGenerator
from .flashcard_generator import FlashcardGenerator
from .difficulty_dial import DifficultyDialService
from .mock_ai_client import MockAIClient

__all__ = [
    # Module exports
    'scheduler',
    'spaced_repetition', 
    'interleaving',
    
    # Core service classes
    'ReviewScheduleManager',
    'AIClientFactory',
    'DiagnosticGenerator',
    'FlashcardGenerator',
    'DifficultyDialService',
    'MockAIClient',
]

# Version information
__version__ = "2.0.0"
__author__ = "Generation App Refactoring Team"
__description__ = "Core services for the generation app"
