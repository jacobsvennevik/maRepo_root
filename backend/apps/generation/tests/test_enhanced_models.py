"""
Tests for enhanced Flashcard model with spaced repetition fields.

This module tests the Flashcard model enhancements including new fields,
properties, and methods added for spaced repetition functionality.
"""

from datetime import datetime, timedelta
from django.test import TestCase
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from backend.apps.generation.models import Flashcard, FlashcardSet
from backend.apps.generation.tests.factories import FlashcardFactory, FlashcardSetFactory
from backend.apps.accounts.tests.factories import CustomUserFactory


class TestFlashcardModelEnhancements(TestCase):
    """Test enhanced Flashcard model functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
    
    def test_flashcard_creation_with_defaults(self):
        """Test that flashcards are created with proper default values."""
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            question="What is Python?",
            answer="A programming language"
        )
        
        # Check default spaced repetition values
        self.assertEqual(flashcard.algorithm, 'sm2')  # Default algorithm
        self.assertEqual(flashcard.interval, 1.0)     # Default interval
        self.assertEqual(flashcard.repetitions, 0)    # Default repetitions
        self.assertEqual(flashcard.memory_strength, 1.0)  # Default memory strength
        self.assertEqual(flashcard.ease_factor, 2.5)  # Default ease factor
        self.assertEqual(flashcard.leitner_box, 1)    # Default Leitner box
        self.assertEqual(flashcard.learning_state, 'new')  # Default learning state
        self.assertEqual(flashcard.total_reviews, 0)  # Default total reviews
        self.assertEqual(flashcard.correct_reviews, 0)  # Default correct reviews
        
        # Check that next_review is set to current time by default
        time_diff = abs((flashcard.next_review - timezone.now()).total_seconds())
        self.assertLess(time_diff, 60)  # Should be within 1 minute of creation
        
        # Check that last_reviewed is None initially
        self.assertIsNone(flashcard.last_reviewed)
    
    def test_algorithm_choices(self):
        """Test that algorithm field accepts valid choices."""
        # Test valid algorithms
        for algorithm in ['leitner', 'sm2']:
            flashcard = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                algorithm=algorithm
            )
            self.assertEqual(flashcard.algorithm, algorithm)
    
    def test_learning_state_choices(self):
        """Test that learning_state field accepts valid choices."""
        valid_states = ['new', 'learning', 'review', 'relearning']
        
        for state in valid_states:
            flashcard = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state=state
            )
            self.assertEqual(flashcard.learning_state, state)
    
    def test_accuracy_rate_property(self):
        """Test accuracy_rate property calculation."""
        # Test with no reviews
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            total_reviews=0,
            correct_reviews=0
        )
        self.assertEqual(flashcard.accuracy_rate, 0.0)
        
        # Test with some reviews
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            total_reviews=10,
            correct_reviews=8
        )
        self.assertEqual(flashcard.accuracy_rate, 80.0)
        
        # Test with perfect accuracy
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            total_reviews=5,
            correct_reviews=5
        )
        self.assertEqual(flashcard.accuracy_rate, 100.0)
    
    def test_is_due_property(self):
        """Test is_due property."""
        # Test card that is due (past due date)
        past_time = timezone.now() - timedelta(hours=1)
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=past_time
        )
        self.assertTrue(flashcard.is_due)
        
        # Test card that is not yet due (future due date)
        future_time = timezone.now() + timedelta(hours=1)
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=future_time
        )
        self.assertFalse(flashcard.is_due)
        
        # Test card due exactly now
        now = timezone.now()
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=now
        )
        self.assertTrue(flashcard.is_due)
    
    def test_days_until_due_property(self):
        """Test days_until_due property."""
        # Test card due in 3 days
        future_time = timezone.now() + timedelta(days=3, hours=2)
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=future_time
        )
        self.assertEqual(flashcard.days_until_due, 3)
        
        # Test overdue card (negative days)
        past_time = timezone.now() - timedelta(days=2)
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=past_time
        )
        self.assertEqual(flashcard.days_until_due, -2)
        
        # Test card due today
        today = timezone.now().replace(hour=23, minute=59)
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=today
        )
        self.assertEqual(flashcard.days_until_due, 0)
    
    def test_reset_to_new_method(self):
        """Test reset_to_new method."""
        # Create a card with advanced state
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            learning_state='review',
            repetitions=5,
            interval=15.0,
            leitner_box=4,
            ease_factor=2.8,
            memory_strength=8.0,
            next_review=timezone.now() + timedelta(days=15)
        )
        
        # Reset the card
        flashcard.reset_to_new()
        
        # Check that all fields are reset to new state
        self.assertEqual(flashcard.learning_state, 'new')
        self.assertEqual(flashcard.repetitions, 0)
        self.assertEqual(flashcard.interval, 1.0)
        self.assertEqual(flashcard.leitner_box, 1)
        self.assertEqual(flashcard.ease_factor, 2.5)
        self.assertEqual(flashcard.memory_strength, 1.0)
        
        # Check that next_review is set to current time
        time_diff = abs((flashcard.next_review - timezone.now()).total_seconds())
        self.assertLess(time_diff, 5)  # Should be very recent
    
    def test_string_representation(self):
        """Test __str__ method includes due date."""
        due_date = timezone.now() + timedelta(days=3)
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            question="What is Django?",
            next_review=due_date
        )
        
        str_repr = str(flashcard)
        
        # Should include truncated question
        self.assertIn("What is Django?", str_repr)
        
        # Should include due date
        expected_date = due_date.strftime('%Y-%m-%d')
        self.assertIn(expected_date, str_repr)
    
    def test_field_constraints(self):
        """Test field constraints and validation."""
        flashcard = FlashcardFactory(flashcard_set=self.flashcard_set)
        
        # Test interval constraints (should be positive)
        flashcard.interval = -1.0
        # Note: This would require model validation to be enforced
        
        # Test ease factor constraints (should be >= 1.3 for SM-2)
        flashcard.ease_factor = 1.2
        # Note: This validation is handled in serializers
        
        # Test leitner box constraints (should be 1-5)
        flashcard.leitner_box = 6
        # Note: This validation is handled in serializers
        
        # Test that total_reviews >= correct_reviews
        flashcard.total_reviews = 5
        flashcard.correct_reviews = 7  # Invalid: more correct than total
        # Note: This business logic validation could be added


class TestFlashcardModelRelationships(TestCase):
    """Test Flashcard model relationships and cascading."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
    
    def test_flashcard_belongs_to_set(self):
        """Test that flashcards properly belong to flashcard sets."""
        flashcard = FlashcardFactory(flashcard_set=self.flashcard_set)
        
        self.assertEqual(flashcard.flashcard_set, self.flashcard_set)
        self.assertIn(flashcard, self.flashcard_set.flashcards.all())
    
    def test_flashcard_deletion_cascade(self):
        """Test that deleting flashcard set deletes flashcards."""
        flashcard1 = FlashcardFactory(flashcard_set=self.flashcard_set)
        flashcard2 = FlashcardFactory(flashcard_set=self.flashcard_set)
        
        flashcard_ids = [flashcard1.id, flashcard2.id]
        
        # Delete the flashcard set
        self.flashcard_set.delete()
        
        # Check that flashcards are also deleted
        for flashcard_id in flashcard_ids:
            with self.assertRaises(Flashcard.DoesNotExist):
                Flashcard.objects.get(id=flashcard_id)
    
    def test_flashcard_set_owner_access(self):
        """Test accessing flashcard set owner through flashcard."""
        flashcard = FlashcardFactory(flashcard_set=self.flashcard_set)
        
        self.assertEqual(flashcard.flashcard_set.owner, self.user)


