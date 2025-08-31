"""
Utility Functions for Interleaving Session Generation

This module provides helper functions and utilities for
interleaving session generation and management.
"""

import hashlib
import random
from typing import List, Dict, Any, Optional, Tuple
from django.utils import timezone
from datetime import timedelta
from backend.apps.generation.models import Flashcard, FlashcardProfile
from collections import Counter


def generate_session_hash(user_id: int, timestamp: str, seed: str = "default") -> str:
    """
    Generate a unique hash for session identification.
    
    Args:
        user_id: User ID
        timestamp: ISO timestamp string
        seed: Optional seed for additional uniqueness
        
    Returns:
        Hex hash string
    """
    content = f"{user_id}:{timestamp}:{seed}"
    return hashlib.md5(content.encode()).hexdigest()[:12]


def create_stable_key_function(seed: Optional[str], user_id: int):
    """
    Create a stable key function for deterministic ordering.
    
    Args:
        seed: Optional seed for deterministic ordering
        user_id: User ID for seed generation
        
    Returns:
        Function that takes an object and returns a stable key
    """
    if seed:
        # Use seed for deterministic ordering
        random.seed(f"{user_id}:{seed}")
        return lambda x: random.random()
    else:
        # Fallback to stable ordering by ID
        return lambda x: x.id


def calculate_topic_diversity_score(topics: List[str]) -> float:
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


def calculate_difficulty_variance(difficulties: List[float]) -> Dict[str, float]:
    """
    Calculate difficulty variance statistics.
    
    Args:
        difficulties: List of difficulty values
        
    Returns:
        Dictionary with variance statistics
    """
    if not difficulties:
        return {}
    
    import statistics
    
    try:
        return {
            'mean': statistics.mean(difficulties),
            'median': statistics.median(difficulties),
            'std_dev': statistics.stdev(difficulties) if len(difficulties) > 1 else 0,
            'min': min(difficulties),
            'max': max(difficulties),
            'range': max(difficulties) - min(difficulties),
            'variance': statistics.variance(difficulties) if len(difficulties) > 1 else 0
        }
    except (statistics.StatisticsError, ValueError):
        return {}


def normalize_scores(scores: List[float], method: str = 'min_max') -> List[float]:
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
        try:
            mean_score = statistics.mean(scores)
            std_score = statistics.stdev(scores) if len(scores) > 1 else 1.0
            if std_score == 0:
                return [0.5] * len(scores)
            return [(s - mean_score) / std_score for s in scores]
        except (statistics.StatisticsError, ValueError):
            return [0.5] * len(scores)
    
    elif method == 'rank':
        # Convert to rank-based scores
        sorted_scores = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
        rank_scores = [0] * len(scores)
        for rank, (index, _) in enumerate(sorted_scores):
            rank_scores[index] = 1.0 - (rank / len(scores))
        return rank_scores
    
    else:
        raise ValueError(f"Unknown normalization method: {method}")


def calculate_contrast_score(item1: Dict[str, Any], item2: Dict[str, Any]) -> float:
    """
    Calculate contrast score between two items.
    
    Args:
        item1: First item
        item2: Second item
        
    Returns:
        Float score between 0.0 and 1.0
    """
    # Check if items have principles
    principle1 = item1.get('principle')
    principle2 = item2.get('principle')
    
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


def get_flashcard_profile_info(flashcard: Flashcard) -> Dict[str, Any]:
    """
    Extract profile information from a flashcard.
    
    Args:
        flashcard: Flashcard instance
        
    Returns:
        Dictionary with profile information
    """
    profile = getattr(flashcard, 'flashcardprofile', None)
    
    if not profile:
        return {
            'topic': None,
            'principle': None,
            'difficulty_est': 2.5,  # Default difficulty
            'has_profile': False
        }
    
    return {
        'topic': profile.topic.name if profile.topic else None,
        'principle': profile.principle,
        'difficulty_est': getattr(profile, 'difficulty_est', 2.5),
        'has_profile': True
    }


def calculate_urgency_score(flashcard: Flashcard) -> float:
    """
    Calculate urgency score based on due status.
    
    Args:
        flashcard: Flashcard instance
        
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
        return min(1.0, 0.6 * (1.1 ** days_overdue))


def calculate_recency_score(flashcard: Flashcard, item_type: str) -> float:
    """
    Calculate recency score based on item type and history.
    
    Args:
        flashcard: Flashcard instance
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


def validate_session_config(config: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate session configuration parameters.
    
    Args:
        config: Configuration dictionary
        
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []
    
    # Check required fields
    required_fields = ['session_size', 'difficulty', 'max_same_topic_streak']
    for field in required_fields:
        if field not in config:
            errors.append(f"Missing required field: {field}")
    
    # Validate session size
    if 'session_size' in config:
        size = config['session_size']
        if not isinstance(size, int) or size <= 0 or size > 100:
            errors.append("session_size must be an integer between 1 and 100")
    
    # Validate difficulty
    if 'difficulty' in config:
        difficulty = config['difficulty']
        valid_difficulties = ['easy', 'medium', 'hard']
        if difficulty not in valid_difficulties:
            errors.append(f"difficulty must be one of: {', '.join(valid_difficulties)}")
    
    # Validate topic streak
    if 'max_same_topic_streak' in config:
        streak = config['max_same_topic_streak']
        if not isinstance(streak, int) or streak <= 0:
            errors.append("max_same_topic_streak must be a positive integer")
    
    return len(errors) == 0, errors


def format_session_metadata(session_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Format session metadata for display.
    
    Args:
        session_items: List of session items
        
    Returns:
        Formatted metadata dictionary
    """
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
        'difficulty_stats': calculate_difficulty_variance(difficulties),
        'contrast_pairs': count_contrast_pairs(session_items)
    }
    
    return metadata


def count_contrast_pairs(session_items: List[Dict[str, Any]]) -> int:
    """
    Count total contrast pairs in session.
    
    Args:
        session_items: List of session items
        
    Returns:
        Number of contrast pairs
    """
    contrast_count = 0
    
    for i in range(len(session_items) - 1):
        current = session_items[i]
        next_item = session_items[i + 1]
        
        if calculate_contrast_score(current, next_item) > 0.7:
            contrast_count += 1
    
    return contrast_count


def get_optimal_weights_for_difficulty(difficulty: str) -> Dict[str, float]:
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
    
    return difficulty_weights.get(difficulty, {
        'urgency': 0.4,
        'diversity': 0.3,
        'difficulty_target': 0.2,
        'recency': 0.1
    })


def log_session_event(event_type: str, user_id: int, **kwargs):
    """
    Log session-related events for observability.
    
    Args:
        event_type: Type of event
        user_id: User ID
        **kwargs: Additional event data
    """
    import logging
    logger = logging.getLogger(__name__)
    
    log_data = {
        'event': f'interleaving.{event_type}',
        'user_id': user_id,
        'timestamp': timezone.now().isoformat(),
        **kwargs
    }
    
    logger.info(f"Interleaving event: {log_data}")
