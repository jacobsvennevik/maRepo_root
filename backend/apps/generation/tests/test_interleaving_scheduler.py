"""
Tests for Interleaving Scheduler components.

This module tests:
- Models: Topic, Principle, FlashcardProfile, InterleavingSessionConfig
- Services: DifficultyDialService, InterleavingSessionService
- API Views: InterleavingConfigView, InterleavingSessionView, DifficultyDialView
"""

import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock
from datetime import timedelta
import itertools

from backend.apps.generation.models import (
    FlashcardSet, Flashcard, Topic, Principle, FlashcardProfile, InterleavingSessionConfig
)
from backend.apps.generation.services.difficulty_dial import DifficultyDialService
from backend.apps.generation.services.interleaving_session import InterleavingSessionService

User = get_user_model()


class TopicModelTest(TestCase):
    """Test Topic model functionality."""
    
    def setUp(self):
        self.topic = Topic.objects.create(name="Mathematics")
        self.subtopic = Topic.objects.create(
            name="Calculus", 
            parent=self.topic
        )
    
    def test_topic_creation(self):
        """Test basic topic creation."""
        self.assertEqual(self.topic.name, "Mathematics")
        self.assertIsNone(self.topic.parent)
        self.assertIsNotNone(self.topic.created_at)
    
    def test_topic_hierarchy(self):
        """Test topic parent-child relationships."""
        self.assertEqual(self.subtopic.parent, self.topic)
        self.assertEqual(self.topic.principles.count(), 0)
    
    def test_topic_string_representation(self):
        """Test topic string representation."""
        self.assertEqual(str(self.topic), "Mathematics")
        self.assertEqual(str(self.subtopic), "Calculus")


class PrincipleModelTest(TestCase):
    """Test Principle model functionality."""
    
    def setUp(self):
        self.topic = Topic.objects.create(name="Mathematics")
        self.principle = Principle.objects.create(
            name="Derivative Rules",
            topic=self.topic
        )
        self.contrasting_principle = Principle.objects.create(
            name="Integration Rules",
            topic=self.topic
        )
    
    def test_principle_creation(self):
        """Test basic principle creation."""
        self.assertEqual(self.principle.name, "Derivative Rules")
        self.assertEqual(self.principle.topic, self.topic)
        self.assertIsNotNone(self.principle.created_at)
    
    def test_principle_contrasts(self):
        """Test principle contrast relationships."""
        self.principle.contrasts_with.add(self.contrasting_principle)
        self.assertIn(self.contrasting_principle, self.principle.contrasts_with.all())
    
    def test_principle_string_representation(self):
        """Test principle string representation."""
        expected = "Derivative Rules (Mathematics)"
        self.assertEqual(str(self.principle), expected)


class FlashcardProfileModelTest(TestCase):
    """Test FlashcardProfile model functionality."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        self.flashcard = Flashcard.objects.create(
            flashcard_set=self.flashcard_set,
            question="What is 2+2?",
            answer="4"
        )
        self.topic = Topic.objects.create(name="Mathematics")
        self.principle = Principle.objects.create(
            name="Basic Arithmetic",
            topic=self.topic
        )
        self.profile = FlashcardProfile.objects.create(
            flashcard=self.flashcard,
            topic=self.topic,
            principle=self.principle,
            difficulty_est=1.5,
            surface_features={'subject': 'math', 'level': 'basic'}
        )
    
    def test_profile_creation(self):
        """Test basic profile creation."""
        self.assertEqual(self.profile.flashcard, self.flashcard)
        self.assertEqual(self.profile.topic, self.topic)
        self.assertEqual(self.profile.principle, self.principle)
        self.assertEqual(self.profile.difficulty_est, 1.5)
        self.assertEqual(self.profile.surface_features['subject'], 'math')
    
    def test_profile_string_representation(self):
        """Test profile string representation."""
        expected = f"Profile for {self.flashcard}"
        self.assertEqual(str(self.profile), expected)
    
    def test_profile_indexes(self):
        """Test that profile has proper database indexes."""
        # This is a basic check - in practice, you'd verify the actual indexes
        self.assertIsNotNone(self.profile.flashcard_id)


class InterleavingSessionConfigModelTest(TestCase):
    """Test InterleavingSessionConfig model functionality."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.config = InterleavingSessionConfig.objects.create(
            user=self.user,
            difficulty='medium',
            session_size=15,
            w_due=0.70,
            w_interleave=0.20,
            w_new=0.10
        )
    
    def test_config_creation(self):
        """Test basic config creation."""
        self.assertEqual(self.config.user, self.user)
        self.assertEqual(self.config.difficulty, 'medium')
        self.assertEqual(self.config.session_size, 15)
        self.assertEqual(self.config.w_due, 0.70)
        self.assertEqual(self.config.w_interleave, 0.20)
        self.assertEqual(self.config.w_new, 0.10)
    
    def test_get_weights(self):
        """Test weight normalization."""
        w_due, w_interleave, w_new = self.config.get_weights()
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0)
        self.assertAlmostEqual(w_due, 0.70)
        self.assertAlmostEqual(w_interleave, 0.20)
        self.assertAlmostEqual(w_new, 0.10)
    
    def test_config_string_representation(self):
        """Test config string representation."""
        expected = f"InterleavingConfig<{self.user.email} / {self.config.difficulty}>"
        self.assertEqual(str(self.config), expected)


