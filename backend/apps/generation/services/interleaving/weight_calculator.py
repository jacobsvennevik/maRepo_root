"""
Weight Calculator for Interleaving Session Generation

This module handles the scoring and prioritization algorithms for
different types of items in interleaving sessions.
"""

import math
from typing import Dict, Any, Optional
from django.utils import timezone
from datetime import timedelta
from backend.apps.generation.models import Flashcard, FlashcardProfile


class WeightCalculator:
    """
    Calculates weights and scores for items in interleaving sessions.
    
    This class implements various scoring algorithms to determine
    the optimal order and selection of items for interleaving sessions.
    """
    
    def __init__(self):
        # Default weight factors for scoring
        self.default_weights = {
            'urgency': 0.4,
            'diversity': 0.3,
            'difficulty_target': 0.2,
            'recency': 0.1
        }
    
    def calculate_urgency_score(self, flashcard: Flashcard) -> float:
        """
        Calculate urgency score based on due status.
        
        Args:
            flashcard: Flashcard to score
            
        Returns:
            Float score between 0.0 and 1.0
        """
        if not flashcard.next_review:
            return 1.0
        
        now = timezone.now().date()
        days_overdue = (now - flashcard.next_review).days
        
        if days_overdue <= 0:
            return 0.6  # Due today
        else:
            # Exponential decay for overdue items
            # More overdue = higher urgency
            return min(1.0, 0.6 * math.exp(days_overdue / 7.0))
    
    def calculate_diversity_score(
        self, 
        flashcard: Flashcard, 
        profile: Optional[FlashcardProfile],
        recent_topics: Optional[list] = None
    ) -> float:
        """
        Calculate diversity score based on topic/principle.
        
        Args:
            flashcard: Flashcard to score
            profile: Flashcard profile with topic/principle info
            recent_topics: List of recent topics in session
            
        Returns:
            Float score between 0.0 and 1.0
        """
        if not profile or not profile.topic:
            return 0.5  # Neutral score for items without topic
        
        # Base diversity score
        base_score = 0.7
        
        # If we have recent topics, adjust based on repetition
        if recent_topics:
            topic_name = profile.topic.name
            recent_count = recent_topics.count(topic_name)
            
            # Penalize recent topic repetition
            if recent_count == 0:
                return base_score  # New topic
            elif recent_count == 1:
                return base_score * 0.8  # Slight penalty
            elif recent_count == 2:
                return base_score * 0.6  # Moderate penalty
            else:
                return base_score * 0.3  # Heavy penalty
        
        return base_score
    
    def calculate_difficulty_target_score(
        self, 
        flashcard: Flashcard, 
        profile: Optional[FlashcardProfile], 
        difficulty_settings: Dict[str, Any]
    ) -> float:
        """
        Calculate difficulty target alignment score.
        
        Args:
            flashcard: Flashcard to score
            profile: Flashcard profile
            difficulty_settings: Difficulty configuration
            
        Returns:
            Float score between 0.0 and 1.0
        """
        if not profile:
            return 0.5
        
        # Target difficulty around 70-80% success rate
        target_difficulty = 0.75
        current_difficulty = profile.difficulty_est
        
        # Score based on how close to target difficulty
        difficulty_diff = abs(current_difficulty - target_difficulty)
        base_score = max(0.0, 1.0 - difficulty_diff)
        
        # Adjust based on difficulty settings
        if difficulty_settings.get('difficulty') == 'hard':
            # Prefer harder items for hard difficulty
            if current_difficulty > target_difficulty:
                base_score *= 1.2
            else:
                base_score *= 0.8
        elif difficulty_settings.get('difficulty') == 'easy':
            # Prefer easier items for easy difficulty
            if current_difficulty < target_difficulty:
                base_score *= 1.2
            else:
                base_score *= 0.8
        
        return min(1.0, base_score)
    
    def calculate_recency_score(
        self, 
        flashcard: Flashcard, 
        item_type: str
    ) -> float:
        """
        Calculate recency score based on item type and history.
        
        Args:
            flashcard: Flashcard to score
            item_type: Type of item ('due', 'interleave', 'new')
            
        Returns:
            Float score between 0.0 and 1.0
        """
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
    
    def calculate_adaptive_score(
        self, 
        flashcard: Flashcard, 
        profile: Optional[FlashcardProfile],
        item_type: str,
        difficulty_settings: Dict[str, Any],
        recent_topics: Optional[list] = None,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> float:
        """
        Calculate comprehensive adaptive score for an item.
        
        Args:
            flashcard: Flashcard to score
            profile: Flashcard profile
            item_type: Type of item
            difficulty_settings: Difficulty configuration
            recent_topics: Recent topics in session
            custom_weights: Custom weight factors
            
        Returns:
            Float score between 0.0 and 1.0
        """
        # Use custom weights or defaults
        weights = custom_weights or self.default_weights
        
        # Calculate individual scores
        urgency_score = self.calculate_urgency_score(flashcard)
        diversity_score = self.calculate_diversity_score(flashcard, profile, recent_topics)
        difficulty_score = self.calculate_difficulty_target_score(flashcard, profile, difficulty_settings)
        recency_score = self.calculate_recency_score(flashcard, item_type)
        
        # Apply adaptive adjustments based on item type
        if item_type == 'due':
            # Due items get urgency boost
            urgency_score *= 1.3
        elif item_type == 'interleave':
            # Interleave items get diversity boost
            diversity_score *= 1.2
        elif item_type == 'new':
            # New items get recency boost
            recency_score *= 1.2
        
        # Calculate weighted score
        total_score = (
            weights['urgency'] * urgency_score +
            weights['diversity'] * diversity_score +
            weights['difficulty_target'] * difficulty_score +
            weights['recency'] * recency_score
        )
        
        # Normalize to 0.0-1.0 range
        return max(0.0, min(1.0, total_score))
    
    def calculate_topic_diversity_score(
        self, 
        topics: list
    ) -> float:
        """
        Calculate diversity score for a list of topics.
        
        Args:
            topics: List of topic names
            
        Returns:
            Float score between 0.0 and 1.0
        """
        if not topics:
            return 0.0
        
        unique_topics = len(set(topics))
        total_topics = len(topics)
        
        # Perfect diversity if all topics are unique
        if unique_topics == total_topics:
            return 1.0
        
        # Calculate diversity ratio
        diversity_ratio = unique_topics / total_topics
        
        # Apply penalty for repetition
        repetition_penalty = 1.0 - (total_topics - unique_topics) / total_topics
        
        return diversity_ratio * repetition_penalty
    
    def calculate_principle_contrast_score(
        self, 
        principle1: Any, 
        principle2: Any
    ) -> float:
        """
        Calculate contrast score between two principles.
        
        Args:
            principle1: First principle
            principle2: Second principle
            
        Returns:
            Float score between 0.0 and 1.0
        """
        if not principle1 or not principle2:
            return 0.0
        
        if principle1.id == principle2.id:
            return 0.0  # Same principle, no contrast
        
        # Check if principles contrast with each other
        if (principle1.contrasts_with.filter(id=principle2.id).exists() or
            principle2.contrasts_with.filter(id=principle1.id).exists()):
            return 1.0  # Perfect contrast
        
        # Check for semantic similarity (could be enhanced)
        # For now, return moderate contrast for different principles
        return 0.5
    
    def get_optimal_weights_for_difficulty(
        self, 
        difficulty: str
    ) -> Dict[str, float]:
        """
        Get optimal weight factors for a given difficulty level.
        
        Args:
            difficulty: Difficulty level ('easy', 'medium', 'hard')
            
        Returns:
            Dictionary with weight factors
        """
        difficulty_weights = {
            'easy': {
                'urgency': 0.3,
                'diversity': 0.2,
                'difficulty_target': 0.3,
                'recency': 0.2
            },
            'medium': {
                'urgency': 0.4,
                'diversity': 0.3,
                'difficulty_target': 0.2,
                'recency': 0.1
            },
            'hard': {
                'urgency': 0.5,
                'diversity': 0.2,
                'difficulty_target': 0.2,
                'recency': 0.1
            }
        }
        
        return difficulty_weights.get(difficulty, self.default_weights)
    
    def normalize_scores(
        self, 
        scores: list, 
        method: str = 'min_max'
    ) -> list:
        """
        Normalize a list of scores to 0.0-1.0 range.
        
        Args:
            scores: List of raw scores
            method: Normalization method ('min_max', 'z_score', 'rank')
            
        Returns:
            List of normalized scores
        """
        if not scores:
            return []
        
        if method == 'min_max':
            min_score = min(scores)
            max_score = max(scores)
            if max_score == min_score:
                return [0.5] * len(scores)
            return [(s - min_score) / (max_score - min_score) for s in scores]
        
        elif method == 'z_score':
            import statistics
            mean_score = statistics.mean(scores)
            std_score = statistics.stdev(scores) if len(scores) > 1 else 1.0
            if std_score == 0:
                return [0.5] * len(scores)
            return [(s - mean_score) / std_score for s in scores]
        
        elif method == 'rank':
            # Convert to rank-based scores
            sorted_scores = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
            rank_scores = [0] * len(scores)
            for rank, (index, _) in enumerate(sorted_scores):
                rank_scores[index] = 1.0 - (rank / len(scores))
            return rank_scores
        
        else:
            raise ValueError(f"Unknown normalization method: {method}")
