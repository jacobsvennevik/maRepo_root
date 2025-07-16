"""
Tests for enhanced serializers with spaced repetition validation.

This module tests all the enhanced serializers including validation logic,
field handling, and data transformation for spaced repetition functionality.
"""

from datetime import datetime, timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from backend.apps.generation.serializers import (
    FlashcardSerializer,
    FlashcardSetSerializer,
    FlashcardReviewSerializer,
    ReviewSessionSerializer,
    DueCardsSerializer,
    StudyPlanSerializer,
    LearningAnalyticsSerializer,
    UpcomingReviewsSerializer,
    ScheduleOptimizationSerializer
)
from backend.apps.generation.tests.factories import FlashcardFactory, FlashcardSetFactory
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.generation.services.spaced_repetition import ReviewQuality


class TestFlashcardSerializer(TestCase):
    """Test enhanced FlashcardSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        self.flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            algorithm='sm2',
            interval=6.5,
            repetitions=3,
            memory_strength=4.2,
            ease_factor=2.7,
            leitner_box=3,
            learning_state='review',
            total_reviews=8,
            correct_reviews=6
        )
    
    def test_serialization_includes_all_fields(self):
        """Test that serialization includes all spaced repetition fields."""
        serializer = FlashcardSerializer(self.flashcard)
        data = serializer.data
        
        # Core fields
        core_fields = ['id', 'flashcard_set', 'question', 'answer', 'updated_at']
        for field in core_fields:
            self.assertIn(field, data)
        
        # Spaced repetition fields
        sr_fields = [
            'algorithm', 'interval', 'repetitions', 'memory_strength',
            'next_review', 'last_reviewed', 'ease_factor', 'leitner_box',
            'learning_state', 'total_reviews', 'correct_reviews'
        ]
        for field in sr_fields:
            self.assertIn(field, data)
        
        # Computed fields
        computed_fields = ['accuracy_rate', 'is_due', 'days_until_due']
        for field in computed_fields:
            self.assertIn(field, data)
    
    def test_computed_field_values(self):
        """Test that computed fields return correct values."""
        serializer = FlashcardSerializer(self.flashcard)
        data = serializer.data
        
        # Test accuracy rate calculation
        expected_accuracy = (6 / 8) * 100  # 75%
        self.assertEqual(data['accuracy_rate'], expected_accuracy)
        
        # Test is_due field
        self.assertIsInstance(data['is_due'], bool)
        
        # Test days_until_due field
        self.assertIsInstance(data['days_until_due'], int)
    
    def test_algorithm_validation(self):
        """Test algorithm field validation."""
        valid_data = {
            'flashcard_set': self.flashcard_set.id,
            'question': 'Test question',
            'answer': 'Test answer',
            'algorithm': 'sm2'
        }
        
        serializer = FlashcardSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test invalid algorithm
        invalid_data = valid_data.copy()
        invalid_data['algorithm'] = 'invalid_algorithm'
        
        serializer = FlashcardSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('algorithm', serializer.errors)
    
    def test_ease_factor_validation(self):
        """Test ease factor validation."""
        valid_data = {
            'flashcard_set': self.flashcard_set.id,
            'question': 'Test question',
            'answer': 'Test answer',
            'ease_factor': 2.5
        }
        
        serializer = FlashcardSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test ease factor below minimum
        invalid_data = valid_data.copy()
        invalid_data['ease_factor'] = 1.2  # Below minimum of 1.3
        
        serializer = FlashcardSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('ease_factor', serializer.errors)
    
    def test_leitner_box_validation(self):
        """Test Leitner box validation."""
        valid_data = {
            'flashcard_set': self.flashcard_set.id,
            'question': 'Test question',
            'answer': 'Test answer',
            'leitner_box': 3
        }
        
        serializer = FlashcardSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test invalid box numbers
        for invalid_box in [0, 6, -1]:
            invalid_data = valid_data.copy()
            invalid_data['leitner_box'] = invalid_box
            
            serializer = FlashcardSerializer(data=invalid_data)
            self.assertFalse(serializer.is_valid())
            self.assertIn('leitner_box', serializer.errors)
    
    def test_read_only_fields(self):
        """Test that read-only fields cannot be updated."""
        update_data = {
            'question': 'Updated question',
            'accuracy_rate': 100.0,  # Should be ignored (read-only)
            'is_due': False,         # Should be ignored (read-only)
            'days_until_due': 5      # Should be ignored (read-only)
        }
        
        serializer = FlashcardSerializer(self.flashcard, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        # Read-only fields should not be in validated_data
        self.assertNotIn('accuracy_rate', serializer.validated_data)
        self.assertNotIn('is_due', serializer.validated_data)
        self.assertNotIn('days_until_due', serializer.validated_data)


class TestFlashcardSetSerializer(TestCase):
    """Test enhanced FlashcardSetSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        
        # Create flashcards with different states
        for i in range(5):
            FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state='new' if i < 2 else 'review',
                total_reviews=i,
                correct_reviews=max(0, i-1),
                next_review=timezone.now() + timedelta(days=i-2)
            )
    
    def test_statistics_calculation(self):
        """Test that statistics are calculated correctly."""
        serializer = FlashcardSetSerializer(self.flashcard_set)
        data = serializer.data
        
        # Check statistics fields
        stats_fields = [
            'total_cards', 'due_cards', 'learning_cards',
            'review_cards', 'new_cards', 'average_accuracy'
        ]
        for field in stats_fields:
            self.assertIn(field, data)
        
        # Verify values
        self.assertEqual(data['total_cards'], 5)
        self.assertEqual(data['new_cards'], 2)
        self.assertEqual(data['review_cards'], 3)
        
        # Average accuracy should be calculated
        self.assertIsInstance(data['average_accuracy'], float)
        self.assertGreaterEqual(data['average_accuracy'], 0.0)
        self.assertLessEqual(data['average_accuracy'], 100.0)
    
    def test_nested_flashcards(self):
        """Test nested flashcard serialization."""
        serializer = FlashcardSetSerializer(self.flashcard_set)
        data = serializer.data
        
        self.assertIn('flashcards', data)
        self.assertEqual(len(data['flashcards']), 5)
        
        # Each flashcard should have spaced repetition fields
        for card_data in data['flashcards']:
            self.assertIn('algorithm', card_data)
            self.assertIn('learning_state', card_data)
            self.assertIn('accuracy_rate', card_data)


