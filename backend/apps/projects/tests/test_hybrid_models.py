import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

from ..models import Project, SchoolProject, SelfStudyProject, ENABLE_STI
from ..serializers import ProjectSerializer

User = get_user_model()


class HybridModelsTestCase(TestCase):
    """Test the hybrid model behavior in both legacy and STI modes."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_legacy_mode_project_creation(self):
        """Test that legacy mode works with old field structure."""
        # Create project using legacy fields
        project = Project.objects.create(
            name='Test School Project',
            project_type='school',
            owner=self.user,
            course_name='Mathematics 101',
            course_code='MATH101',
            teacher_name='Dr. Smith',
            is_draft=False
        )

        self.assertEqual(project.name, 'Test School Project')
        self.assertEqual(project.course_name, 'Mathematics 101')
        self.assertEqual(project.project_type, 'school')

        # Test serializer
        serializer = ProjectSerializer(project)
        data = serializer.data
        
        # Should have legacy fields
        self.assertEqual(data['course_name'], 'Mathematics 101')
        self.assertEqual(data['course_code'], 'MATH101')
        self.assertEqual(data['teacher_name'], 'Dr. Smith')
        
        # Check STI fields based on current mode
        if ENABLE_STI:
            # When STI is enabled, fields should be present (even if None)
            self.assertIn('school_data', data)
            self.assertIn('self_study_data', data)
        else:
            # When STI is disabled, fields should not be present
            self.assertNotIn('school_data', data)
            self.assertNotIn('self_study_data', data)

    def test_sti_mode_project_creation(self):
        """Test that STI mode works with new nested structure."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")
            
        # Create project using STI structure
        project = Project.objects.create(
            name='Test School Project',
            project_type='school',
            owner=self.user,
            is_draft=False
        )
        
        # Create STI data (use get_or_create to avoid conflicts with post_save signal)
        school_data, created = SchoolProject.objects.get_or_create(
            project=project,
            defaults={
                'course_name': 'Advanced Mathematics',
                'course_code': 'MATH201',
                'teacher_name': 'Dr. Johnson'
            }
        )

        self.assertEqual(project.name, 'Test School Project')
        self.assertEqual(project.project_type, 'school')
        self.assertEqual(school_data.course_name, 'Advanced Mathematics')

        # Test serializer in STI mode
        serializer = ProjectSerializer(project)
        data = serializer.data
        
        # Should have both legacy and STI fields
        self.assertEqual(data['course_name'], 'Advanced Mathematics')
        self.assertEqual(data['course_code'], 'MATH201')
        self.assertEqual(data['teacher_name'], 'Dr. Johnson')
        
        # Should have STI fields
        self.assertIn('school_data', data)
        self.assertEqual(data['school_data']['course_name'], 'Advanced Mathematics')

    def test_self_study_project_creation(self):
        """Test self-study project creation in both modes."""
        # Create project using legacy fields
        project = Project.objects.create(
            name='Test Self-Study Project',
            project_type='self_study',
            owner=self.user,
            goal_description='Learn advanced mathematics',
            study_frequency='daily',
            is_draft=False
        )

        self.assertEqual(project.name, 'Test Self-Study Project')
        self.assertEqual(project.goal_description, 'Learn advanced mathematics')
        self.assertEqual(project.project_type, 'self_study')

        # Test serializer
        serializer = ProjectSerializer(project)
        data = serializer.data
        
        # Should have legacy fields
        self.assertEqual(data['goal_description'], 'Learn advanced mathematics')
        self.assertEqual(data['study_frequency'], 'daily')

    def test_api_endpoint_compatibility(self):
        """Test that API endpoints work in both modes."""
        # Create project using legacy structure
        project = Project.objects.create(
            name='Test API Project',
            project_type='school',
            owner=self.user,
            course_name='API Test Course',
            course_code='API101',
            teacher_name='API Teacher',
            is_draft=False
        )

        # Test list endpoint
        url = reverse('project-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test API Project')
        self.assertEqual(response.data[0]['course_name'], 'API Test Course')

    def test_data_synchronization(self):
        """Test that data is properly synchronized between old and new structures."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")
            
        # Create project with legacy fields
        project = Project.objects.create(
            name='Sync Test Project',
            project_type='school',
            owner=self.user,
            course_name='Original Course',
            course_code='ORIG101',
            teacher_name='Original Teacher',
            is_draft=False
        )

        # Create STI structure (should sync data)
        school_data, created = SchoolProject.objects.get_or_create(
            project=project,
            defaults={
                'course_name': 'Updated Course',
                'course_code': 'UPD101',
                'teacher_name': 'Updated Teacher'
            }
        )
        
        # If the object already existed, update it to trigger sync
        if not created:
            school_data.course_name = 'Updated Course'
            school_data.course_code = 'UPD101'
            school_data.teacher_name = 'Updated Teacher'
            school_data.save()

        # Refresh from database
        project.refresh_from_db()
        
        # Legacy fields should be updated from STI data
        self.assertEqual(project.course_name, 'Updated Course')
        self.assertEqual(project.course_code, 'UPD101')
        self.assertEqual(project.teacher_name, 'Updated Teacher')

        # Test serializer
        serializer = ProjectSerializer(project)
        data = serializer.data
        
        # Both legacy and STI fields should be consistent
        self.assertEqual(data['course_name'], 'Updated Course')
        self.assertEqual(data['school_data']['course_name'], 'Updated Course')

    def test_legacy_write_creates_subtype(self):
        """Test that creating a project with legacy fields automatically creates STI subtype."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")
            
        # Create project using legacy fields only
        project = Project.objects.create(
            name='Legacy Write Test Project',
            project_type='school',
            owner=self.user,
            course_name='Legacy Course',
            course_code='LEG101',
            teacher_name='Dr. Legacy',
            is_draft=False
        )

        # The post_save signal should automatically create the SchoolProject
        self.assertTrue(hasattr(project, 'school_project_data'))
        self.assertIsNotNone(project.school_project_data)
        
        # Verify the STI data matches the legacy fields
        self.assertEqual(project.school_project_data.course_name, 'Legacy Course')
        self.assertEqual(project.school_project_data.course_code, 'LEG101')
        self.assertEqual(project.school_project_data.teacher_name, 'Dr. Legacy')

        # Test self-study project
        self_study_project = Project.objects.create(
            name='Self-Study Legacy Test',
            project_type='self_study',
            owner=self.user,
            goal_description='Learn advanced topics',
            study_frequency='daily',
            is_draft=False
        )

        # The post_save signal should automatically create the SelfStudyProject
        self.assertTrue(hasattr(self_study_project, 'self_study_project_data'))
        self.assertIsNotNone(self_study_project.self_study_project_data)
        
        # Verify the STI data matches the legacy fields
        self.assertEqual(self_study_project.self_study_project_data.goal_description, 'Learn advanced topics')
        self.assertEqual(self_study_project.self_study_project_data.study_frequency, 'daily')


