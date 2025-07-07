from pydantic import BaseModel
from .base import BaseProcessor

class UnknownProcessorService(BaseProcessor):
    """
    Processor for documents that are of an unknown type.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def process(self, text: str) -> BaseModel:
        """
        Returns an empty Pydantic model as there is no processing to be done.
        """
        # Return a basic BaseModel instance with some metadata
        class UnknownDocument(BaseModel):
            message: str = "Document type unknown - no processing performed"
            text_length: int = len(text) if text else 0
        
        return UnknownDocument() 