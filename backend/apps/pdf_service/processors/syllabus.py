import json
import re
from .base import BaseProcessor
from ..models import SyllabusDetails
from backend.apps.generation.services.api_client import AIClient
from pydantic import ValidationError

class SyllabusProcessorService(BaseProcessor):
    """
    Processes syllabus documents to extract structured data.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.prompt_template = (
            "Act like an intelligent academic document parser with expert-level information-extraction skills.\n\n"
            "Objective\n"
            "Transform a raw university course syllabus into a precise, machine-readable schema by filling in every field shown below with concise wording taken directly from the syllabus.\n\n"
            "Instructions — follow these five steps exactly\n\n"
            "1. **Ingest** the syllabus inside the triple quotes below. Do not output anything yet.\n"
            '2. **Locate** the smallest span of text that answers each target field. If the syllabus omits a field, record it internally as "Not specified".\n'
            "3. **Clean & normalise** each answer:\n"
            '   • Trim whitespace and remove label prefixes (e.g., "Course title:").\n'
            '   • Standardise dates/times to ISO-8601 where feasible (e.g., "Fall 2025" → "2025-FA"; "Mon & Wed 14:30-15:45" → "Mon,Wed 14:30-15:45").\n'
            '   • For exams, tests, and projects, always include the date when available (e.g., "Midterm Exam - March 15, 2024", "Final Project - May 1, 2024").\n'
            '   • For important dates, pair each date with what it refers to (e.g., "March 15 - Midterm Exam", "April 30 - Final Project Due").\n'
            '4. **Verify** that every field below has either a valid value or the exact phrase "Not specified". Do not invent content.\n'
            "5. **Output** the results in the *exact* key–value format shown next, one line per field, with no extra commentary, blank lines, or headings.\n\n"
            "<course_title>: ...\n"
            "<course_code>: ...\n"
            "<instructor>: ...\n"
            "<contact_info>: ...\n"
            "<semester>: ...\n"
            "<meeting_times>: ...\n"
            "<location>: ...\n"
            "<course_description>: ...\n"
            "<learning_outcomes>: ...\n"
            "<topics>: ...\n"
            "<required_materials>: ...\n"
            "<forms_of_evaluation>: ...\n"
            "<exams>: ...\n"
            "<tests>: ...\n"
            "<projects>: ...\n"
            "<important_dates>: ...\n"
            "<policies>: ...\n"
            "<office_hours>: ...\n"
            "<other relevant information>: ...\n\n"
            "Here is the syllabus:\n"
            '"""\n'
            "{text}\n"
            '"""\n\n'
            "Take a deep breath and work on this problem step-by-step."
        )

    def process(self, text: str) -> SyllabusDetails:
        """
        Extracts syllabus details from text using an AI model.
        """
        prompt = self.prompt_template.format(text=text)
        
        messages = [self.client.format_message("user", prompt)]

        try:
            response = self.client.get_response(messages)
            
            data = {}
            # Use a regex to find all key-value pairs, correctly handling multi-line values
            pattern = re.compile(r"<([^>]+)>:\s*(.*?)(?=\n<|$)", re.DOTALL)
            matches = pattern.findall(response)

            list_fields = [
                "learning_outcomes", "topics", "required_materials", 
                "forms_of_evaluation", "exams", "tests", "projects", "important_dates"
            ]

            for key, value in matches:
                key = key.replace(' ', '_')
                value = value.strip()

                if value.lower() == "not specified":
                    if key in list_fields:
                        data[key] = []
                    else:
                        data[key] = None
                else:
                    if key in list_fields:
                        data[key] = [item.strip() for item in value.split('\n') if item.strip()]
                    else:
                        data[key] = value
            
            return SyllabusDetails(**data)
        except (ValidationError, AttributeError) as e:
            print(f"Failed to process syllabus: {e}")
            return SyllabusDetails() # Return empty model on failure 