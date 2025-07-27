from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from ..models import Project
from ..management.commands.cleanup_drafts import Command

User = get_user_model()

class CleanupDraftsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Clear cache before each test
        cache.clear()

    def tearDown(self):
        cache.clear()

    def create_draft_project(self, hours_old=25):
        """Helper to create a draft project with specific age"""
        # Use a fixed base time to ensure consistent relative ages
        base_time = timezone.now()
        created_time = base_time - timedelta(hours=hours_old)
        project = Project.objects.create(
            name=f'Test Draft {hours_old}h old',
            project_type='school',
            course_name='Test Course',
            is_draft=True,
            owner=self.user
        )
        # Manually set the timestamps since auto_now_add prevents override
        project.created_at = created_time
        project.updated_at = created_time
        project.save(update_fields=['created_at', 'updated_at'])
        return project

    def test_cleanup_drafts_management_command(self):
        """Test the management command cleanup functionality"""
        # Create old draft projects
        old_draft1 = self.create_draft_project(hours_old=25)
        old_draft2 = self.create_draft_project(hours_old=30)
        
        # Create recent draft project (should not be cleaned)
        recent_draft = self.create_draft_project(hours_old=12)
        
        # Create completed project (should not be cleaned)
        completed_project = Project.objects.create(
            name='Completed Project',
            project_type='school',
            course_name='Test Course',
            is_draft=False,
            owner=self.user
        )
        
        # Run cleanup command
        cmd = Command()
        cmd.handle(hours=24, dry_run=False)
        
        # Check results
        self.assertFalse(Project.objects.filter(id=old_draft1.id).exists())
        self.assertFalse(Project.objects.filter(id=old_draft2.id).exists())
        self.assertTrue(Project.objects.filter(id=recent_draft.id).exists())
        self.assertTrue(Project.objects.filter(id=completed_project.id).exists())

    def test_cleanup_drafts_dry_run(self):
        """Test dry run mode doesn't actually delete"""
        old_draft = self.create_draft_project(hours_old=25)
        
        # Run cleanup command in dry run mode
        cmd = Command()
        cmd.handle(hours=24, dry_run=True)
        
        # Project should still exist
        self.assertTrue(Project.objects.filter(id=old_draft.id).exists())

    def test_cleanup_drafts_api_endpoint(self):
        """Test the API endpoint for cleanup"""
        # Create old draft projects
        old_draft1 = self.create_draft_project(hours_old=25)
        old_draft2 = self.create_draft_project(hours_old=30)
        
        # Call cleanup endpoint
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 2)
        self.assertEqual(response.data['total_abandoned'], 2)
        
        # Check projects were deleted
        self.assertFalse(Project.objects.filter(id=old_draft1.id).exists())
        self.assertFalse(Project.objects.filter(id=old_draft2.id).exists())

    def test_cleanup_drafts_idempotency(self):
        """Test that calling cleanup multiple times is idempotent"""
        old_draft = self.create_draft_project(hours_old=25)
        
        # First cleanup
        response1 = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.data['deleted_count'], 1)
        
        # Second cleanup (should be no-op)
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
        user_draft = self.create_draft_project(hours_old=25)
        other_draft = Project.objects.create(
            name='Other User Draft',
            project_type='school',
            course_name='Test Course',
            is_draft=True,
            owner=other_user,
            created_at=timezone.now() - timedelta(hours=25),
            updated_at=timezone.now() - timedelta(hours=25)
        )
        
        # Cleanup current user's drafts
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 1)
        
        # Check only current user's draft was deleted
        self.assertFalse(Project.objects.filter(id=user_draft.id).exists())
        self.assertTrue(Project.objects.filter(id=other_draft.id).exists())

    def test_cleanup_drafts_invalid_hours(self):
        """Test validation of hours parameter"""
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': -1
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 0
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cleanup_drafts_metrics(self):
        """Test that cleanup updates metrics correctly"""
        old_draft1 = self.create_draft_project(hours_old=25)
        old_draft2 = self.create_draft_project(hours_old=30)
        
        # Get initial metrics
        initial_metrics = self.client.get('/api/projects/cleanup_metrics/')
        self.assertEqual(initial_metrics.status_code, status.HTTP_200_OK)
        
        # Perform cleanup
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check updated metrics
        updated_metrics = self.client.get('/api/projects/cleanup_metrics/')
        self.assertEqual(updated_metrics.status_code, status.HTTP_200_OK)
        
        # Metrics should reflect the cleanup
        self.assertEqual(updated_metrics.data['drafts_cleaned_count'], 2)
        self.assertEqual(updated_metrics.data['drafts_active_total'], 0)

    def test_cleanup_drafts_concurrent_requests(self):
        """Test handling of concurrent cleanup requests"""
        old_draft = self.create_draft_project(hours_old=25)
        
        # Manually set cache to simulate cleanup in progress
        cache_key = f"draft_cleanup_{self.user.id}_24"
        cache.set(cache_key, True, timeout=300)
        
        # First request should be blocked
        response1 = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.data['deleted_count'], 0)
        self.assertIn('already in progress', response1.data['message'])
        
        # Clear cache and try again - should work
        cache.delete(cache_key)
        response2 = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['deleted_count'], 1)

    def test_cleanup_drafts_only_drafts(self):
        """Test that only draft projects are cleaned up"""
        # Create a completed project
        completed_project = Project.objects.create(
            name='Completed Project',
            project_type='school',
            course_name='Test Course',
            is_draft=False,
            owner=self.user,
            created_at=timezone.now() - timedelta(hours=25),
            updated_at=timezone.now() - timedelta(hours=25)
        )
        
        # Create an old draft
        old_draft = self.create_draft_project(hours_old=25)
        
        # Perform cleanup
        response = self.client.post('/api/projects/cleanup_drafts/', {
            'hours': 24
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted_count'], 1)
        
        # Only draft should be deleted
        self.assertFalse(Project.objects.filter(id=old_draft.id).exists())
        self.assertTrue(Project.objects.filter(id=completed_project.id).exists())

    def test_cleanup_drafts_custom_hours(self):
        """Test cleanup with custom hours parameter"""
        # Clear any existing projects and cache to ensure clean state
        Project.objects.filter(owner=self.user).delete()
        cache.clear()
        
        # Use freezegun to control time
        from freezegun import freeze_time
        
        # Create drafts at different times relative to a recent base time
        with freeze_time("2025-07-25 10:00:00"):
            very_old_draft = Project.objects.create(
                name='Test Draft 50h old',
                project_type='school',
                course_name='Test Course',
                is_draft=True,
                owner=self.user
            )
        
        with freeze_time("2025-07-26 10:00:00"):
            old_draft = Project.objects.create(
                name='Test Draft 25h old',
                project_type='school',
                course_name='Test Course',
                is_draft=True,
                owner=self.user
            )
        
        with freeze_time("2025-07-26 22:00:00"):
            recent_draft = Project.objects.create(
                name='Test Draft 12h old',
                project_type='school',
                course_name='Test Course',
                is_draft=True,
                owner=self.user
            )
        
        # Freeze time for the API call to match the draft creation times
        with freeze_time("2025-07-27 10:00:00"):
            # Cleanup with 30 hour threshold
            response = self.client.post('/api/projects/cleanup_drafts/', {
                'hours': 30
            })
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['deleted_count'], 1)  # Only very_old should be deleted
            
            # Check results
            self.assertFalse(Project.objects.filter(id=very_old_draft.id).exists())
            self.assertTrue(Project.objects.filter(id=old_draft.id).exists())
            self.assertTrue(Project.objects.filter(id=recent_draft.id).exists()) 