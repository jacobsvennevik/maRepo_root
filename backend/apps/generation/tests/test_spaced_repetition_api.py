"""
Tests for spaced repetition API endpoints.

This module tests all the REST API endpoints for spaced repetition functionality
including review sessions, analytics, and card management.
"""

import json
from datetime import datetime, timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, Mock

from backend.apps.generation.models import Flashcard, FlashcardSet
from backend.apps.generation.tests.factories import FlashcardFactory, FlashcardSetFactory
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.generation.services.spaced_repetition import ReviewQuality


class SpacedRepetitionAPIBaseTest(APITestCase):
    """Base test class for spaced repetition API tests."""
    
    def setUp(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.client = APIClient()
        # Enable authentication for tests
        self.client.force_authenticate(user=self.user)
        
        # Create test flashcard set and cards
        self.flashcard_set = FlashcardSetFactory(owner=self.user)
        self.flashcards = []
        
        # Create cards with different states
        for i in range(5):
            # Make first 2 cards due now, rest due in the future
            if i < 2:
                next_review = timezone.now() - timedelta(hours=1)  # Due now (overdue)
            else:
                next_review = timezone.now() + timedelta(days=i+1)  # Due in future
            
            card = FlashcardFactory(
                flashcard_set=self.flashcard_set,
                algorithm='sm2',
                learning_state='new' if i < 2 else 'review',
                total_reviews=i,
                correct_reviews=max(0, i-1),
                interval=float(i + 1),
                next_review=next_review,
            )
            self.flashcards.append(card)


class TestFlashcardViewSetSpacedRepetition(SpacedRepetitionAPIBaseTest):
    """Test FlashcardViewSet spaced repetition endpoints."""
    
    def test_review_card_success(self):
        """Test successful card review."""
        card = self.flashcards[0]
        url = f'/api/flashcards/{card.id}/review/'
        
        data = {
            'quality': ReviewQuality.PERFECT,
            'response_time_seconds': 12.5
        }
        
        response = self.client.post(url, data, format='json')
        
        # Debug: Print response data if there's an error
        if response.status_code != status.HTTP_200_OK:
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('card', response.data['data'])
        self.assertIn('message', response.data['data'])
        
        # Check that card was updated
        card.refresh_from_db()
        self.assertGreater(card.total_reviews, 0)
        self.assertIsNotNone(card.last_reviewed)
    
    def test_review_card_invalid_quality(self):
        """Test card review with invalid quality score."""
        card = self.flashcards[0]
        url = f'/api/flashcards/{card.id}/review/'
        
        data = {'quality': 6}  # Invalid quality (should be 0-5)
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_reset_card(self):
        """Test resetting a card to new state."""
        card = self.flashcards[2]  # Use a card that's not new
        url = f'/generation/api/flashcards/{card.id}/reset/'
        
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('card', response.data['data'])
        self.assertIn('message', response.data['data'])
        
        # Check that card was reset
        card.refresh_from_db()
        self.assertEqual(card.learning_state, 'new')
        self.assertEqual(card.repetitions, 0)
    
    def test_get_card_retention(self):
        """Test getting retention probability for a card."""
        card = self.flashcards[2]
        url = f'/generation/api/flashcards/{card.id}/retention/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_fields = [
            'card_id', 'retention', 'interval', 'memory_strength',
            'next_review', 'learning_state'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
        
        self.assertEqual(response.data['card_id'], card.id)
        self.assertIsInstance(response.data['retention'], float)
        self.assertGreaterEqual(response.data['retention'], 0.0)
        self.assertLessEqual(response.data['retention'], 1.0)


class TestFlashcardSetViewSetSpacedRepetition(SpacedRepetitionAPIBaseTest):
    """Test FlashcardSetViewSet spaced repetition endpoints."""
    
    def test_get_review_stats(self):
        """Test getting review statistics for a flashcard set."""
        url = f'/generation/api/flashcard-sets/{self.flashcard_set.id}/review-stats/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_fields = [
            'total_cards', 'due_cards', 'learning_cards', 'review_cards',
            'new_cards', 'average_accuracy', 'algorithm_breakdown'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
        
        self.assertEqual(response.data['total_cards'], 5)
        self.assertIsInstance(response.data['algorithm_breakdown'], dict)
    
    def test_get_review_stats_empty_set(self):
        """Test getting review stats for empty flashcard set."""
        empty_set = FlashcardSetFactory(owner=self.user)
        url = f'/generation/api/flashcard-sets/{empty_set.id}/review-stats/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_cards'], 0)
        self.assertEqual(response.data['average_accuracy'], 0)


