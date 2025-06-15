# backend/apps/pdf_service/views_api.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .django_models import Document
from .serializers import DocumentSerializer
from .tasks import process_pdf_and_classify

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Triggers the PDF processing and classification Celery task.
        """
        try:
            document = self.get_object()
            process_pdf_and_classify.delay(document.id)
            return Response(
                {'status': 'processing_started'},
                status=status.HTTP_202_ACCEPTED
            )
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )