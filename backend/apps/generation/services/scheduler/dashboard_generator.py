"""
Dashboard Generator for Spaced Repetition Scheduling

This module handles the generation of comprehensive dashboard data,
including review statistics, upcoming schedules, and learning progress.
"""

from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.db import transaction
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from ..spaced_repetition import SpacedRepetitionScheduler


class DashboardGenerator:
    """
    Generates comprehensive dashboard data for spaced repetition scheduling.
    
    This class aggregates data from various sources to provide
    insights into learning progress, review schedules, and performance metrics.
    """
    
    def __init__(self):
        self.scheduler = SpacedRepetitionScheduler()
    
    def get_review_dashboard(self, user) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for a user.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with review statistics and upcoming schedule
        """
        from ..models import Flashcard
        
        # Get all user's flashcards
        user_cards = Flashcard.objects.filter(flashcard_set__owner=user)
        
        # Current status counts
        status_counts = self._get_status_counts(user_cards)
        
        # Due cards by timeframe
        due_timeframes = self._get_due_timeframes(user_cards)
        
        # Algorithm usage statistics
        algorithm_stats = self._get_algorithm_stats(user_cards)
        
        # Learning progress and retention data
        retention_data = self._get_retention_data(user_cards)
        
        # Recent activity summary
        recent_activity = self._get_recent_activity(user_cards)
        
        return {
            'status_counts': status_counts,
            'due_timeframes': due_timeframes,
            'algorithm_stats': algorithm_stats,
            'retention_data': retention_data,
            'recent_activity': recent_activity,
            'last_updated': timezone.now(),
            'dashboard_metadata': self._get_dashboard_metadata(user_cards)
        }
    
    def _get_status_counts(self, user_cards) -> Dict[str, int]:
        """Get current status counts for user's flashcards."""
        now = timezone.now()
        
        return {
            'total_cards': user_cards.count(),
            'due_now': user_cards.filter(next_review__lte=now).count(),
            'learning': user_cards.filter(learning_state='learning').count(),
            'review': user_cards.filter(learning_state='review').count(),
            'new': user_cards.filter(learning_state='new').count(),
            'suspended': user_cards.filter(learning_state='suspended').count(),
            'overdue': user_cards.filter(next_review__lt=now - timedelta(days=1)).count()
        }
    
    def _get_due_timeframes(self, user_cards) -> Dict[str, int]:
        """Get due cards by different timeframes."""
        now = timezone.now()
        
        return {
            'overdue': user_cards.filter(next_review__lt=now - timedelta(days=1)).count(),
            'due_today': user_cards.filter(
                next_review__date=now.date(),
                next_review__lte=now
            ).count(),
            'due_tomorrow': user_cards.filter(
                next_review__date=now.date() + timedelta(days=1)
            ).count(),
            'due_this_week': user_cards.filter(
                next_review__gte=now,
                next_review__lte=now + timedelta(days=7)
            ).count(),
            'due_next_week': user_cards.filter(
                next_review__gte=now + timedelta(days=7),
                next_review__lte=now + timedelta(days=14)
            ).count(),
            'due_this_month': user_cards.filter(
                next_review__gte=now,
                next_review__lte=now + timedelta(days=30)
            ).count()
        }
    
    def _get_algorithm_stats(self, user_cards) -> List[Dict[str, Any]]:
        """Get statistics for each algorithm used by the user."""
        algorithm_stats = user_cards.values('algorithm').annotate(
            count=Count('algorithm'),
            avg_interval=Avg('interval'),
            avg_ease_factor=Avg('ease_factor'),
            avg_repetitions=Avg('repetitions'),
            total_reviews=Avg('total_reviews'),
            correct_reviews=Avg('correct_reviews')
        )
        
        # Calculate accuracy for each algorithm
        for stat in algorithm_stats:
            if stat['total_reviews'] and stat['total_reviews'] > 0:
                stat['accuracy_percentage'] = (
                    stat['correct_reviews'] / stat['total_reviews']
                ) * 100
            else:
                stat['accuracy_percentage'] = 0
            
            # Add algorithm metadata
            stat['algorithm_name'] = self._get_algorithm_display_name(stat['algorithm'])
            stat['algorithm_description'] = self._get_algorithm_description(stat['algorithm'])
        
        return list(algorithm_stats)
    
    def _get_retention_data(self, user_cards) -> List[Dict[str, Any]]:
        """Get retention data for user's cards."""
        # Sample cards for performance (limit to 100)
        sample_cards = user_cards.filter(total_reviews__gt=0)[:100]
        
        retention_data = []
        for card in sample_cards:
            try:
                retention = self.scheduler.get_card_retention(card)
                retention_data.append({
                    'card_id': card.id,
                    'retention': retention,
                    'interval': card.interval,
                    'repetitions': card.repetitions,
                    'ease_factor': card.ease_factor,
                    'total_reviews': card.total_reviews,
                    'correct_reviews': card.correct_reviews,
                    'last_reviewed': card.last_reviewed,
                    'algorithm': card.algorithm
                })
            except Exception:
                # Skip cards with calculation errors
                continue
        
        return retention_data
    
    def _get_recent_activity(self, user_cards) -> Dict[str, Any]:
        """Get summary of recent learning activity."""
        now = timezone.now()
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        # Recent reviews
        recent_reviews = user_cards.filter(
            last_reviewed__gte=last_week
        ).aggregate(
            total_reviews=Count('id'),
            avg_accuracy=Avg('correct_reviews') * 100.0 / Avg('total_reviews')
        )
        
        # Recent learning
        recent_learning = user_cards.filter(
            created_at__gte=last_month
        ).count()
        
        # Streak information
        streak_info = self._calculate_streak(user_cards)
        
        return {
            'last_week_reviews': recent_reviews.get('total_reviews', 0) or 0,
            'last_week_accuracy': recent_reviews.get('avg_accuracy', 0) or 0,
            'last_month_new_cards': recent_learning,
            'current_streak': streak_info['current_streak'],
            'longest_streak': streak_info['longest_streak'],
            'last_study_date': streak_info['last_study_date']
        }
    
    def _get_dashboard_metadata(self, user_cards) -> Dict[str, Any]:
        """Get metadata about the dashboard data."""
        now = timezone.now()
        
        # Calculate overall statistics
        total_cards = user_cards.count()
        if total_cards > 0:
            avg_interval = user_cards.aggregate(Avg('interval'))['interval__avg'] or 0
            avg_ease_factor = user_cards.aggregate(Avg('ease_factor'))['ease_factor__avg'] or 0
            total_reviews = user_cards.aggregate(Count('total_reviews'))['total_reviews__count'] or 0
        else:
            avg_interval = 0
            avg_ease_factor = 0
            total_reviews = 0
        
        return {
            'total_cards': total_cards,
            'average_interval_days': avg_interval,
            'average_ease_factor': avg_ease_factor,
            'total_reviews_ever': total_reviews,
            'data_freshness': 'real_time',
            'calculation_timestamp': now.isoformat()
        }
    
    def _get_algorithm_display_name(self, algorithm: str) -> str:
        """Get human-readable name for algorithm."""
        algorithm_names = {
            'sm2': 'SuperMemo 2',
            'leitner': 'Leitner Box',
            'default': 'Default Algorithm'
        }
        return algorithm_names.get(algorithm, algorithm.title())
    
    def _get_algorithm_description(self, algorithm: str) -> str:
        """Get description for algorithm."""
        algorithm_descriptions = {
            'sm2': 'Adaptive spacing algorithm that adjusts intervals based on performance',
            'leitner': 'Box-based system with fixed intervals and promotion/demotion',
            'default': 'Standard spacing algorithm with basic interval calculation'
        }
        return algorithm_descriptions.get(algorithm, 'Algorithm for spaced repetition')
    
    def _calculate_streak(self, user_cards) -> Dict[str, Any]:
        """Calculate study streak information."""
        # Get all review dates for the user
        review_dates = user_cards.filter(
            last_reviewed__isnull=False
        ).values_list('last_reviewed__date', flat=True).distinct()
        
        if not review_dates:
            return {
                'current_streak': 0,
                'longest_streak': 0,
                'last_study_date': None
            }
        
        # Sort dates and find streaks
        review_dates = sorted(review_dates, reverse=True)
        today = timezone.now().date()
        
        # Calculate current streak
        current_streak = 0
        current_date = today
        
        for review_date in review_dates:
            if review_date == current_date:
                current_streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        # Calculate longest streak
        longest_streak = 0
        temp_streak = 0
        prev_date = None
        
        for review_date in review_dates:
            if prev_date is None or (prev_date - review_date).days == 1:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
            prev_date = review_date
        
        return {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'last_study_date': review_dates[0] if review_dates else None
        }
    
    def get_quick_stats(self, user) -> Dict[str, Any]:
        """
        Get quick statistics for dashboard widgets.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with key statistics for quick display
        """
        from ..models import Flashcard
        
        user_cards = Flashcard.objects.filter(flashcard_set__owner=user)
        now = timezone.now()
        
        return {
            'total_cards': user_cards.count(),
            'due_today': user_cards.filter(
                next_review__date=now.date(),
                next_review__lte=now
            ).count(),
            'overdue': user_cards.filter(next_review__lt=now - timedelta(days=1)).count(),
            'learning': user_cards.filter(learning_state='learning').count(),
            'accuracy_trend': self._get_accuracy_trend(user_cards),
            'study_momentum': self._get_study_momentum(user_cards)
        }
    
    def _get_accuracy_trend(self, user_cards) -> str:
        """Get accuracy trend direction."""
        # Compare last week vs previous week
        now = timezone.now()
        last_week = now - timedelta(days=7)
        previous_week = now - timedelta(days=14)
        
        last_week_accuracy = user_cards.filter(
            last_reviewed__gte=last_week
        ).aggregate(
            avg_accuracy=Avg('correct_reviews') * 100.0 / Avg('total_reviews')
        )['avg_accuracy'] or 0
        
        previous_week_accuracy = user_cards.filter(
            last_reviewed__gte=previous_week,
            last_reviewed__lt=last_week
        ).aggregate(
            avg_accuracy=Avg('correct_reviews') * 100.0 / Avg('total_reviews')
        )['avg_accuracy'] or 0
        
        if last_week_accuracy > previous_week_accuracy + 5:
            return 'improving'
        elif last_week_accuracy < previous_week_accuracy - 5:
            return 'declining'
        else:
            return 'stable'
    
    def _get_study_momentum(self, user_cards) -> str:
        """Get study momentum indicator."""
        # Check if user has been studying consistently
        now = timezone.now()
        last_week = now - timedelta(days=7)
        
        recent_activity = user_cards.filter(
            last_reviewed__gte=last_week
        ).count()
        
        if recent_activity >= 20:
            return 'high'
        elif recent_activity >= 10:
            return 'medium'
        elif recent_activity >= 5:
            return 'low'
        else:
            return 'none'
