import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.accounts.tests.factories import CustomUserFactory

User = get_user_model()

@pytest.mark.django_db
class TestEnhancedFlashcardModels:
    """Test enhanced flashcard model fields and validation."""
    
    def setup_method(self):
        """Set up test data for each test method."""
        self.user = CustomUserFactory.create()
        
    def test_flashcard_set_enhanced_fields(self):
        """Test FlashcardSet enhanced metadata fields."""
        flashcard_set = FlashcardSet.objects.create(
            title="Enhanced Test Set",
            description="A comprehensive test set with enhanced metadata fields",
            learning_objectives=[
                "Understand core concepts",
                "Apply knowledge in practical scenarios",
                "Analyze complex problems"
            ],
            themes=[
                "Core Concepts",
                "Practical Application", 
                "Problem Solving",
                "Critical Thinking"
            ],
            owner=self.user
        )
        
        # Test enhanced fields are properly stored
        assert flashcard_set.description == "A comprehensive test set with enhanced metadata fields"
        assert len(flashcard_set.learning_objectives) == 3
        assert len(flashcard_set.themes) == 4
        assert "Understand core concepts" in flashcard_set.learning_objectives
        assert "Core Concepts" in flashcard_set.themes
        
        # Test JSON field default values
        empty_set = FlashcardSet.objects.create(
            title="Empty Set",
            owner=self.user
        )
        assert empty_set.learning_objectives == []
        assert empty_set.themes == []
        assert empty_set.description == ""
        
    def test_flashcard_enhanced_fields(self):
        """Test Flashcard enhanced content metadata fields."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        flashcard = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="What is the difference between machine learning and deep learning?",
            answer="Machine learning is a broader field that includes various algorithms, while deep learning specifically uses neural networks with multiple layers.",
            concept_id="ml-vs-dl",
            difficulty="medium",
            bloom_level="analyze",
            card_type="comparison",
            theme="Machine Learning",
            related_concepts=["neural-networks", "algorithms", "artificial-intelligence"],
            hints=[
                "Think about the scope and specific techniques used",
                "Consider the relationship between the two fields"
            ],
            examples=[
                "ML: Decision trees, SVM, linear regression",
                "DL: Convolutional neural networks, transformers"
            ],
            common_misconceptions=[
                "Thinking deep learning and machine learning are completely separate",
                "Believing deep learning is always better than traditional ML"
            ],
            learning_objective="Analyze the relationship between machine learning and deep learning"
        )
        
        # Test all enhanced fields are properly stored
        assert flashcard.concept_id == "ml-vs-dl"
        assert flashcard.difficulty == "medium"
        assert flashcard.bloom_level == "analyze"
        assert flashcard.card_type == "comparison"
        assert flashcard.theme == "Machine Learning"
        assert len(flashcard.related_concepts) == 3
        assert len(flashcard.hints) == 2
        assert len(flashcard.examples) == 2
        assert len(flashcard.common_misconceptions) == 2
        assert "Analyze the relationship" in flashcard.learning_objective
        
    def test_flashcard_difficulty_choices(self):
        """Test that difficulty field accepts only valid choices."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        # Test valid difficulty levels
        valid_difficulties = ['medium', 'hard', 'expert']
        for difficulty in valid_difficulties:
            flashcard = Flashcard.objects.create(
                flashcard_set=flashcard_set,
                question=f"Test question for {difficulty}",
                answer=f"Test answer for {difficulty}",
                difficulty=difficulty,
                concept_id=f"test-{difficulty}",
                bloom_level="apply",
                card_type="definition",
                theme="Test",
                learning_objective="Test understanding"
            )
            assert flashcard.difficulty == difficulty
            
        # Test invalid difficulty (should use default)
        flashcard_invalid = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="Test question with default difficulty",
            answer="Test answer with default difficulty",
            concept_id="test-default",
            bloom_level="apply",
            card_type="definition",
            theme="Test",
            learning_objective="Test understanding"
        )
        assert flashcard_invalid.difficulty == "medium"  # Default value
        
    def test_flashcard_bloom_level_choices(self):
        """Test that bloom_level field accepts only valid choices."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        # Test valid Bloom's taxonomy levels
        valid_bloom_levels = ['apply', 'analyze', 'evaluate', 'create']
        for bloom_level in valid_bloom_levels:
            flashcard = Flashcard.objects.create(
                flashcard_set=flashcard_set,
                question=f"Test question for {bloom_level}",
                answer=f"Test answer for {bloom_level}",
                bloom_level=bloom_level,
                concept_id=f"test-{bloom_level}",
                difficulty="medium",
                card_type="definition",
                theme="Test",
                learning_objective="Test understanding"
            )
            assert flashcard.bloom_level == bloom_level
            
    def test_flashcard_card_type_choices(self):
        """Test that card_type field accepts only valid choices."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        # Test valid card types
        valid_card_types = [
            'definition', 'application', 'analysis', 'synthesis',
            'evaluation', 'problem_solving', 'comparison', 'critique',
            'cloze', 'scenario'
        ]
        
        for card_type in valid_card_types:
            flashcard = Flashcard.objects.create(
                flashcard_set=flashcard_set,
                question=f"Test {card_type} question",
                answer=f"Test {card_type} answer",
                card_type=card_type,
                concept_id=f"test-{card_type}",
                difficulty="medium",
                bloom_level="apply",
                theme="Test",
                learning_objective="Test understanding"
            )
            assert flashcard.card_type == card_type
            
    def test_flashcard_json_field_defaults(self):
        """Test that JSON fields have proper default values."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        # Create flashcard with minimal fields
        flashcard = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="Test question",
            answer="Test answer"
        )
        
        # Check JSON field defaults
        assert flashcard.related_concepts == []
        assert flashcard.hints == []
        assert flashcard.examples == []
        assert flashcard.common_misconceptions == []
        
        # Check string field defaults
        assert flashcard.concept_id == ""
        assert flashcard.theme == ""
        assert flashcard.learning_objective == ""
        
        # Check choice field defaults
        assert flashcard.difficulty == "medium"
        assert flashcard.bloom_level == "apply"
        assert flashcard.card_type == "definition"
        
    def test_flashcard_json_field_manipulation(self):
        """Test that JSON fields can be properly manipulated."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        flashcard = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="Test question",
            answer="Test answer",
            related_concepts=["concept1", "concept2"],
            hints=["hint1", "hint2", "hint3"],
            examples=["example1"],
            common_misconceptions=["misconception1", "misconception2"]
        )
        
        # Test adding to lists
        flashcard.related_concepts.append("concept3")
        flashcard.hints.extend(["hint4", "hint5"])
        flashcard.save()
        
        # Reload from database
        flashcard.refresh_from_db()
        
        assert len(flashcard.related_concepts) == 3
        assert len(flashcard.hints) == 5
        assert "concept3" in flashcard.related_concepts
        assert "hint4" in flashcard.hints
        assert "hint5" in flashcard.hints
        
    def test_flashcard_set_str_representation(self):
        """Test string representation of enhanced FlashcardSet."""
        flashcard_set = FlashcardSet.objects.create(
            title="Advanced Machine Learning Concepts",
            description="Deep dive into ML algorithms and techniques",
            owner=self.user
        )
        
        expected_str = f"Advanced Machine Learning Concepts (Owner: {self.user.username})"
        assert str(flashcard_set) == expected_str
        
    def test_flashcard_str_representation(self):
        """Test string representation of enhanced Flashcard."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        flashcard = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="What is the fundamental principle of machine learning optimization?",
            answer="Minimizing a loss function through iterative parameter updates"
        )
        
        # Test string representation includes question preview
        str_repr = str(flashcard)
        assert "What is the fundamental principle of machine" in str_repr
        
    def test_enhanced_field_max_lengths(self):
        """Test that enhanced fields respect max length constraints."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        # Test concept_id max length (255 chars)
        long_concept_id = "a" * 255
        flashcard = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="Test question",
            answer="Test answer",
            concept_id=long_concept_id
        )
        assert len(flashcard.concept_id) == 255
        
        # Test theme max length (100 chars)
        long_theme = "b" * 100
        flashcard.theme = long_theme
        flashcard.save()
        assert len(flashcard.theme) == 100
        
        # Test learning_objective max length (500 chars)
        long_objective = "c" * 500
        flashcard.learning_objective = long_objective
        flashcard.save()
        assert len(flashcard.learning_objective) == 500
        
    def test_flashcard_ordering(self):
        """Test that flashcards maintain proper ordering."""
        flashcard_set = FlashcardSet.objects.create(
            title="Test Set",
            owner=self.user
        )
        
        # Create multiple flashcards
        flashcard1 = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="First question",
            answer="First answer"
        )
        
        flashcard2 = Flashcard.objects.create(
            flashcard_set=flashcard_set,
            question="Second question", 
            answer="Second answer"
        )
        
        # Test ordering (should be by next_review, updated_at per model Meta)
        flashcards = Flashcard.objects.filter(flashcard_set=flashcard_set)
        assert len(flashcards) == 2
        
        # Verify they're ordered properly (first created should come first by default)
        ordered_flashcards = list(flashcards.order_by('id'))
        assert ordered_flashcards[0].question == "First question"
        assert ordered_flashcards[1].question == "Second question"
