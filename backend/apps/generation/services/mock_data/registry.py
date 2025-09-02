"""
Mock data registry for AI generation services.

This module provides mock data for various AI tasks including flashcards,
assessments, and other generated content for testing purposes.
"""

import uuid
from typing import Dict, List, Any


def mock_flashcards(payload: dict) -> dict:
    """Return comprehensive language model flashcards for testing."""
    # Extract title from payload or generate a default one
    title = payload.get('title', 'Natural Language Processing Fundamentals')
    content_type = payload.get('content_type', 'mixed')
    difficulty = payload.get('difficulty', 'medium')
    
    # Generate a descriptive title and description based on content
    if 'natural language' in title.lower() or 'nlp' in title.lower():
        deck_title = "Natural Language Processing Fundamentals"
        deck_description = "Comprehensive flashcards covering core NLP concepts including language models, tokenization, and neural network architectures."
    elif 'machine learning' in title.lower() or 'ml' in title.lower():
        deck_title = "Machine Learning Essentials"
        deck_description = "Essential machine learning concepts covering algorithms, model evaluation, and practical applications."
    elif 'web development' in title.lower() or 'react' in title.lower():
        deck_title = "Modern Web Development"
        deck_description = "Flashcards covering modern web development technologies including React, JavaScript, and API design."
    else:
        deck_title = f"{title} - Study Guide"
        deck_description = f"Comprehensive study materials covering key concepts from {title} with {difficulty} difficulty level."
    
    return {
        "deck": {
            "suggested_title": deck_title,
            "suggested_description": deck_description,
        },
        "cards": [
            {
                "id": "card_1",
                "front": "What two core problems do language models target?",
                "back": "Belonging: decide if a sequence is a sentence of language L. Continuation: predict the most likely next item given a segment.",
                "tags": ["belonging-problem", "continuation-problem", "causal-language-modeling"]
            },
            {
                "id": "card_2", 
                "front": "What is the belonging (membership) problem in language modeling?",
                "back": "Determine whether a given sequence is a sentence of language L.",
                "tags": ["role-of-language-models", "continuation-problem"]
            },
            {
                "id": "card_3",
                "front": "What does the continuation problem ask a language model to do?",
                "back": "Given a segment, predict the most likely next item (token or sequence) in language L.",
                "tags": ["role-of-language-models", "causal-language-modeling", "masked-language-modeling"]
            },
            {
                "id": "card_4",
                "front": "Why is self-supervised learning suited to language modeling?",
                "back": "It needs no manual labels: remove the next segment and ask the model to predict it using raw running texts, enabling much larger training sets than annotated ones.",
                "tags": ["colossal-datasets", "cross-entropy-loss", "forward-pass"]
            },
            {
                "id": "card_5",
                "front": "What does softmax enforce on the output vector y^?",
                "back": "Each component lies in [0,1] and the components sum to 1 across the vocabulary, making y^ a probability distribution.",
                "tags": ["cross-entropy-loss", "predicted-item-argmax"]
            },
            {
                "id": "card_6",
                "front": "How is the predicted next item selected from y^?",
                "back": "Choose the index with the highest value (argmax) in the softmax-normalized output vector.",
                "tags": ["softmax-normalization", "cross-entropy-loss"]
            },
            {
                "id": "card_7",
                "front": "What is the difference between causal and masked language modeling?",
                "back": "Causal LM predicts next token given previous tokens (left-to-right). Masked LM predicts masked tokens given surrounding context (bidirectional).",
                "tags": ["causal-language-modeling", "masked-language-modeling", "bidirectional"]
            },
            {
                "id": "card_8",
                "front": "What are the key advantages of transformer architecture?",
                "back": "Parallel processing, long-range dependencies, self-attention mechanism, and scalability to large models.",
                "tags": ["transformer", "self-attention", "parallel-processing", "scalability"]
            },
            {
                "id": "card_9",
                "front": "What is the attention mechanism in transformers?",
                "back": "A mechanism that allows the model to focus on different parts of the input sequence when processing each token.",
                "tags": ["attention", "self-attention", "transformer"]
            },
            {
                "id": "card_10",
                "front": "What is tokenization in NLP?",
                "back": "The process of breaking down text into smaller units (tokens) that can be processed by language models.",
                "tags": ["tokenization", "text-processing", "nlp"]
            }
        ]
    }


def mock_assessment(payload: dict) -> dict:
    """Return mock assessment data for testing."""
    return {
        "title": "Sample Assessment",
        "description": "A comprehensive assessment covering key concepts.",
        "questions": [
            {
                "id": str(uuid.uuid4()),
                "question": "What is the primary goal of machine learning?",
                "type": "multiple_choice",
                "options": [
                    "To replace human intelligence",
                    "To learn patterns from data",
                    "To solve all problems automatically",
                    "To create artificial consciousness"
                ],
                "correct_answer": 1,
                "explanation": "Machine learning focuses on learning patterns from data to make predictions or decisions."
            },
            {
                "id": str(uuid.uuid4()),
                "question": "Which of the following is NOT a type of machine learning?",
                "type": "multiple_choice",
                "options": [
                    "Supervised Learning",
                    "Unsupervised Learning",
                    "Reinforcement Learning",
                    "Deterministic Learning"
                ],
                "correct_answer": 3,
                "explanation": "Deterministic Learning is not a recognized type of machine learning."
            }
        ]
    }


def mock_diagnostic(payload: dict) -> dict:
    """Return mock diagnostic data for testing."""
    return {
        "title": "Learning Diagnostic",
        "description": "Assessment of current knowledge and learning gaps.",
        "sections": [
            {
                "id": "section_1",
                "title": "Core Concepts",
                "questions": [
                    {
                        "id": "q1",
                        "question": "How confident are you with basic concepts?",
                        "type": "confidence_scale",
                        "options": ["Not at all", "Somewhat", "Confident", "Very confident"]
                    }
                ]
            }
        ]
    }


# Registry mapping for different mock data types
MOCK_DATA_REGISTRY = {
    "flashcards": mock_flashcards,
    "assessment": mock_assessment,
    "diagnostic": mock_diagnostic,
}


def get_mock_data(data_type: str, payload: dict) -> Dict[str, Any]:
    """Get mock data for the specified type and payload."""
    if data_type not in MOCK_DATA_REGISTRY:
        raise ValueError(f"Unknown mock data type: {data_type}")
    
    return MOCK_DATA_REGISTRY[data_type](payload)
