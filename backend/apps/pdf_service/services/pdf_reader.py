from backend.apps.pdf_service.django_models import Document
from backend.apps.pdf_service.ingestion import ingest_pdf

def read_pdf(document_id: int):
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
        document = Document.objects.get(id=document_id)
        chunks = ingest_pdf(document.file.path)
        document.original_text = " ".join([chunk.content for chunk in chunks])
        document.save()
        return document.original_text
    except Document.DoesNotExist:
        return None



