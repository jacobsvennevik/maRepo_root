# pdf_service/ingestion.py

"""
Handles the ingestion of PDF files, extracting text and splitting it into manageable chunks.
"""
import os
import uuid
from openai import OpenAI
import pymupdf4llm
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import Tuple, List, Dict, Any
from pinecone import Pinecone

from .models import PDFChunk

def ingest_pdf(file_path: str) -> Tuple[List[PDFChunk], Dict[str, Any]]:
    """
    Extracts text from a PDF using pymupdf4llm and splits it into chunks.

    Args:
        file_path: The local path to the PDF file.

    Returns:
        A tuple containing a list of PDFChunk objects and a metadata dictionary.
        
    Raises:
        FileNotFoundError: If the file cannot be found at the given path.
    """
    metadata = {"source": file_path}
    
    try:
        text = pymupdf4llm.to_markdown(file_path)
    except Exception as e:
        print(f"pymupdf4llm failed for {file_path}: {e}")
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
        
    return pdf_chunks, metadata 