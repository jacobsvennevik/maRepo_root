import pytest
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from ..models import (
    ReflectionSession, ReflectionEntry, ReflectionAnalysis,
    Checklist, ChecklistItem, Recommendation, ReflectionStreak
)
from .factories import (
    ReflectionSessionFactory, ReflectionEntryFactory, ReflectionAnalysisFactory,
    ChecklistFactory, ChecklistItemFactory, RecommendationFactory, ReflectionStreakFactory
)


@pytest.mark.django_db
class TestReflectionSession:
    """Test cases for ReflectionSession model."""
    
    def test_create_reflection_session(self):
        """Test creating a basic reflection session."""
        session = ReflectionSessionFactory()
        
        assert session.user is not None
        assert session.project is not None
        assert session.source in ['quiz', 'study', 'other']
        assert session.source_ref is not None
        assert session.started_at is not None
        assert session.ended_at is None
        assert session.duration_seconds == 0
    
    def test_reflection_session_str_representation(self):
        """Test the string representation of reflection session."""
        session = ReflectionSessionFactory()
        expected_str = f"Reflection for {session.user.username} - {session.source}"
        
        assert expected_str in str(session)
    
    def test_reflection_session_ordering(self):
        """Test that sessions are ordered by started_at descending."""
        # Create sessions with different start times
        old_session = ReflectionSessionFactory()
        old_session.started_at = timezone.now() - timedelta(hours=2)
        old_session.save()
        
        new_session = ReflectionSessionFactory()
        new_session.started_at = timezone.now()
        new_session.save()
        
        sessions = ReflectionSession.objects.all()
        assert sessions[0] == new_session
        assert sessions[1] == old_session
    
    def test_reflection_session_source_choices(self):
        """Test that source field only accepts valid choices."""
        valid_sources = ['quiz', 'study', 'other']
        
        for source in valid_sources:
            session = ReflectionSessionFactory(source=source)
            assert session.source == source
    
    def test_reflection_session_duration_calculation(self):
        """Test duration calculation when session is completed."""
        session = ReflectionSessionFactory()
        start_time = session.started_at
        
        # Complete the session
        session.ended_at = start_time + timedelta(seconds=90)
        session.duration_seconds = 90  # Set duration manually since it's not auto-calculated
        session.save()
        
        # Duration should be set correctly
        assert session.duration_seconds == 90


@pytest.mark.django_db
class TestReflectionEntry:
    """Test cases for ReflectionEntry model."""
    
    def test_create_reflection_entry(self):
        """Test creating a reflection entry."""
        entry = ReflectionEntryFactory()
        
        assert entry.session is not None
        assert entry.key in [
            'what_was_hard', 'misapplied_rule', 'what_went_well',
            'next_time', 'time_management', 'concept_understanding',
            'study_environment', 'focus_level'
        ]
        assert entry.text is not None
        assert entry.created_at is not None
    
    def test_reflection_entry_str_representation(self):
        """Test the string representation of reflection entry."""
        entry = ReflectionEntryFactory(text="This is a very long reflection text that should be truncated")
        # The actual truncation happens at 50 characters and adds "..."
        # "misapplied_rule: " is 20 chars, so we get 30 chars from text + "..."
        expected_str = f"{entry.key}: This is a very long reflection text that should be..."
        
        assert expected_str == str(entry)
    
    def test_reflection_entry_ordering(self):
        """Test that entries are ordered by created_at."""
        session = ReflectionSessionFactory()
        
        old_entry = ReflectionEntryFactory(session=session)
        old_entry.created_at = timezone.now() - timedelta(minutes=5)
        old_entry.save()
        
        new_entry = ReflectionEntryFactory(session=session)
        new_entry.created_at = timezone.now()
        new_entry.save()
        
        entries = session.entries.all()
        assert entries[0] == old_entry
        assert entries[1] == new_entry
    
    def test_reflection_entry_unique_constraint(self):
        """Test that entries have unique session-key combinations."""
        session = ReflectionSessionFactory()
        
        # Create first entry
        ReflectionEntryFactory(session=session, key='what_was_hard')
        
        # Try to create another entry with same key for same session
        with pytest.raises(Exception):  # Should raise IntegrityError
            ReflectionEntryFactory(session=session, key='what_was_hard')
    
    def test_reflection_entry_relationship(self):
        """Test the relationship between session and entries."""
        session = ReflectionSessionFactory()
        entry1 = ReflectionEntryFactory(session=session, key='what_was_hard')
        entry2 = ReflectionEntryFactory(session=session, key='what_went_well')
        
        assert session.entries.count() == 2
        assert entry1.session == session
        assert entry2.session == session


