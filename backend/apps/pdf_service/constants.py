from enum import Enum

class DocumentType(str, Enum):
    SYLLABUS = "syllabus"
    EXAM = "exam"
    NOTE = "note"
    UNKNOWN = "unknown" 