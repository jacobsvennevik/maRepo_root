"""
Session Validator for Interleaving Session Generation

This module handles session validation, contrast pair enforcement,
and quality assurance for interleaving sessions.
"""

import itertools
from collections import Counter
from typing import List, Dict, Any, Optional
from backend.apps.generation.models import Flashcard, InterleavingSessionConfig


class SessionValidator:
    """
    Validates and enhances interleaving sessions.
    
    This class ensures session quality by validating constraints,
    enforcing contrast pairs, and providing quality metrics.
    """
    
    def __init__(self):
        self.quality_thresholds = {
            'topic_diversity': 0.7,
            'contrast_pairs': 0.5,
            'difficulty_balance': 0.7,
            'session_completeness': 0.8
        }
    
    def validate_session(
        self, 
        session_items: List[Dict[str, Any]], 
        config: InterleavingSessionConfig
    ) -> Dict[str, Any]:
        """
        Comprehensive session validation.
        
        Args:
            session_items: List of items in the session
            config: Session configuration
            
        Returns:
            Dictionary with validation results and quality metrics
        """
        validation_results = {
            'is_valid': True,
            'quality_score': 0.0,
            'constraint_scores': {},
            'violations': [],
            'warnings': [],
            'suggestions': []
        }
        
        # Validate individual constraints
        topic_diversity = self._validate_topic_diversity(session_items, config)
        validation_results['constraint_scores']['topic_diversity'] = topic_diversity
        
        contrast_pairs = self._validate_contrast_pairs(session_items, config)
        validation_results['constraint_scores']['contrast_pairs'] = contrast_pairs
        
        difficulty_balance = self._validate_difficulty_balance(session_items)
        validation_results['constraint_scores']['difficulty_balance'] = difficulty_balance
        
        session_completeness = self._validate_session_completeness(session_items, config)
        validation_results['constraint_scores']['session_completeness'] = session_completeness
        
        # Check for violations
        if topic_diversity < self.quality_thresholds['topic_diversity']:
            validation_results['warnings'].append(
                f"Low topic diversity: {topic_diversity:.2f} (target: {self.quality_thresholds['topic_diversity']})"
            )
        
        if config.require_contrast_pair and contrast_pairs < self.quality_thresholds['contrast_pairs']:
            validation_results['warnings'].append(
                f"Insufficient contrast pairs: {contrast_pairs:.2f} (target: {self.quality_thresholds['contrast_pairs']})"
            )
        
        if difficulty_balance < self.quality_thresholds['difficulty_balance']:
            validation_results['warnings'].append(
                f"Poor difficulty balance: {difficulty_balance:.2f} (target: {self.quality_thresholds['difficulty_balance']})"
            )
        
        if session_completeness < self.quality_thresholds['session_completeness']:
            validation_results['warnings'].append(
                f"Session incomplete: {session_completeness:.2f} (target: {self.quality_thresholds['session_completeness']})"
            )
        
        # Calculate overall quality score
        quality_score = (
            topic_diversity * 0.3 +
            contrast_pairs * 0.25 +
            difficulty_balance * 0.25 +
            session_completeness * 0.2
        )
        validation_results['quality_score'] = quality_score
        
        # Generate suggestions for improvement
        validation_results['suggestions'] = self._generate_improvement_suggestions(
            validation_results['constraint_scores']
        )
        
        # Overall validation
        if validation_results['warnings']:
            validation_results['is_valid'] = False
        
        return validation_results
    
    def enforce_contrast_pairs(
        self, 
        session_items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Enforce contrast pairs by reordering items.
        
        Args:
            session_items: List of items in the session
            
        Returns:
            Reordered session items with enforced contrast pairs
        """
        if len(session_items) < 2:
            return session_items
        
        # Find items with contrasting principles
        contrast_candidates = []
        for i, item1 in enumerate(session_items):
            for j, item2 in enumerate(session_items[i+1:], i+1):
                if self._items_contrast(item1, item2):
                    contrast_candidates.append((i, j, self._calculate_contrast_strength(item1, item2)))
        
        if not contrast_candidates:
            return session_items
        
        # Sort by contrast strength
        contrast_candidates.sort(key=lambda x: x[2], reverse=True)
        
        # Try to enforce contrast pairs by reordering
        reordered_items = session_items.copy()
        
        for i, j, strength in contrast_candidates:
            if strength > 0.7:  # Only enforce strong contrasts
                # Try to make them consecutive
                if abs(i - j) > 1:
                    # Move item j to position i+1
                    item_to_move = reordered_items.pop(j)
                    reordered_items.insert(i + 1, item_to_move)
                    
                    # Update positions
                    for k, item in enumerate(reordered_items):
                        item['position'] = k
        
        return reordered_items
    
    def _validate_topic_diversity(
        self, 
        session_items: List[Dict[str, Any]], 
        config: InterleavingSessionConfig
    ) -> float:
        """Validate topic diversity constraint."""
        if not session_items:
            return 0.0
        
        topics = [item['topic'] for item in session_items]
        unique_topics = len(set(topics))
        total_topics = len(topics)
        
        # Perfect diversity if all topics are unique
        if unique_topics == total_topics:
            return 1.0
        
        # Calculate diversity ratio
        diversity_ratio = unique_topics / total_topics
        
        # Apply penalty for repetition
        repetition_penalty = 1.0 - (total_topics - unique_topics) / total_topics
        
        # Check topic streak constraint
        max_streak = 0
        current_streak = 1
        
        for i in range(1, len(topics)):
            if topics[i] == topics[i-1]:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 1
        
        # Penalty for exceeding topic streak limit
        streak_penalty = 1.0
        if max_streak > config.max_same_topic_streak:
            excess = max_streak - config.max_same_topic_streak
            streak_penalty = max(0.0, 1.0 - (excess * 0.2))
        
        return diversity_ratio * repetition_penalty * streak_penalty
    
    def _validate_contrast_pairs(
        self, 
        session_items: List[Dict[str, Any]]
    ) -> float:
        """Validate contrast pair constraint."""
        if len(session_items) < 2:
            return 1.0
        
        contrast_pairs = 0
        total_possible = len(session_items) - 1
        
        for i in range(len(session_items) - 1):
            current = session_items[i]
            next_item = session_items[i + 1]
            
            if self._items_contrast(current, next_item):
                contrast_pairs += 1
        
        return contrast_pairs / total_possible
    
    def _validate_difficulty_balance(
        self, 
        session_items: List[Dict[str, Any]]
    ) -> float:
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
        
        # Check for extreme difficulty values
        extreme_penalty = 1.0
        for diff in difficulties:
            if diff < 0.1 or diff > 4.9:  # Very extreme values
                extreme_penalty *= 0.9
        
        return variance_score * extreme_penalty
    
    def _validate_session_completeness(
        self, 
        session_items: List[Dict[str, Any]], 
        config: InterleavingSessionConfig
    ) -> float:
        """Validate session completeness."""
        if config.session_size <= 0:
            return 1.0
        
        actual_size = len(session_items)
        completeness = actual_size / config.session_size
        
        # Bonus for exceeding target size
        if completeness > 1.0:
            completeness = 1.0 + (completeness - 1.0) * 0.5
        
        return min(1.0, completeness)
    
    def _items_contrast(
        self, 
        item1: Dict[str, Any], 
        item2: Dict[str, Any]
    ) -> bool:
        """Check if two items contrast with each other."""
        principle1 = item1.get('principle')
        principle2 = item2.get('principle')
        
        if not principle1 or not principle2:
            return False
        
        if principle1.id == principle2.id:
            return False
        
        # Check if principles contrast with each other
        return (principle1.contrasts_with.filter(id=principle2.id).exists() or
                principle2.contrasts_with.filter(id=principle1.id).exists())
    
    def _calculate_contrast_strength(
        self, 
        item1: Dict[str, Any], 
        item2: Dict[str, Any]
    ) -> float:
        """Calculate the strength of contrast between two items."""
        if not self._items_contrast(item1, item2):
            return 0.0
        
        # Base contrast strength
        strength = 0.8
        
        # Boost for different topics
        if item1.get('topic') != item2.get('topic'):
            strength += 0.1
        
        # Boost for different item types
        if item1.get('type') != item2.get('type'):
            strength += 0.1
        
        return min(1.0, strength)
    
    def _generate_improvement_suggestions(
        self, 
        constraint_scores: Dict[str, float]
    ) -> List[str]:
        """Generate suggestions for improving session quality."""
        suggestions = []
        
        if constraint_scores.get('topic_diversity', 1.0) < 0.7:
            suggestions.append(
                "Consider adding more diverse topics to improve variety"
            )
        
        if constraint_scores.get('contrast_pairs', 1.0) < 0.5:
            suggestions.append(
                "Include more contrasting principles to enhance learning"
            )
        
        if constraint_scores.get('difficulty_balance', 1.0) < 0.7:
            suggestions.append(
                "Balance difficulty levels for optimal learning progression"
            )
        
        if constraint_scores.get('session_completeness', 1.0) < 0.8:
            suggestions.append(
                "Increase session size or relax constraints to fill session"
            )
        
        if not suggestions:
            suggestions.append("Session quality is good - no improvements needed")
        
        return suggestions
    
    def get_session_metadata(
        self, 
        session_items: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive session metadata."""
        if not session_items:
            return {}
        
        topics = [item['topic'] for item in session_items]
        topic_counts = Counter(topics)
        
        item_types = [item['type'] for item in session_items]
        type_counts = Counter(item_types)
        
        difficulties = []
        for item in session_items:
            profile = getattr(item['flashcard'], 'flashcardprofile', None)
            if profile and hasattr(profile, 'difficulty_est'):
                difficulties.append(profile.difficulty_est)
        
        metadata = {
            'total_items': len(session_items),
            'topic_diversity': len(topic_counts),
            'most_common_topic': topic_counts.most_common(1)[0] if topic_counts else None,
            'topic_distribution': dict(topic_counts),
            'type_distribution': dict(type_counts),
            'difficulty_stats': self._calculate_difficulty_stats(difficulties),
            'contrast_pairs': self._count_contrast_pairs(session_items),
            'session_quality': self._calculate_session_quality(session_items)
        }
        
        return metadata
    
    def _calculate_difficulty_stats(self, difficulties: List[float]) -> Dict[str, Any]:
        """Calculate difficulty statistics."""
        if not difficulties:
            return {}
        
        import statistics
        
        return {
            'mean': statistics.mean(difficulties),
            'median': statistics.median(difficulties),
            'std_dev': statistics.stdev(difficulties) if len(difficulties) > 1 else 0,
            'min': min(difficulties),
            'max': max(difficulties),
            'range': max(difficulties) - min(difficulties)
        }
    
    def _count_contrast_pairs(self, session_items: List[Dict[str, Any]]) -> int:
        """Count total contrast pairs in session."""
        contrast_count = 0
        
        for i in range(len(session_items) - 1):
            current = session_items[i]
            next_item = session_items[i + 1]
            
            if self._items_contrast(current, next_item):
                contrast_count += 1
        
        return contrast_count
    
    def _calculate_session_quality(self, session_items: List[Dict[str, Any]]) -> float:
        """Calculate overall session quality score."""
        if not session_items:
            return 0.0
        
        # This is a simplified quality calculation
        # In practice, you might want more sophisticated metrics
        
        # Topic diversity
        topics = [item['topic'] for item in session_items]
        topic_diversity = len(set(topics)) / len(topics)
        
        # Type variety
        types = [item['type'] for item in session_items]
        type_variety = len(set(types)) / len(types)
        
        # Contrast pairs
        contrast_ratio = self._count_contrast_pairs(session_items) / max(1, len(session_items) - 1)
        
        # Overall quality
        quality = (topic_diversity * 0.4 + type_variety * 0.3 + contrast_ratio * 0.3)
        
        return min(1.0, quality)
