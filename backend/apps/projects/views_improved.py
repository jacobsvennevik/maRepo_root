from django.shortcuts import render
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from django.db import transaction
from django.db.models import Prefetch, Q
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from .models_improved import (
    Project, SchoolProject, SelfStudyProject, ProjectMeta, 
    UploadedFile, Extraction, ImportantDate
)
from .serializers_improved import (
    ProjectSerializer, ProjectListSerializer, ProjectDetailSerializer,
    ProjectCreateSerializer, ProjectUpdateSerializer,
    UploadedFileSerializer, ProjectMetaSerializer
)
from .services import process_uploaded_file

logger = logging.getLogger(__name__)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Enhanced project viewset with improved querying and performance.
    """
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get user's projects with optimized queries."""
        base_queryset = self.request.user.projects.all()
        
        # Optimize queries based on action
        if self.action == 'list':
            # For list view, prefetch type-specific data
            return base_queryset.prefetch_related(
                'schoolproject',
                'selfstudyproject',
                'important_dates'
            ).select_related('owner')
        elif self.action == 'retrieve':
            # For detail view, prefetch all related data
            return base_queryset.prefetch_related(
                'schoolproject',
                'selfstudyproject',
                'important_dates',
                'metadata',
                'uploaded_files',
                'uploaded_files__extraction'
            ).select_related('owner')
        
        return base_queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'retrieve':
            return ProjectDetailSerializer
        elif self.action == 'create':
            return ProjectCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProjectUpdateSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        """Create project with logging and validation."""
        logger.info(f"User {self.request.user.id} started creating a project.")
        
        # Assign owner
        project = serializer.save(owner=self.request.user)
        
        logger.info(f"User {self.request.user.id} successfully created project {project.id}.")
        return project

    def perform_update(self, serializer):
        """Update project with logging."""
        logger.info(f"User {self.request.user.id} started updating project {serializer.instance.id}.")
        serializer.save()
        logger.info(f"User {self.request.user.id} successfully updated project {serializer.instance.id}.")

    def perform_destroy(self, instance):
        """Soft delete project instead of hard delete."""
        logger.info(f"User {self.request.user.id} started deleting project {instance.id}.")
        
        # Soft delete by marking as draft and setting deletion flag
        instance.is_draft = True
        instance.save(update_fields=['is_draft'])
        
        # Add deletion metadata
        ProjectMeta.objects.create(
            project=instance,
            key='deleted_at',
            value=timezone.now().isoformat()
        )
        
        logger.info(f"User {self.request.user.id} successfully soft-deleted project {instance.id}.")

    @action(detail=False, methods=['get'])
    def school_projects(self, request):
        """Get only school projects for the current user."""
        projects = self.get_queryset().filter(project_type='school')
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def self_study_projects(self, request):
        """Get only self-study projects for the current user."""
        projects = self.get_queryset().filter(project_type='self_study')
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def drafts(self, request):
        """Get only draft projects for the current user."""
        projects = self.get_queryset().filter(is_draft=True)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get only completed (non-draft) projects for the current user."""
        projects = self.get_queryset().filter(is_draft=False)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search projects by name, description, or metadata."""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Query parameter "q" is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Use PostgreSQL full-text search if available
        if hasattr(Project.objects, 'annotate'):
            projects = self.get_queryset().annotate(
                search=SearchVector('name', 'schoolproject__course_name', 'selfstudyproject__goal_description'),
            ).filter(
                Q(search=SearchQuery(query)) |
                Q(name__icontains=query) |
                Q(schoolproject__course_name__icontains=query) |
                Q(selfstudyproject__goal_description__icontains=query)
            )
        else:
            # Fallback to simple text search
            projects = self.get_queryset().filter(
                Q(name__icontains=query) |
                Q(schoolproject__course_name__icontains=query) |
                Q(selfstudyproject__goal_description__icontains=query)
            )
        
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cleanup_drafts(self, request):
        """
        Enhanced cleanup of abandoned draft projects with improved performance.
        """
        try:
            hours = int(request.data.get('hours', 24))
            
            if hours <= 0:
                return Response({
                    'error': 'Hours must be a positive integer'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create unique cache key for this user's cleanup operation
            cache_key = f"draft_cleanup_{request.user.id}_{hours}"
            
            # Check if cleanup is already in progress
            if cache.get(cache_key):
                return Response({
                    'message': 'Cleanup already in progress for this user',
                    'deleted_count': 0
                }, status=status.HTTP_200_OK)
            
            # Set cache to prevent concurrent cleanup operations
            cache.set(cache_key, True, timeout=300)  # 5 minute timeout
            
            try:
                with transaction.atomic():
                    # Use the custom manager method for better performance
                    abandoned_drafts = Project.objects.abandoned_drafts(hours=hours)
                    abandoned_drafts = abandoned_drafts.filter(owner=request.user)
                    
                    count = abandoned_drafts.count()
                    
                    if count > 0:
                        logger.info(f"User {request.user.id} cleaning up {count} abandoned draft projects older than {hours} hours")
                        
                        # Soft delete instead of hard delete
                        deleted_count = abandoned_drafts.update(is_draft=True)
                        
                        # Add deletion metadata
                        for project in abandoned_drafts:
                            ProjectMeta.objects.create(
                                project=project,
                                key='cleanup_deleted_at',
                                value=timezone.now().isoformat()
                            )
                        
                        # Update metrics
                        self._update_cleanup_metrics(deleted_count)
                        
                        logger.info(f"User {request.user.id} successfully cleaned up {deleted_count} abandoned draft projects")
                        
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
        """Update metrics for monitoring cleanup operations."""
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
            logger.warning(f"Failed to update cleanup metrics: {e}")

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def cleanup_metrics(self, request):
        """Get cleanup metrics for monitoring."""
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
        """Upload file to project with improved error handling."""
        project = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Save the uploaded file
        uploaded_file = serializer.save(project=project)
        
        # Trigger the processing asynchronously
        process_uploaded_file(uploaded_file.id)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post', 'put', 'patch', 'delete'])
    def metadata(self, request, pk=None):
        """Manage project metadata."""
        project = self.get_object()
        
        if request.method == 'GET':
            # Get all metadata for the project
            metadata = project.metadata.all()
            serializer = ProjectMetaSerializer(metadata, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Add new metadata
            serializer = ProjectMetaSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        elif request.method in ['PUT', 'PATCH']:
            # Update metadata
            key = request.data.get('key')
            if not key:
                return Response({'error': 'Key is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            metadata, created = ProjectMeta.objects.get_or_create(
                project=project, 
                key=key,
                defaults={'value': request.data.get('value', {})}
            )
            
            if not created:
                metadata.value = request.data.get('value', metadata.value)
                metadata.save()
            
            serializer = ProjectMetaSerializer(metadata)
            return Response(serializer.data)
        
        elif request.method == 'DELETE':
            # Delete metadata
            key = request.query_params.get('key')
            if not key:
                return Response({'error': 'Key is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                metadata = project.metadata.get(key=key)
                metadata.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except ProjectMeta.DoesNotExist:
                return Response({'error': 'Metadata not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """Finalize a draft project."""
        project = self.get_object()
        
        if not project.is_draft:
            return Response({
                'error': 'Project is already finalized'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate that required fields are present
        if project.project_type == 'school':
            if not hasattr(project, 'schoolproject'):
                return Response({
                    'error': 'School project data is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        elif project.project_type == 'self_study':
            if not hasattr(project, 'selfstudyproject'):
                return Response({
                    'error': 'Self-study project data is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Finalize the project
        project.is_draft = False
        project.save(update_fields=['is_draft'])
        
        # Add finalization metadata
        ProjectMeta.objects.create(
            project=project,
            key='finalized_at',
            value=timezone.now().isoformat()
        )
        
        serializer = self.get_serializer(project)
        return Response(serializer.data) 