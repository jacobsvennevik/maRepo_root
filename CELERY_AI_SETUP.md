# Celery Setup with AI Integration

This guide explains how to set up and run Celery with AI integration for Smart Metadata Generation.

## Prerequisites

- Python 3.8+
- Redis server running
- OpenAI API key or Google Gemini API key
- Django project configured

## Environment Configuration

### 1. API Keys Setup

Add your AI API keys to `backend/.env`:

```bash
# OpenAI API Key (primary)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Gemini API Key (fallback)
GEMINI_API_KEY=your-gemini-api-key-here

# Feature flags
ENABLE_STI=true
NEXT_PUBLIC_SHOW_AI_META=true
```

### 2. Celery Configuration

The Celery configuration is already set up in `backend/celery_config.py`. Ensure Redis is running:

```bash
# Start Redis (if not already running)
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

## Running Celery

### 1. Start Celery Worker

```bash
# From the project root
cd backend
celery -A backend worker --loglevel=info
```

### 2. Start Celery Beat (for scheduled tasks)

```bash
# In a separate terminal
cd backend
celery -A backend beat --loglevel=info
```

### 3. Monitor Celery Tasks

```bash
# Monitor task queue
celery -A backend flower

# Or use the built-in monitoring
celery -A backend inspect active
celery -A backend inspect stats
```

## AI Metadata Generation Tasks

### Manual Task Execution

```python
from backend.apps.projects.tasks import generate_project_meta

# Generate metadata for a specific project
task = generate_project_meta.delay("project-uuid-here")
result = task.get(timeout=30)
```

### Scheduled Tasks

The following tasks run automatically:

- **Nightly Metadata Generation**: `generate_missing_metadata_nightly`
  - Runs daily at 2:00 AM
  - Generates metadata for projects missing it
  - Processes in batches of 10 projects

- **Cleanup Task**: `cleanup_old_metadata`
  - Runs weekly
  - Removes orphaned metadata entries
  - Cleans up old draft project metadata

### API Endpoint

Trigger metadata generation via API:

```bash
# Generate metadata for a project
curl -X POST \
  http://localhost:8000/api/projects/{project_id}/generate_metadata/ \
  -H "Authorization: Bearer {token}"

# Force regenerate existing metadata
curl -X POST \
  http://localhost:8000/api/projects/{project_id}/generate_metadata/?force=true \
  -H "Authorization: Bearer {token}"
```

## Monitoring and Metrics

### Prometheus Metrics

The following metrics are automatically collected:

- `project_meta_generated_total`: Total metadata generations (success/failure)
- `project_meta_generation_failures_total`: Failure count by error type
- `project_meta_generation_in_progress`: Currently running tasks
- `project_meta_generation_duration_seconds`: Task duration histogram
- `project_meta_content_length_chars`: Content length analysis
- `project_meta_tags_count`: Number of tags generated
- `project_meta_summary_length_chars`: Summary length

### Logging

Celery tasks log to Django's logging system:

```python
import logging
logger = logging.getLogger(__name__)

# Log levels: INFO, WARNING, ERROR
logger.info("Metadata generation started")
logger.error("AI API call failed")
```

## Troubleshooting

### Common Issues

1. **Redis Connection Error**
   ```bash
   # Check Redis is running
   redis-cli ping
   # Should return: PONG
   ```

2. **API Key Issues**
   ```bash
   # Test API keys
   python3 test_real_ai_integration.py
   ```

3. **Celery Worker Not Starting**
   ```bash
   # Check Celery configuration
   celery -A backend inspect ping
   ```

4. **Task Failures**
   ```bash
   # Check failed tasks
   celery -A backend inspect failed
   
   # Retry failed tasks
   celery -A backend inspect retry
   ```

### Debug Mode

Enable debug logging:

```bash
# Start worker with debug logging
celery -A backend worker --loglevel=debug

# Start beat with debug logging
celery -A backend beat --loglevel=debug
```

## Performance Tuning

### Worker Configuration

```bash
# Run multiple worker processes
celery -A backend worker --concurrency=4 --loglevel=info

# Use specific queue
celery -A backend worker -Q metadata_generation --loglevel=info
```

### Rate Limiting

Configure rate limits in `backend/apps/projects/tasks.py`:

```python
@shared_task(bind=True, rate_limit='10/m')  # 10 tasks per minute
def generate_project_meta(self, project_id: str):
    # ... task implementation
```

### Batch Processing

For large datasets, use batch processing:

```python
from celery import group

# Process multiple projects in parallel
tasks = group(generate_project_meta.s(str(p.id)) for p in projects)
results = tasks.apply_async()
```

## Security Considerations

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables or secret management
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement rate limits to prevent API abuse
   - Monitor API usage and costs

3. **Error Handling**
   - Graceful fallback to Gemini if OpenAI fails
   - Comprehensive error logging
   - Retry mechanisms for transient failures

## Cost Optimization

### OpenAI API Costs

- GPT-4: ~$0.03 per 1K tokens
- Typical project analysis: 500-1000 tokens
- Estimated cost per project: $0.015-$0.03

### Optimization Strategies

1. **Content Truncation**: Limit input to 4000 characters
2. **Batch Processing**: Process multiple projects together
3. **Caching**: Cache results to avoid re-generation
4. **Fallback**: Use Gemini for cost-sensitive operations

## Testing

### Unit Tests

```bash
# Run metadata generation tests
python3 manage.py test backend.apps.projects.tests.test_metadata_generation
```

### Integration Tests

```bash
# Test with real API keys
python3 test_real_ai_integration.py

# Test Celery tasks
python3 manage.py test backend.apps.projects.tests.test_tasks
```

### E2E Tests

```bash
# Run Cypress tests
npm run cypress:run
```

## Deployment

### Production Setup

1. **Use Redis Cluster** for high availability
2. **Configure Celery Beat** with persistent storage
3. **Set up monitoring** with Prometheus/Grafana
4. **Implement health checks** for worker processes

### Docker Deployment

```dockerfile
# Example Dockerfile for Celery worker
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["celery", "-A", "backend", "worker", "--loglevel=info"]
```

### Kubernetes Deployment

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: celery-worker
  template:
    metadata:
      labels:
        app: celery-worker
    spec:
      containers:
      - name: celery-worker
        image: your-app:latest
        command: ["celery", "-A", "backend", "worker", "--loglevel=info"]
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379/0"
```

## Support

For issues with Celery or AI integration:

1. Check the logs: `celery -A backend worker --loglevel=info`
2. Monitor metrics: `curl localhost:8000/metrics`
3. Test API keys: `python3 test_real_ai_integration.py`
4. Review documentation: `SMART_METADATA_IMPLEMENTATION.md` 