class TestFlashcardReviewSerializer(TestCase):
    """Test FlashcardReviewSerializer."""
    
    def test_valid_review_data(self):
        """Test validation of valid review data."""
        valid_data = {
            'flashcard_id': 1,
            'quality': ReviewQuality.PERFECT,
            'response_time_seconds': 15.5
        }
        
        serializer = FlashcardReviewSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test without response time (optional)
        valid_data_no_time = {
            'flashcard_id': 1,
            'quality': ReviewQuality.CORRECT_DIFFICULT
        }
        
        serializer = FlashcardReviewSerializer(data=valid_data_no_time)
        self.assertTrue(serializer.is_valid())
    
    def test_quality_validation(self):
        """Test quality score validation."""
        # Test valid quality scores
        for quality in range(6):  # 0-5
            data = {'flashcard_id': 1, 'quality': quality}
            serializer = FlashcardReviewSerializer(data=data)
            self.assertTrue(serializer.is_valid(), f"Quality {quality} should be valid")
        
        # Test invalid quality scores
        for invalid_quality in [-1, 6, 10]:
            data = {'flashcard_id': 1, 'quality': invalid_quality}
            serializer = FlashcardReviewSerializer(data=data)
            self.assertFalse(serializer.is_valid())
            self.assertIn('quality', serializer.errors)
    
    def test_response_time_validation(self):
        """Test response time validation."""
        # Test valid response times
        valid_data = {
            'flashcard_id': 1,
            'quality': 3,
            'response_time_seconds': 30.0
        }
        
        serializer = FlashcardReviewSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test negative response time
        invalid_data = valid_data.copy()
        invalid_data['response_time_seconds'] = -5.0
        
        serializer = FlashcardReviewSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('response_time_seconds', serializer.errors)


