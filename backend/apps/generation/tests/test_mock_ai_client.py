import pytest
from backend.apps.generation.services.mock_ai_client import MockAIClient


class TestMockAIClient:
    """Test the MockAIClient functionality."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.client = MockAIClient()
    
    def test_format_message(self):
        """Test message formatting."""
        message = self.client.format_message("user", "Hello, world!")
        assert message == {"role": "user", "content": "Hello, world!"}
    
    def test_classify_syllabus_request(self):
        """Test syllabus request classification."""
        content = "Extract syllabus information from this course document"
        response_type = self.client._classify_request(content)
        assert response_type == "syllabus_extraction"
    
    def test_classify_document_classification_request(self):
        """Test document classification request."""
        content = "Classify this document type"
        response_type = self.client._classify_request(content)
        assert response_type == "document_classification"
    
    def test_classify_exam_request(self):
        """Test exam request classification."""
        content = "Extract exam questions and answers"
        response_type = self.client._classify_request(content)
        assert response_type == "exam_extraction"
    
    def test_classify_study_content_request(self):
        """Test study content request classification."""
        content = "Extract study materials and topics"
        response_type = self.client._classify_request(content)
        assert response_type == "study_content_extraction"
    
    def test_get_classification_response(self):
        """Test document classification response."""
        content = "This is a syllabus document"
        response = self.client._get_classification_response(content)
        assert response == "SYLLABUS"
        
        content = "This is an exam with questions"
        response = self.client._get_classification_response(content)
        assert response == "EXAM"
        
        content = "This is study material"
        response = self.client._get_classification_response(content)
        assert response == "STUDY_CONTENT"
    
    def test_get_syllabus_extraction_response(self):
        """Test syllabus extraction response."""
        content = "Some syllabus content"
        response = self.client._get_syllabus_extraction_response(content)
        
        # Check that response contains expected fields
        assert "<course_title>" in response
        assert "<instructor>" in response
        assert "<topics>" in response
        assert "Natural Language Interaction" in response
    
    def test_get_exam_extraction_response(self):
        """Test exam extraction response."""
        content = "Some exam content"
        response = self.client._get_exam_extraction_response(content)
        
        # Check that response is valid JSON
        import json
        try:
            json.loads(response)
        except json.JSONDecodeError:
            pytest.fail("Exam extraction response is not valid JSON")
        
        # Check for expected fields
        assert "test_title" in response
        assert "course_title" in response
        assert "question_summary" in response
    
    def test_get_study_content_extraction_response(self):
        """Test study content extraction response."""
        content = "Some study content"
        response = self.client._get_study_content_extraction_response(content)
        
        # Check that response is valid JSON
        import json
        try:
            json.loads(response)
        except json.JSONDecodeError:
            pytest.fail("Study content extraction response is not valid JSON")
        
        # Check for expected fields
        assert "course_type" in response
        assert "topics" in response
        assert "overview" in response
    
    def test_get_response_syllabus(self):
        """Test full response flow for syllabus."""
        messages = [{"role": "user", "content": "Extract syllabus information"}]
        response = self.client.get_response(messages)
        
        assert "<course_title>" in response
        assert "Natural Language Interaction" in response
    
    def test_get_response_exam(self):
        """Test full response flow for exam."""
        messages = [{"role": "user", "content": "Extract exam questions"}]
        response = self.client.get_response(messages)
        
        import json
        try:
            json.loads(response)
        except json.JSONDecodeError:
            pytest.fail("Exam response is not valid JSON")
        
        assert "test_title" in response
    
    def test_get_response_empty_messages(self):
        """Test response with empty messages."""
        response = self.client.get_response([])
        assert response == ""
    
    def test_get_response_string_message(self):
        """Test response with string message."""
        messages = ["Extract syllabus information"]
        response = self.client.get_response(messages)
        
        assert "<course_title>" in response
        assert "Natural Language Interaction" in response 