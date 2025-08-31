"""
Test Fixtures for Generation App

This module provides comprehensive test fixtures including:
- Database fixtures
- Mock data fixtures
- Configuration fixtures
- Service fixtures
- Performance test fixtures
"""

import pytest
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional, Generator
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.conf import settings
from rest_framework.test import APIClient

from ..models import (
    FlashcardSet, Flashcard, MindMap, DiagnosticSession, 
    DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics,
    Topic, Principle, InterleavingSessionConfig
)
from .factories import (
    FlashcardSetFactory, FlashcardFactory, MindMapFactory,
    DiagnosticSessionFactory, DiagnosticQuestionFactory,
    DiagnosticResponseFactory, DiagnosticAnalyticsFactory
)
from ..config import ConfigurationManager, GlobalConfig
from ..services.spaced_repetition import AlgorithmFactory, SM2Algorithm, LeitnerAlgorithm
from ..services.interleaving_session_new import InterleavingSessionService
from ..services.scheduler_new import SchedulerService

User = get_user_model()


# User and Authentication Fixtures
@pytest.fixture
def test_user():
    """Create a basic test user."""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def test_user_with_permissions():
    """Create a test user with all necessary permissions."""
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType
    
    user = User.objects.create_user(
        username='testuser_perms',
        email='test_perms@example.com',
        password='testpass123'
    )
    
    # Add permissions for all generation models
    models = [FlashcardSet, Flashcard, MindMap, DiagnosticSession, DiagnosticQuestion]
    
    for model in models:
        content_type = ContentType.objects.get_for_model(model)
        permissions = Permission.objects.filter(content_type=content_type)
        user.user_permissions.add(*permissions)
    
    user.save()
    return user


@pytest.fixture
def admin_user():
    """Create an admin user for testing."""
    user = User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='adminpass123',
        is_staff=True,
        is_superuser=True
    )
    return user


@pytest.fixture
def multiple_users():
    """Create multiple test users."""
    users = []
    for i in range(5):
        user = User.objects.create_user(
            username=f'user{i}',
            email=f'user{i}@example.com',
            password=f'pass{i}123'
        )
        users.append(user)
    return users


