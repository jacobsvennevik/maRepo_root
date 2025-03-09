import re
from django.contrib.auth import get_user_model
from backend.apps.documents.models import Document
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.documents.services.pdf_reader import read_pdf  # Ensure this function saves text to DB
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

def generate_flashcards_from_document(document_id, user):
    """
    Generates flashcards from the extracted text of a given document and saves them.
    """
    try:
        # Retrieve document from DB
        document = Document.objects.get(id=document_id)
        print(f"📝 Document Found: {document}")

        # Ensure extracted text exists (if not, process the document)
        if not document.original_text:
            document.original_text = read_pdf(document_id)  # Extract and save
            document.save()
            print(f"📜 Extracted Text: {document.original_text}")

        # Generate flashcards
        flashcards = generate_flashcards(document.original_text, MODEL)
        print(f"📌 Generated Flashcards: {flashcards}")

        if not flashcards:
            raise ValueError("AI did not generate any flashcards.")

        # Create a FlashcardSet
        flashcard_set = FlashcardSet.objects.create(
            title=f"Flashcards for {document.title}",
            owner=user,
            document=document
        )
        print(f"✅ Created FlashcardSet: {flashcard_set}")

        # Save flashcards to DB
        save_flashcards_to_db(flashcards, flashcard_set)

        return flashcard_set

    except Document.DoesNotExist:
        raise ValueError(f"Document with ID {document_id} not found.")
    except Exception as e:
        print(f"❌ Error generating flashcards: {e}")
        return None

