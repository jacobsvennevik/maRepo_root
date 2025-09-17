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
                "question": "What is the purpose of gradient descent in neural network training?",
                "answer": "Gradient descent is an optimization algorithm that minimizes the loss function by iteratively adjusting model parameters in the direction of steepest descent of the gradient.",
                "tags": ["gradient-descent", "optimization", "training"]
            },
            {
                "question": "Explain the difference between overfitting and underfitting in machine learning.",
                "answer": "Overfitting occurs when a model learns training data too well, including noise, leading to poor generalization. Underfitting happens when a model is too simple to capture underlying patterns in the data.",
                "tags": ["overfitting", "underfitting", "generalization", "model-complexity"]
            },
            {
                "question": "What is the role of activation functions in neural networks?",
                "answer": "Activation functions introduce non-linearity into neural networks, enabling them to learn complex patterns and relationships that linear models cannot capture.",
                "tags": ["activation-functions", "non-linearity", "neural-networks"]
            },
            {
                "question": "How does batch normalization improve neural network training?",
                "answer": "Batch normalization normalizes inputs to each layer, reducing internal covariate shift, allowing higher learning rates, and providing regularization effects that improve training stability and speed.",
                "tags": ["batch-normalization", "regularization", "training-stability"]
            },
            {
                "question": "What is the vanishing gradient problem and how can it be addressed?",
                "answer": "The vanishing gradient problem occurs when gradients become exponentially small during backpropagation in deep networks. Solutions include ReLU activation functions, residual connections, and proper weight initialization.",
                "tags": ["vanishing-gradients", "deep-networks", "backpropagation", "residual-connections"]
            },
            {
                "question": "Explain the concept of learning rate in neural network training.",
                "answer": "Learning rate controls the step size during gradient descent optimization. Too high causes instability, too low slows convergence. Adaptive methods like Adam adjust learning rates automatically.",
                "tags": ["learning-rate", "optimization", "gradient-descent", "adam"]
            },
            {
                "question": "What is dropout and how does it prevent overfitting?",
                "answer": "Dropout randomly sets a fraction of input units to 0 during training, preventing the network from becoming overly dependent on specific neurons and improving generalization.",
                "tags": ["dropout", "regularization", "overfitting-prevention"]
            },
            {
                "question": "How do convolutional neural networks (CNNs) differ from fully connected networks?",
                "answer": "CNNs use convolutional layers with shared weights and local connectivity, making them translation-invariant and efficient for spatial data like images, unlike fully connected networks that connect every neuron to every other neuron.",
                "tags": ["cnn", "convolutional-layers", "translation-invariance", "spatial-data"]
            }
        ]
    }


def mock_syllabus(payload: dict) -> dict:
    """Return comprehensive syllabus data for testing."""
    title = payload.get('title', 'Machine Learning Fundamentals')
    
    return {
        "title": f"{title} - Course Syllabus",
        "modules": [
            {
                "title": "Introduction to Machine Learning",
                "hours": 8,
                "topics": ["Supervised vs Unsupervised Learning", "Model Evaluation", "Data Preprocessing"],
                "objectives": ["Understand basic ML concepts", "Learn evaluation metrics"]
            },
            {
                "title": "Neural Networks and Deep Learning",
                "hours": 12,
                "topics": ["Perceptrons", "Backpropagation", "Deep Networks", "Regularization"],
                "objectives": ["Build neural networks", "Understand training process"]
            },
            {
                "title": "Advanced Topics",
                "hours": 10,
                "topics": ["CNNs", "RNNs", "Transfer Learning", "Model Optimization"],
                "objectives": ["Apply advanced architectures", "Optimize model performance"]
            }
        ],
        "total_hours": 30,
        "bloom_levels": ["Remember", "Understand", "Apply", "Analyze"]
    }


def mock_test(payload: dict) -> dict:
    """Return comprehensive test data for testing."""
    return {
        "items": [
            {
                "question": "What is the primary advantage of using neural networks over traditional machine learning algorithms?",
                "answer": "Neural networks can automatically learn complex non-linear relationships and feature representations from raw data without manual feature engineering.",
                "type": "short_answer",
                "difficulty": "medium",
                "tags": ["neural-networks", "feature-learning", "non-linearity"]
            },
            {
                "question": "Which of the following is NOT a common activation function?",
                "options": ["ReLU", "Sigmoid", "Tanh", "Linear"],
                "answer": "Linear",
                "type": "multiple_choice",
                "difficulty": "easy",
                "tags": ["activation-functions"]
            }
        ]
    }


