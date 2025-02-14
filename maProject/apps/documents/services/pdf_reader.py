import os
import pymupdf4llm
from maProject.apps.documents.models import Document

import os
import pymupdf4llm
from maProject.apps.documents.models import Document
from django.core.exceptions import ObjectDoesNotExist

def read_pdf(document_id):
    """
    Reads a PDF file, extracts text using pymupdf4llm, and saves it in the Document model.
    
    If the file does not exist, raises a FileNotFoundError.
    If the document does not exist, raises a ValueError.
    
    Parameters
    ----------
    document_id : int
        The ID of the document to process.
    
    Returns
    -------
    str
        The extracted text from the PDF file.
    """
    try:
        # Retrieve the document from the database
        document = Document.objects.get(id=document_id)

        # Check if the file exists **before** accessing `.path`
        if not document.file or not document.file.name:
            raise FileNotFoundError(f"Document {document_id} has no associated file.")

        # Get the full file path
        pdf_path = document.file.path

        # Check if the file exists
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        # Convert the PDF to Markdown
        extracted_text = pymupdf4llm.to_markdown(pdf_path)

        # Ensure an empty file returns an empty string
        extracted_text = extracted_text or ""

        # Save extracted text to the database
        document.original_text = extracted_text
        document.save()

        return extracted_text

    except ObjectDoesNotExist:
        raise ValueError(f"Document with ID {document_id} not found.")

    except FileNotFoundError:
        # Let FileNotFoundError propagate to the caller
        raise

    except Exception as e:
        print(f"Error processing PDF: {e}")
        return ""



