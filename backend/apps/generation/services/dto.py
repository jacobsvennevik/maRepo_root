from typing import List, Optional, Dict, Any
from pydantic import BaseModel, conint


class SyllabusModule(BaseModel):
    name: str
    duration_hours: conint(ge=0, le=100) = 0
    objectives: List[str] = []
    topics: List[str] = []
    prerequisites: List[str] = []
    assessment: Optional[Dict[str, Any]] = None


class SyllabusOut(BaseModel):
    title: str
    modules: List[SyllabusModule]
    total_hours: conint(ge=0)
    bloom_levels: List[str] = []
    schema_version: Optional[str] = None
    source_mode: Optional[str] = None
    provider: Optional[str] = None


class TestItemMcq(BaseModel):
    type: str = "mcq"
    question: str
    options: List[str]
    answer_index: conint(ge=0)
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    tags: List[str] = []


class TestItemWritten(BaseModel):
    type: str = "written"
    prompt: str
    rubric: List[str] = []
    difficulty: Optional[str] = None
    tags: List[str] = []


class TestsOut(BaseModel):
    items: List[Dict[str, Any]]
    schema_version: Optional[str] = None
    source_mode: Optional[str] = None
    provider: Optional[str] = None


class Entity(BaseModel):
    text: str
    type: str


class Concept(BaseModel):
    name: str
    description: str


class Section(BaseModel):
    title: str
    start: conint(ge=0)
    end: conint(ge=0)
    key_points: List[str] = []


class ContentOut(BaseModel):
    summary: str
    keywords: List[str]
    entities: List[Entity]
    concepts: List[Concept]
    sections: List[Section]
    schema_version: Optional[str] = None
    source_mode: Optional[str] = None
    provider: Optional[str] = None


class Flashcard(BaseModel):
    question: str
    answer: str
    tags: List[str] = []


class FlashcardsOut(BaseModel):
    cards: List[Flashcard]
    schema_version: Optional[str] = None
    source_mode: Optional[str] = None
    provider: Optional[str] = None


