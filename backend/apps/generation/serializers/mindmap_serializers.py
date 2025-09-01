from rest_framework import serializers
from ..models import MindMap, GeneratedContent


class MindMapSerializer(serializers.ModelSerializer):
    """Serializer for mind maps."""
    
    class Meta:
        model = MindMap
        fields = [
            'id', 'title', 'description', 'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GeneratedContentSerializer(serializers.ModelSerializer):
    """Serializer for generated content."""
    
    class Meta:
        model = GeneratedContent
        fields = [
            'id', 'content_type', 'content', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
