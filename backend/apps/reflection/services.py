import logging
from typing import List, Dict, Optional
from django.conf import settings
from django.utils import timezone

from .models import (
    ReflectionSession, ReflectionAnalysis, Recommendation, 
    Checklist, ChecklistItem
)

logger = logging.getLogger(__name__)


class ReflectionAnalysisService:
    """Service for analyzing reflection sessions and generating recommendations."""
    
    def analyze_session(self, session: ReflectionSession) -> Optional[ReflectionAnalysis]:
        """Analyze a reflection session and create analysis."""
        try:
            # Get all entries for the session
            entries = session.entries.all()
            if not entries.exists():
                logger.warning(f"No entries found for session {session.id}")
                return None
            
            # Combine all entry text for analysis
            combined_text = " ".join([f"{entry.key}: {entry.text}" for entry in entries])
            
            # Analyze using rule-based approach first, then fallback to LLM
            tags = self._rule_based_analysis(combined_text)
            confidence = 0.8  # High confidence for rule-based analysis
            
            # If rule-based analysis doesn't find enough tags, try LLM
            if len(tags) < 2:
                llm_tags = self._llm_analysis(combined_text)
                if llm_tags:
                    tags.extend(llm_tags)
                    confidence = 0.6  # Lower confidence for LLM analysis
            
            # Create analysis record
            analysis = ReflectionAnalysis.objects.create(
                session=session,
                tags=tags[:5],  # Limit to top 5 tags
                confidence=confidence,
                notes=f"Analyzed {len(entries)} reflection entries"
            )
            
            logger.info(f"Created analysis for session {session.id} with tags: {tags}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing session {session.id}: {str(e)}")
            return None
    
    def _rule_based_analysis(self, text: str) -> List[str]:
        """Rule-based analysis of reflection text."""
        text_lower = text.lower()
        tags = []
        
        # Define keyword patterns for different reflection themes
        patterns = {
            'misreading': ['misread', 'misunderstood', 'confused', 'unclear', 'vague'],
            'formula_error': ['formula', 'calculation', 'math', 'equation', 'computation'],
            'concept_link': ['connect', 'relationship', 'link', 'understand', 'grasp'],
            'time_mgmt': ['time', 'rushed', 'slow', 'pace', 'timing'],
            'study_environment': ['noise', 'distraction', 'environment', 'setting', 'place'],
            'focus_level': ['focus', 'concentration', 'attention', 'distracted', 'mind'],
            'confidence': ['confident', 'unsure', 'doubt', 'certain', 'clear'],
            'difficulty': ['hard', 'difficult', 'challenging', 'easy', 'simple']
        }
        
        for tag, keywords in patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                tags.append(tag)
        
        return tags
    
    def _llm_analysis(self, text: str) -> List[str]:
        """Use LLM for more sophisticated analysis."""
        try:
            # Import here to avoid circular imports
            from backend.apps.generation.services.api_client import AIClient
            
            ai_service = AIClient(model="gemini-2.0-flash")
            
            prompt = f"""
            Analyze this reflection text and identify the main learning challenges or themes.
            Return only a JSON array of 3-5 relevant tags from this list:
            ["misreading", "formula_error", "concept_link", "time_mgmt", "study_environment", 
             "focus_level", "confidence", "difficulty", "motivation", "strategy"]
            
            Reflection text: {text}
            
            Return format: ["tag1", "tag2", "tag3"]
            """
            
            messages = [{"role": "user", "content": prompt}]
            response = ai_service.get_response(messages)
            
            # Try to parse JSON response
            import json
            try:
                tags = json.loads(response.strip())
                if isinstance(tags, list):
                    return tags[:5]  # Limit to 5 tags
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse LLM response as JSON: {response}")
                
        except Exception as e:
            logger.error(f"Error in LLM analysis: {str(e)}")
        
        return []
    
    def generate_recommendations(self, session: ReflectionSession, analysis: ReflectionAnalysis) -> List[Recommendation]:
        """Generate actionable recommendations based on analysis."""
        recommendations = []
        
        try:
            # Generate recommendations based on tags
            for tag in analysis.tags:
                recommendation = self._create_recommendation_for_tag(session, tag)
                if recommendation:
                    recommendations.append(recommendation)
            
            # Add general recommendations if we don't have enough
            if len(recommendations) < 2:
                general_rec = self._create_general_recommendation(session)
                if general_rec:
                    recommendations.append(general_rec)
            
            logger.info(f"Generated {len(recommendations)} recommendations for session {session.id}")
            
        except Exception as e:
            logger.error(f"Error generating recommendations for session {session.id}: {str(e)}")
        
        return recommendations
    
    def _create_recommendation_for_tag(self, session: ReflectionSession, tag: str) -> Optional[Recommendation]:
        """Create a specific recommendation based on a tag."""
        tag_recommendations = {
            'misreading': {
                'kind': 'tip',
                'label': 'Practice active reading techniques',
                'payload': {
                    'topic': 'reading_comprehension',
                    'tip': 'Try reading questions first, then scan for relevant information'
                }
            },
            'formula_error': {
                'kind': 'practice_set',
                'label': 'Practice similar calculations',
                'payload': {
                    'topic': 'mathematical_accuracy',
                    'difficulty': 'medium'
                }
            },
            'concept_link': {
                'kind': 'mini_lesson',
                'label': 'Review concept relationships',
                'payload': {
                    'topic': 'conceptual_understanding',
                    'format': 'mind_map'
                }
            },
            'time_mgmt': {
                'kind': 'tip',
                'label': 'Improve time management',
                'payload': {
                    'topic': 'study_efficiency',
                    'tip': 'Set specific time limits for each question type'
                }
            },
            'study_environment': {
                'kind': 'tip',
                'label': 'Optimize your study space',
                'payload': {
                    'topic': 'environment_optimization',
                    'tip': 'Find a quiet, well-lit space with minimal distractions'
                }
            }
        }
        
        if tag in tag_recommendations:
            rec_data = tag_recommendations[tag]
            return Recommendation.objects.create(
                session=session,
                kind=rec_data['kind'],
                label=rec_data['label'],
                payload=rec_data['payload']
            )
        
        return None
    
    def _create_general_recommendation(self, session: ReflectionSession) -> Optional[Recommendation]:
        """Create a general recommendation for the session."""
        return Recommendation.objects.create(
            session=session,
            kind='review',
            label='Review your study materials',
            payload={
                'topic': 'general_review',
                'suggestion': 'Go back to the source material and identify key concepts'
            }
        )


