from enum import Enum

class DocumentType(str, Enum):
    SYLLABUS = "syllabus"
    EXAM = "exam"
    NOTE = "note"
    STUDY_CONTENT = "study_content"
    UNKNOWN = "unknown" 