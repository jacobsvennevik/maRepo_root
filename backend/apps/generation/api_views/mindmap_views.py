"""
MindMap-related API views.

This module contains all MindMap-related ViewSets and API views.
"""

from rest_framework import viewsets
from rest_framework.response import Response

from ..models import MindMap
from ..serializers import MindMapSerializer


class MindMapViewSet(viewsets.ModelViewSet):
    """ViewSet for managing MindMaps."""
    
    queryset = MindMap.objects.all()
    serializer_class = MindMapSerializer
    # permission_classes = [permissions.IsAuthenticated]
