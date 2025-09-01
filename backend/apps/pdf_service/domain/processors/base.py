from abc import ABC, abstractmethod
from pydantic import BaseModel
from backend.core_platform.ai.factory import AIClient


class BaseProcessor(ABC):
    """
    Abstract base class for all document processors.
    """
    def __init__(self, client: AIClient):
        self.client = client

    @abstractmethod
    def process(self, text: str) -> BaseModel:
        """
        Processes the text of a document and returns a Pydantic model.
        """
        pass 