"""
Interleaving-related API views.

This module contains all interleaving-related API views,
including session configuration and difficulty dial functionality.
"""

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import InterleavingSessionConfig
from ..serializers import (
    InterleavingSessionConfigSerializer, InterleavingSessionRequestSerializer,
    InterleavingSessionResponseSerializer
)
from ..services.interleaving_session_new import InterleavingSessionService
from ..services.difficulty_dial import DifficultyDialService
from ..utils.response_helpers import create_error_response, create_success_response


class InterleavingConfigView(APIView):
    """API view for managing interleaving session configuration."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user's interleaving configuration."""
        try:
            config, created = InterleavingSessionConfig.objects.get_or_create(
                user=request.user,
                defaults={
                    'difficulty': 'medium',
                    'session_size': 10,
                    'w_due': 0.60,
                    'w_interleave': 0.25,
                    'w_new': 0.15
                }
            )
            
            serializer = InterleavingSessionConfigSerializer(config)
            return Response(serializer.data)
            
        except Exception as e:
            return create_error_response(f'Failed to get configuration: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def patch(self, request):
        """Update user's interleaving configuration."""
        try:
            config, created = InterleavingSessionConfig.objects.get_or_create(
                user=request.user,
                defaults={
                    'difficulty': 'medium',
                    'session_size': 10,
                    'w_due': 0.60,
                    'w_interleave': 0.25,
                    'w_new': 0.15
                }
            )
            
            serializer = InterleavingSessionConfigSerializer(
                config, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return create_error_response(f'Failed to update configuration: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


class InterleavingSessionView(APIView):
    """API view for generating interleaving sessions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate a new interleaving session."""
        try:
            # Validate request data
            serializer = InterleavingSessionRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate session
            service = InterleavingSessionService()
            session_data = service.generate_session(
                user=request.user,
                size=serializer.validated_data.get('size'),
                difficulty=serializer.validated_data.get('difficulty'),
                seed=serializer.validated_data.get('seed')
            )
            
            # Serialize response
            response_serializer = InterleavingSessionResponseSerializer(instance=session_data)
            return Response(response_serializer.data)
            
        except Exception as e:
            return create_error_response(f'Failed to generate session: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)


class DifficultyDialView(APIView):
    """API view for difficulty dial information and suggestions."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get difficulty dial information."""
        difficulty = request.query_params.get('difficulty', 'medium')
        
        try:
            difficulty_info = DifficultyDialService.get_difficulty_info(difficulty)
            return Response(difficulty_info)
            
        except Exception as e:
            return create_error_response(f'Failed to get difficulty info: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Get difficulty adjustment suggestion based on performance."""
        try:
            current_difficulty = request.data.get('current_difficulty', 'medium')
            success_rate_raw = request.data.get('success_rate', 0.0)
            avg_latency_raw = request.data.get('avg_latency', 0.0)
            
            try:
                success_rate = float(success_rate_raw)
            except (TypeError, ValueError):
                success_rate = 0.0
            try:
                avg_latency = float(avg_latency_raw)
            except (TypeError, ValueError):
                avg_latency = 0.0
            
            suggestion = DifficultyDialService.suggest_difficulty_adjustment(
                current_difficulty, success_rate, avg_latency
            )
            
            return Response(suggestion)
            
        except Exception as e:
            return create_error_response(f'Failed to get suggestion: {str(e)}', status.HTTP_500_INTERNAL_SERVER_ERROR)
