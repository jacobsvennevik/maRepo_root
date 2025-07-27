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

logger = logging.getLogger(__name__)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.projects.all()

    def perform_create(self, serializer):
        """
        Assign the current user as the owner of the project.
        """
        logger.info(f"User {self.request.user.id} started creating a project.")
        serializer.save(owner=self.request.user)
        logger.info(f"User {self.request.user.id} successfully created project {serializer.instance.id}.")

    def perform_update(self, serializer):
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
                        
                        # Delete abandoned drafts
                        deleted_count = abandoned_drafts.delete()[0]
                        
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

        # We can return the file info, or the updated project
        return Response(serializer.data, status=status.HTTP_201_CREATED)
