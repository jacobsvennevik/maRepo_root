"""
Diagnostic Generator Service

This service generates pre-lecture diagnostic questions using AI,
reusing patterns from the existing flashcard generation system.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from django.conf import settings
from django.utils import timezone
from ..models import DiagnosticSession, DiagnosticQuestion
from .api_client import AIClient, Task

logger = logging.getLogger(__name__)


class DiagnosticGenerator:
    """
    Generates diagnostic questions using AI based on project content.
    """
    
    def __init__(self, ai_client=None):
        """Initialize with AI client or create default one."""
        self.ai_client = ai_client or AIClient(model='gemini-1.5-flash')
    
    def generate_quiz(
        self,
        project_id: str,
        topic: str,
        quiz_type: str = 'formative',
        source_ids: Optional[List[str]] = None,
        difficulty: str = 'medium',
        max_questions: int = 5,
        mock_mode: bool = False
    ) -> DiagnosticSession:
        """
        Generate a quiz session with different quiz types (formative, summative, diagnostic, mastery).
        
        Args:
            project_id: UUID of the project
            topic: Topic for the quiz
            quiz_type: Type of quiz (formative, summative, diagnostic, mastery)
            source_ids: List of document IDs to use as source material
            difficulty: Difficulty level (easy, medium, hard)
            max_questions: Maximum number of questions
            mock_mode: Whether to use mock AI responses
            
        Returns:
            DiagnosticSession with generated quiz questions
        """
        try:
            # Build prompt for AI generation based on quiz type
            prompt = self._build_quiz_prompt(topic, quiz_type, source_ids, difficulty, max_questions)
            
            # Generate questions using AI client with test mode support
            payload = {
                "prompt": prompt,
                "topic": topic,
                "quiz_type": quiz_type,
                "difficulty": difficulty,
                "max_questions": max_questions,
                "source_ids": source_ids or []
            }
            
            raw_response = self.ai_client.call(
                task=Task.QUIZ,
                payload=payload,
                mock_mode=mock_mode
            )
            
            # Parse and validate AI response
            data = json.loads(raw_response)
            validated_data = self._validate_and_normalize_quiz(data, max_questions, quiz_type)
            
            # Create diagnostic session
            session = self._create_diagnostic_session(
                project_id=project_id,
                topic=f"{topic} - {quiz_type.title()} Quiz",
                delivery_mode='IMMEDIATE_FEEDBACK' if quiz_type == 'formative' else 'DEFERRED_FEEDBACK',
                max_questions=max_questions,
                validated_data=validated_data
            )
            
            # Create questions
            self._create_questions(session, validated_data['questions'])
            
            logger.info(f"Generated {quiz_type} quiz session {session.id} with {max_questions} questions")
            return session
            
        except Exception as e:
            logger.error(f"Failed to generate {quiz_type} quiz: {str(e)}")
            raise
    
    def generate_diagnostic(
        self,
        project_id: str,
        topic: str,
        source_ids: Optional[List[str]] = None,
        question_mix: Optional[Dict[str, int]] = None,
        difficulty: int = 2,
        delivery_mode: str = 'DEFERRED_FEEDBACK',
        max_questions: int = 3,
        mock_mode: bool = False
    ) -> DiagnosticSession:
        try:
            # Default question mix if not specified
            if question_mix is None:
                question_mix = {"MCQ": 1, "SHORT_ANSWER": 1, "PRINCIPLE": 1}
            
            # Validate question mix
            total_questions = sum(question_mix.values())
            if total_questions != max_questions:
                raise ValueError(f"Question mix must sum to {max_questions}, got {total_questions}")
            
            # Build prompt for AI generation
            prompt = self._build_prompt(topic, source_ids, question_mix, difficulty)
            
            # Generate questions using AI client with test mode support
            payload = {
                "prompt": prompt,
                "topic": topic,
                "difficulty": difficulty,
                "max_questions": max_questions,
                "question_mix": question_mix
            }
            
            raw_response = self.ai_client.call(
                task=Task.QUIZ,
                payload=payload,
                mock_mode=mock_mode
            )
            
            # Parse and validate AI response
            data = json.loads(raw_response)
            validated_data = self._validate_and_normalize(data, max_questions)
            
            # Create diagnostic session
            session = self._create_diagnostic_session(
                project_id=project_id,
                topic=topic,
                delivery_mode=delivery_mode,
                max_questions=max_questions,
                validated_data=validated_data
            )
            
            # Create questions
            self._create_questions(session, validated_data['questions'])
            
            logger.info(f"Generated diagnostic session {session.id} with {max_questions} questions")
            return session
            
        except Exception as e:
            logger.error(f"Failed to generate diagnostic: {str(e)}")
            raise
    
    def _build_prompt(self, topic: str, source_ids: List[str], question_mix: Dict[str, int], difficulty: int) -> str:
        """Build the AI prompt for generating diagnostic questions."""
        
        # Get source content if available
        source_content = ""
        if source_ids:
            # TODO: Extract content from documents using PDF service
            source_content = f"Source documents: {', '.join(source_ids)}"
        
        prompt = f"""
