import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from backend.apps.pdf_service.django_models import Document
from backend.apps.study_materials.models import StudyMaterial, Note, Test

User = get_user_model()

@pytest.mark.django_db
def test_study_material_creation():
    # ...
    pass

class StudyMaterialModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.document = Document.objects.create(
            user=self.user,
            title="Test Document",
            file_type='pdf',
            status='completed'
        )

    def test_study_material_creation(self):
        """Test creating a study material with valid data"""
        study_material = StudyMaterial.objects.create(
            document=self.document,
            owner=self.user,
            material_type='note',
            title='Test Study Material'
        )
        self.assertEqual(study_material.document, self.document)
        self.assertEqual(study_material.owner, self.user)
        self.assertEqual(study_material.material_type, 'note')

    def test_study_material_str_representation(self):
        """Test the string representation of study material"""
        study_material = StudyMaterial.objects.create(
            document=self.document,
            owner=self.user,
            material_type='note',
            title='Test Study Material'
        )
        expected_str = f"Test Study Material (Type: note)"
        self.assertEqual(str(study_material), expected_str)

    def test_invalid_material_type(self):
        """Test that invalid material type raises validation error"""
        with self.assertRaises(ValidationError):
            study_material = StudyMaterial.objects.create(
                document=self.document,
                owner=self.user,
                material_type='invalid_type',
                title='Test Study Material'
            )
            study_material.full_clean()

class NoteModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.document = Document.objects.create(
            user=self.user,
            title="Test Document",
            file_type='pdf',
            status='completed'
        )
        self.study_material = StudyMaterial.objects.create(
            document=self.document,
            owner=self.user,
            material_type='note',
            title='Test Note Material'
        )

    def test_note_creation(self):
        """Test creating a note with valid data"""
        note = Note.objects.create(
            study_material=self.study_material,
            content='Test note content'
        )
        self.assertEqual(note.study_material, self.study_material)
        self.assertEqual(note.content, 'Test note content')

    def test_note_str_representation(self):
        """Test the string representation of note"""
        note = Note.objects.create(
            study_material=self.study_material,
            content='Test note content'
        )
        expected_str = f"Note: {note.study_material.title}"
        self.assertEqual(str(note), expected_str)

    def test_one_to_one_relationship(self):
        """Test that a study material can only have one note"""
        Note.objects.create(
            study_material=self.study_material,
            content='First note'
        )
        with self.assertRaises(IntegrityError):
            Note.objects.create(
                study_material=self.study_material,
                content='Second note'
            )

class TestModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.document = Document.objects.create(
            user=self.user,
            title="Test Document",
            file_type='pdf',
            status='completed'
        )
        self.study_material = StudyMaterial.objects.create(
            document=self.document,
            owner=self.user,
            material_type='test',
            title='Test Quiz Material'
        )

    def test_test_creation(self):
        """Test creating a test with valid data"""
        test = Test.objects.create(
            study_material=self.study_material,
            instructions='Test instructions',
            time_limit=30
        )
        self.assertEqual(test.study_material, self.study_material)
        self.assertEqual(test.instructions, 'Test instructions')
        self.assertEqual(test.time_limit, 30)

    def test_test_str_representation(self):
        """Test the string representation of test"""
        test = Test.objects.create(
            study_material=self.study_material,
            instructions='Test instructions'
        )
        expected_str = f"Test: {test.study_material.title}"
        self.assertEqual(str(test), expected_str)

    def test_one_to_one_relationship(self):
        """Test that a study material can only have one test"""
        Test.objects.create(
            study_material=self.study_material,
            instructions='First test'
        )
        with self.assertRaises(IntegrityError):
            Test.objects.create(
                study_material=self.study_material,
                instructions='Second test'
            ) 