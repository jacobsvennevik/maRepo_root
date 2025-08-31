"""
Base Algorithm for Interleaving Session Generation

This module provides the abstract base class and common interfaces
for different interleaving algorithms.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from django.contrib.auth import get_user_model
from backend.apps.generation.models import Flashcard, InterleavingSessionConfig

User = get_user_model()


class BaseInterleavingAlgorithm(ABC):
    """
    Abstract base class for interleaving algorithms.
    
    This class defines the interface that all interleaving algorithms
    must implement, ensuring consistency and allowing for easy
    algorithm switching and comparison.
    """
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0"
    
    @abstractmethod
    def generate_session(
        self, 
        user: User, 
        size: Optional[int] = None, 
        difficulty: Optional[str] = None,
        seed: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an interleaving session for a user.
        
        Args:
            user: User to generate session for
            size: Optional session size override
            difficulty: Optional difficulty override
            seed: Optional seed for deterministic ordering
            
        Returns:
            Dictionary with session data including items, mix, and metadata
        """
        pass
    
    @abstractmethod
    def score_item(
        self, 
        flashcard: Flashcard, 
        item_type: str, 
        difficulty_settings: Dict[str, Any]
    ) -> float:
        """
        Score a flashcard candidate for inclusion in the session.
        
        Args:
            flashcard: Flashcard to score
            item_type: Type of item ('due', 'interleave', 'new')
            difficulty_settings: Difficulty configuration
            
        Returns:
            Float score for prioritization
        """
        pass
    
    @abstractmethod
    def validate_constraints(
        self, 
        session_items: List[Dict[str, Any]], 
        config: InterleavingSessionConfig
    ) -> Dict[str, Any]:
        """
        Validate that the session satisfies all constraints.
        
        Args:
            session_items: List of items in the session
            config: Session configuration
            
        Returns:
            Dictionary with validation results and any violations
        """
        pass
    
    def get_algorithm_info(self) -> Dict[str, Any]:
        """
        Get information about this algorithm.
        
        Returns:
            Dictionary with algorithm metadata
        """
        return {
            'name': self.name,
            'version': self.version,
            'description': self.__doc__ or '',
            'capabilities': self.get_capabilities()
        }
    
    def get_capabilities(self) -> List[str]:
        """
        Get list of algorithm capabilities.
        
        Returns:
            List of capability strings
        """
        return [
            'session_generation',
            'item_scoring',
            'constraint_validation'
        ]
    
    def validate_config(self, config: InterleavingSessionConfig) -> bool:
        """
        Validate that the configuration is compatible with this algorithm.
        
        Args:
            config: Session configuration to validate
            
        Returns:
            True if configuration is valid, False otherwise
        """
        required_fields = ['session_size', 'difficulty', 'max_same_topic_streak']
        
        for field in required_fields:
            if not hasattr(config, field) or getattr(config, field) is None:
                return False
        
        # Validate session size
        if config.session_size <= 0 or config.session_size > 100:
            return False
        
        # Validate difficulty
        valid_difficulties = ['easy', 'medium', 'hard']
        if config.difficulty not in valid_difficulties:
            return False
        
        # Validate topic streak
        if config.max_same_topic_streak <= 0:
            return False
        
        return True
    
    def get_default_config(self) -> Dict[str, Any]:
        """
        Get default configuration values for this algorithm.
        
        Returns:
            Dictionary with default configuration values
        """
        return {
            'session_size': 10,
            'difficulty': 'medium',
            'max_same_topic_streak': 3,
            'require_contrast_pair': True
        }
    
    def estimate_complexity(self, config: InterleavingSessionConfig) -> str:
        """
        Estimate the computational complexity of generating a session.
        
        Args:
            config: Session configuration
            
        Returns:
            Complexity estimate ('low', 'medium', 'high')
        """
        if config.session_size <= 10:
            return 'low'
        elif config.session_size <= 25:
            return 'medium'
        else:
            return 'high'
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get performance metrics for this algorithm.
        
        Returns:
            Dictionary with performance metrics
        """
        return {
            'avg_generation_time': None,  # To be implemented by subclasses
            'memory_usage': None,         # To be implemented by subclasses
            'cache_hit_rate': None       # To be implemented by subclasses
        }
