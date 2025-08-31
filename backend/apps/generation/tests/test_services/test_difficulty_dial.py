# Test DifficultyDialService (Scaler)
from django.test import TestCase
from django.contrib.auth import get_user_model
from backend.apps.generation.models import InterleavingSessionConfig
from backend.apps.generation.services.difficulty_dial import DifficultyDialService

User = get_user_model()


class DifficultyDialServiceTest(TestCase):
    """Test DifficultyDialService functionality."""
    
    def setUp(self):
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
    
    def test_apply_difficulty_medium(self):
        """Test medium difficulty application."""
        result = DifficultyDialService.apply_difficulty(self.config)
        
        self.assertEqual(result['interval_multiplier'], 1.0)
        self.assertEqual(result['beta'], 1.0)
        self.assertEqual(result['hard_run_cap'], 2)
        self.assertIn('difficulty_description', result)
    
    def test_apply_difficulty_low(self):
        """Test low difficulty application."""
        self.config.difficulty = 'low'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        self.assertEqual(result['interval_multiplier'], 0.8)
        self.assertEqual(result['beta'], 0.8)
        self.assertEqual(result['hard_run_cap'], 2)
    
    def test_apply_difficulty_high(self):
        """Test high difficulty application."""
        self.config.difficulty = 'high'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        self.assertEqual(result['interval_multiplier'], 1.2)
        self.assertEqual(result['beta'], 1.2)
        self.assertEqual(result['hard_run_cap'], 1)
    
    def test_weight_rebalancing(self):
        """Test that weights are properly rebalanced."""
        result = DifficultyDialService.apply_difficulty(self.config)
        
        w_due, w_interleave, w_new = result['w_due'], result['w_interleave'], result['w_new']
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0)
    
    def test_difficulty_adjustment_suggestion(self):
        """Test difficulty adjustment suggestions."""
        # High success rate should suggest increasing difficulty
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.95, 2.0
        )
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'high')
        
        # Low success rate should suggest decreasing difficulty
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.60, 20.0
        )
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'low')
        
        # Medium success rate should not suggest adjustment
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.80, 8.0
        )
        self.assertFalse(suggestion['should_adjust'])
    
    def test_invalid_difficulty_handling(self):
        """Test handling of invalid difficulty levels."""
        self.config.difficulty = 'invalid'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        # Should default to medium
        self.assertEqual(result['interval_multiplier'], 1.0)
        self.assertEqual(result['beta'], 1.0)
    
    def test_difficulty_info_retrieval(self):
        """Test getting difficulty information."""
        info = DifficultyDialService.get_difficulty_info('high')
        self.assertEqual(info['interval_mul'], 1.2)
        self.assertEqual(info['beta'], 1.2)
        self.assertEqual(info['hard_run_cap'], 1)
        
        # Test invalid difficulty returns medium
        info = DifficultyDialService.get_difficulty_info('invalid')
        self.assertEqual(info['interval_mul'], 1.0)
    
    def test_weight_boundaries(self):
        """Test weight adjustment boundaries."""
        # Test extreme weight adjustments
        self.config.w_new = 0.01  # Very low
        result = DifficultyDialService.apply_difficulty(self.config)
        self.assertGreaterEqual(result['w_new'], 0.05)  # Should be clamped to minimum
        
        self.config.w_new = 0.40  # Very high
        result = DifficultyDialService.apply_difficulty(self.config)
        self.assertLessEqual(result['w_new'], 0.30)  # Should be clamped to maximum
    
    def test_edge_case_success_rates(self):
        """Test edge case success rates for difficulty adjustment."""
        # Test boundary conditions - need to exceed thresholds slightly
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.91, 2.9  # Exceed 0.90 threshold
        )
        self.assertTrue(suggestion['should_adjust'])
        
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.64, 15.1  # Exceed 0.65 threshold
        )
        self.assertTrue(suggestion['should_adjust'])
    
    def test_difficulty_increase_decrease_limits(self):
        """Test that difficulty cannot go beyond limits."""
        # Test increase limits
        new_difficulty = DifficultyDialService._increase_difficulty('high')
        self.assertEqual(new_difficulty, 'high')  # Should stay at high
        
        # Test decrease limits
        new_difficulty = DifficultyDialService._decrease_difficulty('low')
        self.assertEqual(new_difficulty, 'low')  # Should stay at low
    
    def test_weight_rebalancing_edge_cases(self):
        """Test weight rebalancing with edge cases."""
        # Test zero weights
        w_due, w_interleave, w_new = DifficultyDialService._rebalance_weights(0, 0, 0)
        self.assertEqual(w_due, 0.6)
        self.assertEqual(w_interleave, 0.25)
        self.assertEqual(w_new, 0.15)
        
        # Test very small weights
        w_due, w_interleave, w_new = DifficultyDialService._rebalance_weights(0.001, 0.001, 0.001)
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0)
    
    def test_confidence_calculation(self):
        """Test confidence calculation in difficulty suggestions."""
        # High success rate should have reasonable confidence
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.98, 1.5
        )
        self.assertGreater(suggestion['confidence'], 0.2)  # Lower threshold for confidence
        
        # Low success rate should have reasonable confidence
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.50, 25.0
        )
        self.assertGreater(suggestion['confidence'], 0.2)  # Lower threshold for confidence
