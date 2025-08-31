import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

from ..models import Project, SchoolProject, SelfStudyProject, ProjectMeta, ENABLE_STI
from ..serializers import ProjectSerializer, ProjectMetaSerializer

User = get_user_model()


class ProjectSerializerTestCase(TestCase):
    """Test the ProjectSerializer behavior in both legacy and STI modes."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_serializer_fields_legacy_mode(self):
        """Test that STI fields are excluded when ENABLE_STI=False."""
        # This test should only run when STI is disabled
        if ENABLE_STI:
            self.skipTest("This test only runs when STI is disabled")
            
        # Create project with legacy fields
        project = Project.objects.create(
            name='Test Project',
            project_type='school',
            owner=self.user,
            course_name='Test Course',
            course_code='TEST101',
            teacher_name='Test Teacher',
            is_draft=False
        )

        serializer = ProjectSerializer(project)
        data = serializer.data

        # Should have legacy fields
        self.assertIn('course_name', data)
        self.assertIn('course_code', data)
        self.assertIn('teacher_name', data)
        self.assertEqual(data['course_name'], 'Test Course')

        # Should NOT have STI fields in legacy mode
        self.assertNotIn('school_data', data)
        self.assertNotIn('self_study_data', data)

    def test_serializer_fields_sti_mode(self):
        """Test that both legacy and STI fields are present in STI mode."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        # Create project with STI structure
        project = Project.objects.create(
            name='Test Project',
            project_type='school',
            owner=self.user,
            is_draft=False
        )

        # Create STI data
        school_data = SchoolProject.objects.create(
            project=project,
            course_name='STI Course',
            course_code='STI101',
            teacher_name='STI Teacher'
        )

        serializer = ProjectSerializer(project)
        data = serializer.data

        # Should have legacy fields (synced from STI)
        self.assertIn('course_name', data)
        self.assertIn('course_code', data)
        self.assertIn('teacher_name', data)
        self.assertEqual(data['course_name'], 'STI Course')

        # Should have STI fields
        self.assertIn('school_data', data)
        self.assertIn('self_study_data', data)
        self.assertEqual(data['school_data']['course_name'], 'STI Course')

    def test_serializer_fields_sti_mode_with_legacy_data(self):
        """Test that STI fields are present when ENABLE_STI=True, even with legacy data."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        # Create project with legacy fields (post_save signal will create STI structure)
        project = Project.objects.create(
            name='Test Project',
            project_type='school',
            owner=self.user,
            course_name='Test Course',
            course_code='TEST101',
            teacher_name='Test Teacher',
            is_draft=False
        )

        serializer = ProjectSerializer(project)
        data = serializer.data

        # Should have legacy fields
        self.assertIn('course_name', data)
        self.assertIn('course_code', data)
        self.assertIn('teacher_name', data)
        self.assertEqual(data['course_name'], 'Test Course')

        # Should have STI fields when ENABLE_STI=True
        self.assertIn('school_data', data)
        self.assertIn('self_study_data', data)
        self.assertEqual(data['school_data']['course_name'], 'Test Course')

    def test_serializer_create_legacy_mode(self):
        """Test project creation in legacy mode."""
        data = {
            'name': 'New Project',
            'project_type': 'school',
            'course_name': 'New Course',
            'course_code': 'NEW101',
            'teacher_name': 'New Teacher',
            'is_draft': False
        }

        serializer = ProjectSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        project = serializer.save(owner=self.user)

        self.assertEqual(project.name, 'New Project')
        self.assertEqual(project.course_name, 'New Course')
        self.assertEqual(project.course_code, 'NEW101')

    def test_serializer_create_sti_mode(self):
        """Test project creation in STI mode."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        data = {
            'name': 'New STI Project',
            'project_type': 'school',
            'course_name': 'New STI Course',
            'course_code': 'STI101',
            'teacher_name': 'STI Teacher',
            'is_draft': False
        }

        serializer = ProjectSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        project = serializer.save(owner=self.user)

        self.assertEqual(project.name, 'New STI Project')
        self.assertEqual(project.course_name, 'New STI Course')

        # Should have STI structure created automatically
        self.assertTrue(hasattr(project, 'school_project_data'))
        self.assertEqual(project.school_project_data.course_name, 'New STI Course')

    def test_serializer_update_legacy_mode(self):
        """Test project update in legacy mode."""
        project = Project.objects.create(
            name='Original Project',
            project_type='school',
            owner=self.user,
            course_name='Original Course',
            is_draft=False
        )

        data = {
            'course_name': 'Updated Course',
            'course_code': 'UPD101'
        }

        serializer = ProjectSerializer(project, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_project = serializer.save()

        self.assertEqual(updated_project.course_name, 'Updated Course')
        self.assertEqual(updated_project.course_code, 'UPD101')

    def test_serializer_update_sti_mode(self):
        """Test project update in STI mode."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        project = Project.objects.create(
            name='Original STI Project',
            project_type='school',
            owner=self.user,
            course_name='Original STI Course',
            is_draft=False
        )

        # Create STI structure
        SchoolProject.objects.get_or_create(
            project=project,
            defaults={
                'course_name': 'Original STI Course',
                'course_code': 'ORIG101',
                'teacher_name': 'Original Teacher'
            }
        )

        data = {
            'course_name': 'Updated STI Course',
            'course_code': 'UPD101'
        }

        serializer = ProjectSerializer(project, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_project = serializer.save()

        self.assertEqual(updated_project.course_name, 'Updated STI Course')
        self.assertEqual(updated_project.course_code, 'UPD101')

        # STI structure should also be updated
        updated_project.refresh_from_db()
        self.assertEqual(updated_project.school_project_data.course_name, 'Updated STI Course')
        self.assertEqual(updated_project.school_project_data.course_code, 'UPD101')

    def test_serializer_nested_sti_data(self):
        """Test creating project with nested STI data."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        data = {
            'name': 'Nested STI Project',
            'project_type': 'school',
            'is_draft': False,
            'school_data': {
                'course_name': 'Nested Course',
                'course_code': 'NEST101',
                'teacher_name': 'Nested Teacher'
            }
        }

        serializer = ProjectSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        project = serializer.save(owner=self.user)

        self.assertEqual(project.name, 'Nested STI Project')
        
        # Refresh to ensure we have the latest data
        project.refresh_from_db()
        
        self.assertTrue(hasattr(project, 'school_project_data'))
        self.assertEqual(project.school_project_data.course_name, 'Nested Course')
        self.assertEqual(project.school_project_data.course_code, 'NEST101')

        # Legacy fields should be synced
        self.assertEqual(project.course_name, 'Nested Course')
        self.assertEqual(project.course_code, 'NEST101')


