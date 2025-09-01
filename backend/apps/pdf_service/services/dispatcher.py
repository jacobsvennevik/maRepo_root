from ..django_models import Document, ProcessedData
from ..constants import DocumentType
from backend.apps.generation.services.api_client import AIClient
from .classification_service import DocumentClassifierService
from ..processors.base import BaseProcessor
from ..processors.syllabus import SyllabusProcessorService
from ..processors.exam import ExamProcessorService
from ..processors.note import NoteProcessorService
from ..processors.study_content import StudyContentProcessor
from ..processors.unknown import UnknownProcessorService
import os
from django.http import HttpRequest


class DocumentDispatcher:
    """
    Dispatches documents to the correct processor based on classification.
    """

    def __init__(self, document: Document, model_name: str = "gemini-1.5-flash", request: HttpRequest = None):
        self.document = document
        
        # Check if we're in test mode (environment variable or request header)
        is_test_mode = (
            os.environ.get('TEST_MODE', 'false').lower() == 'true' or
            (request and request.headers.get('X-Test-Mode') == 'true')
        )
        
        # Instantiate a single AIClient; it will route mock vs real internally based on env/header
        client = AIClient(model=model_name, request=request)
        if is_test_mode:
            print("🧪 TEST MODE: AIClient will serve mock outputs")
        else:
            print("🚀 PRODUCTION MODE: AIClient will call real provider")

        self.classifier = DocumentClassifierService(client=client)
        self.processors = {
            DocumentType.SYLLABUS: SyllabusProcessorService(client=client),
            DocumentType.EXAM: ExamProcessorService(client=client),
            DocumentType.NOTE: NoteProcessorService(client=client),
            DocumentType.STUDY_CONTENT: StudyContentProcessor(client=client),
            DocumentType.UNKNOWN: UnknownProcessorService(client=client),
        }

    def dispatch(self):
        """
        Classifies the document, routes it to the correct processor,
        and saves the processed data.
        """
        if not self.document.original_text:
            # In a real application, you might want to extract text here if not already done.
            print(f"Document {self.document.id} has no text to process.")
            return

        # 1. Classify the document
        doc_type = self.classifier.classify(self.document.original_text)
        self.document.document_type = doc_type.value
        self.document.save(update_fields=['document_type'])

        # 2. Get the appropriate processor
        processor: BaseProcessor = self.processors.get(doc_type, self.processors[DocumentType.UNKNOWN])

        # 3. Process the text
        processed_data_pydantic = processor.process(self.document.original_text)

        # 4. Save the processed data
        if processed_data_pydantic:
            processed_data_dict = processed_data_pydantic.model_dump()
            
            ProcessedData.objects.update_or_create(
                document=self.document,
                defaults={'data': processed_data_dict}
            )

        print(f"Dispatched document {self.document.id} as {doc_type.name}") 