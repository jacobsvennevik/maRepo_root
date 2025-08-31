"""
Flashcard Generator Service

Generates flashcards from various content sources including:
- Uploaded documents
- Extracted test questions
- Manual notes
- Project materials
"""

import json
from typing import List, Dict, Any
from django.conf import settings
from .api_client import AIClient
from ..models import Flashcard, FlashcardSet


class FlashcardGenerator:
    """
    Service for generating flashcards from content using AI.
    """
    
    def __init__(self):
        self.api_client = AIClient("gpt-4")
    
    def generate_from_content(self, content: str, num_cards: int = 10, 
                            difficulty: str = 'medium') -> List[Dict[str, str]]:
        """
        Generate flashcards from text content.
        
        Args:
            content: Source text content
            num_cards: Number of flashcards to generate
            difficulty: 'easy', 'medium', or 'hard'
            
        Returns:
            List of flashcard dictionaries with 'question' and 'answer' keys
        """
        prompt = self._build_generation_prompt(content, num_cards, difficulty)
        
        try:
            messages = [self.api_client.format_message("user", prompt)]
            response = self.api_client.get_response(messages)
            flashcards_data = self._parse_flashcard_response(response)
            return flashcards_data[:num_cards]
        except Exception as e:
            # Fallback to simple generation if AI fails
            return self._generate_fallback_cards(content, num_cards)
    
    def generate_from_document(self, document_id: int, num_cards: int = 10) -> List[Dict[str, str]]:
        """
        Generate flashcards from a specific document.
        
        Args:
            document_id: ID of the document to process
            num_cards: Number of flashcards to generate
            
        Returns:
            List of flashcard dictionaries
        """
        from backend.apps.pdf_service.django_models import Document
        
        document = Document.objects.get(id=document_id)
        content = document.extracted_text or document.raw_text
        
        if not content:
            raise ValueError("Document has no extractable content")
        
        return self.generate_from_content(content, num_cards)
    
    def generate_from_extractions(self, extraction_ids: List[int], num_cards: int = 10) -> List[Dict[str, str]]:
        """
        Generate flashcards from extracted content.
        
        Args:
            extraction_ids: List of extraction IDs
            num_cards: Number of flashcards to generate
            
        Returns:
            List of flashcard dictionaries
        """
        from backend.apps.projects.models import Extraction
        
        extractions = Extraction.objects.filter(id__in=extraction_ids)
        content = '\n'.join([str(e.response) for e in extractions])
        
        return self.generate_from_content(content, num_cards)
    
    def _build_generation_prompt(self, content: str, num_cards: int, difficulty: str) -> str:
        """Build the prompt for flashcard generation."""
        difficulty_instructions = {
            'easy': 'Focus on basic definitions and simple concepts.',
            'medium': 'Include application questions and moderate complexity.',
            'hard': 'Include synthesis, analysis, and complex problem-solving questions.'
        }
        
        return f"""
        Generate {num_cards} high-quality flashcards from the following content.
        
        Content:
        {content[:4000]}  # Limit content length for API
        
        Instructions:
        - {difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}
        - Questions should be clear and specific
        - Answers should be concise but complete
        - Mix different question types (definition, application, analysis)
        - Ensure questions test understanding, not just memorization
        
        Format your response as a JSON array:
        [
            {{"question": "What is...?", "answer": "It is..."}},
            {{"question": "How does...?", "answer": "It works by..."}}
        ]
        
        Generate exactly {num_cards} flashcards.
        """
    
    def _parse_flashcard_response(self, response: str) -> List[Dict[str, str]]:
        """Parse the AI response into flashcard data."""
        try:
            # Try to extract JSON from response
            if '[' in response and ']' in response:
                start = response.find('[')
                end = response.rfind(']') + 1
                json_str = response[start:end]
                data = json.loads(json_str)
                
                if isinstance(data, list):
                    return [
                        {
                            'question': item.get('question', ''),
                            'answer': item.get('answer', '')
                        }
                        for item in data
                        if item.get('question') and item.get('answer')
                    ]
        except (json.JSONDecodeError, KeyError):
            pass
        
        # Fallback parsing for non-JSON responses
        return self._parse_text_response(response)
    
    def _parse_text_response(self, response: str) -> List[Dict[str, str]]:
        """Parse text response into flashcard format."""
        flashcards = []
        lines = response.split('\n')
        
        current_question = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if line.startswith('Q:') or line.startswith('Question:'):
                if current_question:
                    flashcards.append({
                        'question': current_question,
                        'answer': 'No answer provided'
                    })
                current_question = line.split(':', 1)[1].strip()
            elif line.startswith('A:') or line.startswith('Answer:') and current_question:
                answer = line.split(':', 1)[1].strip()
                flashcards.append({
                    'question': current_question,
                    'answer': answer
                })
                current_question = None
        
        # Add any remaining question
        if current_question:
            flashcards.append({
                'question': current_question,
                'answer': 'No answer provided'
            })
        
        return flashcards
    
    def _generate_fallback_cards(self, content: str, num_cards: int) -> List[Dict[str, str]]:
        """Generate simple flashcards when AI generation fails."""
        # Simple fallback: create definition cards from key terms
        words = content.split()
        key_terms = [word for word in words if len(word) > 5 and word.isalpha()][:num_cards]
        
        flashcards = []
        for term in key_terms:
            flashcards.append({
                'question': f'What is {term}?',
                'answer': f'Definition of {term} (please review content for details)'
            })
        
        return flashcards


