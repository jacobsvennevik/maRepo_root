from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from .models import ReflectionSession, ReflectionEntry
from backend.apps.projects.models import Project

User = get_user_model()


class ReflectionModelsTest(TestCase):
    """Test cases for reflection models."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            name='Test Project',
            project_type='self_study',
            owner=self.user
        )
    
    def test_reflection_session_creation(self):
        """Test creating a reflection session."""
        session = ReflectionSession.objects.create(
            user=self.user,
            project=self.project,
            source='quiz',
            source_ref='quiz_123'
        )
        
        self.assertEqual(session.user, self.user)
        self.assertEqual(session.project, self.project)
        self.assertEqual(session.source, 'quiz')
        self.assertEqual(session.source_ref, 'quiz_123')


class ReflectionAPITest(APITestCase):
    """Test cases for reflection API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            name='Test Project',
            project_type='self_study',
            owner=self.user
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_reflection_session(self):
        """Test creating a new reflection session."""
        from django.urls import reverse
        url = reverse('reflection-session-list')
        data = {
            'project': self.project.id,
            'source': 'quiz',
            'source_ref': 'quiz_123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
