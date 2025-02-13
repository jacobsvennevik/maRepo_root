# study/views.py
import os
import tempfile

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings

# Import service functions from your flashcard generator and PDF reader modules.
from .services.flashcard_generator import generate_flashcards, export_to_csv
from .services.pdf_reader import read_pdf

def generate_flashcards_view(request):
    """
    A view that accepts a PDF file upload, generates flashcards, and returns a CSV file.
    """
    if request.method == "POST":
        # Retrieve the uploaded PDF file from the form.
        uploaded_file = request.FILES.get("pdf_file")
        if not uploaded_file:
            return render(request, "study/upload.html", {"error": "No file uploaded."})
        
        # Save the uploaded file to a temporary location.
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            for chunk in uploaded_file.chunks():
                temp_pdf.write(chunk)
            temp_pdf_path = temp_pdf.name

        try:
            # Use the pdf_reader to extract text from the PDF.
            user_text = read_pdf(temp_pdf_path)

            # Generate flashcards using the provided text and AI model.
            # (Note: The model is hardcoded here as "gemini-2.0-flash" as per your code.)
            flashcards = generate_flashcards(user_text, model="gemini-2.0-flash")

            if flashcards:
                # Generate a temporary CSV file containing the flashcards.
                output_file = os.path.join(tempfile.gettempdir(), "flashcards.csv")
                export_to_csv(flashcards, output_file)

                # Read the CSV file and send it as an HTTP response.
                with open(output_file, "rb") as f:
                    response = HttpResponse(f.read(), content_type="text/csv")
                    response['Content-Disposition'] = 'attachment; filename="flashcards.csv"'
                    return response
            else:
                # If no flashcards were generated, display an error message.
                return render(request, "study/upload.html", {"error": "No flashcards generated."})
        except Exception as e:
            # In case of any errors during processing, show the error message.
            return render(request, "study/upload.html", {"error": str(e)})
        finally:
            # Clean up the temporary PDF file.
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
    else:
        # For GET requests, simply render the upload form.
        return render(request, "study/upload.html")
