from django.shortcuts import render
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
