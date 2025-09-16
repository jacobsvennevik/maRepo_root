# backend/apps/generation/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import (
    FlashcardSet, Flashcard, GeneratedContent, MindMap,
    Topic, Principle, FlashcardProfile, InterleavingSessionConfig,
    DiagnosticSession, DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics
)

class FlashcardSerializer(serializers.ModelSerializer):
    """Flashcard serializer with only model fields for schema generation."""
    
    # Computed fields
    accuracy_rate = serializers.ReadOnlyField()
    is_due = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()
    retention_rate = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    # Add memory_strength as a computed field
    memory_strength = serializers.SerializerMethodField()
    
    class Meta:
        model = Flashcard
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']
    
    def get_memory_strength(self, obj):
        """Get memory_strength from metrics JSONB field."""
        return getattr(obj, 'memory_strength', 1.0)



class FlashcardReviewSerializer(serializers.Serializer):
    """Serializer for reviewing a flashcard."""
    
    flashcard_id = serializers.IntegerField()
    quality = serializers.IntegerField(min_value=0, max_value=5)
    response_time_seconds = serializers.FloatField(required=False, min_value=0)
    
    def validate_quality(self, value):
        """Validate quality score."""
        if not 0 <= value <= 5:
            raise serializers.ValidationError("Quality must be between 0 and 5")
        return value


class IndividualFlashcardReviewSerializer(serializers.Serializer):
    """Serializer for reviewing a single flashcard (ID comes from URL)."""
    
    quality = serializers.IntegerField(min_value=0, max_value=5)
    response_time_seconds = serializers.FloatField(required=False, min_value=0)
    
    def validate_quality(self, value):
        """Validate quality score."""
        if not 0 <= value <= 5:
            raise serializers.ValidationError("Quality must be between 0 and 5")
        return value


class FlashcardSetSerializer(serializers.ModelSerializer):
    """Enhanced flashcard set serializer with spaced repetition statistics."""
    
    flashcards = FlashcardSerializer(many=True, read_only=True)
    
    # Statistics fields
    total_cards = serializers.SerializerMethodField()
    due_cards = serializers.SerializerMethodField()
    learning_cards = serializers.SerializerMethodField()
    review_cards = serializers.SerializerMethodField()
    new_cards = serializers.SerializerMethodField()
    average_accuracy = serializers.SerializerMethodField()

    class Meta:
        model = FlashcardSet
        fields = [
            'id',
            'title',
            'document',
            'owner',
            'created_at',
            'flashcards',
            
            # Statistics
            'total_cards',
            'due_cards',
            'learning_cards',
            'review_cards',
            'new_cards',
            'average_accuracy'
        ]
    
    def get_total_cards(self, obj):
        """Get total number of cards in set."""
        return obj.flashcards.count()
    
    def get_due_cards(self, obj):
        """Get number of cards due for review."""
        return obj.flashcards.filter(next_review__lte=timezone.now()).count()
    
    def get_learning_cards(self, obj):
        """Get number of cards in learning state."""
        return obj.flashcards.filter(learning_state='learning').count()
    
    def get_review_cards(self, obj):
        """Get number of cards in review state."""
        return obj.flashcards.filter(learning_state='review').count()
    
    def get_new_cards(self, obj):
        """Get number of new cards."""
        return obj.flashcards.filter(learning_state='new').count()
    
    def get_average_accuracy(self, obj):
        """Calculate average accuracy across all cards in set."""
        cards_with_reviews = obj.flashcards.filter(total_reviews__gt=0)
        if not cards_with_reviews.exists():
            return 0.0
        
        total_reviews = sum(card.total_reviews for card in cards_with_reviews)
        total_correct = sum(card.correct_reviews for card in cards_with_reviews)
        
        return (total_correct / total_reviews * 100) if total_reviews > 0 else 0.0


class ReviewSessionSerializer(serializers.Serializer):
    """Serializer for review session data."""
    
    session_limit = serializers.IntegerField(default=20, min_value=1, max_value=100)


# Interleaving Scheduler Serializers
class TopicSerializer(serializers.ModelSerializer):
    """Serializer for Topic model."""
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'parent']


class PrincipleSerializer(serializers.ModelSerializer):
    """Serializer for Principle model."""
    
    topic = TopicSerializer(read_only=True)
    contrasts_with = TopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Principle
        fields = ['id', 'name', 'topic', 'contrasts_with']


class FlashcardProfileSerializer(serializers.ModelSerializer):
    """Serializer for FlashcardProfile model."""
    
    topic = TopicSerializer(read_only=True)
    principle = PrincipleSerializer(read_only=True)
    
    class Meta:
        model = FlashcardProfile
        fields = ['id', 'topic', 'principle', 'difficulty_est', 'surface_features']


