import logging
import mimetypes
import os
from typing import Optional, Dict, Any
from django.utils import timezone
from django.core.files import File
from .models import UploadedFile, Extraction
from backend.apps.generation.services.api_client import AIClient, Task
from django.conf import settings

logger = logging.getLogger(__name__)

def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return os.path.splitext(filename)[1].lower()

def get_mime_type(filename: str) -> str:
    """Get MIME type from filename."""
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'

def extract_text_from_txt(file_obj: File) -> str:
    """Extract text from plain text files."""
    try:
        with file_obj.open('r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with file_obj.open('r', encoding='latin-1') as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Failed to read text file: {e}")
            return ""

def extract_text_from_csv(file_obj: File) -> str:
    """Extract text from CSV files."""
    try:
        with file_obj.open('r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logger.warning(f"Failed to read CSV file: {e}")
        return ""

def extract_text_from_md(file_obj: File) -> str:
    """Extract text from Markdown files."""
    try:
        with file_obj.open('r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logger.warning(f"Failed to read Markdown file: {e}")
        return ""

def extract_text_from_pdf(file_obj: File) -> str:
    """Extract text from PDF files with fallback."""
    try:
        from backend.apps.pdf_service.ingestion import ingest_pdf
        # Create a temporary file if needed
        if hasattr(file_obj, 'path') and os.path.exists(file_obj.path):
            chunks = ingest_pdf(file_obj.path)
            return " ".join([chunk.page_content for chunk in chunks])
        else:
            # Handle S3 or other storage backends
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                for chunk in file_obj.chunks():
                    tmp_file.write(chunk)
                tmp_file.flush()
                try:
                    chunks = ingest_pdf(tmp_file.name)
                    return " ".join([chunk.page_content for chunk in chunks])
                finally:
                    os.unlink(tmp_file.name)
    except ImportError:
        logger.warning("PDF processing library not available")
        return ""
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        return ""

def extract_text_from_docx(file_obj: File) -> str:
    """Extract text from DOCX files with fallback."""
    try:
        from docx import Document
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp_file:
            for chunk in file_obj.chunks():
                tmp_file.write(chunk)
            tmp_file.flush()
            try:
                doc = Document(tmp_file.name)
                return " ".join([paragraph.text for paragraph in doc.paragraphs])
            finally:
                os.unlink(tmp_file.name)
    except ImportError:
        logger.warning("python-docx library not available")
        return ""
    except Exception as e:
        logger.error(f"DOCX processing failed: {e}")
        return ""

def call_llm_extractor(text: str) -> dict:
    """
    Calls a mock LLM to extract structured data from text.
    This should be replaced with a real LLM API call.
    """
    logger.info("Calling mock LLM extractor...")
    # Simulate a delay and token usage
    # In a real scenario, this would be an API call, e.g., to OpenAI or a self-hosted model
    prompt = f"Extract key information from the following syllabus text:\n\n{text}"
    mock_response = {
        "course_name": "Advanced Machine Learning",
        "course_code": "CS-677",
        "teacher_name": "Prof. Ada Lovelace",
        "start_date": "2024-09-02",
        "end_date": "2024-12-18",
        "syllabus": {"Week 1": "Introduction to Deep Learning", "Week 2": "Convolutional Neural Networks"},
    }
    mock_metrics = {
        "tokens_used": len(text.split()) // 2,  # Rough estimate
        "latency_ms": 350,
        "confidence_score": 0.92
    }
    logger.info("Mock LLM extraction successful.")
    return {"prompt": prompt, "response": mock_response, "metrics": mock_metrics}

def process_uploaded_file(uploaded_file_id: str) -> Optional[Dict[str, Any]]:
    """
    Robust file processing with "persist first, process later" approach.
    
    This function:
    1. Always saves the UploadedFile record first
    2. Processes content based on file type
    3. Handles failures gracefully
    4. Updates processing status and errors
    5. Ensures idempotency (can't be processed twice)
    """
    try:
        uploaded_file = UploadedFile.objects.get(id=uploaded_file_id)
    except UploadedFile.DoesNotExist:
        logger.error(f"UploadedFile with id {uploaded_file_id} not found.")
        return None

    # IDEMPOTENCY CHECK: Only process if in pending/failed state
    # Use atomic update to prevent race conditions
    from django.db import transaction
    with transaction.atomic():
        rows_updated = UploadedFile.objects.filter(
            id=uploaded_file_id,
            processing_status__in=['pending', 'failed']
        ).update(
            processing_status='processing',
            processing_started_at=timezone.now()
        )
        
        if rows_updated == 0:
            logger.info(f"File {uploaded_file_id} already being processed or in terminal state")
            return None
        
        # Refresh the object to get updated status
        uploaded_file.refresh_from_db()

    try:
        # Get file info
        filename = uploaded_file.original_name or uploaded_file.file.name
        extension = get_file_extension(filename)
        mime_type = get_mime_type(filename)
        
        # Update content type if not set
        if not uploaded_file.content_type:
            uploaded_file.content_type = mime_type
            uploaded_file.save(update_fields=['content_type'])

        logger.info(f"Processing file: {filename} (type: {mime_type}, extension: {extension})")

        # Extract text based on file type
        extracted_text = ""
        
        if extension in ['.txt', '.text']:
            extracted_text = extract_text_from_txt(uploaded_file.file)
        elif extension == '.csv':
            extracted_text = extract_text_from_csv(uploaded_file.file)
        elif extension == '.md':
            extracted_text = extract_text_from_md(uploaded_file.file)
        elif extension == '.pdf':
            extracted_text = extract_text_from_pdf(uploaded_file.file)
        elif extension in ['.docx', '.doc']:
            extracted_text = extract_text_from_docx(uploaded_file.file)
        else:
            logger.info(f"Unsupported file type: {extension}. Skipping text extraction.")
            uploaded_file.processing_status = 'skipped'
            uploaded_file.processing_error = f"Unsupported file type: {extension}"
            uploaded_file.processing_completed_at = timezone.now()
            uploaded_file.save(update_fields=['processing_status', 'processing_error', 'processing_completed_at'])
            return None

        # Save extracted text
        uploaded_file.extracted_text = extracted_text
        uploaded_file.raw_text = extracted_text  # Keep legacy field for compatibility
        
        if extracted_text:
            # Try to extract structured data if we have content
            try:
                llm_result = call_llm_extractor(extracted_text)
                
                # Create Extraction record
                extraction = Extraction.objects.create(
                    uploaded_file=uploaded_file,
                    prompt=llm_result['prompt'],
                    response=llm_result['response'],
                    tokens_used=llm_result['metrics']['tokens_used'],
                    latency_ms=llm_result['metrics']['latency_ms'],
                    confidence_score=llm_result['metrics']['confidence_score'],
                    is_valid_schema=True,
                )
                logger.info(f"Extraction record created: {extraction.id}")

                # Update Project with extracted data
                project = uploaded_file.project
                extracted_data = llm_result['response']
                
                project.name = extracted_data.get('course_name', project.name)
                project.course_name = extracted_data.get('course_name', project.course_name)
                project.course_code = extracted_data.get('course_code', project.course_code)
                project.teacher_name = extracted_data.get('teacher_name', project.teacher_name)
                project.start_date = extracted_data.get('start_date', project.start_date)
                project.end_date = extracted_data.get('end_date', project.end_date)
                project.syllabus = extracted_data.get('syllabus', project.syllabus)
                project.is_draft = False
                project.save()
                logger.info(f"Project {project.id} updated with extracted data.")

                # Mark as completed
                uploaded_file.processing_status = 'completed'
                uploaded_file.processing_completed_at = timezone.now()
                uploaded_file.save(update_fields=['processing_status', 'processing_completed_at'])

                # Log structured success
                logger.info(f"event=upload_processed file_id={uploaded_file_id} project_id={project.id} status=completed content_type={mime_type} duration_ms={(timezone.now() - uploaded_file.processing_started_at).total_seconds() * 1000:.0f}")

                return {
                    'extraction': extraction,
                    'project_updated': True,
                    'status': 'completed'
                }

            except Exception as e:
                logger.error(f"LLM extraction failed for {filename}: {e}")
                uploaded_file.processing_error = f"LLM extraction failed: {str(e)}"
                uploaded_file.processing_status = 'failed'
                uploaded_file.processing_completed_at = timezone.now()
                uploaded_file.save(update_fields=['processing_error', 'processing_status', 'processing_completed_at'])
                
                # Log structured failure
                logger.error(f"event=upload_processed file_id={uploaded_file_id} project_id={uploaded_file.project.id} status=failed content_type={mime_type} duration_ms={(timezone.now() - uploaded_file.processing_started_at).total_seconds() * 1000:.0f} error='{str(e)}'")
                
                return None

        else:
            # No text extracted
            uploaded_file.processing_status = 'failed'
            uploaded_file.processing_error = "No text content could be extracted"
            uploaded_file.processing_completed_at = timezone.now()
            uploaded_file.save(update_fields=['processing_status', 'processing_error', 'processing_completed_at'])
            
            # Log structured failure
            logger.error(f"event=upload_processed file_id={uploaded_file_id} project_id={uploaded_file.project.id} status=failed content_type={mime_type} duration_ms={(timezone.now() - uploaded_file.processing_started_at).total_seconds() * 1000:.0f} error='No text content could be extracted'")
            
            return None

    except Exception as e:
        logger.error(f"File processing failed for {uploaded_file.original_name}: {e}")
        uploaded_file.processing_error = f"Processing failed: {str(e)}"
        uploaded_file.processing_status = 'failed'
        uploaded_file.processing_completed_at = timezone.now()
        uploaded_file.save(update_fields=['processing_error', 'processing_status', 'processing_completed_at'])
        
        # Log structured failure
        logger.error(f"event=upload_processed file_id={uploaded_file_id} project_id={uploaded_file.project.id} status=failed content_type={mime_type} duration_ms={(timezone.now() - uploaded_file.processing_started_at).total_seconds() * 1000:.0f} error='{str(e)}'")
        
        return None


def seed_project_artifacts(project, *, request=None, mock_mode: bool = False, mock_bypass_content: bool = False, enable_flashcards: bool = True):
    """
    Seed syllabus/tests/content (and optional flashcards) into ProjectMeta using AIClient.
    - Uses real pipeline for uploads/raw_text; this only mocks the LLM if mock_mode=True.
    - If mock_mode and no content is available and mock_bypass_content=False, raises ValueError.
    """
    logger.info("Seeding project artifacts: project=%s mock_mode=%s", project.id, mock_mode)

    # Gather content from the latest uploaded file (if any)
    latest_file = (
        UploadedFile.objects.filter(project=project)
        .order_by('-uploaded_at')
        .first()
    )

    content = (latest_file.raw_text or "") if latest_file else ""

    if mock_mode and not mock_bypass_content and not content:
        raise ValueError("Content required in mock mode unless mock_bypass_content=true")

    payload = {
        "title": project.name,
        "content": content[:20000],  # defensive truncate
    }

    client = AIClient(model=getattr(settings, 'DEFAULT_AI_MODEL', 'gemini-1.5-flash'), request=request)

    # Call tasks
    syllabus_data = client.call(task=Task.SYLLABUS, payload=payload, mock_mode=mock_mode)
    tests_data = client.call(task=Task.TEST, payload=payload, mock_mode=mock_mode)
    content_data = client.call(task=Task.CONTENT, payload=payload, mock_mode=mock_mode)
    flashcards_data = None
    if enable_flashcards:
        try:
            flashcards_data = client.call(task=Task.FLASHCARDS, payload=payload, mock_mode=mock_mode)
        except Exception as e:
            logger.warning("Flashcards generation skipped: %s", e)

    # Persist via ProjectMeta
    ProjectMeta.objects.update_or_create(
        project=project, key='syllabus', defaults={'value': syllabus_data}
    )
    ProjectMeta.objects.update_or_create(
        project=project, key='tests', defaults={'value': tests_data}
    )
    ProjectMeta.objects.update_or_create(
        project=project, key='content', defaults={'value': content_data}
    )
    if flashcards_data is not None:
        ProjectMeta.objects.update_or_create(
            project=project, key='flashcards', defaults={'value': flashcards_data}
        )

    logger.info("Seeded artifacts for project=%s (syllabus/tests/content%s)", project.id, 
                "+flashcards" if flashcards_data is not None else "")
    return {
        'syllabus': syllabus_data,
        'tests': tests_data,
        'content': content_data,
        'flashcards': flashcards_data,
    }