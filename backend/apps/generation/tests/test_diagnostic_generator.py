"""
Comprehensive tests for diagnostic generator service.
"""

import json
from unittest.mock import Mock, patch
from django.test import TestCase
from django.core.exceptions import ValidationError

from backend.apps.generation.tests.factories import (
    DiagnosticSessionFactory, DiagnosticQuestionFactory, 
    DiagnosticResponseFactory
)
from backend.apps.projects.tests.factories import ProjectFactory
from backend.apps.generation.services.diagnostic_generator import DiagnosticGenerator
from backend.apps.generation.services.mock_ai_client import MockAIClient


class DiagnosticGeneratorTest(TestCase):
    """Test DiagnosticGenerator service functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.project = ProjectFactory()
        self.generator = DiagnosticGenerator()
    
    def test_generator_initialization(self):
        """Test that generator can be initialized."""
        self.assertIsInstance(self.generator, DiagnosticGenerator)
        self.assertIsInstance(self.generator.ai_client, MockAIClient)
    
    def test_generator_with_custom_ai_client(self):
        """Test generator initialization with custom AI client."""
        mock_client = Mock()
        generator = DiagnosticGenerator(ai_client=mock_client)
        self.assertEqual(generator.ai_client, mock_client)
    
    def test_generate_diagnostic_basic(self):
        """Test basic diagnostic generation."""
        session = self.generator.generate_diagnostic(
            project_id=str(self.project.id),
            topic='Test Topic',
            max_questions=3
        )
        
        self.assertIsNotNone(session)
        self.assertEqual(session.topic, 'Test Topic')
        self.assertEqual(session.max_questions, 3)
        self.assertEqual(session.status, 'DRAFT')
        self.assertEqual(session.project, self.project)
    
    def test_generate_diagnostic_with_question_mix(self):
        """Test diagnostic generation with specific question mix."""
        question_mix = {"MCQ": 2, "SHORT_ANSWER": 1}
        
        session = self.generator.generate_diagnostic(
            project_id=str(self.project.id),
            topic='Test Topic',
            question_mix=question_mix,
            max_questions=3
        )
        
        self.assertEqual(session.questions.count(), 3)
        
        # Count question types
        mcq_count = session.questions.filter(type='MCQ').count()
        sa_count = session.questions.filter(type='SHORT_ANSWER').count()
        
        self.assertEqual(mcq_count, 2)
        self.assertEqual(sa_count, 1)
    
    def test_generate_diagnostic_with_difficulty(self):
        """Test diagnostic generation with difficulty setting."""
        session = self.generator.generate_diagnostic(
            project_id=str(self.project.id),
            topic='Test Topic',
            difficulty=4,
            max_questions=3
        )
        
        # Check that questions have appropriate difficulty
        for question in session.questions.all():
            self.assertLessEqual(question.difficulty, 4)
    
    def test_generate_diagnostic_with_delivery_mode(self):
        """Test diagnostic generation with delivery mode."""
        session = self.generator.generate_diagnostic(
            project_id=str(self.project.id),
            topic='Test Topic',
            delivery_mode='IMMEDIATE',
            max_questions=3
        )
        
        self.assertEqual(session.delivery_mode, 'IMMEDIATE')
    
    def test_generate_diagnostic_question_mix_validation(self):
        """Test that question mix validation works."""
        # Invalid mix: doesn't sum to max_questions
        question_mix = {"MCQ": 1, "SHORT_ANSWER": 1}  # Sum = 2, but max_questions = 3
        
        with self.assertRaises(ValueError):
            self.generator.generate_diagnostic(
                project_id=str(self.project.id),
                topic='Test Topic',
                question_mix=question_mix,
                max_questions=3
            )
    
    def test_generate_diagnostic_default_question_mix(self):
        """Test that default question mix is applied when none specified."""
        session = self.generator.generate_diagnostic(
            project_id=str(self.project.id),
            topic='Test Topic',
            max_questions=3
        )
        
        # Should use default mix: {"MCQ": 1, "SHORT_ANSWER": 1, "PRINCIPLE": 1}
        self.assertEqual(session.questions.count(), 3)
        
        mcq_count = session.questions.filter(type='MCQ').count()
        sa_count = session.questions.filter(type='SHORT_ANSWER').count()
        principle_count = session.questions.filter(type='PRINCIPLE').count()
        
        self.assertEqual(mcq_count, 1)
        self.assertEqual(sa_count, 1)
        self.assertEqual(principle_count, 1)
    
    def test_generate_diagnostic_from_project_content(self):
        """Test simplified project content generation."""
        session = self.generator.generate_from_project_content(
            project_id=str(self.project.id),
            topic='Custom Topic',
            difficulty=3
        )
        
        self.assertIsNotNone(session)
        self.assertEqual(session.topic, 'Custom Topic')
        self.assertEqual(session.max_questions, 3)
        self.assertEqual(session.project, self.project)
    
    def test_generate_diagnostic_from_project_content_no_topic(self):
        """Test project content generation without topic override."""
        session = self.generator.generate_from_project_content(
            project_id=str(self.project.id),
            difficulty=2
        )
        
        self.assertIsNotNone(session)
        # Should use project name or course name as topic
        self.assertIsNotNone(session.topic)
    
    def test_generate_diagnostic_with_source_ids(self):
        """Test diagnostic generation with source document IDs."""
        source_ids = ['doc1', 'doc2', 'doc3']
        
        session = self.generator.generate_diagnostic(
            project_id=str(self.project.id),
            topic='Test Topic',
            source_ids=source_ids,
            max_questions=3
        )
        
        self.assertIsNotNone(session)
        # Note: Source content extraction would be implemented in future
        # For now, this just tests that the method accepts source_ids parameter


class DiagnosticGeneratorPromptTest(TestCase):
    """Test prompt generation functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.project = ProjectFactory()
        self.generator = DiagnosticGenerator()
    
    def test_prompt_building_basic(self):
        """Test basic prompt building."""
        topic = 'Thermodynamics'
        source_ids = ['doc1']
        question_mix = {"MCQ": 1, "SHORT_ANSWER": 1, "PRINCIPLE": 1}
        difficulty = 3
        
        prompt = self.generator._build_prompt(topic, source_ids, question_mix, difficulty)
        
        # Should include all key elements
        self.assertIn('Thermodynamics', prompt)
        self.assertIn('{"MCQ":1,"SHORT_ANSWER":1,"PRINCIPLE":1}', prompt)
        self.assertIn('Difficulty: 3', prompt)
        self.assertIn('Source documents: doc1', prompt)
    
    def test_prompt_building_no_source_ids(self):
        """Test prompt building without source IDs."""
        topic = 'Mathematics'
        source_ids = None
        question_mix = {"MCQ": 2, "SHORT_ANSWER": 1}
        difficulty = 2
        
        prompt = self.generator._build_prompt(topic, source_ids, question_mix, difficulty)
        
        # Should handle None source_ids gracefully
        self.assertIn('Source content: ', prompt)
        self.assertNotIn('Source documents: None', prompt)
    
    def test_prompt_building_empty_source_ids(self):
        """Test prompt building with empty source IDs."""
        topic = 'Physics'
        source_ids = []
        question_mix = {"MCQ": 3}
        difficulty = 4
        
        prompt = self.generator._build_prompt(topic, source_ids, question_mix, difficulty)
        
        # Should handle empty list gracefully
        self.assertIn('Source content: ', prompt)
    
    def test_prompt_building_difficulty_descriptions(self):
        """Test that difficulty descriptions are included."""
        for difficulty in range(1, 6):
            prompt = self.generator._build_prompt(
                'Test Topic', [], {"MCQ": 3}, difficulty
            )
            
            # Should include difficulty description
            self.assertIn(f'Difficulty {difficulty}:', prompt)
    
    def test_prompt_building_question_mix_validation(self):
        """Test that prompt includes question mix validation."""
        question_mix = {"MCQ": 2, "SHORT_ANSWER": 1}
        
        prompt = self.generator._build_prompt(
            'Test Topic', [], question_mix, 2
        )
        
        # Should include mix validation
        self.assertIn('Match question mix exactly:', prompt)
        self.assertIn('{"MCQ":2,"SHORT_ANSWER":1}', prompt)


