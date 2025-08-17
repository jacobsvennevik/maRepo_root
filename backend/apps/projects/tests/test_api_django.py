from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from ..models import Project, ENABLE_STI

User = get_user_model()


class ProjectAPITestCase(TestCase):
    """Test project API endpoints in both legacy and STI modes."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_project_list_unauthenticated(self):
        """Test that unauthenticated users cannot access the project list."""
        url = reverse('project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_project_list_authenticated(self):
        """Test that authenticated users can access their own projects."""
        # Create projects for the user
        Project.objects.create(
            name='Project 1',
            project_type='school',
            owner=self.user,
            course_name='Course 1'
        )
        Project.objects.create(
            name='Project 2',
            project_type='self_study',
            owner=self.user,
            goal_description='Goal 2'
        )
        # Create a project for another user
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        Project.objects.create(
            name='Other Project',
            project_type='school',
            owner=other_user,
            course_name='Other Course'
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_school_project(self):
        """Test creating a school project."""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        data = {
            'name': 'History Thesis',
            'project_type': 'school',
            'course_name': 'History 101',
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'History Thesis')
        self.assertEqual(response.data['project_type'], 'school')
        self.assertEqual(response.data['course_name'], 'History 101')

    def test_create_self_study_project(self):
        """Test creating a self-study project."""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        data = {
            'name': 'Learn Django',
            'project_type': 'self_study',
            'goal_description': 'Master Django Rest Framework',
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Learn Django')
        self.assertEqual(response.data['project_type'], 'self_study')
        self.assertEqual(response.data['goal_description'], 'Master Django Rest Framework')

    def test_create_project_with_nested_sti_data(self):
        """Test creating a project with nested STI data when ENABLE_STI=True."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        self.client.force_authenticate(user=self.user)
        url = reverse('project-list')
        data = {
            'name': 'Nested STI Project',
            'project_type': 'school',
            'school_data': {
                'course_name': 'Nested Course',
                'course_code': 'NEST101',
                'teacher_name': 'Nested Teacher'
            }
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Nested STI Project')
        self.assertEqual(response.data['project_type'], 'school')
        
        # Should have STI fields when ENABLE_STI=True
        self.assertIn('school_data', response.data)
        self.assertEqual(response.data['school_data']['course_name'], 'Nested Course')
        self.assertEqual(response.data['school_data']['course_code'], 'NEST101')

        # Legacy fields should be synced
        self.assertEqual(response.data['course_name'], 'Nested Course')
        self.assertEqual(response.data['course_code'], 'NEST101')

    def test_update_project_with_nested_sti_data(self):
        """Test updating a project with nested STI data when ENABLE_STI=True."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        # Create a project first
        project = Project.objects.create(
            name='Original Project',
            project_type='school',
            owner=self.user,
            course_name='Original Course'
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('project-detail', kwargs={'pk': project.pk})
        data = {
            'school_data': {
                'course_name': 'Updated Course',
                'course_code': 'UPD101',
                'teacher_name': 'Updated Teacher'
            }
        }
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['school_data']['course_name'], 'Updated Course')
        self.assertEqual(response.data['course_name'], 'Updated Course')

    def test_cleanup_drafts_endpoint(self):
        """Test the cleanup drafts endpoint."""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-cleanup-drafts')
        response = self.client.post(url, {'hours': 24}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('deleted_count', response.data)
        self.assertIn('message', response.data)

    def test_cleanup_metrics_endpoint(self):
        """Test the cleanup metrics endpoint."""
        self.client.force_authenticate(user=self.user)
        url = reverse('project-cleanup-metrics')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('drafts_cleaned_count', response.data)
        self.assertIn('drafts_active_total', response.data) 