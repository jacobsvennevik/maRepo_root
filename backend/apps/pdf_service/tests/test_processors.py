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

@pytest.mark.parametrize("date_format,expected_dates", [
    # ISO format
    ("2025-10-03", ["Midterm Exam: 2025-10-03"]),
    # US format
    ("03/10/2025", ["Midterm Exam: 03/10/2025"]),
    # Written format
    ("March 3rd 2026", ["Final Exam: March 3rd 2026"]),
    # Date range
    ("10-12 Oct 2025", ["Conference: 10-12 Oct 2025"]),
    # TBD format
    ("TBD", ["Assignment Due: TBD"]),
    # Multiple dates
    ("2025-10-03\n03/10/2025\nMarch 3rd 2026", [
        "Midterm: 2025-10-03", 
        "Assignment: 03/10/2025", 
        "Final: March 3rd 2026"
    ]),
])
def test_syllabus_processor_various_date_formats(date_format, expected_dates):
    """Test that the syllabus processor handles various date formats correctly."""
    # Arrange
    date_entries = "\n".join(expected_dates)
    mock_response = f"""
<course_title>: Test Course
<course_code>: TEST101
<instructor>: Dr. Test
<important_dates>: {date_entries}
<learning_outcomes>: Not specified
<other relevant information>: Not specified
"""
    mock_client = MockAIClient(response_text=mock_response)
    processor = SyllabusProcessorService(client=mock_client)

    # Act
    result = processor.process("some syllabus text")

    # Assert
    assert isinstance(result, SyllabusDetails)
    assert result.course_title == "Test Course"
    assert result.important_dates == expected_dates

def test_syllabus_processor_empty_dates():
    """Test that the syllabus processor handles empty important dates."""
    # Arrange
    mock_response = """
<course_title>: Test Course
<course_code>: TEST101
<instructor>: Dr. Test
<important_dates>: Not specified
<learning_outcomes>: Not specified
<other relevant information>: Not specified
"""
    mock_client = MockAIClient(response_text=mock_response)
    processor = SyllabusProcessorService(client=mock_client)

    # Act
    result = processor.process("some syllabus text")

    # Assert
    assert isinstance(result, SyllabusDetails)
    assert result.important_dates == []  # Should be empty list for "Not specified"

def test_syllabus_processor_with_all_fields():
    """Test that the syllabus processor handles all fields correctly."""
    # Arrange
    mock_response = """
<course_title>: Advanced Machine Learning
<course_code>: CS545
<instructor>: Dr. Jane Smith
<contact_info>: jsmith@university.edu, Office 123
<semester>: Fall 2025
<meeting_times>: Mon,Wed,Fri 10:00-11:00
<location>: Room 456, Science Building
<course_description>: An advanced course in machine learning techniques
<learning_outcomes>: Understand ML algorithms
Apply ML to real problems
Evaluate ML models
<topics>: Neural Networks
Deep Learning
Reinforcement Learning
<required_materials>: Textbook: Pattern Recognition by Bishop
Python programming environment
<forms_of_evaluation>: Midterm Exam (30%)
Final Project (40%)
Assignments (30%)
<important_dates>: Midterm: 2025-10-15
Project Proposal: 2025-11-01
Final Project: 2025-12-10
<policies>: Late assignments penalized 10% per day
<office_hours>: Tuesdays 2:00-4:00 PM
<other relevant information>: Prerequisites: CS 101, Math 201
"""
    mock_client = MockAIClient(response_text=mock_response)
    processor = SyllabusProcessorService(client=mock_client)

    # Act
    result = processor.process("detailed syllabus text")

    # Assert
    assert isinstance(result, SyllabusDetails)
    assert result.course_title == "Advanced Machine Learning"
    assert result.course_code == "CS545"
    assert result.instructor == "Dr. Jane Smith"
    assert result.contact_info == "jsmith@university.edu, Office 123"
    assert result.semester == "Fall 2025"
    assert result.meeting_times == "Mon,Wed,Fri 10:00-11:00"
    assert result.location == "Room 456, Science Building"
    assert result.course_description == "An advanced course in machine learning techniques"
    assert len(result.learning_outcomes) == 3
    assert "Understand ML algorithms" in result.learning_outcomes
    assert len(result.topics) == 3
    assert "Neural Networks" in result.topics
    assert len(result.required_materials) == 2
    assert len(result.forms_of_evaluation) == 3
    assert len(result.important_dates) == 3
    assert "Midterm: 2025-10-15" in result.important_dates
    assert result.policies == "Late assignments penalized 10% per day"
    assert result.office_hours == "Tuesdays 2:00-4:00 PM"
    assert result.other_relevant_information == "Prerequisites: CS 101, Math 201"

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

def test_exam_processor_error_handling():
    """Test that the exam processor handles malformed JSON gracefully."""
    # Arrange - truly malformed JSON that can't be auto-fixed
    mock_response = """
<instructions>: Answer all questions.
<time_limit>: 90 minutes
<total_points>: 100
<question_count>: 1
<questions>:
[
  {
    "type": "multiple_choice",
    "question_text": "What is the capital of France?",
    "choices": [
      {"letter": "A", "text": "Berlin"}
      {"letter": "B", "text": "Paris"}
    ],
    "correct_answer": "B",
    "points": 5
  }
]
<other relevant information>: Not specified
"""
    mock_client = MockAIClient(response_text=mock_response)
    processor = ExamProcessorService(client=mock_client)

    # Act
    result = processor.process("some exam text")

    # Assert - should return empty model on JSON parsing failure
    assert isinstance(result, ExamDetails)
    assert result.instructions is None
    assert result.questions == []

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

def test_note_processor_error_handling():
    """Test that the note processor handles malformed JSON gracefully."""
    # Arrange - invalid JSON
    mock_client = MockAIClient(response_text="invalid json content")
    processor = NoteProcessorService(client=mock_client)

    # Act
    result = processor.process("some note text")

    # Assert - should return empty model on JSON parsing failure
    assert isinstance(result, NoteDetails)
    assert result.title is None
    assert result.summary is None 