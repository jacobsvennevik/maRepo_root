import json
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator, ValidationError
from .base import BaseProcessor

# Set up logging
logger = logging.getLogger(__name__)

class ProcessingError(Exception):
    """Custom exception for study content processing errors"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class Assessment(BaseModel):
    """Represents assessment questions for a concept"""
    recall_q: str = Field(..., description="Flashcard-style recall question")
    application_q: str = Field(..., description="Application-based question")
    difficulty: str = Field(..., description="Difficulty level: easy, medium, or hard")

    @validator('difficulty')
    def validate_difficulty(cls, v):
        allowed = ['easy', 'medium', 'hard']
        v = v.lower()
        if v not in allowed:
            raise ValueError(f'Difficulty must be one of {allowed}')
        return v

    @validator('recall_q', 'application_q')
    def validate_questions(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Question is too short')
        if not v.endswith('?'):
            raise ValueError('Question must end with a question mark')
        return v.strip()

class Concept(BaseModel):
    """Represents a key concept with its explanation and relationships"""
    name: str = Field(..., description="The name or title of the concept")
    definition: str = Field(..., description="Clear, concise definition of the concept")
    examples: List[str] = Field(default_factory=list, description="Practical examples of the concept")
    related_concepts: List[str] = Field(default_factory=list, description="Names of related concepts")
    importance: str = Field(..., description="Brief explanation of why this concept is important")
    assessment: Assessment = Field(..., description="Assessment questions for this concept")

    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Concept name is too short')
        return v.strip()

    @validator('definition')
    def validate_definition(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Definition is too short')
        return v.strip()

    @validator('examples')
    def validate_examples(cls, v):
        if not v:  # Empty list
            return v
        cleaned = [ex.strip() for ex in v if ex.strip()]
        if not cleaned:
            raise ValueError('Examples cannot be empty strings')
        return cleaned

    @validator('importance')
    def validate_importance(cls, v):
        if len(v.strip()) < 10 or len(v.strip()) > 250:
            raise ValueError('Importance statement must be between 10 and 250 characters')
        return v.strip()

class Topic(BaseModel):
    """Represents a main topic with its concepts and objectives"""
    topic_name: str = Field(..., description="Name of the topic")
    summary: str = Field(..., description="Brief summary of the topic")
    learning_objectives: List[str] = Field(default_factory=list, description="Learning objectives for this topic")
    concepts: List[Concept] = Field(default_factory=list, description="Key concepts within this topic")

    @validator('topic_name')
    def validate_topic_name(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Topic name is too short')
        return v.strip()

    @validator('summary')
    def validate_summary(cls, v):
        if len(v.strip()) < 20 or len(v.strip()) > 400:
            raise ValueError('Summary must be between 20 and 400 characters')
        return v.strip()

    @validator('learning_objectives')
    def validate_objectives(cls, v):
        if not v:
            raise ValueError('At least one learning objective is required')
        cleaned = [obj.strip() for obj in v if obj.strip()]
        if not cleaned:
            raise ValueError('Learning objectives cannot be empty strings')
        return cleaned

class StudyContent(BaseModel):
    """Root schema for processed study content"""
    overview: str = Field(..., description="Global overview of all topics")
    topics: List[Topic] = Field(default_factory=list, description="List of topics covered")

    @validator('overview')
    def validate_overview(cls, v):
        if len(v.strip()) < 50 or len(v.strip()) > 1200:
            raise ValueError('Overview must be between 50 and 1200 characters')
        return v.strip()

    @validator('topics')
    def validate_topics(cls, v):
        if not v:
            raise ValueError('At least one topic is required')
        return v

class StudyContentProcessor(BaseProcessor):
    """Processes educational content for study material generation"""
    
    def __init__(self, client=None):
        super().__init__(client)
        try:
            with open('backend/apps/pdf_service/prompts/study_content_extractor.txt', 'r') as f:
                self.prompt_template = f.read()
        except FileNotFoundError as e:
            logger.error(f"Failed to load prompt template: {e}")
            raise ProcessingError("Failed to initialize processor: prompt template not found")
        except Exception as e:
            logger.error(f"Unexpected error loading prompt template: {e}")
            raise ProcessingError("Failed to initialize processor", {"error": str(e)})

    def process(self, text: str) -> dict:
        """
        Process the document text into structured study content
        
        Args:
            text: The raw document text to process
            
        Returns:
            dict: Structured study content following the StudyContent schema
            
        Raises:
            ProcessingError: If processing fails at any stage
        """
        if not text or not text.strip():
            raise ProcessingError("Empty or invalid input text")

        try:
            # Format the prompt with the actual text
            formatted_prompt = self.prompt_template.format(text=text)
        except Exception as e:
            logger.error(f"Failed to format prompt: {e}")
            raise ProcessingError("Failed to prepare content for processing", {"error": str(e)})

        try:
            # Get response from AI
            response = self.get_completion(formatted_prompt)
            if not response or not response.strip():
                raise ProcessingError("Received empty response from AI model")
        except Exception as e:
            logger.error(f"AI completion failed: {e}")
            raise ProcessingError("Failed to generate content analysis", {"error": str(e)})

        try:
            # Parse the JSON response
            content = json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            raise ProcessingError("Failed to parse AI response", {
                "error": str(e),
                "response_excerpt": response[:200] + "..." if len(response) > 200 else response
            })

        try:
            # Validate against our schema
            study_content = StudyContent.parse_obj(content)
            
            # Additional validation
            self._validate_content_relationships(study_content)
            
            return study_content.dict()
            
        except ValidationError as e:
            logger.error(f"Schema validation failed: {e}")
            raise ProcessingError("Content validation failed", {
                "validation_errors": e.errors(),
                "content_excerpt": str(content)[:200] + "..." if len(str(content)) > 200 else str(content)
            })

    def _validate_content_relationships(self, content: StudyContent) -> None:
        """
        Validates relationships between different parts of the content
        
        Args:
            content: The StudyContent object to validate
            
        Raises:
            ProcessingError: If validation fails
        """
        try:
            # Check for duplicate topic names
            topic_names = [topic.topic_name for topic in content.topics]
            if len(topic_names) != len(set(topic_names)):
                raise ProcessingError("Duplicate topic names found")

            # Validate concept relationships
            all_concepts = set()
            for topic in content.topics:
                for concept in topic.concepts:
                    all_concepts.add(concept.name)

            # Check that related concepts actually exist
            for topic in content.topics:
                for concept in topic.concepts:
                    for related in concept.related_concepts:
                        if related not in all_concepts:
                            raise ProcessingError(
                                f"Invalid concept relationship", 
                                {"concept": concept.name, "invalid_related": related}
                            )

        except Exception as e:
            logger.error(f"Content relationship validation failed: {e}")
            raise ProcessingError("Failed to validate content relationships", {"error": str(e)})

    def get_completion(self, prompt: str) -> str:
        """
        Get completion from AI model
        
        Args:
            prompt: The formatted prompt to send to the AI
            
        Returns:
            str: The AI's response
            
        Raises:
            ProcessingError: If AI completion fails
        """
        try:
            if not self.client:
                raise ProcessingError("AI client not initialized")
            
            # Get completion with higher temperature for more creative assessment questions
            response = self.client.complete(
                prompt,
                temperature=0.7,  # Slightly higher temperature for assessment generation
                max_tokens=2000,  # Ensure enough tokens for complete response
            )
            
            if not response or not response.strip():
                raise ProcessingError("AI model returned empty response")
                
            return response
            
        except Exception as e:
            logger.error(f"AI completion failed: {e}")
            raise ProcessingError("Failed to get AI completion", {"error": str(e)}) 