SYSTEM: You are an assessment designer specializing in pre-lecture diagnostics. 
Produce EXACT JSON only - no additional text or explanations.

INPUT:
- Topic: {topic}
- Question mix: {json.dumps(question_mix)}
- Difficulty: {difficulty} (1=intro, 5=advanced)
- Source content: {source_content}

OUTPUT JSON SCHEMA:
{{
  "session": {{
    "topic": "string",
    "tags": ["string"],
    "difficulty": {difficulty}
  }},
  "questions": [
    {{
      "type": "MCQ|SHORT_ANSWER|PRINCIPLE",
      "text": "string (max 220 chars)",
      "choices": ["A", "B", "C", "D"],
      "correct_choice_index": 0,
      "acceptable_answers": ["regex or literal"],
      "explanation": "string",
      "concept_id": "string",
      "bloom_level": "Remember|Understand|Apply|Analyze|Evaluate|Create"
    }}
  ]
}}

RULES:
- MCQ must have exactly 4 choices, exactly one correct (index 0-3)
- Short answers use 1-5 concise acceptable patterns
- Avoid copyrighted text, use your own wording
- Prefer conceptual discrimination (e.g., entropy vs enthalpy)
- Keep question stems ≤ 220 characters
- Ensure exactly {sum(question_mix.values())} questions total
- Match question mix exactly: {json.dumps(question_mix)}
- Difficulty {difficulty}: {self._get_difficulty_description(difficulty)}
"""
        return prompt
    
    def _get_difficulty_description(self, difficulty: int) -> str:
        """Get human-readable difficulty description."""
        descriptions = {
            1: "Basic recall and understanding",
            2: "Simple application and comprehension", 
            3: "Moderate analysis and application",
            4: "Complex analysis and evaluation",
            5: "Advanced synthesis and creation"
        }
        return descriptions.get(difficulty, "Standard difficulty")
    
    def _get_json_schema(self) -> Dict[str, Any]:
        """Get the JSON schema for AI response validation."""
        return {
            "type": "object",
            "properties": {
                "session": {
                    "type": "object",
                    "properties": {
                        "topic": {"type": "string"},
                        "tags": {"type": "array", "items": {"type": "string"}},
                        "difficulty": {"type": "integer", "minimum": 1, "maximum": 5}
                    },
                    "required": ["topic", "tags", "difficulty"]
                },
                "questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {"type": "string", "enum": ["MCQ", "SHORT_ANSWER", "PRINCIPLE"]},
                            "text": {"type": "string", "maxLength": 220},
                            "choices": {"type": "array", "items": {"type": "string"}},
                            "correct_choice_index": {"type": "integer", "minimum": 0, "maximum": 3},
                            "acceptable_answers": {"type": "array", "items": {"type": "string"}},
                            "explanation": {"type": "string"},
                            "concept_id": {"type": "string"},
                            "bloom_level": {"type": "string", "enum": ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]}
                        },
                        "required": ["type", "text", "explanation", "concept_id", "bloom_level"]
                    }
                }
            },
            "required": ["session", "questions"]
        }
    
    def _validate_and_normalize(self, data: Dict[str, Any], max_questions: int) -> Dict[str, Any]:
        """Validate and normalize AI-generated data."""
        
        # Validate session data
        if 'session' not in data:
            raise ValueError("Missing session data in AI response")
        
        session_data = data['session']
        if 'topic' not in session_data:
            raise ValueError("Missing topic in session data")
        
        # Validate questions
        if 'questions' not in data:
            raise ValueError("Missing questions in AI response")
        
        questions = data['questions']
        if not isinstance(questions, list):
            raise ValueError("Questions must be a list")
        
        if len(questions) != max_questions:
            raise ValueError(f"Expected {max_questions} questions, got {len(questions)}")
        
        # Validate each question
        for i, question in enumerate(questions):
            self._validate_question(question, i)
        
        return data
    
    def _validate_question(self, question: Dict[str, Any], index: int):
        """Validate a single question."""
        required_fields = ['type', 'text', 'explanation', 'concept_id', 'bloom_level']
        for field in required_fields:
            if field not in question:
                raise ValueError(f"Question {index} missing required field: {field}")
        
        # Validate question type
        if question['type'] not in ['MCQ', 'SHORT_ANSWER', 'PRINCIPLE']:
            raise ValueError(f"Question {index} has invalid type: {question['type']}")
        
        # Validate MCQ-specific fields
        if question['type'] == 'MCQ':
            if 'choices' not in question or 'correct_choice_index' not in question:
                raise ValueError(f"MCQ question {index} missing choices or correct_choice_index")
            
            choices = question['choices']
            if not isinstance(choices, list) or len(choices) != 4:
                raise ValueError(f"MCQ question {index} must have exactly 4 choices")
            
            correct_index = question['correct_choice_index']
            if not isinstance(correct_index, int) or correct_index < 0 or correct_index > 3:
                raise ValueError(f"MCQ question {index} correct_choice_index must be 0-3")
        
        # Validate text length
        if len(question['text']) > 220:
            raise ValueError(f"Question {index} text too long: {len(question['text'])} chars")
        
        # Validate bloom level
        valid_bloom_levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
        if question['bloom_level'] not in valid_bloom_levels:
            raise ValueError(f"Question {index} has invalid bloom level: {question['bloom_level']}")
    
    def _create_diagnostic_session(
        self,
        project_id: str,
        topic: str,
        delivery_mode: str,
        max_questions: int,
        validated_data: Dict[str, Any]
    ) -> DiagnosticSession:
        """Create the diagnostic session."""
        
        from backend.apps.projects.models import Project
        
        project = Project.objects.get(id=project_id)
        
        session = DiagnosticSession.objects.create(
            project=project,
            topic=topic,
            delivery_mode=delivery_mode,
            max_questions=max_questions,
            status='DRAFT',
            created_by=project.owner,
            seed=hash(topic) % 10000  # Simple seed for question ordering
        )
        
        return session
    
    def _create_questions(self, session: DiagnosticSession, questions_data: List[Dict[str, Any]]):
        """Create diagnostic questions from AI-generated data."""
        
        for question_data in questions_data:
            # Prepare choices for MCQ
            choices = None
            correct_choice_index = None
            
            if question_data['type'] == 'MCQ':
                choices = question_data['choices']
                correct_choice_index = question_data['correct_choice_index']
            
            # Create the question
            DiagnosticQuestion.objects.create(
                session=session,
                type=question_data['type'],
                text=question_data['text'],
                choices=choices,
                correct_choice_index=correct_choice_index,
                acceptable_answers=question_data.get('acceptable_answers', []),
                explanation=question_data['explanation'],
                difficulty=question_data.get('difficulty', 2),
                bloom_level=question_data['bloom_level'],
                concept_id=question_data['concept_id'],
                tags=question_data.get('tags', [])
            )
    
    def generate_from_project_content(
        self,
        project_id: str,
        topic: str = None,
        difficulty: int = 2,
        mock_mode: bool = False
    ) -> DiagnosticSession:
        """
        Generate diagnostic from project content (simplified interface).
        
        Args:
            project_id: UUID of the project
            topic: Optional topic override
            difficulty: Difficulty level 1-5
            mock_mode: Whether to use mock AI responses
            
        Returns:
            DiagnosticSession with generated questions
        """
        
        # Get project to determine topic if not provided
        from backend.apps.projects.models import Project
        project = Project.objects.get(id=project_id)
        
        if not topic:
            topic = project.get_course_name() or project.name
        
        # Use balanced question mix
        question_mix = {"MCQ": 1, "SHORT_ANSWER": 1, "PRINCIPLE": 1}
        
        return self.generate_diagnostic(
            project_id=project_id,
            topic=topic,
            question_mix=question_mix,
            difficulty=difficulty,
            mock_mode=mock_mode
        )
    
    def _build_quiz_prompt(self, topic: str, quiz_type: str, source_ids: List[str], difficulty: str, max_questions: int) -> str:
        """Build the AI prompt for generating quiz questions based on quiz type."""
        
        # Get source content if available
        source_content = ""
        if source_ids:
            source_content = f"Source documents: {', '.join(source_ids)}"
        
        # Quiz type specific instructions
        quiz_instructions = {
            'formative': {
                'goal': 'produce formative quiz items that optimize retrieval practice and metacognitive calibration',
                'feedback': 'Provide 2 hints (conceptual, then procedural) and a ≤40-word rationale. Include ask_confidence:true on each item.',
                'types': 'Use only item types from allowed_item_types registry. mcq_single: exactly one correct. mcq_multi: 2–3 correct.'
            },
            'summative': {
                'goal': 'create exam items with measurement-first approach',
                'feedback': 'No hints. Rationale: one sentence. Include intended_p_value (easy≈0.85, medium≈0.60, hard≈0.35) and discrimination_intent:"high".',
                'types': 'Single best answer unless mcq_multi explicitly allowed. Prefer two_tier and data_interpretation for higher-order when allowed.'
            },
            'diagnostic': {
                'goal': 'create a diagnostic quiz to map prior knowledge',
                'feedback': 'No hints. Rationale ≤ 25 words. Tag items diagnostic:true and enumerate subskills. ask_confidence:true on each item.',
                'types': 'Maximize coverage: 1–2 items per objective before allocating extras. Mostly medium difficulty with a few hard anchors.'
            },
            'mastery': {
                'goal': 'generate a short mastery quiz on a narrow objective set',
                'feedback': 'Provide 1 hint and a ≤40-word rationale. Generate 2–3 variants per concept for successive relearning. Include self_explanation_prompt (≤30 words).',
                'types': 'For each objective: include one near-transfer and one far-transfer item. Difficulty skew: medium→hard.'
            }
        }
        
        instructions = quiz_instructions.get(quiz_type, quiz_instructions['formative'])
        
        prompt = f"""
