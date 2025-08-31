"""
New Interleaving Session Service

This is the refactored version of the interleaving session service,
using the new modular structure for better maintainability and testability.
"""

from typing import Dict, Any, Optional
from backend.apps.generation.services.interleaving import SessionGenerator


class InterleavingSessionService:
    """
    Refactored service for composing interleaving sessions.
    
    This service now uses the modular architecture:
    - SessionGenerator: Core session generation logic
    - WeightCalculator: Scoring and prioritization
    - ConstraintSolver: Constraint satisfaction
    - SessionValidator: Quality assurance
    
    The original 521-line service has been broken down into focused modules
    while maintaining the same public API.
    """
    
    def __init__(self):
        self.session_generator = SessionGenerator()
    
    def generate_session(
        self, 
        user, 
        size: Optional[int] = None, 
        difficulty: Optional[str] = None,
        seed: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an interleaving session for a user.
        
        This method maintains the same interface as the original service
        but now delegates to the modular SessionGenerator.
        
        Args:
            user: User to generate session for
            size: Optional session size override
            difficulty: Optional difficulty override
            seed: Optional seed for deterministic ordering
            
        Returns:
            Dictionary with session data including items, mix, and metadata
        """
        return self.session_generator.generate_session(user, size, difficulty, seed)
    
    def get_session_statistics(self, user) -> Dict[str, Any]:
        """
        Get statistics about user's interleaving sessions.
        
        Args:
            user: User to get statistics for
            
        Returns:
            Dictionary with session statistics
        """
        return self.session_generator.get_session_statistics(user)
    
    # Backward compatibility methods
    def _generate_session_id(self, user, seed: Optional[str] = None) -> str:
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._generate_session_id(user, seed)
    
    def _create_stable_key(self, seed: Optional[str], user_id: int):
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._create_stable_key(seed, user_id)
    
    def _get_topic_name(self, flashcard) -> str:
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._get_topic_name(flashcard)
    
    def _get_due_candidates(self, user, limit: int):
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._get_due_candidates(user, limit)
    
    def _get_interleave_candidates(self, user, limit: int):
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._get_interleave_candidates(user, limit)
    
    def _get_new_candidates(self, user, limit: int):
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._get_new_candidates(user, limit)
    
    def _score_item(self, flashcard, item_type: str, difficulty_settings: Dict) -> float:
        """Backward compatibility method - delegates to WeightCalculator."""
        from interleaving.weight_calculator import WeightCalculator
        weight_calculator = WeightCalculator()
        profile = getattr(flashcard, 'flashcardprofile', None)
        return weight_calculator.calculate_adaptive_score(
            flashcard, profile, item_type, difficulty_settings
        )
    
    def _compose_session_with_relaxation(self, *args, **kwargs):
        """Backward compatibility method - delegates to ConstraintSolver."""
        return self.session_generator.constraint_solver.solve_constraints_with_relaxation(*args, **kwargs)
    
    def _has_contrast_pair(self, session_items) -> bool:
        """Backward compatibility method - delegates to SessionValidator."""
        return self.session_generator._has_contrast_pair(session_items)
    
    def _force_contrast_pair(self, session_items):
        """Backward compatibility method - delegates to SessionValidator."""
        return self.session_generator.session_validator.enforce_contrast_pairs(session_items)
    
    def _generate_session_metadata(self, *args, **kwargs):
        """Backward compatibility method - delegates to SessionValidator."""
        return self.session_generator.session_validator.get_session_metadata(*args, **kwargs)
    
    def _generate_why_text(self, difficulty_settings: Dict[str, Any]) -> str:
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._generate_why_text(difficulty_settings)
    
    def _log_session_creation(self, *args, **kwargs):
        """Backward compatibility method - delegates to SessionGenerator."""
        return self.session_generator._log_session_creation(*args, **kwargs)
