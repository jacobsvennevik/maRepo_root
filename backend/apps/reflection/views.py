from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404

from .models import (
    ReflectionSession, ReflectionEntry, ReflectionAnalysis, 
    Checklist, ChecklistItem, Recommendation, ReflectionStreak
)
from .serializers import (
    ReflectionSessionSerializer, ReflectionSessionCreateSerializer,
    ReflectionEntrySerializer, ReflectionEntryCreateSerializer,
    ReflectionAnalysisSerializer, RecommendationSerializer,
    ChecklistSerializer, ReflectionStreakSerializer, ReflectionSummarySerializer
)
from .services import ReflectionAnalysisService, ChecklistExtractionService


class ReflectionSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for reflection sessions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter sessions by the current user."""
        return ReflectionSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return ReflectionSessionCreateSerializer
        return ReflectionSessionSerializer
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a reflection session as complete and trigger analysis."""
        session = self.get_object()
        
        if session.ended_at:
            return Response(
                {'error': 'Session already completed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate duration
        duration = (timezone.now() - session.started_at).total_seconds()
        session.duration_seconds = int(duration)
        session.ended_at = timezone.now()
        session.save()
        
        # Trigger AI analysis
        analysis_service = ReflectionAnalysisService()
        analysis = analysis_service.analyze_session(session)
        
        # Generate recommendations
        recommendations = analysis_service.generate_recommendations(session, analysis)
        
        # Update streak
        self._update_reflection_streak(session.user)
        
        return Response({
            'message': 'Session completed successfully',
            'duration_seconds': session.duration_seconds,
            'analysis_id': analysis.id if analysis else None,
            'recommendations_count': len(recommendations)
        })
    
    @action(detail=True, methods=['post'])
    def add_entry(self, request, pk=None):
        """Add a reflection entry to the session."""
        session = self.get_object()
        
        if session.ended_at:
            return Response(
                {'error': 'Cannot add entries to completed session'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReflectionEntryCreateSerializer(
            data=request.data,
            context={'session_id': session.id}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_reflection_streak(self, user):
        """Update the user's reflection streak."""
        streak, created = ReflectionStreak.objects.get_or_create(user=user)
        
        today = timezone.now().date()
        
        if not streak.last_reflection_date:
            # First reflection
            streak.current_streak = 1
            streak.longest_streak = 1
            streak.last_reflection_date = today
        elif streak.last_reflection_date == today:
            # Already reflected today
            pass
        elif streak.last_reflection_date == today - timedelta(days=1):
            # Consecutive day
            streak.current_streak += 1
            streak.last_reflection_date = today
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
        else:
            # Streak broken
            streak.current_streak = 1
            streak.last_reflection_date = today
        
        streak.save()


class ReflectionEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for reflection entries."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReflectionEntrySerializer
    
    def get_queryset(self):
        """Filter entries by sessions owned by the current user."""
        return ReflectionEntry.objects.filter(session__user=self.request.user)


class ChecklistViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for checklists."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChecklistSerializer
    
    def get_queryset(self):
        """Filter checklists by projects the user has access to."""
        return Checklist.objects.filter(project__owner=self.request.user)
    
    @action(detail=False, methods=['post'])
    def extract_from_content(self, request):
        """Extract checklist from uploaded content using AI."""
        project_id = request.data.get('project_id')
        source_ref = request.data.get('source_ref')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user has access to the project
        project = get_object_or_404(
            request.user.projects.all(), 
            id=project_id
        )
        
        # Extract checklist using AI service
        extraction_service = ChecklistExtractionService()
        checklist_data = extraction_service.extract_checklist(project, source_ref)
        
        if checklist_data:
            # Create checklist and items
            checklist = Checklist.objects.create(
                project=project,
                source_ref=source_ref,
                title=checklist_data['title']
            )
            
            for i, item_text in enumerate(checklist_data['items'], 1):
                ChecklistItem.objects.create(
                    checklist=checklist,
                    order=i,
                    text=item_text
                )
            
            return Response(ChecklistSerializer(checklist).data, status=status.HTTP_201_CREATED)
        
        return Response(
            {'error': 'Could not extract checklist from content'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for recommendations."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RecommendationSerializer
    
    def get_queryset(self):
        """Filter recommendations by sessions owned by the current user."""
        return Recommendation.objects.filter(session__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_clicked(self, request, pk=None):
        """Mark a recommendation as clicked."""
        recommendation = self.get_object()
        recommendation.clicked_at = timezone.now()
        recommendation.save()
        
        return Response({'message': 'Recommendation marked as clicked'})
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss a recommendation."""
        recommendation = self.get_object()
        recommendation.dismissed = True
        recommendation.save()
        
        return Response({'message': 'Recommendation dismissed'})


class ReflectionStreakView(APIView):
    """View for reflection streak information."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get the current user's reflection streak."""
        streak, created = ReflectionStreak.objects.get_or_create(user=request.user)
        serializer = ReflectionStreakSerializer(streak)
        return Response(serializer.data)


class ReflectionSummaryView(APIView):
    """View for reflection summary and analytics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get reflection summary for the current user."""
        user = request.user
        
        # Get basic stats
        total_sessions = ReflectionSession.objects.filter(user=user).count()
        
        # Get streak info
        streak, created = ReflectionStreak.objects.get_or_create(user=user)
        
        # Calculate completion rate (sessions with entries)
        sessions_with_entries = ReflectionSession.objects.filter(
            user=user,
            entries__isnull=False
        ).distinct().count()
        
        completion_rate = (sessions_with_entries / total_sessions * 100) if total_sessions > 0 else 0
        
        # Get common tags from analysis
        common_tags = ReflectionAnalysis.objects.filter(
            session__user=user
        ).values_list('tags', flat=True)
        
        # Flatten and count tags
        tag_counts = {}
        for tags in common_tags:
            for tag in tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Get top 5 most common tags
        common_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        common_tags = [tag for tag, count in common_tags]
        
        # Get recent recommendations
        recent_recommendations = Recommendation.objects.filter(
            session__user=user,
            dismissed=False
        ).order_by('-created_at')[:5]
        
        summary_data = {
            'total_sessions': total_sessions,
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
            'completion_rate': round(completion_rate, 1),
            'common_tags': common_tags,
            'recent_recommendations': RecommendationSerializer(recent_recommendations, many=True).data
        }
        
        serializer = ReflectionSummarySerializer(summary_data)
        return Response(serializer.data)
