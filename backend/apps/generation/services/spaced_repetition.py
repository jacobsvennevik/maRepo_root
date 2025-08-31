"""
Spaced Repetition Algorithms Service

This module implements scientifically-backed spaced repetition algorithms:
1. Leitner System - Simple box-based system with exponential intervals
2. SM-2 Algorithm - Adaptive system used in Anki with ease factors

Both algorithms are based on the forgetting curve: R(t) = e^(-t/S)
where R(t) is retention at time t, and S is memory strength.
"""

import math
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple
from django.utils import timezone
from enum import IntEnum


class ReviewQuality(IntEnum):
    """SM-2 quality grades for review responses."""
    COMPLETE_BLACKOUT = 0      # complete blackout
    INCORRECT_EASY = 1         # incorrect response; easy to recall correct
    INCORRECT_HESITANT = 2     # incorrect response; where correct seemed easy to recall
    CORRECT_DIFFICULT = 3      # correct response recalled with serious difficulty
    CORRECT_HESITANT = 4       # correct response after hesitation
    PERFECT = 5                # perfect response


class LeitnerBox(IntEnum):
    """Leitner box levels with corresponding intervals."""
    BOX_1 = 1  # Daily
    BOX_2 = 2  # Every 3 days
    BOX_3 = 3  # Weekly
    BOX_4 = 4  # Bi-weekly
    BOX_5 = 5  # Monthly


class SpacedRepetitionAlgorithms:
    """
    Implementation of spaced repetition algorithms with memory science foundations.
    """
    
    # Leitner system intervals (in days)
    LEITNER_INTERVALS = {
        LeitnerBox.BOX_1: 1,
        LeitnerBox.BOX_2: 3,
        LeitnerBox.BOX_3: 7,
        LeitnerBox.BOX_4: 14,
        LeitnerBox.BOX_5: 30,
    }
    
    # SM-2 Constants
    SM2_MIN_EASE_FACTOR = 1.3
    SM2_INITIAL_EASE_FACTOR = 2.5
    SM2_INITIAL_INTERVAL = 1
    SM2_GRADUATION_INTERVAL = 6
    
    # Memory strength constants
    RETENTION_THRESHOLD = 0.7  # Review when retention drops below 70%
    
    @staticmethod
    def calculate_retention(days_since_review: float, memory_strength: float) -> float:
        """
        Calculate current retention using forgetting curve: R(t) = e^(-t/S)
        
        Args:
            days_since_review: Days since last review
            memory_strength: Current memory strength (higher = more memorable)
            
        Returns:
            Current retention probability (0.0 to 1.0)
        """
        if days_since_review <= 0:
            return 1.0
        
        return math.exp(-days_since_review / memory_strength)
    
    @staticmethod
    def update_memory_strength(current_strength: float, quality: int, 
                             interval: float) -> float:
        """
        Update memory strength based on review performance.
        
        Args:
            current_strength: Current memory strength
            quality: Review quality (0-5)
            interval: Days since last review
            
        Returns:
            Updated memory strength
        """
        if quality >= ReviewQuality.CORRECT_DIFFICULT:
            # Successful recall strengthens memory
            strength_multiplier = 1.3 + (quality - 3) * 0.2
            return current_strength * strength_multiplier
        else:
            # Failed recall weakens memory
            return max(1.0, current_strength * 0.7)


class LeitnerAlgorithm(SpacedRepetitionAlgorithms):
    """
    Leitner System implementation with exponential intervals.
    
    Cards start in Box 1 and move up on success, down on failure.
    Each box has progressively longer intervals.
    """
    
    @classmethod
    def calculate_next_review(cls, card_data: Dict[str, Any], 
                            quality: int) -> Dict[str, Any]:
        """
        Calculate next review date using Leitner system.
        
        Args:
            card_data: Current card state
            quality: Review quality (0-5)
            
        Returns:
            Updated card data with new schedule
        """
        current_box = card_data.get('leitner_box', 1)
        repetitions = card_data.get('repetitions', 0)
        memory_strength = card_data.get('memory_strength', 1.0)
        
        # Determine if review was successful
        is_correct = quality >= ReviewQuality.CORRECT_DIFFICULT
        
        if is_correct:
            # Move to next box (max box 5)
            new_box = min(current_box + 1, LeitnerBox.BOX_5)
            new_repetitions = repetitions + 1
            learning_state = 'review' if new_box >= LeitnerBox.BOX_3 else 'learning'
        else:
            # Move back to box 1
            new_box = LeitnerBox.BOX_1
            new_repetitions = 0
            learning_state = 'relearning'
        
        # Calculate new interval
        interval = cls.LEITNER_INTERVALS[new_box]
        
        # Update memory strength
        new_memory_strength = cls.update_memory_strength(
            memory_strength, quality, interval
        )
        
        # Calculate next review date
        next_review = (timezone.now() + timedelta(days=interval))  # Removed .date()
        
        return {
            'leitner_box': new_box,
            'interval': float(interval),
            'repetitions': new_repetitions,
            'memory_strength': new_memory_strength,
            'next_review': next_review,
            'last_reviewed': timezone.now(),
            'learning_state': learning_state,
            'total_reviews': card_data.get('total_reviews', 0) + 1,
            'correct_reviews': card_data.get('correct_reviews', 0) + (1 if is_correct else 0)
        }


