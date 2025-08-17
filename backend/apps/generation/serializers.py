# backend/apps/generation/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import FlashcardSet, Flashcard, GeneratedContent

class FlashcardSerializer(serializers.ModelSerializer):
    """Flashcard serializer with only model fields for schema generation."""
    
    class Meta:
        model = Flashcard
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']
    



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
