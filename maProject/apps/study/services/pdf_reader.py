# pdf_reader.py
import os
import pathlib
import pymupdf4llm

def read_pdf(pdf_path):
    """
    Reads a PDF file, converts it to Markdown, and returns the Markdown text.
    Also saves the Markdown output to 'output.md' (UTF-8 encoded).
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Convert the PDF file to Markdown.
    md_text = pymupdf4llm.to_markdown(pdf_path)
    
    # Optionally, save the Markdown text to an output file.
    output_file = pathlib.Path("output.md")
    output_file.write_bytes(md_text.encode('utf-8'))
    
    return md_text