class InterleavingSessionConfigSerializer(serializers.ModelSerializer):
    """Serializer for InterleavingSessionConfig model."""
    
    class Meta:
        model = InterleavingSessionConfig
        fields = [
            'difficulty', 'session_size', 'w_due', 'w_interleave', 'w_new',
            'max_same_topic_streak', 'require_contrast_pair', 'auto_adapt'
        ]

    def validate(self, data):
        """Validate the entire configuration."""
        # Get current values for fields not being updated
        instance = getattr(self, 'instance', None)
        if instance:
            for field in self.Meta.fields:
                if field not in data:
                    data[field] = getattr(instance, field)
        
        # Validate weights sum to approximately 1.0
        w_due = data.get('w_due', 0.6)
        w_interleave = data.get('w_interleave', 0.25)
        w_new = data.get('w_new', 0.15)
        total_weight = w_due + w_interleave + w_new
        
        if abs(total_weight - 1.0) > 0.01:
            raise serializers.ValidationError(
                f"Weights must sum to 1.0, got {total_weight:.3f}"
            )
        
        # Validate session size bounds
        session_size = data.get('session_size', 10)
        if session_size < 1:
            raise serializers.ValidationError("Session size must be at least 1")
        if session_size > 200:
            raise serializers.ValidationError("Session size cannot exceed 200")
        
        # Validate topic streak constraint
        max_same_topic_streak = data.get('max_same_topic_streak', 2)
        if max_same_topic_streak < 1:
            raise serializers.ValidationError("Max topic streak must be at least 1")
        if max_same_topic_streak > 10:
            raise serializers.ValidationError("Max topic streak cannot exceed 10")
        
        return data


class InterleavingSessionRequestSerializer(serializers.Serializer):
    """Serializer for interleaving session requests."""
    
    size = serializers.IntegerField(required=False, min_value=1, max_value=200, default=10)
    difficulty = serializers.ChoiceField(
        choices=[('low', 'low'), ('medium', 'medium'), ('high', 'high')],
        required=False
    )
    seed = serializers.CharField(required=False, max_length=100, help_text="Optional seed for deterministic ordering")

    def validate_size(self, value):
        """Validate session size with reasonable bounds."""
        if value < 1:
            raise serializers.ValidationError("Session size must be at least 1")
        if value > 200:
            raise serializers.ValidationError("Session size cannot exceed 200")
        return value


class InterleavingSessionItemSerializer(serializers.Serializer):
    """Serializer for individual session items."""
    
    flashcard_id = serializers.IntegerField(source='flashcard.id')
    question = serializers.CharField(source='flashcard.question')
    answer = serializers.CharField(source='flashcard.answer')
    type = serializers.CharField()
    topic = serializers.CharField()
    principle = serializers.SerializerMethodField()
    position = serializers.IntegerField()
    difficulty_est = serializers.SerializerMethodField()

    def get_principle(self, obj):
        p = obj.get('principle')
        return getattr(p, 'name', None) if p else None

    def get_difficulty_est(self, obj):
        profile = getattr(obj['flashcard'], 'flashcardprofile', None)
        return getattr(profile, 'difficulty_est', 1.0) if profile else 1.0


class InterleavingSessionResponseSerializer(serializers.Serializer):
    """Serializer for interleaving session responses."""
    
    items = InterleavingSessionItemSerializer(many=True)
    mix = serializers.DictField()
    header = serializers.DictField()
    why = serializers.CharField()
    constraints = serializers.DictField()
    difficulty = serializers.CharField()
    difficulty_description = serializers.CharField()
    interval_multiplier = serializers.FloatField()
    
    # Enhanced metadata
    requested_size = serializers.IntegerField()
    actual_size = serializers.IntegerField()
    fill_mode = serializers.ChoiceField(choices=[
        ('strict', 'strict'),
        ('relaxed', 'relaxed'), 
        ('exhausted', 'exhausted')
    ])
    constraints_applied = serializers.DictField()
    pool_sizes = serializers.DictField()
    session_id = serializers.CharField()


class ReviewSessionStatsSerializer(serializers.Serializer):
    """Serializer for review session statistics."""
    
    total_cards = serializers.IntegerField()
    correct_cards = serializers.IntegerField()
    session_start = serializers.DateTimeField()
    session_end = serializers.DateTimeField()
    session_duration_minutes = serializers.FloatField()
    average_response_time = serializers.FloatField()
    accuracy_percentage = serializers.FloatField()
    cards_reviewed = serializers.ListField()


