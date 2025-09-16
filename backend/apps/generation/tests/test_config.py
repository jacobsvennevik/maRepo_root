"""
Advanced Test Configuration for Generation App

This module provides comprehensive testing configuration including:
- Test environment setup
- Performance testing configuration
- Coverage configuration
- Test data management
- Advanced assertions and utilities
"""

import os
import sys
import pytest
import coverage
from typing import Dict, Any, List, Optional, Callable
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase, TransactionTestCase
from django.test.utils import override_settings
from django.conf import settings
from django.core.cache import cache
from django.db import connection, transaction
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import logging
import time
import json
import tempfile
import shutil

# Configure logging for tests
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)


class TestConfig:
    """Global test configuration and settings."""
    
    # Test environment settings
    TEST_ENVIRONMENT = os.getenv('TEST_ENVIRONMENT', 'unit')
    ENABLE_PERFORMANCE_TESTS = os.getenv('ENABLE_PERFORMANCE_TESTS', 'false').lower() == 'true'
    ENABLE_INTEGRATION_TESTS = os.getenv('ENABLE_INTEGRATION_TESTS', 'true').lower() == 'true'
    ENABLE_STRESS_TESTS = os.getenv('ENABLE_STRESS_TESTS', 'false').lower() == 'true'
    
    # Performance thresholds
    PERFORMANCE_THRESHOLDS = {
        'max_query_count': 50,
        'max_response_time_ms': 1000,
        'max_memory_mb': 512,
        'max_cpu_percent': 80,
    }
    
    # Test data settings
    TEST_DATA_SIZE = {
        'small': {'users': 5, 'flashcards': 10, 'sessions': 3},
        'medium': {'users': 20, 'flashcards': 50, 'sessions': 10},
        'large': {'users': 100, 'flashcards': 500, 'sessions': 50},
    }
    
    # Coverage settings
    COVERAGE_THRESHOLD = 90.0
    COVERAGE_EXCLUDE = [
        '*/migrations/*',
        '*/tests/*',
        '*/__pycache__/*',
        '*/venv/*',
        '*/env/*',
    ]


