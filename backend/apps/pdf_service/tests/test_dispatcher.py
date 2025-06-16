# backend/apps/pdf_service/tests/test_dispatcher.py
import pytest
from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from backend.apps.pdf_service.constants import DocumentType
from backend.apps.pdf_service.services.dispatcher import DocumentDispatcher
from backend.apps.pdf_service.django_models import Document, ProcessedData
from backend.apps.pdf_service.models import SyllabusDetails

User = get_user_model()

@pytest.mark.django_db
def test_dispatcher_flow():
    # Arrange
    # 1. Create a user and a mock Document object
    user = User.objects.create_user(email='test@example.com', password='password')
    doc = Document.objects.create(user=user, original_text="This is a test syllabus.")

    # 2. Patch the dependencies of DocumentDispatcher
    with patch('backend.apps.pdf_service.services.dispatcher.DocumentClassifierService') as MockClassifier, \
         patch('backend.apps.pdf_service.services.dispatcher.SyllabusProcessorService') as MockSyllabusProcessor, \
         patch('backend.apps.pdf_service.services.dispatcher.AIClient'): # Patch AIClient so it's not actually created

        # Configure the mock classifier to return SYLLABUS
        mock_classifier_instance = MockClassifier.return_value
        mock_classifier_instance.classify.return_value = DocumentType.SYLLABUS

        # Configure the mock syllabus processor to return some data
        mock_processor_instance = MockSyllabusProcessor.return_value
        mock_processor_instance.process.return_value = SyllabusDetails(course_title="Test Course")

        # Act
        # 3. Instantiate and run the dispatcher
        dispatcher = DocumentDispatcher(document=doc)
        dispatcher.dispatch()

        # Assert
        # 4. Verify the interactions
        # Check that the classifier was called
        mock_classifier_instance.classify.assert_called_once_with(doc.original_text)

        # Check that the document type was updated
        doc.refresh_from_db()
        assert doc.document_type == DocumentType.SYLLABUS.value

        # Check that the correct processor was called
        # Note: We are checking the mock for the *class*, not the instance we made
        dispatcher.processors[DocumentType.SYLLABUS].process.assert_called_once_with(doc.original_text)

        # Check that the data was saved
        assert ProcessedData.objects.filter(document=doc).exists()
        processed_data = ProcessedData.objects.get(document=doc)
        assert processed_data.data['course_title'] == 'Test Course' 