class DueCardsSerializer(serializers.Serializer):
    """Serializer for due cards query parameters."""
    
    limit = serializers.IntegerField(default=20, min_value=1, max_value=100)
    algorithm = serializers.ChoiceField(
        choices=['leitner', 'sm2'], 
        required=False,
        help_text="Filter by algorithm"
    )
    learning_state = serializers.ChoiceField(
        choices=['new', 'learning', 'review', 'relearning'],
        required=False,
        help_text="Filter by learning state"
    )


class ReviewDashboardSerializer(serializers.Serializer):
    """Serializer for review dashboard data."""
    
    status_counts = serializers.DictField()
    due_timeframes = serializers.DictField()
    algorithm_stats = serializers.ListField()
    retention_data = serializers.ListField()
    last_updated = serializers.DateTimeField()


class UpcomingReviewsSerializer(serializers.Serializer):
    """Serializer for upcoming reviews query."""
    
    days_ahead = serializers.IntegerField(default=7, min_value=1, max_value=30)


class StudyPlanSerializer(serializers.Serializer):
    """Serializer for study plan parameters."""
    
    available_time_minutes = serializers.IntegerField(default=20, min_value=1, max_value=240)


class StudyPlanResponseSerializer(serializers.Serializer):
    """Serializer for study plan response."""
    
    recommended_cards = serializers.ListField(child=serializers.IntegerField())
    estimated_duration_minutes = serializers.FloatField()
    total_due_cards = serializers.IntegerField()
    cards_breakdown = serializers.DictField()
    study_focus = serializers.CharField()


class LearningAnalyticsSerializer(serializers.Serializer):
    """Serializer for learning analytics query."""
    
    timeframe_days = serializers.IntegerField(default=30, min_value=1, max_value=365)


class LearningAnalyticsResponseSerializer(serializers.Serializer):
    """Serializer for learning analytics response."""
    
    overall_accuracy = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    algorithm_performance = serializers.DictField()
    learning_curve = serializers.ListField()
    timeframe_days = serializers.IntegerField()


class CardRetentionSerializer(serializers.Serializer):
    """Serializer for card retention data."""
    
    card_id = serializers.IntegerField()
    retention = serializers.FloatField()
    interval = serializers.FloatField()
    memory_strength = serializers.FloatField()
    next_review = serializers.DateTimeField()
    learning_state = serializers.CharField()


class ScheduleOptimizationSerializer(serializers.Serializer):
    """Serializer for schedule optimization parameters."""
    
    target_daily_reviews = serializers.IntegerField(default=20, min_value=1, max_value=100)


# Diagnostic Serializers
class DiagnosticQuestionSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic questions."""
    
    class Meta:
        model = DiagnosticQuestion
        fields = [
            'id', 'type', 'text', 'choices', 'correct_choice_index',
            'acceptable_answers', 'explanation', 'difficulty', 'bloom_level',
            'concept_id', 'source_anchor', 'tags', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DiagnosticSessionSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic sessions."""
    
    questions = DiagnosticQuestionSerializer(many=True, read_only=True)
    is_open = serializers.ReadOnlyField()
    participation_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = DiagnosticSession
        fields = [
            'id', 'project', 'topic', 'content_source', 'status',
            'delivery_mode', 'scheduled_for', 'due_at', 'time_limit_sec',
            'max_questions', 'questions_order', 'seed', 'created_by',
            'variant', 'feature_flag_key', 'created_at', 'updated_at',
            # New optional fields
            'test_style', 'style_config_override',
            'questions', 'is_open', 'participation_rate'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'questions', 'created_by']

    def validate_style_config_override(self, value):
        # Accept any object; ensure dict or None
        if value in (None, ""):
            return None
        if not isinstance(value, dict):
            raise serializers.ValidationError("style_config_override must be an object")
        # Ignore unknown keys by design; could log here
        return value


class DiagnosticResponseSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic responses."""
    
    class Meta:
        model = DiagnosticResponse
        fields = [
            'id', 'session', 'question', 'user', 'answer_text',
            'selected_choice_index', 'confidence', 'is_correct', 'score',
            'brier_component', 'latency_ms', 'attempt_no', 'started_at',
            'submitted_at', 'feedback_shown_at', 'meta'
        ]
        read_only_fields = ['id', 'is_correct', 'score', 'brier_component', 'submitted_at']
    
    def validate(self, attrs):
        """Validate response data based on question type."""
        question = attrs['question']
        
        # Validate MCQ responses
        if question.type == 'MCQ':
            if attrs.get('selected_choice_index') is None:
                raise serializers.ValidationError("selected_choice_index required for MCQ questions")
            if not (0 <= attrs['selected_choice_index'] <= 3):
                raise serializers.ValidationError("selected_choice_index must be 0-3")
        
        # Validate non-MCQ responses
        if question.type != 'MCQ':
            if not attrs.get('answer_text'):
                raise serializers.ValidationError("answer_text required for non-MCQ questions")
        
        # Validate confidence
        confidence = attrs.get('confidence', 0)
        if not (0 <= confidence <= 100):
            raise serializers.ValidationError("confidence must be between 0 and 100")
        
        return attrs
    
    def create(self, validated_data):
        """Create response and calculate metrics."""
        response = super().create(validated_data)
        
        # Calculate correctness and score
        question = response.question
        if question.type == 'MCQ':
            is_correct = (response.selected_choice_index == question.correct_choice_index)
        else:
            # For now, use simple text matching - could be enhanced with AI
            is_correct = self._match_free_text(response.answer_text, question.acceptable_answers)
        
        response.is_correct = is_correct
        response.score = 1.0 if is_correct else 0.0
        
        # Calculate Brier component for calibration
        confidence = response.confidence / 100.0
        actual = 1.0 if is_correct else 0.0
        response.brier_component = (confidence - actual) ** 2
        
        response.save(update_fields=['is_correct', 'score', 'brier_component'])
        
        # Seed spaced repetition system
        self._seed_spaced_repetition(response)
        
        return response
    
    def _match_free_text(self, answer_text: str, acceptable_answers: list) -> bool:
        """Simple text matching for free-form answers."""
        if not answer_text or not acceptable_answers:
            return False
        
        answer_lower = answer_text.lower().strip()
        for pattern in acceptable_answers:
            if pattern.lower() in answer_lower:
                return True
            # Could add regex support here
        return False
    
    def _seed_spaced_repetition(self, response):
        """Seed spaced repetition system with diagnostic results."""
        try:
            from .spaced_repetition import SpacedRepetitionAlgorithms
            # This will be implemented in the spaced repetition service
            pass
        except ImportError:
            pass  # Spaced repetition not available


class DiagnosticSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating diagnostic sessions."""
    
    class Meta:
        model = DiagnosticSession
        fields = [
            'project', 'topic', 'content_source', 'delivery_mode',
            'scheduled_for', 'due_at', 'time_limit_sec', 'max_questions',
            'questions_order', 'variant', 'feature_flag_key',
            # Allow setting the new optional fields on create
            'test_style', 'style_config_override'
        ]

    def validate_style_config_override(self, value):
        if value in (None, ""):
            return None
        if not isinstance(value, dict):
            raise serializers.ValidationError("style_config_override must be an object")
        return value


class DiagnosticSessionStartSerializer(serializers.Serializer):
    """Serializer for starting a diagnostic session."""
    
    session_id = serializers.UUIDField()


class DiagnosticSessionResultSerializer(serializers.Serializer):
    """Serializer for diagnostic session results."""
    
    session = DiagnosticSessionSerializer()
    responses = DiagnosticResponseSerializer(many=True)
    analytics = serializers.DictField()
    scheduled_reviews = serializers.ListField()


class DiagnosticAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for diagnostic analytics."""
    
    class Meta:
        model = DiagnosticAnalytics
        fields = [
            'id', 'session', 'total_participants', 'participation_rate',
            'average_score', 'median_confidence', 'overconfidence_rate',
            'brier_score', 'concept_analytics', 'top_misconceptions',
            'talking_points', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DiagnosticGenerationRequestSerializer(serializers.Serializer):
    """Serializer for diagnostic generation requests."""
    
    project = serializers.UUIDField()
    topic = serializers.CharField(max_length=255, required=False)
    source_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    question_mix = serializers.DictField(
        child=serializers.IntegerField(),
        required=False
    )
    difficulty = serializers.IntegerField(
        min_value=1,
        max_value=5,
        default=2
    )
    delivery_mode = serializers.ChoiceField(
        choices=DiagnosticSession.DELIVERY_MODE_CHOICES,
        default='DEFERRED_FEEDBACK'
    )
    max_questions = serializers.IntegerField(
        min_value=1,
        max_value=10,
        default=3
    )


# Legacy serializers for backward compatibility
from .models import MindMap

class MindMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindMap
        fields = ['id', 'title', 'content', 'owner', 'created_at', 'updated_at']

class GeneratedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedContent
        fields = '__all__'
