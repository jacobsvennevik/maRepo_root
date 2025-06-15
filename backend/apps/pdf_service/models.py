# pdf_service/models.py

"""
Defines the Pydantic schemas for structured data extracted from documents.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class Syllabus(BaseModel):
    course_name: Optional[str] = Field(None, description="The name of the course.")
    course_code: Optional[str] = Field(None, description="The course code, e.g., 'CS101'.")
    teacher_name: Optional[str] = Field(None, description="The name of the instructor.")
    # Add other fields as necessary based on your syllabus structure

class Exam(BaseModel):
    date: str
    description: str

class PDFChunk(BaseModel):
    id: str
    page_number: int
    content: str 