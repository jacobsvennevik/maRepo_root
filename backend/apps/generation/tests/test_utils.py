"""
Enhanced Test Utilities for Generation App

This module provides advanced testing utilities including:
- Performance testing utilities
- Data generation utilities
- Assertion utilities
- Mock utilities
- Test reporting utilities
"""

import time
import json
import random
import string
from typing import Dict, Any, List, Optional, Callable, Union
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase
from django.core.cache import cache
from django.db import connection
from django.test.utils import override_settings
from rest_framework import status
from rest_framework.test import APIClient
import logging

logger = logging.getLogger(__name__)


class PerformanceTestUtils:
    """Utilities for performance testing."""
    
    @staticmethod
    def measure_execution_time(func: Callable, *args, **kwargs) -> Dict[str, Any]:
        """
        Measure execution time and resource usage of a function.
        
        Args:
            func: Function to measure
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Dictionary with performance metrics
        """
        start_time = time.time()
        start_queries = len(connection.queries)
        
        # Execute function
        try:
            result = func(*args, **kwargs)
            success = True
            error = None
        except Exception as e:
            result = None
            success = False
            error = str(e)
        
        end_time = time.time()
        end_queries = len(connection.queries)
        
        # Calculate metrics
        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
        query_count = end_queries - start_queries
        
        return {
            'success': success,
            'result': result,
            'error': error,
            'execution_time_ms': execution_time,
            'query_count': query_count,
            'start_time': start_time,
            'end_time': end_time,
        }
    
    @staticmethod
    def benchmark_function(func: Callable, iterations: int = 100, *args, **kwargs) -> Dict[str, Any]:
        """
        Benchmark a function over multiple iterations.
        
        Args:
            func: Function to benchmark
            iterations: Number of iterations
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Dictionary with benchmark results
        """
        results = []
        
        for i in range(iterations):
            result = PerformanceTestUtils.measure_execution_time(func, *args, **kwargs)
            results.append(result)
        
        # Calculate statistics
        execution_times = [r['execution_time_ms'] for r in results if r['success']]
        query_counts = [r['query_count'] for r in results if r['success']]
        
        if execution_times:
            stats = {
                'iterations': iterations,
                'successful_iterations': len(execution_times),
                'failed_iterations': iterations - len(execution_times),
                'execution_time': {
                    'min': min(execution_times),
                    'max': max(execution_times),
                    'mean': sum(execution_times) / len(execution_times),
                    'median': sorted(execution_times)[len(execution_times) // 2],
                },
                'query_count': {
                    'min': min(query_counts) if query_counts else 0,
                    'max': max(query_counts) if query_counts else 0,
                    'mean': sum(query_counts) / len(query_counts) if query_counts else 0,
                },
                'all_results': results,
            }
        else:
            stats = {
                'iterations': iterations,
                'successful_iterations': 0,
                'failed_iterations': iterations,
                'error': 'All iterations failed',
                'all_results': results,
            }
        
        return stats
    
    @staticmethod
    def assert_performance_requirements(metrics: Dict[str, Any], 
                                     max_time_ms: float = 1000,
                                     max_queries: int = 50) -> None:
        """
        Assert that performance metrics meet requirements.
        
        Args:
            metrics: Performance metrics from measure_execution_time
            max_time_ms: Maximum allowed execution time in milliseconds
            max_queries: Maximum allowed database queries
            
        Raises:
            AssertionError: If performance requirements are not met
        """
        if not metrics['success']:
            raise AssertionError(f"Function execution failed: {metrics['error']}")
        
        if metrics['execution_time_ms'] > max_time_ms:
            raise AssertionError(
                f"Execution time {metrics['execution_time_ms']:.2f}ms exceeds limit {max_time_ms}ms"
            )
        
        if metrics['query_count'] > max_queries:
            raise AssertionError(
                f"Query count {metrics['query_count']} exceeds limit {max_queries}"
            )


class DataGenerationUtils:
    """Utilities for generating test data."""
    
    @staticmethod
    def generate_random_string(length: int = 10, prefix: str = "") -> str:
        """Generate a random string."""
        chars = string.ascii_letters + string.digits
        random_str = ''.join(random.choice(chars) for _ in range(length))
        return f"{prefix}{random_str}" if prefix else random_str
    
    @staticmethod
    def generate_random_email(domain: str = "example.com") -> str:
        """Generate a random email address."""
        username = DataGenerationUtils.generate_random_string(8)
        return f"{username}@{domain}"
    
    @staticmethod
    def generate_random_text(min_words: int = 5, max_words: int = 20) -> str:
        """Generate random text with specified word count."""
        words = [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
            'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
            'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
            'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut'
        ]
        
        word_count = random.randint(min_words, max_words)
        selected_words = random.choices(words, k=word_count)
        
        # Capitalize first word and add period
        selected_words[0] = selected_words[0].capitalize()
        return ' '.join(selected_words) + '.'
    
    @staticmethod
    def generate_flashcard_data(count: int = 1, **kwargs) -> List[Dict[str, Any]]:
        """Generate test flashcard data."""
        flashcards = []
        
        for i in range(count):
            flashcard = {
                'question': kwargs.get('question', f'Test question {i}?'),
                'answer': kwargs.get('answer', f'Test answer {i}'),
                'explanation': kwargs.get('explanation', DataGenerationUtils.generate_random_text()),
                'difficulty': kwargs.get('difficulty', random.randint(1, 5)),
                'tags': kwargs.get('tags', [f'tag{i}', f'test{i}']),
            }
            flashcards.append(flashcard)
        
        return flashcards if count > 1 else flashcards[0]
    
    @staticmethod
    def generate_diagnostic_data(count: int = 1, **kwargs) -> List[Dict[str, Any]]:
        """Generate test diagnostic data."""
        diagnostics = []
        
        for i in range(count):
            diagnostic = {
                'topic': kwargs.get('topic', f'Test Topic {i}'),
                'max_questions': kwargs.get('max_questions', random.randint(3, 10)),
                'delivery_mode': kwargs.get('delivery_mode', random.choice(['IMMEDIATE_FEEDBACK', 'DEFERRED_FEEDBACK'])),
                'questions_order': kwargs.get('questions_order', random.choice(['SCRAMBLED', 'SEQUENTIAL'])),
                'questions': kwargs.get('questions', DataGenerationUtils.generate_questions_data(3)),
            }
            diagnostics.append(diagnostic)
        
        return diagnostics if count > 1 else diagnostics[0]
    
    @staticmethod
    def generate_questions_data(count: int = 1) -> List[Dict[str, Any]]:
        """Generate test question data."""
        questions = []
        
        for i in range(count):
            question_type = random.choice(['MCQ', 'SHORT_ANSWER', 'TRUE_FALSE'])
            
            if question_type == 'MCQ':
                question = {
                    'type': 'MCQ',
                    'text': f'Multiple choice question {i}?',
                    'choices': [f'Choice {j}' for j in range(4)],
                    'correct_choice_index': random.randint(0, 3),
                    'difficulty': random.randint(1, 5),
                }
            elif question_type == 'SHORT_ANSWER':
                question = {
                    'type': 'SHORT_ANSWER',
                    'text': f'Short answer question {i}?',
                    'acceptable_answers': [f'Answer {i}', f'Alternative {i}'],
                    'difficulty': random.randint(1, 5),
                }
            else:  # TRUE_FALSE
                question = {
                    'type': 'TRUE_FALSE',
                    'text': f'True/False question {i}?',
                    'correct_answer': random.choice([True, False]),
                    'difficulty': random.randint(1, 5),
                }
            
            questions.append(question)
        
        return questions


class AssertionUtils:
    """Enhanced assertion utilities."""
    
    @staticmethod
    def assert_dict_contains(actual: Dict[str, Any], expected: Dict[str, Any], 
                           msg: str = None) -> None:
        """
        Assert that actual dictionary contains all expected key-value pairs.
        
        Args:
            actual: Actual dictionary
            expected: Expected key-value pairs
            msg: Custom error message
        """
        for key, expected_value in expected.items():
            if key not in actual:
                raise AssertionError(
                    msg or f"Key '{key}' not found in actual dictionary"
                )
            
            if actual[key] != expected_value:
                raise AssertionError(
                    msg or f"Value mismatch for key '{key}': expected {expected_value}, got {actual[key]}"
                )
    
    @staticmethod
    def assert_list_contains(actual: List[Any], expected: List[Any], 
                           msg: str = None) -> None:
        """
        Assert that actual list contains all expected items.
        
        Args:
            actual: Actual list
            expected: Expected items
            msg: Custom error message
        """
        for expected_item in expected:
            if expected_item not in actual:
                raise AssertionError(
                    msg or f"Expected item {expected_item} not found in actual list"
                )
    
    @staticmethod
    def assert_model_fields(model_instance: Any, expected_fields: Dict[str, Any], 
                          msg: str = None) -> None:
        """
        Assert that model instance has expected field values.
        
        Args:
            model_instance: Django model instance
            expected_fields: Expected field values
            msg: Custom error message
        """
        for field, expected_value in expected_fields.items():
            if not hasattr(model_instance, field):
                raise AssertionError(
                    msg or f"Model does not have field '{field}'"
                )
            
            actual_value = getattr(model_instance, field)
            if actual_value != expected_value:
                raise AssertionError(
                    msg or f"Field '{field}' mismatch: expected {expected_value}, got {actual_value}"
                )
    
    @staticmethod
    def assert_api_response_structure(response: Any, expected_fields: List[str] = None,
                                   expected_status: int = status.HTTP_200_OK,
                                   msg: str = None) -> Dict[str, Any]:
        """
        Assert API response has correct structure and status.
        
        Args:
            response: API response object
            expected_fields: Expected response fields
            expected_status: Expected HTTP status code
            msg: Custom error message
            
        Returns:
            Parsed response data
        """
        if response.status_code != expected_status:
            raise AssertionError(
                msg or f"Expected status {expected_status}, got {response.status_code}"
            )
        
        try:
            data = response.json()
        except (ValueError, AttributeError):
            raise AssertionError(msg or "Response is not valid JSON")
        
        if expected_fields:
            for field in expected_fields:
                if field not in data:
                    raise AssertionError(
                        msg or f"Required field '{field}' missing from response"
                    )
        
        return data
    
    @staticmethod
    def assert_performance_improvement(baseline_metrics: Dict[str, Any],
                                    improved_metrics: Dict[str, Any],
                                    min_improvement_percent: float = 20.0,
                                    msg: str = None) -> None:
        """
        Assert that performance has improved by at least the specified percentage.
        
        Args:
            baseline_metrics: Baseline performance metrics
            improved_metrics: Improved performance metrics
            min_improvement_percent: Minimum improvement percentage
            msg: Custom error message
        """
        if not baseline_metrics['success'] or not improved_metrics['success']:
            raise AssertionError(msg or "Cannot compare failed executions")
        
        baseline_time = baseline_metrics['execution_time_ms']
        improved_time = improved_metrics['execution_time_ms']
        
        improvement_percent = ((baseline_time - improved_time) / baseline_time) * 100
        
        if improvement_percent < min_improvement_percent:
            raise AssertionError(
                msg or f"Performance improvement {improvement_percent:.1f}% below minimum {min_improvement_percent}%"
            )


class MockUtils:
    """Utilities for creating and managing mocks."""
    
    @staticmethod
    def create_mock_user(**kwargs) -> Mock:
        """Create a mock user object."""
        mock_user = Mock()
        mock_user.id = kwargs.get('id', 1)
        mock_user.username = kwargs.get('username', 'testuser')
        mock_user.email = kwargs.get('email', 'test@example.com')
        mock_user.is_authenticated = kwargs.get('is_authenticated', True)
        mock_user.is_staff = kwargs.get('is_staff', False)
        mock_user.is_superuser = kwargs.get('is_superuser', False)
        
        # Mock permissions
        mock_user.has_perm.return_value = kwargs.get('has_perm', True)
        mock_user.get_all_permissions.return_value = kwargs.get('permissions', set())
        
        return mock_user
    
    @staticmethod
    def create_mock_request(user: Mock = None, method: str = 'GET', 
                          data: Dict[str, Any] = None, **kwargs) -> Mock:
        """Create a mock request object."""
        mock_request = Mock()
        mock_request.user = user or MockUtils.create_mock_user()
        mock_request.method = method
        mock_request.data = data or {}
        mock_request.query_params = kwargs.get('query_params', {})
        mock_request.FILES = kwargs.get('files', {})
        mock_request.META = kwargs.get('meta', {})
        
        return mock_request
    
    @staticmethod
    def create_mock_response(status_code: int = 200, data: Any = None, 
                           content_type: str = 'application/json') -> Mock:
        """Create a mock response object."""
        mock_response = Mock()
        mock_response.status_code = status_code
        mock_response.content_type = content_type
        
        if data is not None:
            mock_response.json.return_value = data
            mock_response.content = json.dumps(data).encode()
        
        return mock_response
    
    @staticmethod
    def create_mock_cache(**kwargs) -> Mock:
        """Create a mock cache object."""
        mock_cache = Mock()
        mock_cache.get.return_value = kwargs.get('get_return', None)
        mock_cache.set.return_value = kwargs.get('set_return', True)
        mock_cache.delete.return_value = kwargs.get('delete_return', True)
        mock_cache.clear.return_value = None
        
        return mock_cache
    
    @staticmethod
    def create_mock_ai_client(**kwargs) -> Mock:
        """Create a mock AI client."""
        mock_client = Mock()
        mock_client.generate_content.return_value = kwargs.get('generate_return', "Mock AI response")
        mock_client.analyze_content.return_value = kwargs.get('analyze_return', {"analysis": "mock"})
        mock_client.is_available.return_value = kwargs.get('is_available', True)
        
        return mock_client


class TestReportingUtils:
    """Utilities for test reporting and analysis."""
    
    @staticmethod
    def generate_test_summary(test_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate a summary of test results.
        
        Args:
            test_results: List of test result dictionaries
            
        Returns:
            Summary dictionary
        """
        total_tests = len(test_results)
        passed_tests = sum(1 for result in test_results if result.get('success', False))
        failed_tests = total_tests - passed_tests
        
        # Performance statistics
        execution_times = [
            result.get('execution_time_ms', 0) 
            for result in test_results 
            if result.get('success', False)
        ]
        
        performance_stats = {}
        if execution_times:
            performance_stats = {
                'min_time_ms': min(execution_times),
                'max_time_ms': max(execution_times),
                'avg_time_ms': sum(execution_times) / len(execution_times),
                'total_time_ms': sum(execution_times),
            }
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            'performance_stats': performance_stats,
            'test_results': test_results,
        }
    
    @staticmethod
    def export_test_results(test_results: List[Dict[str, Any]], 
                           format: str = 'json', filepath: str = None) -> str:
        """
        Export test results to file.
        
        Args:
            test_results: List of test result dictionaries
            format: Export format ('json', 'csv', 'html')
            filepath: Output file path (optional)
            
        Returns:
            Exported content or file path
        """
        if format.lower() == 'json':
            content = json.dumps(test_results, indent=2, default=str)
        elif format.lower() == 'csv':
            content = TestReportingUtils._results_to_csv(test_results)
        elif format.lower() == 'html':
            content = TestReportingUtils._results_to_html(test_results)
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        if filepath:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return filepath
        else:
            return content
    
    @staticmethod
    def _results_to_csv(test_results: List[Dict[str, Any]]) -> str:
        """Convert test results to CSV format."""
        if not test_results:
            return ""
        
        # Get all possible fields
        fields = set()
        for result in test_results:
            fields.update(result.keys())
        
        fields = sorted(fields)
        
        # Create CSV content
        lines = [','.join(fields)]
        for result in test_results:
            row = [str(result.get(field, '')) for field in fields]
            lines.append(','.join(row))
        
        return '\n'.join(lines)
    
    @staticmethod
    def _results_to_html(test_results: List[Dict[str, Any]]) -> str:
        """Convert test results to HTML format."""
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Results</title>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .success { background-color: #d4edda; }
                .failure { background-color: #f8d7da; }
            </style>
        </head>
        <body>
            <h1>Test Results</h1>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Status</th>
                        <th>Execution Time (ms)</th>
                        <th>Query Count</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for result in test_results:
            status_class = 'success' if result.get('success', False) else 'failure'
            status_text = 'PASS' if result.get('success', False) else 'FAIL'
            
            html += f"""
                <tr class="{status_class}">
                    <td>{result.get('test_name', 'Unknown')}</td>
                    <td>{status_text}</td>
                    <td>{result.get('execution_time_ms', 0):.2f}</td>
                    <td>{result.get('query_count', 0)}</td>
                    <td>{result.get('error', '')}</td>
                </tr>
            """
        
        html += """
                </tbody>
            </table>
        </body>
        </html>
        """
        
        return html


class DatabaseTestUtils:
    """Utilities for database testing."""
    
    @staticmethod
    def count_queries(func: Callable, *args, **kwargs) -> int:
        """
        Count database queries executed by a function.
        
        Args:
            func: Function to test
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Number of database queries
        """
        start_count = len(connection.queries)
        func(*args, **kwargs)
        end_count = len(connection.queries)
        return end_count - start_count
    
    @staticmethod
    def get_query_log() -> List[Dict[str, Any]]:
        """Get the current query log."""
        return connection.queries
    
    @staticmethod
    def clear_query_log() -> None:
        """Clear the current query log."""
        connection.queries = []
    
    @staticmethod
    def analyze_queries(queries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze database queries for performance insights.
        
        Args:
            queries: List of query dictionaries
            
        Returns:
            Analysis results
        """
        if not queries:
            return {'total_queries': 0}
        
        total_queries = len(queries)
        total_time = sum(float(q.get('time', 0)) for q in queries)
        
        # Group by SQL type
        sql_types = {}
        for query in queries:
            sql = query.get('sql', '').strip().upper()
            if sql.startswith('SELECT'):
                sql_type = 'SELECT'
            elif sql.startswith('INSERT'):
                sql_type = 'INSERT'
            elif sql.startswith('UPDATE'):
                sql_type = 'UPDATE'
            elif sql.startswith('DELETE'):
                sql_type = 'DELETE'
            else:
                sql_type = 'OTHER'
            
            if sql_type not in sql_types:
                sql_types[sql_type] = {'count': 0, 'total_time': 0}
            
            sql_types[sql_type]['count'] += 1
            sql_types[sql_type]['total_time'] += float(query.get('time', 0))
        
        return {
            'total_queries': total_queries,
            'total_time': total_time,
            'avg_time': total_time / total_queries if total_queries > 0 else 0,
            'sql_types': sql_types,
            'queries': queries,
        }


# Convenience functions for common testing patterns
def run_performance_test(func: Callable, *args, **kwargs) -> Dict[str, Any]:
    """Run a performance test on a function."""
    return PerformanceTestUtils.measure_execution_time(func, *args, **kwargs)


def benchmark_function(func: Callable, iterations: int = 100, *args, **kwargs) -> Dict[str, Any]:
    """Benchmark a function over multiple iterations."""
    return PerformanceTestUtils.benchmark_function(func, iterations, *args, **kwargs)


def generate_test_data(data_type: str, count: int = 1, **kwargs) -> Any:
    """Generate test data of specified type."""
    if data_type == 'flashcard':
        return DataGenerationUtils.generate_flashcard_data(count, **kwargs)
    elif data_type == 'diagnostic':
        return DataGenerationUtils.generate_diagnostic_data(count, **kwargs)
    elif data_type == 'user':
        return [MockUtils.create_mock_user(**kwargs) for _ in range(count)]
    else:
        raise ValueError(f"Unknown data type: {data_type}")


def assert_api_response(response: Any, expected_fields: List[str] = None,
                       expected_status: int = status.HTTP_200_OK) -> Dict[str, Any]:
    """Assert API response structure and return parsed data."""
    return AssertionUtils.assert_api_response_structure(
        response, expected_fields, expected_status
    )


def count_db_queries(func: Callable, *args, **kwargs) -> int:
    """Count database queries for a function."""
    return DatabaseTestUtils.count_queries(func, *args, **kwargs)