# Standalone functions for backward compatibility and testing
def parse_flashcards(content: str) -> List[tuple]:
    """
    Parse flashcards from AI response content.
    
    Args:
        content: Raw AI response content
        
    Returns:
        List of (question, answer) tuples
    """
    flashcards = []
    lines = content.split('\n')
    
    current_question = None
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('Front:') or line.startswith('Q:'):
            if current_question:
                flashcards.append((current_question, 'No answer provided'))
            current_question = line.split(':', 1)[1].strip()
        elif line.startswith('Back:') or line.startswith('A:') and current_question:
            answer = line.split(':', 1)[1].strip()
            flashcards.append((current_question, answer))
            current_question = None
    
    # Add any remaining question
    if current_question:
        flashcards.append((current_question, 'No answer provided'))
    
    return flashcards


def save_flashcards_to_db(flashcards: List[tuple], flashcard_set) -> None:
    """
    Save flashcards to the database.
    
    Args:
        flashcards: List of (question, answer) tuples
        flashcard_set: FlashcardSet instance
    """
    for question, answer in flashcards:
        Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question=question,
            answer=answer
        )


def generate_flashcards(content: str, model: str = "gpt-4") -> List[tuple]:
    """
    Generate flashcards from content using AI.
    
    Args:
        content: Source content
        model: AI model to use
        
    Returns:
        List of (question, answer) tuples
    """
    generator = FlashcardGenerator()
    generator.api_client = AIClient(model)
    
    try:
        messages = [generator.api_client.format_message("user", generator._build_generation_prompt(content, 10, 'medium'))]
        response = generator.api_client.get_response(messages)
        return parse_flashcards(response)
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return []


def generate_flashcards_from_document(document_id: int, model: str = "gpt-4") -> FlashcardSet:
    """
    Generate flashcards from a document and save them to the database.
    
    Args:
        document_id: ID of the document
        model: AI model to use
        
    Returns:
        FlashcardSet instance
    """
    from backend.apps.pdf_service.django_models import Document
    from backend.apps.generation.models import FlashcardSet, Flashcard
    
    document = Document.objects.get(id=document_id)
    content = document.extracted_text or document.raw_text
    
    if not content:
        raise ValueError("Document has no extractable content")
    
    # Create flashcard set
    flashcard_set = FlashcardSet.objects.create(
        title=f"Flashcards from {document.title}",
        owner=document.user,
        document=document
    )
    
    # Generate flashcards
    flashcards = generate_flashcards(content, model)
    
    # Save to database
    save_flashcards_to_db(flashcards, flashcard_set)
    
    return flashcard_set

