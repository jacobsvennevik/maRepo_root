"""
Spaced Repetition Scheduler Service

This service provides a high-level interface for managing spaced repetition
reviews, scheduling, and analytics. It integrates with the algorithm implementations
and provides methods for real-world usage scenarios.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.db import transaction

from .spaced_repetition import (
    SpacedRepetitionScheduler, 
    ReviewQuality,
    LeitnerBox
)


class ReviewSession:
    """
    Manages a single review session with multiple cards.
    Tracks session statistics and progress.
    """
    
    def __init__(self, user, session_limit: int = 20):
        self.user = user
        self.session_limit = session_limit
        self.scheduler = SpacedRepetitionScheduler()
        self.session_stats = {
            'total_cards': 0,
            'correct_cards': 0,
            'session_start': timezone.now(),
            'session_end': None,
            'average_response_time': 0,
            'cards_reviewed': []
        }
    
    def get_next_card(self):
        """Get the next card for review in this session."""
        due_cards = self.scheduler.get_due_cards(
            self.user, 
            limit=self.session_limit - self.session_stats['total_cards']
        )
        
        if due_cards.exists():
            return due_cards.first()
        return None
    
    def review_card(self, flashcard, quality: int, response_time_seconds: Optional[float] = None):
        """
        Review a card and update its schedule.
        
        Args:
            flashcard: Flashcard instance
            quality: Review quality (0-5)
            response_time_seconds: Time taken to respond
        """
        with transaction.atomic():
            # Process the review using the scheduler
            updated_data = self.scheduler.process_review(flashcard, quality)
            
            # Update the flashcard
            for field, value in updated_data.items():
                setattr(flashcard, field, value)
            flashcard.save()
            
            # Update session statistics
            self.session_stats['total_cards'] += 1
            if quality >= ReviewQuality.CORRECT_DIFFICULT:
                self.session_stats['correct_cards'] += 1
            
            # Track card review details
            card_review = {
                'card_id': flashcard.id,
                'quality': quality,
                'response_time': response_time_seconds,
                'timestamp': timezone.now(),
                'algorithm_used': flashcard.algorithm,
                'new_interval': updated_data.get('interval', 0)
            }
            self.session_stats['cards_reviewed'].append(card_review)
    
    def finish_session(self):
        """Complete the review session and return final statistics."""
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
        
        return self.session_stats


class ReviewScheduleManager:
    """
    Manages review schedules and provides analytics about learning progress.
    """
    
    def __init__(self):
        self.scheduler = SpacedRepetitionScheduler()
    
    def get_review_dashboard(self, user) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for a user.
        
        Returns:
            Dictionary with review statistics and upcoming schedule
        """
        from ..models import Flashcard
        
        # Get all user's flashcards
        user_cards = Flashcard.objects.filter(flashcard_set__owner=user)
        
        # Current status counts
        status_counts = {
            'total_cards': user_cards.count(),
            'due_now': user_cards.filter(next_review__lte=timezone.now()).count(),
            'learning': user_cards.filter(learning_state='learning').count(),
            'review': user_cards.filter(learning_state='review').count(),
            'new': user_cards.filter(learning_state='new').count(),
        }
        
        # Due cards by timeframe
        now = timezone.now()
        due_timeframes = {
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
        }
        
        # Algorithm usage
        algorithm_stats = user_cards.values('algorithm').annotate(
            count=Count('algorithm'),
            avg_interval=Avg('interval'),
            avg_accuracy=Avg('correct_reviews') * 100.0 / Avg('total_reviews')
        )
        
        # Learning progress
        retention_data = []
        for card in user_cards.filter(total_reviews__gt=0)[:100]:  # Sample for performance
            retention = self.scheduler.get_card_retention(card)
            retention_data.append({
                'card_id': card.id,
                'retention': retention,
                'interval': card.interval,
                'repetitions': card.repetitions
            })
        
        return {
            'status_counts': status_counts,
            'due_timeframes': due_timeframes,
            'algorithm_stats': list(algorithm_stats),
            'retention_data': retention_data,
            'last_updated': timezone.now()
        }
    
    def get_upcoming_reviews(self, user, days_ahead: int = 7) -> List[Dict]:
        """
        Get upcoming reviews for the next specified days.
        
        Args:
            user: User instance
            days_ahead: Number of days to look ahead
            
        Returns:
            List of review schedule data by day
        """
        from ..models import Flashcard
        
        schedule = []
        start_date = timezone.now().date()
        
        for i in range(days_ahead):
            target_date = start_date + timedelta(days=i)
            target_start = timezone.make_aware(
                datetime.combine(target_date, datetime.min.time())
            )
            target_end = target_start + timedelta(days=1)
            
            due_cards = Flashcard.objects.filter(
                flashcard_set__owner=user,
                next_review__gte=target_start,
                next_review__lt=target_end
            )
            
            # Group by algorithm and learning state
            daily_stats = due_cards.values('algorithm', 'learning_state').annotate(
                count=Count('id')
            )
            
            schedule.append({
                'date': target_date,
                'total_due': due_cards.count(),
                'breakdown': list(daily_stats),
                'is_today': target_date == start_date
            })
        
        return schedule
    
    def optimize_daily_schedule(self, user, target_daily_reviews: int = 20) -> Dict[str, Any]:
        """
        Optimize the daily review schedule to distribute load evenly.
        
        Args:
            user: User instance
            target_daily_reviews: Target number of reviews per day
            
        Returns:
            Optimization recommendations
        """
        from ..models import Flashcard
        
        # Get current schedule for next 30 days
        upcoming = self.get_upcoming_reviews(user, days_ahead=30)
        
        # Calculate current distribution
        daily_counts = [day['total_due'] for day in upcoming]
        avg_daily = sum(daily_counts) / len(daily_counts) if daily_counts else 0
        peak_day = max(daily_counts) if daily_counts else 0
        
        # Find overloaded days
        overloaded_days = [
            day for day in upcoming 
            if day['total_due'] > target_daily_reviews
        ]
        
        # Find underloaded days
        underloaded_days = [
            day for day in upcoming 
            if day['total_due'] < target_daily_reviews * 0.5
        ]
        
        recommendations = {
            'current_avg_daily': avg_daily,
            'peak_day_count': peak_day,
            'target_daily_reviews': target_daily_reviews,
            'overloaded_days': len(overloaded_days),
            'underloaded_days': len(underloaded_days),
            'schedule_health': 'good' if peak_day <= target_daily_reviews * 1.5 else 'needs_optimization'
        }
        
        # Generate specific recommendations
        if overloaded_days:
            recommendations['suggestions'] = [
                f"Consider reviewing {len(overloaded_days)} days early to distribute load",
                "Use 'study ahead' feature on light days",
                "Adjust algorithm parameters for better distribution"
            ]
        
        return recommendations
    
    def get_learning_analytics(self, user, timeframe_days: int = 30) -> Dict[str, Any]:
        """
        Get detailed learning analytics for a user.
        
        Args:
            user: User instance
            timeframe_days: Number of days to analyze
            
        Returns:
            Comprehensive learning analytics
        """
        from ..models import Flashcard
        
        cutoff_date = timezone.now() - timedelta(days=timeframe_days)
        user_cards = Flashcard.objects.filter(
            flashcard_set__owner=user,
            last_reviewed__gte=cutoff_date
        )
        
        # Overall performance metrics
        total_reviews = sum(card.total_reviews for card in user_cards)
        total_correct = sum(card.correct_reviews for card in user_cards)
        overall_accuracy = (total_correct / total_reviews * 100) if total_reviews > 0 else 0
        
        # Algorithm comparison
        algorithm_performance = {}
        for algorithm in ['sm2', 'leitner']:
            algo_cards = user_cards.filter(algorithm=algorithm)
            if algo_cards.exists():
                algo_reviews = sum(card.total_reviews for card in algo_cards)
                algo_correct = sum(card.correct_reviews for card in algo_cards)
                algorithm_performance[algorithm] = {
                    'total_cards': algo_cards.count(),
                    'total_reviews': algo_reviews,
                    'accuracy': (algo_correct / algo_reviews * 100) if algo_reviews > 0 else 0,
                    'avg_interval': algo_cards.aggregate(Avg('interval'))['interval__avg'] or 0
                }
        
        # Learning curve data
        learning_curve = []
        for i in range(timeframe_days):
            day = timezone.now().date() - timedelta(days=timeframe_days - i - 1)
            day_start = timezone.make_aware(datetime.combine(day, datetime.min.time()))
            day_end = day_start + timedelta(days=1)
            
            day_cards = user_cards.filter(
                last_reviewed__gte=day_start,
                last_reviewed__lt=day_end
            )
            
            if day_cards.exists():
                day_reviews = sum(card.total_reviews for card in day_cards)
                day_correct = sum(card.correct_reviews for card in day_cards)
                day_accuracy = (day_correct / day_reviews * 100) if day_reviews > 0 else 0
            else:
                day_reviews = 0
                day_accuracy = 0
            
            learning_curve.append({
                'date': day,
                'reviews': day_reviews,
                'accuracy': day_accuracy
            })
        
        return {
            'overall_accuracy': overall_accuracy,
            'total_reviews': total_reviews,
            'algorithm_performance': algorithm_performance,
            'learning_curve': learning_curve,
            'timeframe_days': timeframe_days
        }
    
    def suggest_study_plan(self, user, available_time_minutes: int = 20) -> Dict[str, Any]:
        """
        Suggest an optimal study plan based on available time and due cards.
        
        Args:
            user: User instance
            available_time_minutes: Available study time in minutes
            
        Returns:
            Recommended study plan
        """
        # Estimate 30 seconds per card review on average
        estimated_cards_possible = available_time_minutes * 2
        
        due_cards = self.scheduler.get_due_cards(user, limit=estimated_cards_possible * 2)
        
        # Prioritize cards by urgency and difficulty
        prioritized_cards = []
        for card in due_cards:
            urgency_score = max(0, (timezone.now() - card.next_review).days)
            retention = self.scheduler.get_card_retention(card)
            difficulty_score = 1 - retention  # Lower retention = higher difficulty
            
            priority_score = urgency_score * 2 + difficulty_score
            prioritized_cards.append({
                'card': card,
                'priority_score': priority_score,
                'retention': retention,
                'urgency': urgency_score
            })
        
        # Sort by priority and take top cards
        prioritized_cards.sort(key=lambda x: x['priority_score'], reverse=True)
        recommended_cards = prioritized_cards[:estimated_cards_possible]
        
        return {
            'recommended_cards': [item['card'].id for item in recommended_cards],
            'estimated_duration_minutes': len(recommended_cards) * 0.5,
            'total_due_cards': due_cards.count(),
            'cards_breakdown': {
                'high_priority': len([c for c in recommended_cards if c['priority_score'] > 2]),
                'medium_priority': len([c for c in recommended_cards if 1 <= c['priority_score'] <= 2]),
                'low_priority': len([c for c in recommended_cards if c['priority_score'] < 1])
            },
            'study_focus': self._determine_study_focus(recommended_cards)
        }
    
    def _determine_study_focus(self, recommended_cards: List[Dict]) -> str:
        """Determine the main focus of the study session."""
        if not recommended_cards:
            return "no_cards_due"
        
        avg_retention = sum(item['retention'] for item in recommended_cards) / len(recommended_cards)
        avg_urgency = sum(item['urgency'] for item in recommended_cards) / len(recommended_cards)
        
        if avg_retention < 0.5:
            return "review_difficult_cards"
        elif avg_urgency > 1:
            return "catch_up_overdue"
        else:
            return "maintenance_review" 