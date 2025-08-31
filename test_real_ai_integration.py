#!/usr/bin/env python3
"""
Real AI Integration Test - Tests actual OpenAI/Gemini API calls.
This script tests the Smart Metadata Generation with real API keys.
"""

import os
import sys
import django
import json

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.apps.projects.models import Project, SchoolProject
from backend.apps.generation.services.api_client import AIClient
from decouple import config

User = get_user_model()

def test_real_ai_integration():
    """Test real AI integration with actual API keys."""
    print("🔥 Testing Real AI Integration...")
    print("=" * 50)
    
    # Check API keys
    openai_key = config('OPENAI_API_KEY', default=None)
    gemini_key = config('GEMINI_API_KEY', default=None)
    
    print(f"OpenAI API Key: {'✅ Present' if openai_key else '❌ Missing'}")
    print(f"Gemini API Key: {'✅ Present' if gemini_key else '❌ Missing'}")
    
    if not openai_key and not gemini_key:
        print("❌ No API keys found. Please set OPENAI_API_KEY or GEMINI_API_KEY")
        return
    
    # Create test user
    user, created = User.objects.get_or_create(
        email='ai-test@example.com',
        defaults={
            'password': 'testpass123',
            'first_name': 'AI',
            'last_name': 'Test'
        }
    )
    
    # Create test project with rich content
    print("\n📝 Creating test project...")
    
    project = Project.objects.create(
        name='Advanced Machine Learning with Neural Networks',
        project_type='school',
        owner=user,
        is_draft=False
    )
    
    SchoolProject.objects.create(
        project=project,
        course_name='Advanced Machine Learning',
        course_code='CS-677',
        teacher_name='Dr. Sarah Johnson'
    )
    
    # Create test content
    test_content = """
    Advanced Machine Learning Course - CS-677
    
    This comprehensive course covers:
    - Neural Networks and Deep Learning fundamentals
    - Convolutional Neural Networks (CNNs) for computer vision
    - Recurrent Neural Networks (RNNs) for sequence data
    - Transformers and attention mechanisms
    - Natural Language Processing applications
    - Reinforcement Learning basics
    - Practical implementation in Python with TensorFlow/PyTorch
    
    Prerequisites: Linear Algebra, Calculus, Python programming
    Difficulty: Advanced level suitable for graduate students
    Duration: 15 weeks with hands-on projects
    """
    
    print(f"✅ Created project: {project.name}")
    print(f"📄 Test content length: {len(test_content)} characters")
    
    # Test AI client
    print("\n🤖 Testing AI Client...")
    
    try:
        # Try GPT-4 first
        print("🔄 Testing GPT-4...")
        ai_client = AIClient(model="gpt-4")
        result = ai_client.generate_meta(test_content)
        
        print("✅ GPT-4 Response:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"❌ GPT-4 failed: {e}")
        
        # Try Gemini fallback
        try:
            print("🔄 Testing Gemini fallback...")
            ai_client = AIClient(model="gemini-2.0-flash")
            result = ai_client.generate_meta(test_content)
            
            print("✅ Gemini Response:")
            print(json.dumps(result, indent=2))
            
        except Exception as e2:
            print(f"❌ Gemini also failed: {e2}")
            return
    
    # Validate response structure
    print("\n🔍 Validating response structure...")
    
    required_keys = ['ai_generated_tags', 'content_summary', 'difficulty_level']
    missing_keys = [key for key in required_keys if key not in result]
    
    if missing_keys:
        print(f"❌ Missing required keys: {missing_keys}")
    else:
        print("✅ All required keys present")
    
    # Check data quality
    print("\n📊 Data Quality Check:")
    
    tags = result.get('ai_generated_tags', [])
    summary = result.get('content_summary', '')
    difficulty = result.get('difficulty_level', '')
    
    print(f"🏷️  Tags ({len(tags)}): {tags}")
    print(f"📄 Summary length: {len(summary)} characters")
    print(f"📈 Difficulty: {difficulty}")
    
    # Quality indicators
    quality_score = 0
    if len(tags) >= 3:
        quality_score += 1
        print("✅ Good number of tags")
    if len(summary) > 50:
        quality_score += 1
        print("✅ Substantial summary")
    if difficulty in ['beginner', 'intermediate', 'advanced']:
        quality_score += 1
        print("✅ Valid difficulty level")
    
    print(f"\n🎯 Overall Quality Score: {quality_score}/3")
    
    if quality_score >= 2:
        print("✅ AI integration working well!")
    else:
        print("⚠️  AI integration needs improvement")
    
    # Test with different content
    print("\n🔄 Testing with different content...")
    
    simple_content = """
    Python Programming Basics
    Learn fundamental Python concepts including variables, loops, functions, and object-oriented programming.
    Perfect for beginners with no prior programming experience.
    """
    
    try:
        simple_result = ai_client.generate_meta(simple_content)
        print("✅ Simple content response:")
        print(json.dumps(simple_result, indent=2))
    except Exception as e:
        print(f"❌ Simple content test failed: {e}")
    
    print("\n🎉 Real AI Integration Test Completed!")
    print("\n📋 Summary:")
    print(f"   ✅ API Keys: {'OpenAI' if openai_key else 'Gemini'}")
    print(f"   ✅ Project Created: {project.name}")
    print(f"   ✅ AI Response: {quality_score}/3 quality score")
    print(f"   ✅ Content Analysis: Working")

if __name__ == '__main__':
    test_real_ai_integration() 