def mock_content(payload: dict) -> dict:
    """Return comprehensive content analysis data for testing."""
    return {
        "summary": "This content covers fundamental concepts in machine learning and neural networks, including training algorithms, optimization techniques, and practical applications.",
        "keywords": ["machine learning", "neural networks", "training", "optimization", "deep learning"],
        "entities": ["TensorFlow", "PyTorch", "Scikit-learn", "Python"],
        "concepts": ["gradient descent", "backpropagation", "overfitting", "regularization"],
        "sections": [
            {"title": "Introduction", "content": "Overview of machine learning concepts"},
            {"title": "Neural Networks", "content": "Deep dive into neural network architectures"},
            {"title": "Training Process", "content": "Detailed explanation of training algorithms"}
        ]
    }


def mock_quiz(payload: dict) -> dict:
    """Return comprehensive quiz data for testing following the provided schema."""
    # Extract parameters from payload
    topic = payload.get('topic', 'Natural Language Processing')
    difficulty = payload.get('difficulty', 'medium')
    max_questions = payload.get('max_questions', 5)
    quiz_type = payload.get('quiz_type', 'formative')  # formative, summative, diagnostic, mastery
    
    # Generate quiz items based on the schema provided and quiz type
    if quiz_type == 'formative':
        quiz_items = _generate_formative_quiz_items(topic, difficulty, max_questions)
    elif quiz_type == 'summative':
        quiz_items = _generate_summative_quiz_items(topic, difficulty, max_questions)
    elif quiz_type == 'diagnostic':
        quiz_items = _generate_diagnostic_quiz_items(topic, difficulty, max_questions)
    elif quiz_type == 'mastery':
        quiz_items = _generate_mastery_quiz_items(topic, difficulty, max_questions)
    else:
        # Default to formative
        quiz_items = _generate_formative_quiz_items(topic, difficulty, max_questions)
    
    return {
        "items": quiz_items
    }


def _generate_formative_quiz_items(topic: str, difficulty: str, max_questions: int) -> list:
    """Generate formative practice quiz items with rich feedback."""
    return [
        {
            "derived_from_item_id": "EX-Q1",
            "objective_id": "OBJ1",
            "type": "explain_why",
            "difficulty": "medium",
            "transfer": "near",
            "bloom": "Understand",
            "stem": "List three major language-model task families (e.g., CLM, MLM, NSP) and explain for each how training data are obtained without manual labels.",
            "answer": "Self-supervised setups: CLM uses next-token prediction on raw text; MLM masks tokens and predicts them; NSP judges sentence continuity. All use raw corpora.",
            "type_specific": {},
            "rationale": "Slides describe CLM/MLM/NSP and that large raw corpora enable self-supervised training.",
            "hints": ["Think how tokens are hidden or predicted.", "Name the prediction target for each task."],
            "tags": ["concept:task-families", "bloom:Understand"],
            "source_ids": ["doc:lm-slides#mlm-clm-nsp"],
            "structure_fidelity": "adapted",
            "ask_confidence": True,
            "reading_level_grade": 13
        },
        {
            "derived_from_item_id": "EX-Q2",
            "objective_id": "OBJ2",
            "type": "short_answer",
            "difficulty": "medium",
            "transfer": "near",
            "bloom": "Understand",
            "stem": "Define the membership and continuation problems in language modeling and name a model type suited to each.",
            "answer": "Membership: decide if a sequence belongs to language L; Continuation: predict what follows a given prefix. Grammars or discriminators address membership; causal LMs address continuation.",
            "type_specific": {},
            "rationale": "Slides explicitly define both problems and typical solutions.",
            "hints": ["Membership asks 'is this in L?'", "Continuation asks 'what comes next?'"],
            "tags": ["concept:membership", "concept:continuation", "bloom:Understand"],
            "source_ids": ["doc:lm-slides#membership-continuation"],
            "structure_fidelity": "exact",
            "ask_confidence": True,
            "reading_level_grade": 13
        },
        {
            "derived_from_item_id": "EX-Q3",
            "objective_id": "OBJ3",
            "type": "short_answer",
            "difficulty": "easy",
            "transfer": "near",
            "bloom": "Understand",
            "stem": "Briefly contrast supervised learning with self-supervised pre-training plus fine-tuning.",
            "answer": "Supervised uses labeled pairs for the target task. Self-supervised pre-training learns from raw text (e.g., CLM/MLM), then a smaller labeled set fine-tunes the model.",
            "type_specific": {},
            "rationale": "Slides cover pre-training on raw text and fine-tuning with labels as transfer learning.",
            "hints": ["Which phase uses labels?", "Which phase uses raw text only?"],
            "tags": ["concept:pretrain-finetune", "bloom:Understand"],
            "source_ids": ["doc:lm-slides#pretrain-finetune-transfer"],
            "structure_fidelity": "adapted",
            "ask_confidence": True,
            "reading_level_grade": 13
        },
        {
            "derived_from_item_id": "EX-Q4",
            "objective_id": "OBJ4",
            "type": "numeric_response",
            "difficulty": "hard",
            "transfer": "near",
            "bloom": "Apply",
            "stem": "A classifier with softmax predicts p(correct)=0.20 for the true class. Compute the cross-entropy loss L = −log p(correct). Use natural log.",
            "answer": 1.609437912,
            "type_specific": {"tolerance": 0.001, "unit": "unitless"},
            "rationale": "For one-hot y, cross-entropy equals −log probability of the true class.",
            "hints": ["Recall L = −log p(y_true).", "Use p=0.20."],
            "tags": ["concept:cross-entropy", "bloom:Apply"],
            "source_ids": ["doc:lm-slides#loss-softmax"],
            "structure_fidelity": "adapted",
            "ask_confidence": True,
            "reading_level_grade": 13
        },
        {
            "derived_from_item_id": "EX-Q5",
            "objective_id": "OBJ5",
            "type": "short_answer",
            "difficulty": "easy",
            "transfer": "near",
            "bloom": "Remember",
            "stem": "What does softmax do to a real-valued vector of logits?",
            "answer": "Maps it to a probability distribution: non-negative components that sum to 1, emphasizing relatively larger logits.",
            "type_specific": {},
            "rationale": "Slides present softmax-normalized outputs for multi-class prediction.",
            "hints": ["Think normalization.", "Sum of outputs equals what?"],
            "tags": ["concept:softmax", "bloom:Remember"],
            "source_ids": ["doc:lm-slides#loss-softmax"],
            "structure_fidelity": "exact",
            "ask_confidence": True,
            "reading_level_grade": 13
        }
    ]


