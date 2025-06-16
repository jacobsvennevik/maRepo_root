from pydantic import BaseModel
from .base import BaseProcessor

class UnknownProcessorService(BaseProcessor):
    """
    Processor for documents that are of an unknown type.
    """

    def __init__(self, *args, **kwargs):
        pass # No client needed for this processor

    def process(self, text: str) -> BaseModel:
        """
        Returns an empty Pydantic model as there is no processing to be done.
        """
        return BaseModel() 