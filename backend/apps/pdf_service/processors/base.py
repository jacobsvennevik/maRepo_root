from abc import ABC, abstractmethod
from pydantic import BaseModel
from backend.apps.generation.services.base import BaseAIClient

class BaseProcessor(ABC):
    """
    Abstract base class for all document processors.
    """
    def __init__(self, client: BaseAIClient):
        self.client = client

    @abstractmethod
    def process(self, text: str) -> BaseModel:
        """
        Processes the text of a document and returns a Pydantic model.
        """
        pass 