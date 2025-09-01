"""
Flashcard-related API views.

This module contains all flashcard-related ViewSets and API views,
including project-specific flashcard operations and bulk review functionality.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from ..models import FlashcardSet, Flashcard
from ..serializers import (
    FlashcardSetSerializer, FlashcardSerializer, FlashcardReviewSerializer, IndividualFlashcardReviewSerializer
)
from ..services.anki_exporter import AnkiExportService
from ..services.scheduler import ReviewSession
from ..services.spaced_repetition import SpacedRepetitionScheduler
from ..utils.response_helpers import create_error_response, create_success_response
from ..utils.validation_helpers import validate_card_type, validate_export_parameters


class FlashcardSetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing flashcard sets."""
    
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
            
            # Validate export parameters
            validation_result = validate_export_parameters(request.query_params)
            if not validation_result['valid']:
                return create_error_response(validation_result['error'], status.HTTP_400_BAD_REQUEST)
            
            include_source = validation_result['include_source']
            card_type = validation_result['card_type']
            
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
            return create_error_response(f'Export failed: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                return create_error_response('No flashcard sets found.', status.HTTP_404_NOT_FOUND)
            
            # Validate export parameters
            validation_result = validate_export_parameters(request.query_params)
            if not validation_result['valid']:
                return create_error_response(validation_result['error'], status.HTTP_400_BAD_REQUEST)
            
            include_source = validation_result['include_source']
            card_type = validation_result['card_type']
            
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
            return create_error_response(f'Export failed: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                return create_error_response('flashcard_set_ids is required.', status.HTTP_400_BAD_REQUEST)
            
            # Validate card type
            if not validate_card_type(card_type):
                return create_error_response('Invalid card_type. Must be "basic" or "cloze".', status.HTTP_400_BAD_REQUEST)
            
            # Get flashcard sets (ensure user owns them)
            flashcard_sets = self.get_queryset().filter(id__in=flashcard_set_ids)
            
            if not flashcard_sets.exists():
                return create_error_response('No valid flashcard sets found.', status.HTTP_404_NOT_FOUND)
            
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
            return create_error_response(f'Export failed: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    """ViewSet for managing individual flashcards."""
    
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
        serializer = IndividualFlashcardReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            quality = serializer.validated_data['quality']
            response_time = serializer.validated_data.get('response_time_seconds')
            
            # Create a review session for this single card
            session = ReviewSession(request.user, session_limit=1)
            session.review_card(flashcard, quality, response_time)
            
            # Return updated card data
            updated_serializer = FlashcardSerializer(flashcard)
            return create_success_response({
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
        return create_success_response({
            'card': serializer.data,
            'message': 'Card reset to new state'
        })

    @action(detail=True, methods=['get'], url_path='retention')
    def get_retention(self, request, pk=None):
        """Get current retention probability for a card."""
        flashcard = self.get_object()
        manager = SpacedRepetitionScheduler()
        retention = manager.get_card_retention(flashcard)
        
        return Response({
            'card_id': flashcard.id,
            'retention': retention,
            'interval': flashcard.interval,
            'memory_strength': flashcard.memory_strength,
            'next_review': flashcard.next_review,
            'learning_state': flashcard.learning_state
        })


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
            return create_error_response(f'Failed to get due cards: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectFlashcardSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing flashcard sets within a specific project context.
    Provides project-specific flashcard set operations.
    """
    serializer_class = FlashcardSetSerializer
    # permission_classes = [permissions.IsAuthenticated]  # Temporarily disabled for testing
    
    def get_queryset(self):
        """Get flashcard sets for the specific project."""
        project_id = self.kwargs.get('project_id')
        return FlashcardSet.objects.filter(
            project_links__project_id=project_id,
            # owner=self.request.user  # Temporarily disabled for testing
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
        - mock_mode: boolean to enable mock mode (optional)
        """
        try:
            from backend.apps.projects.models import Project, UploadedFile, Extraction
            
            project = get_object_or_404(Project, id=project_id, owner=request.user)
            source_type = request.data.get('source_type', 'files')
            num_cards = request.data.get('num_cards', 10)
            difficulty = request.data.get('difficulty', 'medium')
            mock_mode = request.data.get('mock_mode', False)
            
            # Anti-spam limit: cap generation at 200 cards per project
            if num_cards > 200:
                return create_error_response('Maximum 200 cards can be generated per request', status.HTTP_400_BAD_REQUEST)
            
            # Check existing cards in project to prevent runaway generation
            existing_cards = Flashcard.objects.filter(
                flashcard_set__project_links__project=project
            ).count()
            
            if existing_cards + num_cards > 1000:  # Hard limit per project
                return create_error_response(
                    f'Project already has {existing_cards} cards. Cannot generate {num_cards} more (limit: 1000 total)', 
                    status.HTTP_400_BAD_REQUEST
                )
            
            # Get project materials based on source type
            if source_type == 'files':
                materials = UploadedFile.objects.filter(project=project)
                content = '\n'.join([f.raw_text for f in materials if f.raw_text])
            elif source_type == 'extractions':
                extractions = Extraction.objects.filter(uploaded_file__project=project)
                content = '\n'.join([str(e.response) for e in extractions])
            else:
                return create_error_response('Invalid source_type', status.HTTP_400_BAD_REQUEST)
            
            if not content:
                return create_error_response('No content found for flashcard generation', status.HTTP_400_BAD_REQUEST)
            
            # Generate flashcards using enhanced service
            from ..services.flashcard_generator import FlashcardGenerator
            generator = FlashcardGenerator()
            
            # Use enhanced generation with deterministic metadata
            result = generator.generate_enhanced_flashcards(
                content=content,
                title=f"{project.name} Flashcards",
                difficulty=difficulty,
                content_type='mixed',
                language='English',
                tags_csv=f"project,{project.name.lower()},generated",
                num_cards=num_cards
            )
            
            flashcards_data = result.get('flashcards', [])
            deck_metadata = result.get('deck_metadata', {})
            
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
            
            response_data = FlashcardSetSerializer(flashcard_set, context={'request': request}).data
            
            # Add mock mode banner if enabled
            if mock_mode:
                response_data['mock_mode'] = True
                response_data['mock_banner'] = '🧪 Mock Mode: Using predefined flashcard templates instead of AI generation'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return create_error_response(f'Generation failed: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                return create_error_response('No reviews provided', status.HTTP_400_BAD_REQUEST)
            
            if len(reviews_data) > 50:  # Anti-spam limit
                return create_error_response('Maximum 50 reviews per request', status.HTTP_400_BAD_REQUEST)
            
            results = []
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
            return create_error_response(f'Bulk review failed: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
