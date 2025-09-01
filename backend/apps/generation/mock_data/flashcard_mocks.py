import random
from typing import List, Dict, Any

def get_mock_flashcards(num_cards: int = 10, card_type: str = "written", difficulty: str = "medium", content: str = None) -> List[Dict[str, Any]]:
    """
    Generate mock flashcards without AI calls, optionally using real content.
    
    Args:
        num_cards: Number of flashcards to generate
        card_type: Type of cards ("written", "multiple_choice", "cloze")
        difficulty: Difficulty level ("easy", "medium", "hard")
        content: Real project content to extract keywords/topics from (optional)
        
    Returns:
        List of flashcard dictionaries with question/answer structure
    """
    
    # Rich mock data based on the provided example
    mock_concepts = [
        {
            "topic": "React Hooks",
            "questions": {
                "written": "What is the purpose of React Hooks and how do they change functional components?",
                "multiple_choice": "What is the primary benefit of React Hooks?",
                "cloze": "React Hooks allow you to use {{ _____ }} in functional components without writing a class."
            },
            "answers": {
                "written": "React Hooks allow functional components to use state and lifecycle features that were previously only available in class components. They enable cleaner, more reusable code.",
                "multiple_choice": {
                    "options": [
                        "Make components render faster",
                        "Use state in functional components", 
                        "Replace all class components",
                        "Eliminate the need for props"
                    ],
                    "correct_index": 1
                },
                "cloze": "state and lifecycle features"
            },
            "concept_id": "react-hooks-basics",
            "theme": "React",
            "learning_objective": "Understand the purpose and benefits of React Hooks"
        },
        {
            "topic": "JavaScript Promises",
            "questions": {
                "written": "Explain how JavaScript Promises work and why they are better than callbacks.",
                "multiple_choice": "What state represents a Promise that has completed successfully?",
                "cloze": "A Promise can be in one of three states: pending, {{ _____ }}, or rejected."
            },
            "answers": {
                "written": "Promises represent the eventual completion or failure of an asynchronous operation. They provide better error handling and avoid callback hell through chaining.",
                "multiple_choice": {
                    "options": [
                        "resolved",
                        "fulfilled", 
                        "completed",
                        "finished"
                    ],
                    "correct_index": 1
                },
                "cloze": "fulfilled"
            },
            "concept_id": "javascript-promises",
            "theme": "JavaScript",
            "learning_objective": "Master asynchronous programming with Promises"
        },
        {
            "topic": "Django Models",
            "questions": {
                "written": "What is the purpose of Django Models and how do they relate to database tables?",
                "multiple_choice": "What Django feature automatically handles database migrations?",
                "cloze": "Django Models use {{ _____ }} to map Python classes to database tables."
            },
            "answers": {
                "written": "Django Models define the structure and behavior of data. Each model class represents a database table, with class attributes representing table fields.",
                "multiple_choice": {
                    "options": [
                        "Django Admin",
                        "Django Migrations",
                        "Django ORM", 
                        "Django Views"
                    ],
                    "correct_index": 1
                },
                "cloze": "Object-Relational Mapping (ORM)"
            },
            "concept_id": "django-models-basics",
            "theme": "Django",
            "learning_objective": "Understand Django Models and ORM concepts"
        },
        {
            "topic": "API Design",
            "questions": {
                "written": "What are the key principles of RESTful API design?",
                "multiple_choice": "Which HTTP method is typically used to update a resource?",
                "cloze": "REST APIs use {{ _____ }} methods to perform different operations on resources."
            },
            "answers": {
                "written": "RESTful APIs follow principles like statelessness, uniform interface, resource-based URLs, and appropriate HTTP methods. They should be predictable and consistent.",
                "multiple_choice": {
                    "options": [
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE"
                    ],
                    "correct_index": 2
                },
                "cloze": "HTTP"
            },
            "concept_id": "restful-api-design",
            "theme": "API Design",
            "learning_objective": "Design effective RESTful APIs"
        },
        {
            "topic": "Database Indexing",
            "questions": {
                "written": "How do database indexes improve query performance and what are the trade-offs?",
                "multiple_choice": "What is the main trade-off of adding database indexes?",
                "cloze": "Database indexes speed up {{ _____ }} operations but can slow down {{ _____ }} operations."
            },
            "answers": {
                "written": "Indexes create data structures that allow faster lookups by avoiding full table scans. However, they require additional storage and slow down write operations.",
                "multiple_choice": {
                    "options": [
                        "Increased storage requirements",
                        "Slower write operations",
                        "More complex queries",
                        "Both A and B"
                    ],
                    "correct_index": 3
                },
                "cloze": "read, write"
            },
            "concept_id": "database-indexing",
            "theme": "Databases",
            "learning_objective": "Optimize database performance with proper indexing"
        },
        {
            "topic": "TypeScript Types",
            "questions": {
                "written": "What are the benefits of using TypeScript over JavaScript in large applications?",
                "multiple_choice": "What does TypeScript add to JavaScript?",
                "cloze": "TypeScript provides {{ _____ }} checking at compile time to catch errors early."
            },
            "answers": {
                "written": "TypeScript adds static type checking, better IDE support, early error detection, and improved code documentation. It helps prevent runtime errors and makes refactoring safer.",
                "multiple_choice": {
                    "options": [
                        "Runtime performance",
                        "Static type checking",
                        "New syntax features",
                        "Automatic optimization"
                    ],
                    "correct_index": 1
                },
                "cloze": "static type"
            },
            "concept_id": "typescript-benefits",
            "theme": "TypeScript",
            "learning_objective": "Understand the advantages of static typing"
        }
    ]
    
    # Adjust difficulty-specific variations
    difficulty_modifiers = {
        "easy": {
            "bloom_level": "remember",
            "hint_probability": 0.8,
            "examples_count": 2
        },
        "medium": {
            "bloom_level": "understand", 
            "hint_probability": 0.5,
            "examples_count": 1
        },
        "hard": {
            "bloom_level": "analyze",
            "hint_probability": 0.2,
            "examples_count": 0
        }
    }
    
    print(f"🔍 DEBUG: get_mock_flashcards() called with num_cards={num_cards}, difficulty={difficulty}, content={'provided' if content else 'None'}")
    
    # Extract keywords from content if provided
    content_keywords = []
    if content:
        content_keywords = _extract_keywords_from_content(content)
        print(f"🔍 DEBUG: Extracted keywords from content: {content_keywords[:5]}...")  # Show first 5
    else:
        print(f"🔍 DEBUG: No content provided - using default mock concepts")
    
    flashcards = []
    
    for i in range(num_cards):
        # Cycle through available concepts
        concept = mock_concepts[i % len(mock_concepts)]
        modifier = difficulty_modifiers.get(difficulty, difficulty_modifiers["medium"])
        
        # Create the flashcard based on type
        if card_type == "multiple_choice":
            flashcard = {
                "question": concept["questions"]["multiple_choice"],
                "answer": concept["answers"]["multiple_choice"]["correct_index"],
                "options": concept["answers"]["multiple_choice"]["options"],
                "type": "multiple_choice"
            }
        elif card_type == "cloze":
            flashcard = {
                "question": concept["questions"]["cloze"],
                "answer": concept["answers"]["cloze"],
                "type": "cloze"
            }
        else:  # Default to written
            flashcard = {
                "question": concept["questions"]["written"],
                "answer": concept["answers"]["written"],
                "type": "written"
            }
        
        # Use content keywords to customize the flashcard if available
        if content_keywords and i < len(content_keywords):
            keyword = content_keywords[i]
            # Customize question to include content-specific keyword
            if card_type == "written":
                flashcard["question"] = f"Based on your content: What is {keyword} and how does it relate to the material?"
                flashcard["answer"] = f"{keyword} is a key concept from your content. {flashcard['answer']}"
            elif card_type == "multiple_choice":
                flashcard["question"] = f"In your content, what role does {keyword} play?"
        
        # Add rich metadata
        flashcard.update({
            "concept_id": f"{concept['concept_id']}-{i+1}",
            "difficulty": difficulty,
            "bloom_level": modifier["bloom_level"],
            "theme": concept["theme"],
            "learning_objective": concept["learning_objective"],
            "related_concepts": [concept["concept_id"]],
        })
        
        # Add hints based on difficulty
        if random.random() < modifier["hint_probability"]:
            flashcard["hints"] = [f"Think about the core purpose of {concept['topic']}"]
            
        # Add examples for easier cards
        if modifier["examples_count"] > 0:
            flashcard["examples"] = [f"Example: {concept['topic']} in practice"]
        
        flashcards.append(flashcard)
    
    return flashcards


