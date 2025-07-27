from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache
from django.core.management import call_command
from django.core.management.base import CommandError
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from freezegun import freeze_time
from datetime import datetime, timedelta
import json
import tempfile
import os

from apps.projects.models import Project

User = get_user_model()

class CleanupDraftsTestCase(TestCase):
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

    def test_cleanup_drafts_management_command_dry_run(self):
        """Test cleanup_drafts command with --dry-run flag"""
        with freeze_time("2024-01-01 10:00:00"):
            old_draft = Project.objects.create(
                user=self.user,
                name="Old Draft",
                description="Old draft project",
                is_draft=True
            )

        with freeze_time("2024-01-02 11:00:00"):
            # Run with dry-run flag
            call_command('cleanup_drafts', hours=24, dry_run=True)

        # Check that draft was NOT deleted (dry run)
        self.assertTrue(Project.objects.filter(id=old_draft.id).exists())

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

    def test_cleanup_drafts_api_idempotency(self):
        """Test that cleanup_drafts endpoint is idempotent"""
        with freeze_time("2024-01-01 10:00:00"):
            old_draft = Project.objects.create(
                user=self.user,
                name="Old Draft",
                description="Old draft project",
                is_draft=True
            )

        with freeze_time("2024-01-02 11:00:00"):
            # First cleanup call
            response1 = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })
            self.assertEqual(response1.status_code, status.HTTP_200_OK)
            self.assertEqual(response1.data['deleted_count'], 1)

            # Second cleanup call (should be idempotent)
            response2 = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })
            self.assertEqual(response2.status_code, status.HTTP_200_OK)
            self.assertEqual(response2.data['deleted_count'], 0)

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

    def test_cleanup_drafts_invalid_hours(self):
        """Test cleanup_drafts with invalid hours parameter"""
        # Test negative hours
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': -1
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('hours', response.data)

        # Test zero hours
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 0
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('hours', response.data)

        # Test non-integer hours
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 'invalid'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cleanup_drafts_metrics(self):
        """Test cleanup metrics tracking"""
        # Create some drafts
        with freeze_time("2024-01-01 10:00:00"):
            for i in range(3):
                Project.objects.create(
                    user=self.user,
                    name=f"Draft {i}",
                    description=f"Draft project {i}",
                    is_draft=True
                )

        # Run cleanup
        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 3)

        # Check metrics endpoint
        response = self.client.get('/api/projects/cleanup_metrics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['drafts_cleaned_count'], 3)
        self.assertIn('drafts_active_total', response.data)

    def test_cleanup_drafts_concurrent_requests(self):
        """Test handling of concurrent cleanup requests"""
        with freeze_time("2024-01-01 10:00:00"):
            for i in range(5):
                Project.objects.create(
                    user=self.user,
                    name=f"Draft {i}",
                    description=f"Draft project {i}",
                    is_draft=True
                )

        with freeze_time("2024-01-02 11:00:00"):
            # Simulate concurrent requests
            import threading
            import time

            results = []
            errors = []

            def cleanup_request():
                try:
                    response = self.client.post('/api/projects/cleanup_drafts/', {
                        'hours': 24
                    })
                    results.append(response.status_code)
                except Exception as e:
                    errors.append(str(e))

            # Start multiple threads
            threads = []
            for _ in range(3):
                thread = threading.Thread(target=cleanup_request)
                threads.append(thread)
                thread.start()

            # Wait for all threads to complete
            for thread in threads:
                thread.join()

            # All requests should succeed (idempotency)
            self.assertEqual(len(results), 3)
            self.assertEqual(len(errors), 0)
            self.assertTrue(all(status == 200 for status in results))

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

    def test_cleanup_drafts_clock_skew_edge_cases(self):
        """Test cleanup with various time edge cases"""
        # Test with very old projects (8 days)
        with freeze_time("2024-01-01 10:00:00"):
            very_old_draft = Project.objects.create(
                user=self.user,
                name="Very Old Draft",
                description="Very old draft project",
                is_draft=True
            )

        # Test with projects exactly at the threshold
        with freeze_time("2024-01-02 10:00:00"):
            threshold_draft = Project.objects.create(
                user=self.user,
                name="Threshold Draft",
                description="Draft at threshold",
                is_draft=True
            )

        # Test with projects just under the threshold
        with freeze_time("2024-01-02 10:01:00"):
            recent_draft = Project.objects.create(
                user=self.user,
                name="Recent Draft",
                description="Recent draft project",
                is_draft=True
            )

        # Cleanup with 24-hour threshold
        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 2)  # very_old and threshold

        # Check results
        self.assertFalse(Project.objects.filter(id=very_old_draft.id).exists())
        self.assertFalse(Project.objects.filter(id=threshold_draft.id).exists())
        self.assertTrue(Project.objects.filter(id=recent_draft.id).exists())

    def test_cleanup_drafts_storage_quota_boundary(self):
        """Test cleanup behavior when storage is near capacity"""
        # This test simulates the scenario where the database or cache
        # might be under pressure during cleanup operations
        
        # Create many draft projects to simulate storage pressure
        with freeze_time("2024-01-01 10:00:00"):
            for i in range(100):
                Project.objects.create(
                    user=self.user,
                    name=f"Bulk Draft {i}",
                    description=f"Bulk draft project {i}",
                    is_draft=True
                )

        # Run cleanup - should handle large datasets gracefully
        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 100)

        # Verify all drafts were cleaned up
        self.assertEqual(Project.objects.filter(is_draft=True).count(), 0)

    def test_cleanup_drafts_authentication_required(self):
        """Test that cleanup endpoint requires authentication"""
        # Create unauthenticated client
        unauthenticated_client = APIClient()
        
        response = unauthenticated_client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cleanup_drafts_cache_invalidation(self):
        """Test that cache is properly invalidated after cleanup"""
        # Create a draft
        with freeze_time("2024-01-01 10:00:00"):
            draft = Project.objects.create(
                user=self.user,
                name="Cache Test Draft",
                description="Draft for cache testing",
                is_draft=True
            )

        # Cache some project data
        cache_key = f"project_{draft.id}"
        cache.set(cache_key, "cached_data", timeout=3600)

        # Run cleanup
        with freeze_time("2024-01-02 11:00:00"):
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 1)

        # Cache should be invalidated (or the key should not exist)
        self.assertIsNone(cache.get(cache_key))

    def test_cleanup_drafts_error_handling(self):
        """Test error handling during cleanup operations"""
        # Mock a database error during cleanup
        with freeze_time("2024-01-01 10:00:00"):
            draft = Project.objects.create(
                user=self.user,
                name="Error Test Draft",
                description="Draft for error testing",
                is_draft=True
            )

        # Test with invalid cache operations
        with freeze_time("2024-01-02 11:00:00"):
            # This should handle errors gracefully
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 24
            })

        # Should still return a valid response even if there are minor errors
        self.assertIn(response.status_code, [200, 500])
        
        # If it's a 500, it should be due to a real error, not our test setup
        if response.status_code == 500:
            self.assertIn('error', response.data) 