SYSTEM: You are an expert assessment writer.
Goal: {instructions['goal']}

Return ONLY valid JSON per schema. No prose.
Use ONLY provided source_ids; omit any item you cannot ground. Paraphrase (no >12-token overlap).
Reading level ≤ CEFR-B2. Language: en.

Rules:
- Respect coverage and difficulty_mix exactly.
- Use only item types from allowed_item_types (registry included).
- {instructions['types']}
- {instructions['feedback']}
- If an image is referenced, include alt_text.
- Enforce fairness and accessibility; avoid stereotypes and culture-bound trivia.
- Follow the Type-Specific Schema Addendum for each item type.

USER (BLUEPRINT):
{{
  "test_id": "{topic.lower().replace(' ', '-')}-{quiz_type}-001",
  "title": "{topic} — {quiz_type.title()} Quiz",
  "audience": {{"grade": 13, "language": "en", "reading_level": "CEFR-B2"}},
  "objectives": [{{"id":"OBJ-1","text":"Master key concepts in {topic}","bloom":"Understand"}}],
  "coverage": {{"OBJ-1": {max_questions}}},
  "difficulty_mix": {{"easy": 0.2, "medium": 0.6, "hard": 0.2}},
  "allowed_item_types": ["mcq_single", "short_answer", "explain_why", "numeric_response", "two_tier", "data_interpretation"],
  "feedback_policy": {{"rationale": true, "hints": 2}},
  "paraphrase_threshold": 0.2,
  "sources": [{{"id":"doc:source","excerpt":"{source_content}"}}],
  "time_limit_minutes": 20
}}

