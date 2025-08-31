"""
Session Manager for Spaced Repetition Scheduling

This module handles the lifecycle of individual review sessions,
including session tracking, statistics, and progress management.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
from ..spaced_repetition import SpacedRepetitionScheduler, ReviewQuality


class ReviewSession:
    """
    Manages a single review session with multiple cards.
    
    This class tracks session statistics, progress, and provides
    methods for managing the review flow during a study session.
    """
    
    def __init__(self, user, session_limit: int = 20):
        self.user = user
        self.session_limit = session_limit
        self.scheduler = SpacedRepetitionScheduler()
        self.session_stats = self._initialize_session_stats()
    
    def _initialize_session_stats(self) -> Dict[str, Any]:
        """Initialize session statistics."""
        return {
            'total_cards': 0,
            'correct_cards': 0,
            'incorrect_cards': 0,
            'session_start': timezone.now(),
            'session_end': None,
            'average_response_time': 0,
            'cards_reviewed': [],
            'algorithm_breakdown': {},
            'learning_state_breakdown': {}
        }
    
    def get_next_card(self):
        """
        Get the next card for review in this session.
        
        Returns:
            Next flashcard due for review, or None if session is complete
        """
        remaining_slots = self.session_limit - self.session_stats['total_cards']
        if remaining_slots <= 0:
            return None
        
        due_cards = self.scheduler.get_due_cards(
            self.user, 
            limit=remaining_slots
        )
        
        if due_cards.exists():
            return due_cards.first()
        return None
    
    def review_card(
        self, 
        flashcard, 
        quality: int, 
        response_time_seconds: Optional[float] = None
    ):
        """
        Review a card and update its schedule.
        
        Args:
            flashcard: Flashcard instance to review
            quality: Review quality (0-5)
            response_time_seconds: Time taken to respond in seconds
        """
        with transaction.atomic():
            # Process the review using the scheduler
            updated_data = self.scheduler.process_review(flashcard, quality)
            
            # Update the flashcard with new scheduling data
            for field, value in updated_data.items():
                setattr(flashcard, field, value)
            flashcard.save()
            
            # Update session statistics
            self._update_session_stats(flashcard, quality, response_time_seconds, updated_data)
    
    def _update_session_stats(
        self, 
        flashcard, 
        quality: int, 
        response_time_seconds: Optional[float], 
        updated_data: Dict[str, Any]
    ):
        """Update session statistics after reviewing a card."""
        # Increment total cards
        self.session_stats['total_cards'] += 1
        
        # Update correct/incorrect counts
        if quality >= ReviewQuality.CORRECT_DIFFICULT:
            self.session_stats['correct_cards'] += 1
        else:
            self.session_stats['incorrect_cards'] += 1
        
        # Track algorithm usage
        algorithm = getattr(flashcard, 'algorithm', 'unknown')
        if algorithm not in self.session_stats['algorithm_breakdown']:
            self.session_stats['algorithm_breakdown'][algorithm] = 0
        self.session_stats['algorithm_breakdown'][algorithm] += 1
        
        # Track learning state
        learning_state = getattr(flashcard, 'learning_state', 'unknown')
        if learning_state not in self.session_stats['learning_state_breakdown']:
            self.session_stats['learning_state_breakdown'][learning_state] = 0
        self.session_stats['learning_state_breakdown'][learning_state] += 1
        
        # Track card review details
        card_review = {
            'card_id': flashcard.id,
            'quality': quality,
            'response_time': response_time_seconds,
            'timestamp': timezone.now(),
            'algorithm_used': algorithm,
            'learning_state': learning_state,
            'new_interval': updated_data.get('interval', 0),
            'new_ease_factor': updated_data.get('ease_factor', 0),
            'repetitions': updated_data.get('repetitions', 0)
        }
        self.session_stats['cards_reviewed'].append(card_review)
    
    def pause_session(self):
        """
        Pause the current session.
        
        This can be useful for temporary interruptions while
        maintaining session state for resumption.
        """
        if not self.session_stats['session_end']:
            self.session_stats['paused_at'] = timezone.now()
            self.session_stats['is_paused'] = True
    
    def resume_session(self):
        """
        Resume a paused session.
        
        Resets the pause state and continues tracking.
        """
        if self.session_stats.get('is_paused'):
            self.session_stats['resumed_at'] = timezone.now()
            self.session_stats['is_paused'] = False
            # Calculate total pause time
            if 'paused_at' in self.session_stats:
                pause_duration = (
                    self.session_stats['resumed_at'] - self.session_stats['paused_at']
                )
                self.session_stats['total_pause_time'] = pause_duration.total_seconds()
    
    def finish_session(self):
        """
        Complete the review session and return final statistics.
        
        Returns:
            Dictionary with comprehensive session statistics
        """
        self.session_stats['session_end'] = timezone.now()
        
        # Calculate session duration
        duration = self.session_stats['session_end'] - self.session_stats['session_start']
        self.session_stats['session_duration_minutes'] = duration.total_seconds() / 60
        
        # Calculate average response time
        response_times = [
            review['response_time'] for review in self.session_stats['cards_reviewed']
            if review['response_time'] is not None
        ]
        if response_times:
            self.session_stats['average_response_time'] = sum(response_times) / len(response_times)
        
        # Calculate accuracy
        if self.session_stats['total_cards'] > 0:
            self.session_stats['accuracy_percentage'] = (
                self.session_stats['correct_cards'] / self.session_stats['total_cards']
            ) * 100
        else:
            self.session_stats['accuracy_percentage'] = 0
        
        # Calculate learning efficiency
        self.session_stats['learning_efficiency'] = self._calculate_learning_efficiency()
        
        # Add session summary
        self.session_stats['session_summary'] = self._generate_session_summary()
        
        return self.session_stats
    
    def _calculate_learning_efficiency(self) -> float:
        """
        Calculate learning efficiency score for the session.
        
        Returns:
            Float between 0.0 and 1.0 representing learning efficiency
        """
        if self.session_stats['total_cards'] == 0:
            return 0.0
        
        # Base efficiency from accuracy
        accuracy_score = self.session_stats['accuracy_percentage'] / 100.0
        
        # Time efficiency (faster is better, but not too fast)
        avg_response_time = self.session_stats['average_response_time']
        if avg_response_time > 0:
            # Optimal response time is around 5-15 seconds
            if 5 <= avg_response_time <= 15:
                time_score = 1.0
            elif avg_response_time < 5:
                time_score = 0.7  # Too fast might indicate guessing
            else:
                time_score = max(0.3, 1.0 - (avg_response_time - 15) / 30)
        else:
            time_score = 0.5
        
        # Consistency score (how evenly distributed the reviews are)
        consistency_score = self._calculate_consistency_score()
        
        # Weighted combination
        efficiency = (
            accuracy_score * 0.5 +
            time_score * 0.3 +
            consistency_score * 0.2
        )
        
        return min(1.0, max(0.0, efficiency))
    
    def _calculate_consistency_score(self) -> float:
        """
        Calculate consistency score based on review distribution.
        
        Returns:
            Float between 0.0 and 1.0 representing consistency
        """
        if len(self.session_stats['cards_reviewed']) < 2:
            return 1.0
        
        # Calculate time intervals between reviews
        timestamps = [review['timestamp'] for review in self.session_stats['cards_reviewed']]
        timestamps.sort()
        
        intervals = []
        for i in range(1, len(timestamps)):
            interval = (timestamps[i] - timestamps[i-1]).total_seconds()
            intervals.append(interval)
        
        if not intervals:
            return 1.0
        
        # Calculate coefficient of variation (lower is more consistent)
        import statistics
        mean_interval = statistics.mean(intervals)
        if mean_interval == 0:
            return 1.0
        
        try:
            std_interval = statistics.stdev(intervals)
            cv = std_interval / mean_interval
            # Convert to 0-1 score (lower CV = higher consistency)
            consistency_score = max(0.0, 1.0 - min(1.0, cv))
        except statistics.StatisticsError:
            consistency_score = 0.5
        
        return consistency_score
    
    def _generate_session_summary(self) -> Dict[str, Any]:
        """Generate a summary of the session performance."""
        total_cards = self.session_stats['total_cards']
        correct_cards = self.session_stats['correct_cards']
        
        if total_cards == 0:
            return {
                'performance': 'no_cards_reviewed',
                'message': 'No cards were reviewed in this session.'
            }
        
        accuracy = self.session_stats['accuracy_percentage']
        
        if accuracy >= 90:
            performance = 'excellent'
            message = f'Outstanding performance! {accuracy:.1f}% accuracy achieved.'
        elif accuracy >= 80:
            performance = 'very_good'
            message = f'Great work! {accuracy:.1f}% accuracy shows strong retention.'
        elif accuracy >= 70:
            performance = 'good'
            message = f'Good session with {accuracy:.1f}% accuracy. Keep practicing!'
        elif accuracy >= 60:
            performance = 'fair'
            message = f'Fair performance at {accuracy:.1f}%. Consider reviewing difficult cards.'
        else:
            performance = 'needs_improvement'
            message = f'Accuracy of {accuracy:.1f}% suggests need for more review practice.'
        
        return {
            'performance': performance,
            'message': message,
            'accuracy': accuracy,
            'cards_reviewed': total_cards,
            'correct_answers': correct_cards,
            'incorrect_answers': total_cards - correct_cards
        }
    
    def get_session_progress(self) -> Dict[str, Any]:
        """
        Get current session progress without finishing the session.
        
        Returns:
            Dictionary with current progress information
        """
        return {
            'cards_reviewed': self.session_stats['total_cards'],
            'cards_remaining': self.session_limit - self.session_stats['total_cards'],
            'session_limit': self.session_limit,
            'progress_percentage': (self.session_stats['total_cards'] / self.session_limit) * 100,
            'accuracy_so_far': self.session_stats['accuracy_percentage'],
            'session_duration_minutes': (
                (timezone.now() - self.session_stats['session_start']).total_seconds() / 60
            )
        }
    
    def reset_session(self):
        """Reset the session to start fresh."""
        self.session_stats = self._initialize_session_stats()
    
    def extend_session(self, additional_cards: int):
        """
        Extend the session to allow more cards.
        
        Args:
            additional_cards: Number of additional cards to allow
        """
        self.session_limit += additional_cards
        self.session_stats['session_extended'] = True
        self.session_stats['extension_amount'] = additional_cards