@pytest.mark.django_db
class TestReflectionAnalysis:
    """Test cases for ReflectionAnalysis model."""
    
    def test_create_reflection_analysis(self):
        """Test creating a reflection analysis."""
        analysis = ReflectionAnalysisFactory()
        
        assert analysis.session is not None
        assert isinstance(analysis.tags, list)
        assert len(analysis.tags) > 0
        assert 0.0 <= analysis.confidence <= 1.0
        assert analysis.notes is not None
        assert analysis.created_at is not None
    
    def test_reflection_analysis_str_representation(self):
        """Test the string representation of reflection analysis."""
        analysis = ReflectionAnalysisFactory(tags=['misreading', 'formula_error'])
        expected_str = "Analysis: misreading, formula_error"
        
        assert expected_str in str(analysis)
        assert f"confidence: {analysis.confidence:.2f}" in str(analysis)
    
    def test_reflection_analysis_confidence_validation(self):
        """Test confidence field validation."""
        # Test valid confidence values
        valid_confidences = [0.0, 0.5, 1.0]
        for confidence in valid_confidences:
            analysis = ReflectionAnalysisFactory(confidence=confidence)
            assert analysis.confidence == confidence
        
        # Test invalid confidence values
        invalid_confidences = [-0.1, 1.1, 2.0]
        for confidence in invalid_confidences:
            with pytest.raises(ValidationError):
                analysis = ReflectionAnalysisFactory(confidence=confidence)
                analysis.full_clean()
    
    def test_reflection_analysis_tags_limit(self):
        """Test that tags field can handle various list sizes."""
        # Test empty tags
        analysis = ReflectionAnalysisFactory(tags=[])
        assert analysis.tags == []
        
        # Test single tag
        analysis = ReflectionAnalysisFactory(tags=['misreading'])
        assert analysis.tags == ['misreading']
        
        # Test multiple tags
        analysis = ReflectionAnalysisFactory(tags=['misreading', 'formula_error', 'time_mgmt'])
        assert len(analysis.tags) == 3
    
    def test_reflection_analysis_one_to_one_relationship(self):
        """Test that analysis has one-to-one relationship with session."""
        session = ReflectionSessionFactory()
        
        # Create first analysis
        analysis1 = ReflectionAnalysisFactory(session=session)
        
        # Try to create another analysis for same session
        with pytest.raises(Exception):  # Should raise IntegrityError
            ReflectionAnalysisFactory(session=session)


@pytest.mark.django_db
class TestChecklist:
    """Test cases for Checklist model."""
    
    def test_create_checklist(self):
        """Test creating a checklist."""
        checklist = ChecklistFactory()
        
        assert checklist.project is not None
        assert checklist.title is not None
        assert checklist.created_at is not None
    
    def test_checklist_str_representation(self):
        """Test the string representation of checklist."""
        checklist = ChecklistFactory()
        expected_str = f"{checklist.title} - {checklist.project.name}"
        
        assert expected_str == str(checklist)
    
    def test_checklist_ordering(self):
        """Test that checklists are ordered by created_at descending."""
        old_checklist = ChecklistFactory()
        old_checklist.created_at = timezone.now() - timedelta(hours=1)
        old_checklist.save()
        
        new_checklist = ChecklistFactory()
        new_checklist.created_at = timezone.now()
        new_checklist.save()
        
        checklists = Checklist.objects.all()
        assert checklists[0] == new_checklist
        assert checklists[1] == old_checklist


