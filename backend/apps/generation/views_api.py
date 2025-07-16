from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from .models import FlashcardSet, Flashcard, MindMap
from .serializers import (
    FlashcardSetSerializer, FlashcardSerializer, MindMapSerializer,
    FlashcardReviewSerializer, ReviewSessionSerializer, ReviewSessionStatsSerializer,
    DueCardsSerializer, ReviewDashboardSerializer, UpcomingReviewsSerializer,
    StudyPlanSerializer, StudyPlanResponseSerializer, LearningAnalyticsSerializer,
    LearningAnalyticsResponseSerializer, CardRetentionSerializer,
    ScheduleOptimizationSerializer
)
from .services.anki_exporter import AnkiExportService
from .services.scheduler import ReviewSession, ReviewScheduleManager

class FlashcardSetViewSet(viewsets.ModelViewSet):
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter flashcard sets by owner when authenticated."""
        if self.request.user.is_authenticated:
            return FlashcardSet.objects.filter(owner=self.request.user)
        return FlashcardSet.objects.none()
    
    @action(detail=True, methods=['get'], url_path='export-anki')
    def export_to_anki(self, request, pk=None):
        """
        Export a specific flashcard set to Anki format.
        
        Query parameters:
        - include_source: boolean (default: true)
        - card_type: 'basic' or 'cloze' (default: 'basic')
        """
        try:
            flashcard_set = self.get_object()
            
            # Get optional parameters
            include_source = request.query_params.get('include_source', 'true').lower() == 'true'
            card_type = request.query_params.get('card_type', 'basic')
            
            # Validate card type
            if card_type not in ['basic', 'cloze']:
                return Response(
                    {'error': 'Invalid card_type. Must be "basic" or "cloze".'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Export flashcard set
            exporter = AnkiExportService()
            apkg_content = exporter.export_flashcard_set(
                flashcard_set=flashcard_set,
                include_source=include_source,
                card_type=card_type
            )
            
            # Create filename
            filename = f"{flashcard_set.title.replace(' ', '_')}.apkg"
            
            # Return file response
            response = Response(apkg_content, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='export-all-anki')
    def export_all_to_anki(self, request):
        """
        Export all user's flashcard sets to a single Anki package.
        
        Query parameters:
        - include_source: boolean (default: true)
        - card_type: 'basic' or 'cloze' (default: 'basic')
        """
        try:
            # Get user's flashcard sets
            flashcard_sets = self.get_queryset()
            
            if not flashcard_sets.exists():
                return Response(
                    {'error': 'No flashcard sets found.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get optional parameters
            include_source = request.query_params.get('include_source', 'true').lower() == 'true'
            card_type = request.query_params.get('card_type', 'basic')
            
            # Validate card type
            if card_type not in ['basic', 'cloze']:
                return Response(
                    {'error': 'Invalid card_type. Must be "basic" or "cloze".'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Export all flashcard sets
            exporter = AnkiExportService()
            apkg_content = exporter.export_multiple_flashcard_sets(
                flashcard_sets=list(flashcard_sets),
                include_source=include_source,
                card_type=card_type
            )
            
            # Create filename with timestamp
            timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f"all_flashcards_{timestamp}.apkg"
            
            # Return file response
            response = Response(apkg_content, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='export-multiple-anki')
    def export_multiple_to_anki(self, request):
        """
        Export multiple selected flashcard sets to Anki format.
        
        Request body:
        {
            "flashcard_set_ids": [1, 2, 3],
            "include_source": true,
            "card_type": "basic"
        }
        """
        try:
            # Validate request data
            flashcard_set_ids = request.data.get('flashcard_set_ids', [])
            include_source = request.data.get('include_source', True)
            card_type = request.data.get('card_type', 'basic')
            
            if not flashcard_set_ids:
                return Response(
                    {'error': 'flashcard_set_ids is required.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate card type
            if card_type not in ['basic', 'cloze']:
                return Response(
                    {'error': 'Invalid card_type. Must be "basic" or "cloze".'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get flashcard sets (ensure user owns them)
            flashcard_sets = self.get_queryset().filter(id__in=flashcard_set_ids)
            
            if not flashcard_sets.exists():
                return Response(
                    {'error': 'No valid flashcard sets found.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Export selected flashcard sets
            exporter = AnkiExportService()
            apkg_content = exporter.export_multiple_flashcard_sets(
                flashcard_sets=list(flashcard_sets),
                include_source=include_source,
                card_type=card_type
            )
            
            # Create filename
            timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f"selected_flashcards_{timestamp}.apkg"
            
            # Return file response
            response = Response(apkg_content, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], url_path='review-stats')
    def get_review_stats(self, request, pk=None):
        """Get detailed review statistics for a flashcard set."""
        flashcard_set = self.get_object()
        
        cards = flashcard_set.flashcards.all()
        total_cards = cards.count()
        
        if total_cards == 0:
            return Response({
                'total_cards': 0,
                'due_cards': 0,
                'learning_cards': 0,
                'review_cards': 0,
                'new_cards': 0,
                'average_accuracy': 0,
                'algorithm_breakdown': {}
            })
        
        # Calculate statistics
        due_cards = cards.filter(next_review__lte=timezone.now()).count()
        learning_cards = cards.filter(learning_state='learning').count()
        review_cards = cards.filter(learning_state='review').count()
        new_cards = cards.filter(learning_state='new').count()
        
        # Calculate average accuracy
        cards_with_reviews = cards.filter(total_reviews__gt=0)
        if cards_with_reviews.exists():
            total_reviews = sum(card.total_reviews for card in cards_with_reviews)
            total_correct = sum(card.correct_reviews for card in cards_with_reviews)
            average_accuracy = (total_correct / total_reviews * 100) if total_reviews > 0 else 0
        else:
            average_accuracy = 0
        
        # Algorithm breakdown
        algorithm_breakdown = {}
        for algorithm in ['sm2', 'leitner']:
            algo_cards = cards.filter(algorithm=algorithm)
            algorithm_breakdown[algorithm] = {
                'count': algo_cards.count(),
                'due': algo_cards.filter(next_review__lte=timezone.now()).count()
            }
        
        return Response({
            'total_cards': total_cards,
            'due_cards': due_cards,
            'learning_cards': learning_cards,
            'review_cards': review_cards,
            'new_cards': new_cards,
            'average_accuracy': average_accuracy,
            'algorithm_breakdown': algorithm_breakdown
        })


class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter flashcards by owner when authenticated."""
        if self.request.user.is_authenticated:
            return Flashcard.objects.filter(flashcard_set__owner=self.request.user)
        return Flashcard.objects.none()

    @action(detail=True, methods=['post'], url_path='review')
    def review_card(self, request, pk=None):
        """
        Review a single flashcard and update its schedule.
        
        Request body:
        {
            "quality": 3,  // 0-5 quality rating
            "response_time_seconds": 15.5  // optional
        }
        """
        flashcard = self.get_object()
        serializer = FlashcardReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            quality = serializer.validated_data['quality']
            response_time = serializer.validated_data.get('response_time_seconds')
            
            # Create a review session for this single card
            session = ReviewSession(request.user, session_limit=1)
            session.review_card(flashcard, quality, response_time)
            
            # Return updated card data
            updated_serializer = FlashcardSerializer(flashcard)
            return Response({
                'card': updated_serializer.data,
                'message': 'Card reviewed successfully'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reset')
    def reset_card(self, request, pk=None):
        """Reset a card to new state (useful for relearning)."""
        flashcard = self.get_object()
        flashcard.reset_to_new()
        flashcard.save()
        
        serializer = FlashcardSerializer(flashcard)
        return Response({
            'card': serializer.data,
            'message': 'Card reset to new state'
        })

    @action(detail=True, methods=['get'], url_path='retention')
    def get_retention(self, request, pk=None):
        """Get current retention probability for a card."""
        from .services.scheduler import ReviewScheduleManager
        
        flashcard = self.get_object()
        manager = ReviewScheduleManager()
        retention = manager.scheduler.get_card_retention(flashcard)
        
        return Response({
            'card_id': flashcard.id,
            'retention': retention,
            'interval': flashcard.interval,
            'memory_strength': flashcard.memory_strength,
            'next_review': flashcard.next_review,
            'learning_state': flashcard.learning_state
        })


class SpacedRepetitionAPIView(APIView):
    """API views for spaced repetition functionality."""
    
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


class MindMapViewSet(viewsets.ModelViewSet):
    queryset = MindMap.objects.all()
    serializer_class = MindMapSerializer
    # permission_classes = [permissions.IsAuthenticated]
