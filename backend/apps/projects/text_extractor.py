"""
Text extraction service for various file formats.

Supports:
- Plain text files (.txt)
- PDF files (text-based with PyMuPDF/pdfplumber and OCR fallback)
- Word documents (.docx)
"""
import io
import logging
import signal
from typing import Tuple, Dict, BinaryIO, Optional
from contextlib import contextmanager
from .extraction_settings import (
    get_pdf_backend, is_ocr_enabled, get_extraction_timeout,
    is_file_too_large, is_pdf_too_long, is_language_detection_enabled
)

logger = logging.getLogger("projects.extraction")


class ExtractionTimeoutError(Exception):
    """Raised when text extraction times out."""
    pass


@contextmanager
def extraction_timeout(seconds: int):
    """Context manager to enforce extraction timeouts."""
    def timeout_handler(signum, frame):
        raise ExtractionTimeoutError(f"Text extraction timed out after {seconds} seconds")
    
    # Set up the timeout
    old_handler = signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    
    try:
        yield
    finally:
        # Clean up
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old_handler)


def extract_text(fh: BinaryIO, filename: str, content_type: str = None, file_size: int = None) -> Tuple[str, Dict]:
    """
    Extract text from a file based on its type.
    
    Args:
        fh: File handle (binary mode)
        filename: Original filename for extension detection
        content_type: MIME type (optional)
        file_size: File size in bytes (optional)
        
    Returns:
        Tuple of (extracted_text, metadata_dict)
    """
    # Check file size limits
    if file_size and is_file_too_large(file_size):
        logger.warning(f"File too large for extraction: {filename} ({file_size} bytes)")
        return "", {"error": "file_too_large", "failure_reason": "size_limit"}
    
    name = (filename or "").lower()
    timeout = get_extraction_timeout()
    
    try:
        with extraction_timeout(timeout):
            if name.endswith(".txt") or content_type == "text/plain":
                return _extract_text_from_txt(fh, filename)
            
            elif name.endswith(".docx") or content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return _extract_text_from_docx(fh, filename)
            
            elif name.endswith(".pdf") or content_type == "application/pdf":
                return _extract_text_from_pdf(fh, filename, file_size)
            
            else:
                logger.warning(f"Unsupported file type: {filename} (content_type: {content_type})")
                return "", {"error": "Unsupported file type", "failure_reason": "unsupported_mime"}
                
    except ExtractionTimeoutError as e:
        logger.error(f"Extraction timeout for {filename}: {e}")
        return "", {"error": str(e), "failure_reason": "timeout"}
    except Exception as e:
        logger.error(f"Error extracting text from {filename}: {e}")
        return "", {"error": str(e), "failure_reason": "extraction_error"}


def _extract_text_from_txt(fh: BinaryIO) -> Tuple[str, Dict]:
    """Extract text from plain text files."""
    try:
        data = fh.read()
        text = data.decode("utf-8", "ignore")
        return text.strip(), {"type": "txt"}
    except Exception as e:
        logger.error(f"Error reading text file: {e}")
        return "", {"error": str(e)}


def _extract_text_from_docx(fh: BinaryIO) -> Tuple[str, Dict]:
    """Extract text from DOCX files."""
    try:
        # Optional dependency - graceful fallback
        try:
            from docx import Document
        except ImportError:
            logger.warning("python-docx not installed, cannot extract from DOCX files")
            return "", {"error": "python-docx not available"}
        
        content = io.BytesIO(fh.read())
        doc = Document(content)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs)
        
        metadata = {
            "type": "docx",
            "paragraphs": len(paragraphs),
        }
        
        return text.strip(), metadata
        
    except Exception as e:
        logger.error(f"Error extracting from DOCX: {e}")
        return "", {"error": str(e)}


def _extract_text_from_pdf(fh: BinaryIO, filename: str, file_size: int = None) -> Tuple[str, Dict]:
    """Extract text from PDF files with backend selection and OCR fallback."""
    
    backend = get_pdf_backend()
    
    # Try text-based PDF extraction first
    try:
        if backend == "pymupdf":
            text, metadata = _extract_text_pdf_pymupdf(fh)
        else:
            text, metadata = _extract_text_pdf_pdfplumber(fh)
            
        # Check if we got reasonable text
        if text and len(text.strip()) > 50:
            metadata['extraction_method'] = f"{backend}_text"
            return text, metadata
        else:
            logger.info(f"Minimal text extracted from {filename} using {backend}")
            
    except Exception as e:
        logger.warning(f"Text-based PDF extraction failed with {backend}: {e}")
    
    # Fallback to OCR for scanned PDFs if enabled
    if is_ocr_enabled():
        try:
            fh.seek(0)  # Reset file pointer
            text, metadata = _extract_text_pdf_ocr(fh)
            if text:
                metadata['extraction_method'] = 'ocr'
                return text, metadata
        except Exception as e:
            logger.error(f"OCR PDF extraction failed: {e}")
            return "", {"error": f"Both text and OCR extraction failed: {e}", "failure_reason": "ocr_failed"}
    else:
        return "", {"error": "No text found and OCR disabled", "failure_reason": "ocr_disabled"}


