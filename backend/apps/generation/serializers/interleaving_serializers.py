from rest_framework import serializers
from ..models import InterleavingSessionConfig


class InterleavingSessionConfigSerializer(serializers.ModelSerializer):
    """Serializer for interleaving session configuration."""
    
    class Meta:
        model = InterleavingSessionConfig
        fields = [
            'id', 'user', 'difficulty', 'session_size', 
            'w_due', 'w_interleave', 'w_new', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class InterleavingSessionRequestSerializer(serializers.Serializer):
    """Serializer for interleaving session request."""
    
    size = serializers.IntegerField(default=10, min_value=1, max_value=50)
    difficulty = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        default='medium'
    )
    seed = serializers.IntegerField(required=False, help_text="Random seed for reproducibility")


class InterleavingSessionItemSerializer(serializers.Serializer):
    """Serializer for individual items in an interleaving session."""
    
    card_id = serializers.IntegerField()
    question = serializers.CharField()
    answer = serializers.CharField()
    difficulty = serializers.CharField()
    learning_state = serializers.CharField()
    next_review = serializers.DateTimeField()
    position = serializers.IntegerField()


class InterleavingSessionResponseSerializer(serializers.Serializer):
    """Serializer for interleaving session response."""
    
    session_id = serializers.CharField()
    items = InterleavingSessionItemSerializer(many=True)
    total_items = serializers.IntegerField()
    difficulty = serializers.CharField()
    estimated_duration = serializers.IntegerField(help_text="Estimated duration in minutes")
    session_stats = serializers.DictField()
