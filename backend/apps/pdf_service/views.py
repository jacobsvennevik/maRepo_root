# backend/apps/learningtips/views.py
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
import logging
from .django_models import Document
from .serializers import DocumentSerializer
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .forms import DocumentUploadForm

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

@login_required
def upload_document(request):
    if request.method == 'POST':
        form = DocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.user = request.user
            document.save()
            # Redirect to a new URL:
            return redirect('document_detail', document_id=document.id)
    else:
        form = DocumentUploadForm()
    return render(request, 'documents/upload.html', {'form': form})

@login_required
def document_detail(request, document_id):
    document = get_object_or_404(Document, id=document_id, user=request.user)
    return render(request, 'documents/detail.html', {'document': document})
