from django.shortcuts import render
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from django.db import transaction
from .models import Project, UploadedFile
from .serializers import ProjectSerializer, UploadedFileSerializer, ProjectCreateInput
from .services import process_uploaded_file, seed_project_artifacts
from .tasks import generate_project_meta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View

logger = logging.getLogger(__name__)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """
        Return the appropriate serializer based on the ENABLE_STI setting.
        For detail actions (retrieve, update, partial_update), use ProjectDetailSerializer
        to include related data like uploaded_files.
        """
        from decouple import config
        from .serializers import ProjectDetailSerializer
        
        # For detail actions, always use ProjectDetailSerializer to include uploaded_files
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ProjectDetailSerializer
        
        # For list actions, use the base serializer
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if enable_sti:
            return ProjectSerializer  # Our hybrid serializer that handles both modes
        else:
            return ProjectSerializer  # Same serializer, but will behave differently based on ENABLE_STI

    def get_queryset(self):
        """Get user's projects with optimized queries."""
        # Temporarily disable read replica until properly configured
        # from backend.core_platform.db_manager import read_from_replica
        
        # Use default database for all operations until read replica is configured
        base_queryset = self.request.user.projects.all()
        
        # Read ENABLE_STI dynamically
        from decouple import config
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if enable_sti:
            # When STI is enabled, prefetch metadata
            base_queryset = base_queryset.prefetch_related('metadata')
        
        # For detail actions, also prefetch uploaded_files to avoid N+1 queries
        if self.action in ['retrieve', 'update', 'partial_update']:
            base_queryset = base_queryset.prefetch_related('uploaded_files')
        
        return base_queryset

    def create(self, request, *args, **kwargs):
        """
        Override create to handle mock mode flags before serializer validation.
        """
        # 1) Validate input incl. flags
        input_ser = ProjectCreateInput(data=request.data)
        input_ser.is_valid(raise_exception=True)
        v = input_ser.validated_data

        # Extract flags (defaulting already applied)
        mock_mode = v.pop("mock_mode")
        mock_bypass = v.pop("mock_bypass_content")
        seed_syl = v.pop("seed_syllabus")
        seed_tests = v.pop("seed_tests")
        seed_content = v.pop("seed_content")
        seed_fc = v.pop("seed_flashcards")

        # 2) Create project with only model fields
        with transaction.atomic():
            project = Project.objects.create(owner=request.user, **v)

            # 3) Seed (mock only LLM calls)
            if mock_mode:
                try:
                    seed_project_artifacts(
                        project,
                        request=request,
                        mock_mode=True,
                        mock_bypass_content=mock_bypass,
                        enable_flashcards=seed_fc,
                    )
                except ValueError as e:
                    # Content required and not provided
                    logger.warning("Seeding aborted for project %s: %s", project.id, e)
                except Exception as e:
                    logger.error("Failed to seed artifacts for project %s: %s", project.id, e)

        # 4) Return standard output shape
        out = ProjectSerializer(project).data
        return Response(out, status=status.HTTP_201_CREATED)



    def perform_create(self, serializer):
        """
        This method is no longer used since we override create() directly.
        Kept for compatibility but seeding is now handled in create().
        """
        logger.info(f"User {self.request.user.id} started creating a project.")
        serializer.save(owner=self.request.user)
        project = serializer.instance
        logger.info(f"User {self.request.user.id} successfully created project {project.id}.")

    def perform_update(self, serializer):
        """
        Update the project. The serializer handles both legacy and nested STI data automatically.
        """
        logger.info(f"User {self.request.user.id} started updating project {serializer.instance.id}.")
        serializer.save()
        logger.info(f"User {self.request.user.id} successfully updated project {serializer.instance.id}.")

    def perform_destroy(self, instance):
        logger.info(f"User {self.request.user.id} started deleting project {instance.id}.")
        instance.delete()
        logger.info(f"User {self.request.user.id} successfully deleted project {instance.id}.")

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cleanup_drafts(self, request):
        """
        Clean up abandoned draft projects for the current user.
        Idempotent: calling multiple times has the same effect.
        """
        try:
            # Get hours parameter from request, default to 24
            hours = int(request.data.get('hours', 24))
            
            # Validate hours parameter
            if hours <= 0:
                return Response({
                    'error': 'Hours must be a positive integer'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create a unique cache key for this user's cleanup operation
            cache_key = f"draft_cleanup_{request.user.id}_{hours}"
            
            # Check if cleanup is already in progress for this user
            if cache.get(cache_key):
                return Response({
                    'message': 'Cleanup already in progress for this user',
                    'deleted_count': 0
                }, status=status.HTTP_200_OK)
            
            # Set cache to prevent concurrent cleanup operations
            cache.set(cache_key, True, timeout=300)  # 5 minute timeout
            
            try:
                with transaction.atomic():
                    # Calculate cutoff time
                    cutoff_time = timezone.now() - timedelta(hours=hours)
                    
                    # Find abandoned draft projects for this user
                    abandoned_drafts = self.get_queryset().filter(
                        is_draft=True,
                        created_at__lt=cutoff_time
                    )
                    
                    count = abandoned_drafts.count()
                    
                    if count > 0:
                        # Log before deletion
                        logger.info(f"User {request.user.id} cleaning up {count} abandoned draft projects older than {hours} hours")
                        
                        # Delete abandoned drafts - use the count before deletion to avoid counting cascading records
                        abandoned_drafts.delete()
                        deleted_count = count  # Use the count we calculated before deletion
                        
                        # Update metrics
                        self._update_cleanup_metrics(deleted_count)
                        
                        logger.info(f"User {request.user.id} successfully deleted {deleted_count} abandoned draft projects")
                        
                        return Response({
                            'message': f'Successfully cleaned up {deleted_count} abandoned draft projects',
                            'deleted_count': deleted_count,
                            'total_abandoned': count
                        }, status=status.HTTP_200_OK)
                    else:
                        return Response({
                            'message': f'No abandoned draft projects found older than {hours} hours',
                            'deleted_count': 0,
                            'total_abandoned': 0
                        }, status=status.HTTP_200_OK)
                        
            finally:
                # Always clear the cache key
                cache.delete(cache_key)
                
        except ValueError as e:
            return Response({
                'error': 'Invalid hours parameter. Must be a positive integer.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error cleaning up drafts for user {request.user.id}: {str(e)}")
            return Response({
                'error': 'An error occurred while cleaning up draft projects'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def cleanup_metrics(self, request):
        """
        Get cleanup metrics for monitoring
        """
        try:
            cleaned_count = cache.get('drafts_cleaned_count', 0)
            active_drafts = cache.get('drafts_active_total', 0)
            
            return Response({
                'drafts_cleaned_count': cleaned_count,
                'drafts_active_total': active_drafts,
                'last_updated': timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting cleanup metrics: {str(e)}")
            return Response({
                'error': 'Failed to retrieve metrics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _update_cleanup_metrics(self, deleted_count: int):
        """
        Update metrics for monitoring cleanup operations
        """
        try:
            # Increment cleanup counter
            cache_key = 'drafts_cleaned_count'
            current_count = cache.get(cache_key, 0)
            cache.set(cache_key, current_count + deleted_count, timeout=86400)  # 24 hours
            
            # Update active drafts gauge
            active_drafts = Project.objects.filter(is_draft=True).count()
            cache.set('drafts_active_total', active_drafts, timeout=3600)  # 1 hour
            
            logger.info(f"Updated metrics: cleaned={current_count + deleted_count}, active={active_drafts}")
        except Exception as e:
            logger.warn(f"Failed to update cleanup metrics: {e}")

    @action(
        detail=True, 
        methods=['get', 'post'], 
        permission_classes=[permissions.IsAuthenticated],
        url_path="flashcard-sets",
        url_name="flashcard-sets"
    )
    def flashcard_sets(self, request, pk=None):
        """
        RESTful flashcard-sets endpoint for projects.
        GET: List flashcard sets for the project
        POST: Create and link a flashcard set to the project (idempotent)
        """
        project = self.get_object()
        
        # Authorization: only project owner can access
        if project.owner != request.user:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            return self._list_flashcard_sets(project, request)
        elif request.method == 'POST':
            return self._create_flashcard_set(project, request)
    
    def _list_flashcard_sets(self, project, request):
        """List flashcard sets for the project with stats."""
        try:
            from backend.apps.projects.models import ProjectFlashcardSet
            from backend.apps.generation.models import FlashcardSet, Flashcard
            from django.db import models
            
            # Get flashcard sets linked to this project with stats
            project_flashcard_sets = ProjectFlashcardSet.objects.filter(
                project=project,
                flashcard_set__owner=request.user
            ).select_related('flashcard_set')
            
            flashcard_sets = [pfs.flashcard_set for pfs in project_flashcard_sets]
            
            # Calculate stats for each flashcard set
            sets_with_stats = []
            for flashcard_set in flashcard_sets:
                cards = Flashcard.objects.filter(flashcard_set=flashcard_set)
                total_cards = cards.count()
                due_cards = cards.filter(next_review__lte=timezone.now()).count()
                learning_cards = cards.filter(learning_state='learning').count()
                review_cards = cards.filter(learning_state='review').count()
                new_cards = cards.filter(learning_state='new').count()
                
                # Calculate average accuracy
                total_reviews = cards.aggregate(total=models.Sum('total_reviews'))['total'] or 0
                correct_reviews = cards.aggregate(total=models.Sum('correct_reviews'))['total'] or 0
                average_accuracy = (correct_reviews / total_reviews * 100) if total_reviews > 0 else 0
                
                sets_with_stats.append({
                    'id': flashcard_set.id,
                    'title': flashcard_set.title,
                    'description': flashcard_set.description,
                    'created_at': flashcard_set.created_at.isoformat(),
                    'total_cards': total_cards,
                    'due_cards': due_cards,
                    'learning_cards': learning_cards,
                    'review_cards': review_cards,
                    'new_cards': new_cards,
                    'average_accuracy': round(average_accuracy, 1)
                })
            
            return Response({
                'results': sets_with_stats,
                'count': len(sets_with_stats),
                'next': None,
                'previous': None
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error listing flashcard sets for project {project.id}: {str(e)}")
            return Response({
                'error': 'Failed to retrieve flashcard sets'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_flashcard_set(self, project, request):
        """Create and link a flashcard set to the project (idempotent)."""
        try:
            from backend.apps.generation.models import FlashcardSet, Flashcard
            from backend.apps.projects.models import ProjectFlashcardSet
            from django.urls import reverse
            
            # Validate input
            title = request.data.get('title')
            if not title:
                return Response({
                    'error': 'Title is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get flashcards data
            flashcards_data = request.data.get('flashcards', [])
            
            with transaction.atomic():
                # Create or get the flashcard set (idempotent)
                flashcard_set, created = FlashcardSet.objects.get_or_create(
                    title=title,
                    owner=request.user,
                    defaults={
                        'description': request.data.get('description', ''),
                    }
                )
                
                # Create or get the project link (idempotent)
                project_link, link_created = ProjectFlashcardSet.objects.get_or_create(
                    project=project,
                    flashcard_set=flashcard_set,
                    defaults={
                        'is_primary': True
                    }
                )
                
                # Only create flashcards if this is a new set
                if created and flashcards_data:
                    for card_data in flashcards_data:
                        Flashcard.objects.create(
                            flashcard_set=flashcard_set,
                            question=card_data.get('front', ''),
                            answer=card_data.get('back', ''),
                            # Set default values for spaced repetition fields
                            learning_state='new',
                            next_review=timezone.now(),
                            algorithm='sm2',
                            ease_factor=2.5,
                            interval=1,
                            repetitions=0
                        )
            
            # Prepare response
            response_data = {
                'id': flashcard_set.id,
                'title': flashcard_set.title,
                'description': flashcard_set.description,
                'created_at': flashcard_set.created_at.isoformat(),
                'linked': True,
                'created': created,
                'link_created': link_created
            }
            
            # Set Location header for RESTful compliance
            headers = {
                'Location': f'/api/flashcard-sets/{flashcard_set.id}/'
            }
            
            # Return appropriate status code
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            
            return Response(response_data, status=status_code, headers=headers)
            
        except Exception as e:
            logger.error(f"Error creating flashcard set for project {project.id}: {str(e)}")
            return Response({
                'error': 'Failed to create flashcard set'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def flashcards_due(self, request, pk=None):
        """
        Get due flashcards for a specific project.
        """
        try:
            project = self.get_object()
            
            # Get query parameters
            limit = int(request.query_params.get('limit', 20))
            algorithm = request.query_params.get('algorithm', 'sm2')
            
            # Get flashcard sets linked to this project
            from backend.apps.projects.models import ProjectFlashcardSet
            from backend.apps.generation.models import Flashcard
            
            project_flashcard_sets = ProjectFlashcardSet.objects.filter(
                project=project,
                flashcard_set__owner=request.user
            ).values_list('flashcard_set_id', flat=True)
            
            # Get due flashcards
            due_cards = Flashcard.objects.filter(
                flashcard_set_id__in=project_flashcard_sets,
                next_review__lte=timezone.now()
            ).order_by('next_review')[:limit]
            
            # Calculate stats
            total_cards = Flashcard.objects.filter(
                flashcard_set_id__in=project_flashcard_sets
            ).count()
            
            due_count = Flashcard.objects.filter(
                flashcard_set_id__in=project_flashcard_sets,
                next_review__lte=timezone.now()
            ).count()
            
            learning_count = Flashcard.objects.filter(
                flashcard_set_id__in=project_flashcard_sets,
                learning_state='learning'
            ).count()
            
            return Response({
                'project_id': str(project.id),
                'total_cards': total_cards,
                'due_cards': due_count,
                'learning_cards': learning_count,
                'session_cards': [],  # TODO: Implement session cards
                'session_start': timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting due flashcards for project {pk}: {str(e)}")
            return Response({
                'error': 'Failed to retrieve due flashcards'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def cleanup_metrics(self, request):
        """
        Get cleanup metrics for monitoring
        """
        try:
            cleaned_count = cache.get('drafts_cleaned_count', 0)
            active_drafts = cache.get('drafts_active_total', 0)
            
            return Response({
                'drafts_cleaned_count': cleaned_count,
                'drafts_active_total': active_drafts,
                'last_updated': timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting cleanup metrics: {str(e)}")
            return Response({
                'error': 'Failed to retrieve metrics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], serializer_class=UploadedFileSerializer)
    def upload_file(self, request, pk=None):
        """
        Upload file to project with "persist first, process later" approach.
        
        This ensures files are always saved even if processing fails.
        """
        try:
            project = self.get_object()
            
            # Create the file instance manually to avoid serializer issues
            uploaded_file = UploadedFile(
                project=project,
                file=request.FILES['file']
            )
            uploaded_file.save()
            
            # Log successful file upload
            logger.info(f"File uploaded successfully: {uploaded_file.file.name} to project {project.id}")
            
            # Return immediate success response with file info
            response_data = {
                'message': 'File uploaded successfully',
                'file_id': str(uploaded_file.id),
                'filename': uploaded_file.file.name.split('/')[-1] if '/' in uploaded_file.file.name else uploaded_file.file.name,
                'status': 'uploaded'
            }
            
            # Process the file in the background (this is the "process later" part)
            try:
                # Start processing asynchronously
                import threading
                processing_thread = threading.Thread(
                    target=self._process_file_background,
                    args=(uploaded_file.id,)
                )
                processing_thread.daemon = True
                processing_thread.start()
                
                response_data['processing'] = 'started'
                logger.info(f"Background processing started for file: {uploaded_file.id}")
                
            except Exception as e:
                logger.error(f"Failed to start background processing for file {uploaded_file.id}: {e}")
                response_data['processing'] = 'failed_to_start'
                response_data['processing_error'] = str(e)
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            return Response({
                'error': 'File upload failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _process_file_background(self, file_id: str):
        """
        Background file processing to avoid blocking the upload response.
        """
        try:
            from .services import process_uploaded_file
            result = process_uploaded_file(file_id)
            
            if result and result.get('status') == 'completed':
                logger.info(f"Background processing completed for file: {file_id}")
            else:
                logger.warning(f"Background processing failed for file: {file_id}")
                
        except Exception as e:
            logger.error(f"Background processing error for file {file_id}: {e}")
            # Update file status to failed
            try:
                from .models import UploadedFile
                uploaded_file = UploadedFile.objects.get(id=file_id)
                uploaded_file.processing_status = 'failed'
                uploaded_file.processing_error = f"Background processing error: {str(e)}"
                uploaded_file.processing_completed_at = timezone.now()
                uploaded_file.save(update_fields=['processing_status', 'processing_error', 'processing_completed_at'])
            except Exception as save_error:
                logger.error(f"Failed to update file status for {file_id}: {save_error}")

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def generate_metadata(self, request, pk=None):
        """
        Trigger AI metadata generation for a project.
        
        Query Parameters:
        - force: If true, regenerate metadata even if it already exists
        """
        project = self.get_object()
        
        # Check if STI is enabled
        from decouple import config
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if not enable_sti:
            return Response({
                'error': 'Metadata generation is only available when STI is enabled'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if metadata already exists
        force_regenerate = request.query_params.get('force', 'false').lower() == 'true'
        existing_metadata = project.metadata.filter(key='ai_generated_metadata').exists()
        
        if existing_metadata and not force_regenerate:
            return Response({
                'message': 'Metadata already exists. Use ?force=true to regenerate.',
                'project_id': str(project.id),
                'existing_metadata': True
            }, status=status.HTTP_200_OK)
        
        try:
            # Trigger the Celery task
            task = generate_project_meta.delay(str(project.id))
            
            logger.info(f"Metadata generation task triggered for project {project.id}: {task.id}")
            
            return Response({
                'message': 'Metadata generation started',
                'task_id': task.id,
                'project_id': str(project.id),
                'force_regenerate': force_regenerate
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Error triggering metadata generation for project {project.id}: {str(e)}")
            return Response({
                'error': 'Failed to start metadata generation'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a project with debug logging."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Debug logging
        logger.info(f"🔍 DEBUG: Project {instance.id} retrieved. Files count: {instance.uploaded_files.count()}")
        logger.info(f"🔍 DEBUG: Serializer class: {self.get_serializer_class().__name__}")
        logger.info(f"🔍 DEBUG: Response includes uploaded_files: {'uploaded_files' in data}")
        if 'uploaded_files' in data:
            logger.info(f"🔍 DEBUG: uploaded_files length: {len(data['uploaded_files'])}")
        
        return Response(data)

@csrf_exempt
@require_http_methods(["POST"])
def reset_test_database(request):
    """
    Test utility endpoint to reset database state for E2E tests.
    Only available in development/test environments.
    """
    from django.conf import settings
    
    # Only allow in development/test
    if not settings.DEBUG:
        return JsonResponse({'error': 'Not available in production'}, status=403)
    
    try:
        from django.core.management import call_command
        from django.core.cache import cache
        
        # Clear cache
        cache.clear()
        
        # Clean up abandoned drafts
        call_command('cleanup_drafts', hours=0, verbosity=0)
        
        return JsonResponse({
            'message': 'Database reset successful',
            'cache_cleared': True,
            'drafts_cleaned': True
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)