class PerformanceTestCase(TestCase):
    """Base test case with performance monitoring capabilities."""
    
    def setUp(self):
        """Set up performance monitoring."""
        super().setUp()
        self.start_time = time.time()
        self.query_count_start = len(connection.queries)
        self.memory_start = self._get_memory_usage()
        
        # Clear cache before each test
        cache.clear()
    
    def tearDown(self):
        """Check performance metrics after test."""
        super().tearDown()
        self._check_performance_metrics()
    
    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB."""
        try:
            import psutil
            process = psutil.Process()
            return process.memory_info().rss / 1024 / 1024
        except ImportError:
            return 0.0
    
    def _check_performance_metrics(self):
        """Check if test meets performance requirements."""
        if not TestConfig.ENABLE_PERFORMANCE_TESTS:
            return
        
        # Check response time
        response_time = (time.time() - self.start_time) * 1000
        if response_time > TestConfig.PERFORMANCE_THRESHOLDS['max_response_time_ms']:
            self.fail(f"Test too slow: {response_time:.2f}ms > {TestConfig.PERFORMANCE_THRESHOLDS['max_response_time_ms']}ms")
        
        # Check query count
        query_count = len(connection.queries) - self.query_count_start
        if query_count > TestConfig.PERFORMANCE_THRESHOLDS['max_query_count']:
            self.fail(f"Too many queries: {query_count} > {TestConfig.PERFORMANCE_THRESHOLDS['max_query_count']}")
        
        # Check memory usage
        memory_usage = self._get_memory_usage() - self.memory_start
        if memory_usage > TestConfig.PERFORMANCE_THRESHOLDS['max_memory_mb']:
            self.fail(f"Memory usage too high: {memory_usage:.2f}MB > {TestConfig.PERFORMANCE_THRESHOLDS['max_memory_mb']}MB")
    
    def assert_performance(self, max_time_ms: float = None, max_queries: int = None):
        """Assert performance requirements are met."""
        if max_time_ms is None:
            max_time_ms = TestConfig.PERFORMANCE_THRESHOLDS['max_response_time_ms']
        if max_queries is None:
            max_queries = TestConfig.PERFORMANCE_THRESHOLDS['max_query_count']
        
        response_time = (time.time() - self.start_time) * 1000
        query_count = len(connection.queries) - self.query_count_start
        
        self.assertLessEqual(
            response_time, max_time_ms,
            f"Performance requirement not met: {response_time:.2f}ms > {max_time_ms}ms"
        )
        
        self.assertLessEqual(
            query_count, max_queries,
            f"Query count requirement not met: {query_count} > {max_queries}"
        )


class IntegrationTestCase(TransactionTestCase):
    """Base test case for integration testing."""
    
    def setUp(self):
        """Set up integration test environment."""
        super().setUp()
        self._setup_test_data()
        self._setup_mocks()
    
    def _setup_test_data(self):
        """Set up comprehensive test data."""
        # This will be implemented by subclasses
        pass
    
    def _setup_mocks(self):
        """Set up common mocks for integration tests."""
        # Mock external services
        self.ai_client_patcher = patch('backend.apps.generation.services.ai_client.AIClient')
        self.mock_ai_client = self.ai_client_patcher.start()
        
        # Mock cache
        self.cache_patcher = patch('django.core.cache.cache')
        self.mock_cache = self.cache_patcher.start()
    
    def tearDown(self):
        """Clean up integration test environment."""
        self.ai_client_patcher.stop()
        self.cache_patcher.stop()
        super().tearDown()
    
    def assert_integration_workflow(self, workflow_func: Callable, *args, **kwargs):
        """Assert that an integration workflow completes successfully."""
        try:
            result = workflow_func(*args, **kwargs)
            self.assertIsNotNone(result)
            return result
        except Exception as e:
            self.fail(f"Integration workflow failed: {e}")


class StressTestCase(TestCase):
    """Base test case for stress testing."""
    
    def setUp(self):
        """Set up stress test environment."""
        super().setUp()
        self.stress_config = {
            'concurrent_users': 10,
            'requests_per_user': 100,
            'timeout_seconds': 30,
        }
    
    def run_stress_test(self, test_func: Callable, *args, **kwargs):
        """Run a stress test with multiple concurrent users."""
        import threading
        import concurrent.futures
        
        results = []
        errors = []
        
        def worker():
            try:
                for _ in range(self.stress_config['requests_per_user']):
                    result = test_func(*args, **kwargs)
                    results.append(result)
            except Exception as e:
                errors.append(e)
        
        # Run concurrent workers
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=self.stress_config['concurrent_users']
        ) as executor:
            futures = [
                executor.submit(worker) 
                for _ in range(self.stress_config['concurrent_users'])
            ]
            
            # Wait for completion with timeout
            try:
                concurrent.futures.wait(
                    futures, 
                    timeout=self.stress_config['timeout_seconds']
                )
            except concurrent.futures.TimeoutError:
                self.fail("Stress test timed out")
        
        # Check results
        self.assertGreater(len(results), 0, "No successful results from stress test")
        self.assertEqual(len(errors), 0, f"Stress test had {len(errors)} errors: {errors}")
        
        return results


class CoverageTestCase(TestCase):
    """Base test case with coverage tracking."""
    
    def setUp(self):
        """Set up coverage tracking."""
        super().setUp()
        self.coverage = coverage.Coverage(
            source=['backend/apps/generation'],
            omit=TestConfig.COVERAGE_EXCLUDE
        )
        self.coverage.start()
    
    def tearDown(self):
        """Stop coverage tracking and check thresholds."""
        self.coverage.stop()
        self.coverage.save()
        
        # Check coverage threshold
        if TestConfig.COVERAGE_THRESHOLD > 0:
            coverage_percent = self.coverage.report()
            self.assertGreaterEqual(
                coverage_percent, TestConfig.COVERAGE_THRESHOLD,
                f"Coverage {coverage_percent:.1f}% below threshold {TestConfig.COVERAGE_THRESHOLD}%"
            )
        
        super().tearDown()


class AdvancedAPITestCase(APITestCase):
    """Enhanced API test case with advanced assertions and utilities."""
    
    def setUp(self):
        """Set up advanced API testing."""
        super().setUp()
        self.client = APIClient()
        self._setup_test_user()
    
    def _setup_test_user(self):
        """Set up test user with appropriate permissions."""
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import Permission
        from django.contrib.contenttypes.models import ContentType
        
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Add permissions
        content_type = ContentType.objects.get_for_model(User)
        permissions = Permission.objects.filter(content_type=content_type)
        self.user.user_permissions.set(permissions)
        
        self.client.force_authenticate(user=self.user)
    
    def assert_api_response(self, response, expected_status: int = status.HTTP_200_OK,
                          expected_fields: List[str] = None, expected_count: int = None):
        """Assert API response meets requirements."""
        # Check status code
        self.assertEqual(response.status_code, expected_status)
        
        # Check response format
        try:
            data = response.json()
        except (ValueError, AttributeError):
            self.fail("Response is not valid JSON")
        
        # Check required fields
        if expected_fields:
            for field in expected_fields:
                self.assertIn(field, data, f"Required field '{field}' missing from response")
        
        # Check count for list responses
        if expected_count is not None and isinstance(data, list):
            self.assertEqual(len(data), expected_count, 
                           f"Expected {expected_count} items, got {len(data)}")
    
    def assert_pagination(self, response, expected_page_size: int = None):
        """Assert pagination is properly implemented."""
        try:
            data = response.json()
        except (ValueError, AttributeError):
            self.fail("Response is not valid JSON")
        
        # Check pagination fields
        pagination_fields = ['count', 'next', 'previous', 'results']
        for field in pagination_fields:
            self.assertIn(field, data, f"Pagination field '{field}' missing")
        
        # Check page size
        if expected_page_size:
            self.assertEqual(len(data['results']), expected_page_size,
                           f"Page size mismatch: expected {expected_page_size}, got {len(data['results'])}")
    
    def assert_error_response(self, response, expected_status: int, expected_error_type: str = None):
        """Assert error response format and content."""
        self.assertEqual(response.status_code, expected_status)
        
        try:
            data = response.json()
        except (ValueError, AttributeError):
            self.fail("Error response is not valid JSON")
        
        # Check error fields
        error_fields = ['error', 'detail', 'message']
        has_error_field = any(field in data for field in error_fields)
        self.assertTrue(has_error_field, "Error response missing error information")
        
        # Check error type if specified
        if expected_error_type:
            self.assertIn(expected_error_type, str(data).lower(),
                         f"Expected error type '{expected_error_type}' not found in response")


class TestDataManager:
    """Manages test data creation and cleanup."""
    
    def __init__(self, test_case: TestCase):
        self.test_case = test_case
        self.created_objects = []
    
    def create_user(self, **kwargs) -> Any:
        """Create a test user."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        defaults = {
            'username': f'testuser_{len(self.created_objects)}',
            'email': f'test{len(self.created_objects)}@example.com',
            'password': 'testpass123'
        }
        defaults.update(kwargs)
        
        user = User.objects.create_user(**defaults)
        self.created_objects.append(user)
        return user
    
    def create_flashcard_set(self, **kwargs) -> Any:
        """Create a test flashcard set."""
        from .factories import FlashcardSetFactory
        
        if 'owner' not in kwargs:
            kwargs['owner'] = self.create_user()
        
        flashcard_set = FlashcardSetFactory(**kwargs)
        self.created_objects.append(flashcard_set)
        return flashcard_set
    
    def create_diagnostic_session(self, **kwargs) -> Any:
        """Create a test diagnostic session."""
        from .factories import DiagnosticSessionFactory
        
        if 'created_by' not in kwargs:
            kwargs['created_by'] = self.create_user()
        
        session = DiagnosticSessionFactory(**kwargs)
        self.created_objects.append(session)
        return session
    
    def cleanup(self):
        """Clean up all created test objects."""
        for obj in reversed(self.created_objects):
            try:
                obj.delete()
            except Exception as e:
                logger.warning(f"Failed to cleanup test object {obj}: {e}")


