"""
Validation helper utilities for common validation logic.

This module provides helper functions for common validation patterns
used across multiple views, reducing code duplication.
"""

from typing import Dict, Any


def validate_card_type(card_type: str) -> bool:
    """
    Validate that a card type is supported.
    
    Args:
        card_type: The card type to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    valid_types = ['basic', 'cloze']
    return card_type in valid_types


def validate_export_parameters(query_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate export parameters for Anki export operations.
    
    Args:
        query_params: Query parameters from the request
    
    Returns:
        Dict containing validation result and parsed parameters
    """
    # Get optional parameters
    include_source = query_params.get('include_source', 'true').lower() == 'true'
    card_type = query_params.get('card_type', 'basic')
    
    # Validate card type
    if not validate_card_type(card_type):
        return {
            'valid': False,
            'error': 'Invalid card_type. Must be "basic" or "cloze".'
        }
    
    return {
        'valid': True,
        'include_source': include_source,
        'card_type': card_type
    }


def validate_review_quality(quality: int) -> bool:
    """
    Validate that a review quality rating is within valid range.
    
    Args:
        quality: The quality rating to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    return isinstance(quality, int) and 0 <= quality <= 5


def validate_session_limit(limit: int) -> bool:
    """
    Validate that a session limit is reasonable.
    
    Args:
        limit: The session limit to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    return isinstance(limit, int) and 1 <= limit <= 100


def validate_difficulty_level(difficulty: str) -> bool:
    """
    Validate that a difficulty level is supported.
    
    Args:
        difficulty: The difficulty level to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    valid_difficulties = ['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced']
    return difficulty.lower() in valid_difficulties


def validate_question_mix(question_mix: Dict[str, int]) -> bool:
    """
    Validate that a question mix configuration is valid.
    
    Args:
        question_mix: Dictionary mapping question types to counts
    
    Returns:
        bool: True if valid, False otherwise
    """
    if not isinstance(question_mix, dict):
        return False
    
    valid_types = ['MCQ', 'SHORT_ANSWER', 'PRINCIPLE', 'TRUE_FALSE']
    
    for question_type, count in question_mix.items():
        if question_type not in valid_types:
            return False
        if not isinstance(count, int) or count < 0:
            return False
    
    return True


def validate_delivery_mode(mode: str) -> bool:
    """
    Validate that a delivery mode is supported.
    
    Args:
        mode: The delivery mode to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    valid_modes = ['IMMEDIATE', 'DEFERRED_FEEDBACK', 'BATCH']
    return mode in valid_modes


def validate_max_questions(max_questions: int) -> bool:
    """
    Validate that a maximum question count is reasonable.
    
    Args:
        max_questions: The maximum question count to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    return isinstance(max_questions, int) and 1 <= max_questions <= 50


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename for safe file operations.
    
    Args:
        filename: The filename to sanitize
    
    Returns:
        str: Sanitized filename
    """
    import re
    
    # Remove or replace unsafe characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Limit length
    if len(filename) > 100:
        filename = filename[:100]
    
    # Ensure it's not empty
    if not filename.strip():
        filename = 'unnamed_file'
    
    return filename.strip()
