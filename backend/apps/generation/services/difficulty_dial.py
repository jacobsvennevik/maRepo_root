"""
Difficulty Dial Service for Interleaving Scheduler

This service applies difficulty-based adjustments to interleaving session configuration,
including interval multipliers, weight adjustments, and constraint parameters.
"""

from typing import Dict, Any
from backend.apps.generation.models import InterleavingSessionConfig


class DifficultyDialService:
    """
    Service for applying difficulty-based adjustments to interleaving configuration.
    
    The difficulty dial affects:
    - Interval multipliers for spacing aggressiveness
    - New item ratio adjustments
    - Diversity weights for interleaving
    - Hard item run caps
    """
    
    # Difficulty dial mapping table
    DIFFICULTY_TABLE = {
        'low': {
            'interval_mul': 0.8,
            'w_new_adj': -0.05,
            'beta': 0.8,
            'hard_run_cap': 2,
            'description': 'Easier spacing, more due items, less variety'
        },
        'medium': {
            'interval_mul': 1.0,
            'w_new_adj': 0.00,
            'beta': 1.0,
            'hard_run_cap': 2,
            'description': 'Balanced spacing and variety'
        },
        'high': {
            'interval_mul': 1.2,
            'w_new_adj': 0.05,
            'beta': 1.2,
            'hard_run_cap': 1,
            'description': 'Aggressive spacing, more variety, higher challenge'
        }
    }
    
    @classmethod
    def apply_difficulty(cls, config: InterleavingSessionConfig) -> Dict[str, Any]:
        """
        Apply difficulty-based adjustments to configuration.
        
        Args:
            config: User's interleaving session configuration
            
        Returns:
            Dictionary with adjusted configuration values
        """
        if config.difficulty not in cls.DIFFICULTY_TABLE:
            # Default to medium if invalid difficulty
            config.difficulty = 'medium'
        
        difficulty_settings = cls.DIFFICULTY_TABLE[config.difficulty]
        
        # Apply interval multiplier
        interval_multiplier = difficulty_settings['interval_mul']
        
        # Apply new item ratio adjustment
        w_new_adjusted = max(0.05, min(0.30, config.w_new + difficulty_settings['w_new_adj']))
        
        # Rebalance weights to sum to 1.0
        w_due, w_interleave, w_new = cls._rebalance_weights(
            config.w_due, 
            config.w_interleave, 
            w_new_adjusted
        )
        
        # Get diversity weight and hard run cap
        beta = difficulty_settings['beta']
        hard_run_cap = difficulty_settings['hard_run_cap']
        
        return {
            'interval_multiplier': interval_multiplier,
            'w_due': w_due,
            'w_interleave': w_interleave,
            'w_new': w_new,
            'beta': beta,
            'hard_run_cap': hard_run_cap,
            'difficulty_description': difficulty_settings['description']
        }
    
    @classmethod
    def get_difficulty_info(cls, difficulty: str) -> Dict[str, Any]:
        """
        Get information about a specific difficulty level.
        
        Args:
            difficulty: Difficulty level ('low', 'medium', 'high')
            
        Returns:
            Dictionary with difficulty information
        """
        if difficulty not in cls.DIFFICULTY_TABLE:
            return cls.DIFFICULTY_TABLE['medium']
        
        return cls.DIFFICULTY_TABLE[difficulty]
    
    @classmethod
    def suggest_difficulty_adjustment(
        cls, 
        current_difficulty: str, 
        success_rate: float, 
        avg_latency: float
    ) -> Dict[str, Any]:
        """
        Suggest difficulty adjustment based on performance metrics.
        
        Args:
            current_difficulty: Current difficulty level
            success_rate: Recent success rate (0.0 to 1.0)
            avg_latency: Average response time in seconds
            
        Returns:
            Dictionary with adjustment suggestion
        """
        suggestion = {
            'should_adjust': False,
            'new_difficulty': current_difficulty,
            'reason': None,
            'confidence': 0.0
        }
        
        # High success rate + low latency suggests too easy
        if success_rate > 0.90 and avg_latency < 3.0:
            if current_difficulty != 'high':
                suggestion.update({
                    'should_adjust': True,
                    'new_difficulty': cls._increase_difficulty(current_difficulty),
                    'reason': 'High success rate and fast responses suggest the current level is too easy',
                    'confidence': min(0.9, (success_rate - 0.85) * 2)  # Scale confidence
                })
        
        # Low success rate or high latency suggests too hard
        elif success_rate < 0.65 or avg_latency > 15.0:
            if current_difficulty != 'low':
                suggestion.update({
                    'should_adjust': True,
                    'new_difficulty': cls._decrease_difficulty(current_difficulty),
                    'reason': 'Low success rate or slow responses suggest the current level is too hard',
                    'confidence': min(0.9, (0.70 - success_rate) * 2)  # Scale confidence
                })
        
        return suggestion
    
    @classmethod
    def _rebalance_weights(cls, w_due: float, w_interleave: float, w_new: float) -> tuple:
        """
        Rebalance weights to sum to 1.0.
        
        Args:
            w_due: Weight for due items
            w_interleave: Weight for interleaving items
            w_new: Weight for new items
            
        Returns:
            Tuple of (w_due, w_interleave, w_new) that sum to 1.0
        """
        total = w_due + w_interleave + w_new
        if total == 0:
            return 0.6, 0.25, 0.15  # Default weights
        
        return w_due / total, w_interleave / total, w_new / total
    
    @classmethod
    def _increase_difficulty(cls, current: str) -> str:
        """Increase difficulty by one level."""
        if current == 'low':
            return 'medium'
        elif current == 'medium':
            return 'high'
        return 'high'
    
    @classmethod
    def _decrease_difficulty(cls, current: str) -> str:
        """Decrease difficulty by one level."""
        if current == 'high':
            return 'medium'
        elif current == 'medium':
            return 'low'
        return 'low'