class MockFactory:
    """Factory for creating common mocks."""
    
    @staticmethod
    def create_ai_response(content: str = "Test AI response", **kwargs) -> Mock:
        """Create a mock AI response."""
        mock_response = Mock()
        mock_response.content = content
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'choices': [{'message': {'content': content}}],
            'usage': {'total_tokens': 100}
        }
        
        for key, value in kwargs.items():
            setattr(mock_response, key, value)
        
        return mock_response
    
    @staticmethod
    def create_config_manager(**kwargs) -> Mock:
        """Create a mock configuration manager."""
        mock_config = Mock()
        mock_config.get_config.return_value = Mock()
        mock_config.get_spaced_repetition_config.return_value = Mock()
        mock_config.get_interleaving_config.return_value = Mock()
        mock_config.get_feature_flag.return_value = True
        
        for key, value in kwargs.items():
            setattr(mock_config, key, value)
        
        return mock_config
    
    @staticmethod
    def create_cache(**kwargs) -> Mock:
        """Create a mock cache."""
        mock_cache = Mock()
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        mock_cache.delete.return_value = True
        
        for key, value in kwargs.items():
            setattr(mock_cache, key, value)
        
        return mock_cache


# Test decorators and utilities
def skip_if_disabled(feature: str):
    """Skip test if feature is disabled."""
    def decorator(test_func):
        def wrapper(*args, **kwargs):
            if not getattr(TestConfig, f'ENABLE_{feature.upper()}_TESTS', True):
                pytest.skip(f"{feature} tests are disabled")
            return test_func(*args, **kwargs)
        return wrapper
    return decorator


