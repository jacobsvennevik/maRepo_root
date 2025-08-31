"""
Constraint Solver for Interleaving Session Generation

This module handles constraint satisfaction using a relaxation ladder
approach to ensure optimal session composition while respecting
various constraints like topic diversity and difficulty limits.
"""

from collections import deque
from typing import List, Dict, Any, Tuple, Optional
from backend.apps.generation.models import Flashcard, FlashcardProfile, InterleavingSessionConfig


class ConstraintSolver:
    """
    Solves constraint satisfaction problems for interleaving sessions.
    
    This class implements a relaxation ladder approach to handle
    multiple constraints while maximizing session quality.
    """
    
    def __init__(self):
        self.max_relaxation_levels = 3
        self.constraint_types = [
            'topic_streak',
            'hard_item_run',
            'contrast_pair',
            'difficulty_balance'
        ]
    
    def solve_constraints_with_relaxation(
        self,
        due_scored: List[Tuple[float, Flashcard]],
        interleave_scored: List[Tuple[float, Flashcard]],
        new_scored: List[Tuple[float, Flashcard]],
        n_due: int,
        n_interleave: int,
        n_new: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any],
        stable_key
    ) -> Tuple[List[Dict[str, Any]], str, Dict[str, Any]]:
        """
        Solve constraint satisfaction using relaxation ladder.
        
        Args:
            due_scored: List of (score, flashcard) tuples for due items
            interleave_scored: List of (score, flashcard) tuples for interleave items
            new_scored: List of (score, flashcard) tuples for new items
            n_due: Target number of due items
            n_interleave: Target number of interleave items
            n_new: Target number of new items
            config: Session configuration
            difficulty_settings: Difficulty configuration
            stable_key: Function for stable ordering
            
        Returns:
            Tuple of (session_items, fill_mode, constraints_applied)
        """
        session_items = []
        topic_window = deque(maxlen=config.max_same_topic_streak)
        hard_item_count = 0
        
        # Track constraint relaxation
        constraints_applied = {
            'topic_streak_relaxed': 0,
            'hard_item_relaxed': 0,
            'contrast_pair_relaxed': 0,
            'difficulty_balance_relaxed': 0
        }
        
        # Helper functions
        def get_topic(flashcard):
            profile = getattr(flashcard, 'flashcardprofile', None)
            return profile.topic.name if profile and profile.topic else "Unknown"
        
        def is_hard_item(flashcard):
            profile = getattr(flashcard, 'flashcardprofile', None)
            if profile:
                return profile.difficulty_est > 2.0
            return False
        
        # Compose session with relaxation ladder
        remaining = {'due': n_due, 'interleave': n_interleave, 'new': n_new}
        scored_pools = {
            'due': due_scored,
            'interleave': interleave_scored,
            'new': new_scored
        }
        
        for position in range(max(0, config.session_size)):
            # Determine which pool to pick from
            pool_order = sorted(remaining.items(), key=lambda x: x[1], reverse=True)
            
            picked_item = None
            picked_type = None
            
            # Try to pick from each pool in priority order with relaxation ladder
            for relaxation_level in range(self.max_relaxation_levels):
                for pool_type, _ in pool_order:
                    if remaining[pool_type] <= 0:
                        continue
                    
                    # Find first non-violating item in this pool at current relaxation level
                    for score, flashcard in scored_pools[pool_type]:
                        if (flashcard not in [item['flashcard'] for item in session_items] and 
                            not self._violates_constraints(
                                flashcard, pool_type, relaxation_level, topic_window, 
                                hard_item_count, config, difficulty_settings
                            )):
                            picked_item = flashcard
                            picked_type = pool_type
                            break
                    
                    if picked_item:
                        break
                
                if picked_item:
                    # Track relaxation level used
                    if relaxation_level > 0:
                        self._track_relaxation(
                            picked_item, picked_type, relaxation_level, topic_window,
                            hard_item_count, config, difficulty_settings, constraints_applied
                        )
                    break
            
            # If no item found, pick the highest scoring available item
            if not picked_item:
                picked_item, picked_type = self._fallback_selection(
                    scored_pools, remaining, session_items, stable_key
                )
            
            if picked_item:
                # Add item to session
                session_items.append({
                    'flashcard': picked_item,
                    'type': picked_type,
                    'topic': get_topic(picked_item),
                    'principle': getattr(getattr(picked_item, 'flashcardprofile', None), 'principle', None),
                    'position': position
                })
                
                # Update tracking variables
                if picked_type in remaining and remaining[picked_type] > 0:
                    remaining[picked_type] -= 1
                topic_window.append(get_topic(picked_item))
                if is_hard_item(picked_item):
                    hard_item_count += 1
                else:
                    hard_item_count = 0
        
        # Determine fill mode
        fill_mode = self._determine_fill_mode(len(session_items), config.session_size)
        
        return session_items, fill_mode, constraints_applied
    
    def _violates_constraints(
        self,
        flashcard: Flashcard,
        item_type: str,
        relaxation_level: int,
        topic_window: deque,
        hard_item_count: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any]
    ) -> bool:
        """
        Check if item violates constraints at given relaxation level.
        
        Args:
            flashcard: Flashcard to check
            item_type: Type of item
            relaxation_level: Current relaxation level
            topic_window: Recent topics window
            hard_item_count: Current count of hard items
            config: Session configuration
            difficulty_settings: Difficulty configuration
            
        Returns:
            True if constraints are violated, False otherwise
        """
        topic = self._get_topic_name(flashcard)
        
        # Level 0: Strict constraints
        if relaxation_level == 0:
            return self._check_strict_constraints(
                topic, topic_window, hard_item_count, config, difficulty_settings
            )
        
        # Level 1: Relaxed constraints
        elif relaxation_level == 1:
            return self._check_relaxed_constraints(
                topic, topic_window, hard_item_count, config, difficulty_settings
            )
        
        # Level 2: Very relaxed constraints
        elif relaxation_level == 2:
            return self._check_very_relaxed_constraints(
                topic, topic_window, hard_item_count, config, difficulty_settings
            )
        
        return False
    
    def _check_strict_constraints(
        self,
        topic: str,
        topic_window: deque,
        hard_item_count: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any]
    ) -> bool:
        """Check constraints at strict level."""
        # Check topic streak
        if len(topic_window) >= config.max_same_topic_streak:
            if all(t == topic for t in topic_window):
                return True
        
        # Check hard item run
        if hard_item_count >= difficulty_settings.get('hard_run_cap', 3):
            return True
        
        return False
    
    def _check_relaxed_constraints(
        self,
        topic: str,
        topic_window: deque,
        hard_item_count: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any]
    ) -> bool:
        """Check constraints at relaxed level."""
        # Allow +1 topic streak
        if len(topic_window) >= config.max_same_topic_streak + 1:
            if all(t == topic for t in topic_window):
                return True
        
        # Still check hard item run strictly
        if hard_item_count >= difficulty_settings.get('hard_run_cap', 3):
            return True
        
        return False
    
    def _check_very_relaxed_constraints(
        self,
        topic: str,
        topic_window: deque,
        hard_item_count: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any]
    ) -> bool:
        """Check constraints at very relaxed level."""
        # Allow +3 topic streak
        if len(topic_window) >= config.max_same_topic_streak + 3:
            if all(t == topic for t in topic_window):
                return True
        
        # Allow +1 hard item run
        if hard_item_count >= difficulty_settings.get('hard_run_cap', 3) + 1:
            return True
        
        return False
    
    def _track_relaxation(
        self,
        flashcard: Flashcard,
        item_type: str,
        relaxation_level: int,
        topic_window: deque,
        hard_item_count: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict[str, Any],
        constraints_applied: Dict[str, Any]
    ):
        """Track which constraints were relaxed."""
        # Check what would have been violated at strict level
        if self._check_strict_constraints(
            self._get_topic_name(flashcard), topic_window, 
            hard_item_count, config, difficulty_settings
        ):
            if 'topic_streak' in str(self._check_strict_constraints(
                self._get_topic_name(flashcard), topic_window, 
                hard_item_count, config, difficulty_settings
            )):
                constraints_applied['topic_streak_relaxed'] += 1
            if hard_item_count >= difficulty_settings.get('hard_run_cap', 3):
                constraints_applied['hard_item_relaxed'] += 1
    
    def _fallback_selection(
        self,
        scored_pools: Dict[str, List[Tuple[float, Flashcard]]],
        remaining: Dict[str, int],
        session_items: List[Dict[str, Any]],
        stable_key
    ) -> Tuple[Optional[Flashcard], Optional[str]]:
        """Fallback selection when no item satisfies constraints."""
        all_available = []
        for pool_type, items in scored_pools.items():
            if remaining[pool_type] > 0:
                for score, flashcard in items:
                    if flashcard not in [item['flashcard'] for item in session_items]:
                        all_available.append((score, flashcard, pool_type))
        
        if all_available:
            all_available.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
            return all_available[0][1], all_available[0][2]
        
        return None, None
    
    def _determine_fill_mode(self, actual_size: int, target_size: int) -> str:
        """Determine fill mode based on session completion."""
        if actual_size >= target_size:
            return "strict"
        elif actual_size >= target_size * 0.8:  # Got at least 80%
            return "relaxed"
        else:
            return "exhausted"
    
    def _get_topic_name(self, flashcard: Flashcard) -> str:
        """Get topic name from flashcard."""
        profile = getattr(flashcard, 'flashcardprofile', None)
        return profile.topic.name if profile and profile.topic else "Unknown"
    
    def validate_session_constraints(
        self,
        session_items: List[Dict[str, Any]],
        config: InterleavingSessionConfig
    ) -> Dict[str, Any]:
        """
        Validate that a completed session satisfies all constraints.
        
        Args:
            session_items: List of items in the session
            config: Session configuration
            
        Returns:
            Dictionary with validation results
        """
        validation_results = {
            'is_valid': True,
            'violations': [],
            'warnings': [],
            'constraint_scores': {}
        }
        
        # Check topic streak constraint
        topic_streak_score = self._validate_topic_streak(session_items, config)
        validation_results['constraint_scores']['topic_streak'] = topic_streak_score
        
        if topic_streak_score < 0.8:
            validation_results['warnings'].append(
                f"Topic streak constraint: {topic_streak_score:.2f} (target: 0.8+)"
            )
        
        # Check contrast pair constraint
        if config.require_contrast_pair:
            contrast_score = self._validate_contrast_pairs(session_items)
            validation_results['constraint_scores']['contrast_pairs'] = contrast_score
            
            if contrast_score < 0.5:
                validation_results['warnings'].append(
                    f"Contrast pair constraint: {contrast_score:.2f} (target: 0.5+)"
                )
        
        # Check difficulty balance
        difficulty_score = self._validate_difficulty_balance(session_items)
        validation_results['constraint_scores']['difficulty_balance'] = difficulty_score
        
        if difficulty_score < 0.7:
            validation_results['warnings'].append(
                f"Difficulty balance: {difficulty_score:.2f} (target: 0.7+)"
            )
        
        # Overall validation
        if validation_results['warnings']:
            validation_results['is_valid'] = False
        
        return validation_results
    
    def _validate_topic_streak(
        self,
        session_items: List[Dict[str, Any]],
        config: InterleavingSessionConfig
    ) -> float:
        """Validate topic streak constraint."""
        topics = [item['topic'] for item in session_items]
        max_streak = 0
        current_streak = 1
        
        for i in range(1, len(topics)):
            if topics[i] == topics[i-1]:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 1
        
        # Score based on how well we stay within limits
        if max_streak <= config.max_same_topic_streak:
            return 1.0
        else:
            # Penalty for exceeding limit
            excess = max_streak - config.max_same_topic_streak
            return max(0.0, 1.0 - (excess * 0.2))
    
    def _validate_contrast_pairs(self, session_items: List[Dict[str, Any]]) -> float:
        """Validate contrast pair constraint."""
        contrast_pairs = 0
        total_possible = max(0, len(session_items) - 1)
        
        for i in range(len(session_items) - 1):
            current = session_items[i]
            next_item = session_items[i + 1]
            
            if (current.get('principle') and next_item.get('principle') and
                current['principle'].id != next_item['principle'].id):
                # Check if principles contrast
                if (current['principle'].contrasts_with.filter(id=next_item['principle'].id).exists() or
                    next_item['principle'].contrasts_with.filter(id=current['principle'].id).exists()):
                    contrast_pairs += 1
        
        if total_possible == 0:
            return 1.0
        
        return contrast_pairs / total_possible
    
    def _validate_difficulty_balance(self, session_items: List[Dict[str, Any]]) -> float:
        """Validate difficulty balance constraint."""
        difficulties = []
        
        for item in session_items:
            profile = getattr(item['flashcard'], 'flashcardprofile', None)
            if profile and hasattr(profile, 'difficulty_est'):
                difficulties.append(profile.difficulty_est)
        
        if not difficulties:
            return 0.5
        
        # Calculate difficulty variance
        import statistics
        mean_diff = statistics.mean(difficulties)
        variance = statistics.variance(difficulties) if len(difficulties) > 1 else 0
        
        # Lower variance = better balance
        # Target variance around 0.5
        target_variance = 0.5
        variance_score = max(0.0, 1.0 - abs(variance - target_variance))
        
        return variance_score
