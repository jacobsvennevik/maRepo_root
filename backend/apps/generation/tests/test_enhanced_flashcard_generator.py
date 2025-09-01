import pytest
import json
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from backend.apps.pdf_service.django_models import Document
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.generation.services.flashcard_generator import FlashcardGenerator
from backend.apps.accounts.tests.factories import CustomUserFactory
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

# Sample enhanced flashcard response from AI
MOCK_ENHANCED_FLASHCARD_RESPONSE = json.dumps({
    "deck_metadata": {
        "description": "Enhanced flashcards on machine learning concepts with cognitive science principles.",
        "learning_objectives": [
            "Explain the difference between supervised and unsupervised learning",
            "Apply gradient descent optimization to neural networks",
            "Analyze the trade-offs between bias and variance in model performance"
        ],
        "themes": [
            "Machine Learning",
            "Neural Networks", 
            "Optimization",
            "Model Evaluation"
        ]
    },
    "flashcards": [
        {
            "question": "What is the main difference between supervised and unsupervised learning?",
            "answer": "Supervised learning uses labeled training data to learn mappings from inputs to outputs, while unsupervised learning finds patterns in data without labeled examples.",
            "concept_id": "supervised-vs-unsupervised",
            "difficulty": "medium",
            "bloom_level": "analyze",
            "card_type": "comparison",
            "theme": "Machine Learning",
            "related_concepts": ["classification", "clustering", "training-data"],
            "hints": ["Think about whether you have target labels in your training data"],
            "examples": ["Supervised: email spam detection. Unsupervised: customer segmentation"],
            "common_misconceptions": ["Thinking unsupervised learning doesn't learn anything useful"],
            "learning_objective": "Explain the difference between supervised and unsupervised learning"
        },
        {
            "question": "How does gradient descent minimize the loss function?",
            "answer": "Gradient descent calculates the gradient (partial derivatives) of the loss function with respect to parameters, then updates parameters in the opposite direction of the gradient to reduce loss.",
            "concept_id": "gradient-descent",
            "difficulty": "hard",
            "bloom_level": "apply",
            "card_type": "definition",
            "theme": "Optimization",
            "related_concepts": ["loss-function", "learning-rate", "backpropagation"],
            "hints": ["Think about following the steepest slope downhill"],
            "examples": ["Moving down a hill by following the steepest descent path"],
            "common_misconceptions": ["Thinking gradient descent always finds the global minimum"],
            "learning_objective": "Apply gradient descent optimization to neural networks"
        }
    ]
})

