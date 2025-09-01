#!/usr/bin/env python3
"""
Script to create test flashcard data for development/testing.
"""
import os
import sys
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from backend.apps.projects.models import Project
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.accounts.models import CustomUser

def create_test_flashcards():
    """Create test flashcard data."""
    
    # Get the first project and user
    try:
        project = Project.objects.first()
        user = CustomUser.objects.first()
        
        if not project:
            print("No projects found. Please create a project first.")
            return
            
        if not user:
            print("No users found. Please create a user first.")
            return
            
        print(f"Using project: {project.name} (ID: {project.id})")
        print(f"Using user: {user.email}")
        
        # Create a flashcard set
        flashcard_set = FlashcardSet.objects.create(
            title="Test Flashcard Set",
            owner=user,
            description="A test set of flashcards for development"
        )
        
        # Link it to the project
        flashcard_set.project_links.create(project=project)
        
        # Create some test flashcards
        test_cards = [
            {
                "question": "What is the capital of France?",
                "answer": "Paris",
                "concept_id": "geography-capitals",
                "difficulty": "easy",
                "bloom_level": "remember",
                "card_type": "definition",
                "theme": "Geography",
                "hints": ["Think of the Eiffel Tower"],
                "examples": ["Paris is known for fashion and culture"],
                "common_misconceptions": ["London", "Berlin"]
            },
            {
                "question": "What is the main purpose of React Hooks?",
                "answer": "React Hooks allow functional components to use state and lifecycle features that were previously only available in class components.",
                "concept_id": "react-hooks-basics",
                "difficulty": "medium",
                "bloom_level": "understand",
                "card_type": "concept",
                "theme": "React",
                "hints": ["Think about state management in functional components"],
                "examples": ["useState, useEffect, useContext"],
                "common_misconceptions": ["They replace all class components", "They make components faster"]
            },
            {
                "question": "How does machine learning differ from traditional programming?",
                "answer": "Traditional programming follows explicit rules and instructions, while machine learning learns patterns from data to make predictions or decisions without being explicitly programmed for each scenario.",
                "concept_id": "ml-vs-traditional",
                "difficulty": "hard",
                "bloom_level": "analyze",
                "card_type": "comparison",
                "theme": "Machine Learning",
                "hints": ["Think about how decisions are made"],
                "examples": ["Image recognition, natural language processing"],
                "common_misconceptions": ["ML is just statistics", "ML can solve any problem"]
            }
        ]
        
        for i, card_data in enumerate(test_cards):
            flashcard = Flashcard.objects.create(
                flashcard_set=flashcard_set,
                question=card_data["question"],
                answer=card_data["answer"],
                concept_id=card_data["concept_id"],
                difficulty=card_data["difficulty"],
                bloom_level=card_data["bloom_level"],
                card_type=card_data["card_type"],
                theme=card_data["theme"],
                hints=card_data["hints"],
                examples=card_data["examples"],
                common_misconceptions=card_data["common_misconceptions"]
            )
            print(f"Created flashcard: {card_data['question'][:50]}...")
        
        print(f"\n✅ Successfully created:")
        print(f"   - 1 flashcard set: {flashcard_set.title}")
        print(f"   - {len(test_cards)} flashcards")
        print(f"   - Linked to project: {project.name}")
        
    except Exception as e:
        print(f"Error creating test flashcards: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_test_flashcards()
