"""
Comprehensive tests for DifficultyDialService

This test file covers all functionality of the DifficultyDialService including:
- Difficulty application for all levels
- Weight rebalancing
- Difficulty adjustment suggestions
- Edge cases and error handling
- Performance metrics analysis
"""

import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from backend.apps.generation.services.difficulty_dial import DifficultyDialService
from backend.apps.generation.models import InterleavingSessionConfig

User = get_user_model()


class TestDifficultyDialService(TestCase):
    """Comprehensive tests for DifficultyDialService."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.config = InterleavingSessionConfig.objects.create(
            user=self.user,
            difficulty='medium',
            session_size=10,
            w_due=0.60,
            w_interleave=0.25,
            w_new=0.15
        )
    
    def test_difficulty_table_structure(self):
        """Test that the difficulty table has the correct structure."""
        table = DifficultyDialService.DIFFICULTY_TABLE
        
        # Check all difficulty levels exist
        self.assertIn('low', table)
        self.assertIn('medium', table)
        self.assertIn('high', table)
        
        # Check each level has required keys
        required_keys = ['interval_mul', 'w_new_adj', 'beta', 'hard_run_cap', 'description']
        for difficulty in table:
            for key in required_keys:
                self.assertIn(key, table[difficulty])
    
    def test_apply_difficulty_medium(self):
        """Test medium difficulty application with default values."""
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # Check interval multiplier
        self.assertEqual(result['interval_multiplier'], 1.0)
        
        # Check weights sum to 1.0
        total_weight = result['w_due'] + result['w_interleave'] + result['w_new']
        self.assertAlmostEqual(total_weight, 1.0, places=5)
        
        # Check beta and hard run cap
        self.assertEqual(result['beta'], 1.0)
        self.assertEqual(result['hard_run_cap'], 2)
        
        # Check description
        self.assertIn('difficulty_description', result)
        self.assertEqual(result['difficulty_description'], 'Balanced spacing and variety')
    
    def test_apply_difficulty_low(self):
        """Test low difficulty application."""
        self.config.difficulty = 'low'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # Check interval multiplier (should be less aggressive)
        self.assertEqual(result['interval_multiplier'], 0.8)
        
        # Check beta (should be less aggressive)
        self.assertEqual(result['beta'], 0.8)
        
        # Check hard run cap
        self.assertEqual(result['hard_run_cap'], 2)
        
        # Check description
        self.assertEqual(result['difficulty_description'], 'Easier spacing, more due items, less variety')
        
        # Check weights are rebalanced
        total_weight = result['w_due'] + result['w_interleave'] + result['w_new']
        self.assertAlmostEqual(total_weight, 1.0, places=5)
    
    def test_apply_difficulty_high(self):
        """Test high difficulty application."""
        self.config.difficulty = 'high'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # Check interval multiplier (should be more aggressive)
        self.assertEqual(result['interval_multiplier'], 1.2)
        
        # Check beta (should be more aggressive)
        self.assertEqual(result['beta'], 1.2)
        
        # Check hard run cap (should be more restrictive)
        self.assertEqual(result['hard_run_cap'], 1)
        
        # Check description
        self.assertEqual(result['difficulty_description'], 'Aggressive spacing, more variety, higher challenge')
        
        # Check weights are rebalanced
        total_weight = result['w_due'] + result['w_interleave'] + result['w_new']
        self.assertAlmostEqual(total_weight, 1.0, places=5)
    
    def test_apply_difficulty_invalid_level(self):
        """Test that invalid difficulty levels default to medium."""
        self.config.difficulty = 'invalid_level'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # Should default to medium
        self.assertEqual(result['interval_multiplier'], 1.0)
        self.assertEqual(result['beta'], 1.0)
        self.assertEqual(result['hard_run_cap'], 2)
        
        # Config should be updated to medium
        self.assertEqual(self.config.difficulty, 'medium')
    
    def test_weight_rebalancing_normal_case(self):
        """Test weight rebalancing with normal weights."""
        result = DifficultyDialService.apply_difficulty(self.config)
        
        w_due, w_interleave, w_new = result['w_due'], result['w_interleave'], result['w_new']
        
        # Weights should sum to 1.0
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0, places=5)
        
        # Individual weights should be reasonable
        self.assertGreater(w_due, 0)
        self.assertGreater(w_interleave, 0)
        self.assertGreater(w_new, 0)
    
    def test_weight_rebalancing_edge_cases(self):
        """Test weight rebalancing with edge case weights."""
        # Test with very small weights
        self.config.w_due = 0.01
        self.config.w_interleave = 0.01
        self.config.w_new = 0.01
        
        result = DifficultyDialService.apply_difficulty(self.config)
        w_due, w_interleave, w_new = result['w_due'], result['w_interleave'], result['w_new']
        
        # Weights should still sum to 1.0
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0, places=5)
        
        # Test with zero weights (should use defaults)
        self.config.w_due = 0.0
        self.config.w_interleave = 0.0
        self.config.w_new = 0.0
        
        result = DifficultyDialService.apply_difficulty(self.config)
        w_due, w_interleave, w_new = result['w_due'], result['w_interleave'], result['w_new']
        
        # Should use default weights
        self.assertAlmostEqual(w_due, 0.6, places=5)
        self.assertAlmostEqual(w_interleave, 0.25, places=5)
        self.assertAlmostEqual(w_new, 0.15, places=5)
    
    def test_weight_rebalancing_with_difficulty_adjustment(self):
        """Test that difficulty adjustments properly affect weight rebalancing."""
        # Test low difficulty (should decrease w_new)
        self.config.difficulty = 'low'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # w_new should be adjusted down
        self.assertLess(result['w_new'], 0.15)
        
        # Test high difficulty (should increase w_new)
        self.config.difficulty = 'high'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # w_new should be adjusted up
        self.assertGreater(result['w_new'], 0.15)
    
    def test_get_difficulty_info_valid_levels(self):
        """Test getting difficulty information for valid levels."""
        # Test low difficulty
        low_info = DifficultyDialService.get_difficulty_info('low')
        self.assertEqual(low_info['interval_mul'], 0.8)
        self.assertEqual(low_info['beta'], 0.8)
        self.assertEqual(low_info['hard_run_cap'], 2)
        
        # Test medium difficulty
        medium_info = DifficultyDialService.get_difficulty_info('medium')
        self.assertEqual(medium_info['interval_mul'], 1.0)
        self.assertEqual(medium_info['beta'], 1.0)
        self.assertEqual(medium_info['hard_run_cap'], 2)
        
        # Test high difficulty
        high_info = DifficultyDialService.get_difficulty_info('high')
        self.assertEqual(high_info['interval_mul'], 1.2)
        self.assertEqual(high_info['beta'], 1.2)
        self.assertEqual(high_info['hard_run_cap'], 1)
    
    def test_get_difficulty_info_invalid_level(self):
        """Test getting difficulty information for invalid levels."""
        # Should return medium difficulty info for invalid levels
        result = DifficultyDialService.get_difficulty_info('invalid_level')
        self.assertEqual(result['interval_mul'], 1.0)
        self.assertEqual(result['beta'], 1.0)
        self.assertEqual(result['hard_run_cap'], 2)
    
    def test_suggest_difficulty_adjustment_high_success_fast_response(self):
        """Test difficulty adjustment suggestion for high success rate and fast response."""
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.95, 2.0
        )
        
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'high')
        self.assertIn('too easy', suggestion['reason'])
        self.assertGreater(suggestion['confidence'], 0)
        self.assertLessEqual(suggestion['confidence'], 0.9)
    
    def test_suggest_difficulty_adjustment_low_success_slow_response(self):
        """Test difficulty adjustment suggestion for low success rate and slow response."""
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.60, 20.0
        )
        
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'low')
        self.assertIn('too hard', suggestion['reason'])
        self.assertGreater(suggestion['confidence'], 0)
        self.assertLessEqual(suggestion['confidence'], 0.9)
    
    def test_suggest_difficulty_adjustment_medium_performance(self):
        """Test that no adjustment is suggested for medium performance."""
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.80, 8.0
        )
        
        self.assertFalse(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'medium')
        self.assertIsNone(suggestion['reason'])
        self.assertEqual(suggestion['confidence'], 0.0)
    
    def test_suggest_difficulty_adjustment_boundary_cases(self):
        """Test difficulty adjustment suggestions at boundary conditions."""
        # Test at the edge of high success rate
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.90, 2.0
        )
        self.assertTrue(suggestion['should_adjust'])
        
        # Test at the edge of low success rate
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.65, 15.0
        )
        self.assertTrue(suggestion['should_adjust'])
        
        # Test at the edge of fast response
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.95, 3.0
        )
        self.assertTrue(suggestion['should_adjust'])
        
        # Test at the edge of slow response
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.60, 15.0
        )
        self.assertTrue(suggestion['should_adjust'])
    
    def test_suggest_difficulty_adjustment_already_at_extremes(self):
        """Test that difficulty adjustment suggestions respect boundaries."""
        # Test when already at high difficulty
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'high', 0.95, 2.0
        )
        self.assertFalse(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'high')
        
        # Test when already at low difficulty
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'low', 0.60, 20.0
        )
        self.assertFalse(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'low')
    
    def test_suggest_difficulty_adjustment_confidence_calculation(self):
        """Test that confidence is calculated correctly."""
        # High success rate should give high confidence
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.98, 1.0
        )
        self.assertGreater(suggestion['confidence'], 0.8)
        
        # Low success rate should give high confidence
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.50, 25.0
        )
        self.assertGreater(suggestion['confidence'], 0.8)
        
        # Medium success rate should give lower confidence
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.87, 2.5
        )
        self.assertLess(suggestion['confidence'], 0.5)
    
    def test_increase_difficulty_method(self):
        """Test the _increase_difficulty helper method."""
        self.assertEqual(DifficultyDialService._increase_difficulty('low'), 'medium')
        self.assertEqual(DifficultyDialService._increase_difficulty('medium'), 'high')
        self.assertEqual(DifficultyDialService._increase_difficulty('high'), 'high')  # Cap at high
    
    def test_decrease_difficulty_method(self):
        """Test the _decrease_difficulty helper method."""
        self.assertEqual(DifficultyDialService._decrease_difficulty('high'), 'medium')
        self.assertEqual(DifficultyDialService._decrease_difficulty('medium'), 'low')
        self.assertEqual(DifficultyDialService._decrease_difficulty('low'), 'low')  # Cap at low
    
    def test_rebalance_weights_method(self):
        """Test the _rebalance_weights helper method."""
        # Test normal case
        w_due, w_interleave, w_new = DifficultyDialService._rebalance_weights(0.6, 0.25, 0.15)
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0, places=5)
        
        # Test with zero total (should use defaults)
        w_due, w_interleave, w_new = DifficultyDialService._rebalance_weights(0.0, 0.0, 0.0)
        self.assertEqual(w_due, 0.6)
        self.assertEqual(w_interleave, 0.25)
        self.assertEqual(w_new, 0.15)
        
        # Test with very small values
        w_due, w_interleave, w_new = DifficultyDialService._rebalance_weights(0.001, 0.001, 0.001)
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0, places=5)
    
    def test_weight_constraints(self):
        """Test that weights respect minimum and maximum constraints."""
        # Test that w_new is constrained between 0.05 and 0.30
        self.config.w_new = 0.01  # Very low
        result = DifficultyDialService.apply_difficulty(self.config)
        self.assertGreaterEqual(result['w_new'], 0.05)
        
        self.config.w_new = 0.40  # Very high
        result = DifficultyDialService.apply_difficulty(self.config)
        self.assertLessEqual(result['w_new'], 0.30)
    
    def test_difficulty_application_preserves_original_config(self):
        """Test that applying difficulty doesn't modify the original config object."""
        original_difficulty = self.config.difficulty
        original_w_due = self.config.w_due
        
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # Original config should be unchanged
        self.assertEqual(self.config.difficulty, original_difficulty)
        self.assertEqual(self.config.w_due, original_w_due)
        
        # Result should contain the adjusted values
        self.assertNotEqual(result['w_due'], original_w_due)
    
    def test_performance_metrics_edge_cases(self):
        """Test difficulty adjustment with extreme performance metrics."""
        # Test with perfect performance
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 1.0, 0.1
        )
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'high')
        
        # Test with very poor performance
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.0, 100.0
        )
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'low')
        
        # Test with boundary success rates
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.89, 3.1
        )
        self.assertFalse(suggestion['should_adjust'])
        
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.66, 14.9
        )
        self.assertFalse(suggestion['should_adjust'])
