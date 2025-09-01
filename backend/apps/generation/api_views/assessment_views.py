# Assessment API Views - Generalized for multiple assessment types
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from ..models.assessment_models import AssessmentSet, AssessmentItem, AssessmentAttempt, FlashcardSet, Flashcard
from ..serializers.assessment_serializers import (
    AssessmentSetSerializer, AssessmentItemSerializer, AssessmentAttemptSerializer,
    FlashcardSetSerializer, FlashcardSerializer,  # Backward compatibility
    FlashcardReviewSerializer, IndividualFlashcardReviewSerializer, MCQAttemptSerializer,
    AssessmentGenerationRequestSerializer
)
from ..services.scheduler import ReviewSession
from ..services.spaced_repetition import SpacedRepetitionScheduler
from ..utils.response_helpers import create_error_response, create_success_response
from ..mock_data.flashcard_mocks import get_mock_assessment_data, get_mock_mcq_data


class AssessmentSetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assessment sets."""
    
    queryset = AssessmentSet.objects.all()
    serializer_class = AssessmentSetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assessment sets by owner when authenticated."""
        if self.request.user.is_authenticated:
            return AssessmentSet.objects.filter(owner=self.request.user)
        return AssessmentSet.objects.none()
    
    def perform_create(self, serializer):
        """Create assessment set with owner."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'], url_path='stats')
    def get_stats(self, request, pk=None):
        """Get detailed statistics for an assessment set."""
        assessment_set = self.get_object()
        
        items = assessment_set.items.filter(is_active=True)
        
        stats = {
            'total_items': items.count(),
            'by_type': {},
            'by_difficulty': {},
            'by_learning_state': {},
            'due_items': items.filter(next_review__lte=timezone.now()).count(),
            'overdue_items': items.filter(next_review__lt=timezone.now()).count(),
        }
        
        # Count by item type
        for item_type, _ in AssessmentItem.ITEM_TYPE_CHOICES:
            count = items.filter(item_type=item_type).count()
            if count > 0:
                stats['by_type'][item_type] = count
        
        # Count by difficulty
        for difficulty, _ in AssessmentItem.DIFFICULTY_CHOICES:
            count = items.filter(difficulty=difficulty).count()
            if count > 0:
                stats['by_difficulty'][difficulty] = count
        
        # Count by learning state
        for state, _ in AssessmentItem._meta.get_field('learning_state').choices:
            count = items.filter(learning_state=state).count()
            if count > 0:
                stats['by_learning_state'][state] = count
        
        return create_success_response(stats)


class AssessmentItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assessment items."""
    
    queryset = AssessmentItem.objects.all()
    serializer_class = AssessmentItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assessment items by owner."""
        if not self.request.user.is_authenticated:
            return AssessmentItem.objects.none()
            
        queryset = AssessmentItem.objects.filter(assessment_set__owner=self.request.user)
        
        # Filter by assessment_set query parameter if provided
        assessment_set_id = self.request.query_params.get('assessment_set')
        if assessment_set_id:
            queryset = queryset.filter(assessment_set=assessment_set_id)
        
        # Filter by item_type if provided
        item_type = self.request.query_params.get('item_type')
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        
        return queryset
    
    @action(detail=True, methods=['post'], url_path='review')
    def review_item(self, request, pk=None):
        """
        Review an assessment item and update its schedule.
        
        For flashcards: uses spaced repetition
        For MCQ: records attempt and correctness
        """
        assessment_item = self.get_object()
        
        if assessment_item.item_type == 'FLASHCARD':
            # Handle flashcard spaced repetition
            serializer = IndividualFlashcardReviewSerializer(data=request.data)
            if serializer.is_valid():
                quality = serializer.validated_data['quality']
                response_time = serializer.validated_data.get('response_time_seconds')
                
                # Create review session
                session = ReviewSession(request.user, session_limit=1)
                session.review_card(assessment_item, quality, response_time)
                
                # Record attempt
                AssessmentAttempt.objects.create(
                    user=request.user,
                    assessment_item=assessment_item,
                    attempt_type='SPACED_REPETITION',
                    quality=quality,
                    response_time_ms=int((response_time or 0) * 1000),
                    notes=serializer.validated_data.get('notes', ''),
                    payload={'quality': quality, 'response_time_seconds': response_time}
                )
                
                # Return updated item data
                updated_serializer = AssessmentItemSerializer(assessment_item)
                return create_success_response({
                    'item': updated_serializer.data,
                    'message': 'Item reviewed successfully'
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif assessment_item.item_type == 'MCQ':
            # Handle MCQ attempt
            serializer = MCQAttemptSerializer(data=request.data)
            if serializer.is_valid():
                selected_index = serializer.validated_data['selected_index']
                response_time = serializer.validated_data.get('response_time_ms', 0)
                confidence = serializer.validated_data.get('confidence')
                
                # Determine correctness
                is_correct = selected_index == assessment_item.correct_index
                
                # Record attempt
                attempt = AssessmentAttempt.objects.create(
                    user=request.user,
                    assessment_item=assessment_item,
                    attempt_type='QUIZ',
                    selected_index=selected_index,
                    is_correct=is_correct,
                    confidence=confidence,
                    response_time_ms=response_time,
                    notes=serializer.validated_data.get('notes', ''),
                    payload={
                        'selected_index': selected_index,
                        'correct_index': assessment_item.correct_index,
                        'is_correct': is_correct
                    }
                )
                
                # Update item statistics
                assessment_item.total_reviews += 1
                if is_correct:
                    assessment_item.correct_reviews += 1
                assessment_item.save()
                
                return create_success_response({
                    'is_correct': is_correct,
                    'explanation': assessment_item.explanation if is_correct else None,
                    'correct_index': assessment_item.correct_index,
                    'message': 'MCQ attempt recorded'
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return create_error_response(f"Review not supported for item type: {assessment_item.item_type}", status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='reset')
    def reset_item(self, request, pk=None):
        """Reset an item to new state (useful for relearning)."""
        assessment_item = self.get_object()
        assessment_item.reset_to_new()
        assessment_item.save()
        
        serializer = AssessmentItemSerializer(assessment_item)
        return create_success_response({
            'item': serializer.data,
            'message': 'Item reset to new state'
        })


class ProjectAssessmentSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assessment sets within a specific project context.
    """
    serializer_class = AssessmentSetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get assessment sets for the specific project."""
        project_id = self.kwargs.get('project_id')
        return AssessmentSet.objects.filter(
            project_links__project_id=project_id,
            owner=self.request.user
        )
    
    def perform_create(self, serializer):
        """Create assessment set and link it to the project."""
        project_id = self.kwargs.get('project_id')
        assessment_set = serializer.save(owner=self.request.user)
        
        # Link to project (assuming ProjectAssessmentSet model exists)
        try:
            from backend.apps.projects.models import ProjectAssessmentSet
            ProjectAssessmentSet.objects.create(
                project_id=project_id,
                assessment_set=assessment_set,
                is_primary=not ProjectAssessmentSet.objects.filter(project_id=project_id).exists()
            )
        except ImportError:
            # Fallback to flashcard linking for backward compatibility
            from backend.apps.projects.models import ProjectFlashcardSet
            ProjectFlashcardSet.objects.create(
                project_id=project_id,
                flashcard_set=assessment_set,
                is_primary=not ProjectFlashcardSet.objects.filter(project_id=project_id).exists()
            )
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_from_project(self, request, project_id=None):
        """
        Generate assessment items from project content.
        
        Expected payload:
        {
            "title": "Assessment Set Title",
            "kind": "FLASHCARDS|MCQ|MIXED",
            "num_items": 10,
            "difficulty": "INTERMEDIATE",
            "choices_per_item": 4,  // for MCQ
            "assessment_config": {  // for MIXED
                "FLASHCARD": 60,
                "MCQ": 40
            },
            "mock_mode": false
        }
        """
        try:
            serializer = AssessmentGenerationRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # Create assessment set
            assessment_set = AssessmentSet.objects.create(
                title=data['title'],
                kind=data['kind'],
                description=data.get('description', ''),
                difficulty_level=data['difficulty'],
                assessment_config=data.get('assessment_config', {}),
                owner=request.user
            )
            
            # Link to project
            try:
                from backend.apps.projects.models import ProjectAssessmentSet
                ProjectAssessmentSet.objects.create(
                    project_id=project_id,
                    assessment_set=assessment_set,
                    is_primary=True
                )
            except ImportError:
                # Fallback for backward compatibility
                from backend.apps.projects.models import ProjectFlashcardSet
                ProjectFlashcardSet.objects.create(
                    project_id=project_id,
                    flashcard_set=assessment_set,
                    is_primary=True
                )
            
            # Generate items based on kind
            if data['kind'] == 'FLASHCARDS':
                items = self._generate_flashcards(assessment_set, data)
            elif data['kind'] == 'MCQ':
                items = self._generate_mcq_items(assessment_set, data)
            elif data['kind'] == 'MIXED':
                items = self._generate_mixed_items(assessment_set, data)
            else:
                return create_error_response(f"Unsupported assessment kind: {data['kind']}", status.HTTP_400_BAD_REQUEST)
            
            # Return created set with items
            result_serializer = AssessmentSetSerializer(assessment_set, context={'request': request})
            return create_success_response({
                'assessment_set': result_serializer.data,
                'items_created': len(items)
            })
            
        except Exception as e:
            return create_error_response(f'Failed to generate assessment: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_flashcards(self, assessment_set, data):
        """Generate flashcard items."""
        items = []
        num_items = data['num_items']
        mock_mode = data.get('mock_mode', False)
        
        if mock_mode:
            # Use rich mock data
            mock_data = get_mock_assessment_data("flashcards", num_items, data['difficulty'].lower())
            
            for i, mock_item in enumerate(mock_data):
                item = AssessmentItem.objects.create(
                    assessment_set=assessment_set,
                    item_type='FLASHCARD',
                    order_index=i,
                    question=mock_item['question'],
                    answer=mock_item['answer'],
                    difficulty=data['difficulty'],
                    bloom_level=mock_item.get('bloom_level', 'apply'),
                    concept_id=mock_item.get('concept_id', f'flashcard-{i+1}'),
                    theme=mock_item.get('theme', 'General'),
                    hints=mock_item.get('hints', []),
                    examples=mock_item.get('examples', [])
                )
                items.append(item)
        else:
            # Simple mock data for non-mock mode
            for i in range(num_items):
                item = AssessmentItem.objects.create(
                    assessment_set=assessment_set,
                    item_type='FLASHCARD',
                    order_index=i,
                    question=f"Flashcard question {i+1}",
                    answer=f"Flashcard answer {i+1}",
                    difficulty=data['difficulty'],
                    bloom_level='apply'
                )
                items.append(item)
        
        return items
    
    def _generate_mcq_items(self, assessment_set, data):
        """Generate MCQ items."""
        items = []
        num_items = data['num_items']
        choices_per_item = data.get('choices_per_item', 4)
        mock_mode = data.get('mock_mode', False)
        
        if mock_mode:
            # Use rich mock MCQ data
            mock_data = get_mock_mcq_data(num_items, data['difficulty'].lower(), "nlp")
            
            for i, mock_item in enumerate(mock_data):
                item = AssessmentItem.objects.create(
                    assessment_set=assessment_set,
                    item_type='MCQ',
                    order_index=i,
                    question=mock_item['question'],
                    answer=mock_item['choices'][mock_item['correct_index']],
                    choices=mock_item['choices'],
                    correct_index=mock_item['correct_index'],
                    explanation=mock_item['explanation'],
                    difficulty=data['difficulty'],
                    bloom_level=mock_item.get('bloom_level', 'apply'),
                    concept_id=f"mcq-{mock_item['topic'].lower().replace(' ', '-')}-{i+1}",
                    theme=mock_item['topic']
                )
                items.append(item)
        else:
            # Simple mock data for non-mock mode
            for i in range(num_items):
                choices = [f"Choice {j+1}" for j in range(choices_per_item)]
                correct_index = 0  # First choice is correct for mock data
                
                item = AssessmentItem.objects.create(
                    assessment_set=assessment_set,
                    item_type='MCQ',
                    order_index=i,
                    question=f"MCQ question {i+1}",
                    answer=f"Correct answer for question {i+1}",
                    choices=choices,
                    correct_index=correct_index,
                    explanation=f"Explanation for question {i+1}",
                    difficulty=data['difficulty'],
                    bloom_level='apply'
                )
                items.append(item)
        
        return items
    
    def _generate_mixed_items(self, assessment_set, data):
        """Generate mixed assessment items."""
        items = []
        total_items = data['num_items']
        config = data.get('assessment_config', {'FLASHCARD': 60, 'MCQ': 40})
        mock_mode = data.get('mock_mode', False)
        
        if mock_mode:
            # Use rich mock data for mixed assessment
            mock_data = get_mock_assessment_data("mixed", total_items, data['difficulty'].lower())
            
            for i, mock_item in enumerate(mock_data):
                if mock_item['item_type'] == 'FLASHCARD':
                    item = AssessmentItem.objects.create(
                        assessment_set=assessment_set,
                        item_type='FLASHCARD',
                        order_index=i,
                        question=mock_item['question'],
                        answer=mock_item['answer'],
                        difficulty=data['difficulty'],
                        bloom_level=mock_item.get('bloom_level', 'apply'),
                        concept_id=mock_item.get('concept_id', f'flashcard-{i+1}'),
                        theme=mock_item.get('topic', 'General'),
                        hints=mock_item.get('hints', []),
                        examples=mock_item.get('examples', [])
                    )
                elif mock_item['item_type'] == 'MCQ':
                    item = AssessmentItem.objects.create(
                        assessment_set=assessment_set,
                        item_type='MCQ',
                        order_index=i,
                        question=mock_item['question'],
                        answer=mock_item['choices'][mock_item['correct_index']],
                        choices=mock_item['choices'],
                        correct_index=mock_item['correct_index'],
                        explanation=mock_item['explanation'],
                        difficulty=data['difficulty'],
                        bloom_level=mock_item.get('bloom_level', 'apply'),
                        concept_id=f"mcq-{mock_item['topic'].lower().replace(' ', '-')}-{i+1}",
                        theme=mock_item['topic']
                    )
                items.append(item)
        else:
            # Calculate item counts for each type
            flashcard_count = int((config.get('FLASHCARD', 0) / 100) * total_items)
            mcq_count = int((config.get('MCQ', 0) / 100) * total_items)
            remaining = total_items - flashcard_count - mcq_count
            
            # Generate flashcards
            flashcard_items = self._generate_flashcards(assessment_set, {**data, 'num_items': flashcard_count})
            items.extend(flashcard_items)
            
            # Generate MCQs
            mcq_items = self._generate_mcq_items(assessment_set, {**data, 'num_items': mcq_count})
            items.extend(mcq_items)
            
            # Add remaining items as flashcards
            for i in range(remaining):
                item = AssessmentItem.objects.create(
                    assessment_set=assessment_set,
                    item_type='FLASHCARD',
                    order_index=len(items),
                    question=f"Additional flashcard question {i+1}",
                    answer=f"Additional flashcard answer {i+1}",
                    difficulty=data['difficulty'],
                    bloom_level='apply'
                )
                items.append(item)
        
        return items


class ProjectAssessmentItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assessment items within a specific project context.
    """
    serializer_class = AssessmentItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get assessment items for the specific project."""
        project_id = self.kwargs.get('project_id')
        return AssessmentItem.objects.filter(
            assessment_set__project_links__project_id=project_id,
            assessment_set__owner=self.request.user
        )
    
    @action(detail=False, methods=['get'], url_path='due')
    def due_items(self, request, project_id=None):
        """
        Get due items for study session.
        
        Query parameters:
        - limit: number of items to return (default: 20)
        - item_type: filter by item type (optional)
        - algorithm: 'sm2' or 'leitner' (optional)
        """
        try:
            limit = int(request.query_params.get('limit', 20))
            item_type = request.query_params.get('item_type')
            algorithm = request.query_params.get('algorithm')
            
            queryset = self.get_queryset().filter(
                is_active=True,
                next_review__lte=timezone.now()
            )
            
            if item_type:
                queryset = queryset.filter(item_type=item_type)
            
            if algorithm:
                queryset = queryset.filter(algorithm=algorithm)
            
            due_items = queryset.order_by('next_review')[:limit]
            
            serializer = AssessmentItemSerializer(due_items, many=True)
            
            return create_success_response({
                'due_items': serializer.data,
                'total_due': queryset.count(),
                'next_review_in': self._get_next_review_time(queryset)
            })
            
        except Exception as e:
            return create_error_response(f'Failed to get due items: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_next_review_time(self, queryset):
        """Get time until next review is due."""
        next_item = queryset.filter(next_review__gt=timezone.now()).order_by('next_review').first()
        if next_item:
            delta = next_item.next_review - timezone.now()
            return int(delta.total_seconds() / 3600)  # Return hours
        return 0


# Backward compatibility ViewSets
class FlashcardSetViewSet(AssessmentSetViewSet):
    """Backward compatibility ViewSet for FlashcardSet."""
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer


class FlashcardViewSet(AssessmentItemViewSet):
    """Backward compatibility ViewSet for Flashcard."""
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer


class ProjectFlashcardSetViewSet(ProjectAssessmentSetViewSet):
    """Backward compatibility ViewSet for project flashcard sets."""
    serializer_class = FlashcardSetSerializer


class ProjectFlashcardViewSet(ProjectAssessmentItemViewSet):
    """Backward compatibility ViewSet for project flashcards."""
    serializer_class = FlashcardSerializer
