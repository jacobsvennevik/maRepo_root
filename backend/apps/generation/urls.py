from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    generate_flashcards_view, 
    generate_mindmap_view,
    export_flashcard_set_to_anki,
    export_user_flashcards_to_anki,
    export_multiple_flashcard_sets_to_anki
)
from .views_api import (
    FlashcardSetViewSet,
    FlashcardViewSet,
    MindMapViewSet,
    DueCardsAPIView,
    ReviewSessionAPIView,
    ReviewDashboardAPIView,
    UpcomingReviewsAPIView,
    StudyPlanAPIView,
    LearningAnalyticsAPIView,
    ScheduleOptimizationAPIView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'flashcard-sets', FlashcardSetViewSet, basename='flashcard-sets')
router.register(r'flashcards', FlashcardViewSet, basename='flashcards')
router.register(r'mindmaps', MindMapViewSet, basename='mindmaps')

urlpatterns = [
    # Traditional view endpoints
    path('flashcards/generate/', generate_flashcards_view, name="generate_flashcards"),
    path('mindmap/generate/', generate_mindmap_view, name="generate_mindmap"),
    
    # Legacy Anki export endpoints (keep for backward compatibility)
    path('flashcards/<int:flashcard_set_id>/export-anki/', export_flashcard_set_to_anki, name="export_flashcard_set_anki"),
    path('flashcards/export-all-anki/', export_user_flashcards_to_anki, name="export_user_flashcards_anki"),
    path('flashcards/export-multiple-anki/', export_multiple_flashcard_sets_to_anki, name="export_multiple_flashcards_anki"),
    
    # API ViewSet endpoints
    path('api/', include(router.urls)),
    
    # Spaced Repetition API endpoints
    path('api/review/due-cards/', DueCardsAPIView.as_view(), name='due-cards'),
    path('api/review/session/', ReviewSessionAPIView.as_view(), name='review-session'),
    path('api/review/dashboard/', ReviewDashboardAPIView.as_view(), name='review-dashboard'),
    path('api/review/upcoming/', UpcomingReviewsAPIView.as_view(), name='upcoming-reviews'),
    path('api/review/study-plan/', StudyPlanAPIView.as_view(), name='study-plan'),
    path('api/review/analytics/', LearningAnalyticsAPIView.as_view(), name='learning-analytics'),
    path('api/review/optimize/', ScheduleOptimizationAPIView.as_view(), name='schedule-optimization'),
]
