"""
AI client abstractions for different providers.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
import openai
import google.generativeai as genai
from backend.core_platform.config import settings
from backend.core_platform.observability.logging import get_logger


logger = get_logger(__name__)


class AIClient(ABC):
    """Abstract base class for AI clients."""
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Generate text from a prompt."""
        pass
    
    @abstractmethod
    async def generate_structured(self, prompt: str, schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Generate structured data from a prompt."""
        pass
    
    @abstractmethod
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics for the client."""
        pass


class OpenAIClient(AIClient):
    """OpenAI client implementation."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = openai.AsyncOpenAI(api_key=self.api_key)
        self.model = "gpt-4-turbo-preview"
        self._usage_stats = {"tokens_used": 0, "requests": 0}
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Generate text using OpenAI."""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            
            self._usage_stats["tokens_used"] += response.usage.total_tokens
            self._usage_stats["requests"] += 1
            
            logger.info(
                "OpenAI text generation completed",
                tokens_used=response.usage.total_tokens,
                model=self.model,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error("OpenAI text generation failed", error=str(e))
            raise
    
    async def generate_structured(self, prompt: str, schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Generate structured data using OpenAI with function calling."""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                tools=[{"type": "function", "function": {"name": "output", "parameters": schema}}],
                tool_choice={"type": "function", "function": {"name": "output"}},
                **kwargs
            )
            
            self._usage_stats["tokens_used"] += response.usage.total_tokens
            self._usage_stats["requests"] += 1
            
            logger.info(
                "OpenAI structured generation completed",
                tokens_used=response.usage.total_tokens,
                model=self.model,
            )
            
            # Parse the function call response
            tool_call = response.choices[0].message.tool_calls[0]
            import json
            return json.loads(tool_call.function.arguments)
            
        except Exception as e:
            logger.error("OpenAI structured generation failed", error=str(e))
            raise
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics."""
        return self._usage_stats.copy()


class GeminiClient(AIClient):
    """Google Gemini client implementation."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self._usage_stats = {"tokens_used": 0, "requests": 0}
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Generate text using Gemini."""
        try:
            response = await self.model.generate_content_async(prompt, **kwargs)
            
            # Note: Gemini doesn't provide token usage in the same way
            self._usage_stats["requests"] += 1
            
            logger.info(
                "Gemini text generation completed",
                model="gemini-pro",
            )
            
            return response.text
            
        except Exception as e:
            logger.error("Gemini text generation failed", error=str(e))
            raise
    
    async def generate_structured(self, prompt: str, schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Generate structured data using Gemini."""
        # For now, we'll use text generation and parse JSON
        # In the future, we can implement proper structured generation
        try:
            structured_prompt = f"""
            {prompt}
            
            Please respond with valid JSON that matches this schema:
            {schema}
            
            Response:
            """
            
            response = await self.generate_text(structured_prompt, **kwargs)
            
            # Try to parse JSON from the response
            import json
            import re
            
            # Extract JSON from the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise ValueError("Could not extract JSON from response")
                
        except Exception as e:
            logger.error("Gemini structured generation failed", error=str(e))
            raise
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics."""
        return self._usage_stats.copy()


class AIClientFactory:
    """Factory for creating AI clients."""
    
    @staticmethod
    def create_client(provider: Optional[str] = None) -> AIClient:
        """Create an AI client for the specified provider."""
        provider = provider or settings.AI_PROVIDER
        
        if provider == "openai":
            return OpenAIClient()
        elif provider == "gemini":
            return GeminiClient()
        else:
            raise ValueError(f"Unsupported AI provider: {provider}")
    
    @staticmethod
    def get_available_providers() -> List[str]:
        """Get list of available AI providers."""
        providers = []
        
        if settings.OPENAI_API_KEY:
            providers.append("openai")
        
        if settings.GEMINI_API_KEY:
            providers.append("gemini")
        
        return providers
