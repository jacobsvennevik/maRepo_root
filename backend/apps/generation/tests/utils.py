"""
Test utilities for reducing duplication across test files.

This module provides common test utilities, fixtures, and helper functions
that can be used across multiple test files to reduce code duplication.
"""

import json
import random
from typing import Dict, Any, List, Optional
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from ..models import (
    FlashcardSet, Flashcard, MindMap, DiagnosticSession, 
    DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics
)
from .factories import (
    FlashcardSetFactory, FlashcardFactory, MindMapFactory,
    DiagnosticSessionFactory, DiagnosticQuestionFactory
)

User = get_user_model()


class BaseTestCase(TestCase):
    """Base test case with common setup and utilities."""
    
    def setUp(self):
        """Set up test data."""
        super().setUp()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
    
    def create_flashcard_set(self, **kwargs) -> FlashcardSet:
        """Create a flashcard set for testing."""
        defaults = {
            'owner': self.user,
            'title': f'Test Set {random.randint(1, 1000)}'
        }
        defaults.update(kwargs)
        return FlashcardSetFactory(**defaults)
    
    def create_flashcard(self, **kwargs) -> Flashcard:
        """Create a flashcard for testing."""
        if 'flashcard_set' not in kwargs:
            kwargs['flashcard_set'] = self.create_flashcard_set()
        return FlashcardFactory(**kwargs)
    
    def create_mindmap(self, **kwargs) -> MindMap:
        """Create a mindmap for testing."""
        defaults = {
            'owner': self.user,
            'title': f'Test MindMap {random.randint(1, 1000)}'
        }
        defaults.update(kwargs)
        return MindMapFactory(**defaults)
    
    def create_diagnostic_session(self, **kwargs) -> DiagnosticSession:
        """Create a diagnostic session for testing."""
        defaults = {
            'created_by': self.user
        }
        defaults.update(kwargs)
        return DiagnosticSessionFactory(**defaults)
    
    def create_diagnostic_question(self, **kwargs) -> DiagnosticQuestion:
        """Create a diagnostic question for testing."""
        if 'session' not in kwargs:
            kwargs['session'] = self.create_diagnostic_session()
        return DiagnosticQuestionFactory(**kwargs)
    
    def assert_model_fields(self, model_instance, expected_fields: Dict[str, Any]):
        """Assert that a model instance has the expected field values."""
        for field, expected_value in expected_fields.items():
            actual_value = getattr(model_instance, field)
            self.assertEqual(
                actual_value, 
                expected_value, 
                f"Field '{field}' mismatch: expected {expected_value}, got {actual_value}"
            )
    
    def assert_json_response(self, response, expected_status: int = status.HTTP_200_OK):
        """Assert that a response is valid JSON with the expected status."""
        self.assertEqual(response.status_code, expected_status)
        try:
            json.loads(response.content)
        except json.JSONDecodeError:
            self.fail("Response is not valid JSON")


