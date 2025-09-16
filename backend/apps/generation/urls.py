from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import traditional views from the renamed traditional_views.py file
from . import traditional_views

# Import organized ViewSets from new api_views modules
from .api_views.flashcard_views import (
    FlashcardSetViewSet,
    FlashcardViewSet,
    ProjectFlashcardSetViewSet,
    ProjectFlashcardViewSet,
    BulkReviewAPIView
)
from .api_views.spaced_repetition_views import (
    DueCardsAPIView,
    ReviewSessionAPIView,
    ReviewDashboardAPIView,
    UpcomingReviewsAPIView,
    StudyPlanAPIView,
    LearningAnalyticsAPIView,
    ScheduleOptimizationAPIView
)
from .api_views.interleaving_views import (
    InterleavingConfigView,
    InterleavingSessionView,
    DifficultyDialView
)
from .api_views.diagnostic_views import (
    DiagnosticSessionViewSet,
    DiagnosticResponseViewSet,
    DiagnosticGenerationView,
    DiagnosticAnalyticsView
)
from .api_views.mindmap_views import MindMapViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register(r'flashcard-sets', FlashcardSetViewSet, basename='flashcard-sets')
router.register(r'flashcards', FlashcardViewSet, basename='flashcards')
router.register(r'mindmaps', MindMapViewSet, basename='mindmaps')
router.register(r'diagnostic-sessions', DiagnosticSessionViewSet, basename='diagnostic-sessions')
router.register(r'diagnostic-responses', DiagnosticResponseViewSet, basename='diagnostic-responses')

urlpatterns = [
    # Traditional view endpoints
    path('flashcards/generate/', traditional_views.generate_flashcards_view, name="generate_flashcards"),
    path('mindmap/generate/', traditional_views.generate_mindmap_view, name="generate_mindmap"),
    
    # Legacy Anki export endpoints (keep for backward compatibility)
    path('flashcards/<int:flashcard_set_id>/export-anki/', traditional_views.export_flashcard_set_to_anki, name="export_flashcard_set_anki"),
    path('flashcards/export-all-anki/', traditional_views.export_user_flashcards_to_anki, name="export_user_flashcards_anki"),
    path('flashcards/export-multiple-anki/', traditional_views.export_multiple_flashcard_sets_to_anki, name="export_multiple_flashcards_anki"),

    # Aliases expected by tests
    path('flashcards/<int:pk>/export-anki/', traditional_views.export_flashcard_set_to_anki, name='flashcardset-export-anki'),
    path('flashcards/export-all-anki/', traditional_views.export_user_flashcards_to_anki, name='flashcardset-export-all-anki'),
    path('flashcards/export-multiple-anki/', traditional_views.export_multiple_flashcard_sets_to_anki, name='flashcardset-export-multiple-anki'),
    
    # API ViewSet endpoints
    path('api/', include(router.urls)),
    
    # Project-specific flashcard endpoints (Phase 1)
    path('api/projects/<uuid:project_id>/flashcard-sets/', ProjectFlashcardSetViewSet.as_view({'get': 'list', 'post': 'create'}), name='project-flashcard-sets'),
    path('api/projects/<uuid:project_id>/flashcard-sets/<int:pk>/', ProjectFlashcardSetViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='project-flashcard-set-detail'),
    path('api/projects/<uuid:project_id>/flashcards/generate', ProjectFlashcardSetViewSet.as_view({'post': 'generate_from_project'}), name='project-generate-flashcards'),
    path('api/projects/<uuid:project_id>/flashcards/due/', ProjectFlashcardViewSet.as_view({'get': 'due_cards'}), name='project-due-cards'),
    
    # Individual flashcard review (global endpoint)
    path('api/flashcards/<int:pk>/review/', FlashcardViewSet.as_view({'post': 'review_card'}), name='flashcard-review'),
    path('api/flashcards/<int:pk>/reset/', FlashcardViewSet.as_view({'post': 'reset_card'}), name='flashcard-reset'),
    
    # Bulk review endpoint
    path('api/flashcards/reviews/', BulkReviewAPIView.as_view(), name='bulk-review'),
    
    # Spaced Repetition API endpoints
    path('api/review/due-cards/', DueCardsAPIView.as_view(), name='due-cards'),
    path('api/review/session/', ReviewSessionAPIView.as_view(), name='review-session'),
    path('api/review/dashboard/', ReviewDashboardAPIView.as_view(), name='review-dashboard'),
    path('api/review/upcoming/', UpcomingReviewsAPIView.as_view(), name='upcoming-reviews'),
    path('api/review/study-plan/', StudyPlanAPIView.as_view(), name='study-plan'),
    path('api/review/analytics/', LearningAnalyticsAPIView.as_view(), name='learning-analytics'),
    path('api/review/optimize/', ScheduleOptimizationAPIView.as_view(), name='schedule-optimization'),
    
    # Interleaving Scheduler API endpoints
    path('api/interleaving/config/', InterleavingConfigView.as_view(), name='interleaving-config'),
    path('api/interleaving/session/', InterleavingSessionView.as_view(), name='interleaving-session'),
    path('api/interleaving/difficulty/', DifficultyDialView.as_view(), name='interleaving-difficulty'),
    
    # Diagnostic API endpoints
    path('api/diagnostics/generate/', DiagnosticGenerationView.as_view(), name='diagnostic-generate'),
    path('api/diagnostics/sessions/<uuid:session_id>/analytics/', DiagnosticAnalyticsView.as_view(), name='diagnostic-analytics'),
    path('api/diagnostics/sessions/<uuid:session_id>/analytics/export/', DiagnosticAnalyticsView.as_view(), name='diagnostic-analytics-export'),
]