def _generate_summative_quiz_items(topic: str, difficulty: str, max_questions: int) -> list:
    """Generate summative exam quiz items with measurement focus."""
    return [
        {
            "derived_from_item_id": "SUM-Q1",
            "objective_id": "OBJ1",
            "type": "two_tier",
            "difficulty": "medium",
            "transfer": "far",
            "bloom": "Analyze",
            "stem": "A language model trained on web text performs poorly on medical terminology. What is the primary reason?",
            "choices": [
                {"id": "A", "text": "The model lacks sufficient parameters", "correct": False},
                {"id": "B", "text": "Domain mismatch between training and test data", "correct": True},
                {"id": "C", "text": "The model uses outdated architecture", "correct": False},
                {"id": "D", "text": "Insufficient training time", "correct": False}
            ],
            "answer": "B",
            "type_specific": {
                "answer_choices": [
                    {"id": "A", "text": "The model lacks sufficient parameters", "correct": False},
                    {"id": "B", "text": "Domain mismatch between training and test data", "correct": True},
                    {"id": "C", "text": "The model uses outdated architecture", "correct": False},
                    {"id": "D", "text": "Insufficient training time", "correct": False}
                ],
                "reason_choices": [
                    {"id": "1", "text": "Web text contains limited medical vocabulary", "correct": True},
                    {"id": "2", "text": "Medical texts require different tokenization", "correct": False},
                    {"id": "3", "text": "Models cannot learn domain-specific patterns", "correct": False}
                ]
            },
            "rationale": "Domain mismatch occurs when training and test distributions differ significantly.",
            "tags": ["concept:domain-adaptation", "bloom:Analyze"],
            "source_ids": ["doc:lm-slides#pretrain-finetune-transfer"],
            "intended_p_value": 0.6,
            "discrimination_intent": "high"
        },
        {
            "derived_from_item_id": "SUM-Q2",
            "objective_id": "OBJ2",
            "type": "data_interpretation",
            "difficulty": "hard",
            "transfer": "far",
            "bloom": "Evaluate",
            "stem": "Given the cross-entropy loss values: Training=0.5, Validation=0.8. What does this indicate?",
            "answer": "The model is overfitting to the training data.",
            "type_specific": {
                "data_source": "table",
                "data_spec": "Training Loss: 0.5\nValidation Loss: 0.8",
                "question": "What does this loss pattern indicate about model performance?",
                "answer": "The model is overfitting to the training data."
            },
            "rationale": "Higher validation loss than training loss indicates overfitting.",
            "tags": ["concept:overfitting", "bloom:Evaluate"],
            "source_ids": ["doc:lm-slides#loss-softmax"],
            "intended_p_value": 0.35,
            "discrimination_intent": "high"
        }
    ]


