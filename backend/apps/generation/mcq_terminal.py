#!/usr/bin/env python3
"""
Terminal-based Multiple Choice Question Quiz System
"""

import sys
import os
import re
from typing import List, Dict

# Add the parent directory to the path so we can import our services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generation.services.mcq_parser import parse_mcq_text


class MCQTerminalQuiz:
    """
    Terminal-based quiz system for multiple-choice questions.
    """
    
    def __init__(self):
        self.questions = []
        self.current_question = 0
        self.score = 0
        self.total_questions = 0
    
    def load_questions_from_text(self, text: str):
        """
        Load questions from the provided text.
        
        Args:
            text: The text containing questions in the specified format
        """
        self.questions = parse_mcq_text(text)
        self.total_questions = len(self.questions)
        print(f"\n📚 Loaded {self.total_questions} questions!")
    
    def display_question(self, question: Dict) -> str:
        """
        Display a single question and get user input.
        
        Args:
            question: The question dictionary
            
        Returns:
            The user's answer (A, B, C, or D)
        """
        print("\n" + "="*60)
        print(f"Question {self.current_question + 1} of {self.total_questions}")
        print(f"Type: {question['question_type'].replace('_', ' ').title()}")
        print("="*60)
        
        # Display the question text (remove the choices part)
        question_lines = question['question_text'].split('\n')
        question_text_lines = []
        
        for line in question_lines:
            line = line.strip()
            if not line:
                continue
            if re.match(r'^[A-D][\.\)]', line):
                break
            question_text_lines.append(line)
        
        question_text = '\n'.join(question_text_lines)
        print(f"\n{question_text}")
        
        # Display choices
        print("\nChoices:")
        for choice in question['choices']:
            print(f"{choice['letter']}. {choice['text']}")
        
        # Get user input
        while True:
            answer = input("\nYour answer (A/B/C/D): ").strip().upper()
            if answer in ['A', 'B', 'C', 'D']:
                return answer
            else:
                print("❌ Invalid input. Please enter A, B, C, or D.")
    
    def check_answer(self, question: Dict, user_answer: str) -> bool:
        """
        Check if the user's answer is correct.
        
        Args:
            question: The question dictionary
            user_answer: The user's answer (A, B, C, or D)
            
        Returns:
            True if correct, False otherwise
        """
        # Find the correct choice
        correct_choice = None
        for choice in question['choices']:
            if choice['is_correct']:
                correct_choice = choice
                break
        
        if not correct_choice:
            print("⚠️  Warning: Could not determine correct answer!")
            return False
        
        is_correct = user_answer == correct_choice['letter']
        
        # Display feedback
        if is_correct:
            print("\n✅ Correct!")
            self.score += 1
        else:
            print(f"\n❌ Incorrect. The correct answer was {correct_choice['letter']}.")
        
        # Display explanation
        print(f"\n📖 Explanation:")
        print(question['explanation'])
        
        return is_correct
    
    def run_quiz(self):
        """
        Run the complete quiz.
        """
        if not self.questions:
            print("❌ No questions loaded!")
            return
        
        print("\n🎯 Starting Multiple Choice Quiz!")
        print("Answer each question by entering A, B, C, or D.")
        print("Press Enter to continue after each question...")
        
        input("\nPress Enter to start...")
        
        for i, question in enumerate(self.questions):
            self.current_question = i
            
            # Display question and get answer
            user_answer = self.display_question(question)
            
            # Check answer and show feedback
            self.check_answer(question, user_answer)
            
            # Show progress
            print(f"\n📊 Progress: {i + 1}/{self.total_questions} questions completed")
            print(f"🎯 Current Score: {self.score}/{i + 1}")
            
            if i < len(self.questions) - 1:
                input("\nPress Enter for next question...")
        
        # Show final results
        self.show_final_results()
    
    def show_final_results(self):
        """
        Display the final quiz results.
        """
        print("\n" + "="*60)
        print("🎉 QUIZ COMPLETED!")
        print("="*60)
        
        percentage = (self.score / self.total_questions) * 100
        
        print(f"📊 Final Score: {self.score}/{self.total_questions}")
        print(f"📈 Percentage: {percentage:.1f}%")
        
        # Provide feedback based on score
        if percentage >= 90:
            print("🏆 Excellent! Outstanding performance!")
        elif percentage >= 80:
            print("🥇 Great job! Very good understanding!")
        elif percentage >= 70:
            print("🥈 Good work! Solid understanding!")
        elif percentage >= 60:
            print("🥉 Not bad! Room for improvement.")
        else:
            print("📚 Keep studying! Review the material and try again.")
        
        print("="*60)