class TestFlashcardModelQuerysets(TestCase):
    """Test custom querysets and filtering for enhanced model."""
    
    def setUp(self):
        """Set up test data with various card states."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        
        # Create cards in different states
        self.new_cards = []
        self.learning_cards = []
        self.review_cards = []
        self.due_cards = []
        
        # New cards
        for i in range(3):
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state='new',
                next_review=timezone.now()
            )
            self.new_cards.append(card)
            self.due_cards.append(card)
        
        # Learning cards
        for i in range(2):
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state='learning',
                next_review=timezone.now() + timedelta(days=i)
            )
            self.learning_cards.append(card)
            if i == 0:  # First one is due
                self.due_cards.append(card)
        
        # Review cards (some due, some not)
        for i in range(4):
            due_date = timezone.now() + timedelta(days=i-1)  # One overdue, rest future
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state='review',
                next_review=due_date
            )
            self.review_cards.append(card)
            if i <= 1:  # First two are due
                self.due_cards.append(card)
    
    def test_filter_by_learning_state(self):
        """Test filtering cards by learning state."""
        new_cards = Flashcard.objects.filter(learning_state='new')
        learning_cards = Flashcard.objects.filter(learning_state='learning')
        review_cards = Flashcard.objects.filter(learning_state='review')
        
        self.assertEqual(new_cards.count(), 3)
        self.assertEqual(learning_cards.count(), 2)
        self.assertEqual(review_cards.count(), 4)
    
    def test_filter_by_algorithm(self):
        """Test filtering cards by algorithm."""
        # All cards should be SM-2 by default
        sm2_cards = Flashcard.objects.filter(algorithm='sm2')
        self.assertEqual(sm2_cards.count(), 9)  # 3+2+4
        
        # Create some Leitner cards
        leitner_cards = []
        for i in range(2):
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                algorithm='leitner'
            )
            leitner_cards.append(card)
        
        leitner_filtered = Flashcard.objects.filter(algorithm='leitner')
        self.assertEqual(leitner_filtered.count(), 2)
    
    def test_filter_due_cards(self):
        """Test filtering cards that are due for review."""
        due_cards = Flashcard.objects.filter(next_review__lte=timezone.now())
        
        # Should include: 3 new + 1 learning + 2 review = 6 cards
        self.assertEqual(due_cards.count(), len(self.due_cards))
    
    def test_filter_overdue_cards(self):
        """Test filtering cards that are overdue."""
        overdue_cards = Flashcard.objects.filter(
            next_review__lt=timezone.now() - timedelta(hours=1)
        )
        
        # Should include: 1 review card that's overdue
        self.assertEqual(overdue_cards.count(), 1)
    
    def test_order_by_next_review(self):
        """Test ordering cards by next review date."""
        cards_by_due_date = Flashcard.objects.order_by('next_review')
        
        # First card should be the overdue one
        first_card = cards_by_due_date.first()
        self.assertEqual(first_card.learning_state, 'review')
        self.assertTrue(first_card.next_review < timezone.now())
    
    def test_filter_by_accuracy_range(self):
        """Test filtering cards by accuracy rate."""
        # Create cards with different accuracy rates
        high_accuracy_card = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            total_reviews=10,
            correct_reviews=9  # 90% accuracy
        )
        
        low_accuracy_card = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            total_reviews=10,
            correct_reviews=3  # 30% accuracy
        )
        
        # Note: This would require custom queryset methods or annotations
        # For now, we test the property calculation
        self.assertEqual(high_accuracy_card.accuracy_rate, 90.0)
        self.assertEqual(low_accuracy_card.accuracy_rate, 30.0)
    
    def test_complex_filtering(self):
        """Test complex filtering combinations."""
        # Find due review cards using SM-2 algorithm
        complex_filter = Flashcard.objects.filter(
            learning_state='review',
            algorithm='sm2',
            next_review__lte=timezone.now()
        )
        
        # Should include the due review cards
        self.assertEqual(complex_filter.count(), 2)


class TestFlashcardModelEdgeCases(TestCase):
    """Test edge cases and error conditions."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
    
    def test_extreme_interval_values(self):
        """Test handling of extreme interval values."""
        # Very small interval
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            interval=0.001
        )
        self.assertEqual(flashcard.interval, 0.001)
        
        # Very large interval
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            interval=365.0 * 10  # 10 years
        )
        self.assertEqual(flashcard.interval, 3650.0)
    
    def test_extreme_repetition_values(self):
        """Test handling of extreme repetition values."""
        # Many repetitions
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            repetitions=1000
        )
        self.assertEqual(flashcard.repetitions, 1000)
    
    def test_timezone_handling(self):
        """Test proper timezone handling for datetime fields."""
        # Create card with specific timezone-aware datetime
        specific_time = timezone.make_aware(
            datetime(2025, 6, 15, 10, 30, 0)
        )
        
        flashcard = FlashcardFactory(
            flashcard_set=self.flashcard_set,
            next_review=specific_time,
            last_reviewed=specific_time - timedelta(days=1)
        )
        
        # Check that timezone information is preserved
        self.assertEqual(flashcard.next_review, specific_time)
        self.assertIsNotNone(flashcard.next_review.tzinfo)
        self.assertIsNotNone(flashcard.last_reviewed.tzinfo)
    
    def test_concurrent_modifications(self):
        """Test handling of concurrent modifications."""
        flashcard = FlashcardFactory(flashcard_set=self.flashcard_set)
        
        # Simulate concurrent update
        flashcard1 = Flashcard.objects.get(id=flashcard.id)
        flashcard2 = Flashcard.objects.get(id=flashcard.id)
        
        flashcard1.repetitions = 5
        flashcard1.save()
        
        flashcard2.interval = 10.0
        flashcard2.save()
        
        # Last save wins (Django's default behavior)
        flashcard.refresh_from_db()
        self.assertEqual(flashcard.interval, 10.0)
        # Note: repetitions change might be lost depending on save order
    
    def test_bulk_operations(self):
        """Test bulk operations on enhanced model."""
        # Create multiple flashcards
        flashcards = []
        for i in range(10):
            card = FlashcardFactory(flashcard_set=self.flashcard_set)
            flashcards.append(card)
        
        # Bulk update
        Flashcard.objects.filter(
            flashcard_set=self.flashcard_set
        ).update(
            learning_state='review',
            interval=7.0
        )
        
        # Verify bulk update worked
        updated_cards = Flashcard.objects.filter(flashcard_set=self.flashcard_set)
        for card in updated_cards:
            self.assertEqual(card.learning_state, 'review')
            self.assertEqual(card.interval, 7.0) 