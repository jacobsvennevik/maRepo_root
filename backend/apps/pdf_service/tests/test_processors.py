# backend/apps/pdf_service/tests/test_processors.py
import pytest
import json
from backend.apps.pdf_service.processors.syllabus import SyllabusProcessorService
from backend.apps.pdf_service.processors.exam import ExamProcessorService
from backend.apps.pdf_service.processors.note import NoteProcessorService
from backend.apps.pdf_service.models import SyllabusDetails, ExamDetails, NoteDetails
from .test_classification_service import MockAIClient

# Test Syllabus Processor
def test_syllabus_processor_success():
    # Arrange
    mock_response = """
<course_title>: Intro to AI
<course_code>: CS101
<instructor>: Dr. Smith
<important_dates>: Midterm: Oct 20
Final: Dec 15
<learning_outcomes>: Not specified
<other relevant information>: Welcome to the course!
"""
    mock_client = MockAIClient(response_text=mock_response)
    processor = SyllabusProcessorService(client=mock_client)

    # Act
    result = processor.process("some syllabus text")

    # Assert
    assert isinstance(result, SyllabusDetails)
    assert result.course_title == "Intro to AI"
    assert result.course_code == "CS101"
    assert result.instructor == "Dr. Smith"
    assert result.important_dates == ["Midterm: Oct 20", "Final: Dec 15"]
    assert result.learning_outcomes == []
    assert result.other_relevant_information == "Welcome to the course!"
    assert result.location is None

def test_syllabus_processor_failure():
    # Arrange
    mock_client = MockAIClient(response_text="completely garbled output")
    processor = SyllabusProcessorService(client=mock_client)

    # Act
    result = processor.process("some syllabus text")

    # Assert
    assert isinstance(result, SyllabusDetails)
    assert result.course_title is None # Should return empty model on failure

# Test Exam Processor
def test_exam_processor_success():
    # Arrange
    mock_response = """
<instructions>: Answer all questions.
<time_limit>: 90 minutes
<total_points>: 100
<question_count>: 2
<questions>:
[
  {
    "type": "multiple_choice",
    "question_text": "What is the capital of France?",
    "choices": [
      {"letter": "A", "text": "Berlin"},
      {"letter": "B", "text": "Paris"}
    ],
    "correct_answer": "B",
    "points": 5
  },
  {
    "type": "short_answer",
    "question_text": "What is 2 + 2?",
    "expected_answer": "4",
    "points": 5
  }
]
<other relevant information>: Not specified
"""
    mock_client = MockAIClient(response_text=mock_response)
    processor = ExamProcessorService(client=mock_client)

    # Act
    result = processor.process("some exam text")

    # Assert
    assert isinstance(result, ExamDetails)
    assert result.instructions == "Answer all questions."
    assert result.total_points == 100
    assert len(result.questions) == 2
    assert result.questions[0].type == "multiple_choice"
    assert result.questions[0].points == 5
    assert result.questions[0].choices[1].text == "Paris"
    assert result.questions[1].type == "short_answer"
    assert result.questions[1].expected_answer == "4"

# Test Note Processor
def test_note_processor_success():
    # Arrange
    mock_response_data = {"title": "My Notes", "summary": "A summary"}
    mock_client = MockAIClient(response_text=json.dumps(mock_response_data))
    processor = NoteProcessorService(client=mock_client)

    # Act
    result = processor.process("some note text")

    # Assert
    assert isinstance(result, NoteDetails)
    assert result.title == "My Notes" 