"""
Base Spaced Repetition Algorithm

This module provides the abstract base class for all spaced repetition algorithms.
It defines the common interface and shared functionality that all algorithms must implement.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple
from enum import Enum
from django.utils import timezone
from datetime import timedelta


class ReviewQuality(Enum):
    """Review quality ratings for spaced repetition algorithms."""
    COMPLETE_BLACKOUT = 0
    INCORRECT_EASY = 1
    INCORRECT_HESITANT = 2
    CORRECT_DIFFICULT = 3
    CORRECT_HESITANT = 4
    PERFECT = 5


class BaseSpacedRepetitionAlgorithm(ABC):
    """
    Abstract base class for spaced repetition algorithms.
    
    All spaced repetition algorithms must inherit from this class and implement
    the required methods. This ensures consistent behavior across different
    algorithm implementations.
    """
    
    def __init__(self):
        self.algorithm_name = self.__class__.__name__
        self.min_interval = 1  # Minimum interval in days
        self.max_interval = 36500  # Maximum interval in days (100 years)
    
    @abstractmethod
    def calculate_next_interval(
        self, 
        current_interval: float, 
        quality: ReviewQuality,
        repetitions: int,
        ease_factor: float
    ) -> Tuple[float, float, int]:
        """
        Calculate the next interval for a card based on review quality.
        
        Args:
            current_interval: Current interval in days
            quality: Review quality rating
            repetitions: Number of successful repetitions
            ease_factor: Current ease factor
            
        Returns:
            Tuple of (new_interval, new_ease_factor, new_repetitions)
        """
        pass
    
    @abstractmethod
    def is_due(self, flashcard) -> bool:
        """
        Check if a flashcard is due for review.
        
        Args:
            flashcard: Flashcard instance to check
            
        Returns:
            True if the card is due, False otherwise
        """
        pass
    
    @abstractmethod
    def get_due_date(self, flashcard) -> Optional[timezone.datetime]:
        """
        Get the due date for a flashcard.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Due date or None if not applicable
        """
        pass
    
    def validate_quality(self, quality: int) -> ReviewQuality:
        """
        Validate and convert quality rating to ReviewQuality enum.
        
        Args:
            quality: Quality rating (0-5)
            
        Returns:
            Validated ReviewQuality enum value
            
        Raises:
            ValueError: If quality is not in valid range
        """
        if not isinstance(quality, int) or quality < 0 or quality > 5:
            raise ValueError("Quality must be an integer between 0 and 5")
        
        return ReviewQuality(quality)
    
    def clamp_interval(self, interval: float) -> float:
        """
        Clamp interval to valid range.
        
        Args:
            interval: Interval in days
            
        Returns:
            Clamped interval within min_interval and max_interval
        """
        return max(self.min_interval, min(interval, self.max_interval))
    
    def calculate_review_score(self, quality: ReviewQuality) -> float:
        """
        Calculate a normalized review score from quality rating.
        
        Args:
            quality: Review quality rating
            
        Returns:
            Normalized score between 0.0 and 1.0
        """
        return quality.value / 5.0
    
    def get_algorithm_info(self) -> Dict[str, Any]:
        """
        Get information about this algorithm.
        
        Returns:
            Dictionary with algorithm metadata
        """
        return {
            'name': self.algorithm_name,
            'min_interval': self.min_interval,
            'max_interval': self.max_interval,
            'supports_ease_factor': hasattr(self, 'ease_factor'),
            'supports_repetitions': hasattr(self, 'repetitions'),
            'description': self.__doc__ or 'No description available'
        }
    
    def reset_card(self, flashcard) -> Dict[str, Any]:
        """
        Reset a card to initial state.
        
        Args:
            flashcard: Flashcard instance to reset
            
        Returns:
            Dictionary with reset values
        """
        return {
            'interval': 0,
            'repetitions': 0,
            'ease_factor': 2.5,
            'next_review': timezone.now(),
            'last_review': None,
            'total_reviews': 0,
            'correct_reviews': 0
        }
    
    def get_review_statistics(self, flashcard) -> Dict[str, Any]:
        """
        Get review statistics for a flashcard.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with review statistics
        """
        return {
            'total_reviews': getattr(flashcard, 'total_reviews', 0),
            'correct_reviews': getattr(flashcard, 'correct_reviews', 0),
            'accuracy_rate': self._calculate_accuracy_rate(flashcard),
            'current_streak': self._calculate_current_streak(flashcard),
            'longest_streak': getattr(flashcard, 'longest_streak', 0),
            'average_quality': getattr(flashcard, 'average_quality', 0.0)
        }
    
    def _calculate_accuracy_rate(self, flashcard) -> float:
        """Calculate accuracy rate for a flashcard."""
        total = getattr(flashcard, 'total_reviews', 0)
        if total == 0:
            return 0.0
        return getattr(flashcard, 'correct_reviews', 0) / total
    
    def _calculate_current_streak(self, flashcard) -> int:
        """Calculate current correct answer streak."""
        # This is a simplified implementation
        # In practice, you might want to track this in the database
        return getattr(flashcard, 'current_streak', 0)
