"""
Basic test to verify diagnostic system imports and basic functionality.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class DiagnosticBasicTest(TestCase):
    """Basic test to verify diagnostic system works."""
    
    def test_diagnostic_imports(self):
        """Test that diagnostic models can be imported."""
        try:
            from backend.apps.generation.models import (
                DiagnosticSession, DiagnosticQuestion, 
                DiagnosticResponse, DiagnosticAnalytics
            )
            # If we get here, imports work
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import diagnostic models: {e}")
    
    def test_diagnostic_factories_import(self):
        """Test that diagnostic factories can be imported."""
        try:
            from backend.apps.generation.tests.factories import (
                DiagnosticSessionFactory, DiagnosticQuestionFactory,
                DiagnosticResponseFactory, DiagnosticAnalyticsFactory
            )
            # If we get here, imports work
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import diagnostic factories: {e}")
    
    def test_diagnostic_serializers_import(self):
        """Test that diagnostic serializers can be imported."""
        try:
            from backend.apps.generation.serializers import (
                DiagnosticSessionSerializer, DiagnosticQuestionSerializer,
                DiagnosticResponseSerializer, DiagnosticAnalyticsSerializer
            )
            # If we get here, imports work
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import diagnostic serializers: {e}")
    
    def test_diagnostic_generator_import(self):
        """Test that diagnostic generator can be imported."""
        try:
            from backend.apps.generation.services.diagnostic_generator import DiagnosticGenerator
            # If we get here, imports work
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import diagnostic generator: {e}")
    
    def test_basic_diagnostic_creation(self):
        """Test basic diagnostic model creation."""
        try:
            from backend.apps.generation.models import DiagnosticSession
            from backend.apps.projects.models import Project
            from backend.apps.accounts.models import CustomUser
            
            # Create a basic user and project
            user = CustomUser.objects.create_user(
                email='test@example.com',
                password='testpass123'
            )
            
            project = Project.objects.create(
                name='Test Project',
                project_type='school',
                owner=user
            )
            
            # Create a diagnostic session
            session = DiagnosticSession.objects.create(
                project=project,
                topic='Test Topic',
                status='DRAFT',
                created_by=user,
                max_questions=3
            )
            
            self.assertIsNotNone(session)
            self.assertEqual(session.topic, 'Test Topic')
            self.assertEqual(session.project, project)
            
            # Cleanup
            session.delete()
            project.delete()
            user.delete()
            
        except Exception as e:
            self.fail(f"Failed to create basic diagnostic: {e}")
    
    def test_diagnostic_models_exist(self):
        """Test that diagnostic models exist in the database."""
        try:
            from backend.apps.generation.models import (
                DiagnosticSession, DiagnosticQuestion, 
                DiagnosticResponse, DiagnosticAnalytics
            )
            
            # Check that models can be queried (even if empty)
            DiagnosticSession.objects.all()
            DiagnosticQuestion.objects.all()
            DiagnosticResponse.objects.all()
            DiagnosticAnalytics.objects.all()
            
            # If we get here, models exist
            self.assertTrue(True)
            
        except Exception as e:
            self.fail(f"Failed to query diagnostic models: {e}")
