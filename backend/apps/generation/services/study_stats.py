"""
Shared study statistics calculation service.
Eliminates duplication between consumers.py and schema.py.
"""
from django.utils import timezone
from datetime import timedelta
from backend.apps.generation.models import Flashcard


class StudyStatsService:
    """Service for calculating study statistics."""
    
    @staticmethod
    def calculate_study_stats(user, project=None):
        """Calculate comprehensive study statistics for user/project."""
        # Base queryset
        cards_queryset = Flashcard.objects.filter(user=user)
        if project:
            cards_queryset = cards_queryset.filter(flashcard_set__project=project)
        
        # Basic stats
        total_cards = cards_queryset.count()
        reviewed_today = cards_queryset.filter(
            last_reviewed__date=timezone.now().date()
        ).count()
        
        due_cards = cards_queryset.filter(
            next_review__lte=timezone.now()
        ).count()
        
        # Calculate streak
        streak = StudyStatsService.calculate_study_streak(cards_queryset)
        
        # Cards by difficulty
        cards_by_difficulty = []
        for difficulty in range(1, 6):
            count = cards_queryset.filter(difficulty=difficulty).count()
            cards_by_difficulty.append(count)
        
        completion_rate = (reviewed_today / max(total_cards, 1)) * 100
        
        return {
            'total_cards': total_cards,
            'reviewed_today': reviewed_today,
            'due_cards': due_cards,
            'study_streak': streak,
            'completion_rate': completion_rate,
            'cards_by_difficulty': cards_by_difficulty
        }
    
    @staticmethod
    def calculate_study_streak(cards_queryset):
        """Calculate consecutive study days."""
        streak = 0
        current_date = timezone.now().date()
        
        while True:
            has_study = cards_queryset.filter(
                last_reviewed__date=current_date
            ).exists()
            
            if has_study:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak
