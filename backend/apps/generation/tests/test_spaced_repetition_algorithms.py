"""
Tests for spaced repetition algorithms.

This module tests the core Leitner and SM-2 algorithm implementations
to ensure they follow memory science principles correctly.
"""

from datetime import datetime, timedelta
from django.test import TestCase
from django.utils import timezone
from unittest.mock import patch

from backend.apps.generation.services.spaced_repetition import (
    LeitnerAlgorithm,
    SM2Algorithm,
    SpacedRepetitionAlgorithms,
    SpacedRepetitionScheduler,
    ReviewQuality,
    LeitnerBox
)


class TestSpacedRepetitionAlgorithms(TestCase):
    """Test base spaced repetition algorithm functionality."""
    
    def test_calculate_retention_immediate(self):
        """Test retention calculation immediately after review."""
        retention = SpacedRepetitionAlgorithms.calculate_retention(0, 5.0)
        self.assertEqual(retention, 1.0)
    
    def test_calculate_retention_after_time(self):
        """Test retention calculation after time has passed."""
        # After 5 days with memory strength of 5, retention should be e^(-5/5) = e^(-1) ≈ 0.368
        retention = SpacedRepetitionAlgorithms.calculate_retention(5, 5.0)
        self.assertAlmostEqual(retention, 0.368, places=2)
    
    def test_calculate_retention_negative_time(self):
        """Test retention calculation with negative time (should return 1.0)."""
        retention = SpacedRepetitionAlgorithms.calculate_retention(-1, 5.0)
        self.assertEqual(retention, 1.0)
    
    def test_update_memory_strength_success(self):
        """Test memory strength update on successful review."""
        # Quality 5 (perfect) should strengthen memory significantly
        new_strength = SpacedRepetitionAlgorithms.update_memory_strength(2.0, 5, 3.0)
        self.assertGreater(new_strength, 2.0)
        
        # Quality 3 (correct but difficult) should strengthen memory less
        new_strength_3 = SpacedRepetitionAlgorithms.update_memory_strength(2.0, 3, 3.0)
        self.assertGreater(new_strength_3, 2.0)
        self.assertLess(new_strength_3, new_strength)
    
    def test_update_memory_strength_failure(self):
        """Test memory strength update on failed review."""
        # Quality 2 (incorrect) should weaken memory
        new_strength = SpacedRepetitionAlgorithms.update_memory_strength(2.0, 2, 3.0)
        self.assertLess(new_strength, 2.0)
        
        # Should never go below 1.0
        very_weak_strength = SpacedRepetitionAlgorithms.update_memory_strength(1.0, 0, 1.0)
        self.assertEqual(very_weak_strength, 1.0)


class TestLeitnerAlgorithm(TestCase):
    """Test Leitner algorithm implementation."""
    
    def setUp(self):
        """Set up test data."""
        self.base_card_data = {
            'leitner_box': 1,
            'repetitions': 0,
            'memory_strength': 1.0,
            'total_reviews': 0,
            'correct_reviews': 0
        }
    
    def test_successful_review_box_progression(self):
        """Test that successful reviews move cards to higher boxes."""
        updated_data = LeitnerAlgorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.PERFECT
        )
        
        self.assertEqual(updated_data['leitner_box'], 2)  # Should move from box 1 to 2
        self.assertEqual(updated_data['repetitions'], 1)
        self.assertEqual(updated_data['interval'], 3.0)  # Box 2 interval
        self.assertEqual(updated_data['learning_state'], 'learning')
        self.assertGreater(updated_data['memory_strength'], 1.0)
    
    def test_failed_review_box_reset(self):
        """Test that failed reviews reset cards to box 1."""
        card_data = self.base_card_data.copy()
        card_data['leitner_box'] = 4  # Start in high box
        card_data['repetitions'] = 5
        
        updated_data = LeitnerAlgorithm.calculate_next_review(
            card_data, ReviewQuality.COMPLETE_BLACKOUT
        )
        
        self.assertEqual(updated_data['leitner_box'], 1)  # Reset to box 1
        self.assertEqual(updated_data['repetitions'], 0)
        self.assertEqual(updated_data['interval'], 1.0)  # Box 1 interval
        self.assertEqual(updated_data['learning_state'], 'relearning')
    
    def test_box_progression_to_review_state(self):
        """Test progression from learning to review state."""
        card_data = self.base_card_data.copy()
        card_data['leitner_box'] = 2  # Start in box 2
        
        updated_data = LeitnerAlgorithm.calculate_next_review(
            card_data, ReviewQuality.CORRECT_HESITANT
        )
        
        self.assertEqual(updated_data['leitner_box'], 3)  # Move to box 3
        self.assertEqual(updated_data['learning_state'], 'review')  # Should be in review state
    
    def test_max_box_limit(self):
        """Test that cards don't go beyond box 5."""
        card_data = self.base_card_data.copy()
        card_data['leitner_box'] = 5  # Start at max box
        card_data['repetitions'] = 10
        
        updated_data = LeitnerAlgorithm.calculate_next_review(
            card_data, ReviewQuality.PERFECT
        )
        
        self.assertEqual(updated_data['leitner_box'], 5)  # Should stay at box 5
        self.assertEqual(updated_data['interval'], 30.0)  # Box 5 interval
    
    def test_review_statistics_tracking(self):
        """Test that review statistics are properly tracked."""
        updated_data = LeitnerAlgorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.PERFECT
        )
        
        self.assertEqual(updated_data['total_reviews'], 1)
        self.assertEqual(updated_data['correct_reviews'], 1)
        
        # Test failed review
        updated_data_fail = LeitnerAlgorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.INCORRECT_EASY
        )
        
        self.assertEqual(updated_data_fail['total_reviews'], 1)
        self.assertEqual(updated_data_fail['correct_reviews'], 0)


class TestSM2Algorithm(TestCase):
    """Test SM-2 algorithm implementation."""
    
    def setUp(self):
        """Set up test data."""
        self.base_card_data = {
            'ease_factor': 2.5,
            'interval': 1.0,
            'repetitions': 0,
            'memory_strength': 1.0,
            'total_reviews': 0,
            'correct_reviews': 0
        }
    
    def test_first_review_success(self):
        """Test successful first review."""
        updated_data = SM2Algorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.PERFECT
        )
        
        self.assertEqual(updated_data['interval'], 1)  # First interval is always 1
        self.assertEqual(updated_data['repetitions'], 1)
        self.assertEqual(updated_data['learning_state'], 'learning')
        self.assertGreaterEqual(updated_data['ease_factor'], 2.5)  # Should maintain or increase
    
    def test_second_review_success(self):
        """Test successful second review."""
        card_data = self.base_card_data.copy()
        card_data['repetitions'] = 1
        
        updated_data = SM2Algorithm.calculate_next_review(
            card_data, ReviewQuality.CORRECT_HESITANT
        )
        
        self.assertEqual(updated_data['interval'], 6)  # Graduation interval
        self.assertEqual(updated_data['repetitions'], 2)
        self.assertEqual(updated_data['learning_state'], 'review')
    
    def test_subsequent_reviews_interval_calculation(self):
        """Test interval calculation for subsequent reviews."""
        card_data = self.base_card_data.copy()
        card_data['repetitions'] = 2
        card_data['interval'] = 6.0
        card_data['ease_factor'] = 2.5
        
        updated_data = SM2Algorithm.calculate_next_review(
            card_data, ReviewQuality.PERFECT
        )
        
        # Interval should be previous_interval * ease_factor
        expected_interval = 6.0 * updated_data['ease_factor']
        self.assertAlmostEqual(updated_data['interval'], expected_interval, places=1)
        self.assertEqual(updated_data['repetitions'], 3)
    
    def test_failed_review_reset(self):
        """Test that failed reviews reset the card."""
        card_data = self.base_card_data.copy()
        card_data['repetitions'] = 5
        card_data['interval'] = 15.0
        
        updated_data = SM2Algorithm.calculate_next_review(
            card_data, ReviewQuality.COMPLETE_BLACKOUT
        )
        
        self.assertEqual(updated_data['interval'], 1)  # Reset to 1 day
        self.assertEqual(updated_data['repetitions'], 0)  # Reset repetitions
        self.assertEqual(updated_data['learning_state'], 'relearning')
    
    def test_ease_factor_updates(self):
        """Test ease factor updates based on quality."""
        # Test quality 5 (perfect) - should increase ease factor
        updated_data_perfect = SM2Algorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.PERFECT
        )
        self.assertGreater(updated_data_perfect['ease_factor'], 2.5)
        
        # Test quality 3 (difficult) - should maintain or slightly decrease ease factor
        updated_data_difficult = SM2Algorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.CORRECT_DIFFICULT
        )
        self.assertLessEqual(updated_data_difficult['ease_factor'], 2.5)
        
        # Test quality 1 (incorrect) - should decrease ease factor significantly
        updated_data_incorrect = SM2Algorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.INCORRECT_EASY
        )
        self.assertLess(updated_data_incorrect['ease_factor'], 2.5)
    
    def test_ease_factor_minimum_limit(self):
        """Test that ease factor doesn't go below minimum."""
        card_data = self.base_card_data.copy()
        card_data['ease_factor'] = 1.3  # At minimum
        
        updated_data = SM2Algorithm.calculate_next_review(
            card_data, ReviewQuality.COMPLETE_BLACKOUT
        )
        
        self.assertGreaterEqual(updated_data['ease_factor'], 1.3)  # Should not go below minimum
    
    def test_memory_strength_updates(self):
        """Test memory strength updates in SM-2."""
        # Successful review should increase memory strength
        updated_data = SM2Algorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.PERFECT
        )
        self.assertGreater(updated_data['memory_strength'], 1.0)
        
        # Failed review should decrease memory strength
        updated_data_fail = SM2Algorithm.calculate_next_review(
            self.base_card_data, ReviewQuality.COMPLETE_BLACKOUT
        )
        self.assertLessEqual(updated_data_fail['memory_strength'], 1.0)


class TestSpacedRepetitionScheduler(TestCase):
    """Test the main scheduler that orchestrates algorithms."""
    
    def setUp(self):
        """Set up test data."""
        self.scheduler = SpacedRepetitionScheduler()
    
    def test_algorithm_selection(self):
        """Test that the scheduler correctly selects algorithms."""
        # Test that Leitner algorithm is available
        self.assertIn('leitner', self.scheduler.algorithms)
        self.assertEqual(self.scheduler.algorithms['leitner'], LeitnerAlgorithm)
        
        # Test that SM-2 algorithm is available
        self.assertIn('sm2', self.scheduler.algorithms)
        self.assertEqual(self.scheduler.algorithms['sm2'], SM2Algorithm)
    
    def test_unknown_algorithm_error(self):
        """Test error handling for unknown algorithms."""
        from unittest.mock import Mock
        
        mock_card = Mock()
        mock_card.algorithm = 'unknown_algorithm'
        
        with self.assertRaises(ValueError) as context:
            self.scheduler.process_review(mock_card, 3)
        
        self.assertIn('Unknown algorithm', str(context.exception))
    
    @patch('django.utils.timezone.now')
    def test_review_time_tracking(self, mock_now):
        """Test that review times are properly tracked."""
        from unittest.mock import Mock
        
        # Set up mock time
        mock_time = timezone.make_aware(datetime(2025, 1, 1, 12, 0, 0))
        mock_now.return_value = mock_time
        
        mock_card = Mock()
        mock_card.algorithm = 'sm2'
        mock_card.interval = 1.0
        mock_card.repetitions = 0
        mock_card.memory_strength = 1.0
        mock_card.ease_factor = 2.5
        mock_card.leitner_box = 1
        mock_card.learning_state = 'new'
        mock_card.total_reviews = 0
        mock_card.correct_reviews = 0
        
        updated_data = self.scheduler.process_review(mock_card, ReviewQuality.PERFECT)
        
        # Check that last_reviewed is set to current time
        self.assertEqual(updated_data['last_reviewed'], mock_time)
        
        # Check that next_review is in the future
        self.assertGreater(updated_data['next_review'], mock_time)


class TestReviewQualityEnum(TestCase):
    """Test the ReviewQuality enumeration."""
    
    def test_quality_values(self):
        """Test that quality values are correctly defined."""
        self.assertEqual(ReviewQuality.COMPLETE_BLACKOUT, 0)
        self.assertEqual(ReviewQuality.INCORRECT_EASY, 1)
        self.assertEqual(ReviewQuality.INCORRECT_HESITANT, 2)
        self.assertEqual(ReviewQuality.CORRECT_DIFFICULT, 3)
        self.assertEqual(ReviewQuality.CORRECT_HESITANT, 4)
        self.assertEqual(ReviewQuality.PERFECT, 5)
    
    def test_quality_comparison(self):
        """Test quality comparisons work correctly."""
        self.assertTrue(ReviewQuality.PERFECT > ReviewQuality.CORRECT_DIFFICULT)
        self.assertTrue(ReviewQuality.CORRECT_DIFFICULT >= ReviewQuality.CORRECT_DIFFICULT)
        self.assertFalse(ReviewQuality.COMPLETE_BLACKOUT >= ReviewQuality.CORRECT_DIFFICULT)


class TestLeitnerBoxEnum(TestCase):
    """Test the LeitnerBox enumeration."""
    
    def test_box_values(self):
        """Test that box values are correctly defined."""
        self.assertEqual(LeitnerBox.BOX_1, 1)
        self.assertEqual(LeitnerBox.BOX_2, 2)
        self.assertEqual(LeitnerBox.BOX_3, 3)
        self.assertEqual(LeitnerBox.BOX_4, 4)
        self.assertEqual(LeitnerBox.BOX_5, 5)
    
    def test_box_intervals(self):
        """Test that intervals are correctly mapped to boxes."""
        intervals = LeitnerAlgorithm.LEITNER_INTERVALS
        
        self.assertEqual(intervals[LeitnerBox.BOX_1], 1)  # Daily
        self.assertEqual(intervals[LeitnerBox.BOX_2], 3)  # Every 3 days
        self.assertEqual(intervals[LeitnerBox.BOX_3], 7)  # Weekly
        self.assertEqual(intervals[LeitnerBox.BOX_4], 14)  # Bi-weekly
        self.assertEqual(intervals[LeitnerBox.BOX_5], 30)  # Monthly


# Integration tests
class TestAlgorithmIntegration(TestCase):
    """Integration tests for algorithm behavior over multiple reviews."""
    
    def test_leitner_learning_progression(self):
        """Test complete learning progression through Leitner system."""
        card_data = {
            'leitner_box': 1,
            'repetitions': 0,
            'memory_strength': 1.0,
            'total_reviews': 0,
            'correct_reviews': 0
        }
        
        # Simulate 5 perfect reviews
        for i in range(5):
            card_data = LeitnerAlgorithm.calculate_next_review(card_data, ReviewQuality.PERFECT)
            
            # Check progression
            expected_box = min(i + 2, 5)  # Should progress but not exceed box 5
            self.assertEqual(card_data['leitner_box'], expected_box)
            self.assertEqual(card_data['repetitions'], i + 1)
            self.assertEqual(card_data['total_reviews'], i + 1)
            self.assertEqual(card_data['correct_reviews'], i + 1)
    
    def test_sm2_learning_progression(self):
        """Test complete learning progression through SM-2 system."""
        card_data = {
            'ease_factor': 2.5,
            'interval': 1.0,
            'repetitions': 0,
            'memory_strength': 1.0,
            'total_reviews': 0,
            'correct_reviews': 0
        }
        
        # Simulate progression through SM-2
        intervals = []
        for i in range(5):
            card_data = SM2Algorithm.calculate_next_review(card_data, ReviewQuality.PERFECT)
            intervals.append(card_data['interval'])
        
        # First review should be 1 day
        self.assertEqual(intervals[0], 1)
        
        # Second review should be 6 days (graduation)
        self.assertEqual(intervals[1], 6)
        
        # Subsequent intervals should increase
        for i in range(2, len(intervals)):
            self.assertGreater(intervals[i], intervals[i-1])
    
    def test_algorithm_recovery_after_failure(self):
        """Test algorithm behavior after failures."""
        # Start with advanced card
        card_data = {
            'ease_factor': 2.8,
            'interval': 20.0,
            'repetitions': 5,
            'memory_strength': 8.0,
            'total_reviews': 5,
            'correct_reviews': 5
        }
        
        # Simulate failure
        failed_data = SM2Algorithm.calculate_next_review(card_data, ReviewQuality.COMPLETE_BLACKOUT)
        
        # Should reset to beginning
        self.assertEqual(failed_data['interval'], 1)
        self.assertEqual(failed_data['repetitions'], 0)
        self.assertEqual(failed_data['learning_state'], 'relearning')
        
        # But ease factor should be reduced, not reset completely
        self.assertLess(failed_data['ease_factor'], card_data['ease_factor'])
        self.assertGreaterEqual(failed_data['ease_factor'], 1.3)  # Above minimum 