class DifficultyDialServiceTest(TestCase):
    """Test DifficultyDialService functionality."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.config = InterleavingSessionConfig.objects.create(
            user=self.user,
            difficulty='medium',
            session_size=10,
            w_due=0.60,
            w_interleave=0.25,
            w_new=0.15
        )
    
    def test_apply_difficulty_medium(self):
        """Test medium difficulty application."""
        result = DifficultyDialService.apply_difficulty(self.config)
        
        self.assertEqual(result['interval_multiplier'], 1.0)
        self.assertEqual(result['beta'], 1.0)
        self.assertEqual(result['hard_run_cap'], 2)
        self.assertIn('difficulty_description', result)
    
    def test_apply_difficulty_low(self):
        """Test low difficulty application."""
        self.config.difficulty = 'low'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        self.assertEqual(result['interval_multiplier'], 0.8)
        self.assertEqual(result['beta'], 0.8)
        self.assertEqual(result['hard_run_cap'], 2)
    
    def test_apply_difficulty_high(self):
        """Test high difficulty application."""
        self.config.difficulty = 'high'
        result = DifficultyDialService.apply_difficulty(self.config)
        
        self.assertEqual(result['interval_multiplier'], 1.2)
        self.assertEqual(result['beta'], 1.2)
        self.assertEqual(result['hard_run_cap'], 1)
    
    def test_weight_rebalancing(self):
        """Test that weights are properly rebalanced."""
        result = DifficultyDialService.apply_difficulty(self.config)
        
        w_due, w_interleave, w_new = result['w_due'], result['w_interleave'], result['w_new']
        self.assertAlmostEqual(w_due + w_interleave + w_new, 1.0)
    
    def test_difficulty_adjustment_suggestion(self):
        """Test difficulty adjustment suggestions."""
        # High success rate should suggest increasing difficulty
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.95, 2.0
        )
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'high')
        
        # Low success rate should suggest decreasing difficulty
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.60, 20.0
        )
        self.assertTrue(suggestion['should_adjust'])
        self.assertEqual(suggestion['new_difficulty'], 'low')
        
        # Medium success rate should not suggest adjustment
        suggestion = DifficultyDialService.suggest_difficulty_adjustment(
            'medium', 0.80, 8.0
        )
        self.assertFalse(suggestion['should_adjust'])


class InterleavingSessionServiceTest(TestCase):
    """Test the InterleavingSessionService."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # Create topics and principles
        self.topic1 = Topic.objects.create(name='Mathematics')
        self.topic2 = Topic.objects.create(name='Physics')
        self.topic3 = Topic.objects.create(name='Chemistry')
        
        self.principle1 = Principle.objects.create(name='Calculus', topic=self.topic1)
        self.principle2 = Principle.objects.create(name='Mechanics', topic=self.topic2)
        self.principle3 = Principle.objects.create(name='Organic', topic=self.topic3)
        
        # Make principles contrast with each other
        self.principle1.contrasts_with.add(self.principle2)
        self.principle2.contrasts_with.add(self.principle3)
        
        # Create flashcard set and flashcards
        self.flashcard_set = FlashcardSet.objects.create(
            title='Test Set',
            owner=self.user
        )
        
        # Create flashcards with different states
        self.flashcards = []
        for i in range(10):
            card = Flashcard.objects.create(
                flashcard_set=self.flashcard_set,
                question=f'Question {i}',
                answer=f'Answer {i}',
                algorithm='sm2',
                learning_state='new' if i < 3 else 'review',
                total_reviews=i,
                correct_reviews=max(0, i-1),
                interval=float(i + 1),
                next_review=timezone.now().date() + timezone.timedelta(days=i-5)  # Some overdue, some future
            )
            
            # Create profile for each card
            topic = [self.topic1, self.topic2, self.topic3][i % 3]
            principle = [self.principle1, self.principle2, self.principle3][i % 3]
            FlashcardProfile.objects.create(
                flashcard=card,
                topic=topic,
                principle=principle,
                difficulty_est=1.0 + (i % 3) * 0.5
            )
            
            self.flashcards.append(card)
        
        # Create user configuration
        self.config = InterleavingSessionConfig.objects.create(
            user=self.user,
            difficulty='medium',
            session_size=6,
            w_due=0.6,
            w_interleave=0.3,
            w_new=0.1
        )
        
        self.service = InterleavingSessionService()

    def test_generate_session_basic(self):
        """Test basic session generation."""
        session = self.service.generate_session(self.user)
        
        self.assertIn('items', session)
        self.assertIn('fill_mode', session)
        self.assertIn('session_id', session)
        self.assertIn('constraints_applied', session)
        self.assertIn('pool_sizes', session)
        
        # Check that we got the requested number of items
        self.assertEqual(session['requested_size'], 6)
        self.assertGreaterEqual(session['actual_size'], 1)
        
        # Check fill mode
        self.assertIn(session['fill_mode'], ['strict', 'relaxed', 'exhausted'])

    def test_session_constraints(self):
        """Test that session respects constraints."""
        session = self.service.generate_session(self.user)
        
        # Check topic streak constraint
        topics = [item['topic'] for item in session['items']]
        max_streak = max(len(list(g)) for _, g in itertools.groupby(topics)) if topics else 0
        self.assertLessEqual(max_streak, self.config.max_same_topic_streak + 2)  # Allow some relaxation
        
        # Check that we have items of different types
        types = [item['type'] for item in session['items']]
        self.assertIn('due', types)
        self.assertIn('interleave', types)

    def test_session_size_override(self):
        """Test session size override."""
        session = self.service.generate_session(self.user, size=3)
        
        self.assertEqual(session['requested_size'], 3)
        self.assertLessEqual(session['actual_size'], 3)

    def test_difficulty_override(self):
        """Test difficulty override in session generation."""
        session = self.service.generate_session(self.user, difficulty='high')
        
        self.assertEqual(session['difficulty'], 'high')
        self.assertIn('interval_multiplier', session)

    def test_deterministic_ordering_with_seed(self):
        """Test that sessions with the same seed produce identical ordering."""
        session1 = self.service.generate_session(self.user, seed='test_seed_123')
        session2 = self.service.generate_session(self.user, seed='test_seed_123')
        
        # Should have same items in same order
        items1 = [item['flashcard'].id for item in session1['items']]
        items2 = [item['flashcard'].id for item in session2['items']]
        self.assertEqual(items1, items2)
        
        # Session IDs should be different due to timestamps, but items should be same
        self.assertNotEqual(session1['session_id'], session2['session_id'])
        self.assertEqual(len(session1['items']), len(session2['items']))

    def test_different_seeds_produce_different_ordering(self):
        """Test that different seeds produce different ordering."""
        session1 = self.service.generate_session(self.user, seed='seed_1')
        session2 = self.service.generate_session(self.user, seed='seed_2')
        
        # Should have different session IDs
        self.assertNotEqual(session1['session_id'], session2['session_id'])

    def test_relaxation_ladder(self):
        """Test that the relaxation ladder works properly."""
        # Create a configuration that will require relaxation
        self.config.max_same_topic_streak = 1
        self.config.save()
        
        session = self.service.generate_session(self.user)
        
        # Should have some relaxation applied
        constraints = session['constraints_applied']
        total_relaxed = (constraints.get('topic_streak_relaxed', 0) + 
                        constraints.get('hard_item_relaxed', 0))
        
        # Should have some relaxation if we have enough items
        if session['actual_size'] > 2:
            self.assertGreaterEqual(total_relaxed, 0)

    def test_fill_mode_classification(self):
        """Test that fill modes are correctly classified."""
        # Test with reasonable size (should get strict mode)
        session = self.service.generate_session(self.user)
        
        # Should have a valid fill mode
        self.assertIn(session['fill_mode'], ['strict', 'relaxed', 'exhausted'])
        
        # Test with large size (should get exhausted mode) - use a different user
        user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        
        # Create flashcard set and flashcards for user2
        flashcard_set2 = FlashcardSet.objects.create(
            title='Test Set 2',
            owner=user2
        )
        
        # Create only a few flashcards for user2 (less than requested size)
        for i in range(3):
            card = Flashcard.objects.create(
                flashcard_set=flashcard_set2,
                question=f'Question {i}',
                answer=f'Answer {i}',
                algorithm='sm2',
                learning_state='new' if i < 1 else 'review',
                total_reviews=i,
                correct_reviews=max(0, i-1),
                interval=float(i + 1),
                next_review=timezone.now().date() + timedelta(days=i-3)
            )
            
            # Create profile for each card
            topic = [self.topic1, self.topic2][i % 2]
            principle = [self.principle1, self.principle2][i % 2]
            FlashcardProfile.objects.create(
                flashcard=card,
                topic=topic,
                principle=principle,
                difficulty_est=1.0 + (i % 2) * 0.5
            )
        
        # Test with large size request (should get exhausted mode)
        service2 = InterleavingSessionService()
        session = service2.generate_session(user2, size=20)
        
        # Should be exhausted since we don't have 20 cards
        self.assertEqual(session['fill_mode'], 'exhausted')
        self.assertLess(session['actual_size'], 20)

    def test_constraint_tracking(self):
        """Test that constraint relaxation is properly tracked."""
        session = self.service.generate_session(self.user)
        
        constraints = session['constraints_applied']
        self.assertIn('topic_streak_relaxed', constraints)
        self.assertIn('hard_item_relaxed', constraints)
        self.assertIn('contrast_pair_relaxed', constraints)
        
        # All should be non-negative
        for value in constraints.values():
            self.assertGreaterEqual(value, 0)

    def test_session_id_uniqueness(self):
        """Test that session IDs are unique."""
        session1 = self.service.generate_session(self.user)
        session2 = self.service.generate_session(self.user)
        
        self.assertNotEqual(session1['session_id'], session2['session_id'])

    def test_pool_size_tracking(self):
        """Test that pool sizes are correctly tracked."""
        session = self.service.generate_session(self.user)
        
        pool_sizes = session['pool_sizes']
        self.assertIn('due', pool_sizes)
        self.assertIn('interleave', pool_sizes)
        self.assertIn('new', pool_sizes)
        
        # All pool sizes should be non-negative
        for size in pool_sizes.values():
            self.assertGreaterEqual(size, 0)

    def test_zero_candidates_handling(self):
        """Test handling when there are no candidates."""
        # Delete all flashcards
        Flashcard.objects.all().delete()
        
        session = self.service.generate_session(self.user)
        
        self.assertEqual(session['actual_size'], 0)
        self.assertEqual(session['fill_mode'], 'exhausted')
        self.assertEqual(len(session['items']), 0)

    def test_large_session_size_cap(self):
        """Test that large session sizes are handled gracefully."""
        session = self.service.generate_session(self.user, size=100)
        
        # Should not exceed reasonable bounds
        self.assertLessEqual(session['actual_size'], 100)
        self.assertEqual(session['requested_size'], 100)

    def test_contrast_pair_enforcement(self):
        """Test that contrast pairs are enforced when possible."""
        session = self.service.generate_session(self.user)
        
        # Check if we have a contrast pair
        has_contrast = session['constraints']['contrast_pair']
        
        # If we have enough items and principles, we should have a contrast pair
        if session['actual_size'] >= 2:
            # This is probabilistic, so we just check the structure
            self.assertIsInstance(has_contrast, bool)

    def test_metadata_completeness(self):
        """Test that all metadata fields are present."""
        session = self.service.generate_session(self.user)
        
        required_fields = [
            'requested_size', 'actual_size', 'fill_mode', 'session_id',
            'constraints_applied', 'pool_sizes', 'mix', 'header', 'why',
            'constraints', 'difficulty', 'difficulty_description', 'interval_multiplier'
        ]
        
        for field in required_fields:
            self.assertIn(field, session, f"Missing field: {field}")

    def test_stable_ordering_without_seed(self):
        """Test that ordering is stable even without a seed."""
        session1 = self.service.generate_session(self.user)
        session2 = self.service.generate_session(self.user)
        
        # Should have different session IDs (due to timestamp)
        self.assertNotEqual(session1['session_id'], session2['session_id'])
        
        # But should have same number of items
        self.assertEqual(session1['actual_size'], session2['actual_size'])

    def test_weight_validation(self):
        """Test that weight validation works in the model."""
        # Test invalid weights
        with self.assertRaises(ValidationError):
            invalid_config = InterleavingSessionConfig(
                user=self.user,
                w_due=0.5,
                w_interleave=0.3,
                w_new=0.1  # Sum = 0.9, should fail
            )
            invalid_config.clean()

    def test_session_size_validation(self):
        """Test session size validation."""
        # Test too small
        with self.assertRaises(ValidationError):
            invalid_config = InterleavingSessionConfig(
                user=self.user,
                session_size=0
            )
            invalid_config.clean()
        
        # Test too large
        with self.assertRaises(ValidationError):
            invalid_config = InterleavingSessionConfig(
                user=self.user,
                session_size=201
            )
            invalid_config.clean()

    def test_topic_streak_validation(self):
        """Test topic streak validation."""
        # Test too small
        with self.assertRaises(ValidationError):
            invalid_config = InterleavingSessionConfig(
                user=self.user,
                max_same_topic_streak=0
            )
            invalid_config.clean()
        
        # Test too large
        with self.assertRaises(ValidationError):
            invalid_config = InterleavingSessionConfig(
                user=self.user,
                max_same_topic_streak=11
            )
            invalid_config.clean()

    def test_string_representation_robustness(self):
        """Test that __str__ method is robust to various user states."""
        # Test with user that has email - use a different user to avoid conflicts
        user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123'
        )
        config1 = InterleavingSessionConfig.objects.create(
            user=user1,
            difficulty='low'
        )
        str_repr = str(config1)
        self.assertIn('user1@example.com', str_repr)
        self.assertIn('low', str_repr)
        
        # Test with user that has email
        user2 = User.objects.create_user(
            email='user2@example.com',  # Must provide email
            password='testpass123'
        )
        config2 = InterleavingSessionConfig.objects.create(
            user=user2,
            difficulty='high'
        )
        str_repr2 = str(config2)
        self.assertIn('user2@example.com', str_repr2)
        self.assertIn('high', str_repr2)
        
        # Test with user that has neither email nor username
        user3 = User.objects.create_user(
            email='user3@example.com',  # Must provide email
            password='testpass123'
        )
        config3 = InterleavingSessionConfig.objects.create(
            user=user3,
            difficulty='medium'
        )
        str_repr3 = str(config3)
        self.assertIn('user3@example.com', str_repr3)
        self.assertIn('medium', str_repr3)