OUTPUT JSON SCHEMA:
{{
  "items": [
    {{
      "objective_id":"OBJ-1",
      "type":"mcq_single|short_answer|explain_why|numeric_response|two_tier|data_interpretation",
      "difficulty":"easy|medium|hard",
      "transfer":"near|far|unspecified",
      "stem":"string",
      "choices":[{{"id":"A","text":"...","correct":false}}, {{"id":"B","text":"...","correct":true}}],
      "answer":"string|regex|object (per type)",
      "type_specific": {{ ... per addendum ... }},
      "rationale":"<=40 words",
      "hints":["conceptual","procedural"],
      "tags":["concept:x","bloom:Apply"],
      "source_ids":["doc:source"],
      "ask_confidence": true,
      "reading_level_grade": 13,
      "alt_text":"optional"
    }}
  ]
}}
"""
        return prompt

    def _validate_and_normalize_quiz(self, data: Dict[str, Any], max_questions: int, quiz_type: str) -> Dict[str, Any]:
        """Validate and normalize quiz data from AI response."""
        try:
            # Ensure we have items
            items = data.get('items', [])
            if not items:
                raise ValueError("No quiz items found in AI response")
            
            # Limit to max_questions
            items = items[:max_questions]
            
            # Normalize each item
            normalized_items = []
            for i, item in enumerate(items):
                normalized_item = {
                    'type': item.get('type', 'short_answer'),
                    'text': item.get('stem', ''),
                    'choices': item.get('choices', []),
                    'correct_choice_index': item.get('correct_choice_index', 0),
                    'acceptable_answers': [item.get('answer', '')],
                    'explanation': item.get('rationale', ''),
                    'concept_id': f"concept_{i+1}",
                    'bloom_level': item.get('bloom', 'Understand'),
                    'difficulty': item.get('difficulty', 'medium'),
                    'tags': item.get('tags', []),
                    'source_ids': item.get('source_ids', []),
                    'ask_confidence': item.get('ask_confidence', quiz_type == 'formative'),
                    'hints': item.get('hints', []),
                    'type_specific': item.get('type_specific', {}),
                    'transfer': item.get('transfer', 'near'),
                    'structure_fidelity': item.get('structure_fidelity', 'exact')
                }
                normalized_items.append(normalized_item)
            
            return {
                'session': {
                    'topic': f"Quiz - {quiz_type.title()}",
                    'tags': [quiz_type, 'quiz'],
                    'difficulty': 'medium'
                },
                'questions': normalized_items
            }
            
        except Exception as e:
            logger.error(f"Failed to validate quiz data: {str(e)}")
            # Return minimal valid structure
            return {
                'session': {
                    'topic': f"Quiz - {quiz_type.title()}",
                    'tags': [quiz_type, 'quiz'],
                    'difficulty': 'medium'
                },
                'questions': []
            }