def _generate_diagnostic_quiz_items(topic: str, difficulty: str, max_questions: int) -> list:
    """Generate diagnostic pre-test quiz items for prior knowledge mapping."""
    return [
        {
            "derived_from_item_id": "DIAG-Q1",
            "objective_id": "OBJ1",
            "type": "mcq_single",
            "difficulty": "easy",
            "transfer": "near",
            "bloom": "Remember",
            "stem": "What is the primary goal of language modeling?",
            "choices": [
                {"id": "A", "text": "To translate between languages", "correct": False},
                {"id": "B", "text": "To predict the next word in a sequence", "correct": True},
                {"id": "C", "text": "To classify text sentiment", "correct": False},
                {"id": "D", "text": "To extract named entities", "correct": False}
            ],
            "answer": "B",
            "type_specific": {},
            "rationale": "Language modeling focuses on predicting subsequent tokens.",
            "tags": ["diagnostic:true", "subskill:basic-understanding", "bloom:Remember"],
            "source_ids": ["doc:lm-slides#membership-continuation"],
            "ask_confidence": True
        },
        {
            "derived_from_item_id": "DIAG-Q2",
            "objective_id": "OBJ2",
            "type": "categorization",
            "difficulty": "medium",
            "transfer": "near",
            "bloom": "Understand",
            "stem": "Categorize these learning approaches:",
            "answer": "Supervised: labeled pairs, Self-supervised: raw text, Unsupervised: no labels",
            "type_specific": {
                "categories": ["Supervised", "Self-supervised", "Unsupervised"],
                "items": [
                    {"text": "Learning from labeled input-output pairs", "category": "Supervised"},
                    {"text": "Learning from raw text without labels", "category": "Self-supervised"},
                    {"text": "Learning patterns without any supervision", "category": "Unsupervised"}
                ]
            },
            "rationale": "Different learning paradigms use different types of supervision.",
            "tags": ["diagnostic:true", "subskill:learning-paradigms", "bloom:Understand"],
            "source_ids": ["doc:lm-slides#pretrain-finetune-transfer"],
            "ask_confidence": True
        }
    ]


def _generate_mastery_quiz_items(topic: str, difficulty: str, max_questions: int) -> list:
    """Generate mastery check quiz items with high bar and narrow scope."""
    return [
        {
            "derived_from_item_id": "MAST-Q1",
            "objective_id": "OBJ1",
            "type": "mcq_single",
            "difficulty": "hard",
            "transfer": "far",
            "bloom": "Apply",
            "stem": "In a transformer model, which component is responsible for learning contextual relationships between tokens?",
            "choices": [
                {"id": "A", "text": "Feed-forward networks", "correct": False},
                {"id": "B", "text": "Multi-head attention", "correct": True},
                {"id": "C", "text": "Layer normalization", "correct": False},
                {"id": "D", "text": "Positional encoding", "correct": False}
            ],
            "answer": "B",
            "type_specific": {},
            "rationale": "Multi-head attention mechanisms capture relationships between all token pairs.",
            "hints": ["Think about what component processes token relationships."],
            "tags": ["concept:attention-mechanism", "bloom:Apply"],
            "source_ids": ["doc:lm-slides#mlm-clm-nsp"],
            "self_explanation_prompt": "Explain why attention is crucial for language understanding."
        },
        {
            "derived_from_item_id": "MAST-Q2",
            "objective_id": "OBJ2",
            "type": "explain_why",
            "difficulty": "hard",
            "transfer": "far",
            "bloom": "Analyze",
            "stem": "Why does increasing model size typically improve performance on language tasks?",
            "answer": "Larger models have more parameters to capture complex patterns and can store more knowledge, leading to better generalization.",
            "type_specific": {},
            "rationale": "Model capacity scales with parameter count, enabling better pattern recognition.",
            "hints": ["Consider the relationship between parameters and model capacity."],
            "tags": ["concept:model-scaling", "bloom:Analyze"],
            "source_ids": ["doc:lm-slides#pretrain-finetune-transfer"],
            "self_explanation_prompt": "Analyze the trade-offs of model scaling."
        }
    ]


# Mock data registry mapping tasks to their respective mock functions
MOCK_REGISTRY = {
    Task.FLASHCARDS: mock_flashcards,
    Task.SYLLABUS: mock_syllabus,
    Task.TEST: mock_test,
    Task.CONTENT: mock_content,
    Task.QUIZ: mock_quiz
}


class MockDataRegistry:
    """Registry for mock data functions."""
    
    def __init__(self):
        self.registry = MOCK_REGISTRY
    
    def get_mock_response(self, task: Task, payload: dict) -> dict:
        """Get mock response for a given task."""
        mock_func = self.registry.get(task)
        if not mock_func:
            raise ValueError(f"No mock function registered for task: {task}")
        
        return mock_func(payload)
    
    def register_mock_function(self, task: Task, mock_func):
        """Register a mock function for a task."""
        self.registry[task] = mock_func


# Global registry instance
mock_registry = MockDataRegistry()