def performance_test(max_time_ms: float = None, max_queries: int = None):
    """Decorator for performance tests."""
    def decorator(test_func):
        def wrapper(self, *args, **kwargs):
            if not TestConfig.ENABLE_PERFORMANCE_TESTS:
                pytest.skip("Performance tests are disabled")
            
            result = test_func(self, *args, **kwargs)
            
            # Check performance if test case supports it
            if hasattr(self, 'assert_performance'):
                self.assert_performance(max_time_ms, max_queries)
            
            return result
        return wrapper
    return decorator


def integration_test():
    """Decorator for integration tests."""
    def decorator(test_func):
        def wrapper(self, *args, **kwargs):
            if not TestConfig.ENABLE_INTEGRATION_TESTS:
                pytest.skip("Integration tests are disabled")
            return test_func(self, *args, **kwargs)
        return wrapper
    return decorator


def stress_test(concurrent_users: int = 10, requests_per_user: int = 100):
    """Decorator for stress tests."""
    def decorator(test_func):
        def wrapper(self, *args, **kwargs):
            if not TestConfig.ENABLE_STRESS_TESTS:
                pytest.skip("Stress tests are disabled")
            
            # Update stress config
            self.stress_config['concurrent_users'] = concurrent_users
            self.stress_config['requests_per_user'] = requests_per_user
            
            return test_func(self, *args, **kwargs)
        return wrapper
    return decorator


# Global test configuration
pytest_plugins = [
    "backend.apps.generation.tests.fixtures",
]

# Configure pytest
def pytest_configure(config):
    """Configure pytest with custom options."""
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "stress: marks tests as stress tests"
    )
    config.addinivalue_line(
        "markers", "slow: marks tests as slow running"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection based on configuration."""
    for item in items:
        # Mark performance tests
        if "performance" in item.keywords:
            item.add_marker(pytest.mark.performance)
        
        # Mark integration tests
        if "integration" in item.keywords:
            item.add_marker(pytest.mark.integration)
        
        # Mark stress tests
        if "stress" in item.keywords:
            item.add_marker(pytest.mark.stress)
        
        # Mark slow tests
        if "slow" in item.keywords:
            item.add_marker(pytest.mark.slow)
