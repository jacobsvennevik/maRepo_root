"""
Study Planner for Spaced Repetition Scheduling

This module handles study planning, session optimization,
and provides recommendations for optimal learning sessions.
"""

from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.db import transaction
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from ..spaced_repetition import SpacedRepetitionScheduler


class StudyPlanner:
    """
    Provides study planning and optimization recommendations.
    
    This class analyzes user's learning patterns and due cards
    to suggest optimal study sessions and learning strategies.
    """
    
    def __init__(self):
        self.scheduler = SpacedRepetitionScheduler()
        self.default_card_time_estimate = 30  # seconds per card
    
    def suggest_study_plan(
        self, 
        user, 
        available_time_minutes: int = 20,
        focus_areas: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Suggest an optimal study plan based on available time and due cards.
        
        Args:
            user: User instance
            available_time_minutes: Available study time in minutes
            focus_areas: Optional list of topics or principles to focus on
            
        Returns:
            Recommended study plan with prioritized cards
        """
        from ..models import Flashcard
        
        # Estimate how many cards can be reviewed
        estimated_cards_possible = self._estimate_cards_for_time(available_time_minutes)
        
        # Get due cards with priority scoring
        due_cards = self.scheduler.get_due_cards(user, limit=estimated_cards_possible * 2)
        
        # Score and prioritize cards
        prioritized_cards = self._prioritize_cards(due_cards, focus_areas)
        
        # Select optimal cards for the session
        recommended_cards = prioritized_cards[:estimated_cards_possible]
        
        # Generate study plan
        study_plan = self._generate_study_plan(
            recommended_cards, 
            available_time_minutes,
            focus_areas
        )
        
        return study_plan
    
    def _estimate_cards_for_time(self, available_time_minutes: int) -> int:
        """
        Estimate how many cards can be reviewed in the available time.
        
        Args:
            available_time_minutes: Available study time in minutes
            
        Returns:
            Estimated number of cards that can be reviewed
        """
        # Base estimate: 30 seconds per card
        base_estimate = available_time_minutes * 2
        
        # Adjust based on time availability
        if available_time_minutes <= 10:
            # Short sessions: more focused, slightly faster
            return int(base_estimate * 1.1)
        elif available_time_minutes <= 30:
            # Medium sessions: standard pace
            return int(base_estimate)
        else:
            # Long sessions: can take more time per card
            return int(base_estimate * 0.9)
    
    def _prioritize_cards(
        self, 
        due_cards, 
        focus_areas: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Prioritize cards based on urgency, difficulty, and focus areas.
        
        Args:
            due_cards: QuerySet of due flashcards
            focus_areas: Optional list of topics or principles to focus on
            
        Returns:
            List of cards with priority scores, sorted by priority
        """
        prioritized_cards = []
        
        for card in due_cards:
            # Calculate base priority components
            urgency_score = self._calculate_urgency_score(card)
            difficulty_score = self._calculate_difficulty_score(card)
            focus_score = self._calculate_focus_score(card, focus_areas)
            
            # Combine scores with weights
            priority_score = (
                urgency_score * 0.4 +
                difficulty_score * 0.4 +
                focus_score * 0.2
            )
            
            prioritized_cards.append({
                'card': card,
                'priority_score': priority_score,
                'urgency_score': urgency_score,
                'difficulty_score': difficulty_score,
                'focus_score': focus_score,
                'retention': self._get_card_retention(card),
                'interval': card.interval,
                'algorithm': card.algorithm
            })
        
        # Sort by priority score (descending)
        prioritized_cards.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return prioritized_cards
    
    def _calculate_urgency_score(self, card) -> float:
        """
        Calculate urgency score based on how overdue the card is.
        
        Args:
            card: Flashcard instance
            
        Returns:
            Float between 0.0 and 1.0 representing urgency
        """
        if not card.next_review:
            return 1.0  # Highest urgency for cards without next review
        
        now = timezone.now()
        days_overdue = (now - card.next_review).days
        
        if days_overdue <= 0:
            return 0.8  # Due today
        elif days_overdue <= 1:
            return 0.9  # Due yesterday
        elif days_overdue <= 3:
            return 0.7  # Due within last 3 days
        elif days_overdue <= 7:
            return 0.5  # Due within last week
        else:
            # Exponential decay for very overdue cards
            return min(1.0, 0.3 + (days_overdue - 7) * 0.1)
    
    def _calculate_difficulty_score(self, card) -> float:
        """
        Calculate difficulty score based on card performance.
        
        Args:
            card: Flashcard instance
            
        Returns:
            Float between 0.0 and 1.0 representing difficulty
        """
        if card.total_reviews == 0:
            return 0.5  # Neutral score for new cards
        
        # Calculate retention rate
        retention_rate = card.correct_reviews / card.total_reviews
        
        # Lower retention = higher difficulty = higher priority
        difficulty_score = 1.0 - retention_rate
        
        # Adjust based on algorithm and interval
        if hasattr(card, 'algorithm') and card.algorithm == 'sm2':
            # For SM2, consider ease factor
            if hasattr(card, 'ease_factor'):
                if card.ease_factor < 1.3:
                    difficulty_score *= 1.2  # Boost priority for low ease factor
                elif card.ease_factor > 2.5:
                    difficulty_score *= 0.8  # Reduce priority for high ease factor
        
        return min(1.0, max(0.0, difficulty_score))
    
    def _calculate_focus_score(
        self, 
        card, 
        focus_areas: Optional[List[str]] = None
    ) -> float:
        """
        Calculate focus score based on specified focus areas.
        
        Args:
            card: Flashcard instance
            focus_areas: List of topics or principles to focus on
            
        Returns:
            Float between 0.0 and 1.0 representing focus relevance
        """
        if not focus_areas:
            return 0.5  # Neutral score if no focus areas specified
        
        # Check if card matches any focus area
        card_profile = getattr(card, 'flashcardprofile', None)
        if not card_profile:
            return 0.5
        
        # Check topic match
        if hasattr(card_profile, 'topic') and card_profile.topic:
            if card_profile.topic.name in focus_areas:
                return 1.0
        
        # Check principle match
        if hasattr(card_profile, 'principle') and card_profile.principle:
            if card_profile.principle.name in focus_areas:
                return 1.0
        
        # Check flashcard set name match
        if hasattr(card, 'flashcard_set') and card.flashcard_set:
            if card.flashcard_set.name in focus_areas:
                return 0.8
        
        return 0.3  # Lower score for non-focus areas
    
    def _get_card_retention(self, card) -> float:
        """
        Get card retention rate safely.
        
        Args:
            card: Flashcard instance
            
        Returns:
            Float between 0.0 and 1.0 representing retention
        """
        try:
            return self.scheduler.get_card_retention(card)
        except Exception:
            # Fallback to basic calculation
            if card.total_reviews > 0:
                return card.correct_reviews / card.total_reviews
            return 0.5
    
    def _generate_study_plan(
        self, 
        recommended_cards: List[Dict[str, Any]], 
        available_time_minutes: int,
        focus_areas: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive study plan.
        
        Args:
            recommended_cards: List of prioritized cards
            available_time_minutes: Available study time
            focus_areas: Optional focus areas
            
        Returns:
            Complete study plan dictionary
        """
        if not recommended_cards:
            return self._generate_empty_study_plan(available_time_minutes)
        
        # Calculate plan statistics
        total_cards = len(recommended_cards)
        estimated_duration = total_cards * (self.default_card_time_estimate / 60)
        
        # Analyze card distribution
        priority_distribution = self._analyze_priority_distribution(recommended_cards)
        algorithm_distribution = self._analyze_algorithm_distribution(recommended_cards)
        difficulty_distribution = self._analyze_difficulty_distribution(recommended_cards)
        
        # Generate study focus recommendation
        study_focus = self._determine_study_focus(recommended_cards)
        
        # Create session breakdown
        session_breakdown = self._create_session_breakdown(
            recommended_cards, 
            available_time_minutes
        )
        
        return {
            'recommended_cards': [item['card'].id for item in recommended_cards],
            'total_cards': total_cards,
            'estimated_duration_minutes': estimated_duration,
            'available_time_minutes': available_time_minutes,
            'time_efficiency': min(1.0, estimated_duration / available_time_minutes),
            'priority_distribution': priority_distribution,
            'algorithm_distribution': algorithm_distribution,
            'difficulty_distribution': difficulty_distribution,
            'study_focus': study_focus,
            'session_breakdown': session_breakdown,
            'focus_areas': focus_areas,
            'study_recommendations': self._generate_study_recommendations(
                recommended_cards, 
                study_focus,
                available_time_minutes
            )
        }
    
    def _generate_empty_study_plan(self, available_time_minutes: int) -> Dict[str, Any]:
        """Generate a study plan when no cards are due."""
        return {
            'recommended_cards': [],
            'total_cards': 0,
            'estimated_duration_minutes': 0,
            'available_time_minutes': available_time_minutes,
            'time_efficiency': 0.0,
            'study_focus': 'no_cards_due',
            'study_recommendations': [
                'No cards are currently due for review.',
                'Consider adding new cards to your collection.',
                'Use this time to review previously learned material.',
                'Check your learning schedule for upcoming reviews.'
            ]
        }
    
    def _analyze_priority_distribution(self, cards: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze the distribution of cards by priority level."""
        high_priority = len([c for c in cards if c['priority_score'] > 0.7])
        medium_priority = len([c for c in cards if 0.4 <= c['priority_score'] <= 0.7])
        low_priority = len([c for c in cards if c['priority_score'] < 0.4])
        
        return {
            'high_priority': high_priority,
            'medium_priority': medium_priority,
            'low_priority': low_priority
        }
    
    def _analyze_algorithm_distribution(self, cards: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze the distribution of cards by algorithm."""
        distribution = {}
        for card in cards:
            algorithm = card.get('algorithm', 'unknown')
            distribution[algorithm] = distribution.get(algorithm, 0) + 1
        
        return distribution
    
    def _analyze_difficulty_distribution(self, cards: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze the distribution of cards by difficulty."""
        easy_cards = len([c for c in cards if c['difficulty_score'] < 0.3])
        medium_cards = len([c for c in cards if 0.3 <= c['difficulty_score'] <= 0.7])
        hard_cards = len([c for c in cards if c['difficulty_score'] > 0.7])
        
        return {
            'easy': easy_cards,
            'medium': medium_cards,
            'hard': hard_cards
        }
    
    def _determine_study_focus(self, cards: List[Dict[str, Any]]) -> str:
        """Determine the main focus of the study session."""
        if not cards:
            return 'no_cards_due'
        
        avg_difficulty = sum(item['difficulty_score'] for item in cards) / len(cards)
        avg_urgency = sum(item['urgency_score'] for item in cards) / len(cards)
        
        if avg_difficulty > 0.7:
            return 'review_difficult_cards'
        elif avg_urgency > 0.7:
            return 'catch_up_overdue'
        elif avg_difficulty < 0.3:
            return 'reinforce_easy_cards'
        else:
            return 'balanced_review'
    
    def _create_session_breakdown(
        self, 
        cards: List[Dict[str, Any]], 
        available_time_minutes: int
    ) -> Dict[str, Any]:
        """Create a breakdown of how to structure the study session."""
        if not cards:
            return {}
        
        # Suggest session structure
        total_cards = len(cards)
        
        if total_cards <= 10:
            # Short session: single block
            session_structure = [{'cards': total_cards, 'duration_minutes': available_time_minutes}]
        elif total_cards <= 25:
            # Medium session: two blocks with break
            block1_cards = total_cards // 2
            block2_cards = total_cards - block1_cards
            session_structure = [
                {'cards': block1_cards, 'duration_minutes': available_time_minutes * 0.45},
                {'break': True, 'duration_minutes': available_time_minutes * 0.1},
                {'cards': block2_cards, 'duration_minutes': available_time_minutes * 0.45}
            ]
        else:
            # Long session: multiple blocks with breaks
            blocks = []
            cards_per_block = max(15, total_cards // 3)
            remaining_cards = total_cards
            
            while remaining_cards > 0:
                block_size = min(cards_per_block, remaining_cards)
                block_duration = (block_size / total_cards) * available_time_minutes * 0.8
                
                blocks.append({'cards': block_size, 'duration_minutes': block_duration})
                remaining_cards -= block_size
                
                if remaining_cards > 0:
                    blocks.append({'break': True, 'duration_minutes': available_time_minutes * 0.05})
            
            session_structure = blocks
        
        return {
            'structure': session_structure,
            'total_blocks': len([b for b in session_structure if 'cards' in b]),
            'total_breaks': len([b for b in session_structure if b.get('break')]),
            'estimated_completion_time': sum(
                b.get('duration_minutes', 0) for b in session_structure
            )
        }
    
    def _generate_study_recommendations(
        self, 
        cards: List[Dict[str, Any]], 
        study_focus: str,
        available_time_minutes: int
    ) -> List[str]:
        """Generate personalized study recommendations."""
        recommendations = []
        
        # Base recommendations
        if study_focus == 'review_difficult_cards':
            recommendations.extend([
                'Focus on understanding difficult concepts before moving on.',
                'Take your time with each card - quality over quantity.',
                'Consider reviewing related easier cards for context.'
            ])
        elif study_focus == 'catch_up_overdue':
            recommendations.extend([
                'Prioritize overdue cards to maintain learning momentum.',
                'Don\'t rush - maintain accuracy even when catching up.',
                'Consider extending your study session if possible.'
            ])
        elif study_focus == 'balanced_review':
            recommendations.extend([
                'This is a well-balanced review session.',
                'Maintain consistent pace throughout the session.',
                'Focus on areas where you feel less confident.'
            ])
        
        # Time-based recommendations
        if available_time_minutes <= 15:
            recommendations.append('Short session - focus on high-priority cards only.')
        elif available_time_minutes >= 45:
            recommendations.append('Long session - take breaks to maintain focus.')
        
        # Algorithm-specific recommendations
        sm2_cards = [c for c in cards if c.get('algorithm') == 'sm2']
        if len(sm2_cards) > len(cards) * 0.7:
            recommendations.append('Mostly SM2 cards - pay attention to ease factor changes.')
        
        return recommendations
