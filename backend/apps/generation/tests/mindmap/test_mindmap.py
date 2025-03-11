# tests/test_mindmap.py
import pytest
from rest_framework.test import APIClient
from backend.apps.generation.tests.factories.mindmap import MindMapFactory
from backend.apps.accounts.tests.factories import CustomUserFactory

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return CustomUserFactory.create()

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

def test_generate_mindmap(auth_client, monkeypatch, user):
    # Monkey patch the AIClient.get_response method to simulate a response.
    from backend.apps.generation.services.api_client import AIClient
    
    def fake_get_response(self, messages):
        # Return a fixed mind map content.
        return "Generated Mind Map Content: Node A -> Node B -> Node C"
    
    monkeypatch.setattr(AIClient, "get_response", fake_get_response)
    
    payload = {
        "title": "Test Mind Map",
        "notes": "These are some sample notes for generating a mind map."
    }
    
    response = auth_client.post("/api/mindmaps/generate/", payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Test Mind Map"
    assert "Generated Mind Map Content" in data["content"]

def test_list_mindmaps(auth_client, user):
    # Create several mind map instances for the user.
    MindMapFactory.create_batch(3, owner=user)
    response = auth_client.get("/api/mindmaps/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

def test_create_mindmap(auth_client, user):
    # Test direct creation (bypassing AI generation).
    payload = {
        "title": "Manual Mind Map",
        "content": "This mind map was created manually."
    }
    response = auth_client.post("/api/mindmaps/", payload, format="json")
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Manual Mind Map"
    assert data["content"] == "This mind map was created manually."