class SM2Algorithm(SpacedRepetitionAlgorithms):
    """
    SM-2 Algorithm implementation (used in Anki).
    
    Uses ease factors that adapt based on review difficulty.
    More sophisticated than Leitner with personalized intervals.
    """
    
    @classmethod
    def calculate_next_review(cls, card_data: Dict[str, Any], 
                            quality: int) -> Dict[str, Any]:
        """
        Calculate next review date using SM-2 algorithm.
        
        Args:
            card_data: Current card state
            quality: Review quality (0-5)
            
        Returns:
            Updated card data with new schedule
        """
        ease_factor = card_data.get('ease_factor', cls.SM2_INITIAL_EASE_FACTOR)
        interval = card_data.get('interval', cls.SM2_INITIAL_INTERVAL)
        repetitions = card_data.get('repetitions', 0)
        memory_strength = card_data.get('memory_strength', 1.0)
        
        # Update ease factor based on quality
        new_ease_factor = cls._update_ease_factor(ease_factor, quality)
        
        # Determine if review was successful
        is_correct = quality >= ReviewQuality.CORRECT_DIFFICULT
        
        if is_correct:
            # Successful review
            if repetitions == 0:
                new_interval = 1
                learning_state = 'learning'
            elif repetitions == 1:
                new_interval = cls.SM2_GRADUATION_INTERVAL
                learning_state = 'review'
            else:
                new_interval = interval * new_ease_factor
                learning_state = 'review'
            
            new_repetitions = repetitions + 1
        else:
            # Failed review - reset to beginning
            new_interval = 1
            new_repetitions = 0
            learning_state = 'relearning'
        
        # Update memory strength
        new_memory_strength = cls.update_memory_strength(
            memory_strength, quality, new_interval
        )
        
        # Calculate next review date
        next_review = (timezone.now() + timedelta(days=new_interval))  # Removed .date()
        
        return {
            'ease_factor': new_ease_factor,
            'interval': new_interval,
            'repetitions': new_repetitions,
            'memory_strength': new_memory_strength,
            'next_review': next_review,
            'last_reviewed': timezone.now(),
            'learning_state': learning_state,
            'total_reviews': card_data.get('total_reviews', 0) + 1,
            'correct_reviews': card_data.get('correct_reviews', 0) + (1 if is_correct else 0)
        }
    
    @classmethod
    def _update_ease_factor(cls, current_ease: float, quality: int) -> float:
        """
        Update ease factor based on review quality.
        
        Args:
            current_ease: Current ease factor
            quality: Review quality (0-5)
            
        Returns:
            Updated ease factor
        """
        new_ease = current_ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        return max(cls.SM2_MIN_EASE_FACTOR, new_ease)


class SpacedRepetitionScheduler:
    """
    Main scheduler that orchestrates different algorithms and provides unified interface.
    """
    
    def __init__(self):
        self.algorithms = {
            'leitner': LeitnerAlgorithm,
            'sm2': SM2Algorithm,
        }
    
    def process_review(self, flashcard, quality: int) -> Dict[str, Any]:
        """
        Process a card review and update scheduling.
        
        Args:
            flashcard: Flashcard model instance
            quality: Review quality (0-5)
            
        Returns:
            Updated card data
        """
        algorithm_class = self.algorithms.get(flashcard.algorithm)
        if not algorithm_class:
            raise ValueError(f"Unknown algorithm: {flashcard.algorithm}")
        
        # Prepare current card data
        card_data = {
            'algorithm': flashcard.algorithm,
            'interval': flashcard.interval,
            'repetitions': flashcard.repetitions,
            'memory_strength': flashcard.memory_strength,
            'ease_factor': flashcard.ease_factor,
            'leitner_box': flashcard.leitner_box,
            'learning_state': flashcard.learning_state,
            'total_reviews': flashcard.total_reviews,
            'correct_reviews': flashcard.correct_reviews,
        }
        
        # Calculate new schedule
        updated_data = algorithm_class.calculate_next_review(card_data, quality)
        
        return updated_data
    
    def get_due_cards(self, user, limit: int = None) -> 'QuerySet':
        """
        Get cards that are due for review for a specific user.
        
        Args:
            user: User instance
            limit: Maximum number of cards to return
            
        Returns:
            QuerySet of due flashcards
        """
        from ..models import Flashcard
        
        queryset = Flashcard.objects.filter(
            flashcard_set__owner=user,
            next_review__lte=timezone.now()
        ).order_by('next_review')
        
        if limit:
            queryset = queryset[:limit]
        
        return queryset
    
    def get_card_retention(self, flashcard) -> float:
        """
        Calculate current retention probability for a card.
        
        Args:
            flashcard: Flashcard model instance
            
        Returns:
            Current retention probability (0.0 to 1.0)
        """
        if not flashcard.last_reviewed:
            return 1.0
        
        days_since_review = (timezone.now() - flashcard.last_reviewed).days
        return SpacedRepetitionAlgorithms.calculate_retention(
            days_since_review, flashcard.memory_strength
        )
    
    def predict_next_review_dates(self, flashcard, quality_sequence: list) -> list:
        """
        Predict future review dates based on a sequence of expected qualities.
        
        Args:
            flashcard: Flashcard model instance
            quality_sequence: List of expected quality scores
            
        Returns:
            List of predicted review dates
        """
        algorithm_class = self.algorithms.get(flashcard.algorithm)
        if not algorithm_class:
            raise ValueError(f"Unknown algorithm: {flashcard.algorithm}")
        
        current_data = {
            'algorithm': flashcard.algorithm,
            'interval': flashcard.interval,
            'repetitions': flashcard.repetitions,
            'memory_strength': flashcard.memory_strength,
            'ease_factor': flashcard.ease_factor,
            'leitner_box': flashcard.leitner_box,
            'learning_state': flashcard.learning_state,
            'total_reviews': flashcard.total_reviews,
            'correct_reviews': flashcard.correct_reviews,
        }
        
        predicted_dates = []
        for quality in quality_sequence:
            updated_data = algorithm_class.calculate_next_review(current_data, quality)
            predicted_dates.append(updated_data['next_review'])
            current_data.update(updated_data)
        
        return predicted_dates 