class TestDueCardsAPI(SpacedRepetitionAPIBaseTest):
    """Test DueCardsAPIView."""
    
    def test_get_due_cards_default(self):
        """Test getting due cards with default parameters."""
        url = '/generation/api/review/due-cards/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cards', response.data)
        self.assertIn('total_due', response.data)
        self.assertIsInstance(response.data['cards'], list)
    
    def test_get_due_cards_with_filters(self):
        """Test getting due cards with filters."""
        url = '/generation/api/review/due-cards/'
        params = {
            'limit': 3,
            'algorithm': 'sm2',
            'learning_state': 'review'
        }
        
        response = self.client.get(url, params)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['cards']), 3)
    
    def test_get_due_cards_invalid_algorithm(self):
        """Test getting due cards with invalid algorithm filter."""
        url = '/generation/api/review/due-cards/'
        params = {'algorithm': 'invalid_algorithm'}
        
        response = self.client.get(url, params)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestReviewSessionAPI(SpacedRepetitionAPIBaseTest):
    """Test ReviewSessionAPIView."""
    
    @patch('backend.apps.generation.services.scheduler.ReviewSession')
    def test_start_review_session_with_cards(self, mock_session_class):
        """Test starting a review session when cards are available."""
        # Mock session and card
        mock_session = Mock()
        mock_card = Mock()
        mock_card.id = 1
        mock_session.get_next_card.return_value = mock_card
        mock_session.session_stats = {
            'total_cards': 0,
            'correct_cards': 0,
            'session_start': timezone.now()
        }
        mock_session_class.return_value = mock_session
        
        url = '/generation/api/review/session/'
        data = {'session_limit': 10}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('session_stats', response.data)
        self.assertIn('next_card', response.data)
        self.assertIn('message', response.data)
        self.assertIsNotNone(response.data['next_card'])
    
    def test_start_review_session_no_cards(self):
        """Test starting a review session when no cards are available."""
        # Create a new user with no flashcards to ensure no cards are available
        user_without_cards = CustomUserFactory()
        self.client.force_authenticate(user=user_without_cards)
        
        url = '/generation/api/review/session/'
        data = {'session_limit': 10}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['next_card'])
        self.assertIn('No cards due', response.data['message'])
        
        # Restore original user authentication
        self.client.force_authenticate(user=self.user)
    
    def test_start_review_session_invalid_limit(self):
        """Test starting session with invalid session limit."""
        url = '/generation/api/review/session/'
        data = {'session_limit': 0}  # Invalid limit
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestReviewDashboardAPI(SpacedRepetitionAPIBaseTest):
    """Test ReviewDashboardAPIView."""
    
    @patch('backend.apps.generation.services.ReviewScheduleManager.get_review_dashboard')
    def test_get_dashboard(self, mock_get_dashboard):
        """Test getting review dashboard data."""
        mock_dashboard_data = {
            'status_counts': {
                'total_cards': 5,
                'due_now': 2,
                'learning': 1,
                'review': 3,
                'new': 1
            },
            'due_timeframes': {
                'overdue': 1,
                'due_today': 1,
                'due_tomorrow': 2,
                'due_this_week': 4
            },
            'algorithm_stats': [],
            'retention_data': [],
            'last_updated': timezone.now()
        }
        mock_get_dashboard.return_value = mock_dashboard_data
        
        url = '/generation/api/review/dashboard/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_fields = [
            'status_counts', 'due_timeframes', 'algorithm_stats',
            'retention_data', 'last_updated'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)


