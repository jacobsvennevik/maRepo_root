"""
Text extraction configuration and settings.
"""
from django.conf import settings


# Default extraction settings
DEFAULT_TEXT_EXTRACTION = {
    "enable_ocr": False,
    "max_bytes": 30_000_000,  # 30MB limit
    "max_pages": 800,         # Page limit for large PDFs
    "backend": "pymupdf",     # or "pdfplumber"
    "timeout_seconds": 300,   # 5 minute timeout
    "enable_language_detection": True,
    "enable_content_dedup": True,
}


def get_extraction_config():
    """
    Get the current text extraction configuration.
    
    Merges default settings with user-defined settings from Django settings.
    """
    user_config = getattr(settings, 'TEXT_EXTRACTION', {})
    config = DEFAULT_TEXT_EXTRACTION.copy()
    config.update(user_config)
    return config


def is_file_too_large(file_size: int) -> bool:
    """Check if file exceeds size limits."""
    config = get_extraction_config()
    return file_size > config['max_bytes']


def is_pdf_too_long(page_count: int) -> bool:
    """Check if PDF exceeds page limits."""
    config = get_extraction_config()
    return page_count > config['max_pages']


def get_pdf_backend():
    """Get the preferred PDF extraction backend."""
    config = get_extraction_config()
    return config['backend']


def is_ocr_enabled():
    """Check if OCR is enabled."""
    config = get_extraction_config()
    return config['enable_ocr']


def get_extraction_timeout():
    """Get the extraction timeout in seconds."""
    config = get_extraction_config()
    return config['timeout_seconds']


def is_language_detection_enabled():
    """Check if language detection is enabled."""
    config = get_extraction_config()
    return config['enable_language_detection']


def is_content_dedup_enabled():
    """Check if content deduplication is enabled."""
    config = get_extraction_config()
    return config['enable_content_dedup']
