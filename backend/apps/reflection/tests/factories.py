import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from ..models import (
    ReflectionSession, ReflectionEntry, ReflectionAnalysis,
    Checklist, ChecklistItem, Recommendation, ReflectionStreak
)
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.projects.tests.factories import ProjectFactory

User = get_user_model()


class ReflectionSessionFactory(DjangoModelFactory):
    """Factory for creating ReflectionSession instances."""
    
    class Meta:
        model = ReflectionSession
    
    user = factory.SubFactory(CustomUserFactory)
    project = factory.SubFactory(ProjectFactory)
    source = factory.Iterator(['quiz', 'study', 'other'])
    source_ref = factory.Sequence(lambda n: f'ref_{n}')
    started_at = factory.LazyFunction(timezone.now)
    ended_at = None
    duration_seconds = 0


class ReflectionEntryFactory(DjangoModelFactory):
    """Factory for creating ReflectionEntry instances."""
    
    class Meta:
        model = ReflectionEntry
    
    session = factory.SubFactory(ReflectionSessionFactory)
    key = factory.Iterator([
        'what_was_hard', 'misapplied_rule', 'what_went_well',
        'next_time', 'time_management', 'concept_understanding',
        'study_environment', 'focus_level'
    ])
    text = factory.Faker('sentence', nb_words=8)


class ReflectionAnalysisFactory(DjangoModelFactory):
    """Factory for creating ReflectionAnalysis instances."""
    
    class Meta:
        model = ReflectionAnalysis
    
    session = factory.SubFactory(ReflectionSessionFactory)
    tags = factory.List([
        factory.Iterator([
            'misreading', 'formula_error', 'concept_link', 'time_mgmt',
            'study_environment', 'focus_level', 'confidence', 'difficulty'
        ])
        for _ in range(3)
    ])
    confidence = factory.Faker('pyfloat', left_digits=1, right_digits=2, min_value=0.0, max_value=1.0)
    notes = factory.Faker('text', max_nb_chars=200)


class ChecklistFactory(DjangoModelFactory):
    """Factory for creating Checklist instances."""
    
    class Meta:
        model = Checklist
    
    project = factory.SubFactory(ProjectFactory)
    source_ref = factory.Sequence(lambda n: f'checklist_{n}')
    title = factory.Faker('sentence', nb_words=6)


class ChecklistItemFactory(DjangoModelFactory):
    """Factory for creating ChecklistItem instances."""
    
    class Meta:
        model = ChecklistItem
    
    checklist = factory.SubFactory(ChecklistFactory)
    order = factory.Sequence(lambda n: n + 1)
    text = factory.Faker('sentence', nb_words=8)
    hint = factory.Faker('sentence', nb_words=5)


class RecommendationFactory(DjangoModelFactory):
    """Factory for creating Recommendation instances."""
    
    class Meta:
        model = Recommendation
    
    session = factory.SubFactory(ReflectionSessionFactory)
    kind = factory.Iterator([
        'practice_set', 'flashcards', 'tip', 'mini_lesson', 'review'
    ])
    payload = factory.Dict({
        'topic': factory.Faker('word'),
        'difficulty': factory.Iterator(['easy', 'medium', 'hard'])
    })
    label = factory.Faker('sentence', nb_words=6)
    dismissed = False
    clicked_at = None


class ReflectionStreakFactory(DjangoModelFactory):
    """Factory for creating ReflectionStreak instances."""
    
    class Meta:
        model = ReflectionStreak
    
    user = factory.SubFactory(CustomUserFactory)
    current_streak = factory.Faker('random_int', min=0, max=30)
    longest_streak = factory.Faker('random_int', min=0, max=100)
    last_reflection_date = factory.LazyFunction(lambda: timezone.now().date() - timedelta(days=1))


class CompletedReflectionSessionFactory(ReflectionSessionFactory):
    """Factory for creating completed reflection sessions."""
    
    ended_at = factory.LazyFunction(timezone.now)
    duration_seconds = factory.Faker('random_int', min=60, max=300)


class ReflectionSessionWithEntriesFactory(CompletedReflectionSessionFactory):
    """Factory for creating reflection sessions with entries."""
    
    @factory.post_generation
    def entries(self, create, extracted, **kwargs):
        if not create:
            return
        
        # Create 3-5 reflection entries
        num_entries = kwargs.get('num_entries', 4)
        for i in range(num_entries):
            ReflectionEntryFactory(session=self)


class ReflectionSessionWithAnalysisFactory(ReflectionSessionWithEntriesFactory):
    """Factory for creating reflection sessions with analysis."""
    
    @factory.post_generation
    def analysis(self, create, extracted, **kwargs):
        if not create:
            return
        
        ReflectionAnalysisFactory(session=self)


class ReflectionSessionWithRecommendationsFactory(ReflectionSessionWithAnalysisFactory):
    """Factory for creating reflection sessions with recommendations."""
    
    @factory.post_generation
    def recommendations(self, create, extracted, **kwargs):
        if not create:
            return
        
        # Create 2-3 recommendations
        num_recommendations = kwargs.get('num_recommendations', 2)
        for i in range(num_recommendations):
            RecommendationFactory(session=self)
