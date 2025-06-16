import pytest
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from backend.apps.pdf_service.tasks import process_document
from backend.apps.pdf_service.django_models import Document

User = get_user_model()

@pytest.mark.django_db
def test_process_document_task():
    """
    Tests the process_document celery task.
    """
    # Arrange
    # Create a user and a document instance to be processed
    user = User.objects.create_user(email='test@example.com', password='password')
    document = Document.objects.create(
        id=1,
        user=user,
        file="path/to/fake.pdf",
        original_text="", # Ensure it's empty to trigger ingestion
        status='pending'
    )

    # Patch the dependencies of the task
    with patch('backend.apps.pdf_service.tasks.ingest_pdf') as mock_ingest, \
         patch('backend.apps.pdf_service.tasks.DocumentDispatcher') as MockDispatcher:

        # Configure mocks
        mock_ingest.return_value = (["text chunk 1"], {"source": "test"})
        mock_dispatcher_instance = MockDispatcher.return_value

        # Act
        process_document(document.id)

        # Assert
        # Verify that ingestion was called
        mock_ingest.assert_called_once()

        # Refresh document state from DB
        document.refresh_from_db()

        # Verify that the dispatcher was initialized with the updated document
        MockDispatcher.assert_called_once()
        assert MockDispatcher.call_args[1]['document'].original_text == "text chunk 1"
        
        # Verify that dispatch was called
        mock_dispatcher_instance.dispatch.assert_called_once()

        # Verify the final status
        assert document.status == 'completed' 