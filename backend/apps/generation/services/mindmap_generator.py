# backend/apps/generation/services/mindmap_generator.py

import json
from backend.apps.generation.services.api_client import AIClient

def generate_mindmap(document_text: str, model: str = "gemini-2.0-mindmap") -> dict:
    """
    Generates a mind map in JSON format from the provided document text using AI.
    The output should be a hierarchical structure with a root node and child nodes.
    """
    prompt = (
        "Given the following text, generate a comprehensive and hierarchical mind map in JSON format. "
        "The mind map must include a central 'root' node representing the main topic and multiple layers of child nodes "
        "that capture key ideas, subtopics, and their interconnections. Each node should include a 'title' and, if relevant, a "
        "'description' for additional context. Make sure the output is valid JSON that accurately reflects the depth and "
        "breadth of the content. Here is the text: " + document_text
    )
    client = AIClient(model=model)
    messages = [
        {"role": "system", "content": "You are an expert assistant that generates mind maps."},
        {"role": "user", "content": prompt}
    ]
    response = client.get_response(messages)
    try:
        mindmap_data = json.loads(response)
    except json.JSONDecodeError:
        # Handle errors in JSON parsing appropriately.
        mindmap_data = {}
    return mindmap_data
