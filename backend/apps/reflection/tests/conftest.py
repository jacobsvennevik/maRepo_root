import pytest
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient
from unittest.mock import patch

from .factories import (
    CustomUserFactory, ProjectFactory, ReflectionSessionFactory,
    ReflectionEntryFactory, ReflectionAnalysisFactory,
    RecommendationFactory, ChecklistFactory
)


@pytest.fixture
def api_client():
    """Return an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def user():
    """Return a test user."""
    return CustomUserFactory()


@pytest.fixture
def authenticated_client(user):
    """Return an authenticated API client."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def project(user):
    """Return a test project."""
    return ProjectFactory(owner=user)


@pytest.fixture
def reflection_session(user, project):
    """Return a basic reflection session."""
    return ReflectionSessionFactory(user=user, project=project)


@pytest.fixture
def reflection_session_with_entries(user, project):
    """Return a reflection session with entries."""
    session = ReflectionSessionFactory(user=user, project=project)
    # Create some reflection entries
    ReflectionEntryFactory(session=session, key='what_was_hard', text='The math formulas were confusing')
    ReflectionEntryFactory(session=session, key='what_went_well', text='I understood the basic concepts')
    ReflectionEntryFactory(session=session, key='next_time', text='I will practice more problems')
    return session


@pytest.fixture
def completed_reflection_session(user, project):
    """Return a completed reflection session."""
    session = ReflectionSessionFactory(user=user, project=project)
    session.ended_at = session.started_at
    session.duration_seconds = 90
    session.save()
    return session


@pytest.fixture
def reflection_analysis(completed_reflection_session):
    """Return a reflection analysis."""
    return ReflectionAnalysisFactory(session=completed_reflection_session)


@pytest.fixture
def recommendation(completed_reflection_session):
    """Return a recommendation."""
    return RecommendationFactory(session=completed_reflection_session)


@pytest.fixture
def checklist(user, project):
    """Return a checklist."""
    return ChecklistFactory(project=project)


@pytest.fixture
def mock_ai_service():
    """Mock the AI generation service."""
    with patch('backend.apps.generation.services.api_client.AIClient') as mock:
        mock_instance = mock.return_value
        mock_instance.get_response.return_value = '["misreading", "formula_error"]'
        yield mock_instance


@pytest.fixture
def mock_pdf_service():
    """Mock the PDF processing service."""
    # Not needed anymore since we removed PDF service dependency
    pass


@pytest.fixture
def user_with_permissions(user):
    """Return a user with reflection permissions."""
    # Add permissions for reflection models
    content_types = [
        ContentType.objects.get_for_model(model) 
        for model in [
            'reflection.ReflectionSession',
            'reflection.ReflectionEntry',
            'reflection.ReflectionAnalysis',
            'reflection.Recommendation',
            'reflection.Checklist'
        ]
    ]
    
    for content_type in content_types:
        if content_type:
            permissions = Permission.objects.filter(content_type=content_type)
            user.user_permissions.add(*permissions)
    
    user.save()
    return user
