import json
import re
from typing import List, Dict, Any
from .base import BaseAIClient

class MockAIClient(BaseAIClient):
    """
    Mock AI client that returns predefined responses based on input patterns.
    This allows testing the full backend pipeline without making real API calls.
    """
    
    def __init__(self, model: str = "mock-model"):
        self.model = model
        self.response_patterns = self._load_response_patterns()
    
    def format_message(self, role, content):
        """Formats messages for API requests (same as real client)."""
        return {"role": role, "content": content}

    def get_response(self, messages):
        """
        Returns mock responses based on the input content.
        Analyzes the prompt to determine what type of response to return.
        """
        if not messages:
            return ""
        
        # Get the last user message
        user_message = messages[-1]['content'] if isinstance(messages[-1], dict) else str(messages[-1])
        
        # Determine response type based on content analysis
        response_type = self._classify_request(user_message)
        
        # Get appropriate mock response
        mock_response = self._get_mock_response(response_type, user_message)
        
        print(f"🤖 MOCK AI: Returning {response_type} response for input: {user_message[:100]}...")
        
        return mock_response
    
    def _classify_request(self, content: str) -> str:
        """Classify the type of request based on content patterns."""
        content_lower = content.lower()
        
        # Syllabus extraction patterns
        if any(keyword in content_lower for keyword in [
            "syllabus", "course", "instructor", "semester", "learning outcomes"
        ]):
            return "syllabus_extraction"
        
        # Document classification patterns
        if any(keyword in content_lower for keyword in [
            "classify", "type", "category", "document type"
        ]):
            return "document_classification"
        
        # Test/exam extraction patterns
        if any(keyword in content_lower for keyword in [
            "exam", "test", "quiz", "question", "assessment"
        ]):
            return "exam_extraction"
        
        # Study content extraction patterns
        if any(keyword in content_lower for keyword in [
            "study", "content", "material", "topic", "concept"
        ]):
            return "study_content_extraction"
        
        # Default to syllabus extraction
        return "syllabus_extraction"
    
    def _get_mock_response(self, response_type: str, input_content: str) -> str:
        """Get appropriate mock response based on type and input."""
        
        if response_type == "document_classification":
            return self._get_classification_response(input_content)
        elif response_type == "syllabus_extraction":
            return self._get_syllabus_extraction_response(input_content)
        elif response_type == "exam_extraction":
            return self._get_exam_extraction_response(input_content)
        elif response_type == "study_content_extraction":
            return self._get_study_content_extraction_response(input_content)
        else:
            return self._get_syllabus_extraction_response(input_content)
    
    def _get_classification_response(self, content: str) -> str:
        """Return document classification response."""
        # Simple keyword-based classification
        content_lower = content.lower()
        
        if any(word in content_lower for word in ["syllabus", "course", "instructor"]):
            return "SYLLABUS"
        elif any(word in content_lower for word in ["exam", "test", "quiz", "question"]):
            return "EXAM"
        elif any(word in content_lower for word in ["study", "material", "content", "topic"]):
            return "STUDY_CONTENT"
        elif any(word in content_lower for word in ["note", "summary", "review"]):
            return "NOTE"
        else:
            return "UNKNOWN"
    
    def _get_syllabus_extraction_response(self, content: str) -> str:
        """Return structured syllabus extraction response."""
        return """<course_title>: Natural Language Interaction
<course_code>: CS-501
<instructor>: Dr. Antonio Branco
<contact_info>: antonio.branco@university.edu
<semester>: Spring 2025
<meeting_times>: Mon,Wed 14:30-15:45
<location>: Room 301, Computer Science Building
<course_description>: Advanced course covering natural language processing, deep learning, and cognitive AI applications.
<learning_outcomes>: 
- Master vector representations and compositionality principles
- Implement and analyze CNN architectures for text processing
- Design and deploy transformer-based language models
- Apply modern NLP techniques to real-world problems
<topics>: 
- Knowledge representation based on inference
- Syntactic analysis and parsing
- Semantic representation and logical form
- Language models
- Vector representation of knowledge and distributional semantics
- Word embeddings
- Neural networks, deep learning and Transformers
- Artificial Intelligence, Cognition and open challenges
<required_materials>: 
- Course slides and lecture notes
- Programming assignments in Python/PyTorch
- Research papers on recent NLP advances
<forms_of_evaluation>: 
- Written exams
- Programming projects
- Research paper analysis
<exams>: 
- Midterm Exam - March 27, 2025
- Final Exam - June 15, 2025
<tests>: 
- Short exercise A - February 27, 2025
- Short exercise B - March 13, 2025
- Short exercise C - April 10, 2025
- Short exercise D - May 15, 2025
<projects>: 
- Final Project - May 30, 2025
<important_dates>: 
- February 27 - Short exercise A
- March 13 - Short exercise B
- March 27 - Midterm Exam
- April 10 - Short exercise C
- May 15 - Short exercise D
- May 30 - Final Project Due
- June 15 - Final Exam
<policies>: Academic integrity policy applies. Late submissions accepted with penalty.
<office_hours>: Tue,Thu 10:00-11:30 or by appointment
<other relevant information>: Prerequisites: CS-201, Linear Algebra, Python programming"""
    
    def _get_exam_extraction_response(self, content: str) -> str:
        """Return structured exam extraction response."""
        return """{
  "test_title": "Natural Language Processing Final Exam",
  "course_title": "Natural Language Interaction",
  "course_type": "STEM",
  "assessment_method": "written exam",
  "exam_date": "2025-06-15",
  "overall_points": "100",
  "assessment_types": {
    "has_final_exam": true,
    "has_regular_quizzes": false,
    "has_essays": true,
    "has_projects": false,
    "has_lab_work": false,
    "has_group_work": false,
    "primary_assessment_method": "Final exam"
  },
  "question_summary": {
    "total_questions": 25,
    "question_type_breakdown": {
      "multiple_choice": 10,
      "true_false": 5,
      "matching": 0,
      "short_answer": 8,
      "essay": 2,
      "calculation": 0,
      "diagram": 0,
      "other": 0
    },
    "difficulty_breakdown": {
      "easy": 8,
      "medium": 12,
      "hard": 5
    },
    "cognitive_focus": {
      "memorization": 5,
      "understanding": 10,
      "application": 6,
      "analysis": 3,
      "evaluation": 1,
      "creation": 0
    }
  },
  "key_topics": [
    "Vector embeddings",
    "Transformer architecture",
    "Attention mechanisms",
    "Language modeling",
    "Text classification"
  ],
  "topic_alignment": {
    "topics_covered_from_course": [
      "Vector representation of knowledge",
      "Neural networks and Transformers",
      "Language models"
    ],
    "new_topics_in_test": [],
    "coverage_percentage": 85
  }
}"""
    
    def _get_study_content_extraction_response(self, content: str) -> str:
        """Return structured study content extraction response."""
        return """{
  "course_type": "STEM",
  "assessment_types": {
    "has_final_exam": true,
    "has_regular_quizzes": true,
    "has_essays": false,
    "has_projects": true,
    "has_lab_work": false,
    "has_group_work": false,
    "primary_assessment_method": "Tests and Projects"
  },
  "overview": "Comprehensive study materials covering vector representations, CNNs, RNNs, attention mechanisms, transformers, and modern language modeling approaches.",
  "topics": [
    {
      "topic_name": "Vector Representations & Compositionality",
      "summary": "Shows how word-level vectors combine to yield sentence meanings while respecting compositionality principles.",
      "learning_objectives": [
        "Explain the purpose of word embeddings",
        "Compare Bag-of-Words with compositional methods",
        "Demonstrate k-gram based aggregation",
        "Evaluate strengths and limits of simple pooling"
      ],
      "concepts": [
        {
          "name": "Word embedding",
          "definition": "Meaning of the word represented by a vector that condenses information about distribution and co-occurrence.",
          "examples": ["v = [v11 … v1m] (word vector)", "Closer vectors ⇒ higher similarity"],
          "related_concepts": ["Bag-of-Words", "Sentence vector", "Attention"],
          "importance": "Embeddings allow neural networks to operate on textual data by turning discrete words into continuous, comparable representations.",
          "assessment": {
            "recall_q": "What does a word embedding represent?",
            "application_q": "Given two word vectors with high cosine similarity, what can you infer about the words' semantic relationship?",
            "difficulty": "easy"
          }
        }
      ]
    }
  ]
}"""
    
    def _load_response_patterns(self) -> Dict[str, Any]:
        """Load predefined response patterns."""
        return {
            "syllabus": {
                "keywords": ["syllabus", "course", "instructor"],
                "response": self._get_syllabus_extraction_response
            },
            "exam": {
                "keywords": ["exam", "test", "quiz"],
                "response": self._get_exam_extraction_response
            },
            "study_content": {
                "keywords": ["study", "material", "content"],
                "response": self._get_study_content_extraction_response
            }
        } 