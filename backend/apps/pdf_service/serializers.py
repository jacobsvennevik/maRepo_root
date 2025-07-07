# backend/apps/documents/serializers.py
from rest_framework import serializers
from .django_models import Document

class DocumentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    processed_data = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'file_type',
            'upload_date',
            'status',
            'original_text',
            'metadata',
            'file',
            'user',  # Now marked as read-only
            'upload_type',
            'processed_data',
        ]

    def get_processed_data(self, obj):
        """Include AI-extracted processed data if available"""
        if hasattr(obj, 'processed_data'):
            return obj.processed_data.data
        return None