def get_mock_ai_response(prompt: str, response_type: str = "flashcards") -> str:
    """
    Generate a mock AI response that mimics real AI output format.
    
    IMPORTANT: This should only be used when testing AI client directly.
    For flashcard generation, use get_mock_flashcards() instead for rich data.
    
    Args:
        prompt: The input prompt (unused in mock)
        response_type: Type of response expected
        
    Returns:
        Formatted mock response string
    """
    if response_type == "flashcards":
        # This is only used if AI client mock mode is enabled
        # Normally, flashcard generation should use get_mock_flashcards() directly
        print("⚠️  WARNING: Using get_mock_ai_response() for flashcards - should use get_mock_flashcards() instead")
        
        # Return simple JSON format that matches AI response parsing
        return '''[
    {
        "question": "What is the main advantage of using a microservices architecture?",
        "answer": "Microservices allow independent deployment, scaling, and technology choices for different parts of an application, improving maintainability and team autonomy."
    },
    {
        "question": "How does database sharding improve performance?",
        "answer": "Sharding distributes data across multiple databases, reducing the load on any single database and allowing parallel processing of queries."
    },
    {
        "question": "What is the difference between authentication and authorization?",
        "answer": "Authentication verifies who you are (identity), while authorization determines what you're allowed to do (permissions)."
    }
]'''
    
    return "Mock AI response for general queries."


