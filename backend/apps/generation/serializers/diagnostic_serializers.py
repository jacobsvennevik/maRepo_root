from rest_framework import serializers
from ..models import DiagnosticQuestion, DiagnosticSession, DiagnosticResponse, DiagnosticAnalytics


class DiagnosticQuestionSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic questions."""
    
    class Meta:
        model = DiagnosticQuestion
        fields = [
            'id', 'type', 'text', 'choices', 'correct_choice_index',
            'explanation', 'difficulty', 'topic', 'created_at'
        ]


class DiagnosticSessionSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic sessions."""
    
    class Meta:
        model = DiagnosticSession
        fields = [
            'id', 'project', 'title', 'description', 'status',
            'delivery_mode', 'time_limit_sec', 'questions_order',
            'seed', 'created_at', 'updated_at', 'is_open'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_open']


class DiagnosticResponseSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic responses."""
    
    class Meta:
        model = DiagnosticResponse
        fields = [
            'id', 'session', 'user', 'question', 'selected_choice_index',
            'is_correct', 'response_time_sec', 'confidence_level',
            'created_at'
        ]
        read_only_fields = ['id', 'is_correct', 'created_at']


class DiagnosticSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating diagnostic sessions."""
    
    class Meta:
        model = DiagnosticSession
        fields = [
            'project', 'title', 'description', 'delivery_mode',
            'time_limit_sec', 'questions_order', 'seed'
        ]


class DiagnosticSessionStartSerializer(serializers.Serializer):
    """Serializer for starting diagnostic sessions."""
    
    session_id = serializers.UUIDField()


class DiagnosticSessionResultSerializer(serializers.Serializer):
    """Serializer for diagnostic session results."""
    
    session_id = serializers.UUIDField()
    total_questions = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    accuracy_percentage = serializers.FloatField()
    total_time_sec = serializers.FloatField()
    average_response_time = serializers.FloatField()
    question_results = serializers.ListField()


class DiagnosticAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic analytics."""
    
    class Meta:
        model = DiagnosticAnalytics
        fields = [
            'id', 'session', 'total_participants', 'average_score',
            'question_analysis', 'difficulty_analysis', 'topic_analysis',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DiagnosticGenerationRequestSerializer(serializers.Serializer):
    """Serializer for diagnostic generation requests."""
    
    project_id = serializers.IntegerField()
    num_questions = serializers.IntegerField(default=10, min_value=1, max_value=50)
    difficulty = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        default='medium'
    )
    topics = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    question_types = serializers.ListField(
        child=serializers.ChoiceField(choices=['MCQ', 'TF', 'FIB']),
        default=['MCQ']
    )
