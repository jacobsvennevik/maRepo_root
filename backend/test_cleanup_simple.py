#!/usr/bin/env python3
"""
Simplified backend cleanup test that can run independently
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Configure Django for testing
from django.conf import settings
if not settings.configured:
    django.setup()

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache
from django.core.management import call_command
from rest_framework.test import APIClient
from rest_framework import status
from freezegun import freeze_time

from apps.projects.models import Project

User = get_user_model()

@override_settings(
    DATABASES={
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    },
    INSTALLED_APPS=[
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'rest_framework',
        'apps.projects',
        'apps.accounts',
    ],
    MIDDLEWARE=[
        'django.middleware.security.SecurityMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ],
    ROOT_URLCONF='backend.urls',
    SECRET_KEY='test-secret-key',
    REST_FRAMEWORK={
        'DEFAULT_AUTHENTICATION_CLASSES': [
            'rest_framework.authentication.SessionAuthentication',
        ],
    }
)
class SimpleCleanupDraftsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_cleanup_drafts_management_command(self):
        """Test the cleanup_drafts management command"""
        # Create draft projects with different ages
        with freeze_time("2024-01-01 10:00:00"):
            old_draft = Project.objects.create(
                user=self.user,
                name="Old Draft",
                description="Old draft project",
                is_draft=True
            )
        
        with freeze_time("2024-01-02 10:00:00"):
            recent_draft = Project.objects.create(
                user=self.user,
                name="Recent Draft",
                description="Recent draft project",
                is_draft=True
            )
        
        # Create a non-draft project
        Project.objects.create(
            user=self.user,
            name="Completed Project",
            description="Completed project",
            is_draft=False
        )

        # Run cleanup with 24-hour threshold (should delete old_draft)
        with freeze_time("2024-01-02 11:00:00"):
            call_command('cleanup_drafts', hours=24)

        # Check that old draft was deleted
        self.assertFalse(Project.objects.filter(id=old_draft.id).exists())
        
        # Check that recent draft and completed project remain
        self.assertTrue(Project.objects.filter(id=recent_draft.id).exists())
        self.assertEqual(Project.objects.filter(is_draft=False).count(), 1)

    def test_cleanup_drafts_api_endpoint(self):
        """Test the cleanup_drafts API endpoint"""
        # Create old draft projects
        with freeze_time("2024-01-01 10:00:00"):
            old_draft1 = Project.objects.create(
                user=self.user,
                name="Old Draft 1",
                description="Old draft project 1",
                is_draft=True
            )
            old_draft2 = Project.objects.create(
                user=self.user,
                name="Old Draft 2",
                description="Old draft project 2",
                is_draft=True
            )

        # Create recent draft
        with freeze_time("2024-01-02 10:00:00"):
            recent_draft = Project.objects.create(
                user=self.user,
                name="Recent Draft",
                description="Recent draft project",
                is_draft=True
            )

        # Call cleanup endpoint
        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 2)
        self.assertEqual(response.data['message'], 'Successfully cleaned up 2 abandoned draft projects')

        # Check that old drafts were deleted
        self.assertFalse(Project.objects.filter(id=old_draft1.id).exists())
        self.assertFalse(Project.objects.filter(id=old_draft2.id).exists())
        
        # Check that recent draft remains
        self.assertTrue(Project.objects.filter(id=recent_draft.id).exists())

    def test_cleanup_drafts_user_isolation(self):
        """Test that cleanup only affects the authenticated user's drafts"""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )

        # Create drafts for both users
        with freeze_time("2024-01-01 10:00:00"):
            user_draft = Project.objects.create(
                user=self.user,
                name="User Draft",
                description="User draft project",
                is_draft=True
            )
            other_draft = Project.objects.create(
                user=other_user,
                name="Other Draft",
                description="Other user draft project",
                is_draft=True
            )

        # Cleanup as authenticated user
        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 1)

        # Check that only user's draft was deleted
        self.assertFalse(Project.objects.filter(id=user_draft.id).exists())
        self.assertTrue(Project.objects.filter(id=other_draft.id).exists())

    def test_cleanup_drafts_only_drafts(self):
        """Test that cleanup only affects draft projects, not completed ones"""
        with freeze_time("2024-01-01 10:00:00"):
            draft_project = Project.objects.create(
                user=self.user,
                name="Draft Project",
                description="Draft project",
                is_draft=True
            )
            completed_project = Project.objects.create(
                user=self.user,
                name="Completed Project",
                description="Completed project",
                is_draft=False
            )

        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 1)

        # Only draft should be deleted
        self.assertFalse(Project.objects.filter(id=draft_project.id).exists())
        self.assertTrue(Project.objects.filter(id=completed_project.id).exists())

if __name__ == '__main__':
    # Run the tests
    import unittest
    unittest.main() 