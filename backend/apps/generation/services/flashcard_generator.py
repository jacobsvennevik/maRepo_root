import re
from django.contrib.auth import get_user_model
from backend.apps.pdf_service.django_models import Document
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.pdf_service.ingestion import ingest_pdf
from backend.apps.generation.services.api_client import AIClient  # Your AI integration

User = get_user_model()
MODEL = "gemini-2.0-flash"  # Define the AI model to use

import re

def parse_flashcards(content):
    """
    Parses flashcards from AI-generated content.
    Expected format:
      Front: <question>
      Back: <answer>
    """
    flashcard_pattern = re.compile(r'Front:\s*(.*?)\s*Back:\s*(.*?)(?:\n|$)', re.DOTALL)

    flashcards_raw = flashcard_pattern.findall(content)
    return [(front.strip(), back.strip()) for front, back in flashcards_raw]
def generate_flashcards(text, model=MODEL):
    """
    Generates flashcards using AI based on extracted document text.
    """
    ai_client = AIClient(model)
    prompt = (
        "Convert the following text into flashcards. Each flashcard should have a front and a back. "
        "Use the format:\n"
        "Front: <question>\n"
        "Back: <answer>\n\n"
        "Text:\n" + text
    )

    messages = [ai_client.format_message("user", prompt)]
    response = ai_client.get_response(messages)
    return parse_flashcards(response)

def save_flashcards_to_db(flashcards, flashcard_set):
    """
    Saves each flashcard (front, back) pair to the database.
    """
    flashcard_objects = [
        Flashcard(flashcard_set=flashcard_set, question=front, answer=back)
        for front, back in flashcards
    ]
    Flashcard.objects.bulk_create(flashcard_objects)  # Bulk create for efficiency

def generate_flashcards_from_document(document_id: int):
    try:
        document = Document.objects.get(id=document_id)
        if not document.original_text:
            # If text is not extracted, run ingestion
            chunks, metadata = ingest_pdf(document.file.path)  # Unpack the tuple
            document.original_text = " ".join([chunk.content for chunk in chunks])
            document.save()
        
        # Now generate flashcards
        flashcards = generate_flashcards(document.original_text)
        
        # Create flashcard set
        flashcard_set = FlashcardSet.objects.create(
            title=f"Flashcards for {document.title}",
            owner=document.user,
            document=document
        )
        
        # Save flashcards to database
        save_flashcards_to_db(flashcards, flashcard_set)
        
        return flashcard_set

    except Document.DoesNotExist:
        print(f"Document with id {document_id} not found.")
        return None

