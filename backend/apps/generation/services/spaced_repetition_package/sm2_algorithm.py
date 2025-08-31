"""
SuperMemo 2 Algorithm Implementation

This module implements the SuperMemo 2 spaced repetition algorithm,
which is one of the most widely used and effective spaced repetition algorithms.
"""

from typing import Tuple, Dict, Any, List
from django.utils import timezone
from datetime import timedelta
from .base_algorithm import BaseSpacedRepetitionAlgorithm, ReviewQuality


class SM2Algorithm(BaseSpacedRepetitionAlgorithm):
    """
    SuperMemo 2 Algorithm Implementation.
    
    The SuperMemo 2 algorithm is based on research by Piotr Wozniak and
    provides excellent retention rates for long-term learning.
    
    Key features:
    - Adaptive intervals based on review quality
    - Ease factor adjustment for personalized difficulty
    - Repetition counting for spaced intervals
    - Quality-based interval calculation
    """
    
    def __init__(self):
        super().__init__()
        self.algorithm_name = "SuperMemo 2"
        self.default_ease_factor = 2.5
        self.min_ease_factor = 1.3
        self.ease_factor_bonus = 0.1
        self.ease_factor_penalty = 0.08
    
    def calculate_next_interval(
        self, 
        current_interval: float, 
        quality: ReviewQuality,
        repetitions: int,
        ease_factor: float
    ) -> Tuple[float, float, int]:
        """
        Calculate next interval using SuperMemo 2 algorithm.
        
        Args:
            current_interval: Current interval in days
            quality: Review quality rating (0-5)
            repetitions: Number of successful repetitions
            ease_factor: Current ease factor
            
        Returns:
            Tuple of (new_interval, new_ease_factor, new_repetitions)
        """
        # Validate quality
        quality = self.validate_quality(quality.value)
        
        # Calculate new ease factor
        new_ease_factor = self._calculate_new_ease_factor(quality, ease_factor)
        
        # Calculate new interval
        new_interval = self._calculate_new_interval(
            quality, repetitions, current_interval, new_ease_factor
        )
        
        # Update repetition count
        new_repetitions = self._update_repetitions(quality, repetitions)
        
        # Clamp interval to valid range
        new_interval = self.clamp_interval(new_interval)
        
        return new_interval, new_ease_factor, new_repetitions
    
    def is_due(self, flashcard) -> bool:
        """
        Check if flashcard is due for review.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            True if due, False otherwise
        """
        if not hasattr(flashcard, 'next_review') or flashcard.next_review is None:
            return True
        
        return timezone.now() >= flashcard.next_review
    
    def get_due_date(self, flashcard) -> timezone.datetime:
        """
        Get the due date for a flashcard.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Due date
        """
        if hasattr(flashcard, 'next_review') and flashcard.next_review:
            return flashcard.next_review
        return timezone.now()
    
    def _calculate_new_ease_factor(
        self, 
        quality: ReviewQuality, 
        current_ease_factor: float
    ) -> float:
        """
        Calculate new ease factor based on review quality.
        
        Args:
            quality: Review quality rating
            current_ease_factor: Current ease factor
            
        Returns:
            New ease factor
        """
        if quality.value >= 4:  # Good or perfect response
            # Increase ease factor for good performance
            new_ease_factor = current_ease_factor + self.ease_factor_bonus
        elif quality.value == 3:  # Correct but difficult
            # Keep ease factor unchanged
            new_ease_factor = current_ease_factor
        else:  # Poor response
            # Decrease ease factor for poor performance
            new_ease_factor = current_ease_factor - self.ease_factor_penalty
        
        # Ensure ease factor doesn't go below minimum
        return max(new_ease_factor, self.min_ease_factor)
    
    def _calculate_new_interval(
        self, 
        quality: ReviewQuality, 
        repetitions: int, 
        current_interval: float,
        ease_factor: float
    ) -> float:
        """
        Calculate new interval based on quality and repetitions.
        
        Args:
            quality: Review quality rating
            repetitions: Number of successful repetitions
            current_interval: Current interval in days
            ease_factor: Current ease factor
            
        Returns:
            New interval in days
        """
        if quality.value < 3:  # Poor response
            # Reset to 1 day interval
            return 1.0
        
        if repetitions == 0:  # First review
            return 1.0
        elif repetitions == 1:  # Second review
            return 6.0
        else:  # Subsequent reviews
            # Use ease factor to calculate interval
            return current_interval * ease_factor
    
    def _update_repetitions(
        self, 
        quality: ReviewQuality, 
        current_repetitions: int
    ) -> int:
        """
        Update repetition count based on review quality.
        
        Args:
            quality: Review quality rating
            current_repetitions: Current repetition count
            
        Returns:
            New repetition count
        """
        if quality.value >= 3:  # Good response
            return current_repetitions + 1
        else:  # Poor response
            return 0
    
    def get_optimal_review_schedule(self, flashcard) -> Dict[str, Any]:
        """
        Get optimal review schedule for a flashcard.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with schedule recommendations
        """
        current_interval = getattr(flashcard, 'interval', 0)
        repetitions = getattr(flashcard, 'repetitions', 0)
        ease_factor = getattr(flashcard, 'ease_factor', self.default_ease_factor)
        
        # Calculate intervals for different quality levels
        schedule = {}
        for quality_value in range(6):
            quality = ReviewQuality(quality_value)
            interval, new_ease_factor, new_repetitions = self.calculate_next_interval(
                current_interval, quality, repetitions, ease_factor
            )
            
            schedule[f'quality_{quality_value}'] = {
                'interval': interval,
                'ease_factor': new_ease_factor,
                'repetitions': new_repetitions,
                'next_review': timezone.now() + timedelta(days=interval)
            }
        
        return {
            'current_state': {
                'interval': current_interval,
                'repetitions': repetitions,
                'ease_factor': ease_factor
            },
            'quality_scenarios': schedule,
            'recommendations': self._generate_recommendations(flashcard)
        }
    
    def _generate_recommendations(self, flashcard) -> List[str]:
        """Generate study recommendations based on flashcard state."""
        recommendations = []
        
        if hasattr(flashcard, 'ease_factor') and flashcard.ease_factor < 1.5:
            recommendations.append("Consider reviewing easier cards to improve confidence")
        
        if hasattr(flashcard, 'total_reviews') and flashcard.total_reviews > 20:
            if hasattr(flashcard, 'accuracy_rate') and flashcard.accuracy_rate < 0.7:
                recommendations.append("Accuracy below 70% - consider adjusting difficulty")
        
        if hasattr(flashcard, 'last_review'):
            days_since_review = (timezone.now() - flashcard.last_review).days
            if days_since_review > 30:
                recommendations.append("Card hasn't been reviewed recently - may need relearning")
        
        return recommendations
