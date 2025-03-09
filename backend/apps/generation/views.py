import os
import tempfile

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required

# Import service functions
from backend.apps.documents.services.pdf_reader import read_pdf
from backend.apps.generation.flashcards.services import generate_flashcards, save_flashcards_to_db
from backend.apps.generation.flashcards.models import FlashcardSet

@login_required
def generate_flashcards_view(request):
    """
    A view that accepts a PDF file upload, extracts text, generates flashcards,
    saves them to the database, and optionally returns a CSV file.
    """
    if request.method == "POST":
        # Retrieve the uploaded PDF file from the form.
        uploaded_file = request.FILES.get("pdf_file")
        if not uploaded_file:
            return render(request, "study/upload.html", {"error": "No file uploaded."})
        
        # Save the uploaded file temporarily.
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            for chunk in uploaded_file.chunks():
                temp_pdf.write(chunk)
            temp_pdf_path = temp_pdf.name

        try:
            # Extract text from the PDF.
            extracted_text = read_pdf(temp_pdf_path)

            # Generate flashcards using AI.
            flashcards = generate_flashcards(extracted_text, model="gemini-2.0-flash")

            if flashcards:
                # Save flashcards to the database under a new FlashcardSet.
                flashcard_set = FlashcardSet.objects.create(
                    title=f"Flashcards for {uploaded_file.name}",
                    owner=request.user
                )
                save_flashcards_to_db(flashcards, flashcard_set)

                return render(request, "study/upload.html", {"message": "Flashcards generated and saved!"})
            else:
                return render(request, "study/upload.html", {"error": "No flashcards generated."})

        except Exception as e:
            return render(request, "study/upload.html", {"error": str(e)})

        finally:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

    return render(request, "study/upload.html")
