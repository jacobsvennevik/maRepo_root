# pdf_service/models.py

"""
Defines the Pydantic schemas for structured data extracted from documents.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class SyllabusDetails(BaseModel):
    course_title: Optional[str] = Field(None, description="The name of the course.")
    course_code: Optional[str] = Field(None, description="The course code, e.g., 'CS101'.")
    instructor: Optional[str] = Field(None, description="The name of the instructor.")
    contact_info: Optional[str] = Field(None, description="Instructor's contact information.")
    semester: Optional[str] = Field(None, description="The semester the course is offered.")
    meeting_times: Optional[str] = Field(None, description="The meeting times for the course.")
    location: Optional[str] = Field(None, description="The location where the course is held.")
    course_description: Optional[str] = Field(None, description="A description of the course.")
    learning_outcomes: List[str] = Field([], description="List of learning outcomes.")
    topics: List[str] = Field([], description="List of topics covered in the course.")
    required_materials: List[str] = Field([], description="List of required materials.")
    forms_of_evaluation: List[str] = Field([], description="Forms of evaluation.")
    important_dates: List[str] = Field([], description="List of important dates.")
    policies: Optional[str] = Field(None, description="Course policies.")
    office_hours: Optional[str] = Field(None, description="Instructor's office hours.")
    other_relevant_information: Optional[str] = Field(None, description="Any other relevant information.")

class Choice(BaseModel):
    letter: str
    text: str

class Question(BaseModel):
    type: str
    question_text: str
    choices: Optional[List[Choice]] = None
    correct_answer: Optional[str] = None
    expected_answer: Optional[str] = None
    guidelines: Optional[str] = None
    points: Optional[float] = None

class ExamDetails(BaseModel):
    instructions: Optional[str] = Field(None, description="Instructions for the exam.")
    time_limit: Optional[str] = Field(None, description="The time limit for the exam.")
    total_points: Optional[int] = Field(None, description="The total points for the exam.")
    question_count: Optional[int] = Field(None, description="The number of questions in the exam.")
    questions: List[Question] = Field([], description="A list of questions on the exam.")
    other_relevant_information: Optional[str] = Field(None, description="Any other relevant information.")

class NoteDetails(BaseModel):
    title: Optional[str] = Field(None, description="The title of the notes.")
    summary: Optional[str] = Field(None, description="A brief summary of the notes.")
    keywords: List[str] = Field([], description="Keywords or tags related to the notes.")


class PDFChunk(BaseModel):
    id: str
    page_number: int
    content: str 