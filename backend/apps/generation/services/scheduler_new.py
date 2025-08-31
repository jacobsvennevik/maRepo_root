"""
New Scheduler Service

This is the refactored version of the scheduler service,
using the new modular structure for better maintainability and testability.
"""

from typing import Dict, List, Any, Optional
from .scheduler import (
    ReviewSession,
    DashboardGenerator,
    StudyPlanner,
    AnalyticsCalculator,
    ScheduleOptimizer
)


class ReviewScheduleManager:
    """
    Refactored manager for review schedules and analytics.
    
    This service now uses the modular architecture:
    - ReviewSession: Session lifecycle and tracking
    - DashboardGenerator: Analytics and statistics
    - StudyPlanner: Study planning and recommendations
    - AnalyticsCalculator: Performance tracking and insights
    - ScheduleOptimizer: Schedule optimization and load balancing
    
    The original 411-line service has been broken down into focused modules
    while maintaining the same public API.
    """
    
    def __init__(self):
        self.dashboard_generator = DashboardGenerator()
        self.study_planner = StudyPlanner()
        self.analytics_calculator = AnalyticsCalculator()
        self.schedule_optimizer = ScheduleOptimizer()
    
    def get_review_dashboard(self, user) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for a user.
        
        Returns:
            Dictionary with review statistics and upcoming schedule
        """
        return self.dashboard_generator.get_review_dashboard(user)
    
    def get_upcoming_reviews(self, user, days_ahead: int = 7) -> List[Dict]:
        """
        Get upcoming reviews for the next specified days.
        
        Args:
            user: User instance
            days_ahead: Number of days to look ahead
            
        Returns:
            List of review schedule data by day
        """
        # This method is now handled by the schedule optimizer
        return self.schedule_optimizer._get_upcoming_reviews(user, days_ahead)
    
    def optimize_daily_schedule(
        self, 
        user, 
        target_daily_reviews: int = 20
    ) -> Dict[str, Any]:
        """
        Optimize the daily review schedule to distribute load evenly.
        
        Args:
            user: User instance
            target_daily_reviews: Target number of reviews per day
            
        Returns:
            Optimization recommendations
        """
        return self.schedule_optimizer.optimize_daily_schedule(
            user, 
            target_daily_reviews
        )
    
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
        return self.analytics_calculator.get_learning_analytics(user, timeframe_days)
    
    def suggest_study_plan(
        self, 
        user, 
        available_time_minutes: int = 20
    ) -> Dict[str, Any]:
        """
        Suggest an optimal study plan based on available time and due cards.
        
        Args:
            user: User instance
            available_time_minutes: Available study time in minutes
            
        Returns:
            Recommended study plan
        """
        return self.study_planner.suggest_study_plan(user, available_time_minutes)
    
    def get_schedule_insights(self, user) -> Dict[str, Any]:
        """
        Get insights about the user's current schedule.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with schedule insights and patterns
        """
        return self.schedule_optimizer.get_schedule_insights(user)
    
    def get_quick_stats(self, user) -> Dict[str, Any]:
        """
        Get quick statistics for dashboard widgets.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with key statistics for quick display
        """
        return self.dashboard_generator.get_quick_stats(user)
    
    # Backward compatibility methods
    def _determine_study_focus(self, recommended_cards: List[Dict]) -> str:
        """Backward compatibility method - delegates to StudyPlanner."""
        if not recommended_cards:
            return 'no_cards_due'
        
        # Extract the logic from the original method
        avg_retention = sum(item['retention'] for item in recommended_cards) / len(recommended_cards)
        avg_urgency = sum(item['urgency'] for item in recommended_cards) / len(recommended_cards)
        
        if avg_retention < 0.5:
            return 'review_difficult_cards'
        elif avg_urgency > 1:
            return 'catch_up_overdue'
        else:
            return 'balanced_review'


# Backward compatibility alias
ReviewSession = ReviewSession
