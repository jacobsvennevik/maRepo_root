# Scheduler Services Package
# 
# This package contains the refactored scheduler services for
# spaced repetition scheduling, broken down into focused, maintainable modules.
#
# Modules:
# - session_manager.py: Review session lifecycle and tracking
# - dashboard_generator.py: Analytics and statistics aggregation
# - study_planner.py: Study planning and optimization recommendations
# - analytics_calculator.py: Learning analytics computation and performance tracking
# - schedule_optimizer.py: Schedule optimization and load balancing

from .session_manager import ReviewSession
from .dashboard_generator import DashboardGenerator
from .study_planner import StudyPlanner
from .analytics_calculator import AnalyticsCalculator
from .schedule_optimizer import ScheduleOptimizer
from ..scheduler_core import ReviewScheduleManager, ReviewSession as CoreReviewSession

__all__ = [
    'ReviewSession',
    'DashboardGenerator',
    'StudyPlanner',
    'AnalyticsCalculator',
    'ScheduleOptimizer',
    'ReviewScheduleManager',
]

# Version information
__version__ = "2.0.0"
__author__ = "Generation App Refactoring Team"
__description__ = "Refactored scheduler services for spaced repetition"
