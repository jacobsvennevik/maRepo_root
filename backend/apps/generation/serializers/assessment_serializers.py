# Assessment Serializers - Generalized for multiple assessment types
from rest_framework import serializers
from ..models.assessment_models import AssessmentSet, AssessmentItem, AssessmentAttempt, FlashcardSet, Flashcard


class AssessmentSetSerializer(serializers.ModelSerializer):
    """Serializer for AssessmentSet with computed statistics."""
    
    # Computed fields
    total_items = serializers.SerializerMethodField()
    due_items = serializers.SerializerMethodField()
    learning_items = serializers.SerializerMethodField()
    review_items = serializers.SerializerMethodField()
    new_items = serializers.SerializerMethodField()
    average_accuracy = serializers.SerializerMethodField()
    
    # Item relationships
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = AssessmentSet
        fields = [
            'id', 'title', 'description', 'kind', 'document', 'owner',
            'learning_objectives', 'themes', 'difficulty_level', 'target_audience',
            'estimated_study_time', 'tags', 'assessment_config',
            'created_at', 'updated_at',
            # Computed fields
            'total_items', 'due_items', 'learning_items', 'review_items', 
            'new_items', 'average_accuracy',
            # Relationships
            'items'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_total_items(self, obj):
        return obj.items.filter(is_active=True).count()
    
    def get_due_items(self, obj):
        from django.utils import timezone
        return obj.items.filter(
            is_active=True,
            next_review__lte=timezone.now()
        ).count()
    
    def get_learning_items(self, obj):
        return obj.items.filter(
            is_active=True,
            learning_state='learning'
        ).count()
    
    def get_review_items(self, obj):
        return obj.items.filter(
            is_active=True,
            learning_state='review'
        ).count()
    
    def get_new_items(self, obj):
        return obj.items.filter(
            is_active=True,
            learning_state='new'
        ).count()
    
    def get_average_accuracy(self, obj):
        items = obj.items.filter(is_active=True)
        if not items:
            return 0.0
        
        total_accuracy = sum(item.retention_rate for item in items)
        return round(total_accuracy / items.count(), 1)
    
    def get_items(self, obj):
        """Return items if explicitly requested."""
        request = self.context.get('request')
        if request and request.query_params.get('include_items') == 'true':
            return AssessmentItemSerializer(obj.items.filter(is_active=True), many=True).data
        return []


class AssessmentItemSerializer(serializers.ModelSerializer):
    """Serializer for AssessmentItem with type-specific handling."""
    
    # Computed fields
    retention_rate = serializers.ReadOnlyField()
    is_due = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()
    
    # For backward compatibility
    flashcard_set = serializers.ReadOnlyField(source='assessment_set')
    flashcard_set_id = serializers.ReadOnlyField(source='assessment_set_id')
    
    class Meta:
        model = AssessmentItem
        fields = [
            'id', 'assessment_set', 'item_type', 'order_index', 'is_active',
            'question', 'answer', 'choices', 'correct_index', 'explanation',
            'difficulty', 'bloom_level', 'concept_id', 'theme', 'related_concepts',
            'hints', 'examples', 'common_misconceptions', 'learning_objective',
            'created_at', 'updated_at',
            # Spaced repetition fields
            'algorithm', 'learning_state', 'interval', 'repetitions', 'ease_factor',
            'leitner_box', 'next_review', 'last_reviewed', 'total_reviews', 'correct_reviews',
            # Computed fields
            'retention_rate', 'is_due', 'is_overdue', 'days_until_due',
            # Backward compatibility
            'flashcard_set', 'flashcard_set_id'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'retention_rate', 'is_due', 
            'is_overdue', 'days_until_due', 'flashcard_set', 'flashcard_set_id'
        ]
    
    def validate(self, data):
        """Validate item type-specific requirements."""
        item_type = data.get('item_type')
        
        if item_type == 'MCQ':
            choices = data.get('choices', [])
            correct_index = data.get('correct_index')
            
            if not choices or len(choices) < 2:
                raise serializers.ValidationError("MCQ items must have at least 2 choices.")
            
            if correct_index is None or correct_index >= len(choices):
                raise serializers.ValidationError("MCQ items must have a valid correct_index.")
        
        return data


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    """Serializer for AssessmentAttempt with polymorphic payload handling."""
    
    class Meta:
        model = AssessmentAttempt
        fields = [
            'id', 'user', 'assessment_item', 'attempt_type', 'created_at',
            'response_time_ms', 'payload', 'quality', 'selected_index', 
            'is_correct', 'confidence', 'notes', 'session_id'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def validate(self, data):
        """Validate attempt data based on item type."""
        assessment_item = data.get('assessment_item')
        attempt_type = data.get('attempt_type')
        
        if assessment_item.item_type == 'FLASHCARD' and attempt_type == 'SPACED_REPETITION':
            quality = data.get('quality')
            if quality is None or not (0 <= quality <= 5):
                raise serializers.ValidationError("Flashcard spaced repetition requires quality rating 0-5.")
        
        elif assessment_item.item_type == 'MCQ' and attempt_type == 'QUIZ':
            selected_index = data.get('selected_index')
            if selected_index is None:
                raise serializers.ValidationError("MCQ quiz attempts require selected_index.")
            
            choices = assessment_item.choices
            if selected_index >= len(choices):
                raise serializers.ValidationError("Selected index must be within valid choice range.")
        
        return data


# Backward compatibility serializers
class FlashcardSetSerializer(AssessmentSetSerializer):
    """Backward compatibility serializer for FlashcardSet."""
    class Meta(AssessmentSetSerializer.Meta):
        model = FlashcardSet


class FlashcardSerializer(AssessmentItemSerializer):
    """Backward compatibility serializer for Flashcard."""
    class Meta(AssessmentItemSerializer.Meta):
        model = Flashcard


# Review/Attempt serializers for backward compatibility
class FlashcardReviewSerializer(serializers.Serializer):
    """Serializer for flashcard review submissions."""
    quality = serializers.IntegerField(min_value=0, max_value=5)
    response_time_seconds = serializers.FloatField(required=False, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True)


class IndividualFlashcardReviewSerializer(serializers.Serializer):
    """Serializer for individual flashcard review."""
    quality = serializers.IntegerField(min_value=0, max_value=5)
    response_time_seconds = serializers.FloatField(required=False, min_value=0)
    notes = serializers.CharField(required=False, allow_blank=True)


class MCQAttemptSerializer(serializers.Serializer):
    """Serializer for MCQ attempt submissions."""
    selected_index = serializers.IntegerField(min_value=0)
    response_time_ms = serializers.IntegerField(required=False, min_value=0)
    confidence = serializers.FloatField(required=False, min_value=0, max_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)


# Generation request serializers
class AssessmentGenerationRequestSerializer(serializers.Serializer):
    """Serializer for assessment generation requests."""
    title = serializers.CharField(max_length=255)
    kind = serializers.ChoiceField(choices=AssessmentSet.KIND_CHOICES)
    description = serializers.CharField(required=False, allow_blank=True)
    
    # Content source
    content = serializers.CharField(required=False, allow_blank=True)
    document_id = serializers.IntegerField(required=False)
    
    # Generation parameters
    num_items = serializers.IntegerField(min_value=1, max_value=100, default=10)
    difficulty = serializers.ChoiceField(choices=AssessmentItem.DIFFICULTY_CHOICES, default='INTERMEDIATE')
    
    # MCQ-specific parameters
    choices_per_item = serializers.IntegerField(min_value=2, max_value=6, default=4)
    
    # Mixed set configuration
    assessment_config = serializers.DictField(required=False)
    
    # Mock mode
    mock_mode = serializers.BooleanField(default=False)
    
    def validate(self, data):
        """Validate generation request."""
        kind = data.get('kind')
        content = data.get('content')
        document_id = data.get('document_id')
        
        if not content and not document_id:
            raise serializers.ValidationError("Either content or document_id must be provided.")
        
        if kind == 'MIXED':
            config = data.get('assessment_config', {})
            total_percentage = sum(config.values())
            if total_percentage != 100:
                raise serializers.ValidationError("Mixed assessment config percentages must sum to 100.")
        
        return data