def _extract_text_pdf_pymupdf(fh: BinaryIO) -> Tuple[str, Dict]:
    """Extract text from PDFs using PyMuPDF (fast, memory-efficient)."""
    try:
        # Optional dependency - graceful fallback
        try:
            import fitz  # PyMuPDF
        except ImportError:
            logger.warning("PyMuPDF not installed, cannot extract from PDF files")
            return "", {"error": "PyMuPDF not available"}
        
        pdf_data = fh.read()
        doc = fitz.open(stream=pdf_data, filetype="pdf")
        
        try:
            page_count = len(doc)
            
            # Check page limits
            if is_pdf_too_long(page_count):
                return "", {"error": f"PDF too long ({page_count} pages)", "failure_reason": "page_limit"}
            
            text_parts = []
            for page_num in range(page_count):
                page = doc[page_num]
                page_text = page.get_text("text") or ""
                if page_text.strip():
                    text_parts.append(page_text)
            
            text = "\n".join(text_parts).strip()
            
            metadata = {
                "type": "pdf_pymupdf",
                "pages": page_count,
                "backend": "pymupdf"
            }
            
            return text, metadata
            
        finally:
            doc.close()
        
    except Exception as e:
        logger.error(f"PyMuPDF extraction error: {e}")
        raise


def _extract_text_pdf_pdfplumber(fh: BinaryIO) -> Tuple[str, Dict]:
    """Extract text from PDFs using pdfplumber."""
    try:
        # Optional dependency - graceful fallback
        try:
            import pdfplumber
        except ImportError:
            logger.warning("pdfplumber not installed, cannot extract from PDF files")
            return "", {"error": "pdfplumber not available"}
        
        content = io.BytesIO(fh.read())
        text_parts = []
        
        with pdfplumber.open(content) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(page_text)
            
            text = "\n".join(text_parts).strip()
            pages = len(pdf.pages)
        
        metadata = {
            "type": "pdf_text",
            "pages": pages,
            "extraction_method": "text_based"
        }
        
        return text, metadata
        
    except Exception as e:
        logger.error(f"Text-based PDF extraction error: {e}")
        raise


def _extract_text_pdf_ocr(fh: BinaryIO) -> Tuple[str, Dict]:
    """Extract text from scanned PDFs using OCR."""
    try:
        # Optional dependencies - graceful fallback
        try:
            from pdf2image import convert_from_bytes
            import pytesseract
        except ImportError:
            logger.warning("pdf2image or pytesseract not installed, cannot perform OCR")
            return "", {"error": "OCR dependencies not available"}
        
        content = fh.read()
        
        # Convert PDF pages to images
        images = convert_from_bytes(content, fmt="png", dpi=200)
        
        # Extract text from each image
        ocr_text_parts = []
        for i, image in enumerate(images):
            try:
                page_text = pytesseract.image_to_string(image, lang='eng')
                if page_text.strip():
                    ocr_text_parts.append(page_text)
            except Exception as e:
                logger.warning(f"OCR failed for page {i+1}: {e}")
        
        text = "\n".join(ocr_text_parts).strip()
        
        metadata = {
            "type": "pdf_ocr",
            "pages": len(images),
            "extraction_method": "ocr"
        }
        
        return text, metadata
        
    except Exception as e:
        logger.error(f"OCR PDF extraction error: {e}")
        raise


def get_extraction_requirements():
    """Get information about optional dependencies for text extraction."""
    requirements = {
        "pdf_text": {
            "package": "pdfplumber",
            "available": False,
            "description": "Text-based PDF extraction"
        },
        "pdf_ocr": {
            "package": "pdf2image + pytesseract",
            "available": False,
            "description": "OCR for scanned PDFs"
        },
        "docx": {
            "package": "python-docx",
            "available": False,
            "description": "Word document extraction"
        }
    }
    
    # Check availability
    try:
        import pdfplumber
        requirements["pdf_text"]["available"] = True
    except ImportError:
        pass
    
    try:
        import pdf2image
        import pytesseract
        requirements["pdf_ocr"]["available"] = True
    except ImportError:
        pass
    
    try:
        import docx
        requirements["docx"]["available"] = True
    except ImportError:
        pass
    
    return requirements


def detect_language(text: str) -> Optional[str]:
    """
    Detect the language of extracted text.
    
    Args:
        text: The text to analyze
        
    Returns:
        ISO language code (e.g., 'en', 'es') or None if detection fails
    """
    if not is_language_detection_enabled() or len(text) < 200:
        return None
        
    try:
        # Optional dependency - graceful fallback
        from langdetect import detect
        language = detect(text)
        return language[:8]  # Truncate to field limit
    except ImportError:
        logger.debug("langdetect not installed, skipping language detection")
        return None
    except Exception as e:
        logger.debug(f"Language detection failed: {e}")
        return None


def finalize_extraction_metadata(text: str, metadata: Dict) -> Dict:
    """
    Add final metadata to extraction results.
    
    Args:
        text: Extracted text
        metadata: Existing metadata dict
        
    Returns:
        Enhanced metadata dict
    """
    # Add language detection
    if text:
        language = detect_language(text)
        if language:
            metadata['language'] = language
    
    # Add standard fields
    metadata['char_count'] = len(text)
    metadata['success'] = len(text) > 0
    
    return metadata
