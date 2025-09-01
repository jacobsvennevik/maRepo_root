"""
Processor registry for PDF document processing.
"""
from typing import Dict, Type, Optional
from backend.core_platform.observability.logging import get_logger
from .base import BaseProcessor
from .syllabus import SyllabusProcessor
from .exam import ExamProcessor
from .study_content import StudyContentProcessor
from .note import NoteProcessor
from .unknown import UnknownProcessor

logger = get_logger(__name__)


class ProcessorRegistry:
    """Registry for PDF processors."""
    
    def __init__(self):
        self._processors: Dict[str, Type[BaseProcessor]] = {}
        self._register_default_processors()
    
    def _register_default_processors(self):
        """Register the default processors."""
        self.register("syllabus", SyllabusProcessor)
        self.register("exam", ExamProcessor)
        self.register("study_content", StudyContentProcessor)
        self.register("note", NoteProcessor)
        self.register("unknown", UnknownProcessor)
    
    def register(self, name: str, processor_class: Type[BaseProcessor]):
        """Register a processor class."""
        self._processors[name] = processor_class
        logger.info("Registered processor", processor_name=name)
    
    def get_processor(self, name: str) -> Type[BaseProcessor]:
        """Get a processor class by name."""
        processor_class = self._processors.get(name)
        if processor_class is None:
            logger.warning("Unknown processor requested, using unknown processor", processor_name=name)
            return UnknownProcessor
        return processor_class
    
    def list_processors(self) -> list[str]:
        """List all registered processor names."""
        return list(self._processors.keys())
    
    def has_processor(self, name: str) -> bool:
        """Check if a processor is registered."""
        return name in self._processors


# Global registry instance
registry = ProcessorRegistry()


def get_processor(name: str) -> Type[BaseProcessor]:
    """Get a processor class from the global registry."""
    return registry.get_processor(name)


def register_processor(name: str, processor_class: Type[BaseProcessor]):
    """Register a processor class in the global registry."""
    registry.register(name, processor_class)


def list_processors() -> list[str]:
    """List all registered processors."""
    return registry.list_processors()
