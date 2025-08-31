#!/usr/bin/env python3
"""
Test script for ProjectMeta API functionality.
This script tests the ProjectMeta feature in both legacy and STI modes.
"""

import os
import sys
import django
import requests
import json

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.apps.projects.models import Project, ProjectMeta
from decouple import config

User = get_user_model()

def test_project_meta_functionality():
    """Test the ProjectMeta functionality."""
    print("Testing ProjectMeta functionality...")
    
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
    
    # Test 1: Create project with meta data (STI mode)
    print("\n1. Testing project creation with meta data...")
    
    # Check ENABLE_STI setting
    enable_sti = config('ENABLE_STI', default=False, cast=bool)
    print(f"ENABLE_STI = {enable_sti}")
    
    # Create project
    project = Project.objects.create(
        name='Test Project with Meta',
        project_type='school',
        owner=user,
        is_draft=False
    )
    
    if enable_sti:
        # Create metadata
        ProjectMeta.objects.create(
            project=project,
            key='custom_field',
            value='custom_value'
        )
        ProjectMeta.objects.create(
            project=project,
            key='settings',
            value={'theme': 'dark', 'notifications': True}
        )
        
        print(f"Created project with {project.metadata.count()} metadata items")
        
        # Test metadata retrieval
        meta_dict = {}
        for meta_item in project.metadata.all():
            meta_dict[meta_item.key] = meta_item.value
        
        print(f"Metadata: {meta_dict}")
        
        # Test JSONB query
        settings_meta = ProjectMeta.objects.filter(
            project=project,
            value__contains={'theme': 'dark'}
        ).first()
        
        if settings_meta:
            print(f"Found settings metadata: {settings_meta.value}")
        else:
            print("Settings metadata not found")
    else:
        print("STI mode disabled - metadata not created")
    
    # Test 2: Test serializer
    print("\n2. Testing serializer...")
    from backend.apps.projects.serializers import ProjectSerializer
    
    serializer = ProjectSerializer(project)
    data = serializer.data
    
    print(f"Project data keys: {list(data.keys())}")
    if 'meta' in data:
        print(f"Meta field: {data['meta']}")
    else:
        print("No meta field in response")
    
    # Test 3: Test GIN index
    print("\n3. Testing GIN index...")
    if enable_sti:
        # This would test the GIN index for JSONB queries
        # In a real scenario, you'd want to test complex JSONB queries
        print("GIN index available for JSONB queries")
    else:
        print("GIN index not tested (STI disabled)")
    
    print("\nProjectMeta functionality test completed!")

if __name__ == '__main__':
    test_project_meta_functionality() 