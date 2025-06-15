# pdf_service/ingestion.py

"""
Handles the ingestion of PDF files, extracting text and splitting it into manageable chunks.
"""
import os
import uuid
from openai import OpenAI
import pdfplumber
from pdfplumber.page import Page
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import Tuple, List, Dict, Any
from pinecone import Pinecone

from .models import PDFChunk

def ingest_pdf(file_path: str) -> Tuple[List[str], Dict[str, Any]]:
    """
    Extracts text from a PDF and splits it into chunks.
    Tries pdfplumber first, then falls back to PyPDFLoader.

    Args:
        file_path: The local path to the PDF file.

    Returns:
        A tuple containing a list of text chunks and a metadata dictionary.
        
    Raises:
        FileNotFoundError: If the file cannot be found at the given path.
    """
    text = ""
    metadata = {"source": file_path}
    
    try:
        with pdfplumber.open(file_path) as pdf:
            metadata["pages"] = len(pdf.pages)
            pages = [page.extract_text() for page in pdf.pages]
            text = "\n".join(p for p in pages if p)
    except Exception:
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            text = "\n".join([doc.page_content for doc in docs])
        except Exception as e:
            # If both methods fail, raise the error.
            print(f"Both pdfplumber and PyPDFLoader failed for {file_path}: {e}")
            raise FileNotFoundError(f"Could not process the PDF file at {file_path}")

    if not text:
        return [], metadata

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        length_function=len,
    )
    
    chunks = text_splitter.split_text(text)
    
    pdf_chunks = []
    for i, chunk_content in enumerate(chunks):
        # In a real scenario, page number might be tracked more accurately
        # For now, we can assign a placeholder or approximate page.
        # This simple splitter does not preserve page numbers.
        # A more complex solution would be needed for page-perfect mapping.
        pdf_chunks.append(
            PDFChunk(
                id=str(uuid.uuid4()),
                page_number=0, # Placeholder
                content=chunk_content
            )
        )
        
    return chunks, metadata 