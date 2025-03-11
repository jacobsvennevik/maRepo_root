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