class ChecklistExtractionService:
    """Service for extracting checklists from uploaded content."""
    
    def extract_checklist(self, project, source_ref: str = None) -> Optional[Dict]:
        """Extract a checklist from project content using AI."""
        try:
            # Import here to avoid circular imports
            from backend.apps.generation.services.api_client import AIClient
            
            ai_service = AIClient(model="gemini-2.0-flash")
            
            # Create a study checklist using AI
            prompt = f"""
            Create a study checklist for the project: {project.name}
            
            Generate 5-8 actionable checklist items that would help someone study this topic effectively.
            Each item should be specific and actionable.
            
            Return format:
            {{
                "title": "Study Checklist for [Topic]",
                "items": [
                    "Item 1 description",
                    "Item 2 description",
                    "Item 3 description"
                ]
            }}
            """
            
            messages = [{"role": "user", "content": prompt}]
            response = ai_service.get_response(messages)
            
            # Try to parse JSON response
            import json
            try:
                checklist_data = json.loads(response.strip())
                if isinstance(checklist_data, dict) and 'title' in checklist_data and 'items' in checklist_data:
                    return checklist_data
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse checklist response as JSON: {response}")
            
            # Fallback to generic checklist
            return self._create_fallback_checklist(project)
            
        except Exception as e:
            logger.error(f"Error extracting checklist: {str(e)}")
            return self._create_fallback_checklist(project)
    
    def _create_fallback_checklist(self, project) -> Dict:
        """Create a fallback checklist when AI extraction fails."""
        return {
            'title': f'Study Checklist for {project.name}',
            'items': [
                'Review course objectives and learning outcomes',
                'Identify key concepts and definitions',
                'Practice with sample problems or questions',
                'Create summary notes of main topics',
                'Test your understanding with self-assessment',
                'Review any areas of difficulty',
                'Plan next study session goals'
            ]
        }