# API Client Fixtures
@pytest.fixture
def api_client():
    """Create an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def authenticated_client(test_user):
    """Create an authenticated API client."""
    client = APIClient()
    client.force_authenticate(user=test_user)
    return client


@pytest.fixture
def admin_client(admin_user):
    """Create an admin API client."""
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


# Model Fixtures
@pytest.fixture
def flashcard_set(test_user):
    """Create a test flashcard set."""
    return FlashcardSetFactory(owner=test_user)


@pytest.fixture
def multiple_flashcard_sets(test_user):
    """Create multiple flashcard sets."""
    sets = []
    for i in range(3):
        set_obj = FlashcardSetFactory(
            owner=test_user,
            title=f'Test Set {i}'
        )
        sets.append(set_obj)
    return sets


@pytest.fixture
def flashcard(flashcard_set):
    """Create a test flashcard."""
    return FlashcardFactory(flashcard_set=flashcard_set)


@pytest.fixture
def multiple_flashcards(flashcard_set):
    """Create multiple flashcards."""
    flashcards = []
    for i in range(5):
        flashcard = FlashcardFactory(
            flashcard_set=flashcard_set,
            question=f'Question {i}?',
            answer=f'Answer {i}'
        )
        flashcards.append(flashcard)
    return flashcards


@pytest.fixture
def mindmap(test_user):
    """Create a test mindmap."""
    return MindMapFactory(owner=test_user)


@pytest.fixture
def diagnostic_session(test_user):
    """Create a test diagnostic session."""
    return DiagnosticSessionFactory(created_by=test_user)


@pytest.fixture
def diagnostic_question(diagnostic_session):
    """Create a test diagnostic question."""
    return DiagnosticQuestionFactory(session=diagnostic_session)


@pytest.fixture
def diagnostic_response(diagnostic_question, test_user):
    """Create a test diagnostic response."""
    return DiagnosticResponseFactory(
        session=diagnostic_question.session,
        question=diagnostic_question,
        user=test_user
    )


@pytest.fixture
def diagnostic_analytics(diagnostic_session):
    """Create test diagnostic analytics."""
    return DiagnosticAnalyticsFactory(session=diagnostic_session)


@pytest.fixture
def topic():
    """Create a test topic."""
    return Topic.objects.create(name="Test Topic")


@pytest.fixture
def principle(topic):
    """Create a test principle."""
    return Principle.objects.create(
        name="Test Principle",
        topic=topic
    )


@pytest.fixture
def interleaving_config(test_user):
    """Create a test interleaving configuration."""
    return InterleavingSessionConfig.objects.create(
        user=test_user,
        difficulty='medium',
        session_size=15,
        w_due=0.6,
        w_interleave=0.25,
        w_new=0.15,
        max_same_topic_streak=3
    )


# Service Fixtures
@pytest.fixture
def algorithm_factory():
    """Create an algorithm factory instance."""
    return AlgorithmFactory()


@pytest.fixture
def sm2_algorithm():
    """Create an SM2 algorithm instance."""
    return SM2Algorithm()


@pytest.fixture
def leitner_algorithm():
    """Create a Leitner algorithm instance."""
    return LeitnerAlgorithm()


@pytest.fixture
def interleaving_service():
    """Create an interleaving service instance."""
    return InterleavingSessionService()


@pytest.fixture
def scheduler_service():
    """Create a scheduler service instance."""
    return SchedulerService()


# Configuration Fixtures
@pytest.fixture
def mock_config_manager():
    """Create a mock configuration manager."""
    mock_config = Mock(spec=ConfigurationManager)
    
    # Mock global config
    mock_global_config = Mock(spec=GlobalConfig)
    mock_global_config.environment = 'test'
    mock_global_config.debug_mode = True
    mock_global_config.cache_enabled = True
    
    # Mock spaced repetition config
    mock_sr_config = Mock()
    mock_sr_config.default_algorithm = 'sm2'
    mock_sr_config.sm2_initial_ease_factor = 2.5
    mock_sr_config.batch_size = 100
    mock_global_config.spaced_repetition = mock_sr_config
    
    # Mock interleaving config
    mock_interleaving_config = Mock()
    mock_interleaving_config.default_weights = {'due': 0.6, 'interleave': 0.25, 'new': 0.15}
    mock_interleaving_config.default_session_size = 15
    mock_global_config.interleaving = mock_interleaving_config
    
    # Mock feature flags
    mock_feature_flags = Mock()
    mock_feature_flags.spaced_repetition_enabled = True
    mock_feature_flags.interleaving_enabled = True
    mock_feature_flags.diagnostic_assessments_enabled = True
    mock_global_config.feature_flags = mock_feature_flags
    
    mock_config.get_config.return_value = mock_global_config
    mock_config.get_spaced_repetition_config.return_value = mock_sr_config
    mock_config.get_interleaving_config.return_value = mock_interleaving_config
    mock_config.get_feature_flag.return_value = True
    
    return mock_config


@pytest.fixture
def test_config_file():
    """Create a temporary test configuration file."""
    config_content = """
version: "1.3.0"
environment: "test"
debug_mode: true
log_level: "DEBUG"
cache_enabled: true

spaced_repetition:
  default_algorithm: "sm2"
  sm2_initial_ease_factor: 2.5
  batch_size: 50
  cache_ttl_seconds: 300

interleaving:
  default_weights:
    due: 0.6
    interleave: 0.25
    new: 0.15
  default_session_size: 10

feature_flags:
  spaced_repetition_enabled: true
  interleaving_enabled: true
  diagnostic_assessments_enabled: true
"""
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False)
    temp_file.write(config_content)
    temp_file.close()
    
    yield temp_file.name
    
    # Cleanup
    try:
        os.unlink(temp_file.name)
    except OSError:
        pass


# Mock Data Fixtures
@pytest.fixture
def mock_ai_response():
    """Create a mock AI response."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'choices': [{'message': {'content': 'Mock AI response'}}],
        'usage': {'total_tokens': 100}
    }
    return mock_response


