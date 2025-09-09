#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.config.base')
django.setup()

from backend.apps.projects.services import process_uploaded_file
from backend.apps.projects.models import UploadedFile, Project
from django.core.files import File

def test_file_processing():
    print('=== TESTING NEW FILE PROCESSING ===')
    
    # Get first project
    project = Project.objects.first()
    if not project:
        print("No projects found!")
        return
    
    print(f'Using project: {project.name}')
    print(f'\n=== BEFORE PROCESSING ===')
    print(f'Project files: {project.uploaded_files.count()}')
    print(f'Project draft status: {project.is_draft}')
    
    # Create test file
    print(f'\n=== CREATING TEST UPLOADED FILE ===')
    test_file_path = 'test_upload.txt'
    
    if not os.path.exists(test_file_path):
        print(f"Test file {test_file_path} not found!")
        return
    
    with open(test_file_path, 'r') as f:
        uploaded_file = UploadedFile.objects.create(
            project=project,
            file=File(f),
            original_name='test_upload.txt',
            content_type='text/plain'
        )
    
    print(f'Created file: {uploaded_file.id}')
    
    # Process file
    print(f'\n=== PROCESSING FILE ===')
    result = process_uploaded_file(str(uploaded_file.id))
    print(f'Processing result: {result}')
    
    # Check results
    print(f'\n=== AFTER PROCESSING ===')
    uploaded_file.refresh_from_db()
    print(f'Processing status: {uploaded_file.processing_status}')
    print(f'Processing error: {uploaded_file.processing_error}')
    print(f'Extracted text: {uploaded_file.extracted_text[:100] if uploaded_file.extracted_text else "None"}...')
    print(f'Project draft status: {project.is_draft}')
    
    # Clean up
    uploaded_file.delete()
    print(f'\n=== CLEANUP ===')
    print('Test file deleted')

if __name__ == '__main__':
    test_file_processing()
