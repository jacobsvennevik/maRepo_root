from django.shortcuts import render
import logging
from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer

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