def get_text_input() -> str:
    """
    Get text input from the user through the terminal.
    
    Returns:
        The input text string
    """
    print("\n📝 Please enter your multiple-choice questions text.")
    print("Format: Use <question> and <explanation> tags as shown in the example.")
    print("Type 'END' on a new line when you're done entering text.")
    print("="*60)
    
    lines = []
    print("\nEnter your text (type 'END' when finished):")
    
    while True:
        try:
            line = input()
            if line.strip().upper() == 'END':
                break
            lines.append(line)
        except EOFError:
            break
        except KeyboardInterrupt:
            print("\n\n❌ Input cancelled by user.")
            sys.exit(1)
    
    return '\n'.join(lines)


def get_text_from_file() -> str:
    """
    Get text from a file uploaded by the user.
    
    Returns:
        The text content from the file
    """
    while True:
        file_path = input("\n📁 Enter the path to your text file: ").strip()
        
        if not file_path:
            print("❌ No file path provided.")
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                print(f"✅ Successfully loaded file: {file_path}")
                return content
        except FileNotFoundError:
            print(f"❌ File not found: {file_path}")
        except PermissionError:
            print(f"❌ Permission denied: {file_path}")
        except Exception as e:
            print(f"❌ Error reading file: {e}")
        
        retry = input("Would you like to try another file? (y/n): ").strip().lower()
        if retry not in ['y', 'yes']:
            return ""


def show_example_format():
    """
    Show an example of the expected text format.
    """
    print("\n📋 Example formats (all supported):")
    print("="*50)
    print("""Format 1 - Tags:
✅ MEMORY-ONLY QUESTIONS
<question> Which two dimensions define the valence–dominance model of facial social perception?
A. Attractiveness and competence
B. Trustworthiness and dominance
C. Familiarity and similarity
D. Expressiveness and maturity

<explanation> **Correct: B.** Oosterhof & Todorov (2008) propose trustworthiness (valence) and dominance as core social dimensions.

Format 2 - Short tags:
<q> What is the capital of France?
A) Paris
B) London
C) Berlin
D) Madrid

<e> The answer is A. Paris is the capital of France.

Format 3 - Numbered questions:
1. Which planet is closest to the sun?
A. Mercury
B. Venus
C. Earth
D. Mars

Answer: A is correct. Mercury is the closest planet to the sun.

Format 4 - Simple format:
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6

The answer is B. 2 + 2 = 4.

Format 5 - With explanations:
Question: What is photosynthesis?
A) A chemical process in plants
B) A type of animal behavior
C) A geological process
D) An astronomical phenomenon

Explanation: A is correct. Photosynthesis is the process by which plants convert sunlight into energy.""")


def main():
    """
    Main function to run the MCQ terminal quiz.
    """
    quiz = MCQTerminalQuiz()
    
    print("🎯 Multiple Choice Question Quiz System")
    print("="*50)
    
    # Ask user if they want to see the example format
    while True:
        show_example = input("\nWould you like to see examples of supported formats? (y/n): ").strip().lower()
        if show_example in ['y', 'yes']:
            show_example_format()
            break
        elif show_example in ['n', 'no']:
            break
        else:
            print("Please enter 'y' or 'n'.")
    
    # Ask user how they want to input text
    print("\n📥 How would you like to input your questions?")
    print("1. Type text directly in terminal")
    print("2. Upload a text file")
    
    while True:
        choice = input("\nEnter your choice (1 or 2): ").strip()
        if choice == '1':
            text = get_text_input()
            break
        elif choice == '2':
            text = get_text_from_file()
            break
        else:
            print("Please enter 1 or 2.")
    
    if not text.strip():
        print("❌ No text provided. Exiting.")
        return
    
    # Load questions from the user's text
    try:
        quiz.load_questions_from_text(text)
    except Exception as e:
        print(f"❌ Error parsing questions: {e}")
        print("Please check your text format and try again.")
        return
    
    if quiz.total_questions == 0:
        print("❌ No valid questions found in the provided text.")
        print("Please check the format and try again.")
        return
    
    # Run the quiz
    quiz.run_quiz()


if __name__ == "__main__":
    main() 