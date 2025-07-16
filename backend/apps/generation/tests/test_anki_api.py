import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from backend.apps.generation.tests.factories import FlashcardSetFactory, FlashcardFactory
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.tests.factories import DocumentFactory

User = get_user_model()


@pytest.mark.django_db
class TestAnkiExportAPIEndpoints:
    """Test suite for Anki export API endpoints."""

    def setup_method(self):
        """Set up test data for each test method."""
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)
        self.document = DocumentFactory()

    def test_export_single_flashcard_set_basic(self):
        """Test exporting a single flashcard set via API."""
        # Create flashcard set with cards
        flashcard_set = FlashcardSetFactory(
            owner=self.user,
            document=self.document,
            title="API Test Set"
        )
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="What is an API?",
            answer="Application Programming Interface"
        )
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="What is REST?",
            answer="Representational State Transfer"
        )

        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'
        assert 'attachment' in response['Content-Disposition']
        assert '.apkg' in response['Content-Disposition']
        assert len(response.content) > 0

    def test_export_single_flashcard_set_with_params(self):
        """Test exporting with optional parameters."""
        flashcard_set = FlashcardSetFactory(owner=self.user, title="Param Test")
        FlashcardFactory(flashcard_set=flashcard_set)

        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url, {
            'include_source': 'false',
            'card_type': 'cloze'
        })

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'

    def test_export_single_flashcard_set_invalid_card_type(self):
        """Test that invalid card type returns error."""
        flashcard_set = FlashcardSetFactory(owner=self.user)
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        
        response = self.client.get(url, {'card_type': 'invalid'})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Invalid card_type' in response.data['error']

    def test_export_single_flashcard_set_not_found(self):
        """Test that non-existent flashcard set returns 404."""
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': 99999})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_export_single_flashcard_set_wrong_owner(self):
        """Test that user cannot export other user's flashcard sets."""
        other_user = CustomUserFactory()
        flashcard_set = FlashcardSetFactory(owner=other_user)
        
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_export_user_all_flashcards(self):
        """Test exporting all user's flashcard sets."""
        # Create multiple flashcard sets for user
        for i in range(3):
            flashcard_set = FlashcardSetFactory(
                owner=self.user,
                title=f"User Set {i+1}"
            )
            FlashcardFactory(flashcard_set=flashcard_set)

        url = reverse('export_user_flashcards_anki')
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'
        assert 'all_flashcards.apkg' in response['Content-Disposition']

    def test_export_user_all_flashcards_with_params(self):
        """Test exporting all user flashcards with custom parameters."""
        flashcard_set = FlashcardSetFactory(owner=self.user)
        FlashcardFactory(flashcard_set=flashcard_set)

        url = reverse('export_user_flashcards_anki')
        response = self.client.get(url, {
            'include_source': 'false',
            'deck_name': 'Custom User Deck'
        })

        assert response.status_code == status.HTTP_200_OK

    def test_export_user_all_flashcards_no_sets(self):
        """Test that user with no flashcard sets gets 404."""
        url = reverse('export_user_flashcards_anki')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_export_multiple_flashcard_sets(self):
        """Test exporting multiple selected flashcard sets."""
        # Create multiple flashcard sets
        sets = []
        for i in range(3):
            flashcard_set = FlashcardSetFactory(
                owner=self.user,
                title=f"Multi Set {i+1}"
            )
            FlashcardFactory(flashcard_set=flashcard_set)
            sets.append(flashcard_set)

        url = reverse('export_multiple_flashcards_anki')
        data = {
            'flashcard_set_ids': [s.id for s in sets],
            'deck_name': 'Combined Test Deck',
            'include_source': True
        }
        response = self.client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'
        assert 'Combined Test Deck.apkg' in response['Content-Disposition']

    def test_export_multiple_flashcard_sets_empty_list(self):
        """Test that empty flashcard set list returns error."""
        url = reverse('export_multiple_flashcards_anki')
        data = {'flashcard_set_ids': []}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'flashcard_set_ids is required' in response.data['error']

    def test_export_multiple_flashcard_sets_missing_param(self):
        """Test that missing flashcard_set_ids returns error."""
        url = reverse('export_multiple_flashcards_anki')
        data = {}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_export_multiple_flashcard_sets_invalid_ids(self):
        """Test that invalid flashcard set IDs return 404."""
        url = reverse('export_multiple_flashcards_anki')
        data = {'flashcard_set_ids': [99999, 99998]}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_export_multiple_flashcard_sets_mixed_ownership(self):
        """Test that user can only export their own flashcard sets."""
        other_user = CustomUserFactory()
        
        # Create sets for both users
        user_set = FlashcardSetFactory(owner=self.user)
        other_set = FlashcardSetFactory(owner=other_user)
        
        url = reverse('export_multiple_flashcards_anki')
        data = {'flashcard_set_ids': [user_set.id, other_set.id]}
        response = self.client.post(url, data, format='json')
        
        # Should only export the user's own set
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access export endpoints."""
        self.client.force_authenticate(user=None)
        flashcard_set = FlashcardSetFactory()
        
        # Test single set export
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Test user all export
        url = reverse('export_user_flashcards_anki')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Test multiple export
        url = reverse('export_multiple_flashcards_anki')
        response = self.client.post(url, {})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAnkiExportDRFViewSetActions:
    """Test suite for DRF ViewSet custom actions for Anki export."""

    def setup_method(self):
        """Set up test data for each test method."""
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)

    def test_viewset_export_single_action(self):
        """Test the ViewSet's export-anki action."""
        flashcard_set = FlashcardSetFactory(owner=self.user, title="ViewSet Test")
        FlashcardFactory(flashcard_set=flashcard_set)

        url = reverse('flashcardset-export-anki', kwargs={'pk': flashcard_set.id})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'

    def test_viewset_export_single_with_params(self):
        """Test the ViewSet action with query parameters."""
        flashcard_set = FlashcardSetFactory(owner=self.user)
        FlashcardFactory(flashcard_set=flashcard_set)

        url = reverse('flashcardset-export-anki', kwargs={'pk': flashcard_set.id})
        response = self.client.get(url, {
            'include_source': 'false',
            'card_type': 'basic'
        })

        assert response.status_code == status.HTTP_200_OK

    def test_viewset_export_all_action(self):
        """Test the ViewSet's export-all-anki action."""
        # Create flashcard sets for user
        for i in range(2):
            flashcard_set = FlashcardSetFactory(owner=self.user)
            FlashcardFactory(flashcard_set=flashcard_set)

        url = reverse('flashcardset-export-all-anki')
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'

    def test_viewset_export_multiple_action(self):
        """Test the ViewSet's export-multiple-anki action."""
        # Create flashcard sets
        sets = []
        for i in range(2):
            flashcard_set = FlashcardSetFactory(owner=self.user)
            FlashcardFactory(flashcard_set=flashcard_set)
            sets.append(flashcard_set)

        url = reverse('flashcardset-export-multiple-anki')
        data = {
            'flashcard_set_ids': [s.id for s in sets],
            'deck_name': 'ViewSet Combined Deck'
        }
        response = self.client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/apkg'

    def test_viewset_queryset_filtering(self):
        """Test that ViewSet properly filters by user ownership."""
        other_user = CustomUserFactory()
        
        # Create sets for both users
        user_set = FlashcardSetFactory(owner=self.user)
        other_set = FlashcardSetFactory(owner=other_user)
        
        # Try to access other user's set
        url = reverse('flashcardset-export-anki', kwargs={'pk': other_set.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_viewset_empty_queryset_for_unauthenticated(self):
        """Test that unauthenticated users get empty queryset."""
        self.client.force_authenticate(user=None)
        flashcard_set = FlashcardSetFactory()
        
        url = reverse('flashcardset-export-anki', kwargs={'pk': flashcard_set.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAnkiExportErrorHandling:
    """Test suite for error handling in Anki export functionality."""

    def setup_method(self):
        """Set up test data for each test method."""
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)

    def test_export_empty_flashcard_set(self):
        """Test exporting a flashcard set with no flashcards."""
        empty_set = FlashcardSetFactory(owner=self.user, title="Empty Set")
        
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': empty_set.id})
        response = self.client.get(url)
        
        # Should still work, just create an empty deck
        assert response.status_code == status.HTTP_200_OK

    def test_filename_sanitization(self):
        """Test that special characters in titles are properly sanitized for filenames."""
        flashcard_set = FlashcardSetFactory(
            owner=self.user,
            title="Test/Set:With*Special?Characters"
        )
        FlashcardFactory(flashcard_set=flashcard_set)
        
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        # Check that filename doesn't contain problematic characters
        content_disposition = response['Content-Disposition']
        assert '/' not in content_disposition
        assert ':' not in content_disposition
        assert '*' not in content_disposition
        assert '?' not in content_disposition

    def test_large_flashcard_set_export(self):
        """Test exporting a large flashcard set."""
        flashcard_set = FlashcardSetFactory(owner=self.user, title="Large Set")
        
        # Create many flashcards
        for i in range(50):
            FlashcardFactory(
                flashcard_set=flashcard_set,
                question=f"Question {i+1}",
                answer=f"Answer {i+1}"
            )
        
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.content) > 1000  # Should be substantial content

    def test_unicode_content_handling(self):
        """Test that Unicode content in flashcards is handled correctly."""
        flashcard_set = FlashcardSetFactory(owner=self.user, title="Unicode Test")
        
        # Add flashcards with various Unicode characters
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="What is こんにちは?",
            answer="Hello in Japanese"
        )
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="Mathematical: ∫∞₀ e⁻ˣ dx = ?",
            answer="1"
        )
        FlashcardFactory(
            flashcard_set=flashcard_set,
            question="Emoji test: 🎓📚",
            answer="Education emojis"
        )
        
        url = reverse('export_flashcard_set_anki', kwargs={'flashcard_set_id': flashcard_set.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.content) > 0 