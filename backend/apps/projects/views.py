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
from .serializers import ProjectSerializer, UploadedFileSerializer
from .services import process_uploaded_file
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
        """
        from decouple import config
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if enable_sti:
            return ProjectSerializer  # Our hybrid serializer that handles both modes
        else:
            return ProjectSerializer  # Same serializer, but will behave differently based on ENABLE_STI

    def get_queryset(self):
        """Get user's projects with optimized queries."""
        base_queryset = self.request.user.projects.all()
        
        # Read ENABLE_STI dynamically
        from decouple import config
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if enable_sti:
            # When STI is enabled, prefetch metadata
            return base_queryset.prefetch_related('metadata')
        
        return base_queryset

    def perform_create(self, serializer):
        """
        Assign the current user as the owner of the project.
        The serializer handles both legacy and nested STI data automatically.
        """
        logger.info(f"User {self.request.user.id} started creating a project.")
        serializer.save(owner=self.request.user)
        logger.info(f"User {self.request.user.id} successfully created project {serializer.instance.id}.")

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
        project = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # The serializer doesn't save the project, so we do it here.
        uploaded_file = serializer.save(project=project)
        
        # Trigger the processing
        process_uploaded_file(uploaded_file.id)

        # Return the fresh project instance serialized with the correct class
        # so the FE sees nested data immediately if ENABLE_STI=true
        project.refresh_from_db()
        project_serializer = self.get_serializer_class()(project, context={'request': request})
        return Response(project_serializer.data, status=status.HTTP_201_CREATED)

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
