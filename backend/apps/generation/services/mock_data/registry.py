"""
Mock data registry for AI generation services.

This module provides mock data for various AI tasks including flashcards,
assessments, and other generated content for testing purposes.
"""

import uuid
from typing import Dict, List, Any
from ..api_client import Task


def mock_flashcards(payload: dict) -> dict:
    """Return comprehensive neural network training flashcards for testing."""
    # Extract title from payload or generate a default one
    title = payload.get('title', 'Neural Network Training Fundamentals')
    content_type = payload.get('content_type', 'mixed')
    difficulty = payload.get('difficulty', 'medium')
    
    # Generate a descriptive title and description based on content
    if 'neural network' in title.lower() or 'training' in title.lower():
        deck_title = "Neural Network Training Fundamentals"
        deck_description = "Comprehensive flashcards covering neural network training algorithms, optimization, and key concepts."
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
                "question": "What are the three main steps in a neural network training algorithm?",
                "answer": "The three steps are: (1) Forward pass – compute predictions, (2) Loss estimation – measure error between prediction and desired output, (3) Backward pass – update weights using gradients.",
                "tags": ["training-algorithm-steps", "optimization", "neural-networks"]
            },
            {
                "question": "How does the softmax function transform a vector?",
                "answer": "Softmax transforms a vector into a probability distribution by applying exponentiation to each component and dividing by the sum of all exponentials. Each output is in [0,1] and the sum equals 1.",
                "tags": ["softmax-function", "classification", "probability"]
            },
            {
                "question": "Why is binary cross-entropy also called logistic loss?",
                "answer": "Binary cross-entropy is equivalent to the negative log-likelihood of logistic regression, where outputs are probabilities in [0,1] and labels are 0 or 1.",
                "tags": ["binary-cross-entropy", "loss-function", "logistic-regression"]
            },
            {
                "question": "How does backpropagation use gradients to adjust weights?",
                "answer": "Backpropagation computes the gradient of the loss with respect to each parameter and updates weights in the opposite direction of the gradient, scaled by a learning rate.",
                "tags": ["backpropagation", "gradient-descent", "optimization"]
            },
            {
                "question": "What distinguishes categorical cross-entropy from binary cross-entropy?",
                "answer": "Categorical cross-entropy handles multi-class classification with one-hot encoded labels and probabilities over multiple classes, while binary cross-entropy applies to two-class problems with scalar outputs.",
                "tags": ["categorical-cross-entropy", "multi-class-classification", "loss-function"]
            },
            {
                "question": "Fill in the blank: In stochastic gradient descent (SGD), each parameter p is updated as p ← p – η·g, where g is ______.",
                "answer": "The gradient of the loss function with respect to parameter p.",
                "tags": ["stochastic-gradient-descent", "optimization", "gradients"]
            },
            {
                "question": "Why are adaptive learning rate methods (e.g., Adam, RMSProp) used instead of plain SGD?",
                "answer": "They adjust learning rates dynamically for each parameter, improving convergence speed and stability compared to constant learning rate SGD.",
                "tags": ["adaptive-learning-rate", "adam", "optimization"]
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

# AI Client mock registry mapping Task enum to mock functions
MOCK_REGISTRY = {
    Task.FLASHCARDS: mock_flashcards,
    Task.SYLLABUS: lambda payload: {
        "title": "Sample Syllabus",
        "modules": [],
        "total_hours": 40,
        "bloom_levels": ["remember", "understand", "apply"]
    },
    Task.TEST: lambda payload: {
        "items": [
            {
                "id": "test_1",
                "question": "What is machine learning?",
                "type": "multiple_choice",
                "options": ["AI subset", "Statistics", "Programming", "Data analysis"],
                "correct_answer": 0
            }
        ]
    },
    Task.CONTENT: lambda payload: {
        "summary": "Mock content summary",
        "keywords": ["machine learning", "artificial intelligence"],
        "entities": [],
        "concepts": [],
        "sections": []
    }
}


def get_mock_data(data_type: str, payload: dict) -> Dict[str, Any]:
    """Get mock data for the specified type and payload."""
    if data_type not in MOCK_DATA_REGISTRY:
        raise ValueError(f"Unknown mock data type: {data_type}")
    
    return MOCK_DATA_REGISTRY[data_type](payload)
