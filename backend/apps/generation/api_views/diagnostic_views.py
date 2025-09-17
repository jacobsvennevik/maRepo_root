"""
Diagnostic-related API views.

This module contains all diagnostic-related ViewSets and API views,
including session management, response handling, and analytics.
"""

import csv
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse

from ..models import (
    DiagnosticSession, DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics
)
from ..serializers import (
    DiagnosticSessionSerializer, DiagnosticQuestionSerializer, 
    DiagnosticResponseSerializer, DiagnosticAnalyticsSerializer,
    DiagnosticSessionCreateSerializer, DiagnosticSessionStartSerializer,
    DiagnosticSessionResultSerializer, DiagnosticGenerationRequestSerializer
)
from ..services.diagnostic_generator import DiagnosticGenerator
from ..utils.response_helpers import create_error_response, create_success_response


class DiagnosticSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for diagnostic sessions."""
    
    queryset = DiagnosticSession.objects.all()
    serializer_class = DiagnosticSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter sessions by user's projects."""
        user = self.request.user
        return DiagnosticSession.objects.filter(project__owner=user)
    
    def perform_create(self, serializer):
        """Set created_by to the authenticated user."""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        """Get today's open diagnostic sessions for a project."""
        project_id = request.query_params.get('project')
        if not project_id:
            return create_error_response('project parameter required', status.HTTP_400_BAD_REQUEST)
        
        sessions = self.get_queryset().filter(
            project_id=project_id,
            status='OPEN'
        )
        
        # Filter by current time constraints
        now = timezone.now()
        open_sessions = []
        for session in sessions:
            if session.is_open:
                open_sessions.append(session)
        
        serializer = self.get_serializer(open_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='start')
    def start_session(self, request, pk=None):
        """Start a diagnostic session and return questions."""
        session = self.get_object()
        
        if not session.is_open:
            return create_error_response('Session is not open', status.HTTP_400_BAD_REQUEST)
        
        # Check if user already started this session
        existing_response = DiagnosticResponse.objects.filter(
            session=session,
            user=request.user
        ).first()
        
        if existing_response:
            return create_error_response('User already started this session', status.HTTP_400_BAD_REQUEST)
        
        # Get questions (scrambled if configured)
        questions = session.questions.all()
        if session.questions_order == 'SCRAMBLED':
            # Use seed for consistent scrambling
            import random
            random.seed(session.seed)
            questions = list(questions)
            random.shuffle(questions)
        
        # Return questions without answers
        question_data = []
        for question in questions:
            q_data = DiagnosticQuestionSerializer(question).data
            if question.type == 'MCQ':
                # Don't include correct answer
                q_data.pop('correct_choice_index', None)
            q_data.pop('explanation', None)  # Don't show explanation yet
            
            question_data.append(q_data)
        
        return Response({
            'session_id': str(session.id),
            'questions': question_data,
            'time_limit_sec': session.time_limit_sec,
            'delivery_mode': session.delivery_mode
        })
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete_session(self, request, pk=None):
        """Complete a diagnostic session and show results."""
        session = self.get_object()
        
        # Get user's responses
        responses = DiagnosticResponse.objects.filter(
            session=session,
            user=request.user
        )
        
        if not responses.exists():
            return create_error_response('No responses found for this session', status.HTTP_400_BAD_REQUEST)
        
        # Show feedback based on delivery mode
        if session.delivery_mode == 'IMMEDIATE':
            # Show immediate feedback
            response_data = DiagnosticResponseSerializer(responses, many=True).data
            for resp_data in response_data:
                question = DiagnosticQuestion.objects.get(id=resp_data['question'])
                resp_data['correct_answer'] = question.get_correct_answer()
                resp_data['explanation'] = question.explanation
        else:
            # Deferred feedback - don't show answers yet
            response_data = DiagnosticResponseSerializer(responses, many=True).data
        
        # Calculate session analytics
        total_questions = session.questions.count()
        correct_answers = responses.filter(is_correct=True).count()
        accuracy = correct_answers / total_questions if total_questions > 0 else 0
        
        # Get or create analytics
        analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
        if not created:
            analytics.update_analytics()
        
        return Response({
            'session': DiagnosticSessionSerializer(session).data,
            'responses': response_data,
            'analytics': {
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'accuracy': accuracy,
                'session_analytics': DiagnosticAnalyticsSerializer(analytics).data
            }
        })


class DiagnosticResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for diagnostic responses."""
    
    queryset = DiagnosticResponse.objects.all()
    serializer_class = DiagnosticResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter responses by user."""
        return DiagnosticResponse.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a diagnostic response."""
        # Add user to request data
        request.data['user'] = request.user.id
        
        # Set started_at if not provided
        if 'started_at' not in request.data:
            request.data['started_at'] = timezone.now()
        
        return super().create(request, *args, **kwargs)


class DiagnosticGenerationView(APIView):
    """API view for generating diagnostic sessions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate a new diagnostic session."""
        serializer = DiagnosticGenerationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check for test mode header
            mock_mode = request.headers.get('X-Test-Mode') == 'true'
            
            # Generate diagnostic using AI
            generator = DiagnosticGenerator()
            session = generator.generate_diagnostic(
                project_id=serializer.validated_data['project'],
                topic=serializer.validated_data.get('topic'),
                source_ids=serializer.validated_data.get('source_ids'),
                question_mix=serializer.validated_data.get('question_mix'),
                difficulty=serializer.validated_data['difficulty'],
                delivery_mode=serializer.validated_data['delivery_mode'],
                max_questions=serializer.validated_data['max_questions'],
                mock_mode=mock_mode
            )
            
            # Return the generated session
            session_serializer = DiagnosticSessionSerializer(session)
            return Response(session_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return create_error_response(f'Failed to generate diagnostic: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


class QuizGenerationView(APIView):
    """API view for generating quiz sessions with different quiz types."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate a new quiz session."""
        serializer = DiagnosticGenerationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check for test mode header
            mock_mode = request.headers.get('X-Test-Mode') == 'true'
            
            # Extract quiz-specific parameters
            quiz_type = request.data.get('quiz_type', 'formative')
            difficulty = request.data.get('difficulty', 'medium')
            
            # Generate quiz using AI
            generator = DiagnosticGenerator()
            session = generator.generate_quiz(
                project_id=serializer.validated_data['project'],
                topic=serializer.validated_data.get('topic', 'General Knowledge'),
                quiz_type=quiz_type,
                source_ids=serializer.validated_data.get('source_ids'),
                difficulty=difficulty,
                max_questions=serializer.validated_data['max_questions'],
                mock_mode=mock_mode
            )
            
            # Return the generated session
            session_serializer = DiagnosticSessionSerializer(session)
            return Response(session_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return create_error_response(f'Failed to generate quiz: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


class DiagnosticAnalyticsView(APIView):
    """API view for diagnostic analytics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, session_id):
        """Get analytics for a diagnostic session."""
        session = get_object_or_404(DiagnosticSession, id=session_id)
        
        # Check permissions
        if session.project.owner != request.user:
            return create_error_response('Access denied', status.HTTP_403_FORBIDDEN)
        
        # Get or create analytics
        analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
        if not created:
            analytics.update_analytics()
        
        serializer = DiagnosticAnalyticsSerializer(analytics)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='export')
    def export_analytics(self, request, session_id):
        """Export analytics to CSV/JSON."""
        session = get_object_or_404(DiagnosticSession, id=session_id)
        
        # Check permissions
        if session.project.owner != request.user:
            return create_error_response('Access denied', status.HTTP_403_FORBIDDEN)
        
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            # Generate CSV export
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="diagnostic_{session_id}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Question', 'Type', 'Concept', 'Correct', 'Incorrect', 'Accuracy', 'Avg Confidence'])
            
            # Get analytics
            analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
            if not created:
                analytics.update_analytics()
            
            for concept, data in analytics.concept_analytics.items():
                writer.writerow([
                    concept,
                    'Mixed',
                    concept,
                    data['correct_responses'],
                    data['total_responses'] - data['correct_responses'],
                    f"{data['accuracy']:.1%}",
                    f"{data['avg_confidence']:.1f}"
                ])
            
            return response
        
        else:
            # Return JSON
            analytics, created = DiagnosticAnalytics.objects.get_or_create(session=session)
            if not created:
                analytics.update_analytics()
            
            serializer = DiagnosticAnalyticsSerializer(analytics)
            return Response(serializer.data)
