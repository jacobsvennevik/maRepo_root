import pytest
import json
from unittest.mock import patch, MagicMock
from django.utils import timezone

from ..services import ReflectionAnalysisService, ChecklistExtractionService
from ..models import ReflectionSession, ReflectionAnalysis, Recommendation
from .factories import (
    ReflectionSessionFactory, ReflectionEntryFactory,
    ProjectFactory, CustomUserFactory
)


@pytest.mark.django_db
class TestReflectionAnalysisService:
    """Test cases for ReflectionAnalysisService."""
    
    def test_analyze_session_with_entries(self):
        """Test analyzing a session with reflection entries."""
        # Create a session with entries
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        session = ReflectionSessionFactory(user=user, project=project)
        
        # Add reflection entries
        ReflectionEntryFactory(
            session=session,
            key='what_was_hard',
            text='The math formulas were confusing and I misread the questions'
        )
        ReflectionEntryFactory(
            session=session,
            key='what_went_well',
            text='I understood the basic concepts and managed my time well'
        )
        
        service = ReflectionAnalysisService()
        analysis = service.analyze_session(session)
        
        assert analysis is not None
        assert analysis.session == session
        assert isinstance(analysis.tags, list)
        assert len(analysis.tags) > 0
        assert analysis.confidence > 0.0
        assert 'misreading' in analysis.tags or 'formula_error' in analysis.tags
    
    def test_analyze_session_without_entries(self):
        """Test analyzing a session without entries."""
        session = ReflectionSessionFactory()
        
        service = ReflectionAnalysisService()
        analysis = service.analyze_session(session)
        
        assert analysis is None
    
    def test_rule_based_analysis(self):
        """Test rule-based analysis functionality."""
        service = ReflectionAnalysisService()
        
        # Test text with clear patterns
        text = "I misread the question and made formula errors in calculations"
        tags = service._rule_based_analysis(text)
        
        assert 'misreading' in tags
        assert 'formula_error' in tags
        assert len(tags) >= 2
    
    def test_rule_based_analysis_no_patterns(self):
        """Test rule-based analysis with no matching patterns."""
        service = ReflectionAnalysisService()
        
        text = "This is a completely unrelated text with no reflection patterns"
        tags = service._rule_based_analysis(text)
        
        assert isinstance(tags, list)
        assert len(tags) == 0
    
    def test_rule_based_analysis_case_insensitive(self):
        """Test that rule-based analysis is case insensitive."""
        service = ReflectionAnalysisService()
        
        text = "I MISREAD the question and made FORMULA ERRORS"
        tags = service._rule_based_analysis(text)
        
        assert 'misreading' in tags
        assert 'formula_error' in tags
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_llm_analysis_success(self, mock_ai_service):
        """Test successful LLM analysis."""
        mock_instance = MagicMock()
        mock_instance.get_response.return_value = '["misreading", "time_mgmt", "confidence"]'
        mock_ai_service.return_value = mock_instance
        
        service = ReflectionAnalysisService()
        text = "Some reflection text"
        tags = service._llm_analysis(text)
        
        assert tags == ["misreading", "time_mgmt", "confidence"]
        mock_instance.get_response.assert_called_once()
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_llm_analysis_invalid_json(self, mock_ai_service):
        """Test LLM analysis with invalid JSON response."""
        mock_instance = MagicMock()
        mock_instance.get_response.return_value = "Invalid JSON response"
        mock_ai_service.return_value = mock_instance
        
        service = ReflectionAnalysisService()
        text = "Some reflection text"
        tags = service._llm_analysis(text)
        
        assert tags == []
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_llm_analysis_exception(self, mock_ai_service):
        """Test LLM analysis when an exception occurs."""
        mock_ai_service.side_effect = Exception("AI service error")
        
        service = ReflectionAnalysisService()
        text = "Some reflection text"
        tags = service._llm_analysis(text)
        
        assert tags == []
    
    def test_generate_recommendations(self):
        """Test generating recommendations from analysis."""
        # Create a session with analysis
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        session = ReflectionSessionFactory(user=user, project=project)
        
        # Create analysis with tags
        analysis = ReflectionAnalysis.objects.create(
            session=session,
            tags=['misreading', 'formula_error'],
            confidence=0.8,
            notes='Test analysis'
        )
        
        service = ReflectionAnalysisService()
        recommendations = service.generate_recommendations(session, analysis)
        
        assert len(recommendations) >= 2
        assert all(isinstance(rec, Recommendation) for rec in recommendations)
        
        # Check that recommendations match the tags
        recommendation_kinds = [rec.kind for rec in recommendations]
        assert 'tip' in recommendation_kinds or 'practice_set' in recommendation_kinds
    
    def test_generate_recommendations_with_few_tags(self):
        """Test generating recommendations when analysis has few tags."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        session = ReflectionSessionFactory(user=user, project=project)
        
        # Create analysis with only one tag
        analysis = ReflectionAnalysis.objects.create(
            session=session,
            tags=['misreading'],
            confidence=0.8,
            notes='Test analysis'
        )
        
        service = ReflectionAnalysisService()
        recommendations = service.generate_recommendations(session, analysis)
        
        # Should have at least 2 recommendations (one for tag + general)
        assert len(recommendations) >= 2
    
    def test_create_recommendation_for_tag(self):
        """Test creating specific recommendations for tags."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        session = ReflectionSessionFactory(user=user, project=project)
        
        service = ReflectionAnalysisService()
        
        # Test misreading tag
        recommendation = service._create_recommendation_for_tag(session, 'misreading')
        assert recommendation is not None
        assert recommendation.kind == 'tip'
        assert 'reading' in recommendation.label.lower()
        
        # Test formula_error tag
        recommendation = service._create_recommendation_for_tag(session, 'formula_error')
        assert recommendation is not None
        assert recommendation.kind == 'practice_set'
        assert 'calculation' in recommendation.label.lower()
        
        # Test unknown tag
        recommendation = service._create_recommendation_for_tag(session, 'unknown_tag')
        assert recommendation is None
    
    def test_create_general_recommendation(self):
        """Test creating general recommendations."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        session = ReflectionSessionFactory(user=user, project=project)
        
        service = ReflectionAnalysisService()
        recommendation = service._create_general_recommendation(session)
        
        assert recommendation is not None
        assert recommendation.kind == 'review'
        assert 'study materials' in recommendation.label.lower()
        assert 'general_review' in recommendation.payload['topic']


@pytest.mark.django_db
class TestChecklistExtractionService:
    """Test cases for ChecklistExtractionService."""
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_extract_checklist_success(self, mock_ai_service):
        """Test successful checklist extraction."""
        mock_ai_instance = MagicMock()
        mock_ai_instance.get_response.return_value = json.dumps({
            'title': 'Study Checklist for Mathematics',
            'items': [
                'Review basic formulas',
                'Practice calculations',
                'Understand concepts'
            ]
        })
        mock_ai_service.return_value = mock_ai_instance
        
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        service = ChecklistExtractionService()
        result = service.extract_checklist(project)
        
        assert result is not None
        assert 'title' in result
        assert 'items' in result
        assert 'Mathematics' in result['title']
        assert len(result['items']) == 3
        assert 'Review basic formulas' in result['items']
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_extract_checklist_invalid_json(self, mock_ai_service):
        """Test checklist extraction with invalid JSON response."""
        mock_ai_instance = MagicMock()
        mock_ai_instance.get_response.return_value = "Invalid JSON response"
        mock_ai_service.return_value = mock_ai_instance
        
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        service = ChecklistExtractionService()
        result = service.extract_checklist(project)
        
        # Should fall back to generic checklist
        assert result is not None
        assert 'title' in result
        assert 'items' in result
        assert project.name in result['title']
        assert len(result['items']) > 0
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_extract_checklist_missing_fields(self, mock_ai_service):
        """Test checklist extraction with missing required fields."""
        mock_ai_instance = MagicMock()
        mock_ai_instance.get_response.return_value = json.dumps({
            'title': 'Study Checklist',
            # Missing 'items' field
        })
        mock_ai_service.return_value = mock_ai_instance
        
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        service = ChecklistExtractionService()
        result = service.extract_checklist(project)
        
        # Should fall back to generic checklist
        assert result is not None
        assert 'title' in result
        assert 'items' in result
    
    @patch('backend.apps.generation.services.api_client.AIClient')
    def test_extract_checklist_exception(self, mock_ai_service):
        """Test checklist extraction when an exception occurs."""
        mock_ai_service.side_effect = Exception("AI service error")
        
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        service = ChecklistExtractionService()
        result = service.extract_checklist(project)
        
        # Should fall back to generic checklist
        assert result is not None
        assert 'title' in result
        assert 'items' in result
    
    def test_create_fallback_checklist(self):
        """Test creating a fallback checklist."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        
        service = ChecklistExtractionService()
        result = service._create_fallback_checklist(project)
        
        assert result is not None
        assert 'title' in result
        assert 'items' in result
        assert project.name in result['title']
        assert len(result['items']) == 7  # Should have 7 default items
        
        # Check specific items
        expected_items = [
            'Review course objectives and learning outcomes',
            'Identify key concepts and definitions',
            'Practice with sample problems or questions',
            'Create summary notes of main topics',
            'Test your understanding with self-assessment',
            'Review any areas of difficulty',
            'Plan next study session goals'
        ]
        
        for item in expected_items:
            assert item in result['items']
    
    def test_extract_checklist_with_source_ref(self):
        """Test checklist extraction with source reference."""
        user = CustomUserFactory()
        project = ProjectFactory(owner=user)
        source_ref = 'document_123'
        
        with patch('backend.apps.generation.services.api_client.AIClient') as mock_ai_service:
            mock_instance = MagicMock()
            mock_instance.get_response.return_value = json.dumps({
                'title': 'Study Checklist',
                'items': ['Item 1', 'Item 2']
            })
            mock_ai_service.return_value = mock_instance
            
            service = ChecklistExtractionService()
            result = service.extract_checklist(project, source_ref)
            
            assert result is not None
            # The source_ref should be used in the prompt
            mock_instance.get_response.assert_called_once()
            call_args = mock_instance.get_response.call_args[0][0]
            # Check that the project name is in the content of the first message
            assert project.name in call_args[0]['content']
