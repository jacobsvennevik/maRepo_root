"""
Tests for spaced repetition scheduler services.

This module tests the ReviewSession and ReviewScheduleManager classes
that provide high-level interfaces for managing reviews and analytics.
"""

from datetime import datetime, timedelta
from django.test import TestCase
from django.utils import timezone
from unittest.mock import Mock, patch, MagicMock

from backend.apps.generation.services.scheduler import (
    ReviewSession, 
    ReviewScheduleManager
)
from backend.apps.generation.services.spaced_repetition import ReviewQuality
from backend.apps.generation.tests.factories import FlashcardFactory, FlashcardSetFactory
from backend.apps.accounts.tests.factories import CustomUserFactory


class TestReviewSession(TestCase):
    """Test the ReviewSession class."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.session_limit = 5
        self.session = ReviewSession(self.user, self.session_limit)
    
    def test_session_initialization(self):
        """Test that sessions are initialized correctly."""
        self.assertEqual(self.session.user, self.user)
        self.assertEqual(self.session.session_limit, self.session_limit)
        
        # Check initial session stats
        stats = self.session.session_stats
        self.assertEqual(stats['total_cards'], 0)
        self.assertEqual(stats['correct_cards'], 0)
        self.assertEqual(stats['average_response_time'], 0)
        self.assertEqual(len(stats['cards_reviewed']), 0)
        self.assertIsNotNone(stats['session_start'])
        self.assertIsNone(stats['session_end'])
    
    @patch('backend.apps.generation.services.scheduler.SpacedRepetitionScheduler.get_due_cards')
    def test_get_next_card_with_due_cards(self, mock_get_due_cards):
        """Test getting next card when cards are due."""
        # Create mock due cards
        mock_card = Mock()
        mock_queryset = Mock()
        mock_queryset.exists.return_value = True
        mock_queryset.first.return_value = mock_card
        mock_get_due_cards.return_value = mock_queryset
        
        next_card = self.session.get_next_card()
        
        self.assertEqual(next_card, mock_card)
        mock_get_due_cards.assert_called_once_with(self.user, limit=5)
    
    @patch('backend.apps.generation.services.scheduler.SpacedRepetitionScheduler.get_due_cards')
    def test_get_next_card_no_due_cards(self, mock_get_due_cards):
        """Test getting next card when no cards are due."""
        mock_queryset = Mock()
        mock_queryset.exists.return_value = False
        mock_get_due_cards.return_value = mock_queryset
        
        next_card = self.session.get_next_card()
        
        self.assertIsNone(next_card)
    
    @patch('backend.apps.generation.services.scheduler.SpacedRepetitionScheduler.process_review')
    def test_review_card_successful(self, mock_process_review):
        """Test successful card review."""
        # Mock card and review data
        mock_card = Mock()
        mock_card.id = 1
        mock_card.algorithm = 'sm2'
        
        mock_updated_data = {
            'interval': 6.0,
            'repetitions': 1,
            'next_review': timezone.now() + timedelta(days=6)
        }
        mock_process_review.return_value = mock_updated_data
        
        # Review the card
        quality = ReviewQuality.PERFECT
        response_time = 12.5
        
        self.session.review_card(mock_card, quality, response_time)
        
        # Check that scheduler was called
        mock_process_review.assert_called_once_with(mock_card, quality)
        
        # Check that card was updated
        for field, value in mock_updated_data.items():
            assert hasattr(mock_card, field)  # Verify setattr was called
        mock_card.save.assert_called_once()
        
        # Check session stats were updated
        stats = self.session.session_stats
        self.assertEqual(stats['total_cards'], 1)
        self.assertEqual(stats['correct_cards'], 1)  # Quality 5 is correct
        self.assertEqual(len(stats['cards_reviewed']), 1)
        
        # Check card review details
        card_review = stats['cards_reviewed'][0]
        self.assertEqual(card_review['card_id'], 1)
        self.assertEqual(card_review['quality'], quality)
        self.assertEqual(card_review['response_time'], response_time)
        self.assertEqual(card_review['algorithm_used'], 'sm2')
        self.assertEqual(card_review['new_interval'], 6.0)
    
    @patch('backend.apps.generation.services.scheduler.SpacedRepetitionScheduler.process_review')
    def test_review_card_failed(self, mock_process_review):
        """Test failed card review."""
        mock_card = Mock()
        mock_card.id = 1
        mock_card.algorithm = 'sm2'
        
        mock_updated_data = {'interval': 1.0, 'repetitions': 0}
        mock_process_review.return_value = mock_updated_data
        
        # Review with poor quality
        self.session.review_card(mock_card, ReviewQuality.COMPLETE_BLACKOUT)
        
        stats = self.session.session_stats
        self.assertEqual(stats['total_cards'], 1)
        self.assertEqual(stats['correct_cards'], 0)  # Quality 0 is incorrect
    
    def test_finish_session(self):
        """Test finishing a review session."""
        # Add some mock reviewed cards
        self.session.session_stats['total_cards'] = 3
        self.session.session_stats['correct_cards'] = 2
        self.session.session_stats['cards_reviewed'] = [
            {'response_time': 10.0},
            {'response_time': 15.0},
            {'response_time': None}  # Some cards might not have response time
        ]
        
        final_stats = self.session.finish_session()
        
        # Check that session end time is set
        self.assertIsNotNone(final_stats['session_end'])
        
        # Check that duration is calculated
        self.assertIn('session_duration_minutes', final_stats)
        self.assertGreater(final_stats['session_duration_minutes'], 0)
        
        # Check average response time calculation
        self.assertEqual(final_stats['average_response_time'], 12.5)  # (10 + 15) / 2
        
        # Check accuracy calculation
        self.assertEqual(final_stats['accuracy_percentage'], 66.67)  # 2/3 * 100, rounded
    
    def test_finish_session_no_cards(self):
        """Test finishing session with no cards reviewed."""
        final_stats = self.session.finish_session()
        
        self.assertEqual(final_stats['accuracy_percentage'], 0)
        self.assertEqual(final_stats['average_response_time'], 0)


class TestReviewScheduleManager(TestCase):
    """Test the ReviewScheduleManager class."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.manager = ReviewScheduleManager()
        
        # Create some test flashcards
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        self.cards = []
        for i in range(5):
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                algorithm='sm2',
                learning_state='review',
                total_reviews=i + 1,
                correct_reviews=i,
                interval=float(i + 1),
                next_review=timezone.now() + timedelta(days=i)
            )
            self.cards.append(card)
    
    def test_get_review_dashboard(self):
        """Test getting comprehensive dashboard data."""
        dashboard = self.manager.get_review_dashboard(self.user)
        
        # Check structure
        required_keys = [
            'status_counts', 'due_timeframes', 'algorithm_stats', 
            'retention_data', 'last_updated'
        ]
        for key in required_keys:
            self.assertIn(key, dashboard)
        
        # Check status counts
        status_counts = dashboard['status_counts']
        self.assertEqual(status_counts['total_cards'], 5)
        self.assertIn('due_now', status_counts)
        self.assertIn('learning', status_counts)
        self.assertIn('review', status_counts)
        self.assertIn('new', status_counts)
        
        # Check due timeframes
        due_timeframes = dashboard['due_timeframes']
        required_timeframes = ['overdue', 'due_today', 'due_tomorrow', 'due_this_week']
        for timeframe in required_timeframes:
            self.assertIn(timeframe, due_timeframes)
    
    def test_get_upcoming_reviews(self):
        """Test getting upcoming review schedule."""
        schedule = self.manager.get_upcoming_reviews(self.user, days_ahead=3)
        
        self.assertEqual(len(schedule), 3)  # Should return 3 days
        
        for day_data in schedule:
            required_keys = ['date', 'total_due', 'breakdown', 'is_today']
            for key in required_keys:
                self.assertIn(key, day_data)
            
            # Check that first day is marked as today
            if day_data['date'] == timezone.now().date():
                self.assertTrue(day_data['is_today'])
    
    def test_optimize_daily_schedule(self):
        """Test schedule optimization recommendations."""
        optimization = self.manager.optimize_daily_schedule(self.user, target_daily_reviews=3)
        
        required_keys = [
            'current_avg_daily', 'peak_day_count', 'target_daily_reviews',
            'overloaded_days', 'underloaded_days', 'schedule_health'
        ]
        for key in required_keys:
            self.assertIn(key, optimization)
        
        self.assertEqual(optimization['target_daily_reviews'], 3)
        self.assertIn(optimization['schedule_health'], ['good', 'needs_optimization'])
    
    def test_get_learning_analytics(self):
        """Test learning analytics generation."""
        analytics = self.manager.get_learning_analytics(self.user, timeframe_days=7)
        
        required_keys = [
            'overall_accuracy', 'total_reviews', 'algorithm_performance',
            'learning_curve', 'timeframe_days'
        ]
        for key in required_keys:
            self.assertIn(key, analytics)
        
        self.assertEqual(analytics['timeframe_days'], 7)
        self.assertIsInstance(analytics['algorithm_performance'], dict)
        self.assertIsInstance(analytics['learning_curve'], list)
    
    def test_suggest_study_plan(self):
        """Test study plan suggestions."""
        study_plan = self.manager.suggest_study_plan(self.user, available_time_minutes=15)
        
        required_keys = [
            'recommended_cards', 'estimated_duration_minutes', 'total_due_cards',
            'cards_breakdown', 'study_focus'
        ]
        for key in required_keys:
            self.assertIn(key, study_plan)
        
        self.assertIsInstance(study_plan['recommended_cards'], list)
        self.assertLessEqual(study_plan['estimated_duration_minutes'], 15)
        
        # Check cards breakdown
        breakdown = study_plan['cards_breakdown']
        priority_keys = ['high_priority', 'medium_priority', 'low_priority']
        for key in priority_keys:
            self.assertIn(key, breakdown)
    
    def test_determine_study_focus(self):
        """Test study focus determination."""
        # Test with no cards
        focus = self.manager._determine_study_focus([])
        self.assertEqual(focus, "no_cards_due")
        
        # Test with low retention cards
        low_retention_cards = [
            {'retention': 0.3, 'urgency': 0},
            {'retention': 0.4, 'urgency': 0}
        ]
        focus = self.manager._determine_study_focus(low_retention_cards)
        self.assertEqual(focus, "review_difficult_cards")
        
        # Test with overdue cards
        overdue_cards = [
            {'retention': 0.8, 'urgency': 2},
            {'retention': 0.7, 'urgency': 3}
        ]
        focus = self.manager._determine_study_focus(overdue_cards)
        self.assertEqual(focus, "catch_up_overdue")
        
        # Test with normal cards
        normal_cards = [
            {'retention': 0.8, 'urgency': 0},
            {'retention': 0.9, 'urgency': 0}
        ]
        focus = self.manager._determine_study_focus(normal_cards)
        self.assertEqual(focus, "maintenance_review")


