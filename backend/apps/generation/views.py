# backend/apps/generation/views.py
import os
import tempfile

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required

# Import service functions
from backend.apps.documents.services.pdf_reader import read_pdf
from backend.apps.generation.services.flashcard_generator import generate_flashcards, save_flashcards_to_db
from backend.apps.generation.models import FlashcardSet
from backend.apps.generation.services.mindmap_generator import generate_mindmap
from backend.apps.generation.models import MindMap
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
            return render(request, "study/upload_flashcards.html", {"error": "No file uploaded."})
        
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

                return render(request, "study/upload_flashcards.html", {"message": "Flashcards generated and saved!"})
            else:
                return render(request, "study/upload_flashcards.html", {"error": "No flashcards generated."})

        except Exception as e:
            return render(request, "study/upload_flashcards.html", {"error": str(e)})

        finally:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

    return render(request, "study/upload_flashcards.html")




@login_required
def generate_mindmap_view(request):
    """
    View that accepts a document upload, extracts text, generates a mind map,
    and saves it to the database.
    """
    if request.method == "POST":
        uploaded_file = request.FILES.get("document_file")
        if not uploaded_file:
            return render(request, "study/upload_mindmap.html", {"error": "No file uploaded."})
        
        # Save the uploaded file temporarily.
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            # Extract text from the uploaded document.
            extracted_text = read_pdf(temp_file_path)
            
            # Generate the mind map using the AI service.
            mindmap_data = generate_mindmap(extracted_text, model="gemini-2.0-mindmap")
            
            # Persist the mind map in the database.
            mindmap_instance = MindMap.objects.create(
                title=f"MindMap for {uploaded_file.name}",
                owner=request.user,
                mindmap_data=mindmap_data,
                document=None  # Optionally link to an existing Document instance.
            )
            
            return render(request, "study/upload_mindmap.html", {
                "message": "Mind map generated and saved!",
                "mindmap": mindmap_data
            })
        except Exception as e:
            return render(request, "study/upload_mindmap.html", {"error": str(e)})
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    
    return render(request, "study/upload_mindmap.html")