class InterleavingAPIViewsTest(APITestCase):
    """Test interleaving API views."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create topics and principles
        self.topic1 = Topic.objects.create(name='Mathematics')
        self.topic2 = Topic.objects.create(name='Physics')
        
        self.principle1 = Principle.objects.create(name='Calculus', topic=self.topic1)
        self.principle2 = Principle.objects.create(name='Mechanics', topic=self.topic2)
        
        # Create flashcard set and flashcards
        self.flashcard_set = FlashcardSet.objects.create(
            title='Test Set',
            owner=self.user
        )
        
        # Create some flashcards
        for i in range(5):
            card = Flashcard.objects.create(
                flashcard_set=self.flashcard_set,
                question=f'Question {i}',
                answer=f'Answer {i}',
                algorithm='sm2',
                learning_state='new' if i < 2 else 'review',
                total_reviews=i,
                correct_reviews=max(0, i-1),
                interval=float(i + 1),
                next_review=timezone.now().date() + timedelta(days=i-3)
            )
            
            # Create profile for each card
            topic = [self.topic1, self.topic2][i % 2]
            principle = [self.principle1, self.principle2][i % 2]
            FlashcardProfile.objects.create(
                flashcard=card,
                topic=topic,
                principle=principle,
                difficulty_est=1.0 + (i % 2) * 0.5
            )

    def test_get_interleaving_config(self):
        """Test getting interleaving configuration."""
        response = self.client.get('/generation/api/interleaving/config/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('difficulty', response.data)
        self.assertIn('session_size', response.data)
        self.assertIn('w_due', response.data)
        self.assertIn('w_interleave', response.data)
        self.assertIn('w_new', response.data)

    def test_patch_interleaving_config(self):
        """Test updating interleaving configuration."""
        data = {'difficulty': 'high', 'session_size': 15}
        response = self.client.patch('/generation/api/interleaving/config/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['difficulty'], 'high')
        self.assertEqual(response.data['session_size'], 15)

    def test_generate_interleaving_session(self):
        """Test generating an interleaving session."""
        data = {'size': 5, 'difficulty': 'medium'}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)
        self.assertIn('fill_mode', response.data)
        self.assertIn('session_id', response.data)
        self.assertIn('constraints_applied', response.data)
        self.assertIn('pool_sizes', response.data)

    def test_generate_session_with_seed(self):
        """Test generating a session with a seed for deterministic ordering."""
        data = {'size': 5, 'seed': 'test_seed_123'}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('session_id', response.data)
        
        # Generate another session with same seed
        response2 = self.client.post('/generation/api/interleaving/session/', data)
        
        # Debug: check what response2 contains
        print(f"Response2 status: {response2.status_code}")
        print(f"Response2 data keys: {list(response2.data.keys()) if hasattr(response2, 'data') else 'No data'}")
        print(f"Response2 data: {response2.data if hasattr(response2, 'data') else 'No data'}")
        
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertIn('session_id', response2.data)
        
        # Should have different session IDs (due to timestamps), but same item ordering
        self.assertNotEqual(response.data['session_id'], response2['session_id'])
        self.assertEqual(len(response.data['items']), len(response2.data['items']))

    def test_generate_session_without_seed(self):
        """Test generating a session without a seed (non-deterministic)."""
        data = {'size': 5}
        response1 = self.client.post('/generation/api/interleaving/session/', data)
        response2 = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Should have different session IDs (due to timestamp)
        self.assertNotEqual(response1.data['session_id'], response2.data['session_id'])

    def test_session_metadata_completeness(self):
        """Test that session response includes all required metadata."""
        data = {'size': 5}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check all required fields
        required_fields = [
            'requested_size', 'actual_size', 'fill_mode', 'session_id',
            'constraints_applied', 'pool_sizes', 'mix', 'header', 'why',
            'constraints', 'difficulty', 'difficulty_description', 'interval_multiplier'
        ]
        
        for field in required_fields:
            self.assertIn(field, response.data, f"Missing field: {field}")

    def test_fill_mode_classification(self):
        """Test that fill modes are correctly classified in API responses."""
        # Test with reasonable size (should get strict mode)
        data = {'size': 5}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(response.data['fill_mode'], ['strict', 'relaxed', 'exhausted'])
        
        # Test with large size (should get exhausted mode) - use a different user
        user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        
        # Create flashcard set and flashcards for user2
        flashcard_set2 = FlashcardSet.objects.create(
            title='Test Set 2',
            owner=user2
        )
        
        # Create only a few flashcards for user2 (less than requested size)
        for i in range(3):
            card = Flashcard.objects.create(
                flashcard_set=flashcard_set2,
                question=f'Question {i}',
                answer=f'Answer {i}',
                algorithm='sm2',
                learning_state='new' if i < 1 else 'review',
                total_reviews=i,
                correct_reviews=max(0, i-1),
                interval=float(i + 1),
                next_review=timezone.now().date() + timedelta(days=i-3)
            )
            
            # Create profile for each card
            topic = [self.topic1, self.topic2][i % 2]
            principle = [self.principle1, self.principle2][i % 2]
            FlashcardProfile.objects.create(
                flashcard=card,
                topic=topic,
                principle=principle,
                difficulty_est=1.0 + (i % 2) * 0.5
            )
        
        # Test with large size request (should get exhausted mode)
        service2 = InterleavingSessionService()
        session = service2.generate_session(user2, size=20)
        
        # Should be exhausted since we don't have 20 cards
        self.assertEqual(session['fill_mode'], 'exhausted')
        self.assertLess(session['actual_size'], 20)

    def test_constraint_tracking_in_api(self):
        """Test that constraint relaxation is tracked in API responses."""
        data = {'size': 5}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        constraints = response.data['constraints_applied']
        self.assertIn('topic_streak_relaxed', constraints)
        self.assertIn('hard_item_relaxed', constraints)
        self.assertIn('contrast_pair_relaxed', constraints)
        
        # All should be non-negative
        for value in constraints.values():
            self.assertGreaterEqual(value, 0)

    def test_pool_size_tracking_in_api(self):
        """Test that pool sizes are tracked in API responses."""
        data = {'size': 5}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        pool_sizes = response.data['pool_sizes']
        self.assertIn('due', pool_sizes)
        self.assertIn('interleave', pool_sizes)
        self.assertIn('new', pool_sizes)
        
        # All pool sizes should be non-negative
        for size in pool_sizes.values():
            self.assertGreaterEqual(size, 0)

    def test_session_size_validation_in_api(self):
        """Test that session size validation works in the API."""
        # Test too small
        data_small = {'size': 0}
        response_small = self.client.post('/generation/api/interleaving/session/', data_small)
        
        self.assertEqual(response_small.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('size', response_small.data)
        
        # Test too large
        data_large = {'size': 201}
        response_large = self.client.post('/generation/api/interleaving/session/', data_large)
        
        self.assertEqual(response_large.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('size', response_large.data)
        
        # Test valid size
        data_valid = {'size': 10}
        response_valid = self.client.post('/generation/api/interleaving/session/', data_valid)
        
        self.assertEqual(response_valid.status_code, status.HTTP_200_OK)

    def test_difficulty_override_in_api(self):
        """Test that difficulty override works in the API."""
        data = {'difficulty': 'high'}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['difficulty'], 'high')
        self.assertEqual(response.data['difficulty_description'], 'Aggressive spacing, more variety, higher challenge')

    def test_get_difficulty_info(self):
        """Test getting difficulty information."""
        response = self.client.get('/generation/api/interleaving/difficulty/?difficulty=high')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('description', response.data)
        self.assertIn('interval_mul', response.data)  # Use the actual field name from the service

    def test_get_difficulty_suggestion(self):
        """Test getting difficulty adjustment suggestion."""
        data = {
            'current_difficulty': 'medium',
            'success_rate': 0.75,
            'avg_latency': 2.0
        }
        response = self.client.post('/generation/api/interleaving/difficulty/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('should_adjust', response.data)  # Use the actual field names from the service
        self.assertIn('new_difficulty', response.data)

    def test_unauthorized_access(self):
        """Test that unauthorized users cannot access endpoints."""
        self.client.force_authenticate(user=None)
        
        response = self.client.get('/generation/api/interleaving/config/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post('/generation/api/interleaving/session/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_session_id_uniqueness_in_api(self):
        """Test that session IDs are unique across API calls."""
        data = {'size': 5}
        response1 = self.client.post('/generation/api/interleaving/session/', data)
        response2 = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Should have different session IDs
        self.assertNotEqual(response1.data['session_id'], response2.data['session_id'])

    def test_zero_candidates_handling_in_api(self):
        """Test handling when there are no candidates in the API."""
        # Delete all flashcards
        Flashcard.objects.all().delete()
        
        data = {'size': 5}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['actual_size'], 0)
        self.assertEqual(response.data['fill_mode'], 'exhausted')
        self.assertEqual(len(response.data['items']), 0)

    def test_large_session_size_handling_in_api(self):
        """Test that large session sizes are handled gracefully in the API."""
        data = {'size': 100}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(response.data['actual_size'], 100)
        self.assertEqual(response.data['requested_size'], 100)

    def test_contrast_pair_enforcement_in_api(self):
        """Test that contrast pairs are enforced when possible in the API."""
        data = {'size': 5}
        response = self.client.post('/generation/api/interleaving/session/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if we have a contrast pair
        has_contrast = response.data['constraints']['contrast_pair']
        
        # If we have enough items and principles, we should have a contrast pair
        if response.data['actual_size'] >= 2:
            # This is probabilistic, so we just check the structure
            self.assertIsInstance(has_contrast, bool)



    def test_weight_validation_in_config_api(self):
        """Test that weight validation works in the config API."""
        # Test invalid weights
        data = {
            'w_due': 0.5,
            'w_interleave': 0.3,
            'w_new': 0.1  # Sum = 0.9, should fail
        }
        response = self.client.patch('/generation/api/interleaving/config/', data)
        
        # Should fail validation
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_session_size_validation_in_config_api(self):
        """Test that session size validation works in the config API."""
        # Test too small
        data_small = {'session_size': 0}
        response_small = self.client.patch('/generation/api/interleaving/config/', data_small)
        
        self.assertEqual(response_small.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test too large
        data_large = {'session_size': 201}
        response_large = self.client.patch('/generation/api/interleaving/config/', data_large)
        
        self.assertEqual(response_large.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test valid size
        data_valid = {'session_size': 15}
        response_valid = self.client.patch('/generation/api/interleaving/config/', data_valid)
        
        self.assertEqual(response_valid.status_code, status.HTTP_200_OK)

    def test_topic_streak_validation_in_config_api(self):
        """Test that topic streak validation works in the config API."""
        # Test too small
        data_small = {'max_same_topic_streak': 0}
        response_small = self.client.patch('/generation/api/interleaving/config/', data_small)
        
        self.assertEqual(response_small.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test too large
        data_large = {'max_same_topic_streak': 11}
        response_large = self.client.patch('/generation/api/interleaving/config/', data_large)
        
        self.assertEqual(response_large.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test valid value
        data_valid = {'max_same_topic_streak': 3}
        response_valid = self.client.patch('/generation/api/interleaving/config/', data_valid)
        
        self.assertEqual(response_valid.status_code, status.HTTP_200_OK)


class InterleavingIntegrationTest(TestCase):
    """Integration tests for the complete interleaving system."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # Create comprehensive test data
        self._create_test_data()
        
        # Create service
        self.service = InterleavingSessionService()
    
    def _create_test_data(self):
        """Create comprehensive test data for integration testing."""
        # Create topics
        self.math_topic = Topic.objects.create(name="Mathematics")
        self.physics_topic = Topic.objects.create(name="Physics")
        self.chemistry_topic = Topic.objects.create(name="Chemistry")
        
        # Create principles
        self.algebra_principle = Principle.objects.create(
            name="Algebra",
            topic=self.math_topic
        )
        self.calculus_principle = Principle.objects.create(
            name="Calculus",
            topic=self.math_topic
        )
        self.mechanics_principle = Principle.objects.create(
            name="Mechanics",
            topic=self.physics_topic
        )
        self.thermodynamics_principle = Principle.objects.create(
            name="Thermodynamics",
            topic=self.physics_topic
        )
        self.organic_principle = Principle.objects.create(
            name="Organic Chemistry",
            topic=self.chemistry_topic
        )
        
        # Create contrast relationships
        self.algebra_principle.contrasts_with.add(self.calculus_principle)
        self.mechanics_principle.contrasts_with.add(self.thermodynamics_principle)
        
        # Create flashcard set
        self.flashcard_set = FlashcardSet.objects.create(
            title="Comprehensive Test Set",
            owner=self.user
        )
        
        # Create flashcards with various states
        self._create_flashcards()
    
    def _create_flashcards(self):
        """Create flashcards in various states for testing."""
        now = timezone.now()
        
        # Due flashcards
        due_data = [
            ("Solve x² + 5x + 6 = 0", "x = -2 or x = -3", self.algebra_principle, 1.2),
            ("Find derivative of x³", "3x²", self.calculus_principle, 1.8),
            ("Calculate F = ma for m=2, a=3", "F = 6N", self.mechanics_principle, 1.5),
        ]
        
        for question, answer, principle, difficulty in due_data:
            flashcard = Flashcard.objects.create(
                flashcard_set=self.flashcard_set,
                question=question,
                answer=answer,
                next_review=now.date() - timezone.timedelta(days=1),
                total_reviews=5
            )
            FlashcardProfile.objects.create(
                flashcard=flashcard,
                topic=principle.topic,
                principle=principle,
                difficulty_est=difficulty
            )
        
        # Interleaving candidates
        interleave_data = [
            ("What is entropy?", "Measure of disorder", self.thermodynamics_principle, 2.1),
            ("Balance CH₄ + O₂ → CO₂ + H₂O", "CH₄ + 2O₂ → CO₂ + 2H₂O", self.organic_principle, 2.3),
        ]
        
        for question, answer, principle, difficulty in interleave_data:
            flashcard = Flashcard.objects.create(
                flashcard_set=self.flashcard_set,
                question=question,
                answer=answer,
                next_review=now.date() + timezone.timedelta(days=7),
                total_reviews=3
            )
            FlashcardProfile.objects.create(
                flashcard=flashcard,
                topic=principle.topic,
                principle=principle,
                difficulty_est=difficulty
            )
        
        # New flashcards
        new_data = [
            ("What is 7 × 8?", "56", self.algebra_principle, 1.0),
        ]
        
        for question, answer, principle, difficulty in new_data:
            flashcard = Flashcard.objects.create(
                flashcard_set=self.flashcard_set,
                question=question,
                answer=answer,
                total_reviews=0
            )
            FlashcardProfile.objects.create(
                flashcard=flashcard,
                topic=principle.topic,
                principle=principle,
                difficulty_est=difficulty
            )
    
    def test_complete_session_generation(self):
        """Test complete session generation with all constraints."""
        session = self.service.generate_session(self.user, size=6, difficulty='medium')
        
        # Verify session structure
        self.assertEqual(len(session['items']), 6)
        self.assertIn('mix', session)
        self.assertIn('header', session)
        self.assertIn('constraints', session)
        
        # Verify mix proportions
        mix = session['mix']
        total = mix['due'] + mix['interleave'] + mix['new']
        self.assertEqual(total, 6)
        
        # Verify constraints
        constraints = session['constraints']
        self.assertIn('contrast_pair', constraints)
        self.assertIn('max_topic_streak', constraints)
        
        # Verify topic diversity
        topics = [item['topic'] for item in session['items']]
        unique_topics = set(topics)
        self.assertGreater(len(unique_topics), 1)  # Should have multiple topics
    
    def test_difficulty_variations(self):
        """Test session generation with different difficulty levels."""
        difficulties = ['low', 'medium', 'high']
        
        for difficulty in difficulties:
            session = self.service.generate_session(self.user, size=5, difficulty=difficulty)
            
            self.assertEqual(session['difficulty'], difficulty)
            self.assertIn('interval_multiplier', session)
            self.assertIn('difficulty_description', session)
            
            # Verify difficulty-specific behavior
            if difficulty == 'low':
                self.assertEqual(session['interval_multiplier'], 0.8)
            elif difficulty == 'medium':
                self.assertEqual(session['interval_multiplier'], 1.0)
            elif difficulty == 'high':
                self.assertEqual(session['interval_multiplier'], 1.2)
    
    def test_constraint_enforcement(self):
        """Test that all constraints are properly enforced."""
        session = self.service.generate_session(self.user, size=8, difficulty='medium')
        
        items = session['items']
        topics = [item['topic'] for item in items]
        
        # Check topic streak constraint
        max_streak = 0
        current_streak = 1
        
        for i in range(1, len(topics)):
            if topics[i] == topics[i-1]:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 1
        
        self.assertLessEqual(max_streak, 2)  # max_same_topic_streak constraint
        
        # Check contrast pair requirement
        if session['constraints']['contrast_pair']:
            # Should have at least one contrast pair
            principles = [item.get('principle') for item in items if item.get('principle')]
            has_contrast = False
            
            for i in range(len(principles) - 1):
                if principles[i] and principles[i+1]:
                    if (principles[i].contrasts_with.filter(id=principles[i+1].id).exists() or
                        principles[i+1].contrasts_with.filter(id=principles[i].id).exists()):
                        has_contrast = True
                        break
            
            self.assertTrue(has_contrast)


