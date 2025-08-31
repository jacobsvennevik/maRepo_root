# API Views package initialization
# Import all view modules to maintain backward compatibility

from .flashcard_views import (
    FlashcardSetViewSet,
    FlashcardViewSet,
    ProjectFlashcardViewSet,
    ProjectFlashcardSetViewSet,
    BulkReviewAPIView
)

from .spaced_repetition_views import (
    SpacedRepetitionAPIView,
    DueCardsAPIView,
    ReviewSessionAPIView,
    ReviewDashboardAPIView,
    UpcomingReviewsAPIView,
    StudyPlanAPIView,
    LearningAnalyticsAPIView,
    ScheduleOptimizationAPIView
)

from .interleaving_views import (
    InterleavingConfigView,
    InterleavingSessionView,
    DifficultyDialView
)

from .diagnostic_views import (
    DiagnosticSessionViewSet,
    DiagnosticResponseViewSet,
    DiagnosticGenerationView,
    DiagnosticAnalyticsView
)

from .mindmap_views import MindMapViewSet

__all__ = [
    # Flashcard views
    'FlashcardSetViewSet',
    'FlashcardViewSet', 
    'ProjectFlashcardViewSet',
    'ProjectFlashcardSetViewSet',
    'BulkReviewAPIView',
    
    # Spaced repetition views
    'SpacedRepetitionAPIView',
    'DueCardsAPIView',
    'ReviewSessionAPIView',
    'ReviewDashboardAPIView',
    'UpcomingReviewsAPIView',
    'StudyPlanAPIView',
    'LearningAnalyticsAPIView',
    'ScheduleOptimizationAPIView',
    
    # Interleaving views
    'InterleavingConfigView',
    'InterleavingSessionView',
    'DifficultyDialView',
    
    # Diagnostic views
    'DiagnosticSessionViewSet',
    'DiagnosticResponseViewSet',
    'DiagnosticGenerationView',
    'DiagnosticAnalyticsView',
    
    # MindMap views
    'MindMapViewSet',
]