class TestReviewScheduleManagerIntegration(TestCase):
    """Integration tests for ReviewScheduleManager with real data."""
    
    def setUp(self):
        """Set up realistic test scenario."""
        self.user = CustomUserFactory()
        self.manager = ReviewScheduleManager()
        
        # Create flashcard sets with various states
        self.create_realistic_flashcards()
    
    def create_realistic_flashcards(self):
        """Create flashcards in various learning states and due dates."""
        flashcard_set = FlashcardSetFactory(owner=self.user)
        
        # New cards (never reviewed)
        for i in range(3):
            FlashcardFactory(
                flashcard_set=flashcard_set,
                learning_state='new',
                total_reviews=0,
                correct_reviews=0,
                next_review=timezone.now()
            )
        
        # Learning cards (recently started)
        for i in range(2):
            FlashcardFactory(
                flashcard_set=flashcard_set,
                learning_state='learning',
                total_reviews=2,
                correct_reviews=1,
                interval=3.0,
                next_review=timezone.now() + timedelta(days=i)
            )
        
        # Review cards (established)
        for i in range(4):
            FlashcardFactory(
                flashcard_set=flashcard_set,
                learning_state='review',
                total_reviews=5 + i,
                correct_reviews=4 + i,
                interval=float(7 + i * 3),
                next_review=timezone.now() + timedelta(days=i + 2)
            )
        
        # Overdue cards
        for i in range(2):
            FlashcardFactory(
                flashcard_set=flashcard_set,
                learning_state='review',
                total_reviews=10,
                correct_reviews=8,
                interval=14.0,
                next_review=timezone.now() - timedelta(days=i + 1)
            )
    
    def test_realistic_dashboard_data(self):
        """Test dashboard with realistic data distribution."""
        dashboard = self.manager.get_review_dashboard(self.user)
        
        status_counts = dashboard['status_counts']
        
        # Check expected counts
        self.assertEqual(status_counts['total_cards'], 11)  # 3+2+4+2
        self.assertEqual(status_counts['new'], 3)
        self.assertEqual(status_counts['learning'], 2)
        self.assertEqual(status_counts['review'], 6)  # 4+2
        
        # Should have some due cards (new cards + overdue)
        self.assertGreaterEqual(status_counts['due_now'], 5)  # At least new + overdue
        
        # Check due timeframes
        due_timeframes = dashboard['due_timeframes']
        self.assertGreaterEqual(due_timeframes['overdue'], 2)
    
    def test_realistic_study_plan(self):
        """Test study plan with realistic card distribution."""
        study_plan = self.manager.suggest_study_plan(self.user, available_time_minutes=10)
        
        # Should recommend some cards
        self.assertGreater(len(study_plan['recommended_cards']), 0)
        
        # Should not exceed time limit (10 minutes = ~20 cards)
        self.assertLessEqual(len(study_plan['recommended_cards']), 20)
        
        # Study focus should be reasonable
        valid_focuses = [
            'review_difficult_cards', 'catch_up_overdue', 
            'maintenance_review', 'no_cards_due'
        ]
        self.assertIn(study_plan['study_focus'], valid_focuses)
    
    def test_realistic_learning_analytics(self):
        """Test analytics with realistic learning data."""
        analytics = self.manager.get_learning_analytics(self.user, timeframe_days=30)
        
        # Should have some overall accuracy
        self.assertGreater(analytics['overall_accuracy'], 0)
        self.assertLessEqual(analytics['overall_accuracy'], 100)
        
        # Should have some reviews tracked
        self.assertGreater(analytics['total_reviews'], 0)
        
        # Algorithm performance should include SM-2
        self.assertIn('sm2', analytics['algorithm_performance'])
        
        # Learning curve should have entries for days with reviews
        self.assertGreater(len(analytics['learning_curve']), 0)


