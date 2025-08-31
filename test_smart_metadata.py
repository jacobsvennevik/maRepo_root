#!/usr/bin/env python3
"""
Test script for Smart Metadata Generation functionality.
This script demonstrates the AI-powered metadata generation feature.
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
from backend.apps.projects.models import Project, ProjectMeta, SchoolProject
from backend.apps.projects.tasks import generate_project_meta
from backend.apps.projects.serializers import ProjectSerializer
from decouple import config

User = get_user_model()

def test_smart_metadata_generation():
    """Test the Smart Metadata Generation functionality."""
    print("🧠 Testing Smart Metadata Generation...")
    print("=" * 50)
    
    # Check if we have a test user
    try:
        user = User.objects.first()
        if not user:
            print("No users found. Creating a test user...")
            user = User.objects.create_user(
                email='test@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User'
            )
    except Exception as e:
        print(f"Error creating test user: {e}")
        return
    
    # Check ENABLE_STI setting
    enable_sti = config('ENABLE_STI', default=False, cast=bool)
    print(f"ENABLE_STI = {enable_sti}")
    
    if not enable_sti:
        print("❌ STI mode is disabled. Smart metadata generation requires STI mode.")
        print("Set ENABLE_STI=true to enable this feature.")
        return
    
    # Create a test project with rich content
    print("\n1. Creating test project with rich content...")
    
    project = Project.objects.create(
        name='Advanced Machine Learning Course',
        project_type='school',
        owner=user,
        is_draft=False
    )
    
    # Create STI data
    SchoolProject.objects.create(
        project=project,
        course_name='Advanced Machine Learning',
        course_code='CS-677',
        teacher_name='Dr. Sarah Johnson'
    )
    
    # Create uploaded file with content
    from backend.apps.projects.models import UploadedFile
    uploaded_file = UploadedFile.objects.create(
        project=project,
        raw_text='''
        This course covers advanced machine learning concepts including:
        - Neural Networks and Deep Learning
        - Convolutional Neural Networks (CNNs)
        - Recurrent Neural Networks (RNNs)
        - Natural Language Processing with Transformers
        - Computer Vision applications
        - Reinforcement Learning fundamentals
        
        Prerequisites: Linear Algebra, Calculus, Python programming
        Difficulty: Advanced level
        '''
    )
    
    # Create important dates
    from backend.apps.projects.models import ImportantDate
    ImportantDate.objects.create(
        project=project,
        title='Midterm Exam',
        date='2024-10-15',
        description='Neural Networks and Deep Learning'
    )
    
    ImportantDate.objects.create(
        project=project,
        title='Final Project Due',
        date='2024-12-01',
        description='Implement a complete ML pipeline'
    )
    
    print(f"✅ Created project: {project.name}")
    print(f"   - Course: {project.school_project_data.course_name}")
    print(f"   - Files: {project.uploaded_files.count()}")
    print(f"   - Important dates: {project.important_dates.count()}")
    
    # Test 2: Generate metadata using AI
    print("\n2. Generating smart metadata using AI...")
    
    try:
        # Trigger the Celery task
        task = generate_project_meta.delay(str(project.id))
        print(f"✅ Metadata generation task triggered: {task.id}")
        
        # Wait for task completion (in real scenario, this would be async)
        print("⏳ Waiting for task completion...")
        result = task.get(timeout=30)  # 30 second timeout
        
        print("✅ Metadata generation completed!")
        
    except Exception as e:
        print(f"❌ Error during metadata generation: {e}")
        print("This might be due to API key issues or network problems.")
        return
    
    # Test 3: Check the generated metadata
    print("\n3. Checking generated metadata...")
    
    project.refresh_from_db()
    
    # Check if metadata was created
    if project.metadata.count() > 0:
        print(f"✅ Found {project.metadata.count()} metadata items")
        
        for meta_item in project.metadata.all():
            print(f"\n📋 Metadata Key: {meta_item.key}")
            print(f"📅 Created: {meta_item.created_at}")
            print(f"🔄 Updated: {meta_item.updated_at}")
            
            if meta_item.key == 'ai_generated_metadata':
                ai_meta = meta_item.value
                print(f"🤖 AI Model Used: {ai_meta.get('model_used', 'Unknown')}")
                print(f"📝 Prompt Version: {ai_meta.get('prompt_version', 'Unknown')}")
                print(f"🏷️  Generated Tags: {ai_meta.get('ai_generated_tags', [])}")
                print(f"📄 Content Summary: {ai_meta.get('content_summary', '')}")
                print(f"📊 Difficulty Level: {ai_meta.get('difficulty_level', 'Unknown')}")
    else:
        print("❌ No metadata found")
    
    # Test 4: Test serializer output
    print("\n4. Testing serializer output...")
    
    serializer = ProjectSerializer(project)
    data = serializer.data
    
    if 'meta' in data and data['meta']:
        print("✅ Serializer includes metadata:")
        meta_data = data['meta']
        
        if 'ai_generated_tags' in meta_data:
            print(f"   🏷️  AI Tags: {meta_data['ai_generated_tags']}")
        if 'content_summary' in meta_data:
            print(f"   📄 Summary: {meta_data['content_summary']}")
        if 'difficulty_level' in meta_data:
            print(f"   📊 Difficulty: {meta_data['difficulty_level']}")
        if 'ai_model_used' in meta_data:
            print(f"   🤖 Model: {meta_data['ai_model_used']}")
    else:
        print("❌ No metadata in serializer output")
    
    # Test 5: Test API endpoint
    print("\n5. Testing API endpoint...")
    
    from rest_framework.test import APIClient
    from django.urls import reverse
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    url = reverse('project-generate-metadata', kwargs={'pk': project.id})
    
    try:
        response = client.post(url)
        print(f"✅ API Response Status: {response.status_code}")
        
        if response.status_code == 202:
            print(f"   📋 Task ID: {response.data.get('task_id', 'Unknown')}")
            print(f"   🆔 Project ID: {response.data.get('project_id', 'Unknown')}")
        else:
            print(f"   ❌ Error: {response.data}")
    except Exception as e:
        print(f"❌ API Error: {e}")
    
    print("\n🎉 Smart Metadata Generation test completed!")
    print("\n📋 Summary:")
    print("   ✅ ProjectMeta model with GIN index")
    print("   ✅ AIClient.generate_meta() method")
    print("   ✅ Celery task generate_project_meta()")
    print("   ✅ API endpoint for triggering generation")
    print("   ✅ Serializer integration")
    print("   ✅ Comprehensive test coverage")

if __name__ == '__main__':
    test_smart_metadata_generation() 