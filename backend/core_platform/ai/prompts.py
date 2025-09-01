"""
Prompt management with versioning and logging.
"""
import json
import hashlib
from typing import Dict, Any, Optional, List
from datetime import datetime
from backend.core_platform.observability.logging import get_logger
from backend.core_platform.config import settings

logger = get_logger(__name__)


class PromptManager:
    """Manage AI prompts with versioning and logging."""
    
    def __init__(self):
        self.prompts = {}
        self.versions = {}
        self._load_prompts()
    
    def _load_prompts(self):
        """Load prompts from configuration."""
        # Load prompts from prompts directory or configuration
        self.prompts = {
            'document_classification': {
                'version': '1.0',
                'template': """
                Classify the following document content into one of these categories:
                - syllabus: Course syllabus, curriculum, or academic plan
                - exam: Exam, test, quiz, or assessment material
                - study_content: Textbook, study guide, lecture notes, or educational material
                - note: Personal notes, summaries, or informal study material
                - unknown: Cannot determine or doesn't fit other categories
                
                Document content:
                {content}
                
                Respond with only the category name.
                """,
                'variables': ['content'],
            },
            'flashcard_generation': {
                'version': '1.0',
                'template': """
                Generate flashcards from the following content:
                
                Content: {content}
                Number of cards: {card_count}
                Difficulty level: {difficulty}
                
                Generate {card_count} flashcards with the following format:
                - Question: [Clear, specific question]
                - Answer: [Concise, accurate answer]
                - Difficulty: [easy/medium/hard]
                """,
                'variables': ['content', 'card_count', 'difficulty'],
            },
            'mindmap_generation': {
                'version': '1.0',
                'template': """
                Create a mind map structure from the following content:
                
                Content: {content}
                Main topic: {main_topic}
                
                Generate a hierarchical mind map with:
                - Main topic as the center
                - Key concepts as primary branches
                - Supporting details as secondary branches
                - Maximum 3 levels of depth
                """,
                'variables': ['content', 'main_topic'],
            },
        }
    
    def get_prompt(self, prompt_name: str, version: Optional[str] = None) -> Dict[str, Any]:
        """
        Get a prompt by name and version.
        
        Args:
            prompt_name: Name of the prompt
            version: Version of the prompt (defaults to latest)
            
        Returns:
            Prompt configuration
        """
        if prompt_name not in self.prompts:
            raise ValueError(f"Unknown prompt: {prompt_name}")
        
        prompt = self.prompts[prompt_name]
        
        if version and version != prompt['version']:
            # In a real implementation, you'd load from a database or file system
            logger.warning("Requested prompt version not found, using latest", 
                          prompt_name=prompt_name, requested_version=version, 
                          available_version=prompt['version'])
        
        return prompt
    
    def render_prompt(self, prompt_name: str, **kwargs) -> str:
        """
        Render a prompt with variables.
        
        Args:
            prompt_name: Name of the prompt
            **kwargs: Variables to substitute in the prompt
            
        Returns:
            Rendered prompt string
        """
        prompt = self.get_prompt(prompt_name)
        template = prompt['template']
        
        # Validate that all required variables are provided
        required_vars = set(prompt['variables'])
        provided_vars = set(kwargs.keys())
        
        missing_vars = required_vars - provided_vars
        if missing_vars:
            raise ValueError(f"Missing required variables for prompt '{prompt_name}': {missing_vars}")
        
        # Render the template
        rendered = template.format(**kwargs)
        
        # Log prompt usage (with PII redaction)
        self._log_prompt_usage(prompt_name, prompt['version'], kwargs, rendered)
        
        return rendered
    
    def _log_prompt_usage(self, prompt_name: str, version: str, variables: Dict[str, Any], rendered: str):
        """
        Log prompt usage with PII redaction.
        
        Args:
            prompt_name: Name of the prompt
            version: Version of the prompt
            variables: Variables used in the prompt
            rendered: The rendered prompt
        """
        # Create a hash of the rendered prompt for tracking
        prompt_hash = hashlib.md5(rendered.encode()).hexdigest()
        
        # Redact potentially sensitive content
        redacted_variables = self._redact_pii(variables)
        
        logger.info(
            "Prompt rendered",
            prompt_name=prompt_name,
            version=version,
            prompt_hash=prompt_hash,
            variables=redacted_variables,
            content_length=len(rendered),
        )
    
    def _redact_pii(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Redact personally identifiable information from data.
        
        Args:
            data: Data to redact
            
        Returns:
            Redacted data
        """
        redacted = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                # Redact email addresses
                if '@' in value:
                    redacted[key] = '[EMAIL_REDACTED]'
                # Redact names (simple heuristic)
                elif len(value.split()) <= 3 and any(word.istitle() for word in value.split()):
                    redacted[key] = '[NAME_REDACTED]'
                # Truncate long content
                elif len(value) > 100:
                    redacted[key] = value[:100] + '...[TRUNCATED]'
                else:
                    redacted[key] = value
            elif isinstance(value, dict):
                redacted[key] = self._redact_pii(value)
            elif isinstance(value, list):
                redacted[key] = [self._redact_pii(item) if isinstance(item, dict) else item for item in value]
            else:
                redacted[key] = value
        
        return redacted
    
    def get_prompt_stats(self, prompt_name: str) -> Dict[str, Any]:
        """
        Get statistics for a prompt.
        
        Args:
            prompt_name: Name of the prompt
            
        Returns:
            Prompt statistics
        """
        if prompt_name not in self.prompts:
            return {}
        
        prompt = self.prompts[prompt_name]
        
        return {
            'name': prompt_name,
            'version': prompt['version'],
            'variables': prompt['variables'],
            'template_length': len(prompt['template']),
            'last_updated': datetime.now().isoformat(),
        }
    
    def list_prompts(self) -> List[str]:
        """
        List all available prompts.
        
        Returns:
            List of prompt names
        """
        return list(self.prompts.keys())


# Global prompt manager instance
prompt_manager = PromptManager()


def get_prompt(prompt_name: str, **kwargs) -> str:
    """
    Convenience function to get and render a prompt.
    
    Args:
        prompt_name: Name of the prompt
        **kwargs: Variables to substitute in the prompt
        
    Returns:
        Rendered prompt string
    """
    return prompt_manager.render_prompt(prompt_name, **kwargs)


def log_ai_interaction(prompt_name: str, input_data: Dict[str, Any], output_data: Any, 
                      provider: str, model: str, duration_ms: float):
    """
    Log AI interaction for monitoring and debugging.
    
    Args:
        prompt_name: Name of the prompt used
        input_data: Input data sent to AI
        output_data: Output data received from AI
        provider: AI provider (openai, gemini, etc.)
        model: AI model used
        duration_ms: Duration of the interaction in milliseconds
    """
    # Redact PII from input data
    redacted_input = prompt_manager._redact_pii(input_data)
    
    # Truncate output if too long
    output_str = str(output_data)
    if len(output_str) > 500:
        output_str = output_str[:500] + '...[TRUNCATED]'
    
    logger.info(
        "AI interaction completed",
        prompt_name=prompt_name,
        provider=provider,
        model=model,
        duration_ms=duration_ms,
        input_data=redacted_input,
        output_length=len(str(output_data)),
        output_preview=output_str,
    )