def _extract_keywords_from_content(content: str) -> List[str]:
    """
    Extract key terms/concepts from content using simple text analysis.
    This simulates what an AI would identify as important topics.
    """
    import re
    
    if not content:
        return []
    
    # Simple keyword extraction approach
    # Remove common words and extract potential concepts
    content_lower = content.lower()
    
    # Common stop words to ignore
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    }
    
    # Extract words (3+ characters, alphanumeric)
    words = re.findall(r'\b[a-zA-Z]{3,}\b', content_lower)
    
    # Filter out stop words and get unique words
    keywords = []
    word_freq = {}
    
    for word in words:
        if word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Sort by frequency and take top keywords
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    keywords = [word for word, freq in sorted_words[:20]]  # Top 20 keywords
    
    # Add some technical/academic terms if found
    technical_patterns = [
        r'\b\w+ing\b',  # gerunds (learning, programming, etc.)
        r'\b\w+tion\b',  # concepts ending in -tion
        r'\b\w+ism\b',   # concepts ending in -ism  
        r'\b\w+ogy\b',   # subjects ending in -ogy
    ]
    
    for pattern in technical_patterns:
        matches = re.findall(pattern, content_lower)
        for match in matches:
            if match not in stop_words and len(match) > 4:
                keywords.append(match)
    
    # Capitalize first letter for display
    keywords = [word.capitalize() for word in keywords[:15]]  # Limit to 15 keywords
    
    return keywords


