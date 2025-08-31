"""
Analytics Calculator for Spaced Repetition Scheduling

This module handles learning analytics computation, performance tracking,
and provides insights into learning patterns and progress.
"""

from django.utils import timezone
from django.db.models import Q, Count, Avg, Max, Min
from django.db import transaction
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from ..spaced_repetition import SpacedRepetitionScheduler


class AnalyticsCalculator:
    """
    Calculates comprehensive learning analytics and performance metrics.
    
    This class analyzes user learning patterns, calculates retention rates,
    and provides insights into learning efficiency and progress.
    """
    
    def __init__(self):
        self.scheduler = SpacedRepetitionScheduler()
    
    def get_learning_analytics(
        self, 
        user, 
        timeframe_days: int = 30
    ) -> Dict[str, Any]:
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
        overall_metrics = self._calculate_overall_metrics(user_cards)
        
        # Algorithm comparison
        algorithm_performance = self._analyze_algorithm_performance(user_cards)
        
        # Learning curve data
        learning_curve = self._calculate_learning_curve(user_cards, timeframe_days)
        
        # Retention analysis
        retention_analysis = self._analyze_retention_patterns(user_cards)
        
        # Study pattern analysis
        study_patterns = self._analyze_study_patterns(user_cards, timeframe_days)
        
        # Progress indicators
        progress_indicators = self._calculate_progress_indicators(user_cards, timeframe_days)
        
        return {
            'overall_metrics': overall_metrics,
            'algorithm_performance': algorithm_performance,
            'learning_curve': learning_curve,
            'retention_analysis': retention_analysis,
            'study_patterns': study_patterns,
            'progress_indicators': progress_indicators,
            'timeframe_days': timeframe_days,
            'analysis_timestamp': timezone.now().isoformat()
        }
    
    def _calculate_overall_metrics(self, user_cards) -> Dict[str, Any]:
        """Calculate overall performance metrics."""
        if not user_cards.exists():
            return {
                'total_reviews': 0,
                'total_correct': 0,
                'overall_accuracy': 0,
                'average_interval': 0,
                'total_study_time': 0
            }
        
        # Basic metrics
        total_reviews = sum(card.total_reviews for card in user_cards)
        total_correct = sum(card.correct_reviews for card in user_cards)
        overall_accuracy = (total_correct / total_reviews * 100) if total_reviews > 0 else 0
        
        # Interval and ease factor metrics
        avg_interval = user_cards.aggregate(Avg('interval'))['interval__avg'] or 0
        avg_ease_factor = user_cards.aggregate(Avg('ease_factor'))['ease_factor__avg'] or 0
        
        # Learning state distribution
        learning_states = user_cards.values('learning_state').annotate(
            count=Count('learning_state')
        )
        state_distribution = {state['learning_state']: state['count'] for state in learning_states}
        
        return {
            'total_reviews': total_reviews,
            'total_correct': total_correct,
            'overall_accuracy': overall_accuracy,
            'average_interval': avg_interval,
            'average_ease_factor': avg_ease_factor,
            'learning_state_distribution': state_distribution,
            'total_cards_analyzed': user_cards.count()
        }
    
    def _analyze_algorithm_performance(self, user_cards) -> Dict[str, Any]:
        """Analyze performance across different algorithms."""
        algorithm_performance = {}
        
        for algorithm in ['sm2', 'leitner', 'default']:
            algo_cards = user_cards.filter(algorithm=algorithm)
            if algo_cards.exists():
                algo_reviews = sum(card.total_reviews for card in algo_cards)
                algo_correct = sum(card.correct_reviews for card in algo_cards)
                
                algorithm_performance[algorithm] = {
                    'total_cards': algo_cards.count(),
                    'total_reviews': algo_reviews,
                    'accuracy': (algo_correct / algo_reviews * 100) if algo_reviews > 0 else 0,
                    'avg_interval': algo_cards.aggregate(Avg('interval'))['interval__avg'] or 0,
                    'avg_ease_factor': algo_cards.aggregate(Avg('ease_factor'))['ease_factor__avg'] or 0,
                    'avg_repetitions': algo_cards.aggregate(Avg('repetitions'))['repetitions__avg'] or 0
                }
        
        return algorithm_performance
    
    def _calculate_learning_curve(
        self, 
        user_cards, 
        timeframe_days: int
    ) -> List[Dict[str, Any]]:
        """Calculate learning curve data over time."""
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
                
                # Calculate average interval for cards reviewed that day
                avg_interval = day_cards.aggregate(Avg('interval'))['interval__avg'] or 0
            else:
                day_reviews = 0
                day_accuracy = 0
                avg_interval = 0
            
            learning_curve.append({
                'date': day,
                'reviews': day_reviews,
                'accuracy': day_accuracy,
                'average_interval': avg_interval,
                'cards_reviewed': day_cards.count() if day_cards.exists() else 0
            })
        
        return learning_curve
    
    def _analyze_retention_patterns(self, user_cards) -> Dict[str, Any]:
        """Analyze retention patterns and forgetting curves."""
        retention_data = []
        
        # Sample cards for retention analysis
        sample_cards = user_cards.filter(total_reviews__gt=0)[:200]
        
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
                    'algorithm': card.algorithm
                })
            except Exception:
                # Skip cards with calculation errors
                continue
        
        if not retention_data:
            return {
                'average_retention': 0,
                'retention_by_interval': {},
                'retention_by_algorithm': {},
                'forgetting_curve': []
            }
        
        # Calculate average retention
        avg_retention = sum(item['retention'] for item in retention_data) / len(retention_data)
        
        # Analyze retention by interval
        retention_by_interval = self._analyze_retention_by_interval(retention_data)
        
        # Analyze retention by algorithm
        retention_by_algorithm = self._analyze_retention_by_algorithm(retention_data)
        
        # Calculate forgetting curve
        forgetting_curve = self._calculate_forgetting_curve(retention_data)
        
        return {
            'average_retention': avg_retention,
            'retention_by_interval': retention_by_interval,
            'retention_by_algorithm': retention_by_algorithm,
            'forgetting_curve': forgetting_curve,
            'total_cards_analyzed': len(retention_data)
        }
    
    def _analyze_retention_by_interval(self, retention_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze retention rates by interval ranges."""
        interval_ranges = {
            '0-1_days': (0, 1),
            '1-7_days': (1, 7),
            '7-30_days': (7, 30),
            '30-90_days': (30, 90),
            '90+_days': (90, float('inf'))
        }
        
        retention_by_interval = {}
        
        for range_name, (min_interval, max_interval) in interval_ranges.items():
            range_cards = [
                item for item in retention_data 
                if min_interval <= item['interval'] < max_interval
            ]
            
            if range_cards:
                avg_retention = sum(item['retention'] for item in range_cards) / len(range_cards)
                retention_by_interval[range_name] = {
                    'average_retention': avg_retention,
                    'card_count': len(range_cards),
                    'min_interval': min_interval,
                    'max_interval': max_interval if max_interval != float('inf') else '90+'
                }
        
        return retention_by_interval
    
    def _analyze_retention_by_algorithm(self, retention_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze retention rates by algorithm."""
        algorithm_groups = {}
        
        for item in retention_data:
            algorithm = item['algorithm']
            if algorithm not in algorithm_groups:
                algorithm_groups[algorithm] = []
            algorithm_groups[algorithm].append(item)
        
        retention_by_algorithm = {}
        
        for algorithm, items in algorithm_groups.items():
            avg_retention = sum(item['retention'] for item in items) / len(items)
            avg_interval = sum(item['interval'] for item in items) / len(items)
            
            retention_by_algorithm[algorithm] = {
                'average_retention': avg_retention,
                'average_interval': avg_interval,
                'card_count': len(items),
                'algorithm_name': self._get_algorithm_display_name(algorithm)
            }
        
        return retention_by_algorithm
    
    def _calculate_forgetting_curve(self, retention_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Calculate forgetting curve data points."""
        # Group by interval and calculate average retention
        interval_groups = {}
        
        for item in retention_data:
            interval = item['interval']
            if interval not in interval_groups:
                interval_groups[interval] = []
            interval_groups[interval].append(item['retention'])
        
        # Calculate average retention for each interval
        forgetting_curve = []
        for interval in sorted(interval_groups.keys()):
            avg_retention = sum(interval_groups[interval]) / len(interval_groups[interval])
            forgetting_curve.append({
                'interval_days': interval,
                'average_retention': avg_retention,
                'card_count': len(interval_groups[interval])
            })
        
        return forgetting_curve
    
    def _analyze_study_patterns(
        self, 
        user_cards, 
        timeframe_days: int
    ) -> Dict[str, Any]:
        """Analyze study patterns and habits."""
        now = timezone.now()
        cutoff_date = now - timedelta(days=timeframe_days)
        
        # Study frequency analysis
        study_dates = user_cards.filter(
            last_reviewed__gte=cutoff_date
        ).values_list('last_reviewed__date', flat=True).distinct()
        
        study_frequency = len(study_dates) / timeframe_days if timeframe_days > 0 else 0
        
        # Time of day analysis
        time_of_day_data = self._analyze_time_of_day_patterns(user_cards, cutoff_date)
        
        # Session length analysis
        session_length_data = self._analyze_session_length_patterns(user_cards, cutoff_date)
        
        # Consistency analysis
        consistency_score = self._calculate_consistency_score(study_dates, timeframe_days)
        
        return {
            'study_frequency': study_frequency,
            'study_days': len(study_dates),
            'time_of_day_patterns': time_of_day_data,
            'session_length_patterns': session_length_data,
            'consistency_score': consistency_score,
            'study_streak': self._calculate_study_streak(study_dates)
        }
    
    def _analyze_time_of_day_patterns(self, user_cards, cutoff_date) -> Dict[str, Any]:
        """Analyze when during the day the user studies."""
        # Get review times for recent cards
        recent_reviews = user_cards.filter(
            last_reviewed__gte=cutoff_date
        ).values_list('last_reviewed__hour', flat=True)
        
        if not recent_reviews:
            return {'morning': 0, 'afternoon': 0, 'evening': 0, 'night': 0}
        
        time_distribution = {'morning': 0, 'afternoon': 0, 'evening': 0, 'night': 0}
        
        for hour in recent_reviews:
            if 6 <= hour < 12:
                time_distribution['morning'] += 1
            elif 12 <= hour < 17:
                time_distribution['afternoon'] += 1
            elif 17 <= hour < 22:
                time_distribution['evening'] += 1
            else:
                time_distribution['night'] += 1
        
        # Convert to percentages
        total_reviews = sum(time_distribution.values())
        if total_reviews > 0:
            for period in time_distribution:
                time_distribution[period] = (time_distribution[period] / total_reviews) * 100
        
        return time_distribution
    
    def _analyze_session_length_patterns(self, user_cards, cutoff_date) -> Dict[str, Any]:
        """Analyze session length patterns."""
        # This is a simplified analysis - in practice you might track actual session data
        recent_cards = user_cards.filter(last_reviewed__gte=cutoff_date)
        
        if not recent_cards.exists():
            return {'short_sessions': 0, 'medium_sessions': 0, 'long_sessions': 0}
        
        # Estimate session length based on cards reviewed per day
        daily_card_counts = recent_cards.values('last_reviewed__date').annotate(
            count=Count('id')
        )
        
        short_sessions = sum(1 for day in daily_card_counts if day['count'] <= 10)
        medium_sessions = sum(1 for day in daily_card_counts if 10 < day['count'] <= 25)
        long_sessions = sum(1 for day in daily_card_counts if day['count'] > 25)
        
        total_days = len(daily_card_counts)
        if total_days > 0:
            return {
                'short_sessions': (short_sessions / total_days) * 100,
                'medium_sessions': (medium_sessions / total_days) * 100,
                'long_sessions': (long_sessions / total_days) * 100
            }
        
        return {'short_sessions': 0, 'medium_sessions': 0, 'long_sessions': 0}
    
    def _calculate_consistency_score(self, study_dates, timeframe_days: int) -> float:
        """Calculate study consistency score."""
        if not study_dates or timeframe_days <= 0:
            return 0.0
        
        # Calculate gaps between study days
        sorted_dates = sorted(study_dates)
        gaps = []
        
        for i in range(1, len(sorted_dates)):
            gap = (sorted_dates[i] - sorted_dates[i-1]).days
            gaps.append(gap)
        
        if not gaps:
            return 1.0  # Perfect consistency if only one study day
        
        # Calculate coefficient of variation (lower = more consistent)
        import statistics
        mean_gap = statistics.mean(gaps)
        if mean_gap == 0:
            return 1.0
        
        try:
            std_gap = statistics.stdev(gaps)
            cv = std_gap / mean_gap
            # Convert to 0-1 score (lower CV = higher consistency)
            consistency_score = max(0.0, 1.0 - min(1.0, cv))
        except statistics.StatisticsError:
            consistency_score = 0.5
        
        return consistency_score
    
    def _calculate_study_streak(self, study_dates) -> Dict[str, Any]:
        """Calculate current and longest study streaks."""
        if not study_dates:
            return {'current_streak': 0, 'longest_streak': 0}
        
        # Sort dates and find streaks
        sorted_dates = sorted(study_dates, reverse=True)
        today = timezone.now().date()
        
        # Calculate current streak
        current_streak = 0
        current_date = today
        
        for study_date in sorted_dates:
            if study_date == current_date:
                current_streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        # Calculate longest streak
        longest_streak = 0
        temp_streak = 0
        prev_date = None
        
        for study_date in sorted_dates:
            if prev_date is None or (prev_date - study_date).days == 1:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
            prev_date = study_date
        
        return {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'last_study_date': sorted_dates[0] if sorted_dates else None
        }
    
    def _calculate_progress_indicators(
        self, 
        user_cards, 
        timeframe_days: int
    ) -> Dict[str, Any]:
        """Calculate progress indicators and trends."""
        now = timezone.now()
        previous_period_start = now - timedelta(days=timeframe_days * 2)
        current_period_start = now - timedelta(days=timeframe_days)
        
        # Compare current period vs previous period
        current_period_cards = user_cards.filter(
            last_reviewed__gte=current_period_start
        )
        previous_period_cards = user_cards.filter(
            last_reviewed__gte=previous_period_start,
            last_reviewed__lt=current_period_start
        )
        
        # Calculate progress metrics
        current_reviews = sum(card.total_reviews for card in current_period_cards)
        previous_reviews = sum(card.total_reviews for card in previous_period_cards)
        
        current_accuracy = self._calculate_period_accuracy(current_period_cards)
        previous_accuracy = self._calculate_period_accuracy(previous_period_cards)
        
        # Calculate trends
        review_trend = self._calculate_trend(current_reviews, previous_reviews)
        accuracy_trend = self._calculate_trend(current_accuracy, previous_accuracy)
        
        return {
            'review_trend': review_trend,
            'accuracy_trend': accuracy_trend,
            'current_period_reviews': current_reviews,
            'previous_period_reviews': previous_reviews,
            'current_period_accuracy': current_accuracy,
            'previous_period_accuracy': previous_accuracy,
            'progress_score': self._calculate_progress_score(
                current_reviews, previous_reviews,
                current_accuracy, previous_accuracy
            )
        }
    
    def _calculate_period_accuracy(self, period_cards) -> float:
        """Calculate accuracy for a specific time period."""
        if not period_cards.exists():
            return 0.0
        
        total_reviews = sum(card.total_reviews for card in period_cards)
        correct_reviews = sum(card.correct_reviews for card in period_cards)
        
        return (correct_reviews / total_reviews * 100) if total_reviews > 0 else 0.0
    
    def _calculate_trend(self, current_value: float, previous_value: float) -> str:
        """Calculate trend direction between two values."""
        if current_value > previous_value * 1.1:
            return 'improving'
        elif current_value < previous_value * 0.9:
            return 'declining'
        else:
            return 'stable'
    
    def _calculate_progress_score(
        self, 
        current_reviews: int, 
        previous_reviews: int,
        current_accuracy: float, 
        previous_accuracy: float
    ) -> float:
        """Calculate overall progress score."""
        # Weight reviews and accuracy equally
        review_progress = min(1.0, current_reviews / max(previous_reviews, 1))
        accuracy_progress = min(1.0, current_accuracy / max(previous_accuracy, 1))
        
        return (review_progress + accuracy_progress) / 2
    
    def _get_algorithm_display_name(self, algorithm: str) -> str:
        """Get human-readable name for algorithm."""
        algorithm_names = {
            'sm2': 'SuperMemo 2',
            'leitner': 'Leitner Box',
            'default': 'Default Algorithm'
        }
        return algorithm_names.get(algorithm, algorithm.title())
