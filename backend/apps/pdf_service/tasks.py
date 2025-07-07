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

@shared_task
def process_document(document_id: int):
    """
    Celery task to process a document using the DocumentDispatcher.
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
        dispatcher = DocumentDispatcher(document=document)
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
            document.save(update_fields=['status'])
        except Document.DoesNotExist:
            pass 