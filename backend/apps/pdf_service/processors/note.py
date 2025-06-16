# backend/apps/pdf_service/processors/note.py
import json
from .base import BaseProcessor
from ..models import NoteDetails
from backend.apps.generation.services.api_client import AIClient
from pydantic import ValidationError

class NoteProcessorService(BaseProcessor):
    """
    Processes note documents to extract structured data.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.prompt_template = """
        Based on the following note text, extract the structured information.
        Return the information as a JSON object matching the following Pydantic model:
        {schema}

        Note Text:
        ---
        {text}
        ---

        Return ONLY the JSON object.
        """

    def process(self, text: str) -> NoteDetails:
        """
        Extracts note details from text using an AI model.
        """
        schema = NoteDetails.model_json_schema()
        prompt = self.prompt_template.format(schema=json.dumps(schema, indent=2), text=text)
        
        messages = [self.client.format_message("user", prompt)]

        try:
            response = self.client.get_response(messages)
            json_response = json.loads(response[response.find('{'):response.rfind('}')+1])
            return NoteDetails(**json_response)
        except (json.JSONDecodeError, ValidationError, AttributeError) as e:
            print(f"Failed to process note: {e}")
            return NoteDetails() 