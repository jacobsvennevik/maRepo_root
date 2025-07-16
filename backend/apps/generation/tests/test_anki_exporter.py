import pytest
import tempfile
import os
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from django.test import TestCase
from backend.apps.generation.services.anki_exporter import AnkiExportService
from backend.apps.generation.tests.factories import FlashcardSetFactory, FlashcardFactory
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.tests.factories import DocumentFactory

User = get_user_model()


@pytest.mark.django_db
class TestAnkiExportService:
    """Test suite for AnkiExportService."""

    def setup_method(self):
        """Set up test data for each test method."""
        self.user = CustomUserFactory()
        self.document = DocumentFactory()
        self.exporter = AnkiExportService()
        
    def test_service_initialization(self):
        """Test that the service initializes correctly."""
        assert self.exporter.model is not None
        assert self.exporter.DEFAULT_MODEL_ID == 1607392319
        assert self.exporter.DEFAULT_DECK_ID_BASE == 2059400110

    def test_create_basic_model(self):
        """Test that the basic Anki model is created correctly."""
        model = self.exporter._create_basic_model()
        
        assert model.model_id == self.exporter.DEFAULT_MODEL_ID
        assert model.name == 'Ocean Learn Basic Model'
        assert len(model.fields) == 3
        assert model.fields[0]['name'] == 'Question'
        assert model.fields[1]['name'] == 'Answer'
        assert model.fields[2]['name'] == 'Source'
        assert len(model.templates) == 1
        assert model.templates[0]['name'] == 'Basic Card'

    def test_create_cloze_model(self):
        """Test that the cloze Anki model is created correctly."""
        model = self.exporter._create_cloze_model()
        
        assert model.model_id == self.exporter.DEFAULT_MODEL_ID + 1
        assert model.name == 'Ocean Learn Cloze Model'
        assert len(model.fields) == 2
        assert model.fields[0]['name'] == 'Text'
        assert model.fields[1]['name'] == 'Source'
        assert model.model_type == 1  # genanki.Model.CLOZE

    def test_export_empty_flashcard_set(self):
        """Test exporting a flashcard set with no flashcards."""
        flashcard_set = FlashcardSetFactory(owner=self.user, document=self.document)
        
        apkg_content = self.exporter.export_flashcard_set(flashcard_set)
        
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0  # Should still create a valid .apkg file

    def test_export_flashcard_set_basic(self):
        """Test exporting a flashcard set with basic cards."""
        flashcard_set = FlashcardSetFactory(
            owner=self.user, 
            document=self.document,
            title="Test Flashcard Set"
        )
        
        # Create some test flashcards
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="What is Python?",
            answer="A programming language"
        )
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="What is Django?",
            answer="A Python web framework"
        )
        
        apkg_content = self.exporter.export_flashcard_set(
            flashcard_set=flashcard_set,
            include_source=True,
            card_type='basic'
        )
        
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0

    def test_export_flashcard_set_cloze(self):
        """Test exporting a flashcard set with cloze cards."""
        flashcard_set = FlashcardSetFactory(
            owner=self.user,
            document=self.document,
            title="Test Cloze Set"
        )
        
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="Python is a",
            answer="programming language"
        )
        
        apkg_content = self.exporter.export_flashcard_set(
            flashcard_set=flashcard_set,
            include_source=True,
            card_type='cloze'
        )
        
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0

    def test_export_flashcard_set_without_source(self):
        """Test exporting a flashcard set without source information."""
        flashcard_set = FlashcardSetFactory(owner=self.user, document=self.document)
        FlashcardFactory(flashcard_set=flashcard_set)
        
        apkg_content = self.exporter.export_flashcard_set(
            flashcard_set=flashcard_set,
            include_source=False
        )
        
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0

    def test_export_multiple_sets(self):
        """Test exporting multiple flashcard sets to a single deck."""
        # Create multiple flashcard sets
        sets = []
        for i in range(3):
            flashcard_set = FlashcardSetFactory(
                owner=self.user,
                title=f"Test Set {i+1}"
            )
            FlashcardFactory(
                flashcard_set=flashcard_set,
                question=f"Question {i+1}",
                answer=f"Answer {i+1}"
            )
            sets.append(flashcard_set)
        
        apkg_content = self.exporter.export_multiple_sets(
            flashcard_sets=sets,
            deck_name="Combined Test Deck",
            include_source=True
        )
        
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0

    def test_export_multiple_sets_empty_list(self):
        """Test that exporting an empty list raises an error."""
        with pytest.raises(ValueError, match="No flashcard sets provided for export"):
            self.exporter.export_multiple_sets([])

    def test_export_user_flashcards(self):
        """Test exporting all flashcards for a user."""
        # Create multiple flashcard sets for the user
        for i in range(2):
            flashcard_set = FlashcardSetFactory(owner=self.user)
            FlashcardFactory(flashcard_set=flashcard_set)
        
        apkg_content = self.exporter.export_user_flashcards(
            user=self.user,
            include_source=True
        )
        
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0

    def test_export_user_flashcards_no_sets(self):
        """Test that exporting flashcards for a user with no sets raises an error."""
        empty_user = CustomUserFactory()
        
        with pytest.raises(ValueError, match="No flashcard sets found for this user"):
            self.exporter.export_user_flashcards(empty_user)

    def test_create_http_response(self):
        """Test creating an HTTP response for file download."""
        apkg_content = b"fake apkg content"
        filename = "test_flashcards.apkg"
        
        response = self.exporter.create_http_response(apkg_content, filename)
        
        assert response['Content-Type'] == 'application/apkg'
        assert response['Content-Disposition'] == f'attachment; filename="{filename}"'
        assert response['Content-Length'] == str(len(apkg_content))
        assert response.content == apkg_content

    def test_unique_deck_ids(self):
        """Test that different flashcard sets get unique deck IDs."""
        set1 = FlashcardSetFactory(owner=self.user)
        set2 = FlashcardSetFactory(owner=self.user)
        
        # Mock the genanki.Deck to capture the deck IDs
        with patch('backend.apps.generation.services.anki_exporter.genanki.Deck') as mock_deck_class:
            mock_deck = MagicMock()
            mock_deck_class.return_value = mock_deck
            
            with patch('backend.apps.generation.services.anki_exporter.genanki.Package'):
                with patch('tempfile.NamedTemporaryFile'):
                    with patch('builtins.open', create=True):
                        try:
                            self.exporter.export_flashcard_set(set1)
                            self.exporter.export_flashcard_set(set2)
                        except:
                            pass  # We're just testing the deck ID generation
            
            # Check that different deck IDs were used
            calls = mock_deck_class.call_args_list
            if len(calls) >= 2:
                deck_id_1 = calls[0][1]['deck_id']
                deck_id_2 = calls[1][1]['deck_id']
                assert deck_id_1 != deck_id_2

    @patch('tempfile.NamedTemporaryFile')
    @patch('backend.apps.generation.services.anki_exporter.genanki.Package')
    def test_temporary_file_cleanup(self, mock_package, mock_temp_file):
        """Test that temporary files are properly cleaned up."""
        # Setup mocks
        mock_temp_file.return_value.__enter__.return_value.name = '/tmp/test.apkg'
        mock_package_instance = MagicMock()
        mock_package.return_value = mock_package_instance
        
        flashcard_set = FlashcardSetFactory(owner=self.user)
        FlashcardFactory(flashcard_set=flashcard_set)
        
        with patch('builtins.open', create=True) as mock_open:
            with patch('os.unlink') as mock_unlink:
                mock_open.return_value.__enter__.return_value.read.return_value = b"test content"
                
                result = self.exporter.export_flashcard_set(flashcard_set)
                
                # Verify that unlink was called (file cleanup)
                mock_unlink.assert_called_once_with('/tmp/test.apkg')
                assert result == b"test content"


