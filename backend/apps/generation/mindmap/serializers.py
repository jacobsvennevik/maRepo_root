# backend/apps/mindmap/serializers.py

from rest_framework import serializers
from .models import MindMap

class MindMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindMap
        fields = ['id', 'owner', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
