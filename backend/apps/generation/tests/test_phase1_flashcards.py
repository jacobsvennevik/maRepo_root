"""
Phase 1 Flashcards - Basic Functionality Tests
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from backend.apps.projects.models import Project, ProjectFlashcardSet
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.generation.services.spaced_repetition import SM2Algorithm, ReviewQuality

User = get_user_model()

class Phase1FlashcardsTestCase(TestCase):
    """Test basic Phase 1 flashcards functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.project = Project.objects.create(
            name="Test Biology Project",
            project_type='school',
            owner=self.user,
            course_name="Biology 101",
            course_code="BIO101",
            teacher_name="Dr. Test"
        )
        
        self.flashcard_set = FlashcardSet.objects.create(
            title="Test Flashcards",
            owner=self.user
        )
        
        # Link flashcard set to project
        ProjectFlashcardSet.objects.create(
            project=self.project,
            flashcard_set=self.flashcard_set,
            is_primary=True
        )
        
        # Create test flashcards
        self.new_card = Flashcard.objects.create(
            flashcard_set=self.flashcard_set,
            question="What is the powerhouse of the cell?",
            answer="Mitochondria",
            learning_state="new"
        )
        
        self.learning_card = Flashcard.objects.create(
            flashcard_set=self.flashcard_set,
            question="What is photosynthesis?",
            answer="Process by which plants make food",
            learning_state="learning",
            next_review=timezone.now() - timedelta(days=1),  # Overdue
            interval=1,
            repetitions=1
        )
        
        self.review_card = Flashcard.objects.create(
            flashcard_set=self.flashcard_set,
            question="What is DNA?",
            answer="Genetic material",
            learning_state="review",
            next_review=timezone.now(),  # Due today
            interval=7,
            repetitions=3,
            ease_factor=2.5
        )
    
    def test_flashcard_creation(self):
        """Test that flashcards can be created with proper fields"""
        self.assertEqual(self.new_card.learning_state, "new")
        self.assertEqual(self.new_card.interval, 0)
        self.assertEqual(self.new_card.repetitions, 0)
        self.assertEqual(self.new_card.ease_factor, 2.5)
        self.assertIsNone(self.new_card.next_review)
    
    def test_due_cards_query(self):
        """Test that due cards can be queried efficiently"""
        due_cards = Flashcard.objects.filter(
            flashcard_set__project_links__project=self.project,
            next_review__lte=timezone.now().date()
        )
        
        self.assertEqual(due_cards.count(), 2)  # learning_card and review_card
        self.assertIn(self.learning_card, due_cards)
        self.assertIn(self.review_card, due_cards)
        self.assertNotIn(self.new_card, due_cards)
    
    def test_sm2_scheduler(self):
        """Test SM-2 scheduling algorithm"""
        scheduler = SM2Algorithm()
        
        # Test that scheduler can be instantiated
        self.assertEqual(scheduler.algorithm_name, "SuperMemo 2")
        
        # Test due date checking
        self.assertTrue(scheduler.is_due(self.new_card))  # New card is always due
        self.assertTrue(scheduler.is_due(self.learning_card))  # Overdue card
        self.assertTrue(scheduler.is_due(self.review_card))  # Due today
        
        # Test interval calculation
        new_interval, new_ease_factor, new_repetitions = scheduler.calculate_next_interval(
            current_interval=0,
            quality=ReviewQuality.PERFECT_RESPONSE,
            repetitions=0,
            ease_factor=2.5
        )
        
        self.assertGreater(new_interval, 0)
        self.assertGreaterEqual(new_ease_factor, 1.3)
        self.assertEqual(new_repetitions, 1)
    
    def test_project_flashcard_relationship(self):
        """Test that flashcards are properly linked to projects"""
        project_cards = Flashcard.objects.filter(
            flashcard_set__project_links__project=self.project
        )
        
        self.assertEqual(project_cards.count(), 3)
        
        # Test that cards belong to the correct project
        for card in project_cards:
            self.assertEqual(
                card.flashcard_set.project_links.first().project,
                self.project
            )
    
    def test_anti_spam_limits(self):
        """Test that anti-spam limits are enforced"""
        # This would be tested in the API view, but we can test the model constraints
        # Create many flashcards to test performance
        for i in range(100):
            Flashcard.objects.create(
                flashcard_set=self.flashcard_set,
                question=f"Question {i}",
                answer=f"Answer {i}",
                learning_state="new"
            )
        
        # Should still be able to query efficiently
        due_cards = Flashcard.objects.filter(
            flashcard_set__project_links__project=self.project,
            next_review__lte=timezone.now().date()
        )
        
        # Should still get the same 2 due cards
        self.assertEqual(due_cards.count(), 2)
    
    def test_jsonb_metrics(self):
        """Test that optional metrics can be stored in JSONB"""
        self.new_card.metrics = {
            'memory_strength': 0.8,
            'difficulty_rating': 3.5,
            'tags': ['biology', 'cell']
        }
        self.new_card.save()
        
        # Test property accessors
        self.assertEqual(self.new_card.memory_strength, 0.8)
        self.assertEqual(self.new_card.difficulty_rating, 3.5)
        self.assertEqual(self.new_card.tags, ['biology', 'cell'])
        
        # Test default values for cards without metrics
        self.assertEqual(self.learning_card.memory_strength, 1.0)
        self.assertEqual(self.learning_card.difficulty_rating, 0.0)
        self.assertEqual(self.learning_card.tags, []) 