class TestUpcomingReviewsAPI(SpacedRepetitionAPIBaseTest):
    """Test UpcomingReviewsAPIView."""
    
    @patch('backend.apps.generation.services.ReviewScheduleManager.get_upcoming_reviews')
    def test_get_upcoming_reviews_default(self, mock_get_upcoming):
        """Test getting upcoming reviews with default parameters."""
        mock_schedule = [
            {
                'date': timezone.now().date(),
                'total_due': 2,
                'breakdown': [],
                'is_today': True
            }
        ]
        mock_get_upcoming.return_value = mock_schedule
        
        url = '/generation/api/review/upcoming/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('schedule', response.data)
        self.assertIn('days_ahead', response.data)
        self.assertEqual(response.data['days_ahead'], 7)  # Default value
    
    def test_get_upcoming_reviews_custom_days(self):
        """Test getting upcoming reviews with custom days ahead."""
        url = '/generation/api/review/upcoming/'
        params = {'days_ahead': 14}
        
        response = self.client.get(url, params)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['days_ahead'], 14)
    
    def test_get_upcoming_reviews_invalid_days(self):
        """Test getting upcoming reviews with invalid days ahead."""
        url = '/generation/api/review/upcoming/'
        params = {'days_ahead': 50}  # Exceeds max of 30
        
        response = self.client.get(url, params)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestStudyPlanAPI(SpacedRepetitionAPIBaseTest):
    """Test StudyPlanAPIView."""
    
    @patch('backend.apps.generation.services.ReviewScheduleManager.suggest_study_plan')
    def test_get_study_plan(self, mock_suggest_plan):
        """Test getting personalized study plan."""
        mock_plan = {
            'recommended_cards': [1, 2, 3],
            'estimated_duration_minutes': 7.5,
            'total_due_cards': 5,
            'cards_breakdown': {
                'high_priority': 2,
                'medium_priority': 1,
                'low_priority': 0
            },
            'study_focus': 'catch_up_overdue'
        }
        mock_suggest_plan.return_value = mock_plan
        
        url = '/generation/api/review/study-plan/'
        data = {'available_time_minutes': 15}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_fields = [
            'recommended_cards', 'estimated_duration_minutes', 'total_due_cards',
            'cards_breakdown', 'study_focus'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
    
    def test_get_study_plan_invalid_time(self):
        """Test getting study plan with invalid time."""
        url = '/generation/api/review/study-plan/'
        data = {'available_time_minutes': 0}  # Invalid time
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestLearningAnalyticsAPI(SpacedRepetitionAPIBaseTest):
    """Test LearningAnalyticsAPIView."""
    
    @patch('backend.apps.generation.services.ReviewScheduleManager.get_learning_analytics')
    def test_get_learning_analytics(self, mock_get_analytics):
        """Test getting learning analytics."""
        mock_analytics = {
            'overall_accuracy': 85.5,
            'total_reviews': 25,
            'algorithm_performance': {
                'sm2': {
                    'total_cards': 10,
                    'total_reviews': 25,
                    'accuracy': 85.5,
                    'avg_interval': 8.2
                }
            },
            'learning_curve': [
                {'date': timezone.now().date(), 'reviews': 5, 'accuracy': 80.0}
            ],
            'timeframe_days': 30
        }
        mock_get_analytics.return_value = mock_analytics
        
        url = '/generation/api/review/analytics/'
        params = {'timeframe_days': 30}
        
        response = self.client.get(url, params)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_fields = [
            'overall_accuracy', 'total_reviews', 'algorithm_performance',
            'learning_curve', 'timeframe_days'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
    
    def test_get_learning_analytics_invalid_timeframe(self):
        """Test getting analytics with invalid timeframe."""
        url = '/generation/api/review/analytics/'
        params = {'timeframe_days': 400}  # Exceeds max of 365
        
        response = self.client.get(url, params)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestScheduleOptimizationAPI(SpacedRepetitionAPIBaseTest):
    """Test ScheduleOptimizationAPIView."""
    
    @patch('backend.apps.generation.services.ReviewScheduleManager.optimize_daily_schedule')
    def test_get_schedule_optimization(self, mock_optimize):
        """Test getting schedule optimization recommendations."""
        mock_optimization = {
            'current_avg_daily': 15.2,
            'peak_day_count': 25,
            'target_daily_reviews': 20,
            'overloaded_days': 3,
            'underloaded_days': 2,
            'schedule_health': 'needs_optimization',
            'suggestions': [
                'Consider reviewing 3 days early to distribute load',
                'Use study ahead feature on light days'
            ]
        }
        mock_optimize.return_value = mock_optimization
        
        url = '/generation/api/review/optimize/'
        data = {'target_daily_reviews': 20}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_fields = [
            'current_avg_daily', 'peak_day_count', 'target_daily_reviews',
            'overloaded_days', 'underloaded_days', 'schedule_health'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
    
    def test_get_schedule_optimization_invalid_target(self):
        """Test optimization with invalid target daily reviews."""
        url = '/generation/api/review/optimize/'
        data = {'target_daily_reviews': 0}  # Invalid target
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestSpacedRepetitionAPIIntegration(SpacedRepetitionAPIBaseTest):
    """Integration tests for the complete API workflow."""
    
    def test_complete_review_workflow(self):
        """Test a complete review workflow through the APIs."""
        # 1. Get dashboard to see current state
        dashboard_response = self.client.get('/generation/api/review/dashboard/')
        self.assertEqual(dashboard_response.status_code, status.HTTP_200_OK)
        
        # 2. Get due cards
        due_cards_response = self.client.get('/generation/api/review/due-cards/?limit=2')
        self.assertEqual(due_cards_response.status_code, status.HTTP_200_OK)
        
        due_cards = due_cards_response.data['cards']
        if due_cards:
            # 3. Review a card
            card_id = due_cards[0]['id']
            review_response = self.client.post(
                f'/generation/api/flashcards/{card_id}/review/',
                {'quality': ReviewQuality.PERFECT, 'response_time_seconds': 10.0},
                format='json'
            )
            self.assertEqual(review_response.status_code, status.HTTP_200_OK)
        
        # 4. Get study plan
        study_plan_response = self.client.post(
            '/generation/api/review/study-plan/',
            {'available_time_minutes': 15},
            format='json'
        )
        self.assertEqual(study_plan_response.status_code, status.HTTP_200_OK)
        
        # 5. Get analytics
        analytics_response = self.client.get('/generation/api/review/analytics/?timeframe_days=7')
        self.assertEqual(analytics_response.status_code, status.HTTP_200_OK)
    
    def test_api_error_handling(self):
        """Test error handling across APIs."""
        # Test with non-existent card ID
        response = self.client.post('/generation/api/flashcards/99999/review/', {
            'quality': 3
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test with invalid data formats
        response = self.client.post('/generation/api/review/study-plan/', {
            'available_time_minutes': 'invalid'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_api_response_formats(self):
        """Test that all APIs return properly formatted responses."""
        apis_to_test = [
            ('/generation/api/review/dashboard/', 'GET', {}),
            ('/generation/api/review/due-cards/', 'GET', {}),
            ('/generation/api/review/upcoming/', 'GET', {}),
            ('/generation/api/review/analytics/', 'GET', {}),
            ('/generation/api/review/study-plan/', 'POST', {'available_time_minutes': 10}),
            ('/generation/api/review/optimize/', 'POST', {'target_daily_reviews': 15}),
        ]
        
        for url, method, data in apis_to_test:
            if method == 'GET':
                response = self.client.get(url)
            else:
                response = self.client.post(url, data, format='json')
            
            # All APIs should return successful responses or proper error codes
            self.assertIn(response.status_code, [200, 400, 404])
            
            # Response should be valid JSON
            self.assertIsInstance(response.data, dict)


class TestAPIPerformance(SpacedRepetitionAPIBaseTest):
    """Test API performance with larger datasets."""
    
    def setUp(self):
        """Set up larger test dataset."""
        super().setUp()
        
        # Create additional flashcard sets and cards for performance testing
        for set_num in range(3):
            flashcard_set = FlashcardSetFactory(owner=self.user)
            for card_num in range(20):
                FlashcardFactory(
                    flashcard_set=flashcard_set,
                    algorithm='sm2',
                    learning_state='review',
                    total_reviews=card_num + 1,
                    correct_reviews=card_num,
                    next_review=timezone.now() + timedelta(days=card_num % 10)
                )
    
    def test_dashboard_performance_large_dataset(self):
        """Test dashboard performance with larger dataset."""
        url = '/generation/api/review/dashboard/'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should complete reasonably quickly even with ~100 cards
        self.assertGreater(response.data['status_counts']['total_cards'], 50)
    
    def test_due_cards_pagination(self):
        """Test that due cards API properly handles large numbers of due cards."""
        # Make many cards due
        Flashcard.objects.filter(flashcard_set__owner=self.user).update(
            next_review=timezone.now() - timedelta(hours=1)
        )
        
        url = '/generation/api/review/due-cards/?limit=10'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['cards']), 10)  # Should respect limit 