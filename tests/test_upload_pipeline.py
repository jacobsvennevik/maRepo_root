#!/usr/bin/env python
"""
Comprehensive Upload Pipeline Test Script
Tests the new "persist first, process later" architecture
"""
import os
import sys
import django
import time
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.config.base')
django.setup()

from backend.apps.projects.models import Project, UploadedFile
from backend.apps.projects.services import process_uploaded_file
from django.core.files import File
from django.contrib.auth import get_user_model

User = get_user_model()

def create_test_files():
    """Create test files for different types"""
    test_files = {}
    
    # TXT file
    txt_content = "This is a test text file for testing the new robust file upload system.\nIt contains multiple lines.\nAnd some special characters: áéíóú ñ"
    with open('test_upload.txt', 'w', encoding='utf-8') as f:
        f.write(txt_content)
    test_files['txt'] = ('test_upload.txt', 'text/plain', txt_content)
    
    # CSV file
    csv_content = "name,age,city\nJohn,25,New York\nJane,30,Los Angeles\nBob,35,Chicago"
    with open('test_upload.csv', 'w', encoding='utf-8') as f:
        f.write(csv_content)
    test_files['csv'] = ('test_upload.csv', 'text/csv', csv_content)
    
    # Markdown file
    md_content = "# Test Document\n\nThis is a **markdown** file.\n\n- Item 1\n- Item 2\n\n## Subsection\n\nSome content here."
    with open('test_upload.md', 'w', encoding='utf-8') as f:
        f.write(md_content)
    test_files['md'] = ('test_upload.md', 'text/markdown', md_content)
    
    # ZIP file (unsupported)
    zip_content = b'PK\x03\x04\x14\x00\x00\x00\x08\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    with open('test_upload.zip', 'wb') as f:
        f.write(zip_content)
    test_files['zip'] = ('test_upload.zip', 'application/zip', None)
    
    return test_files

def cleanup_test_files(test_files):
    """Remove test files"""
    for file_type, (filename, _, _) in test_files.items():
        try:
            os.remove(filename)
            print(f"  ✓ Cleaned up {filename}")
        except FileNotFoundError:
            pass

def test_upload_pipeline():
    """Main test function"""
    print("🚀 COMPREHENSIVE UPLOAD PIPELINE TEST")
    print("=" * 50)
    
    # Create test files
    print("\n📁 Creating test files...")
    test_files = create_test_files()
    for file_type, (filename, mime_type, _) in test_files.items():
        print(f"  ✓ Created {filename} ({mime_type})")
    
    # Get or create test user and project
    print("\n👤 Setting up test environment...")
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={'password': 'testpass123'}
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"  ✓ Created test user: {user.email}")
    else:
        print(f"  ✓ Using existing test user: {user.email}")
    
    project, created = Project.objects.get_or_create(
        name='Upload Pipeline Test',
        defaults={'owner': user, 'project_type': 'self_study', 'is_draft': False}
    )
    if created:
        print(f"  ✓ Created test project: {project.name}")
    else:
        print(f"  ✓ Using existing test project: {project.name}")
    
    print(f"  📋 Project ID: {project.id}")
    print(f"  📊 Initial file count: {project.uploaded_files.count()}")
    
    # Test file uploads
    print("\n📤 Testing file uploads...")
    uploaded_files = {}
    
    for file_type, (filename, mime_type, expected_content) in test_files.items():
        print(f"\n  🔄 Testing {file_type.upper()} file...")
        
        try:
            # Create UploadedFile record
            with open(filename, 'r' if file_type != 'zip' else 'rb') as f:
                uploaded_file = UploadedFile.objects.create(
                    project=project,
                    file=File(f),
                    original_name=filename,
                    content_type=mime_type
                )
            
            print(f"    ✓ File record created: {uploaded_file.id}")
            print(f"    📊 Size: {uploaded_file.file_size} bytes")
            print(f"    📝 Status: {uploaded_file.processing_status}")
            
            # Process file
            start_time = time.time()
            result = process_uploaded_file(str(uploaded_file.id))
            processing_time = time.time() - start_time
            
            # Check results
            uploaded_file.refresh_from_db()
            print(f"    ⏱️  Processing time: {processing_time:.2f}s")
            print(f"    📊 Final status: {uploaded_file.processing_status}")
            
            if uploaded_file.processing_error:
                print(f"    ⚠️  Error: {uploaded_file.processing_error}")
            
            if uploaded_file.extracted_text:
                text_preview = uploaded_file.extracted_text[:100] + "..." if len(uploaded_file.extracted_text) > 100 else uploaded_file.extracted_text
                print(f"    📄 Extracted text: {text_preview}")
            
            # Validate expected behavior
            if file_type in ['txt', 'csv', 'md']:
                if uploaded_file.processing_status == 'completed':
                    print(f"    ✅ {file_type.upper()} processing: SUCCESS")
                else:
                    print(f"    ❌ {file_type.upper()} processing: FAILED")
            elif file_type == 'zip':
                if uploaded_file.processing_status == 'skipped':
                    print(f"    ✅ {file_type.upper()} processing: CORRECTLY SKIPPED")
                else:
                    print(f"    ❌ {file_type.upper()} processing: SHOULD HAVE BEEN SKIPPED")
            
            uploaded_files[file_type] = uploaded_file
            
        except Exception as e:
            print(f"    ❌ Error testing {file_type}: {e}")
    
    # Final status report
    print("\n📊 FINAL STATUS REPORT")
    print("=" * 50)
    
    project.refresh_from_db()
    print(f"Project: {project.name}")
    print(f"Total files: {project.uploaded_files.count()}")
    print(f"Project draft status: {project.is_draft}")
    
    print("\nFile Processing Summary:")
    for file_type, uploaded_file in uploaded_files.items():
        status_emoji = {
            'completed': '✅',
            'failed': '❌',
            'skipped': '⚠️',
            'processing': '⏳',
            'pending': '⏸️'
        }.get(uploaded_file.processing_status, '❓')
        
        print(f"  {status_emoji} {file_type.upper()}: {uploaded_file.processing_status}")
        if uploaded_file.processing_error:
            print(f"      Error: {uploaded_file.processing_error}")
    
    # Health check queries
    print("\n🏥 HEALTH CHECK QUERIES")
    print("-" * 30)
    
    from django.db.models import Count
    status_counts = UploadedFile.objects.values('processing_status').annotate(c=Count('id')).order_by('-c')
    print("Files by status:")
    for status in status_counts:
        print(f"  {status['processing_status']}: {status['c']}")
    
    failed_files = UploadedFile.objects.filter(processing_status='failed').values('id', 'original_name', 'processing_error')[:5]
    if failed_files:
        print(f"\nRecent failures ({len(failed_files)}):")
        for f in failed_files:
            print(f"  - {f['original_name']}: {f['processing_error'][:50]}...")
    
    # Cleanup
    print("\n🧹 Cleanup...")
    for uploaded_file in uploaded_files.values():
        uploaded_file.delete()
        print(f"  ✓ Deleted file: {uploaded_file.original_name}")
    
    cleanup_test_files(test_files)
    
    print("\n🎉 TEST COMPLETE!")
    return True

if __name__ == '__main__':
    try:
        test_upload_pipeline()
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
