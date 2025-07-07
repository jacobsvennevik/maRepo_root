# backend/apps/pdf_service/views_api.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .django_models import Document
from .serializers import DocumentSerializer
from .tasks import process_document
import logging

logger = logging.getLogger(__name__)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a document to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are only allowed to the owner of the document
        return obj.user == request.user

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        This view should return a list of all documents
        for the currently authenticated user.
        """
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Triggers the PDF processing and classification Celery task.
        """
        try:
            document = self.get_object()
            logger.info(f"Starting processing for document {document.id}")
            
            # Try to queue the task
            try:
                task = process_document.delay(document.id)
                logger.info(f"Task queued successfully with ID: {task.id}")
                
                return Response(
                    {
                        'status': 'processing_started',
                        'task_id': task.id,
                        'document_id': document.id
                    },
                    status=status.HTTP_202_ACCEPTED
                )
            except Exception as celery_error:
                logger.error(f"Failed to queue Celery task: {celery_error}")
                return Response(
                    {
                        'error': 'Failed to queue processing task',
                        'detail': str(celery_error),
                        'suggestion': 'Check if Celery worker is running and Redis is accessible'
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
                
        except Document.DoesNotExist:
            logger.error(f"Document with ID {pk} not found")
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Unexpected error processing document {pk}: {e}")
            return Response(
                {
                    'error': 'Internal server error',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def processed_data(self, request, pk=None):
        """
        Get the AI-extracted processed data for a document.
        """
        try:
            document = self.get_object()
            
            # Check if document has processed data
            if hasattr(document, 'processed_data'):
                processed_data = document.processed_data
                logger.info(f"Returning processed data for document {document.id}")
                
                return Response({
                    'data': processed_data.data,
                    'timestamp': processed_data.timestamp,
                    'document_id': document.id,
                    'document_status': document.status
                }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"No processed data found for document {document.id}")
                return Response(
                    {'error': 'No processed data available for this document'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Document.DoesNotExist:
            logger.error(f"Document with ID {pk} not found")
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving processed data for document {pk}: {e}")
            return Response(
                {
                    'error': 'Internal server error',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )