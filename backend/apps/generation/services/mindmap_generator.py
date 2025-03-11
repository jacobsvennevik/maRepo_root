<<<<<<< HEAD
# backend/apps/generation/mindmap/services.py

from backend.apps.generation.services.api_client import AIClient

MODEL = "gemini-2.0-flash"  # Change this to the model you wish to use for mind map generation

def generate_mindmap(text, model=MODEL):
    """
    Generates a mind map using AI based on the provided text.
    
    The prompt instructs the AI to create a structured, in-depth mind map connecting the ideas from the document.
    """
    ai_client = AIClient(model)
    prompt = (
        "Create a structured, in-depth mind-map connecting the ideas from the document. "
        "The mind map should show the main topics, subtopics, and the relationships between them. "
        "Document text:\n" + text
    )
    # Format the message for the API call
    messages = [ai_client.format_message("user", prompt)]
    # Get the AI response (which is expected to be a textual representation of the mind map)
    response = ai_client.get_response(messages)
    return response
=======
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
>>>>>>> generation-of-docs
