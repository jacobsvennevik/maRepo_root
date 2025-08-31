"""
Session Generator for Interleaving Session Generation

This module handles the core session generation logic, including
candidate selection, scoring, and session composition.
"""

import hashlib
import random
from typing import List, Dict, Any, Optional, Tuple
from django.utils import timezone
from django.db.models import Q, F
from datetime import timedelta
from backend.apps.generation.models import (
    Flashcard, FlashcardProfile, Topic, Principle, InterleavingSessionConfig
)
from backend.apps.generation.services.difficulty_dial import DifficultyDialService
from .weight_calculator import WeightCalculator
from .constraint_solver import ConstraintSolver
from .session_validator import SessionValidator


class SessionGenerator:
    """
    Core session generation logic for interleaving sessions.
    
    This class orchestrates the session generation process by
    coordinating candidate selection, scoring, and constraint satisfaction.
    """
    
    def __init__(self):
        self.weight_calculator = WeightCalculator()
        self.constraint_solver = ConstraintSolver()
        self.session_validator = SessionValidator()
        self.difficulty_service = DifficultyDialService()
    
    def generate_session(
        self, 
        user, 
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
        # Generate session ID for tracking
        session_id = self._generate_session_id(user, seed)
        
        # Get or create user configuration
        config, created = InterleavingSessionConfig.objects.get_or_create(
            user=user,
            defaults={
                'difficulty': difficulty or 'medium',
                'session_size': size or 10
            }
        )
        
        # Apply overrides
        if size:
            config.session_size = size
        if difficulty:
            config.difficulty = difficulty
        
        # Apply difficulty-based adjustments
        difficulty_settings = self.difficulty_service.apply_difficulty(config)
        
        # Calculate target counts for each item type
        n_due, n_interleave, n_new = self._calculate_target_counts(config, difficulty_settings)
        
        # Fetch candidate pools
        due_candidates = self._get_due_candidates(user, limit=config.session_size * 3)
        interleave_candidates = self._get_interleave_candidates(user, limit=config.session_size * 3)
        new_candidates = self._get_new_candidates(user, limit=config.session_size * 3)
        
        # Score and prioritize candidates
        due_scored = self._score_candidates(due_candidates, 'due', difficulty_settings)
        interleave_scored = self._score_candidates(interleave_candidates, 'interleave', difficulty_settings)
        new_scored = self._score_candidates(new_candidates, 'new', difficulty_settings)
        
        # Sort by score with deterministic tie-breaking
        stable_key = self._create_stable_key(seed, user.id)
        due_scored.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
        interleave_scored.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
        new_scored.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
        
        # Compose session with constraints and relaxation ladder
        session_items, fill_mode, constraints_applied = self.constraint_solver.solve_constraints_with_relaxation(
            due_scored, interleave_scored, new_scored,
            n_due, n_interleave, n_new,
            config, difficulty_settings, stable_key
        )
        
        # Ensure contrast pair if required
        if config.require_contrast_pair and not self._has_contrast_pair(session_items):
            session_items = self.session_validator.enforce_contrast_pairs(session_items)
        
        # Validate session quality
        validation_results = self.session_validator.validate_session(session_items, config)
        
        # Build response
        response = self._build_session_response(
            session_items, config, difficulty_settings, session_id,
            fill_mode, constraints_applied, validation_results
        )
        
        # Log session creation for observability
        self._log_session_creation(
            user, config.session_size, len(session_items), fill_mode, 
            constraints_applied, len(due_candidates), len(interleave_candidates), len(new_candidates)
        )
        
        return response
    
    def _generate_session_id(self, user, seed: Optional[str]) -> str:
        """Generate a unique session ID for tracking."""
        timestamp = timezone.now().isoformat()
        seed_str = seed or "default"
        content = f"{user.id}:{timestamp}:{seed_str}"
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    def _create_stable_key(self, seed: Optional[str], user_id: int):
        """Create a stable key function for deterministic ordering."""
        if seed:
            # Use seed for deterministic ordering
            random.seed(f"{user_id}:{seed}")
            return lambda x: random.random()
        else:
            # Fallback to stable ordering by ID
            return lambda x: x.id
    
    def _calculate_target_counts(
        self, 
        config: InterleavingSessionConfig, 
        difficulty_settings: Dict[str, Any]
    ) -> Tuple[int, int, int]:
        """Calculate target counts for each item type."""
        n_due = int(round(difficulty_settings['w_due'] * config.session_size))
        n_interleave = int(round(difficulty_settings['w_interleave'] * config.session_size))
        n_new = config.session_size - n_due - n_interleave  # Ensure total equals session_size
        
        # Ensure non-negative counts
        n_due = max(0, n_due)
        n_interleave = max(0, n_interleave)
        n_new = max(0, n_new)
        
        return n_due, n_interleave, n_new
    
    def _get_due_candidates(self, user, limit: int) -> List[Flashcard]:
        """Get flashcards that are due for review."""
        now = timezone.now().date()
        return list(Flashcard.objects.filter(
            flashcard_set__owner=user,
            next_review__lte=now
        ).select_related('flashcard_set', 'flashcardprofile__topic', 'flashcardprofile__principle')[:limit])
    
    def _get_interleave_candidates(self, user, limit: int) -> List[Flashcard]:
        """Get flashcards suitable for interleaving (not due, different topics)."""
        now = timezone.now().date()
        return list(Flashcard.objects.filter(
            flashcard_set__owner=user,
            next_review__gt=now,
            total_reviews__gte=2  # At least 2 reviews to be stable
        ).select_related('flashcard_set', 'flashcardprofile__topic', 'flashcardprofile__principle')[:limit])
    
    def _get_new_candidates(self, user, limit: int) -> List[Flashcard]:
        """Get recently learned flashcards (low review count)."""
        return list(Flashcard.objects.filter(
            flashcard_set__owner=user,
            total_reviews__lte=1,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).select_related('flashcard_set', 'flashcardprofile__topic', 'flashcardprofile__principle')[:limit])
    
    def _score_candidates(
        self, 
        candidates: List[Flashcard], 
        item_type: str, 
        difficulty_settings: Dict[str, Any]
    ) -> List[Tuple[float, Flashcard]]:
        """Score candidates for inclusion in the session."""
        scored_candidates = []
        
        for flashcard in candidates:
            profile = getattr(flashcard, 'flashcardprofile', None)
            score = self.weight_calculator.calculate_adaptive_score(
                flashcard, profile, item_type, difficulty_settings
            )
            scored_candidates.append((score, flashcard))
        
        return scored_candidates
    
    def _has_contrast_pair(self, session_items: List[Dict]) -> bool:
        """Check if session has at least one contrast pair."""
        for i in range(len(session_items) - 1):
            current = session_items[i]
            next_item = session_items[i + 1]
            
            if (current.get('principle') and next_item.get('principle') and
                current['principle'].id != next_item['principle'].id):
                # Check if principles contrast with each other
                if (current['principle'].contrasts_with.filter(id=next_item['principle'].id).exists() or
                    next_item['principle'].contrasts_with.filter(id=current['principle'].id).exists()):
                    return True
        
        return False
    
    def _build_session_response(
        self,
        session_items: List[Dict[str, Any]],
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any],
        session_id: str,
        fill_mode: str,
        constraints_applied: Dict[str, Any],
        validation_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build the complete session response."""
        # Calculate actual counts
        actual_n_due = sum(1 for i in session_items if i['type'] == 'due')
        actual_n_inter = sum(1 for i in session_items if i['type'] == 'interleave')
        actual_n_new = sum(1 for i in session_items if i['type'] == 'new')
        total = max(1, len(session_items))
        
        # Get session metadata
        metadata = self.session_validator.get_session_metadata(session_items)
        
        return {
            'items': session_items,
            'mix': {'due': actual_n_due, 'interleave': actual_n_inter, 'new': actual_n_new},
            'header': {
                'percent_due': round((actual_n_due / total) * 100),
                'percent_interleave': round((actual_n_inter / total) * 100),
                'percent_new': round((actual_n_new / total) * 100)
            },
            'why': self._generate_why_text(difficulty_settings),
            'constraints': {
                'contrast_pair': self._has_contrast_pair(session_items),
                'max_topic_streak': config.max_same_topic_streak
            },
            'difficulty': config.difficulty,
            'difficulty_description': difficulty_settings['difficulty_description'],
            'interval_multiplier': difficulty_settings['interval_multiplier'],
            
            # Enhanced metadata
            'requested_size': config.session_size,
            'actual_size': len(session_items),
            'fill_mode': fill_mode,
            'constraints_applied': constraints_applied,
            'pool_sizes': metadata.get('pool_sizes', {}),
            'session_id': session_id,
            
            # Quality metrics
            'quality_score': validation_results.get('quality_score', 0.0),
            'validation_results': validation_results,
            'session_metadata': metadata
        }
    
    def _generate_why_text(self, difficulty_settings: Dict[str, Any]) -> str:
        """Generate explanation text for why items were selected."""
        base_text = "Spacing + interleaving improve long-term retention and discrimination."
        
        if difficulty_settings['interval_multiplier'] > 1.0:
            base_text += " Higher difficulty increases spacing intervals for more challenge."
        elif difficulty_settings['interval_multiplier'] < 1.0:
            base_text += " Lower difficulty reduces spacing for easier review."
        
        return base_text
    
    def _log_session_creation(
        self, 
        user, 
        requested_size: int, 
        actual_size: int, 
        fill_mode: str, 
        constraints_applied: Dict[str, Any], 
        due_pool: int, 
        interleave_pool: int, 
        new_pool: int
    ):
        """Log session creation for observability."""
        import logging
        logger = logging.getLogger(__name__)
        
        log_data = {
            'event': 'interleaving.session.created',
            'user_id': user.id,
            'requested_size': requested_size,
            'actual_size': actual_size,
            'fill_mode': fill_mode,
            'constraints_applied': constraints_applied,
            'pool_sizes': {
                'due': due_pool,
                'interleave': interleave_pool,
                'new': new_pool
            }
        }
        
        logger.info(f"Interleaving session created: {log_data}")
    
    def get_session_statistics(self, user) -> Dict[str, Any]:
        """Get statistics about user's interleaving sessions."""
        config, created = InterleavingSessionConfig.objects.get_or_create(user=user)
        
        # Get candidate pool sizes
        due_count = Flashcard.objects.filter(
            flashcard_set__owner=user,
            next_review__lte=timezone.now().date()
        ).count()
        
        interleave_count = Flashcard.objects.filter(
            flashcard_set__owner=user,
            next_review__gt=timezone.now().date(),
            total_reviews__gte=2
        ).count()
        
        new_count = Flashcard.objects.filter(
            flashcard_set__owner=user,
            total_reviews__lte=1,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        return {
            'config': {
                'session_size': config.session_size,
                'difficulty': config.difficulty,
                'max_same_topic_streak': config.max_same_topic_streak,
                'require_contrast_pair': config.require_contrast_pair
            },
            'pool_sizes': {
                'due': due_count,
                'interleave': interleave_count,
                'new': new_count
            },
            'total_available': due_count + interleave_count + new_count
        }
