"""
Diagnostic model factories for testing.
"""

import factory
from factory.django import DjangoModelFactory
from backend.apps.generation.models import (
    DiagnosticSession, DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics
)
from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.projects.tests.factories import ProjectFactory


class DiagnosticSessionFactory(DjangoModelFactory):
    """
    Factory for creating DiagnosticSession instances.
    """
    
    class Meta:
        model = DiagnosticSession
    
    project = factory.SubFactory(ProjectFactory)
    topic = factory.Faker('sentence', nb_words=3)
    status = 'DRAFT'
    delivery_mode = 'DEFERRED_FEEDBACK'
    max_questions = 3
    questions_order = 'SCRAMBLED'
    created_by = factory.SelfAttribute('project.owner')
    variant = 'A'
    seed = factory.Faker('random_int', min=1000, max=9999)


class DiagnosticQuestionFactory(DjangoModelFactory):
    """
    Factory for creating DiagnosticQuestion instances.
    """
    
    class Meta:
        model = DiagnosticQuestion
    
    session = factory.SubFactory(DiagnosticSessionFactory)
    type = factory.Iterator(['MCQ', 'SHORT_ANSWER', 'PRINCIPLE'])
    text = factory.Faker('sentence', nb_words=8)
    explanation = factory.Faker('paragraph')
    difficulty = factory.Faker('random_int', min=1, max=5)
    bloom_level = factory.Iterator(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'])
    concept_id = factory.Faker('word')
    tags = factory.List([factory.Faker('word') for _ in range(2)])
    
    @factory.post_generation
    def setup_question_type(self, create, extracted, **kwargs):
        """Set up question-specific fields based on type."""
        if not create:
            return
        
        if self.type == 'MCQ':
            self.choices = ['Option A', 'Option B', 'Option C', 'Option D']
            self.correct_choice_index = 1
        else:
            self.acceptable_answers = ['correct answer', 'alternative answer']


class DiagnosticResponseFactory(DjangoModelFactory):
    """
    Factory for creating DiagnosticResponse instances.
    """
    
    class Meta:
        model = DiagnosticResponse
    
    session = factory.SubFactory(DiagnosticSessionFactory)
    question = factory.SubFactory(DiagnosticQuestionFactory, session=factory.SelfAttribute('..session'))
    user = factory.SubFactory(CustomUserFactory)
    confidence = factory.Faker('random_int', min=0, max=100)
    latency_ms = factory.Faker('random_int', min=1000, max=30000)
    attempt_no = 1
    meta = factory.Dict({'device': 'desktop', 'browser': 'chrome'})


class MCQResponseFactory(DiagnosticResponseFactory):
    """
    Factory for creating MCQ responses.
    """
    
    question = factory.SubFactory(
        DiagnosticQuestionFactory, 
        session=factory.SelfAttribute('..session'),
        type='MCQ',
        choices=['Option A', 'Option B', 'Option C', 'Option D'],
        correct_choice_index=1
    )
    selected_choice_index = factory.Faker('random_int', min=0, max=3)
    answer_text = None


class ShortAnswerResponseFactory(DiagnosticResponseFactory):
    """
    Factory for creating short answer responses.
    """
    
    question = factory.SubFactory(
        DiagnosticQuestionFactory, 
        session=factory.SelfAttribute('..session'),
        type='SHORT_ANSWER'
    )
    answer_text = factory.Faker('sentence', nb_words=5)
    selected_choice_index = None


class PrincipleResponseFactory(DiagnosticResponseFactory):
    """
    Factory for creating principle responses.
    """
    
    question = factory.SubFactory(
        DiagnosticQuestionFactory, 
        session=factory.SelfAttribute('..session'),
        type='PRINCIPLE'
    )
    answer_text = factory.Faker('sentence', nb_words=5)
    selected_choice_index = None


class DiagnosticAnalyticsFactory(DjangoModelFactory):
    """
    Factory for creating DiagnosticAnalytics instances.
    """
    
    class Meta:
        model = DiagnosticAnalytics
    
    session = factory.SubFactory(DiagnosticSessionFactory)
    total_participants = factory.Faker('random_int', min=1, max=50)
    participation_rate = factory.Faker('pyfloat', min_value=0.1, max_value=1.0)
    average_score = factory.Faker('pyfloat', min_value=0.0, max_value=1.0)
    median_confidence = factory.Faker('pyfloat', min_value=0.0, max_value=100.0)
    overconfidence_rate = factory.Faker('pyfloat', min_value=0.0, max_value=1.0)
    brier_score = factory.Faker('pyfloat', min_value=0.0, max_value=1.0)
    concept_analytics = factory.Dict({
        'concept_1': {
            'total_responses': 10,
            'correct_responses': 7,
            'avg_confidence': 75.0,
            'avg_score': 0.7,
            'accuracy': 0.7,
            'avg_brier': 0.15
        }
    })
    top_misconceptions = factory.List([
        factory.Dict({
            'concept': 'concept_1',
            'accuracy': 0.7,
            'total_responses': 10,
            'avg_confidence': 75.0
        })
    ])
    talking_points = factory.List([
        factory.Dict({
            'type': 'performance',
            'message': 'Students struggled with concept_1',
            'priority': 'high'
        })
    ])
