from rest_framework import serializers
from .models import (
    ReflectionSession, ReflectionEntry, ReflectionAnalysis, 
    Checklist, ChecklistItem, Recommendation, ReflectionStreak
)


class ChecklistItemSerializer(serializers.ModelSerializer):
    """Serializer for checklist items."""
    
    class Meta:
        model = ChecklistItem
        fields = ['id', 'order', 'text', 'hint']


class ChecklistSerializer(serializers.ModelSerializer):
    """Serializer for checklists with nested items."""
    
    items = ChecklistItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Checklist
        fields = ['id', 'title', 'source_ref', 'items', 'created_at']


class ReflectionEntrySerializer(serializers.ModelSerializer):
    """Serializer for reflection entries."""
    
    class Meta:
        model = ReflectionEntry
        fields = ['id', 'key', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_key(self, value):
        """Validate that the key is one of the expected reflection prompts."""
        valid_keys = [
            'what_was_hard', 'misapplied_rule', 'what_went_well', 
            'next_time', 'time_management', 'concept_understanding',
            'study_environment', 'focus_level'
        ]
        if value not in valid_keys:
            raise serializers.ValidationError(f"Invalid reflection key. Must be one of: {', '.join(valid_keys)}")
        return value


class ReflectionAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for reflection analysis."""
    
    class Meta:
        model = ReflectionAnalysis
        fields = ['id', 'tags', 'confidence', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class RecommendationSerializer(serializers.ModelSerializer):
    """Serializer for recommendations."""
    
    class Meta:
        model = Recommendation
        fields = [
            'id', 'kind', 'payload', 'label', 'dismissed', 
            'clicked_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReflectionSessionSerializer(serializers.ModelSerializer):
    """Serializer for reflection sessions."""
    
    entries = ReflectionEntrySerializer(many=True, read_only=True)
    analysis = ReflectionAnalysisSerializer(read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = ReflectionSession
        fields = [
            'id', 'user', 'project', 'project_name', 'source', 'source_display',
            'source_ref', 'started_at', 'ended_at', 'duration_seconds',
            'entries', 'analysis', 'recommendations'
        ]
        read_only_fields = ['id', 'user', 'started_at', 'entries', 'analysis', 'recommendations']
    
    def create(self, validated_data):
        """Automatically set the user from the request."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReflectionSessionCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating reflection sessions."""
    
    class Meta:
        model = ReflectionSession
        fields = ['project', 'source', 'source_ref']
    
    def create(self, validated_data):
        """Automatically set the user from the request."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReflectionEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reflection entries."""
    
    class Meta:
        model = ReflectionEntry
        fields = ['key', 'text']
    
    def create(self, validated_data):
        """Set the session from the URL parameter."""
        session_id = self.context['session_id']
        validated_data['session_id'] = session_id
        return super().create(validated_data)


class ReflectionStreakSerializer(serializers.ModelSerializer):
    """Serializer for reflection streaks."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ReflectionStreak
        fields = ['id', 'username', 'current_streak', 'longest_streak', 'last_reflection_date', 'updated_at']
        read_only_fields = ['id', 'username', 'updated_at']


class ReflectionSummarySerializer(serializers.Serializer):
    """Serializer for reflection summary data."""
    
    total_sessions = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    common_tags = serializers.ListField(child=serializers.CharField())
    recent_recommendations = RecommendationSerializer(many=True)