def get_mock_mcq_data(num_questions: int = 12, difficulty: str = "medium", topic: str = "nlp") -> List[Dict[str, Any]]:
    """
    Generate mock MCQ data for NLP/ML topics based on the provided content.
    
    Args:
        num_questions: Number of MCQ questions to generate
        difficulty: Difficulty level ("easy", "medium", "hard")
        topic: Topic area ("nlp", "ml", "general")
        
    Returns:
        List of MCQ dictionaries with question, choices, correct_index, and explanation
    """
    
    # Rich MCQ data based on the provided NLP/ML content
    nlp_mcq_data = [
        {
            "question": "The principle of compositionality states that the meaning of an expression is determined by:",
            "choices": [
                "The most frequent word in the expression",
                "The meanings of its parts and how they are combined",
                "The length of the sentence only",
                "The parser used to analyze it"
            ],
            "correct_index": 1,
            "explanation": "Compositionality is a fundamental principle in linguistics and semantics where the meaning of a complex expression is determined by the meanings of its constituent parts and the rules used to combine them.",
            "topic": "Semantics",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "In distributional semantics, a word's meaning is represented primarily as:",
            "choices": [
                "A hand-crafted symbolic rule",
                "A vector derived from co-occurrence statistics",
                "A tree of syntactic categories only",
                "A list of dictionary senses"
            ],
            "correct_index": 1,
            "explanation": "Distributional semantics represents word meanings as vectors based on the statistical patterns of word co-occurrence in large text corpora.",
            "topic": "Distributional Semantics",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "Which of the following is **not** a common way to obtain a fixed-size sentence vector from word vectors?",
            "choices": [
                "Concatenation",
                "Sum (component-wise)",
                "Average (mean pooling)",
                "Median pooling"
            ],
            "correct_index": 3,
            "explanation": "Median pooling is rarely used for sentence vectorization. Common approaches include concatenation, sum, and average pooling.",
            "topic": "Vector Representations",
            "difficulty": "medium",
            "bloom_level": "apply"
        },
        {
            "question": "In CNNs for text, convolution typically operates over:",
            "choices": [
                "Characters only",
                "k-grams (e.g., bi-/tri-grams) with a sliding window",
                "Entire documents at once",
                "Dependency arcs only"
            ],
            "correct_index": 1,
            "explanation": "CNNs for text use sliding windows over k-grams (typically 2-5 words) to capture local patterns and features.",
            "topic": "CNNs",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "Max-pooling across word vectors tends to:",
            "choices": [
                "Penalize salient features",
                "Emphasize the largest activations per dimension",
                "Produce variable-length outputs",
                "Remove the need for training"
            ],
            "correct_index": 1,
            "explanation": "Max-pooling selects the maximum activation across each dimension, emphasizing the most prominent features.",
            "topic": "CNNs",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "A key limitation of simple bag-of-words style representations is that they:",
            "choices": [
                "Always capture long-distance dependencies",
                "Disambiguate word senses by default",
                "Ignore order and can cause 'semantic blur'",
                "Require a decoder at inference time"
            ],
            "correct_index": 2,
            "explanation": "Bag-of-words representations lose word order information, which can lead to semantic ambiguity and loss of meaning.",
            "topic": "Text Representations",
            "difficulty": "medium",
            "bloom_level": "analyze"
        },
        {
            "question": "A vanilla RNN updates its hidden state using:",
            "choices": [
                "Only the current input vector",
                "Only the previous hidden state",
                "A function of the previous state and current input",
                "A max over all past inputs only"
            ],
            "correct_index": 2,
            "explanation": "RNNs combine the current input with the previous hidden state to compute the new hidden state.",
            "topic": "RNNs",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "A standard remedy for **exploding** gradients in RNN training is:",
            "choices": [
                "Teacher forcing",
                "Gradient clipping",
                "Label smoothing",
                "Dropout on the input only"
            ],
            "correct_index": 1,
            "explanation": "Gradient clipping prevents exploding gradients by limiting the norm of gradients during backpropagation.",
            "topic": "RNNs",
            "difficulty": "medium",
            "bloom_level": "apply"
        },
        {
            "question": "Gated cells used to improve RNNs' long-range behavior include:",
            "choices": [
                "LSTM and GRU",
                "SVM and k-NN",
                "PCA and ICA",
                "CNN and MLP"
            ],
            "correct_index": 0,
            "explanation": "LSTM (Long Short-Term Memory) and GRU (Gated Recurrent Unit) are gated RNN architectures designed to handle long-range dependencies.",
            "topic": "RNNs",
            "difficulty": "medium",
            "bloom_level": "remember"
        },
        {
            "question": "In sequence-to-sequence learning, a common approach is to use:",
            "choices": [
                "A decoder whose initial state comes from the encoder's final state",
                "A decoder with random initial state unrelated to the encoder",
                "No encoder at all",
                "An encoder that reads outputs instead of inputs"
            ],
            "correct_index": 0,
            "explanation": "The encoder-decoder architecture passes the encoder's final hidden state to initialize the decoder's hidden state.",
            "topic": "Sequence-to-Sequence",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "Self-attention (single head) most directly involves:",
            "choices": [
                "Computing softmax-normalized dot-product scores to weight value vectors",
                "Counting word frequencies only",
                "Sorting words by position and averaging",
                "Replacing vectors with one-hot indices"
            ],
            "correct_index": 0,
            "explanation": "Self-attention computes attention scores between all positions and uses them to weight the value vectors.",
            "topic": "Attention",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        {
            "question": "Transformer models, as presented in the slides, primarily:",
            "choices": [
                "Rely on recurrence and convolution",
                "Dispense with both recurrence and convolution, using multi-head attention with positional embeddings",
                "Require processing tokens strictly one-by-one without parallelism",
                "Cannot outperform encoder-decoder CNNs on translation"
            ],
            "correct_index": 1,
            "explanation": "Transformers replace recurrence and convolution with multi-head self-attention and positional embeddings.",
            "topic": "Transformers",
            "difficulty": "medium",
            "bloom_level": "understand"
        }
    ]
    
    # Additional questions for different topics
    ml_mcq_data = [
        {
            "question": "What is the primary goal of supervised learning?",
            "choices": [
                "To discover hidden patterns in data",
                "To learn a mapping from inputs to outputs using labeled examples",
                "To optimize computational efficiency",
                "To reduce data storage requirements"
            ],
            "correct_index": 1,
            "explanation": "Supervised learning uses labeled training data to learn a function that maps inputs to desired outputs.",
            "topic": "Supervised Learning",
            "difficulty": "easy",
            "bloom_level": "remember"
        },
        {
            "question": "Which of the following is NOT a common activation function in neural networks?",
            "choices": [
                "ReLU",
                "Sigmoid",
                "Tanh",
                "Linear (no activation)"
            ],
            "correct_index": 3,
            "explanation": "Linear activation (no activation) is not commonly used in hidden layers as it limits the network's representational power.",
            "topic": "Neural Networks",
            "difficulty": "medium",
            "bloom_level": "remember"
        }
    ]
    
    # Select appropriate dataset based on topic
    if topic == "nlp":
        base_data = nlp_mcq_data
    elif topic == "ml":
        base_data = ml_mcq_data
    else:
        base_data = nlp_mcq_data + ml_mcq_data
    
    # Return requested number of questions
    return base_data[:num_questions]


def get_mock_assessment_data(assessment_type: str = "mixed", num_items: int = 10, difficulty: str = "medium") -> List[Dict[str, Any]]:
    """
    Generate mock assessment data for different types (flashcards, MCQ, mixed).
    
    Args:
        assessment_type: Type of assessment ("flashcards", "mcq", "mixed")
        num_items: Number of items to generate
        difficulty: Difficulty level
        
    Returns:
        List of assessment items in the appropriate format
    """
    
    if assessment_type == "flashcards":
        return get_mock_flashcards(num_items, "written", difficulty)
    elif assessment_type == "mcq":
        mcq_data = get_mock_mcq_data(num_items, difficulty)
        # Convert to assessment item format
        return [
            {
                "item_type": "MCQ",
                "question": item["question"],
                "answer": item["choices"][item["correct_index"]],
                "choices": item["choices"],
                "correct_index": item["correct_index"],
                "explanation": item["explanation"],
                "difficulty": item["difficulty"],
                "bloom_level": item["bloom_level"],
                "topic": item["topic"]
            }
            for item in mcq_data
        ]
    elif assessment_type == "mixed":
        # Mix flashcards and MCQs
        flashcard_count = int(num_items * 0.6)  # 60% flashcards
        mcq_count = num_items - flashcard_count
        
        flashcards = get_mock_flashcards(flashcard_count, "written", difficulty)
        mcq_data = get_mock_mcq_data(mcq_count, difficulty)
        
        # Convert flashcards to assessment format
        flashcard_items = [
            {
                "item_type": "FLASHCARD",
                "question": item["question"],
                "answer": item["answer"],
                "difficulty": item["difficulty"],
                "bloom_level": item["bloom_level"],
                "topic": item.get("theme", "General")
            }
            for item in flashcards
        ]
        
        # Convert MCQs to assessment format
        mcq_items = [
            {
                "item_type": "MCQ",
                "question": item["question"],
                "answer": item["choices"][item["correct_index"]],
                "choices": item["choices"],
                "correct_index": item["correct_index"],
                "explanation": item["explanation"],
                "difficulty": item["difficulty"],
                "bloom_level": item["bloom_level"],
                "topic": item["topic"]
            }
            for item in mcq_data
        ]
        
        return flashcard_items + mcq_items
    
    else:
        return get_mock_flashcards(num_items, "written", difficulty)
