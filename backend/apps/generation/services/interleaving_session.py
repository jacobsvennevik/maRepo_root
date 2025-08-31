"""
Interleaving Session Service

This service composes interleaving sessions by mixing due items, interleaving candidates,
and new items while respecting constraints like topic diversity and contrast pairs.
"""

import math
import itertools
import hashlib
import random
from collections import Counter, deque
from typing import List, Dict, Any, Optional, Tuple
from django.utils import timezone
from django.db.models import Q, F
from datetime import timedelta
from backend.apps.generation.models import (
    Flashcard, FlashcardProfile, Topic, Principle, InterleavingSessionConfig
)
from backend.apps.generation.services.difficulty_dial import DifficultyDialService
from backend.apps.generation.services.spaced_repetition import SpacedRepetitionAlgorithms


class InterleavingSessionService:
    """
    Service for composing interleaving sessions with mixed item types.
    
    Features:
    - Mixes due, interleaving, and new items based on configurable weights
    - Ensures topic diversity and contrast pairs
    - Applies difficulty-based adjustments
    - Respects spacing constraints
    - Implements relaxation ladder for constraint satisfaction
    - Provides deterministic ordering with seeds
    """
    
    def __init__(self):
        self.sr_algorithms = SpacedRepetitionAlgorithms()
    
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
            Dictionary with session data including fill mode and metadata
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
        difficulty_settings = DifficultyDialService.apply_difficulty(config)
        
        # Calculate target counts for each item type
        n_due = int(round(difficulty_settings['w_due'] * config.session_size))
        n_interleave = int(round(difficulty_settings['w_interleave'] * config.session_size))
        n_new = config.session_size - n_due - n_interleave  # Ensure total equals session_size
        
        # Fetch candidate pools
        due_candidates = self._get_due_candidates(user, limit=config.session_size * 3)
        interleave_candidates = self._get_interleave_candidates(user, limit=config.session_size * 3)
        new_candidates = self._get_new_candidates(user, limit=config.session_size * 3)
        
        # Score and prioritize candidates
        due_scored = [(self._score_item(c, 'due', difficulty_settings), c) for c in due_candidates]
        interleave_scored = [(self._score_item(c, 'interleave', difficulty_settings), c) for c in interleave_candidates]
        new_scored = [(self._score_item(c, 'new', difficulty_settings), c) for c in new_candidates]
        
        # Sort by score (descending) with deterministic tie-breaking
        stable_key = self._create_stable_key(seed, user.id)
        due_scored.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
        interleave_scored.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
        new_scored.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
        
        # Compose session with constraints and relaxation ladder
        session_items, fill_mode, constraints_applied = self._compose_session_with_relaxation(
            due_scored, interleave_scored, new_scored,
            n_due, n_interleave, n_new,
            config, difficulty_settings, stable_key
        )
        
        # Ensure contrast pair if required
        if config.require_contrast_pair and not self._has_contrast_pair(session_items):
            self._force_contrast_pair(session_items)
        
        # Build response
        actual_n_due = sum(1 for i in session_items if i['type'] == 'due')
        actual_n_inter = sum(1 for i in session_items if i['type'] == 'interleave')
        actual_n_new = sum(1 for i in session_items if i['type'] == 'new')
        total = max(1, len(session_items))
        
        # Log session creation for observability
        self._log_session_creation(
            user, config.session_size, len(session_items), fill_mode, 
            constraints_applied, len(due_candidates), len(interleave_candidates), len(new_candidates)
        )
        
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
            'pool_sizes': {
                'due': len(due_candidates),
                'interleave': len(interleave_candidates),
                'new': len(new_candidates)
            },
            'session_id': session_id
        }

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

    def _log_session_creation(self, user, requested_size: int, actual_size: int, 
                             fill_mode: str, constraints_applied: Dict, 
                             due_pool: int, interleave_pool: int, new_pool: int):
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

    def _get_topic_name(self, flashcard: Flashcard) -> str:
        profile = getattr(flashcard, 'flashcardprofile', None)
        return profile.topic.name if profile and profile.topic else "Unknown"

    def _get_due_candidates(self, user, limit: int) -> List[Flashcard]:
        """Get flashcards that are due for review."""
        now = timezone.now()
        return list(Flashcard.objects.filter(
            flashcard_set__owner=user,
            next_review__lte=now
        ).select_related('flashcard_set', 'flashcardprofile__topic', 'flashcardprofile__principle')[:limit])
    
    def _get_interleave_candidates(self, user, limit: int) -> List[Flashcard]:
        """Get flashcards suitable for interleaving (not due, different topics)."""
        now = timezone.now()
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
    
    def _score_item(self, flashcard: Flashcard, item_type: str, difficulty_settings: Dict) -> float:
        """Score a flashcard candidate for inclusion in the session."""
        profile = getattr(flashcard, 'flashcardprofile', None)
        
        # Base score components
        urgency = self._calculate_urgency(flashcard)
        diversity = self._calculate_diversity(flashcard, profile) if profile else 0.0
        difficulty_target = self._calculate_difficulty_target(flashcard, profile, difficulty_settings)
        recency = self._calculate_recency(flashcard, item_type)
        
        # Weight factors based on difficulty
        alpha = 0.4  # Urgency weight
        beta = difficulty_settings['beta']  # Diversity weight
        gamma = 0.3  # Difficulty target weight
        delta = 0.3  # Recency weight
        
        score = alpha * urgency + beta * diversity + gamma * difficulty_target + delta * recency
        
        return score
    
    def _calculate_urgency(self, flashcard: Flashcard) -> float:
        """Calculate urgency score based on due status."""
        if not flashcard.next_review:
            return 1.0
        
        days_overdue = (timezone.now().date() - flashcard.next_review.date()).days
        if days_overdue <= 0:
            return 0.6  # Due today
        else:
            # Exponential decay for overdue items
            return min(1.0, 0.6 * math.exp(days_overdue / 7.0))
    
    def _calculate_diversity(self, flashcard: Flashcard, profile: FlashcardProfile) -> float:
        """Calculate diversity score based on topic/principle."""
        if not profile or not profile.topic:
            return 0.5  # Neutral score for items without topic
        
        # This would be enhanced with recent session history
        # For now, return a moderate diversity score
        return 0.7
    
    def _calculate_difficulty_target(self, flashcard: Flashcard, profile: FlashcardProfile, difficulty_settings: Dict) -> float:
        """Calculate difficulty target alignment score."""
        if not profile:
            return 0.5
        
        # Target difficulty around 0.7-0.8 (70-80% success rate)
        target_difficulty = 0.75
        current_difficulty = profile.difficulty_est
        
        # Score based on how close to target difficulty
        difficulty_diff = abs(current_difficulty - target_difficulty)
        return max(0.0, 1.0 - difficulty_diff)
    
    def _calculate_recency(self, flashcard: Flashcard, item_type: str) -> float:
        """Calculate recency score."""
        if item_type == 'new':
            # Prefer recently created items
            days_since_creation = (timezone.now() - flashcard.created_at).days
            return max(0.0, 1.0 - (days_since_creation / 30.0))
        else:
            # For due/interleave items, prefer those not seen recently
            if flashcard.last_reviewed:
                days_since_review = (timezone.now() - flashcard.last_reviewed).days
                return min(1.0, days_since_review / 30.0)
            return 0.5
    
    def _compose_session_with_relaxation(
        self,
        due_scored: List[Tuple[float, Flashcard]],
        interleave_scored: List[Tuple[float, Flashcard]],
        new_scored: List[Tuple[float, Flashcard]],
        n_due: int,
        n_interleave: int,
        n_new: int,
        config: InterleavingSessionConfig,
        difficulty_settings: Dict,
        stable_key
    ) -> Tuple[List[Dict[str, Any]], str, Dict[str, Any]]:
        """
        Compose session using relaxation ladder for constraint satisfaction.
        
        Returns:
            Tuple of (session_items, fill_mode, constraints_applied)
        """
        session_items = []
        topic_window = deque(maxlen=config.max_same_topic_streak)
        hard_item_count = 0
        
        # Helper function to get topic from flashcard
        def get_topic(flashcard):
            return self._get_topic_name(flashcard)
        
        # Helper function to check if item is hard
        def is_hard_item(flashcard):
            profile = getattr(flashcard, 'flashcardprofile', None)
            if profile:
                return profile.difficulty_est > 2.0
            return False
        
        # Helper function to check constraints with relaxation levels
        def violates_constraints(flashcard, item_type, relaxation_level: int = 0):
            topic = get_topic(flashcard)
            
            # Level 0: Strict constraints
            if relaxation_level == 0:
                # Check topic streak
                if len(topic_window) >= config.max_same_topic_streak:
                    if all(t == topic for t in topic_window):
                        return True
                
                # Check hard item run
                if is_hard_item(flashcard):
                    if hard_item_count >= difficulty_settings['hard_run_cap']:
                        return True
            
            # Level 1: Relax topic streak (allow +1)
            elif relaxation_level == 1:
                if len(topic_window) >= config.max_same_topic_streak + 1:
                    if all(t == topic for t in topic_window):
                        return True
                
                # Still check hard item run
                if is_hard_item(flashcard):
                    if hard_item_count >= difficulty_settings['hard_run_cap']:
                        return True
            
            # Level 2: Very relaxed (only avoid extreme violations)
            elif relaxation_level == 2:
                if len(topic_window) >= config.max_same_topic_streak + 3:
                    if all(t == topic for t in topic_window):
                        return True
            
            return False
        
        # Compose session with relaxation ladder
        remaining = {'due': n_due, 'interleave': n_interleave, 'new': n_new}
        scored_pools = {
            'due': due_scored,
            'interleave': interleave_scored,
            'new': new_scored
        }
        
        # Track constraint relaxation
        constraints_applied = {
            'topic_streak_relaxed': 0,
            'hard_item_relaxed': 0,
            'contrast_pair_relaxed': 0
        }
        
        for position in range(max(0, config.session_size)):
            # Determine which pool to pick from
            pool_order = sorted(remaining.items(), key=lambda x: x[1], reverse=True)
            
            picked_item = None
            picked_type = None
            
            # Try to pick from each pool in priority order with relaxation ladder
            for relaxation_level in range(3):  # 0=strict, 1=relaxed, 2=very relaxed
                for pool_type, _ in pool_order:
                    if remaining[pool_type] <= 0:
                        continue
                    
                    # Find first non-violating item in this pool at current relaxation level
                    for score, flashcard in scored_pools[pool_type]:
                        if (flashcard not in [item['flashcard'] for item in session_items] and 
                            not violates_constraints(flashcard, pool_type, relaxation_level)):
                            picked_item = flashcard
                            picked_type = pool_type
                            break
                    
                    if picked_item:
                        break
                
                if picked_item:
                    # Track relaxation level used
                    if relaxation_level > 0:
                        if 'topic_streak' in str(violates_constraints(picked_item, picked_type, 0)):
                            constraints_applied['topic_streak_relaxed'] += 1
                        if 'hard_item' in str(violates_constraints(picked_item, picked_type, 0)):
                            constraints_applied['hard_item_relaxed'] += 1
                    break
            
            # If no item found, pick the highest scoring available item from any pool that still has quota
            if not picked_item:
                all_available = []
                for pool_type, items in scored_pools.items():
                    if remaining[pool_type] > 0:
                        for score, flashcard in items:
                            if flashcard not in [item['flashcard'] for item in session_items]:
                                all_available.append((score, flashcard, pool_type))
                
                if all_available:
                    all_available.sort(key=lambda x: (x[0], stable_key(x[1])), reverse=True)
                    picked_item = all_available[0][1]
                    picked_type = all_available[0][2]
            
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
        
        # Determine fill mode based on how many items we got
        target_size = config.session_size
        actual_size = len(session_items)
        
        if actual_size >= target_size:
            fill_mode = "strict"
        elif actual_size >= target_size * 0.8:  # Got at least 80%
            fill_mode = "relaxed"
        else:
            fill_mode = "exhausted"
        
        return session_items, fill_mode, constraints_applied

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
    
    def _force_contrast_pair(self, session_items: List[Dict]):
        """Force insertion of a contrast pair by swapping items."""
        # Find two items with contrasting principles
        for i in range(len(session_items)):
            for j in range(i + 1, len(session_items)):
                item1 = session_items[i]
                item2 = session_items[j]
                
                if (item1.get('principle') and item2.get('principle') and
                    item1['principle'].id != item2['principle'].id):
                    
                    # Check if they contrast
                    if (item1['principle'].contrasts_with.filter(id=item2['principle'].id).exists() or
                        item2['principle'].contrasts_with.filter(id=item1['principle'].id).exists()):
                        
                        # Swap to make them consecutive
                        if abs(i - j) > 1:
                            # Move item2 to position i+1
                            session_items.insert(i + 1, session_items.pop(j))
                            # Update positions
                            for k, item in enumerate(session_items):
                                item['position'] = k
                        return

    def _generate_session_metadata(
        self, 
        session_items: List[Dict], 
        config: InterleavingSessionConfig,
        difficulty_settings: Dict
    ) -> Dict[str, Any]:
        """Generate metadata about the composed session."""
        topics = [item['topic'] for item in session_items]
        topic_counts = Counter(topics)
        
        return {
            'total_items': len(session_items),
            'topic_diversity': len(topic_counts),
            'most_common_topic': topic_counts.most_common(1)[0] if topic_counts else None,
            'difficulty_level': config.difficulty,
            'constraints_satisfied': {
                'contrast_pair': self._has_contrast_pair(session_items),
                'max_topic_streak': max(len(list(g)) for _, g in itertools.groupby(topics)) if topics else 0
            }
        }
    
    def _generate_why_text(self, difficulty_settings: Dict) -> str:
        """Generate explanation text for why items were selected."""
        base_text = "Spacing + interleaving improve long-term retention and discrimination."
        
        if difficulty_settings['interval_multiplier'] > 1.0:
            base_text += " Higher difficulty increases spacing intervals for more challenge."
        elif difficulty_settings['interval_multiplier'] < 1.0:
            base_text += " Lower difficulty reduces spacing for easier review."
        
        return base_text