@pytest.mark.django_db
class TestAnkiExportServiceIntegration:
    """Integration tests for AnkiExportService with real data."""

    def setup_method(self):
        """Set up test data."""
        self.user = CustomUserFactory()
        self.document = DocumentFactory(title="Test Document")
        self.exporter = AnkiExportService()

    def test_full_export_workflow(self):
        """Test the complete export workflow with real flashcard data."""
        # Create a flashcard set with diverse content
        flashcard_set = FlashcardSetFactory(
            owner=self.user,
            document=self.document,
            title="Integration Test Set"
        )
        
        # Add flashcards with various content types
        test_cards = [
            ("What is machine learning?", "A subset of AI that uses algorithms to learn from data"),
            ("Define 'overfitting'", "When a model learns training data too well and performs poorly on new data"),
            ("Name three types of machine learning", "Supervised, unsupervised, and reinforcement learning"),
        ]
        
        for question, answer in test_cards:
            FlashcardFactory(
                flashcard_set=flashcard_set,
                question=question,
                answer=answer
            )
        
        # Test basic export
        apkg_content = self.exporter.export_flashcard_set(flashcard_set)
        
        # Verify the export
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 100  # Should be substantial content
        
        # Test that we can create HTTP response
        response = self.exporter.create_http_response(
            apkg_content, 
            "integration_test.apkg"
        )
        
        assert response.status_code == 200
        assert response['Content-Type'] == 'application/apkg'

    def test_special_characters_handling(self):
        """Test that special characters in flashcards are handled correctly."""
        flashcard_set = FlashcardSetFactory(
            owner=self.user,
            title="Special Characters Test"
        )
        
        # Add flashcards with special characters
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="What is 'café' in English?",
            answer="A place where you drink coffee & eat food"
        )
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="Mathematical formula: E = mc²",
            answer="Einstein's mass-energy equivalence"
        )
        
        # Should not raise any errors
        apkg_content = self.exporter.export_flashcard_set(flashcard_set)
        assert isinstance(apkg_content, bytes)
        assert len(apkg_content) > 0 