class ProjectMetaSerializerTestCase(TestCase):
    """Test the ProjectMetaSerializer functionality."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.project = Project.objects.create(
            name='Test Project',
            project_type='school',
            owner=self.user,
            is_draft=False
        )

    def test_project_meta_serializer(self):
        """Test ProjectMetaSerializer basic functionality."""
        meta = ProjectMeta.objects.create(
            project=self.project,
            key='test_key',
            value={'nested': 'data', 'number': 42}
        )

        serializer = ProjectMetaSerializer(meta)
        data = serializer.data

        self.assertEqual(data['key'], 'test_key')
        self.assertEqual(data['value'], {'nested': 'data', 'number': 42})
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

    def test_project_meta_in_project_serializer_legacy_mode(self):
        """Test that meta field is ignored in legacy mode."""
        if ENABLE_STI:
            self.skipTest("This test only runs when STI is disabled")

        # Create metadata
        ProjectMeta.objects.create(
            project=self.project,
            key='test_key',
            value='test_value'
        )

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        # Meta field should be empty in legacy mode
        self.assertIn('meta', data)
        self.assertEqual(data['meta'], {})

    def test_project_meta_in_project_serializer_sti_mode(self):
        """Test that meta field is included in STI mode."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        # Create metadata
        ProjectMeta.objects.create(
            project=self.project,
            key='test_key',
            value='test_value'
        )
        ProjectMeta.objects.create(
            project=self.project,
            key='another_key',
            value={'nested': 'data'}
        )

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        # Meta field should contain the metadata
        self.assertIn('meta', data)
        self.assertEqual(data['meta']['test_key'], 'test_value')
        self.assertEqual(data['meta']['another_key'], {'nested': 'data'})

    def test_create_project_with_meta_sti_mode(self):
        """Test creating project with meta data in STI mode."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        data = {
            'name': 'Project with Meta',
            'project_type': 'school',
            'is_draft': False,
            'meta': {
                'custom_field': 'custom_value',
                'settings': {'theme': 'dark', 'notifications': True}
            }
        }

        serializer = ProjectSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        project = serializer.save(owner=self.user)

        # Check that metadata was created
        self.assertEqual(project.metadata.count(), 2)
        
        # Check specific metadata
        custom_meta = project.metadata.get(key='custom_field')
        self.assertEqual(custom_meta.value, 'custom_value')
        
        settings_meta = project.metadata.get(key='settings')
        self.assertEqual(settings_meta.value, {'theme': 'dark', 'notifications': True})

    def test_update_project_meta_sti_mode(self):
        """Test updating project meta data in STI mode."""
        if not ENABLE_STI:
            self.skipTest("STI mode not enabled")

        # Create initial metadata
        ProjectMeta.objects.create(
            project=self.project,
            key='old_key',
            value='old_value'
        )

        data = {
            'meta': {
                'new_key': 'new_value',
                'updated_settings': {'version': '2.0'}
            }
        }

        serializer = ProjectSerializer(self.project, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_project = serializer.save()

        # Old metadata should be removed
        self.assertFalse(updated_project.metadata.filter(key='old_key').exists())
        
        # New metadata should be created
        self.assertEqual(updated_project.metadata.count(), 2)
        self.assertTrue(updated_project.metadata.filter(key='new_key').exists())
        self.assertTrue(updated_project.metadata.filter(key='updated_settings').exists())

    def test_meta_field_ignored_in_legacy_mode(self):
        """Test that meta field is completely ignored in legacy mode."""
        if ENABLE_STI:
            self.skipTest("This test only runs when STI is disabled")

        data = {
            'name': 'Legacy Project',
            'project_type': 'school',
            'is_draft': False,
            'meta': {
                'should_be_ignored': 'ignored_value'
            }
        }

        serializer = ProjectSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        project = serializer.save(owner=self.user)

        # No metadata should be created in legacy mode
        self.assertEqual(project.metadata.count(), 0)
        
        # Meta field should be empty in response
        response_serializer = ProjectSerializer(project)
        self.assertEqual(response_serializer.data['meta'], {}) 