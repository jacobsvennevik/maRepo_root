# backend/apps/learningtips/views.py
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
import logging
from .models import Document
from .serializers import DocumentSerializer

logger = logging.getLogger(__name__)

def index(request):
    return HttpResponse("Welcome to the Learning Tips Index!")

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_course_files(request):
    return handle_file_upload(request, 'course_files')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_test_files(request):
    return handle_file_upload(request, 'test_files')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_learning_materials(request):
    return handle_file_upload(request, 'learning_materials')

def handle_file_upload(request, upload_type):
    file = request.FILES.get('file')
    if not file:
        logger.warning(f"User {request.user.id} failed to upload a file (no file submitted) for upload_type {upload_type}.")
        return Response({'error': 'No file was submitted.'}, status=status.HTTP_400_BAD_REQUEST)

    logger.info(f"User {request.user.id} started uploading a file for upload_type {upload_type}.")
    # Add validation for file size and type here

    document = Document.objects.create(
        user=request.user,
        file=file,
        title=file.name,
        upload_type=upload_type,
    )
    serializer = DocumentSerializer(document)
    logger.info(f"User {request.user.id} successfully uploaded file {document.id} for upload_type {upload_type}.")
    return Response(serializer.data, status=status.HTTP_201_CREATED)
