"""
Spaced repetition-related API views.

This module contains all spaced repetition-related API views,
including due cards, review sessions, and learning analytics.
"""


from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from ..models import Flashcard
from ..serializers import (
    DueCardsSerializer, ReviewSessionSerializer, ReviewSessionStatsSerializer,
    ReviewDashboardSerializer, UpcomingReviewsSerializer, StudyPlanSerializer,
    StudyPlanResponseSerializer, LearningAnalyticsSerializer,
    LearningAnalyticsResponseSerializer, ScheduleOptimizationSerializer,
    FlashcardSerializer
)
from ..services.scheduler import ReviewSession
from ..services import ReviewScheduleManager
from ..services.spaced_repetition import SpacedRepetitionScheduler
from ..utils.response_helpers import create_error_response, create_success_response
from ..utils.validation_helpers import validate_session_limit


class SpacedRepetitionAPIView(APIView):
    """Base API view for spaced repetition functionality."""
    
    # permission_classes = [permissions.IsAuthenticated]
    
    def get_user_cards(self):
        """Helper method to get user's flashcards."""
        return Flashcard.objects.filter(flashcard_set__owner=self.request.user)


class DueCardsAPIView(SpacedRepetitionAPIView):
    """Get cards that are due for review."""
    
    def get(self, request):
        """
        Get cards due for review.
        
        Query parameters:
        - limit: Maximum number of cards (default: 20)
        - algorithm: Filter by algorithm (sm2, leitner)
        - learning_state: Filter by learning state
        """
        serializer = DueCardsSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        limit = serializer.validated_data['limit']
        algorithm = serializer.validated_data.get('algorithm')
        learning_state = serializer.validated_data.get('learning_state')
        
        # Start with due cards
        due_cards = self.get_user_cards().filter(next_review__lte=timezone.now())
        
        # Apply filters
        if algorithm:
            due_cards = due_cards.filter(algorithm=algorithm)
        if learning_state:
            due_cards = due_cards.filter(learning_state=learning_state)
        
        # Order by next_review and limit
        due_cards = due_cards.order_by('next_review')[:limit]
        
        serializer = FlashcardSerializer(due_cards, many=True)
        return Response({
            'cards': serializer.data,
            'total_due': due_cards.count()
        })


class ReviewSessionAPIView(SpacedRepetitionAPIView):
    """Manage review sessions."""
    
    def post(self, request):
        """Start a new review session."""
        serializer = ReviewSessionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        session_limit = serializer.validated_data['session_limit']
        
        # Validate session limit
        if not validate_session_limit(session_limit):
            return create_error_response('Invalid session limit. Must be between 1 and 100.', status.HTTP_400_BAD_REQUEST)
        
        # Create review session
        session = ReviewSession(request.user, session_limit)
        
        # Get first card
        next_card = session.get_next_card()
        if next_card:
            card_serializer = FlashcardSerializer(next_card)
            return Response({
                'session_stats': session.session_stats,
                'next_card': card_serializer.data,
                'message': 'Review session started'
            })
        else:
            return Response({
                'session_stats': session.session_stats,
                'next_card': None,
                'message': 'No cards due for review'
            })


class ReviewDashboardAPIView(SpacedRepetitionAPIView):
    """Get comprehensive review dashboard data."""
    
    def get(self, request):
        """Get dashboard data for the authenticated user."""
        manager = ReviewScheduleManager()
        dashboard_data = manager.get_review_dashboard(request.user)
        serializer = ReviewDashboardSerializer(dashboard_data)
        return Response(serializer.data)


class UpcomingReviewsAPIView(SpacedRepetitionAPIView):
    """Get upcoming review schedule."""
    
    def get(self, request):
        """Get upcoming reviews for the next N days."""
        serializer = UpcomingReviewsSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        days_ahead = serializer.validated_data['days_ahead']
        
        manager = ReviewScheduleManager()
        schedule = manager.get_upcoming_reviews(request.user, days_ahead)
        
        return Response({
            'schedule': schedule,
            'days_ahead': days_ahead
        })


class StudyPlanAPIView(SpacedRepetitionAPIView):
    """Get personalized study plan suggestions."""
    
    def post(self, request):
        """Get study plan based on available time."""
        serializer = StudyPlanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        available_time = serializer.validated_data['available_time_minutes']
        
        manager = ReviewScheduleManager()
        study_plan = manager.suggest_study_plan(request.user, available_time)
        
        response_serializer = StudyPlanResponseSerializer(study_plan)
        return Response(response_serializer.data)


class LearningAnalyticsAPIView(SpacedRepetitionAPIView):
    """Get detailed learning analytics."""
    
    def get(self, request):
        """Get learning analytics for a specified timeframe."""
        serializer = LearningAnalyticsSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        timeframe_days = serializer.validated_data['timeframe_days']
        
        manager = ReviewScheduleManager()
        analytics = manager.get_learning_analytics(request.user, timeframe_days)
        
        response_serializer = LearningAnalyticsResponseSerializer(analytics)
        return Response(response_serializer.data)


class ScheduleOptimizationAPIView(SpacedRepetitionAPIView):
    """Get schedule optimization recommendations."""
    
    def post(self, request):
        """Get recommendations for optimizing review schedule."""
        serializer = ScheduleOptimizationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        target_daily_reviews = serializer.validated_data['target_daily_reviews']
        
        manager = ReviewScheduleManager()
        optimization = manager.optimize_daily_schedule(request.user, target_daily_reviews)
        
        return Response(optimization)
