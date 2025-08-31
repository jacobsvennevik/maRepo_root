from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from .models import FlashcardSet, Flashcard, MindMap, InterleavingSessionConfig
from .models import DiagnosticSession, DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics
from .serializers import (
    FlashcardSetSerializer, FlashcardSerializer, MindMapSerializer,
    FlashcardReviewSerializer, ReviewSessionSerializer, ReviewSessionStatsSerializer,
    DueCardsSerializer, ReviewDashboardSerializer, UpcomingReviewsSerializer,
    StudyPlanSerializer, StudyPlanResponseSerializer, LearningAnalyticsSerializer,
    LearningAnalyticsResponseSerializer, CardRetentionSerializer,
    ScheduleOptimizationSerializer,
    InterleavingSessionConfigSerializer, InterleavingSessionRequestSerializer,
    InterleavingSessionResponseSerializer,
    DiagnosticSessionSerializer, DiagnosticQuestionSerializer, DiagnosticResponseSerializer,
    DiagnosticAnalyticsSerializer, DiagnosticSessionCreateSerializer,
    DiagnosticSessionStartSerializer, DiagnosticSessionResultSerializer,
    DiagnosticGenerationRequestSerializer
)
from .services.anki_exporter import AnkiExportService
# from .services.scheduler_new import ReviewSession, ReviewScheduleManager
from .services.interleaving_session_new import InterleavingSessionService
from .services.difficulty_dial import DifficultyDialService
from .services.diagnostic_generator import DiagnosticGenerator

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


class ProjectFlashcardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing flashcards within a specific project context.
    Focused on due cards and study sessions.
    """
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get flashcards for the specific project."""
        project_id = self.kwargs.get('project_id')
        return Flashcard.objects.filter(
            flashcard_set__project_links__project_id=project_id,
            flashcard_set__owner=self.request.user
        )
    
    @action(detail=False, methods=['get'], url_path='due')
    def due_cards(self, request, project_id=None):
        """
        Get due cards for study session.
        
        Query parameters:
        - limit: number of cards to return (default: 20)
        - algorithm: 'sm2' or 'leitner' (optional)
        """
        try:
            from backend.apps.projects.models import Project
            
            project = get_object_or_404(Project, id=project_id, owner=request.user)
            limit = int(request.query_params.get('limit', 20))
            algorithm = request.query_params.get('algorithm')
            
            # Get due cards from project flashcard sets
            due_cards = Flashcard.objects.filter(
                flashcard_set__project_links__project=project,
                next_review__lte=timezone.now().date()
            )
            
            if algorithm:
                due_cards = due_cards.filter(algorithm=algorithm)
            
            due_cards = due_cards.order_by('next_review')[:limit]
            
            # Get session statistics
            total_cards = Flashcard.objects.filter(
                flashcard_set__project_links__project=project
            ).count()
            
            due_count = due_cards.count()
            learning_count = Flashcard.objects.filter(
                flashcard_set__project_links__project=project,
                learning_state='learning'
            ).count()
            
            return Response({
                'project_id': project_id,
                'total_cards': total_cards,
                'due_cards': due_count,
                'learning_cards': learning_count,
                'session_cards': FlashcardSerializer(due_cards, many=True).data,
                'session_start': timezone.now()
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get due cards: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProjectFlashcardSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing flashcard sets within a specific project context.
    Provides project-specific flashcard set operations.
    """
    serializer_class = FlashcardSetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get flashcard sets for the specific project."""
        project_id = self.kwargs.get('project_id')
        return FlashcardSet.objects.filter(
            project_links__project_id=project_id,
            owner=self.request.user
        )
    
    def perform_create(self, serializer):
        """Create flashcard set and link it to the project."""
        project_id = self.kwargs.get('project_id')
        flashcard_set = serializer.save(owner=self.request.user)
        
        # Link to project
        from backend.apps.projects.models import ProjectFlashcardSet
        ProjectFlashcardSet.objects.create(
            project_id=project_id,
            flashcard_set=flashcard_set,
            is_primary=not ProjectFlashcardSet.objects.filter(project_id=project_id).exists()
        )
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_from_project(self, request, project_id=None):
        """
        Generate flashcards from project materials (uploaded files, extracted content).
        
        Request body:
        - source_type: 'files', 'extractions', 'manual'
        - num_cards: number of cards to generate (optional)
        - difficulty: 'easy', 'medium', 'hard' (optional)
        """
        try:
            from backend.apps.projects.models import Project, UploadedFile, Extraction
            
            project = get_object_or_404(Project, id=project_id, owner=request.user)
            source_type = request.data.get('source_type', 'files')
            num_cards = request.data.get('num_cards', 10)
            difficulty = request.data.get('difficulty', 'medium')
            
            # Anti-spam limit: cap generation at 200 cards per project
            if num_cards > 200:
                return Response(
                    {'error': 'Maximum 200 cards can be generated per request'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check existing cards in project to prevent runaway generation
            existing_cards = Flashcard.objects.filter(
                flashcard_set__project_links__project=project
            ).count()
            
            if existing_cards + num_cards > 1000:  # Hard limit per project
                return Response(
                    {'error': f'Project already has {existing_cards} cards. Cannot generate {num_cards} more (limit: 1000 total)'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get project materials based on source type
            if source_type == 'files':
                materials = UploadedFile.objects.filter(project=project)
                content = '\n'.join([f.raw_text for f in materials if f.raw_text])
            elif source_type == 'extractions':
                extractions = Extraction.objects.filter(uploaded_file__project=project)
                content = '\n'.join([str(e.response) for e in extractions])
            else:
                return Response(
                    {'error': 'Invalid source_type'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not content:
                return Response(
                    {'error': 'No content found for flashcard generation'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate flashcards using existing service
            from .services.flashcard_generator import FlashcardGenerator
            generator = FlashcardGenerator()
            flashcards_data = generator.generate_from_content(
                content=content,
                num_cards=num_cards,
                difficulty=difficulty
            )
            
            # Create flashcard set
            flashcard_set = FlashcardSet.objects.create(
                title=f"{project.name} Flashcards",
                owner=request.user
            )
            
            # Create flashcards
            for card_data in flashcards_data:
                Flashcard.objects.create(
                    flashcard_set=flashcard_set,
                    question=card_data['question'],
                    answer=card_data['answer']
                )
            
            # Link to project
            from backend.apps.projects.models import ProjectFlashcardSet
            ProjectFlashcardSet.objects.create(
                project=project,
                flashcard_set=flashcard_set,
                is_primary=not ProjectFlashcardSet.objects.filter(project=project).exists()
            )
            
            return Response(
                FlashcardSetSerializer(flashcard_set, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': f'Generation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BulkReviewAPIView(APIView):
    """
    Bulk review endpoint for submitting multiple flashcard reviews in one call.
    Reduces network overhead during study sessions.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Submit multiple flashcard reviews.
        
        Request body:
        {
            "reviews": [
                {
                    "flashcard_id": 123,
                    "quality": 4,
                    "response_time_seconds": 2.5
                },
                {
                    "flashcard_id": 124,
                    "quality": 5,
                    "response_time_seconds": 1.8
                }
            ]
        }
        """
        try:
            reviews_data = request.data.get('reviews', [])
            
            if not reviews_data:
                return Response(
                    {'error': 'No reviews provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if len(reviews_data) > 50:  # Anti-spam limit
                return Response(
                    {'error': 'Maximum 50 reviews per request'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            results = []
            from .services.spaced_repetition import SpacedRepetitionScheduler
            scheduler = SpacedRepetitionScheduler()
            
            with transaction.atomic():
                for review_data in reviews_data:
                    flashcard_id = review_data.get('flashcard_id')
                    quality = review_data.get('quality')
                    response_time = review_data.get('response_time_seconds', 0)
                    
                    if not flashcard_id or quality is None:
                        results.append({
                            'flashcard_id': flashcard_id,
                            'success': False,
                            'error': 'Missing flashcard_id or quality'
                        })
                        continue
                    
                    try:
                        # Get flashcard and verify ownership
                        flashcard = Flashcard.objects.select_related('flashcard_set').get(
                            id=flashcard_id,
                            flashcard_set__owner=request.user
                        )
                        
                        # Process review
                        updated_data = scheduler.process_review(flashcard, quality)
                        
                        # Update flashcard
                        for field, value in updated_data.items():
                            setattr(flashcard, field, value)
                        flashcard.last_reviewed = timezone.now()
                        flashcard.save()
                        
                        results.append({
                            'flashcard_id': flashcard_id,
                            'success': True,
                            'new_interval': updated_data.get('interval', 0),
                            'new_ease_factor': updated_data.get('ease_factor', 2.5)
                        })
                        
                    except Flashcard.DoesNotExist:
                        results.append({
                            'flashcard_id': flashcard_id,
                            'success': False,
                            'error': 'Flashcard not found or access denied'
                        })
                    except Exception as e:
                        results.append({
                            'flashcard_id': flashcard_id,
                            'success': False,
                            'error': str(e)
                        })
            
            return Response({
                'results': results,
                'total_reviews': len(reviews_data),
                'successful_reviews': len([r for r in results if r['success']])
            })
            
        except Exception as e:
            return Response(
                {'error': f'Bulk review failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Interleaving Scheduler API Views
class InterleavingConfigView(APIView):
    """API view for managing interleaving session configuration."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user's interleaving configuration."""
        try:
            config, created = InterleavingSessionConfig.objects.get_or_create(
                user=request.user,
                defaults={
                    'difficulty': 'medium',
                    'session_size': 10,
                    'w_due': 0.60,
                    'w_interleave': 0.25,
                    'w_new': 0.15
                }
            )
            
            serializer = InterleavingSessionConfigSerializer(config)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get configuration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Update user's interleaving configuration."""
        try:
            config, created = InterleavingSessionConfig.objects.get_or_create(
                user=request.user,
                defaults={
                    'difficulty': 'medium',
                    'session_size': 10,
                    'w_due': 0.60,
                    'w_interleave': 0.25,
                    'w_new': 0.15
                }
            )
            
            serializer = InterleavingSessionConfigSerializer(
                config, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return Response(
                {'error': f'Failed to update configuration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterleavingSessionView(APIView):
    """API view for generating interleaving sessions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate a new interleaving session."""
        try:
            # Validate request data
            serializer = InterleavingSessionRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate session
            service = InterleavingSessionService()
            session_data = service.generate_session(
                user=request.user,
                size=serializer.validated_data.get('size'),
                difficulty=serializer.validated_data.get('difficulty'),
                seed=serializer.validated_data.get('seed')
            )
            
            # Serialize response
            response_serializer = InterleavingSessionResponseSerializer(instance=session_data)
            return Response(response_serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate session: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DifficultyDialView(APIView):
    """API view for difficulty dial information and suggestions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get difficulty dial information."""
        difficulty = request.query_params.get('difficulty', 'medium')
        
        try:
            difficulty_info = DifficultyDialService.get_difficulty_info(difficulty)
            return Response(difficulty_info)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get difficulty info: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Get difficulty adjustment suggestion based on performance."""
        try:
            current_difficulty = request.data.get('current_difficulty', 'medium')
            success_rate_raw = request.data.get('success_rate', 0.0)
            avg_latency_raw = request.data.get('avg_latency', 0.0)
            
            try:
                success_rate = float(success_rate_raw)
            except (TypeError, ValueError):
                success_rate = 0.0
            try:
                avg_latency = float(avg_latency_raw)
            except (TypeError, ValueError):
                avg_latency = 0.0
            
            suggestion = DifficultyDialService.suggest_difficulty_adjustment(
                current_difficulty, success_rate, avg_latency
            )
            
            return Response(suggestion)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get suggestion: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DiagnosticSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for diagnostic sessions."""
    
    queryset = DiagnosticSession.objects.all()
    serializer_class = DiagnosticSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter sessions by user's projects."""
        user = self.request.user
        return DiagnosticSession.objects.filter(project__owner=user)
    
    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        """Get today's open diagnostic sessions for a project."""
        project_id = request.query_params.get('project')
        if not project_id:
            return Response(
                {'error': 'project parameter required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sessions = self.get_queryset().filter(
            project_id=project_id,
            status='OPEN'
        )
        
        # Filter by current time constraints
        now = timezone.now()
        open_sessions = []
        for session in sessions:
            if session.is_open:
                open_sessions.append(session)
        
        serializer = self.get_serializer(open_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='start')
    def start_session(self, request, pk=None):
        """Start a diagnostic session and return questions."""
        session = self.get_object()
        
        if not session.is_open:
            return Response(
                {'error': 'Session is not open'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already started this session
        existing_response = DiagnosticResponse.objects.filter(
            session=session,
            user=request.user
        ).first()
        
        if existing_response:
            return Response(
                {'error': 'User already started this session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get questions (scrambled if configured)
        questions = session.questions.all()
        if session.questions_order == 'SCRAMBLED':
            # Use seed for consistent scrambling
            import random
            random.seed(session.seed)
            questions = list(questions)
            random.shuffle(questions)
        
        # Return questions without answers
        question_data = []
        for question in questions:
            q_data = DiagnosticQuestionSerializer(question).data
            if question.type == 'MCQ':
                # Don't include correct answer
                q_data.pop('correct_choice_index', None)
            q_data.pop('explanation', None)  # Don't show explanation yet
            
            question_data.append(q_data)
        
        return Response({
            'session_id': str(session.id),
            'questions': question_data,
            'time_limit_sec': session.time_limit_sec,
            'delivery_mode': session.delivery_mode
        })
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete_session(self, request, pk=None):
        """Complete a diagnostic session and show results."""
        session = self.get_object()
        
        # Get user's responses
        responses = DiagnosticResponse.objects.filter(
            session=session,
            user=request.user
        )
        
        if not responses.exists():
            return Response(
                {'error': 'No responses found for this session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Show feedback based on delivery mode
        if session.delivery_mode == 'IMMEDIATE':
            # Show immediate feedback
            response_data = DiagnosticResponseSerializer(responses, many=True).data
            for resp_data in response_data:
                question = DiagnosticQuestion.objects.get(id=resp_data['question'])
                resp_data['correct_answer'] = question.get_correct_answer()
                resp_data['explanation'] = question.explanation
        else:
            # Deferred feedback - don't show answers yet
            response_data = DiagnosticResponseSerializer(responses, many=True).data
        
        # Calculate session analytics
        total_questions = session.questions.count()
        correct_answers = responses.filter(is_correct=True).count()
        accuracy = correct_answers / total_questions if total_questions > 0 else 0
        
        # Get or create analytics
        analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
        if not created:
            analytics.update_analytics()
        
        return Response({
            'session': DiagnosticSessionSerializer(session).data,
            'responses': response_data,
            'analytics': {
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'accuracy': accuracy,
                'session_analytics': DiagnosticAnalyticsSerializer(analytics).data
            }
        })


class DiagnosticResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for diagnostic responses."""
    
    queryset = DiagnosticResponse.objects.all()
    serializer_class = DiagnosticResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter responses by user."""
        return DiagnosticResponse.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a diagnostic response."""
        # Add user to request data
        request.data['user'] = request.user.id
        
        # Set started_at if not provided
        if 'started_at' not in request.data:
            request.data['started_at'] = timezone.now()
        
        return super().create(request, *args, **kwargs)


class DiagnosticGenerationView(APIView):
    """API view for generating diagnostic sessions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate a new diagnostic session."""
        serializer = DiagnosticGenerationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate diagnostic using AI
            generator = DiagnosticGenerator()
            session = generator.generate_diagnostic(
                project_id=serializer.validated_data['project'],
                topic=serializer.validated_data.get('topic'),
                source_ids=serializer.validated_data.get('source_ids'),
                question_mix=serializer.validated_data.get('question_mix'),
                difficulty=serializer.validated_data['difficulty'],
                delivery_mode=serializer.validated_data['delivery_mode'],
                max_questions=serializer.validated_data['max_questions']
            )
            
            # Return the generated session
            session_serializer = DiagnosticSessionSerializer(session)
            return Response(session_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate diagnostic: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DiagnosticAnalyticsView(APIView):
    """API view for diagnostic analytics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, session_id):
        """Get analytics for a diagnostic session."""
        session = get_object_or_404(DiagnosticSession, id=session_id)
        
        # Check permissions
        if session.project.owner != request.user:
            return Response(
                {'error': 'Access denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create analytics
        analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
        if not created:
            analytics.update_analytics()
        
        serializer = DiagnosticAnalyticsSerializer(analytics)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='export')
    def export_analytics(self, request, session_id):
        """Export analytics to CSV/JSON."""
        session = get_object_or_404(DiagnosticSession, id=session_id)
        
        # Check permissions
        if session.project.owner != request.user:
            return Response(
                {'error': 'Access denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            # Generate CSV export
            import csv
            from django.http import HttpResponse
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="diagnostic_{session_id}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Question', 'Type', 'Concept', 'Correct', 'Incorrect', 'Accuracy', 'Avg Confidence'])
            
            # Get analytics
            analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
            if not created:
                analytics.update_analytics()
            
            for concept, data in analytics.concept_analytics.items():
                writer.writerow([
                    concept,
                    'Mixed',
                    concept,
                    data['correct_responses'],
                    data['total_responses'] - data['correct_responses'],
                    f"{data['accuracy']:.1%}",
                    f"{data['avg_confidence']:.1f}"
                ])
            
            return response
        
        else:
            # Return JSON
            analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
            if not created:
                analytics.update_analytics()
            
            serializer = DiagnosticAnalyticsSerializer(analytics)
            return Response(serializer.data)