class BaseAPITestCase(APITestCase):
    """Base API test case with authentication and common utilities."""
    
    def setUp(self):
        """Set up test data and authentication."""
        super().setUp()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def create_flashcard_set(self, **kwargs) -> FlashcardSet:
        """Create a flashcard set for testing."""
        defaults = {
            'owner': self.user,
            'title': f'Test Set {random.randint(1, 1000)}'
        }
        defaults.update(kwargs)
        return FlashcardSetFactory(**defaults)
    
    def create_flashcard(self, **kwargs) -> Flashcard:
        """Create a flashcard for testing."""
        if 'flashcard_set' not in kwargs:
            kwargs['flashcard_set'] = self.create_flashcard_set()
        return FlashcardFactory(**kwargs)
    
    def create_mindmap(self, **kwargs) -> MindMap:
        """Create a mindmap for testing."""
        defaults = {
            'owner': self.user,
            'title': f'Test MindMap {random.randint(1, 1000)}'
        }
        defaults.update(kwargs)
        return MindMapFactory(**defaults)
    
    def create_diagnostic_session(self, **kwargs) -> DiagnosticSession:
        """Create a diagnostic session for testing."""
        defaults = {
            'created_by': self.user
        }
        defaults.update(kwargs)
        return DiagnosticSessionFactory(**defaults)
    
    def create_diagnostic_question(self, **kwargs) -> DiagnosticQuestion:
        """Create a diagnostic question for testing."""
        if 'session' not in kwargs:
            kwargs['session'] = self.create_diagnostic_session()
        return DiagnosticQuestionFactory(**kwargs)
    
    def assert_api_response(self, response, expected_status: int = status.HTTP_200_OK):
        """Assert that an API response has the expected status and is valid."""
        self.assertEqual(response.status_code, expected_status)
        if hasattr(response, 'data'):
            # DRF response
            self.assertIsNotNone(response.data)
        else:
            # Regular Django response
            try:
                json.loads(response.content)
            except (json.JSONDecodeError, AttributeError):
                # Not JSON response, that's fine
                pass
    
    def assert_error_response(self, response, expected_status: int = status.HTTP_400_BAD_REQUEST):
        """Assert that an API response is an error response."""
        self.assertEqual(response.status_code, expected_status)
        if hasattr(response, 'data'):
            # Check if it's an error response
            if isinstance(response.data, dict):
                self.assertIn('error', response.data)
    
    def assert_success_response(self, response, expected_status: int = status.HTTP_200_OK):
        """Assert that an API response is a success response."""
        self.assertEqual(response.status_code, expected_status)
        if hasattr(response, 'data'):
            # Check if it's a success response
            if isinstance(response.data, dict):
                self.assertNotIn('error', response.data)


class MockDataGenerator:
    """Utility class for generating mock data for testing."""
    
    @staticmethod
    def generate_flashcard_data(**kwargs) -> Dict[str, Any]:
        """Generate mock flashcard data."""
        defaults = {
            'question': f'Test question {random.randint(1, 1000)}?',
            'answer': f'Test answer {random.randint(1, 1000)}',
            'difficulty': random.choice(['easy', 'medium', 'hard']),
            'tags': [f'tag{i}' for i in range(random.randint(1, 4))]
        }
        defaults.update(kwargs)
        return defaults
    
    @staticmethod
    def generate_mindmap_data(**kwargs) -> Dict[str, Any]:
        """Generate mock mindmap data."""
        defaults = {
            'title': f'Test MindMap {random.randint(1, 1000)}',
            'mindmap_data': {
                'root': {
                    'name': 'Test Root',
                    'children': [
                        {'name': 'Child 1', 'children': []},
                        {'name': 'Child 2', 'children': []}
                    ]
                }
            }
        }
        defaults.update(kwargs)
        return defaults
    
    @staticmethod
    def generate_diagnostic_question_data(**kwargs) -> Dict[str, Any]:
        """Generate mock diagnostic question data."""
        defaults = {
            'type': random.choice(['MCQ', 'SHORT_ANSWER', 'PRINCIPLE']),
            'text': f'Test question {random.randint(1, 1000)}?',
            'explanation': f'Test explanation {random.randint(1, 1000)}',
            'difficulty': random.randint(1, 5),
            'bloom_level': random.choice(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']),
            'concept_id': f'concept_{random.randint(1, 100)}',
            'tags': [f'tag{i}' for i in range(random.randint(1, 4))]
        }
        defaults.update(kwargs)
        return defaults
    
    @staticmethod
    def generate_review_data(**kwargs) -> Dict[str, Any]:
        """Generate mock review data."""
        defaults = {
            'quality': random.randint(0, 5),
            'response_time_seconds': random.uniform(1.0, 30.0)
        }
        defaults.update(kwargs)
        return defaults


class TestDataCleanup:
    """Utility class for cleaning up test data."""
    
    @staticmethod
    def cleanup_test_data():
        """Clean up all test data."""
        FlashcardSet.objects.all().delete()
        Flashcard.objects.all().delete()
        MindMap.objects.all().delete()
        DiagnosticSession.objects.all().delete()
        DiagnosticQuestion.objects.all().delete()
        DiagnosticResponse.objects.all().delete()
        DiagnosticAnalytics.objects.all().delete()
        User.objects.filter(username__startswith='test').delete()
    
    @staticmethod
    def cleanup_user_data(user: User):
        """Clean up data for a specific user."""
        FlashcardSet.objects.filter(owner=user).delete()
        MindMap.objects.filter(owner=user).delete()
        DiagnosticSession.objects.filter(created_by=user).delete()
