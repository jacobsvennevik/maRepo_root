# backend/apps/generation/views.py

import os
import tempfile

from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Import common service functions
from backend.apps.documents.services.pdf_reader import read_pdf

# Flashcards imports
from backend.apps.generation.services import generate_flashcards, save_flashcards_to_db
from backend.apps.generation.models import FlashcardSet

# ------------------------------
# Flashcards Generation View
# ------------------------------
@login_required
def generate_flashcards_view(request):
    """
    A view that accepts a PDF file upload, extracts text, generates flashcards using AI,
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


# ------------------------------
# Mind Map Generation View
# ------------------------------
@login_required
def generate_mindmap_view(request):
    """
    A view that accepts a PDF file upload, extracts text, generates a mind map using AI,
    and renders the generated mind map content.
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
            
            # Generate a mind map using AI.
            # Import the mind map generation service function.
            from backend.apps.generation.services.mindmap_generator import generate_mindmap
            mindmap_content = generate_mindmap(extracted_text)
            
            # Here you might want to save the generated mind map to the DB,
            # but for now we'll simply render the content.
            return render(request, "study/upload.html", {
                "message": "Mind map generated!",
                "mindmap": mindmap_content
            })
        except Exception as e:
            return render(request, "study/upload.html", {"error": str(e)})
        finally:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
    
    return render(request, "study/upload.html")
