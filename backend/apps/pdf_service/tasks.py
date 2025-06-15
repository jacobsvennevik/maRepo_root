# pdf_service/tasks.py

"""
Defines asynchronous background tasks for the PDF processing pipeline.
"""
from celery import shared_task
from django.db import transaction
import logging

from .django_models import Document
from .ingestion import ingest_pdf
from .classification import classify_syllabus
from .vector_store import get_vector_store

logger = logging.getLogger(__name__)

@shared_task
def process_pdf_and_classify(document_id: int):
    """
    Celery task to process a PDF document, classify its content, update the
    associated project with syllabus data, and store text chunks in a vector store.
    """
    try:
        document = Document.objects.get(id=document_id)
        document.status = 'processing'
        document.save()

        # Step 1: Ingest the PDF to extract text and split into chunks
        text_chunks, metadata = ingest_pdf(document.file.path)
        document.original_text = "\n".join(text_chunks)
        document.metadata = metadata
        document.save()

        # Step 2: Classify the document to extract structured syllabus data
        syllabus_data = classify_syllabus(document.original_text)

        # Step 3: If syllabus data is extracted, update the related project
        if syllabus_data:
            # The Document is linked to a Project via the StudyMaterial model.
            study_material = document.study_materials.first()
            if study_material and study_material.project:
                project = study_material.project
                project.syllabus = syllabus_data.dict()
                project.save()

        # Step 4: Create and store vector embeddings for the text chunks
        vector_store = get_vector_store(collection_name=f"project_{project.id}_documents")
        vector_store.add_texts(texts=text_chunks, metadatas=[metadata] * len(text_chunks))

        document.status = 'completed'
        document.save()
        logger.info(f"Successfully processed document {document_id}")

    except Document.DoesNotExist:
        logger.error(f"Document with id {document_id} not found.")
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        # Optionally, set status to 'error'
        try:
            document = Document.objects.get(id=document_id)
            document.status = 'error'
            document.save()
        except Document.DoesNotExist:
            pass # Document was not found in the first place 