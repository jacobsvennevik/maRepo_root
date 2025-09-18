#!/usr/bin/env python3
"""
Test-Driven Development: Complete Upload Flow Integration Test

This script tests the complete flow from file upload to project creation to file display.
It will initially FAIL (RED phase) and guide the implementation of proper functionality.

Test Mode Considerations:
- Tests work with both real and mock data
- AI calls are mocked via MOCK_REGISTRY
- File operations and database operations are REAL
- Only AI/LLM calls are mocked as per TEST_MODE_EXPLANATION.md
"""

import os
import sys
import django
import requests
import json
import time
from pathlib import Path

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.projects.models import Project, UploadedFile
from apps.pdf_service.django_models import Document
from decouple import config

User = get_user_model()


class CompleteUploadFlowTest:
    """Test the complete upload flow from frontend to backend."""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.user = None
        self.auth_token = None
        self.session = requests.Session()
        
    def setup_test_user(self):
        """Create or get test user."""
        try:
            self.user = User.objects.get(email='test@example.com')
            print(f"✓ Using existing test user: {self.user.email}")
        except User.DoesNotExist:
            self.user = User.objects.create_user(
                email='test@example.com',
                password='testpass123',
                first_name='Test',
                last_name='User'
            )
            print(f"✓ Created test user: {self.user.email}")
    
    def authenticate(self):
        """Authenticate and get JWT token."""
        auth_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.session.post(f"{self.base_url}/api/token/", json=auth_data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.auth_token = token_data['access']
            self.session.headers.update({
                'Authorization': f'Bearer {self.auth_token}'
            })
            print("✓ Authentication successful")
            return True
        else:
            print(f"✗ Authentication failed: {response.status_code} - {response.text}")
            return False
    
    def test_project_creation_persistence(self):
        """
        RED TEST: Test that projects are actually saved to database.
        
        This test will FAIL initially because projects aren't being persisted.
        """
        print("\n🔴 Testing project creation persistence...")
        
        # Clear existing projects
        Project.objects.filter(owner=self.user).delete()
        
        # Create project via API
        project_data = {
            'name': 'Test Project',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/", json=project_data)
        
        if response.status_code != 201:
            print(f"✗ Project creation failed: {response.status_code} - {response.text}")
            return False
        
        project_id = response.json()['id']
        print(f"✓ Project created via API: {project_id}")
        
        # Verify project exists in database
        try:
            project = Project.objects.get(id=project_id)
            if project.name != 'Test Project':
                print(f"✗ Project name mismatch: expected 'Test Project', got '{project.name}'")
                return False
            if project.owner != self.user:
                print(f"✗ Project owner mismatch: expected {self.user}, got {project.owner}")
                return False
            if project.is_draft:
                print(f"✗ Project should not be draft, but is_draft={project.is_draft}")
                return False
            print("✓ Project persisted correctly in database")
        except Project.DoesNotExist:
            print("✗ Project not found in database")
            return False
        
        # Verify project appears in list
        list_response = self.session.get(f"{self.base_url}/api/projects/")
        if list_response.status_code != 200:
            print(f"✗ Project list failed: {list_response.status_code}")
            return False
        
        projects = list_response.json()
        if len(projects) != 1:
            print(f"✗ Expected 1 project in list, got {len(projects)}")
            return False
        
        if projects[0]['id'] != project_id:
            print(f"✗ Project ID mismatch in list")
            return False
        
        print("✓ Project appears in API list")
        return True
    
    def test_file_upload_and_linking(self):
        """
        RED TEST: Test that uploaded files are linked to projects.
        
        This test will FAIL initially because files aren't being linked.
        """
        print("\n🔴 Testing file upload and linking...")
        
        # Create project first
        project_data = {
            'name': 'File Upload Test',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/", json=project_data)
        if response.status_code != 201:
            print(f"✗ Project creation failed: {response.status_code}")
            return False
        
        project_id = response.json()['id']
        print(f"✓ Project created: {project_id}")
        
        # Upload file to project
        test_file_content = b"This is test file content for upload testing."
        files = {
            'file': ('test_upload.pdf', test_file_content, 'application/pdf')
        }
        
        upload_response = self.session.post(
            f"{self.base_url}/api/projects/{project_id}/upload_file/",
            files=files
        )
        
        if upload_response.status_code != 201:
            print(f"✗ File upload failed: {upload_response.status_code} - {upload_response.text}")
            return False
        
        print("✓ File uploaded successfully")
        
        # Verify file is linked to project
        project = Project.objects.get(id=project_id)
        uploaded_files = project.uploaded_files.all()
        
        if len(uploaded_files) != 1:
            print(f"✗ Expected 1 uploaded file, got {len(uploaded_files)}")
            return False
        
        uploaded_file = uploaded_files[0]
        if uploaded_file.original_name != 'test_upload.pdf':
            print(f"✗ File name mismatch: expected 'test_upload.pdf', got '{uploaded_file.original_name}'")
            return False
        
        print("✓ File linked to project correctly")
        return True
    
    def test_project_detail_includes_files(self):
        """
        RED TEST: Test that project detail API includes uploaded files.
        
        This test will FAIL initially because files aren't included in API response.
        """
        print("\n🔴 Testing project detail includes files...")
        
        # Create project and file
        project_data = {
            'name': 'Detail Test Project',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/", json=project_data)
        if response.status_code != 201:
            print(f"✗ Project creation failed: {response.status_code}")
            return False
        
        project_id = response.json()['id']
        
        # Upload file
        test_file_content = b"This is test file content for detail testing."
        files = {
            'file': ('detail_test.pdf', test_file_content, 'application/pdf')
        }
        
        upload_response = self.session.post(
            f"{self.base_url}/api/projects/{project_id}/upload_file/",
            files=files
        )
        
        if upload_response.status_code != 201:
            print(f"✗ File upload failed: {upload_response.status_code}")
            return False
        
        # Get project detail
        detail_response = self.session.get(f"{self.base_url}/api/projects/{project_id}/")
        
        if detail_response.status_code != 200:
            print(f"✗ Project detail failed: {detail_response.status_code}")
            return False
        
        project_detail = detail_response.json()
        
        if 'uploaded_files' not in project_detail:
            print("✗ Project detail missing 'uploaded_files' field")
            return False
        
        uploaded_files = project_detail['uploaded_files']
        if len(uploaded_files) != 1:
            print(f"✗ Expected 1 uploaded file in detail, got {len(uploaded_files)}")
            return False
        
        file_data = uploaded_files[0]
        if file_data['original_name'] != 'detail_test.pdf':
            print(f"✗ File name mismatch in detail: expected 'detail_test.pdf', got '{file_data['original_name']}'")
            return False
        
        print("✓ Project detail includes uploaded files")
        return True
    
    def test_complete_upload_to_display_flow(self):
        """
        RED TEST: Test complete flow from upload to display.
        
        This test will FAIL initially because the complete flow is broken.
        """
        print("\n🔴 Testing complete upload to display flow...")
        
        # Step 1: Create project
        project_data = {
            'name': 'Complete Flow Test',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/", json=project_data)
        if response.status_code != 201:
            print(f"✗ Project creation failed: {response.status_code}")
            return False
        
        project_id = response.json()['id']
        print(f"✓ Step 1: Project created: {project_id}")
        
        # Step 2: Upload file
        test_file_content = b"This is test file content for complete flow testing."
        files = {
            'file': ('complete_flow_test.pdf', test_file_content, 'application/pdf')
        }
        
        upload_response = self.session.post(
            f"{self.base_url}/api/projects/{project_id}/upload_file/",
            files=files
        )
        
        if upload_response.status_code != 201:
            print(f"✗ File upload failed: {upload_response.status_code}")
            return False
        
        print("✓ Step 2: File uploaded successfully")
        
        # Step 3: Verify project includes file
        detail_response = self.session.get(f"{self.base_url}/api/projects/{project_id}/")
        if detail_response.status_code != 200:
            print(f"✗ Project detail failed: {detail_response.status_code}")
            return False
        
        project_detail = detail_response.json()
        if 'uploaded_files' not in project_detail or len(project_detail['uploaded_files']) != 1:
            print("✗ Project detail missing uploaded files")
            return False
        
        print("✓ Step 3: Project detail includes uploaded files")
        
        # Step 4: Verify file can be retrieved
        file_id = project_detail['uploaded_files'][0]['id']
        file_response = self.session.get(f"{self.base_url}/api/uploaded-files/{file_id}/")
        
        if file_response.status_code != 200:
            print(f"✗ File retrieval failed: {file_response.status_code}")
            return False
        
        print("✓ Step 4: File can be retrieved")
        print("✓ Complete flow test passed!")
        return True
    
    def test_project_creation_with_mock_mode(self):
        """
        GREEN TEST: Test project creation with mock mode for AI calls.
        
        This test should PASS as it tests project creation with AI mocking.
        """
        print("\n🟢 Testing project creation with mock mode...")
        
        # Create project with mock mode flags
        project_data = {
            'name': 'Mock Mode Test',
            'project_type': 'school',
            'course_name': 'Test Course',
            'mock_mode': True,  # Enable AI mocking
            'seed_syllabus': True,
            'seed_tests': True,
            'is_draft': False
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/", json=project_data)
        
        if response.status_code != 201:
            print(f"✗ Project creation with mock mode failed: {response.status_code}")
            return False
        
        project_id = response.json()['id']
        
        # Verify project was created
        project = Project.objects.get(id=project_id)
        if project.name != 'Mock Mode Test':
            print(f"✗ Project name mismatch: expected 'Mock Mode Test', got '{project.name}'")
            return False
        
        print("✓ Project creation with mock mode successful")
        print("✓ AI calls are mocked, but project creation is real")
        return True
    
    def test_file_upload_with_test_mode_header(self):
        """
        GREEN TEST: Test file upload with test mode header.
        
        This test should PASS as it only tests file operations (not AI).
        """
        print("\n🟢 Testing file upload with test mode header...")
        
        # Create project
        project_data = {
            'name': 'Test Mode Header Test',
            'project_type': 'school',
            'course_name': 'Test Course',
            'is_draft': False
        }
        
        response = self.session.post(f"{self.base_url}/api/projects/", json=project_data)
        if response.status_code != 201:
            print(f"✗ Project creation failed: {response.status_code}")
            return False
        
        project_id = response.json()['id']
        
        # Upload file with test mode header
        test_file_content = b"This is test file content for test mode header testing."
        files = {
            'file': ('test_mode_header.pdf', test_file_content, 'application/pdf')
        }
        
        headers = {'X-Test-Mode': 'true'}
        upload_response = self.session.post(
            f"{self.base_url}/api/projects/{project_id}/upload_file/",
            files=files,
            headers=headers
        )
        
        if upload_response.status_code != 201:
            print(f"✗ File upload with test mode header failed: {upload_response.status_code}")
            return False
        
        # Verify file was uploaded (file operations are real in test mode)
        project = Project.objects.get(id=project_id)
        uploaded_files = project.uploaded_files.all()
        
        if len(uploaded_files) != 1:
            print(f"✗ Expected 1 uploaded file, got {len(uploaded_files)}")
            return False
        
        print("✓ File upload with test mode header successful")
        print("✓ File operations are real, AI operations are mocked")
        return True
    
    def run_all_tests(self):
        """Run all tests and report results."""
        print("🚀 COMPLETE UPLOAD FLOW INTEGRATION TEST")
        print("=" * 50)
        
        # Setup
        self.setup_test_user()
        if not self.authenticate():
            print("✗ Authentication failed, cannot continue")
            return False
        
        # Run tests
        tests = [
            ("Project Creation Persistence", self.test_project_creation_persistence),
            ("File Upload and Linking", self.test_file_upload_and_linking),
            ("Project Detail Includes Files", self.test_project_detail_includes_files),
            ("Complete Upload to Display Flow", self.test_complete_upload_to_display_flow),
            ("Project Creation with Mock Mode", self.test_project_creation_with_mock_mode),
            ("File Upload with Test Mode Header", self.test_file_upload_with_test_mode_header),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                print(f"✗ {test_name} failed with exception: {e}")
                results.append((test_name, False))
        
        # Report results
        print("\n" + "=" * 50)
        print("TEST RESULTS SUMMARY")
        print("=" * 50)
        
        passed = 0
        failed = 0
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status}: {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal: {passed + failed}, Passed: {passed}, Failed: {failed}")
        
        if failed == 0:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {failed} tests failed - implementation needed")
            return False


def main():
    """Main test runner."""
    test_runner = CompleteUploadFlowTest()
    success = test_runner.run_all_tests()
    
    if success:
        print("\n✅ All tests passed - implementation is complete!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed - implementation needed")
        sys.exit(1)


if __name__ == "__main__":
    main()