class DiagnosticGeneratorValidationTest(TestCase):
    """Test AI response validation functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.project = ProjectFactory()
        self.generator = DiagnosticGenerator()
    
    def test_validate_and_normalize_valid_data(self):
        """Test validation of valid AI response data."""
        valid_data = {
            'session': {
                'topic': 'Test Topic',
                'tags': ['tag1', 'tag2'],
                'difficulty': 3
            },
            'questions': [
                {
                    'type': 'MCQ',
                    'text': 'What is 2 + 2?',
                    'choices': ['A', 'B', 'C', 'D'],
                    'correct_choice_index': 1,
                    'acceptable_answers': [],
                    'explanation': '2 + 2 = 4',
                    'concept_id': 'basic_math',
                    'bloom_level': 'Remember'
                },
                {
                    'type': 'SHORT_ANSWER',
                    'text': 'What is the capital of France?',
                    'choices': None,
                    'correct_choice_index': None,
                    'acceptable_answers': ['Paris', 'paris'],
                    'explanation': 'Paris is the capital',
                    'concept_id': 'geography',
                    'bloom_level': 'Remember'
                },
                {
                    'type': 'PRINCIPLE',
                    'text': 'Explain gravity.',
                    'choices': None,
                    'correct_choice_index': None,
                    'acceptable_answers': ['gravity', 'force'],
                    'explanation': 'Gravity is a force',
                    'concept_id': 'physics',
                    'bloom_level': 'Understand'
                }
            ]
        }
        
        # Should not raise any exceptions
        normalized_data = self.generator._validate_and_normalize(valid_data, 3)
        self.assertEqual(normalized_data, valid_data)
    
    def test_validate_and_normalize_missing_session(self):
        """Test validation fails with missing session data."""
        invalid_data = {
            'questions': [
                {
                    'type': 'MCQ',
                    'text': 'Test question',
                    'choices': ['A', 'B', 'C', 'D'],
                    'correct_choice_index': 0,
                    'acceptable_answers': [],
                    'explanation': 'Test explanation',
                    'concept_id': 'test',
                    'bloom_level': 'Remember'
                }
            ]
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_and_normalize(invalid_data, 1)
    
    def test_validate_and_normalize_missing_topic(self):
        """Test validation fails with missing topic."""
        invalid_data = {
            'session': {
                'tags': ['tag1'],
                'difficulty': 2
            },
            'questions': []
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_and_normalize(invalid_data, 0)
    
    def test_validate_and_normalize_missing_questions(self):
        """Test validation fails with missing questions."""
        invalid_data = {
            'session': {
                'topic': 'Test Topic',
                'tags': ['tag1'],
                'difficulty': 2
            }
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_and_normalize(invalid_data, 3)
    
    def test_validate_and_normalize_wrong_question_count(self):
        """Test validation fails with wrong number of questions."""
        invalid_data = {
            'session': {
                'topic': 'Test Topic',
                'tags': ['tag1'],
                'difficulty': 2
            },
            'questions': [
                {
                    'type': 'MCQ',
                    'text': 'Test question',
                    'choices': ['A', 'B', 'C', 'D'],
                    'correct_choice_index': 0,
                    'acceptable_answers': [],
                    'explanation': 'Test explanation',
                    'concept_id': 'test',
                    'bloom_level': 'Remember'
                }
            ]
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_and_normalize(invalid_data, 3)  # Expected 3, got 1
    
    def test_validate_question_mcq_validation(self):
        """Test MCQ question validation."""
        valid_mcq = {
            'type': 'MCQ',
            'text': 'Test question',
            'choices': ['A', 'B', 'C', 'D'],
            'correct_choice_index': 2,
            'acceptable_answers': [],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'Remember'
        }
        
        # Should not raise any exceptions
        self.generator._validate_question(valid_mcq, 0)
    
    def test_validate_question_mcq_missing_choices(self):
        """Test MCQ validation fails without choices."""
        invalid_mcq = {
            'type': 'MCQ',
            'text': 'Test question',
            'acceptable_answers': [],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'Remember'
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_question(invalid_mcq, 0)
    
    def test_validate_question_mcq_missing_correct_index(self):
        """Test MCQ validation fails without correct choice index."""
        invalid_mcq = {
            'type': 'MCQ',
            'text': 'Test question',
            'choices': ['A', 'B', 'C', 'D'],
            'acceptable_answers': [],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'Remember'
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_question(invalid_mcq, 0)
    
    def test_validate_question_mcq_wrong_choice_count(self):
        """Test MCQ validation fails with wrong number of choices."""
        invalid_mcq = {
            'type': 'MCQ',
            'text': 'Test question',
            'choices': ['A', 'B', 'C'],  # Only 3 choices, need 4
            'correct_choice_index': 1,
            'acceptable_answers': [],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'Remember'
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_question(invalid_mcq, 0)
    
    def test_validate_question_mcq_invalid_correct_index(self):
        """Test MCQ validation fails with invalid correct choice index."""
        invalid_mcq = {
            'type': 'MCQ',
            'text': 'Test question',
            'choices': ['A', 'B', 'C', 'D'],
            'correct_choice_index': 5,  # Invalid: > 3
            'acceptable_answers': [],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'Remember'
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_question(invalid_mcq, 0)
    
    def test_validate_question_text_length(self):
        """Test question text length validation."""
        # Text too long
        long_text = 'A' * 250  # Over 220 character limit
        
        invalid_question = {
            'type': 'SHORT_ANSWER',
            'text': long_text,
            'acceptable_answers': ['answer'],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'Remember'
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_question(invalid_question, 0)
    
    def test_validate_question_bloom_level(self):
        """Test bloom level validation."""
        invalid_question = {
            'type': 'SHORT_ANSWER',
            'text': 'Test question',
            'acceptable_answers': ['answer'],
            'explanation': 'Test explanation',
            'concept_id': 'test',
            'bloom_level': 'INVALID_LEVEL'  # Invalid bloom level
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_question(invalid_question, 0)


class DiagnosticGeneratorCreationTest(TestCase):
    """Test diagnostic session and question creation."""
    
    def setUp(self):
        """Set up test data."""
        self.project = ProjectFactory()
        self.generator = DiagnosticGenerator()
    
    def test_create_diagnostic_session(self):
        """Test diagnostic session creation."""
        session = self.generator._create_diagnostic_session(
            project_id=str(self.project.id),
            topic='Test Topic',
            delivery_mode='DEFERRED_FEEDBACK',
            max_questions=3,
            validated_data={'session': {'topic': 'Test Topic'}}
        )
        
        self.assertIsNotNone(session)
        self.assertEqual(session.topic, 'Test Topic')
        self.assertEqual(session.project, self.project)
        self.assertEqual(session.delivery_mode, 'DEFERRED_FEEDBACK')
        self.assertEqual(session.max_questions, 3)
        self.assertEqual(session.status, 'DRAFT')
        self.assertEqual(session.created_by, self.project.owner)
        self.assertIsNotNone(session.seed)
    
    def test_create_questions(self):
        """Test question creation from validated data."""
        session = DiagnosticSessionFactory(project=self.project)
        
        questions_data = [
            {
                'type': 'MCQ',
                'text': 'What is 2 + 2?',
                'choices': ['A', 'B', 'C', 'D'],
                'correct_choice_index': 1,
                'acceptable_answers': [],
                'explanation': '2 + 2 = 4',
                'concept_id': 'basic_math',
                'bloom_level': 'Remember',
                'difficulty': 2,
                'tags': ['math', 'basic']
            },
            {
                'type': 'SHORT_ANSWER',
                'text': 'What is the capital of France?',
                'choices': None,
                'correct_choice_index': None,
                'acceptable_answers': ['Paris', 'paris'],
                'explanation': 'Paris is the capital',
                'concept_id': 'geography',
                'bloom_level': 'Remember',
                'difficulty': 1,
                'tags': ['geography', 'capital']
            }
        ]
        
        self.generator._create_questions(session, questions_data)
        
        # Should create all questions
        self.assertEqual(session.questions.count(), 2)
        
        # Check MCQ question
        mcq_question = session.questions.filter(type='MCQ').first()
        self.assertIsNotNone(mcq_question)
        self.assertEqual(mcq_question.choices, ['A', 'B', 'C', 'D'])
        self.assertEqual(mcq_question.correct_choice_index, 1)
        
        # Check Short Answer question
        sa_question = session.questions.filter(type='SHORT_ANSWER').first()
        self.assertIsNotNone(sa_question)
        self.assertIsNone(sa_question.choices)
        self.assertIsNone(sa_question.correct_choice_index)
        self.assertEqual(sa_question.acceptable_answers, ['Paris', 'paris'])


class DiagnosticGeneratorErrorHandlingTest(TestCase):
    """Test error handling in diagnostic generator."""
    
    def setUp(self):
        """Set up test data."""
        self.project = ProjectFactory()
        self.generator = DiagnosticGenerator()
    
    @patch.object(MockAIClient, 'get_response')
    def test_generate_diagnostic_ai_failure(self, mock_get_response):
        """Test handling of AI service failures."""
        # Mock AI client to raise an exception
        mock_get_response.side_effect = Exception("AI service unavailable")
        
        with self.assertRaises(Exception):
            self.generator.generate_diagnostic(
                project_id=str(self.project.id),
                topic='Test Topic',
                max_questions=3
            )
    
    @patch.object(MockAIClient, 'get_response')
    def test_generate_diagnostic_invalid_json(self, mock_get_response):
        """Test handling of invalid JSON responses from AI."""
        # Mock AI client to return invalid JSON
        mock_get_response.return_value = "This is not valid JSON"
        
        with self.assertRaises(json.JSONDecodeError):
            self.generator.generate_diagnostic(
                project_id=str(self.project.id),
                topic='Test Topic',
                max_questions=3
            )
    
    def test_generate_diagnostic_invalid_project_id(self):
        """Test handling of invalid project ID."""
        with self.assertRaises(Exception):
            self.generator.generate_diagnostic(
                project_id='invalid-uuid',
                topic='Test Topic',
                max_questions=3
            )
    
    def test_generate_diagnostic_validation_failure(self):
        """Test handling of validation failures."""
        # This would require mocking the AI response to return invalid data
        # For now, we test the validation methods directly
        
        invalid_data = {
            'session': {'topic': 'Test Topic'},
            'questions': []  # Empty questions list
        }
        
        with self.assertRaises(ValueError):
            self.generator._validate_and_normalize(invalid_data, 3)
