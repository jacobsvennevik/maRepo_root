# backend/apps/pdf_service/processors/exam.py
import json
import re
from .base import BaseProcessor
from ..models import ExamDetails, Question
from backend.apps.generation.services.api_client import AIClient
from pydantic import ValidationError

class ExamProcessorService(BaseProcessor):
    """
    Processes exam documents to extract structured data.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # @formatter:off
        self.prompt_template = """Act like an intelligent exam parser with expert-level information-extraction skills.

Objective
Transform a raw academic test or exam (PDF text dump or plain text) into a precise, machine-readable schema that captures every question, its structure, and all scoring data.

Instructions — follow these six steps exactly

1. **Ingest** the exam inside the triple quotes below. Do not output anything yet.
2. **Locate** the minimal span of text that answers each target field (including sub-fields inside every question). If the exam omits a field, record it internally as "Not specified".
3. **Classify** each question's type by recognising common patterns:
   • Multiple-choice (MCQ) — several labeled choices (A, B, …) with one or more correct letters.
   • True/False — treat as MCQ with two choices.
   • Short-answer / fill-in-blank — brief expected answer.
   • Essay / long-form — open-ended response with guidelines or rubric.
   • Numeric / calculation — answer is a number or formula.
4. **Clean & normalise** all extracted values:
   • Remove numbering prefixes such as "Q1." or "(a)".
   • Preserve original wording; fix obvious line-break artefacts only.
   • Represent points as integers; if fractional, keep the decimal.
   • Keep choice letters in alphabetical order exactly as they appear.
5. **Verify** that every high-level field and every question sub-field below contains a value or the phrase "Not specified". Do **not** invent content or commentary.
6. **Output** the results in the *exact* key–value / JSON hybrid format shown next, with no extra headings, blank lines, or markdown.

<instructions>: ...
<time_limit>: ...
<total_points>: ...
<question_count>: ...
<questions>:
[
  {{
    "type": "multiple_choice",
    "question_text": "...",
    "choices": [
      {{"letter": "A", "text": "..."}},
      {{"letter": "B", "text": "..."}},
      {{"letter": "C", "text": "..."}},
      {{"letter": "D", "text": "..."}}
    ],
    "correct_answer": "...",
    "points": ...
  }}
]
<other relevant information>: ...

Now process this test:
\"\"\"
{text}
\"\"\"

Take a deep breath and work on this problem step-by-step."""
        # @formatter:on

    def process(self, text: str) -> ExamDetails:
        """
        Extracts exam details from text using an AI model.
        """
        prompt = self.prompt_template.format(text=text)
        
        messages = [self.client.format_message("user", prompt)]

        try:
            response = self.client.get_response(messages)
            
            data = {}
            # Extract the simple key-value pairs first
            simple_kv_pattern = re.compile(r"<([^>]+)>:\s*(?!\[)(.*)", re.MULTILINE)
            for key, value in simple_kv_pattern.findall(response):
                if "<questions>" not in key:
                    key = key.replace(' ', '_')
                    value = value.strip()
                    if value.lower() != "not specified":
                        # Attempt to cast numeric fields
                        if key in ["total_points", "question_count"]:
                            try:
                                data[key] = int(value)
                            except (ValueError, TypeError):
                                data[key] = None
                        else:
                            data[key] = value

            # Extract the JSON part for questions
            json_pattern = re.compile(r"<questions>:\s*(\[.*\])", re.DOTALL)
            json_match = json_pattern.search(response)
            if json_match:
                json_str = json_match.group(1).strip()
                # Handle potential trailing commas in JSON from LLM
                json_str = re.sub(r',\s*([\}\]])', r'\1', json_str)
                questions_data = json.loads(json_str)
                data['questions'] = [Question(**q) for q in questions_data]

            return ExamDetails(**data)
        except (json.JSONDecodeError, ValidationError, AttributeError) as e:
            print(f"Failed to process exam: {e}")
            return ExamDetails() 