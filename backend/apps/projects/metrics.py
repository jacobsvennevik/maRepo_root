"""
Prometheus metrics for project metadata generation.
"""

from prometheus_client import Counter, Gauge, Histogram
from django.conf import settings

# Metadata generation counters
PROJECT_META_GENERATED_TOTAL = Counter(
    'project_meta_generated_total',
    'Total number of project metadata generations',
    ['status', 'model_used', 'project_type']
)

PROJECT_META_GENERATION_FAILURES = Counter(
    'project_meta_generation_failures_total',
    'Total number of metadata generation failures',
    ['error_type', 'model_used']
)

# Metadata generation gauges
PROJECT_META_GENERATION_IN_PROGRESS = Gauge(
    'project_meta_generation_in_progress',
    'Number of metadata generations currently in progress'
)

PROJECT_META_GENERATION_QUEUE_SIZE = Gauge(
    'project_meta_generation_queue_size',
    'Number of metadata generation tasks in queue'
)

# Metadata generation histograms
PROJECT_META_GENERATION_DURATION = Histogram(
    'project_meta_generation_duration_seconds',
    'Time spent generating metadata',
    ['model_used', 'project_type'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)

PROJECT_META_CONTENT_LENGTH = Histogram(
    'project_meta_content_length_chars',
    'Length of content analyzed for metadata generation',
    ['project_type'],
    buckets=[100, 500, 1000, 2000, 5000, 10000]
)

# Metadata quality metrics
PROJECT_META_TAGS_COUNT = Histogram(
    'project_meta_tags_count',
    'Number of tags generated per project',
    ['project_type'],
    buckets=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
)

PROJECT_META_SUMMARY_LENGTH = Histogram(
    'project_meta_summary_length_chars',
    'Length of generated content summary',
    ['project_type'],
    buckets=[10, 50, 100, 200, 500, 1000]
)

def record_metadata_generation_success(model_used: str, project_type: str, duration: float):
    """Record successful metadata generation."""
    PROJECT_META_GENERATED_TOTAL.labels(
        status='success',
        model_used=model_used,
        project_type=project_type
    ).inc()
    
    PROJECT_META_GENERATION_DURATION.labels(
        model_used=model_used,
        project_type=project_type
    ).observe(duration)

def record_metadata_generation_failure(error_type: str, model_used: str, duration: float = None):
    """Record failed metadata generation."""
    PROJECT_META_GENERATION_FAILURES.labels(
        error_type=error_type,
        model_used=model_used
    ).inc()
    
    PROJECT_META_GENERATED_TOTAL.labels(
        status='failure',
        model_used=model_used,
        project_type='unknown'
    ).inc()
    
    if duration:
        PROJECT_META_GENERATION_DURATION.labels(
            model_used=model_used,
            project_type='unknown'
        ).observe(duration)

def record_metadata_generation_start():
    """Record start of metadata generation."""
    PROJECT_META_GENERATION_IN_PROGRESS.inc()

def record_metadata_generation_end():
    """Record end of metadata generation."""
    PROJECT_META_GENERATION_IN_PROGRESS.dec()

def record_content_length(content_length: int, project_type: str):
    """Record the length of content being analyzed."""
    PROJECT_META_CONTENT_LENGTH.labels(project_type=project_type).observe(content_length)

def record_metadata_quality(tags_count: int, summary_length: int, project_type: str):
    """Record metadata quality metrics."""
    PROJECT_META_TAGS_COUNT.labels(project_type=project_type).observe(tags_count)
    PROJECT_META_SUMMARY_LENGTH.labels(project_type=project_type).observe(summary_length)

def update_queue_size(size: int):
    """Update the queue size metric."""
    PROJECT_META_GENERATION_QUEUE_SIZE.set(size) 