class TestParameterSerializers(TestCase):
    """Test parameter serializers for API endpoints."""
    
    def test_review_session_serializer(self):
        """Test ReviewSessionSerializer validation."""
        # Test valid data
        valid_data = {'session_limit': 20}
        serializer = ReviewSessionSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test invalid limits
        for invalid_limit in [0, 101, -5]:
            invalid_data = {'session_limit': invalid_limit}
            serializer = ReviewSessionSerializer(data=invalid_data)
            self.assertFalse(serializer.is_valid())
    
    def test_due_cards_serializer(self):
        """Test DueCardsSerializer validation."""
        # Test valid data
        valid_data = {
            'limit': 15,
            'algorithm': 'sm2',
            'learning_state': 'review'
        }
        serializer = DueCardsSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test invalid algorithm
        invalid_data = valid_data.copy()
        invalid_data['algorithm'] = 'invalid'
        serializer = DueCardsSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        
        # Test invalid learning state
        invalid_data = valid_data.copy()
        invalid_data['learning_state'] = 'invalid_state'
        serializer = DueCardsSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
    
    def test_upcoming_reviews_serializer(self):
        """Test UpcomingReviewsSerializer validation."""
        # Test valid data
        valid_data = {'days_ahead': 14}
        serializer = UpcomingReviewsSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test boundary values
        for valid_days in [1, 30]:
            data = {'days_ahead': valid_days}
            serializer = UpcomingReviewsSerializer(data=data)
            self.assertTrue(serializer.is_valid())
        
        # Test invalid values
        for invalid_days in [0, 31, -1]:
            data = {'days_ahead': invalid_days}
            serializer = UpcomingReviewsSerializer(data=data)
            self.assertFalse(serializer.is_valid())
    
    def test_study_plan_serializer(self):
        """Test StudyPlanSerializer validation."""
        # Test valid data
        valid_data = {'available_time_minutes': 30}
        serializer = StudyPlanSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test boundary values
        for valid_time in [1, 240]:
            data = {'available_time_minutes': valid_time}
            serializer = StudyPlanSerializer(data=data)
            self.assertTrue(serializer.is_valid())
        
        # Test invalid values
        for invalid_time in [0, 241, -10]:
            data = {'available_time_minutes': invalid_time}
            serializer = StudyPlanSerializer(data=data)
            self.assertFalse(serializer.is_valid())
    
    def test_learning_analytics_serializer(self):
        """Test LearningAnalyticsSerializer validation."""
        # Test valid data
        valid_data = {'timeframe_days': 90}
        serializer = LearningAnalyticsSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test boundary values
        for valid_days in [1, 365]:
            data = {'timeframe_days': valid_days}
            serializer = LearningAnalyticsSerializer(data=data)
            self.assertTrue(serializer.is_valid())
        
        # Test invalid values
        for invalid_days in [0, 366, -5]:
            data = {'timeframe_days': invalid_days}
            serializer = LearningAnalyticsSerializer(data=data)
            self.assertFalse(serializer.is_valid())
    
    def test_schedule_optimization_serializer(self):
        """Test ScheduleOptimizationSerializer validation."""
        # Test valid data
        valid_data = {'target_daily_reviews': 25}
        serializer = ScheduleOptimizationSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        
        # Test boundary values
        for valid_target in [1, 100]:
            data = {'target_daily_reviews': valid_target}
            serializer = ScheduleOptimizationSerializer(data=data)
            self.assertTrue(serializer.is_valid())
        
        # Test invalid values
        for invalid_target in [0, 101, -1]:
            data = {'target_daily_reviews': invalid_target}
            serializer = ScheduleOptimizationSerializer(data=data)
            self.assertFalse(serializer.is_valid())


class TestSerializerDataHandling(TestCase):
    """Test data handling and transformation in serializers."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
    
    def test_datetime_field_handling(self):
        """Test proper datetime field serialization/deserialization."""
        specific_time = timezone.now() + timedelta(days=3, hours=2, minutes=30)
        
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=specific_time,
            last_reviewed=specific_time - timedelta(days=1)
        )
        
        serializer = FlashcardSerializer(flashcard)
        data = serializer.data
        
        # Check that datetime fields are properly serialized
        self.assertIn('next_review', data)
        self.assertIn('last_reviewed', data)
        
        # Should be in ISO format
        self.assertIsInstance(data['next_review'], str)
        self.assertIsInstance(data['last_reviewed'], str)
    
    def test_float_field_precision(self):
        """Test floating point field precision."""
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            interval=6.123456789,
            ease_factor=2.678901234,
            memory_strength=4.987654321
        )
        
        serializer = FlashcardSerializer(flashcard)
        data = serializer.data
        
        # Check that float values are preserved with reasonable precision
        self.assertAlmostEqual(data['interval'], 6.123456789, places=6)
        self.assertAlmostEqual(data['ease_factor'], 2.678901234, places=6)
        self.assertAlmostEqual(data['memory_strength'], 4.987654321, places=6)
    
    def test_null_field_handling(self):
        """Test handling of null/optional fields."""
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            last_reviewed=None  # This should be None for new cards
        )
        
        serializer = FlashcardSerializer(flashcard)
        data = serializer.data
        
        # last_reviewed should be None/null
        self.assertIsNone(data['last_reviewed'])
    
    def test_choice_field_validation(self):
        """Test choice field validation and serialization."""
        for algorithm in ['leitner', 'sm2']:
            flashcard = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                algorithm=algorithm
            )
            
            serializer = FlashcardSerializer(flashcard)
            data = serializer.data
            self.assertEqual(data['algorithm'], algorithm)
        
        for learning_state in ['new', 'learning', 'review', 'relearning']:
            flashcard = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state=learning_state
            )
            
            serializer = FlashcardSerializer(flashcard)
            data = serializer.data
            self.assertEqual(data['learning_state'], learning_state)


class TestSerializerPerformance(TestCase):
    """Test serializer performance with larger datasets."""
    
    def setUp(self):
        """Set up larger test dataset."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        
        # Create many flashcards
        self.flashcards = []
        for i in range(50):
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                total_reviews=i + 1,
                correct_reviews=i // 2
            )
            self.flashcards.append(card)
    
    def test_bulk_serialization_performance(self):
        """Test performance of serializing many flashcards."""
        # This should complete reasonably quickly
        serializer = FlashcardSerializer(self.flashcards, many=True)
        data = serializer.data
        
        self.assertEqual(len(data), 50)
        
        # Each item should have all expected fields
        for item in data:
            self.assertIn('algorithm', item)
            self.assertIn('accuracy_rate', item)
            self.assertIn('learning_state', item)
    
    def test_flashcard_set_with_many_cards(self):
        """Test FlashcardSetSerializer with many nested cards."""
        serializer = FlashcardSetSerializer(self.flashcard_set)
        data = serializer.data
        
        # Should include all cards and statistics
        self.assertEqual(data['total_cards'], 50)
        self.assertEqual(len(data['flashcards']), 50)
        
        # Statistics should be calculated correctly
        self.assertIsInstance(data['average_accuracy'], float)


class TestSerializerErrorHandling(TestCase):
    """Test error handling and validation messages."""
    
    def test_validation_error_messages(self):
        """Test that validation errors have helpful messages."""
        # Test ease factor validation message
        data = {
            'flashcard_set': 1,
            'question': 'Test',
            'answer': 'Test',
            'ease_factor': 1.0  # Too low
        }
        
        serializer = FlashcardSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        
        error_message = str(serializer.errors['ease_factor'][0])
        self.assertIn('1.3', error_message)  # Should mention minimum value
    
    def test_multiple_validation_errors(self):
        """Test handling of multiple validation errors."""
        data = {
            'flashcard_set': 1,
            'question': 'Test',
            'answer': 'Test',
            'algorithm': 'invalid_algorithm',
            'ease_factor': 1.0,
            'leitner_box': 10
        }
        
        serializer = FlashcardSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        
        # Should have multiple error fields
        self.assertIn('algorithm', serializer.errors)
        self.assertIn('ease_factor', serializer.errors)
        self.assertIn('leitner_box', serializer.errors)
    
    def test_partial_update_validation(self):
        """Test validation during partial updates."""
        user = CustomUserFactory()
        flashcard_set = FlashcardSetFactory(owner=user)
        flashcard = FlashcardFactory(flashcard_set=flashcard_set)
        
        # Partial update with invalid data
        partial_data = {
            'algorithm': 'invalid',
            'ease_factor': 0.5
        }
        
        serializer = FlashcardSerializer(
            flashcard, 
            data=partial_data, 
            partial=True
        )
        self.assertFalse(serializer.is_valid())
        
        # Should validate only the provided fields
        self.assertIn('algorithm', serializer.errors)
        self.assertIn('ease_factor', serializer.errors)
        
        # Valid partial update should work
        valid_partial_data = {
            'interval': 10.0,
            'repetitions': 5
        }
        
        serializer = FlashcardSerializer(
            flashcard,
            data=valid_partial_data,
            partial=True
        )
        self.assertTrue(serializer.is_valid()) 