@pytest.fixture
def mock_pdf_content():
    """Create mock PDF content for testing."""
    return {
        'text': 'This is mock PDF content for testing purposes.',
        'pages': [
            {'page_number': 1, 'text': 'Page 1 content'},
            {'page_number': 2, 'text': 'Page 2 content'},
        ],
        'metadata': {
            'title': 'Test Document',
            'author': 'Test Author',
            'pages': 2
        }
    }


@pytest.fixture
def mock_flashcard_data():
    """Create mock flashcard data."""
    return {
        'question': 'What is the capital of France?',
        'answer': 'Paris',
        'explanation': 'Paris is the capital and largest city of France.',
        'difficulty': 2,
        'tags': ['geography', 'europe', 'capitals']
    }


@pytest.fixture
def mock_diagnostic_data():
    """Create mock diagnostic data."""
    return {
        'topic': 'Mathematics',
        'max_questions': 5,
        'delivery_mode': 'IMMEDIATE_FEEDBACK',
        'questions_order': 'SCRAMBLED',
        'questions': [
            {
                'type': 'MCQ',
                'text': 'What is 2 + 2?',
                'choices': ['3', '4', '5', '6'],
                'correct_choice_index': 1,
                'difficulty': 1
            },
            {
                'type': 'SHORT_ANSWER',
                'text': 'What is the square root of 16?',
                'acceptable_answers': ['4', 'four'],
                'difficulty': 2
            }
        ]
    }


# Performance Test Fixtures
@pytest.fixture
def large_dataset(test_user):
    """Create a large dataset for performance testing."""
    # Create multiple flashcard sets with many flashcards
    sets = []
    for i in range(10):
        set_obj = FlashcardSetFactory(
            owner=test_user,
            title=f'Performance Test Set {i}'
        )
        
        # Create many flashcards for each set
        for j in range(50):
            FlashcardFactory(
                flashcard_set=set_obj,
                question=f'Question {i}-{j}?',
                answer=f'Answer {i}-{j}'
            )
        
        sets.append(set_obj)
    
    return sets


@pytest.fixture
def stress_test_data(test_user):
    """Create data for stress testing."""
    # Create many users
    users = []
    for i in range(20):
        user = User.objects.create_user(
            username=f'stress_user_{i}',
            email=f'stress{i}@example.com',
            password=f'pass{i}123'
        )
        users.append(user)
    
    # Create diagnostic sessions for each user
    sessions = []
    for user in users:
        for j in range(5):
            session = DiagnosticSessionFactory(created_by=user)
            sessions.append(session)
            
            # Create questions for each session
            for k in range(3):
                DiagnosticQuestionFactory(session=session)
    
    return {
        'users': users,
        'sessions': sessions
    }


# Cache Fixtures
@pytest.fixture
def clear_cache():
    """Clear cache before and after test."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def mock_cache():
    """Create a mock cache for testing."""
    with patch('django.core.cache.cache') as mock_cache:
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        mock_cache.delete.return_value = True
        yield mock_cache


# Database Fixtures
@pytest.fixture
def db_transaction():
    """Ensure database transaction for test."""
    from django.test import TransactionTestCase
    
    class TransactionTest(TransactionTestCase):
        def setUp(self):
            super().setUp()
            self.addCleanup(self.cleanup)
        
        def cleanup(self):
            # Clean up any remaining objects
            pass
    
    return TransactionTest


@pytest.fixture
def isolated_db():
    """Ensure isolated database for test."""
    from django.test import TestCase
    
    class IsolatedTest(TestCase):
        def setUp(self):
            super().setUp()
            self.addCleanup(self.cleanup)
        
        def cleanup(self):
            # Clean up any remaining objects
            pass
    
    return IsolatedTest


# File and Storage Fixtures
@pytest.fixture
def temp_directory():
    """Create a temporary directory for testing."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def mock_file_upload():
    """Create a mock file upload."""
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    return SimpleUploadedFile(
        'test.pdf',
        b'%PDF-1.4\n%Test PDF content\n%%EOF',
        content_type='application/pdf'
    )


