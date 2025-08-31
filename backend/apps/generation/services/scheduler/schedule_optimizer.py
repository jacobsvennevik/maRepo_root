"""
Schedule Optimizer for Spaced Repetition Scheduling

This module handles schedule optimization, load balancing,
and provides recommendations for optimal review distribution.
"""

from django.utils import timezone
from django.db.models import Q, Count, Avg, Max, Min
from django.db import transaction
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from ..spaced_repetition import SpacedRepetitionScheduler


class ScheduleOptimizer:
    """
    Optimizes review schedules for better learning outcomes.
    
    This class analyzes current schedules, identifies bottlenecks,
    and provides recommendations for optimal review distribution.
    """
    
    def __init__(self):
        self.scheduler = SpacedRepetitionScheduler()
        self.optimal_daily_reviews = 20
        self.max_daily_reviews = 40
        self.min_daily_reviews = 5
    
    def optimize_daily_schedule(
        self, 
        user, 
        target_daily_reviews: int = 20,
        optimization_horizon: int = 30
    ) -> Dict[str, Any]:
        """
        Optimize the daily review schedule to distribute load evenly.
        
        Args:
            user: User instance
            target_daily_reviews: Target number of reviews per day
            optimization_horizon: Number of days to look ahead for optimization
            
        Returns:
            Optimization recommendations and schedule analysis
        """
        from ..models import Flashcard
        
        # Get current schedule for the optimization horizon
        upcoming = self._get_upcoming_reviews(user, days_ahead=optimization_horizon)
        
        # Analyze current distribution
        distribution_analysis = self._analyze_schedule_distribution(upcoming, target_daily_reviews)
        
        # Identify optimization opportunities
        optimization_opportunities = self._identify_optimization_opportunities(
            upcoming, 
            target_daily_reviews
        )
        
        # Generate optimization recommendations
        recommendations = self._generate_optimization_recommendations(
            distribution_analysis,
            optimization_opportunities,
            target_daily_reviews
        )
        
        # Calculate optimization impact
        optimization_impact = self._calculate_optimization_impact(
            upcoming,
            recommendations
        )
        
        return {
            'current_schedule': upcoming,
            'distribution_analysis': distribution_analysis,
            'optimization_opportunities': optimization_opportunities,
            'recommendations': recommendations,
            'optimization_impact': optimization_impact,
            'target_daily_reviews': target_daily_reviews,
            'optimization_horizon': optimization_horizon,
            'last_updated': timezone.now().isoformat()
        }
    
    def _get_upcoming_reviews(self, user, days_ahead: int) -> List[Dict[str, Any]]:
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
            
            # Calculate priority distribution
            priority_distribution = self._calculate_daily_priority_distribution(due_cards)
            
            schedule.append({
                'date': target_date,
                'total_due': due_cards.count(),
                'breakdown': list(daily_stats),
                'priority_distribution': priority_distribution,
                'is_today': target_date == start_date,
                'is_weekend': target_date.weekday() >= 5
            })
        
        return schedule
    
    def _calculate_daily_priority_distribution(self, due_cards) -> Dict[str, int]:
        """Calculate priority distribution for cards due on a specific day."""
        if not due_cards.exists():
            return {'high': 0, 'medium': 0, 'low': 0}
        
        high_priority = 0
        medium_priority = 0
        low_priority = 0
        
        for card in due_cards:
            priority = self._calculate_card_priority(card)
            if priority > 0.7:
                high_priority += 1
            elif priority > 0.4:
                medium_priority += 1
            else:
                low_priority += 1
        
        return {
            'high': high_priority,
            'medium': medium_priority,
            'low': low_priority
        }
    
    def _calculate_card_priority(self, card) -> float:
        """Calculate priority score for a single card."""
        # Base priority from urgency
        urgency_score = self._calculate_urgency_score(card)
        
        # Adjust based on difficulty
        difficulty_score = self._calculate_difficulty_score(card)
        
        # Combine scores
        priority = (urgency_score * 0.7) + (difficulty_score * 0.3)
        
        return min(1.0, max(0.0, priority))
    
    def _calculate_urgency_score(self, card) -> float:
        """Calculate urgency score for a card."""
        if not card.next_review:
            return 1.0
        
        now = timezone.now()
        days_overdue = (now - card.next_review).days
        
        if days_overdue <= 0:
            return 0.8  # Due today
        elif days_overdue <= 1:
            return 0.9  # Due yesterday
        elif days_overdue <= 3:
            return 0.7  # Due within last 3 days
        elif days_overdue <= 7:
            return 0.5  # Due within last week
        else:
            return min(1.0, 0.3 + (days_overdue - 7) * 0.1)
    
    def _calculate_difficulty_score(self, card) -> float:
        """Calculate difficulty score for a card."""
        if card.total_reviews == 0:
            return 0.5  # Neutral score for new cards
        
        # Calculate retention rate
        retention_rate = card.correct_reviews / card.total_reviews
        
        # Lower retention = higher difficulty = higher priority
        difficulty_score = 1.0 - retention_rate
        
        return min(1.0, max(0.0, difficulty_score))
    
    def _analyze_schedule_distribution(
        self, 
        upcoming: List[Dict[str, Any]], 
        target_daily_reviews: int
    ) -> Dict[str, Any]:
        """Analyze the distribution of reviews across days."""
        daily_counts = [day['total_due'] for day in upcoming]
        
        if not daily_counts:
            return {
                'average_daily': 0,
                'peak_day_count': 0,
                'valley_day_count': 0,
                'distribution_variance': 0,
                'schedule_health': 'unknown'
            }
        
        # Calculate basic statistics
        average_daily = sum(daily_counts) / len(daily_counts)
        peak_day_count = max(daily_counts)
        valley_day_count = min(daily_counts)
        
        # Calculate variance
        variance = sum((count - average_daily) ** 2 for count in daily_counts) / len(daily_counts)
        distribution_variance = variance ** 0.5
        
        # Determine schedule health
        if peak_day_count <= target_daily_reviews * 1.2:
            schedule_health = 'excellent'
        elif peak_day_count <= target_daily_reviews * 1.5:
            schedule_health = 'good'
        elif peak_day_count <= target_daily_reviews * 2.0:
            schedule_health = 'fair'
        else:
            schedule_health = 'poor'
        
        return {
            'average_daily': average_daily,
            'peak_day_count': peak_day_count,
            'valley_day_count': valley_day_count,
            'distribution_variance': distribution_variance,
            'schedule_health': schedule_health,
            'daily_distribution': daily_counts
        }
    
    def _identify_optimization_opportunities(
        self, 
        upcoming: List[Dict[str, Any]], 
        target_daily_reviews: int
    ) -> Dict[str, Any]:
        """Identify opportunities for schedule optimization."""
        overloaded_days = []
        underloaded_days = []
        weekend_opportunities = []
        
        for i, day in enumerate(upcoming):
            total_due = day['total_due']
            
            if total_due > target_daily_reviews * 1.3:
                overloaded_days.append({
                    'date': day['date'],
                    'total_due': total_due,
                    'excess': total_due - target_daily_reviews,
                    'day_index': i,
                    'is_weekend': day['is_weekend']
                })
            
            elif total_due < target_daily_reviews * 0.7:
                underloaded_days.append({
                    'date': day['date'],
                    'total_due': total_due,
                    'deficit': target_daily_reviews - total_due,
                    'day_index': i,
                    'is_weekend': day['is_weekend']
                })
            
            # Identify weekend opportunities
            if day['is_weekend'] and total_due < target_daily_reviews * 0.8:
                weekend_opportunities.append({
                    'date': day['date'],
                    'total_due': total_due,
                    'capacity': target_daily_reviews - total_due
                })
        
        return {
            'overloaded_days': overloaded_days,
            'underloaded_days': underloaded_days,
            'weekend_opportunities': weekend_opportunities,
            'total_optimization_opportunities': len(overloaded_days) + len(underloaded_days)
        }
    
    def _generate_optimization_recommendations(
        self, 
        distribution_analysis: Dict[str, Any],
        optimization_opportunities: Dict[str, Any],
        target_daily_reviews: int
    ) -> List[Dict[str, Any]]:
        """Generate specific optimization recommendations."""
        recommendations = []
        
        # Schedule health recommendations
        if distribution_analysis['schedule_health'] == 'poor':
            recommendations.append({
                'type': 'critical',
                'priority': 'high',
                'title': 'Schedule Overload Detected',
                'description': 'Your schedule has days with significantly more reviews than optimal.',
                'action': 'Consider reviewing cards early on light days to distribute the load.',
                'impact': 'high'
            })
        
        # Overloaded day recommendations
        for overloaded in optimization_opportunities['overloaded_days']:
            recommendations.append({
                'type': 'overload',
                'priority': 'medium',
                'title': f'Overloaded Day: {overloaded["date"]}',
                'description': f'You have {overloaded["total_due"]} cards due on this day.',
                'action': f'Consider reviewing {overloaded["excess"]} cards early on lighter days.',
                'impact': 'medium',
                'date': overloaded['date']
            })
        
        # Underloaded day recommendations
        for underloaded in optimization_opportunities['underloaded_days']:
            recommendations.append({
                'type': 'underload',
                'priority': 'low',
                'title': f'Light Day: {underloaded["date"]}',
                'description': f'You only have {underloaded["total_due"]} cards due on this day.',
                'action': f'Consider reviewing {underloaded["deficit"]} cards early to balance your schedule.',
                'impact': 'low',
                'date': underloaded['date']
            })
        
        # Weekend optimization recommendations
        if optimization_opportunities['weekend_opportunities']:
            total_weekend_capacity = sum(
                opp['capacity'] for opp in optimization_opportunities['weekend_opportunities']
            )
            
            if total_weekend_capacity > 10:
                recommendations.append({
                    'type': 'weekend_optimization',
                    'priority': 'medium',
                    'title': 'Weekend Study Opportunities',
                    'description': f'You have {total_weekend_capacity} additional review slots available on weekends.',
                    'action': 'Use weekend time to review cards early and reduce weekday load.',
                    'impact': 'medium'
                })
        
        # General optimization recommendations
        if distribution_analysis['distribution_variance'] > target_daily_reviews * 0.5:
            recommendations.append({
                'type': 'general',
                'priority': 'medium',
                'title': 'Schedule Distribution Optimization',
                'description': 'Your review schedule could benefit from more even distribution.',
                'action': 'Try to maintain consistent daily review counts for better learning outcomes.',
                'impact': 'medium'
            })
        
        return recommendations
    
    def _calculate_optimization_impact(
        self, 
        current_schedule: List[Dict[str, Any]],
        recommendations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate the potential impact of optimization recommendations."""
        if not recommendations:
            return {
                'potential_improvement': 0,
                'estimated_time_savings': 0,
                'learning_efficiency_gain': 0
            }
        
        # Calculate potential improvement in schedule balance
        current_variance = self._calculate_schedule_variance(current_schedule)
        estimated_improvement = min(1.0, current_variance * 0.3)  # Assume 30% improvement
        
        # Estimate time savings from better distribution
        overloaded_days = [r for r in recommendations if r['type'] == 'overload']
        total_excess = sum(r.get('excess', 0) for r in overloaded_days)
        estimated_time_savings = total_excess * 0.5  # Assume 30 seconds per card
        
        # Estimate learning efficiency gains
        learning_efficiency_gain = estimated_improvement * 0.15  # Assume 15% efficiency gain
        
        return {
            'potential_improvement': estimated_improvement,
            'estimated_time_savings_minutes': estimated_time_savings,
            'learning_efficiency_gain': learning_efficiency_gain,
            'recommendations_count': len(recommendations),
            'high_priority_recommendations': len([r for r in recommendations if r['priority'] == 'high'])
        }
    
    def _calculate_schedule_variance(self, schedule: List[Dict[str, Any]]) -> float:
        """Calculate variance in the schedule distribution."""
        daily_counts = [day['total_due'] for day in schedule]
        
        if not daily_counts:
            return 0.0
        
        mean_count = sum(daily_counts) / len(daily_counts)
        variance = sum((count - mean_count) ** 2 for count in daily_counts) / len(daily_counts)
        
        return variance ** 0.5
    
    def get_schedule_insights(self, user) -> Dict[str, Any]:
        """
        Get insights about the user's current schedule.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with schedule insights and patterns
        """
        # Get schedule for next 30 days
        upcoming = self._get_upcoming_reviews(user, days_ahead=30)
        
        # Analyze patterns
        patterns = self._analyze_schedule_patterns(upcoming)
        
        # Calculate optimal review times
        optimal_times = self._calculate_optimal_review_times(user)
        
        # Generate personalized insights
        insights = self._generate_personalized_insights(patterns, optimal_times)
        
        return {
            'schedule_patterns': patterns,
            'optimal_review_times': optimal_times,
            'personalized_insights': insights,
            'last_updated': timezone.now().isoformat()
        }
    
    def _analyze_schedule_patterns(self, upcoming: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patterns in the schedule."""
        if not upcoming:
            return {}
        
        # Weekly patterns
        weekly_distribution = [0] * 7
        for day in upcoming:
            weekday = day['date'].weekday()
            weekly_distribution[weekday] += day['total_due']
        
        # Weekend vs weekday analysis
        weekday_total = sum(weekly_distribution[:5])
        weekend_total = sum(weekly_distribution[5:])
        
        # Identify peak and valley days
        peak_day = max(weekly_distribution)
        valley_day = min(weekly_distribution)
        peak_day_index = weekly_distribution.index(peak_day)
        valley_day_index = weekly_distribution.index(valley_day)
        
        return {
            'weekly_distribution': weekly_distribution,
            'weekday_total': weekday_total,
            'weekend_total': weekend_total,
            'weekend_ratio': weekend_total / (weekday_total + weekend_total) if (weekday_total + weekend_total) > 0 else 0,
            'peak_day': {
                'day_index': peak_day_index,
                'day_name': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][peak_day_index],
                'total_reviews': peak_day
            },
            'valley_day': {
                'day_index': valley_day_index,
                'day_name': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][valley_day_index],
                'total_reviews': valley_day
            }
        }
    
    def _calculate_optimal_review_times(self, user) -> Dict[str, Any]:
        """Calculate optimal review times based on user patterns."""
        # This is a simplified calculation - in practice you might analyze actual user behavior
        return {
            'morning_reviews': '6:00 AM - 9:00 AM',
            'afternoon_reviews': '2:00 PM - 5:00 PM',
            'evening_reviews': '7:00 PM - 10:00 PM',
            'optimal_session_length': '20-30 minutes',
            'break_interval': '5 minutes every 20 minutes'
        }
    
    def _generate_personalized_insights(
        self, 
        patterns: Dict[str, Any], 
        optimal_times: Dict[str, Any]
    ) -> List[str]:
        """Generate personalized insights based on schedule patterns."""
        insights = []
        
        # Weekend utilization insights
        weekend_ratio = patterns.get('weekend_ratio', 0)
        if weekend_ratio < 0.1:
            insights.append(
                "You rarely study on weekends. Consider using weekend time to reduce weekday load."
            )
        elif weekend_ratio > 0.4:
            insights.append(
                "You study heavily on weekends. This might indicate weekday schedule constraints."
            )
        
        # Peak day insights
        peak_day = patterns.get('peak_day', {})
        if peak_day.get('total_reviews', 0) > 30:
            insights.append(
                f"Your peak day ({peak_day.get('day_name', 'Unknown')}) has many reviews. "
                "Consider distributing this load across adjacent days."
            )
        
        # Valley day insights
        valley_day = patterns.get('valley_day', {})
        if valley_day.get('total_reviews', 0) < 5:
            insights.append(
                f"Your lightest day ({valley_day.get('day_name', 'Unknown')}) has few reviews. "
                "This could be a good day to review cards early."
            )
        
        # General insights
        if len(insights) == 0:
            insights.append(
                "Your schedule is well-balanced. Keep up the good work!"
            )
        
        return insights
