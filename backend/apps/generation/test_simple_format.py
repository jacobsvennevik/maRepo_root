#!/usr/bin/env python3
"""
Test script for the flexible MCQ parser
"""

import sys
import os

# Add the parent directory to the path so we can import our services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.apps.generation.services.mcq_parser import parse_mcq_text

# Test different formats
test_texts = [
    # Format 1: Simple numbered questions
    """1. What is 2 + 2?
A. 3
B. 4
C. 5
D. 6

The answer is B. 2 + 2 = 4.

2. What is the capital of France?
A) Paris
B) London
C) Berlin
D) Madrid

Answer: A is correct. Paris is the capital of France.""",

    # Format 2: Tagged format
    """<question> What is photosynthesis?
A. A chemical process in plants
B. A type of animal behavior
C. A geological process
D. An astronomical phenomenon

<explanation> A is correct. Photosynthesis is the process by which plants convert sunlight into energy.""",

    # Format 3: Short tags
    """<q> Which planet is closest to the sun?
A) Mercury
B) Venus
C) Earth
D) Mars

<e> The answer is A. Mercury is the closest planet to the sun."""
]

def test_parser():
    """Test the parser with different formats."""
    for i, text in enumerate(test_texts, 1):
        print(f"\n{'='*60}")
        print(f"Testing Format {i}")
        print(f"{'='*60}")
        print(f"Input text:\n{text}")
        print(f"\n{'='*60}")
        
        try:
            questions = parse_mcq_text(text)
            print(f"Parsed {len(questions)} questions:")
            
            for j, question in enumerate(questions, 1):
                print(f"\nQuestion {j}:")
                print(f"Text: {question['question_text'][:100]}...")
                print(f"Type: {question['question_type']}")
                print(f"Choices: {len(question['choices'])}")
                print(f"Correct answer: {question['correct_answer']}")
                
                for choice in question['choices']:
                    status = "✓" if choice['is_correct'] else " "
                    print(f"  {status} {choice['letter']}. {choice['text']}")
                
                if question['explanation']:
                    print(f"Explanation: {question['explanation'][:100]}...")
                    
        except Exception as e:
            print(f"Error parsing format {i}: {e}")

if __name__ == "__main__":
    test_parser() 