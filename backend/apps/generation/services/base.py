from abc import ABC, abstractmethod
from typing import List, Dict

class BaseAIClient(ABC):
    """
    Abstract base class for AI clients.
    """

    @abstractmethod
    def get_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Gets a response from the AI model.
        """
        pass

    def format_message(self, role: str, content: str) -> Dict[str, str]:
        """
        Formats a message for the AI model.
        """
        return {"role": role, "content": content} 