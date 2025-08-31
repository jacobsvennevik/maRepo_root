# Models package initialization
# Import all models to maintain backward compatibility

# Original models
from .flashcard_models import FlashcardSet, Flashcard
from .mindmap_models import MindMap, MindMapSet
from .question_models import QuestionSet, Question, Choice
from .interleaving_models import Topic, Principle, InterleavingSessionConfig
from .profile_models import FlashcardProfile, GeneratedContent
from .diagnostic_models import DiagnosticSession, DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics

# Enhanced models with mixins (temporarily disabled due to mixin issues)
# from .enhanced_flashcard_models import EnhancedFlashcardSet, EnhancedFlashcard
# from .enhanced_diagnostic_models import EnhancedDiagnosticSession, EnhancedDiagnosticQuestion

# Model mixins for reuse
from .mixins import (
    TimestampMixin, StatusMixin, ValidationMixin, 
    MetricsMixin, SearchMixin, CacheMixin, AuditMixin
)

# Model utility functions
from .utils import (
    get_model_stats, get_model_field_usage, get_model_relationships,
    get_model_performance_metrics, bulk_update_model_fields,
    get_model_data_quality_report, export_model_data
)

__all__ = [
    # Original models
    'FlashcardSet',
    'Flashcard', 
    'MindMap',
    'MindMapSet',
    'QuestionSet',
    'Question',
    'Choice',
    'Topic',
    'Principle',
    'FlashcardProfile',
    'InterleavingSessionConfig',
    'GeneratedContent',
    'DiagnosticSession',
    'DiagnosticQuestion',
    'DiagnosticResponse',
    'DiagnosticAnalytics',
    
    # Enhanced models (temporarily disabled)
    # 'EnhancedFlashcardSet',
    # 'EnhancedFlashcard',
    # 'EnhancedDiagnosticSession',
    # 'EnhancedDiagnosticQuestion',
    
    # Model mixins
    'TimestampMixin',
    'StatusMixin',
    'ValidationMixin',
    'MetricsMixin',
    'SearchMixin',
    'CacheMixin',
    'AuditMixin',
    
    # Utility functions
    'get_model_stats',
    'get_model_field_usage',
    'get_model_relationships',
    'get_model_performance_metrics',
    'bulk_update_model_fields',
    'get_model_data_quality_report',
    'export_model_data',
]