class HybridModeComparisonTestCase(TestCase):
    """Test comparison between legacy and STI modes."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_legacy_vs_sti_serialization(self):
        """Compare serialization output between legacy and STI modes."""
        # Create project with legacy fields
        project = Project.objects.create(
            name='Comparison Test Project',
            project_type='school',
            owner=self.user,
            course_name='Test Course',
            course_code='TEST101',
            teacher_name='Test Teacher',
            is_draft=False
        )

        # Test current mode
        serializer = ProjectSerializer(project)
        data = serializer.data
        
        # Should have legacy fields
        self.assertIn('course_name', data)
        
        # Check STI fields based on current mode
        if ENABLE_STI:
            # When STI is enabled, fields should be present
            self.assertIn('school_data', data)
            self.assertIn('self_study_data', data)
        else:
            # When STI is disabled, fields should not be present
            self.assertNotIn('school_data', data)
            self.assertNotIn('self_study_data', data)

        # Test in STI mode (if enabled)
        if ENABLE_STI:
            # Create STI structure
            school_data, created = SchoolProject.objects.get_or_create(
                project=project,
                defaults={
                    'course_name': 'STI Course',
                    'course_code': 'STI101',
                    'teacher_name': 'STI Teacher'
                }
            )
            
            # If the object already existed, update it to trigger sync
            if not created:
                school_data.course_name = 'STI Course'
                school_data.course_code = 'STI101'
                school_data.teacher_name = 'STI Teacher'
                school_data.save()
            
            # Refresh project to get synced data
            project.refresh_from_db()
            
            serializer_sti = ProjectSerializer(project)
            data_sti = serializer_sti.data
            
            # Should have both legacy and STI fields
            self.assertIn('course_name', data_sti)
            self.assertIn('school_data', data_sti)
            self.assertIn('self_study_data', data_sti)
            
            # Legacy fields should be synced from STI data
            self.assertEqual(data_sti['course_name'], 'STI Course')
            self.assertEqual(data_sti['school_data']['course_name'], 'STI Course') 