class TestReviewSessionIntegration(TestCase):
    """Integration tests for ReviewSession with real flashcards."""
    
    def setUp(self):
        """Set up integration test scenario."""
        self.user = CustomUserFactory()
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        
        # Create due cards
        self.due_cards = []
        for i in range(3):
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                learning_state='review',
                next_review=timezone.now() - timedelta(hours=i)  # Overdue
            )
            self.due_cards.append(card)
    
    def test_complete_review_session(self):
        """Test a complete review session workflow."""
        session = ReviewSession(self.user, session_limit=2)
        
        # Get and review first card
        card1 = session.get_next_card()
        self.assertIsNotNone(card1)
        session.review_card(card1, ReviewQuality.PERFECT, 10.0)
        
        # Get and review second card
        card2 = session.get_next_card()
        self.assertIsNotNone(card2)
        session.review_card(card2, ReviewQuality.CORRECT_DIFFICULT, 15.0)
        
        # Should hit session limit
        card3 = session.get_next_card()
        self.assertIsNone(card3)  # Should be None due to session limit
        
        # Finish session
        final_stats = session.finish_session()
        
        # Check final statistics
        self.assertEqual(final_stats['total_cards'], 2)
        self.assertEqual(final_stats['correct_cards'], 2)  # Both were correct
        self.assertEqual(final_stats['accuracy_percentage'], 100.0)
        self.assertEqual(final_stats['average_response_time'], 12.5)  # (10 + 15) / 2
        
        # Check that cards were actually updated in database
        card1.refresh_from_db()
        card2.refresh_from_db()
        
        self.assertGreater(card1.total_reviews, 0)
        self.assertGreater(card2.total_reviews, 0)
        self.assertIsNotNone(card1.last_reviewed)
        self.assertIsNotNone(card2.last_reviewed) 