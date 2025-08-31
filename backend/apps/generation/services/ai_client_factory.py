"""
AI Client Factory for creating and managing AI client instances.

This module provides a factory pattern for creating AI clients,
reducing duplication and improving maintainability across services.
"""

from typing import Optional, Dict, Any
from .base import BaseAIClient
from .api_client import AIClient
from .mock_ai_client import MockAIClient


class AIClientFactory:
    """
    Factory for creating AI client instances.
    
    This factory centralizes AI client creation logic and provides
    consistent configuration across the application.
    """
    
    _clients: Dict[str, BaseAIClient] = {}
    
    @classmethod
    def get_client(cls, model: str, use_mock: bool = False) -> BaseAIClient:
        """
        Get or create an AI client instance.
        
        Args:
            model: The AI model to use (e.g., 'gpt-4', 'gemini-2.0-flash')
            use_mock: Whether to use the mock client (default: False)
        
        Returns:
            BaseAIClient: Configured AI client instance
        """
        if use_mock:
            return MockAIClient(model=model)
        
        # Check if we already have a client for this model
        if model in cls._clients:
            return cls._clients[model]
        
        # Create new client
        try:
            client = AIClient(model=model)
            cls._clients[model] = client
            return client
        except Exception as e:
            # Fallback to mock client if real client creation fails
            print(f"Failed to create AI client for {model}: {e}. Falling back to mock client.")
            return MockAIClient(model=model)
    
    @classmethod
    def get_client_with_fallback(cls, primary_model: str, fallback_model: str = "gemini-2.0-flash") -> BaseAIClient:
        """
        Get an AI client with automatic fallback to a secondary model.
        
        Args:
            primary_model: Primary AI model to try first
            fallback_model: Fallback model if primary fails
        
        Returns:
            BaseAIClient: Working AI client instance
        """
        try:
            return cls.get_client(primary_model)
        except Exception:
            return cls.get_client(fallback_model)
    
    @classmethod
    def clear_cache(cls):
        """Clear the client cache."""
        cls._clients.clear()
    
    @classmethod
    def get_available_models(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get information about available AI models.
        
        Returns:
            Dict containing model information
        """
        return {
            'gpt-4': {
                'provider': 'OpenAI',
                'type': 'text-generation',
                'max_tokens': 8192,
                'supports_chat': True
            },
            'gpt-3.5-turbo': {
                'provider': 'OpenAI',
                'type': 'text-generation',
                'max_tokens': 4096,
                'supports_chat': True
            },
            'gemini-2.0-flash': {
                'provider': 'Google',
                'type': 'text-generation',
                'max_tokens': 8192,
                'supports_chat': True
            },
            'gemini-1.5-pro': {
                'provider': 'Google',
                'type': 'text-generation',
                'max_tokens': 32768,
                'supports_chat': True
            }
        }


def create_ai_client_for_task(task_type: str, use_mock: bool = False) -> BaseAIClient:
    """
    Create an AI client optimized for a specific task type.
    
    Args:
        task_type: Type of task (e.g., 'generation', 'analysis', 'extraction')
        use_mock: Whether to use mock client
    
    Returns:
        BaseAIClient: Optimized AI client for the task
    """
    task_model_mapping = {
        'generation': 'gpt-4',
        'analysis': 'gpt-4',
        'extraction': 'gemini-2.0-flash',
        'summarization': 'gpt-3.5-turbo',
        'classification': 'gemini-2.0-flash'
    }
    
    model = task_model_mapping.get(task_type, 'gpt-4')
    return AIClientFactory.get_client(model, use_mock=use_mock)
