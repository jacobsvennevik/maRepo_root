import uuid
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

from backend.apps.projects.models import Project
from backend.apps.study_materials.models import StudyMaterial
from ..django_models import Document
from ..tasks import process_pdf_and_classify
from ..models import Syllabus

User = get_user_model()

@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class ProcessPdfAndClassifyTaskTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.project = Project.objects.create(
            name='Test Project',
            owner=self.user,
            id=uuid.uuid4()
        )
        self.document = Document.objects.create(
            user=self.user,
            file='test.pdf',
            title='Test Document'
        )
        self.study_material = StudyMaterial.objects.create(
            project=self.project,
            document=self.document,
            owner=self.user,
            title='Test Material'
        )

    @patch('backend.apps.pdf_service.tasks.get_vector_store')
    @patch('backend.apps.pdf_service.tasks.classify_syllabus')
    @patch('backend.apps.pdf_service.tasks.ingest_pdf')
    def test_process_pdf_and_classify_success(self, mock_ingest_pdf, mock_classify_syllabus, mock_get_vector_store):
        # Mock the external services
        mock_ingest_pdf.return_value = (['chunk1', 'chunk2'], {'pages': 2})
        
        mock_syllabus = Syllabus(
            course_name="Introduction to AI",
            course_code="CS101",
            teacher_name="Dr. Smith"
        )
        mock_classify_syllabus.return_value = mock_syllabus

        mock_vector_store = MagicMock()
        mock_get_vector_store.return_value = mock_vector_store

        # Execute the task
        process_pdf_and_classify.delay(self.document.id)

        # Refresh the objects from the database
        self.document.refresh_from_db()
        self.project.refresh_from_db()

        # Assertions
        self.assertEqual(self.document.status, 'completed')
        self.assertEqual(self.project.syllabus['course_name'], 'Introduction to AI')
        
        mock_ingest_pdf.assert_called_once()
        mock_classify_syllabus.assert_called_once()
        mock_get_vector_store.assert_called_once_with(collection_name=f"project_{self.project.id}_documents")
        mock_vector_store.add_texts.assert_called_once()

    @patch('backend.apps.pdf_service.tasks.ingest_pdf')
    def test_process_pdf_and_classify_error(self, mock_ingest_pdf):
        # Mock an error during ingestion
        mock_ingest_pdf.side_effect = Exception("PDF parsing failed")

        # Execute the task
        process_pdf_and_classify.delay(self.document.id)

        # Refresh the document from the database
        self.document.refresh_from_db()

        # Assert that the status is set to 'error'
        self.assertEqual(self.document.status, 'error') 