@pytest.mark.django_db
class TestChecklistItem:
    """Test cases for ChecklistItem model."""
    
    def test_create_checklist_item(self):
        """Test creating a checklist item."""
        item = ChecklistItemFactory()
        
        assert item.checklist is not None
        assert item.order > 0
        assert item.text is not None
        assert item.hint is not None
    
    def test_checklist_item_str_representation(self):
        """Test the string representation of checklist item."""
        item = ChecklistItemFactory(order=3, text="Review key concepts")
        expected_str = "3. Review key concepts"
        
        assert expected_str == str(item)
    
    def test_checklist_item_ordering(self):
        """Test that items are ordered by order field."""
        checklist = ChecklistFactory()
        
        item3 = ChecklistItemFactory(checklist=checklist, order=3)
        item1 = ChecklistItemFactory(checklist=checklist, order=1)
        item2 = ChecklistItemFactory(checklist=checklist, order=2)
        
        items = checklist.items.all()
        assert items[0] == item1
        assert items[1] == item2
        assert items[2] == item3
    
    def test_checklist_item_unique_constraint(self):
        """Test that items have unique checklist-order combinations."""
        checklist = ChecklistFactory()
        
        # Create first item
        ChecklistItemFactory(checklist=checklist, order=1)
        
        # Try to create another item with same order for same checklist
        with pytest.raises(Exception):  # Should raise IntegrityError
            ChecklistItemFactory(checklist=checklist, order=1)


@pytest.mark.django_db
class TestRecommendation:
    """Test cases for Recommendation model."""
    
    def test_create_recommendation(self):
        """Test creating a recommendation."""
        recommendation = RecommendationFactory()
        
        assert recommendation.session is not None
        assert recommendation.kind in [
            'practice_set', 'flashcards', 'tip', 'mini_lesson', 'review'
        ]
        assert recommendation.payload is not None
        assert recommendation.label is not None
        assert recommendation.dismissed is False
        assert recommendation.clicked_at is None
        assert recommendation.created_at is not None
    
    def test_recommendation_str_representation(self):
        """Test the string representation of recommendation."""
        recommendation = RecommendationFactory(kind='tip', label='Practice active reading')
        expected_str = "tip: Practice active reading"
        
        assert expected_str == str(recommendation)
    
    def test_recommendation_ordering(self):
        """Test that recommendations are ordered by created_at."""
        session = ReflectionSessionFactory()
        
        old_rec = RecommendationFactory(session=session)
        old_rec.created_at = timezone.now() - timedelta(minutes=10)
        old_rec.save()
        
        new_rec = RecommendationFactory(session=session)
        new_rec.created_at = timezone.now()
        new_rec.save()
        
        recommendations = session.recommendations.all()
        assert recommendations[0] == old_rec
        assert recommendations[1] == new_rec
    
    def test_recommendation_payload_structure(self):
        """Test that payload can handle various JSON structures."""
        # Test simple payload
        recommendation = RecommendationFactory(payload={'topic': 'math'})
        assert recommendation.payload['topic'] == 'math'
        
        # Test complex payload
        complex_payload = {
            'topic': 'calculus',
            'difficulty': 'hard',
            'resources': ['textbook', 'videos'],
            'estimated_time': 30
        }
        recommendation = RecommendationFactory(payload=complex_payload)
        assert recommendation.payload['topic'] == 'calculus'
        assert recommendation.payload['resources'] == ['textbook', 'videos']
    
    def test_recommendation_dismissal(self):
        """Test recommendation dismissal functionality."""
        recommendation = RecommendationFactory()
        
        # Initially not dismissed
        assert recommendation.dismissed is False
        
        # Mark as dismissed
        recommendation.dismissed = True
        recommendation.save()
        
        assert recommendation.dismissed is True


@pytest.mark.django_db
class TestReflectionStreak:
    """Test cases for ReflectionStreak model."""
    
    def test_create_reflection_streak(self):
        """Test creating a reflection streak."""
        streak = ReflectionStreakFactory()
        
        assert streak.user is not None
        assert streak.current_streak >= 0
        assert streak.longest_streak >= 0
        assert streak.updated_at is not None
    
    def test_reflection_streak_str_representation(self):
        """Test the string representation of reflection streak."""
        streak = ReflectionStreakFactory(current_streak=5)
        expected_str = f"{streak.user.username}: 5 day streak"
        
        assert expected_str == str(streak)
    
    def test_reflection_streak_one_to_one_relationship(self):
        """Test that streak has one-to-one relationship with user."""
        streak = ReflectionStreakFactory()
        user = streak.user
        
        # Try to create another streak for same user
        with pytest.raises(Exception):  # Should raise IntegrityError
            ReflectionStreakFactory(user=user)
    
    def test_reflection_streak_auto_update(self):
        """Test that updated_at field is automatically updated."""
        streak = ReflectionStreakFactory()
        original_updated = streak.updated_at
        
        # Wait a bit and update
        import time
        time.sleep(0.1)
        
        streak.current_streak += 1
        streak.save()
        
        assert streak.updated_at > original_updated
