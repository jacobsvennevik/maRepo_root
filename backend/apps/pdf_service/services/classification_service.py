# backend/apps/pdf_service/services/classification_service.py

import json
from backend.apps.generation.services.base import BaseAIClient
from backend.apps.pdf_service.constants import DocumentType

class DocumentClassifierService:
    """
    Classifies document text into a specific `DocumentType`.
    """
    def __init__(self, client: BaseAIClient):
        self.client = client
        self.prompt_template = """
        Based on the following text, classify the document into one of the following categories:
        'syllabus', 'exam', 'note', or 'unknown'.
        Return only the category name as a single word in lowercase.

        Text:
        ---
        {text}
        ---
        """

    def classify(self, text: str) -> DocumentType:
        """
        Classifies the text and returns a DocumentType enum member.
        """
        prompt = self.prompt_template.format(text=text[:4000])  # Truncate for safety
        
        messages = [self.client.format_message("user", prompt)]
        
        try:
            response = self.client.get_response(messages)
            cleaned_response = response.strip().lower()
            
            # Simple validation to map response to enum
            return DocumentType(cleaned_response)
        
        except (ValueError, AttributeError) as e:
            # If response is not a valid DocumentType or other error
            print(f"Classification failed, defaulting to 'unknown'. Error: {e}")
            return DocumentType.UNKNOWN 