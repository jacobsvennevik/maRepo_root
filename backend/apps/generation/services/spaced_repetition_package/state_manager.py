"""
Card State Manager for Spaced Repetition

This module manages the state and progress tracking for flashcards
in the spaced repetition system.
"""

from typing import Dict, Any, Optional, List
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from .base_algorithm import ReviewQuality


class CardStateManager:
    """
    Manages flashcard state and progress tracking.
    
    This class handles:
    - Card state transitions
    - Progress tracking
    - Review history
    - Performance analytics
    - State persistence
    """
    
    def __init__(self):
        self.state_fields = [
            'interval', 'repetitions', 'ease_factor', 'next_review',
            'last_review', 'total_reviews', 'correct_reviews',
            'current_streak', 'longest_streak', 'average_quality'
        ]
    
    def update_card_state(
        self, 
        flashcard, 
        quality: int, 
        algorithm_instance,
        response_time_seconds: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Update card state after a review.
        
        Args:
            flashcard: Flashcard instance to update
            quality: Review quality rating (0-5)
            algorithm_instance: Algorithm instance for calculations
            response_time_seconds: Time taken to respond
            
        Returns:
            Dictionary with updated state values
        """
        # Validate quality
        quality_enum = algorithm_instance.validate_quality(quality)
        
        # Get current state
        current_state = self._get_current_state(flashcard)
        
        # Calculate new state using algorithm
        new_interval, new_ease_factor, new_repetitions = algorithm_instance.calculate_next_interval(
            current_state['interval'],
            quality_enum,
            current_state['repetitions'],
            current_state['ease_factor']
        )
        
        # Calculate next review date
        next_review = timezone.now() + timedelta(days=new_interval)
        
        # Update statistics
        new_stats = self._update_statistics(
            current_state, quality, response_time_seconds
        )
        
        # Prepare new state
        new_state = {
            'interval': new_interval,
            'repetitions': new_repetitions,
            'ease_factor': new_ease_factor,
            'next_review': next_review,
            'last_review': timezone.now(),
            'last_quality': quality,
            'last_response_time': response_time_seconds,
            **new_stats
        }
        
        # Apply state changes
        self._apply_state_changes(flashcard, new_state)
        
        return new_state
    
    def _get_current_state(self, flashcard) -> Dict[str, Any]:
        """Get current state of a flashcard."""
        state = {}
        
        for field in self.state_fields:
            state[field] = getattr(flashcard, field, self._get_default_value(field))
        
        return state
    
    def _get_default_value(self, field: str) -> Any:
        """Get default value for a state field."""
        defaults = {
            'interval': 0,
            'repetitions': 0,
            'ease_factor': 2.5,
            'next_review': timezone.now(),
            'last_review': None,
            'total_reviews': 0,
            'correct_reviews': 0,
            'current_streak': 0,
            'longest_streak': 0,
            'average_quality': 0.0
        }
        
        return defaults.get(field, None)
    
    def _update_statistics(
        self, 
        current_state: Dict[str, Any], 
        quality: int,
        response_time_seconds: Optional[float]
    ) -> Dict[str, Any]:
        """Update review statistics."""
        total_reviews = current_state['total_reviews'] + 1
        correct_reviews = current_state['correct_reviews']
        
        # Update correct reviews count
        if quality >= 3:  # Good response
            correct_reviews += 1
            new_streak = current_state['current_streak'] + 1
        else:  # Poor response
            new_streak = 0
        
        # Update longest streak
        longest_streak = max(current_state['longest_streak'], new_streak)
        
        # Update average quality
        current_avg = current_state['average_quality']
        new_avg = ((current_avg * (total_reviews - 1)) + quality) / total_reviews
        
        return {
            'total_reviews': total_reviews,
            'correct_reviews': correct_reviews,
            'current_streak': new_streak,
            'longest_streak': longest_streak,
            'average_quality': new_avg
        }
    
    def _apply_state_changes(self, flashcard, new_state: Dict[str, Any]) -> None:
        """Apply state changes to flashcard instance."""
        for field, value in new_state.items():
            if hasattr(flashcard, field):
                setattr(flashcard, field, value)
    
    def get_card_progress(self, flashcard) -> Dict[str, Any]:
        """
        Get comprehensive progress information for a card.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with progress information
        """
        state = self._get_current_state(flashcard)
        
        return {
            'current_state': state,
            'progress_metrics': self._calculate_progress_metrics(state),
            'study_recommendations': self._generate_study_recommendations(state),
            'performance_analysis': self._analyze_performance(state)
        }
    
    def _calculate_progress_metrics(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate progress metrics from state."""
        total_reviews = state['total_reviews']
        
        if total_reviews == 0:
            return {
                'accuracy_rate': 0.0,
                'progress_level': 'new',
                'mastery_score': 0.0,
                'estimated_mastery_days': None
            }
        
        accuracy_rate = state['correct_reviews'] / total_reviews
        
        # Determine progress level
        if total_reviews < 5:
            progress_level = 'learning'
        elif accuracy_rate >= 0.9:
            progress_level = 'mastered'
        elif accuracy_rate >= 0.7:
            progress_level = 'proficient'
        else:
            progress_level = 'needs_work'
        
        # Calculate mastery score (0-100)
        mastery_score = min(100, (accuracy_rate * 100) + (state['current_streak'] * 5))
        
        # Estimate days to mastery
        estimated_mastery_days = self._estimate_mastery_days(state)
        
        return {
            'accuracy_rate': accuracy_rate,
            'progress_level': progress_level,
            'mastery_score': mastery_score,
            'estimated_mastery_days': estimated_mastery_days
        }
    
    def _estimate_mastery_days(self, state: Dict[str, Any]) -> Optional[int]:
        """Estimate days until mastery based on current performance."""
        if state['total_reviews'] < 3:
            return None
        
        accuracy_rate = state['correct_reviews'] / state['total_reviews']
        current_interval = state['interval']
        
        if accuracy_rate >= 0.9:
            return 0  # Already mastered
        
        # Simple estimation based on accuracy and interval
        if accuracy_rate >= 0.7:
            # Good progress, estimate based on current interval
            return int(current_interval * 2)
        else:
            # Needs work, estimate longer time
            return int(current_interval * 4)
    
    def _generate_study_recommendations(self, state: Dict[str, Any]) -> List[str]:
        """Generate study recommendations based on state."""
        recommendations = []
        
        if state['total_reviews'] == 0:
            recommendations.append("New card - start with daily reviews")
            return recommendations
        
        accuracy_rate = state['correct_reviews'] / state['total_reviews']
        
        if accuracy_rate < 0.6:
            recommendations.append("Accuracy below 60% - consider relearning the material")
            recommendations.append("Review more frequently until performance improves")
        
        if state['current_streak'] == 0 and state['total_reviews'] > 5:
            recommendations.append("Breaking streak - focus on understanding the concept")
        
        if state['average_quality'] < 2.5:
            recommendations.append("Low average quality - material may be too difficult")
        
        if state['interval'] > 30:
            recommendations.append("Long interval - consider more frequent reviews")
        
        return recommendations
    
    def _analyze_performance(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance patterns."""
        if state['total_reviews'] < 3:
            return {'insufficient_data': True}
        
        accuracy_rate = state['correct_reviews'] / state['total_reviews']
        
        # Performance trends
        if state['current_streak'] > state['longest_streak'] * 0.8:
            trend = 'improving'
        elif state['current_streak'] < 2:
            trend = 'declining'
        else:
            trend = 'stable'
        
        # Difficulty assessment
        if accuracy_rate >= 0.8:
            difficulty = 'too_easy'
        elif accuracy_rate <= 0.4:
            difficulty = 'too_hard'
        else:
            difficulty = 'appropriate'
        
        return {
            'trend': trend,
            'difficulty': difficulty,
            'consistency': self._calculate_consistency(state),
            'learning_efficiency': self._calculate_learning_efficiency(state)
        }
    
    def _calculate_consistency(self, state: Dict[str, Any]) -> float:
        """Calculate consistency score (0-1)."""
        if state['total_reviews'] < 2:
            return 0.0
        
        # Simple consistency based on streak vs total reviews
        return min(1.0, state['current_streak'] / state['total_reviews'])
    
    def _calculate_learning_efficiency(self, state: Dict[str, Any]) -> float:
        """Calculate learning efficiency score (0-1)."""
        if state['total_reviews'] < 3:
            return 0.0
        
        accuracy_rate = state['correct_reviews'] / state['total_reviews']
        interval_efficiency = min(1.0, 30 / max(1, state['interval']))
        
        # Combine accuracy and interval efficiency
        return (accuracy_rate * 0.7) + (interval_efficiency * 0.3)
    
    def reset_card_state(self, flashcard) -> Dict[str, Any]:
        """
        Reset a card to initial state.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with reset state values
        """
        reset_state = self._get_default_values()
        reset_state['last_review'] = timezone.now()
        
        self._apply_state_changes(flashcard, reset_state)
        
        return reset_state
    
    def _get_default_values(self) -> Dict[str, Any]:
        """Get all default values for state fields."""
        return {
            'interval': 0,
            'repetitions': 0,
            'ease_factor': 2.5,
            'next_review': timezone.now(),
            'last_review': None,
            'total_reviews': 0,
            'correct_reviews': 0,
            'current_streak': 0,
            'longest_streak': 0,
            'average_quality': 0.0
        }