# Error and Exception Fixtures
@pytest.fixture
def mock_exception():
    """Create a mock exception for testing error handling."""
    class TestException(Exception):
        def __init__(self, message="Test exception", code=None):
            self.message = message
            self.code = code
            super().__init__(self.message)
    
    return TestException


@pytest.fixture
def mock_validation_error():
    """Create a mock validation error."""
    from django.core.exceptions import ValidationError
    
    return ValidationError("Test validation error")


# Time and Date Fixtures
@pytest.fixture
def fixed_datetime():
    """Provide a fixed datetime for consistent testing."""
    from django.utils import timezone
    from datetime import datetime
    
    fixed_time = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
    
    with patch('django.utils.timezone.now', return_value=fixed_time):
        yield fixed_time


@pytest.fixture
def time_travel():
    """Allow time travel in tests."""
    from django.utils import timezone
    from datetime import datetime, timedelta
    
    class TimeTravel:
        def __init__(self):
            self.original_now = timezone.now
        
        def travel_to(self, target_time):
            """Travel to a specific time."""
            timezone.now = lambda: target_time
        
        def travel_forward(self, days=1):
            """Travel forward in time."""
            current_time = timezone.now()
            future_time = current_time + timedelta(days=days)
            timezone.now = lambda: future_time
        
        def travel_backward(self, days=1):
            """Travel backward in time."""
            current_time = timezone.now()
            past_time = current_time - timedelta(days=days)
            timezone.now = lambda: past_time
        
        def restore(self):
            """Restore original time function."""
            timezone.now = self.original_now
    
    time_travel = TimeTravel()
    yield time_travel
    time_travel.restore()


# Network and External Service Fixtures
@pytest.fixture
def mock_requests():
    """Mock requests library for testing."""
    with patch('requests.get') as mock_get, \
         patch('requests.post') as mock_post, \
         patch('requests.put') as mock_put, \
         patch('requests.delete') as mock_delete:
        
        # Configure default responses
        mock_get.return_value.status_code = 200
        mock_post.return_value.status_code = 201
        mock_put.return_value.status_code = 200
        mock_delete.return_value.status_code = 204
        
        yield {
            'get': mock_get,
            'post': mock_post,
            'put': mock_put,
            'delete': mock_delete
        }


@pytest.fixture
def mock_external_api():
    """Mock external API calls."""
    with patch('backend.apps.generation.services.ai_client.AIClient.generate_content') as mock_generate:
        mock_generate.return_value = "Mock AI generated content"
        yield mock_generate


# Test Data Cleanup
@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Automatically cleanup test data after each test."""
    yield
    
    # Clean up any remaining test objects
    try:
        # Clear cache
        cache.clear()
        
        # Clean up any temporary files
        temp_dir = tempfile.gettempdir()
        for filename in os.listdir(temp_dir):
            if filename.startswith('test_') and filename.endswith('.tmp'):
                try:
                    os.unlink(os.path.join(temp_dir, filename))
                except OSError:
                    pass
    except Exception:
        pass


# Fixture for test data size configuration
@pytest.fixture
def test_data_size():
    """Configure test data size based on environment."""
    size = os.getenv('TEST_DATA_SIZE', 'small')
    
    size_configs = {
        'small': {'users': 5, 'flashcards': 10, 'sessions': 3},
        'medium': {'users': 20, 'flashcards': 50, 'sessions': 10},
        'large': {'users': 100, 'flashcards': 500, 'sessions': 50},
    }
    
    return size_configs.get(size, size_configs['small'])


# Fixture for test environment configuration
@pytest.fixture
def test_environment():
    """Get test environment configuration."""
    return {
        'database': os.getenv('TEST_DATABASE', 'sqlite'),
        'cache': os.getenv('TEST_CACHE', 'dummy'),
        'celery': os.getenv('TEST_CELERY', 'false').lower() == 'true',
        'email': os.getenv('TEST_EMAIL', 'console'),
        'storage': os.getenv('TEST_STORAGE', 'memory'),
    }
