"""
New Spaced Repetition Service

This is the refactored version of the spaced repetition service,
using the new modular structure for better maintainability and testability.
"""

from typing import Dict, List, Any, Optional
from django.utils import timezone
from django.db.models import Q
from spaced_repetition import AlgorithmFactory, CardStateManager


class SpacedRepetitionService:
    """
    Refactored service for spaced repetition algorithms and card management.
    
    This service now uses the modular architecture:
    - AlgorithmFactory: Algorithm selection and creation
    - CardStateManager: State tracking and progress management
    - Individual algorithms: SM2, Leitner, etc.
    
    The original 368-line service has been broken down into focused modules
    while maintaining the same public API.
    """
    
    def __init__(self):
        self.algorithm_factory = AlgorithmFactory()
        self.state_manager = CardStateManager()
    
    def process_review(
        self, 
        flashcard, 
        quality: int, 
        response_time_seconds: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Process a flashcard review and update its state.
        
        Args:
            flashcard: Flashcard instance to review
            quality: Review quality rating (0-5)
            response_time_seconds: Time taken to respond
            
        Returns:
            Dictionary with updated state values
        """
        # Get appropriate algorithm for this card
        algorithm = self.algorithm_factory.get_algorithm_for_card(flashcard)
        
        # Update card state using the state manager
        new_state = self.state_manager.update_card_state(
            flashcard, quality, algorithm, response_time_seconds
        )
        
        return new_state
    
    def get_due_cards(self, user, limit: Optional[int] = None) -> List[Any]:
        """
        Get cards that are due for review.
        
        Args:
            user: User instance
            limit: Maximum number of cards to return
            
        Returns:
            List of due flashcards
        """
        # This would typically query the database for due cards
        # For now, return a placeholder
        from backend.apps.generation.models import Flashcard
        
        due_cards = Flashcard.objects.filter(
            user=user,
            next_review__lte=timezone.now()
        ).order_by('next_review')
        
        if limit:
            due_cards = due_cards[:limit]
        
        return due_cards
    
    def get_review_schedule(self, user, days_ahead: int = 7) -> Dict[str, Any]:
        """
        Get review schedule for the next specified days.
        
        Args:
            user: User instance
            days_ahead: Number of days to look ahead
            
        Returns:
            Dictionary with daily review counts
        """
        from backend.apps.generation.models import Flashcard
        
        schedule = {}
        today = timezone.now().date()
        
        for i in range(days_ahead):
            target_date = today + timezone.timedelta(days=i)
            next_day = target_date + timezone.timedelta(days=1)
            
            # Count cards due on this date
            count = Flashcard.objects.filter(
                user=user,
                next_review__gte=target_date,
                next_review__lt=next_day
            ).count()
            
            schedule[target_date.isoformat()] = {
                'date': target_date.isoformat(),
                'due_count': count,
                'day_name': target_date.strftime('%A')
            }
        
        return {
            'schedule': schedule,
            'total_due': sum(day['due_count'] for day in schedule.values()),
            'days_ahead': days_ahead
        }
    
    def get_algorithm_info(self, algorithm_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get information about available algorithms.
        
        Args:
            algorithm_name: Specific algorithm name, or None for all
            
        Returns:
            Dictionary with algorithm information
        """
        if algorithm_name:
            try:
                algorithm = self.algorithm_factory.get_algorithm(algorithm_name)
                return algorithm.get_algorithm_info()
            except ValueError:
                return {'error': f'Algorithm {algorithm_name} not found'}
        
        return self.algorithm_factory.get_available_algorithms()
    
    def get_card_progress(self, flashcard) -> Dict[str, Any]:
        """
        Get comprehensive progress information for a card.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with progress information
        """
        return self.state_manager.get_card_progress(flashcard)
    
    def reset_card(self, flashcard) -> Dict[str, Any]:
        """
        Reset a card to initial state.
        
        Args:
            flashcard: Flashcard instance
            
        Returns:
            Dictionary with reset state values
        """
        return self.state_manager.reset_card_state(flashcard)
    
    def get_algorithm_comparison(self) -> Dict[str, Any]:
        """
        Get comparison of all available algorithms.
        
        Returns:
            Dictionary with algorithm comparison data
        """
        return self.algorithm_factory.get_algorithm_comparison()
    
    def register_custom_algorithm(
        self, 
        name: str, 
        algorithm_class
    ) -> Dict[str, Any]:
        """
        Register a custom algorithm with the service.
        
        Args:
            name: Name for the algorithm
            algorithm_class: Algorithm class to register
            
        Returns:
            Dictionary with registration result
        """
        try:
            self.algorithm_factory.register_algorithm(name, algorithm_class)
            return {
                'success': True,
                'message': f'Algorithm {name} registered successfully',
                'available_algorithms': list(self.algorithm_factory._algorithms.keys())
            }
        except ValueError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_study_recommendations(self, user) -> Dict[str, Any]:
        """
        Get personalized study recommendations for a user.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with study recommendations
        """
        from backend.apps.generation.models import Flashcard
        
        # Get user's flashcards
        user_cards = Flashcard.objects.filter(user=user)
        
        if not user_cards.exists():
            return {
                'message': 'No flashcards found. Start by creating some cards!',
                'recommendations': []
            }
        
        # Analyze overall performance
        total_cards = user_cards.count()
        due_cards = user_cards.filter(next_review__lte=timezone.now()).count()
        
        recommendations = []
        
        if due_cards > 20:
            recommendations.append(f"You have {due_cards} cards due. Consider breaking this into smaller study sessions.")
        
        if due_cards == 0:
            recommendations.append("All caught up! Consider adding new material or reviewing mastered cards.")
        
        # Check for cards that might need attention
        struggling_cards = user_cards.filter(
            Q(average_quality__lt=2.5) | Q(current_streak__lt=2)
        ).count()
        
        if struggling_cards > 0:
            recommendations.append(f"You have {struggling_cards} cards that might need extra attention.")
        
        return {
            'total_cards': total_cards,
            'due_cards': due_cards,
            'recommendations': recommendations,
            'study_tip': self._generate_study_tip(due_cards, total_cards)
        }
    
    def _generate_study_tip(self, due_cards: int, total_cards: int) -> str:
        """Generate a study tip based on current state."""
        if due_cards == 0:
            return "Great job staying on top of your reviews!"
        elif due_cards <= 10:
            return "Perfect amount for a focused study session."
        elif due_cards <= 25:
            return "Consider breaking this into 2-3 sessions throughout the day."
        else:
            return "This is a lot of cards. Consider reviewing in smaller batches over multiple days."
    
    # Backward compatibility methods
    def get_due_cards_count(self, user) -> int:
        """Get count of due cards for a user."""
        return self.get_due_cards(user).count()
    
    def get_next_review_date(self, flashcard) -> Optional[timezone.datetime]:
        """Get the next review date for a flashcard."""
        if hasattr(flashcard, 'next_review'):
            return flashcard.next_review
        return None
    
    def is_card_due(self, flashcard) -> bool:
        """Check if a card is due for review."""
        if hasattr(flashcard, 'next_review') and flashcard.next_review:
            return timezone.now() >= flashcard.next_review
        return True