@pytest.mark.django_db
class TestEnhancedFlashcardGenerator:
    """Test enhanced flashcard generation with cognitive science principles."""
    
    def setup_method(self):
        """Set up test data for each test method."""
        self.user = CustomUserFactory.create()
        self.generator = FlashcardGenerator()
        
    @patch('backend.apps.generation.services.flashcard_generator.AIClient.get_response')
    def test_enhanced_prompt_structure(self, mock_ai_response):
        """Test that the enhanced prompt includes all required components."""
        mock_ai_response.return_value = MOCK_ENHANCED_FLASHCARD_RESPONSE
        
        content = "Machine learning is a subset of artificial intelligence..."
        
        # Call the method that would use the enhanced prompt
        result = self.generator.generate_from_content(
            content=content, 
            num_cards=2, 
            difficulty='medium'
        )
        
        # Verify AI was called
        mock_ai_response.assert_called_once()
        
        # Get the prompt that was sent to AI
        call_args = mock_ai_response.call_args
        messages = call_args[0][0]
        prompt = messages[0]['content']
        
        # Verify enhanced prompt structure
        assert "cognitive science" in prompt.lower() or "spaced repetition" in prompt.lower()
        assert "difficulty" in prompt.lower()
        assert "JSON" in prompt
        assert "question" in prompt.lower()
        assert "answer" in prompt.lower()
        
    @patch('backend.apps.generation.services.flashcard_generator.AIClient.get_response')
    def test_enhanced_flashcard_parsing(self, mock_ai_response):
        """Test parsing of enhanced flashcard response with metadata."""
        mock_ai_response.return_value = MOCK_ENHANCED_FLASHCARD_RESPONSE
        
        content = "Machine learning concepts for advanced students"
        result = self.generator.generate_from_content(content, num_cards=2, difficulty='hard')
        
        # Verify basic structure
        assert len(result) == 2
        assert isinstance(result, list)
        
        # Verify first flashcard has required fields
        card1 = result[0]
        assert "question" in card1
        assert "answer" in card1
        
    @patch('backend.apps.generation.services.flashcard_generator.AIClient.get_response')
    def test_enhanced_flashcard_db_storage(self, mock_ai_response):
        """Test that enhanced flashcards are properly stored in database with new fields."""
        mock_ai_response.return_value = MOCK_ENHANCED_FLASHCARD_RESPONSE
        
        # Create document and flashcard set
        uploaded_file = SimpleUploadedFile("test.pdf", b"ML content", content_type="application/pdf")
        document = Document.objects.create(
            user=self.user, 
            file=uploaded_file, 
            file_type="pdf", 
            title="ML Course"
        )
        
        flashcard_set = FlashcardSet.objects.create(
            title="Enhanced ML Flashcards",
            description="Machine learning concepts with enhanced metadata",
            learning_objectives=["Understand ML basics", "Apply ML algorithms"],
            themes=["Machine Learning", "Algorithms"],
            owner=self.user,
            document=document
        )
        
        # Generate and parse flashcards
        content = "Machine learning fundamentals"
        flashcard_data = self.generator.generate_from_content(content, num_cards=2, difficulty='medium')
        
        # Create enhanced flashcards in database
        for card_data in flashcard_data:
            if isinstance(card_data, dict):
                Flashcard.objects.create(
                    flashcard_set=flashcard_set,
                    question=card_data.get('question', 'Test question'),
                    answer=card_data.get('answer', 'Test answer'),
                    concept_id=card_data.get('concept_id', 'test-concept'),
                    difficulty=card_data.get('difficulty', 'medium'),
                    bloom_level=card_data.get('bloom_level', 'apply'),
                    card_type=card_data.get('card_type', 'definition'),
                    theme=card_data.get('theme', 'Test'),
                    related_concepts=card_data.get('related_concepts', []),
                    hints=card_data.get('hints', []),
                    examples=card_data.get('examples', []),
                    common_misconceptions=card_data.get('common_misconceptions', []),
                    learning_objective=card_data.get('learning_objective', 'Test objective')
                )
            else:
                # Fallback for simple tuple format
                Flashcard.objects.create(
                    flashcard_set=flashcard_set,
                    question=card_data[0] if len(card_data) > 0 else 'Test question',
                    answer=card_data[1] if len(card_data) > 1 else 'Test answer',
                    concept_id='test-concept',
                    difficulty='medium',
                    bloom_level='apply',
                    card_type='definition',
                    theme='Test',
                    related_concepts=[],
                    hints=[],
                    examples=[],
                    common_misconceptions=[],
                    learning_objective='Test objective'
                )
        
        # Verify flashcards were saved with enhanced fields
        saved_flashcards = Flashcard.objects.filter(flashcard_set=flashcard_set)
        assert saved_flashcards.count() == 2
        
        # Check enhanced fields are populated
        for flashcard in saved_flashcards:
            assert flashcard.concept_id is not None
            assert flashcard.difficulty in ['medium', 'hard', 'expert']
            assert flashcard.bloom_level in ['apply', 'analyze', 'evaluate', 'create']
            assert flashcard.card_type is not None
            assert flashcard.theme is not None
            assert isinstance(flashcard.related_concepts, list)
            assert isinstance(flashcard.hints, list)
            assert isinstance(flashcard.examples, list)
            assert isinstance(flashcard.common_misconceptions, list)
            
    def test_difficulty_levels(self):
        """Test that different difficulty levels are properly handled."""
        difficulties = ['medium', 'hard', 'expert']
        
        for difficulty in difficulties:
            prompt = self.generator._build_generation_prompt(
                "Test content", 
                num_cards=5, 
                difficulty=difficulty
            )
            
            # Verify difficulty is mentioned in prompt
            assert difficulty in prompt.lower()
            
    @patch('backend.apps.generation.services.flashcard_generator.AIClient.get_response')
    def test_enhanced_prompt_template_loading(self, mock_ai_response):
        """Test that enhanced prompt template is loaded correctly."""
        mock_ai_response.return_value = '[]'  # Empty response
        
        # This test would be expanded when we integrate the actual enhanced prompt file
        content = "Test content for enhanced flashcard generation"
        
        result = self.generator.generate_from_content(
            content=content,
            num_cards=3,
            difficulty='expert'
        )
        
        # Verify the method completes without error
        assert isinstance(result, list)
        
    def test_enhanced_flashcard_set_metadata(self):
        """Test enhanced flashcard set metadata fields."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Enhanced Set",
            description="A test set with enhanced metadata",
            learning_objectives=[
                "Understand advanced concepts",
                "Apply complex problem-solving techniques"
            ],
            themes=["Advanced Topics", "Problem Solving", "Critical Thinking"],
            owner=self.user
        )
        
        # Verify enhanced fields are properly stored
        assert flashcard_set.description == "A test set with enhanced metadata"
        assert len(flashcard_set.learning_objectives) == 2
        assert len(flashcard_set.themes) == 3
        assert "Advanced Topics" in flashcard_set.themes
        assert "Apply complex problem-solving techniques" in flashcard_set.learning_objectives
        
    def test_bloom_taxonomy_levels(self):
        """Test that all Bloom's taxonomy levels are supported."""
        bloom_levels = ['apply', 'analyze', 'evaluate', 'create']
        
        for bloom_level in bloom_levels:
            flashcard = Flashcard.objects.create(
                flashcard_set=FlashcardSet.objects.create(
                    title=f"Test Set {bloom_level}",
                    owner=self.user
                ),
                question=f"Test question for {bloom_level}",
                answer=f"Test answer for {bloom_level}",
                bloom_level=bloom_level,
                concept_id=f"test-{bloom_level}",
                difficulty='medium',
                card_type='definition',
                theme='Test',
                learning_objective=f"Test {bloom_level} level thinking"
            )
            
            assert flashcard.bloom_level == bloom_level
            assert flashcard.concept_id == f"test-{bloom_level}"
            
    def test_card_types_variety(self):
        """Test that all card types are supported."""
        card_types = [
            'definition', 'application', 'analysis', 'synthesis', 
            'evaluation', 'problem_solving', 'comparison', 'critique', 
            'cloze', 'scenario'
        ]
        
        flashcard_set = FlashcardSet.objects.create(
            title="Card Types Test Set",
            owner=self.user
        )
        
        for card_type in card_types:
            flashcard = Flashcard.objects.create(
                flashcard_set=flashcard_set,
                question=f"Test {card_type} question",
                answer=f"Test {card_type} answer",
                card_type=card_type,
                concept_id=f"test-{card_type}",
                difficulty='medium',
                bloom_level='apply',
                theme='Test',
                learning_objective=f"Test {card_type} understanding"
            )
            
            assert flashcard.card_type == card_type
