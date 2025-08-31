"""
Leitner Box System Algorithm Implementation

This module implements the Leitner box system, a simple but effective
spaced repetition method using physical or virtual boxes.
"""

from typing import Tuple, Dict, Any, List
from django.utils import timezone
from datetime import timedelta
from .base_algorithm import BaseSpacedRepetitionAlgorithm, ReviewQuality


class LeitnerAlgorithm(BaseSpacedRepetitionAlgorithm):
    """
    Leitner Box System Algorithm Implementation.
    
    The Leitner system uses a series of boxes with increasing intervals.
    Cards move between boxes based on performance:
    - Correct answers move cards to higher boxes (longer intervals)
    - Incorrect answers move cards back to lower boxes (shorter intervals)
    
    Key features:
    - Simple box-based progression
    - Fixed interval progression
    - Easy to understand and implement
    - Good for beginners and simple memorization
    """
    
    def __init__(self):
        super().__init__()
        self.algorithm_name = "Leitner Box System"
        self.max_boxes = 5
        self.box_intervals = [1, 3, 7, 14, 30]  # Days between reviews
        
    def calculate_next_interval(
        self, 
        current_interval: float, 
        quality: ReviewQuality,
        repetitions: int,
        ease_factor: float
    ) -> Tuple[float, float, int]:
        """
        Calculate next interval using Leitner box system.
        
        Args:
            current_interval: Current interval in days
            quality: Review quality rating (0-5)
            repetitions: Current box number (0-4)
            ease_factor: Not used in Leitner system (kept for compatibility)
            
        Returns:
            Tuple of (new_interval, new_ease_factor, new_box_number)
        """
        # Validate quality
        quality = self.validate_quality(quality.value)
        
        # Determine new box number based on quality
        new_box = self._calculate_new_box(quality, repetitions)
        
        # Calculate new interval based on box number
        new_interval = self._get_interval_for_box(new_box)
        
        # Ease factor is not used in Leitner system, maintain for compatibility
        new_ease_factor = ease_factor
        
        return new_interval, new_ease_factor, new_box
    
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
    
    def _calculate_new_box(self, quality: ReviewQuality, current_box: int) -> int:
        """
        Calculate new box number based on review quality.
        
        Args:
            quality: Review quality rating
            current_box: Current box number (0-4)
            
        Returns:
            New box number
        """
        if quality.value >= 3:  # Good response
            # Move to next box (or stay at max if already there)
            return min(current_box + 1, self.max_boxes - 1)
        else:  # Poor response
            # Move back to first box
            return 0
    
    def _get_interval_for_box(self, box_number: int) -> float:
        """
        Get the interval for a specific box number.
        
        Args:
            box_number: Box number (0-4)
            
        Returns:
            Interval in days
        """
        if 0 <= box_number < len(self.box_intervals):
            return self.box_intervals[box_number]
        
        # Fallback for invalid box numbers
        return 1.0
    
    def get_box_progression(self, flashcard) -> Dict[str, Any]:
        """
        Get information about the card's box progression.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with box progression information
        """
        current_box = getattr(flashcard, 'repetitions', 0)
        current_box = min(current_box, self.max_boxes - 1)
        
        progression = {
            'current_box': current_box,
            'max_boxes': self.max_boxes,
            'box_intervals': self.box_intervals,
            'current_interval': self._get_interval_for_box(current_box),
            'next_review': getattr(flashcard, 'next_review', None),
            'box_history': self._get_box_history(flashcard),
            'progress_percentage': self._calculate_progress_percentage(current_box)
        }
        
        return progression
    
    def _get_box_history(self, flashcard) -> List[Dict[str, Any]]:
        """
        Get the history of box movements for a flashcard.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            List of box movement records
        """
        # This would typically come from a separate model tracking box movements
        # For now, return a simplified version
        history = []
        
        if hasattr(flashcard, 'last_review') and flashcard.last_review:
            history.append({
                'date': flashcard.last_review,
                'box': getattr(flashcard, 'repetitions', 0),
                'quality': getattr(flashcard, 'last_quality', None)
            })
        
        return history
    
    def _calculate_progress_percentage(self, current_box: int) -> float:
        """
        Calculate progress percentage through the box system.
        
        Args:
            current_box: Current box number
            
        Returns:
            Progress percentage (0.0 to 1.0)
        """
        return (current_box + 1) / self.max_boxes
    
    def get_study_recommendations(self, flashcard) -> List[str]:
        """
        Get study recommendations based on current box position.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            List of study recommendations
        """
        recommendations = []
        current_box = getattr(flashcard, 'repetitions', 0)
        
        if current_box == 0:
            recommendations.append("Card is in the first box - review daily until mastered")
        elif current_box < 2:
            recommendations.append("Card is progressing well - continue regular reviews")
        elif current_box >= 3:
            recommendations.append("Card is in advanced boxes - consider reducing review frequency")
        
        if hasattr(flashcard, 'last_review'):
            days_since_review = (timezone.now() - flashcard.last_review).days
            if days_since_review > 30:
                recommendations.append("Card hasn't been reviewed recently - may need relearning")
        
        return recommendations
    
    def get_box_statistics(self, user) -> Dict[str, Any]:
        """
        Get statistics about box distribution for a user.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with box statistics
        """
        # This would typically query the database for actual statistics
        # For now, return a template structure
        return {
            'total_cards': 0,
            'box_distribution': {
                'box_0': 0,  # Daily reviews
                'box_1': 0,  # Every 3 days
                'box_2': 0,  # Weekly
                'box_3': 0,  # Bi-weekly
                'box_4': 0   # Monthly
            },
            'average_progress': 0.0,
            'cards_due_today': 0,
            'cards_due_this_week': 0
        }
    
    def reset_card_to_box(self, flashcard, target_box: int = 0) -> Dict[str, Any]:
        """
        Reset a card to a specific box.
        
        Args:
            flashcard: Flashcard instance
            target_box: Target box number (0-4)
            
        Returns:
            Dictionary with reset values
        """
        if not 0 <= target_box < self.max_boxes:
            raise ValueError(f"Invalid box number: {target_box}. Must be 0-{self.max_boxes-1}")
        
        new_interval = self._get_interval_for_box(target_box)
        
        return {
            'interval': new_interval,
            'repetitions': target_box,  # Use repetitions field to store box number
            'ease_factor': 2.5,  # Not used but maintained for compatibility
            'next_review': timezone.now() + timedelta(days=new_interval),
            'last_review': timezone.now(),
            'box_number': target_box
        }
