# backend/apps/documents/serializers.py
from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'file_type',
            'upload_date',
            'status',
            'original_text',
            'file',
            'user',  # Now marked as read-only
            'upload_type',
        ]
