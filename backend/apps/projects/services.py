from backend.apps.projects.models import UploadedFile, Extraction, ProjectMeta
from backend.apps.generation.services.api_client import AIClient, Task
from django.conf import settings
from backend.apps.pdf_service.ingestion import ingest_pdf
import logging

logger = logging.getLogger(__name__)

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

def process_uploaded_file(uploaded_file_id: str):
    """
    Orchestrates the file processing pipeline.
    1. Fetches the UploadedFile instance.
    2. Extracts text from the PDF.
    3. Calls the LLM to get structured data.
    4. Saves the extraction results.
    5. Updates the associated Project.
    """
    try:
        uploaded_file = UploadedFile.objects.get(id=uploaded_file_id)
    except UploadedFile.DoesNotExist:
        logger.error(f"UploadedFile with id {uploaded_file_id} not found.")
        return

    # 1. Extract text from PDF
    try:
        logger.info(f"Starting text extraction for file: {uploaded_file.file.name}")
        chunks = ingest_pdf(uploaded_file.file.path)
        raw_text = " ".join([chunk.page_content for chunk in chunks])
        uploaded_file.raw_text = raw_text
        uploaded_file.save(update_fields=['raw_text'])
        logger.info(f"Text extraction successful for file: {uploaded_file.file.name}")
    except Exception as e:
        logger.error(f"Error extracting text from {uploaded_file.file.name}: {e}")
        return

    # 2. Call LLM for data extraction
    if not raw_text:
        logger.warning(f"Raw text is empty for {uploaded_file.file.name}. Skipping LLM extraction.")
        return

    llm_result = call_llm_extractor(raw_text)

    # 3. Create Extraction record
    extraction = Extraction.objects.create(
        uploaded_file=uploaded_file,
        prompt=llm_result['prompt'],
        response=llm_result['response'],
        tokens_used=llm_result['metrics']['tokens_used'],
        latency_ms=llm_result['metrics']['latency_ms'],
        confidence_score=llm_result['metrics']['confidence_score'],
        is_valid_schema=True,  # Placeholder for schema validation
    )
    logger.info(f"Extraction record created: {extraction.id}")

    # 4. Update Project with extracted data
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

    return extraction 


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