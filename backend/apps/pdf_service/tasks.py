# pdf_service/tasks.py

"""
Defines asynchronous background tasks for the PDF processing pipeline.
"""
from celery import shared_task
from django.db import transaction
import logging

from .django_models import Document
from .ingestion import ingest_pdf
from .services.dispatcher import DocumentDispatcher

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    max_retries=2,  # Allow 2 retries
    default_retry_delay=5,  # Wait 5 seconds between retries
    soft_time_limit=300,  # 5 minutes soft timeout
    time_limit=360,  # 6 minutes hard timeout
)
def process_document(self, document_id: int, test_mode: bool = False):
    """
    Celery task to process a document using the DocumentDispatcher.
    Includes timeout handling and retries for reliability.
    
    Args:
        document_id: ID of the document to process
        test_mode: Whether to use mock AI client for testing
    """
    try:
        document = Document.objects.get(id=document_id)
        document.status = 'processing'
        document.save(update_fields=['status'])

        # Step 1: Ingest the PDF to extract text if it hasn't been done already.
        if not document.original_text:
            text_chunks, metadata = ingest_pdf(document.file.path)
            # Extract content from PDFChunk objects
            document.original_text = "\n".join(chunk.content for chunk in text_chunks)
            if not document.metadata:
                 document.metadata = metadata
            document.save(update_fields=['original_text', 'metadata'])

        # Step 2: Dispatch the document for classification and processing
        # Create a mock request object with test mode header if needed
        class MockRequest:
            def __init__(self, test_mode: bool):
                self.headers = {'X-Test-Mode': 'true'} if test_mode else {}
        
        request = MockRequest(test_mode) if test_mode else None
        dispatcher = DocumentDispatcher(document=document, request=request)
        dispatcher.dispatch()

        # Step 3: Mark as completed
        document.status = 'completed'
        document.save(update_fields=['status'])
        logger.info(f"Successfully processed document {document_id}")

    except Document.DoesNotExist:
        logger.error(f"Document with id {document_id} not found.")
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        try:
            document = Document.objects.get(id=document_id)
            document.status = 'error'
            document.error_message = str(e)  # Store error message
            document.save(update_fields=['status', 'error_message'])
            
            # Retry on certain errors, but not on Document.DoesNotExist
            if not isinstance(e, Document.DoesNotExist):
                raise self.retry(exc=e)
                
        except Document.DoesNotExist:
            pass 