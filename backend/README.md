# Study Assistant Backend

A modern, scalable Django backend for AI-powered study materials generation and management.

## 🏗️ Architecture Overview

This backend follows a **vertical slice architecture** with clean separation of concerns:

```
backend/
├── config/                    # Settings package (base, local, test, prod)
├── platform/                  # Cross-cutting infrastructure
│   ├── ai/                   # AI client abstractions
│   ├── tasks/                # Celery utilities and policies
│   ├── observability/        # Logging, metrics, tracing
│   └── health/               # Health checks and monitoring
├── apps/                     # Feature modules
│   ├── accounts/             # User management
│   ├── projects/             # Project management
│   ├── pdf_service/          # PDF processing pipeline
│   ├── generation/           # AI content generation
│   ├── reflection/           # Study reflection tools
│   └── keycloak_auth/        # Authentication
└── urls.py                   # API versioning and routing
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL
- Redis
- OpenAI API key (or Gemini API key)

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   # Run the migration script to setup new config
   python migrate_settings.py
   
   # Edit .env file with your actual values
   cp .env.example .env
   # Edit .env with your database, Redis, and API keys
   ```

3. **Database setup**:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Start services**:
   ```bash
   # Terminal 1: Django development server
   python manage.py runserver
   
   # Terminal 2: Celery worker
   celery -A backend worker -l info
   
   # Terminal 3: Celery beat (for scheduled tasks)
   celery -A backend beat -l info
   ```

## 🔧 Configuration

### Environment Variables

The application uses Pydantic settings for type-safe configuration:

```bash
# Core Django
SECRET_KEY=your-secret-key
DEBUG=True
DJANGO_ENV=local

# Database
DB_NAME=study_assistant
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Providers
AI_PROVIDER=openai  # or gemini
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key

# Observability
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
```

### Settings Modules

- `backend.config.local` - Development settings
- `backend.config.test` - Test settings
- `backend.config.prod` - Production settings

## 📡 API Documentation

### OpenAPI Schema

- **Schema**: `/api/schema/`
- **Documentation**: `/api/docs/`

### API Versioning

All APIs are versioned under `/api/v1/`:

```
/api/v1/
├── users/                    # User management
├── projects/                 # Project CRUD
├── flashcard-sets/          # Flashcard management
├── flashcards/              # Individual flashcards
├── mind-maps/               # Mind map generation
├── pdf/                     # PDF processing
├── auth/                    # Authentication
└── health/                  # Health checks
```

### Health Endpoints

- `/api/v1/health/` - Basic health check
- `/api/v1/health/ready/` - Readiness check (migrations, external services)
- `/api/v1/health/celery/` - Celery worker and queue status

## 🤖 AI Integration

### Supported Providers

- **OpenAI** (GPT-4, GPT-3.5)
- **Google Gemini**

### Usage

```python
from backend.core_platform.ai.factory import AIClientFactory

# Create client for default provider
client = AIClientFactory.create_client()

# Or specify provider
client = AIClientFactory.create_client("openai")

# Generate text
response = client.generate_text("Your prompt here")

# Generate structured data
schema = {"type": "object", "properties": {...}}
result = client.generate_structured("Your prompt", schema)
```

## 🔄 Background Tasks

### Celery Configuration

Tasks are organized by queue:
- `pdf` - PDF processing tasks
- `generation` - AI content generation
- `default` - General tasks

### Task Decorators

```python
from backend.core_platform.tasks.policies import with_retry_policy, with_task_logging

@shared_task(queue='pdf')
@with_task_logging()
@with_retry_policy(max_retries=3, retry_delay=10)
def my_task():
    # Your task logic
    pass
```

### Scheduled Tasks

Configured in `backend/platform/tasks/celery.py`:
- Hourly draft cleanup
- Daily session cleanup
- Health checks every 5 minutes

## 📊 Observability

### Structured Logging

All logs use structured logging with context:

```python
from backend.core_platform.observability.logging import get_logger

logger = get_logger(__name__)
logger.info("User action", user_id=user.id, action="login")
```

### Health Monitoring

- Database connectivity
- Redis cache status
- Celery worker status
- Migration status
- External service health

### Error Tracking

Sentry integration for error tracking and performance monitoring.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific app tests
pytest apps/pdf_service/tests/
```

### Test Configuration

- Uses in-memory SQLite database
- Celery tasks run synchronously
- Mock AI clients for testing

## 🚀 Deployment

### Production Checklist

1. **Environment**:
   - Set `DJANGO_ENV=production`
   - Configure production database
   - Set up Redis cluster
   - Configure Sentry

2. **Security**:
   - Set `DEBUG=False`
   - Configure HTTPS
   - Set secure cookie settings
   - Enable HSTS

3. **Performance**:
   - Configure database connection pooling
   - Set up Redis caching
   - Configure Celery workers
   - Set up monitoring

### Docker Support

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## 📚 Development Guidelines

### Code Organization

1. **Domain Logic**: Keep business logic in `domain/` packages
2. **API Layer**: HTTP concerns in `api/` packages
3. **Infrastructure**: Cross-cutting concerns in `platform/`
4. **Tests**: Co-locate tests with code

### Adding New Features

1. Create app structure:
   ```
   apps/my_feature/
   ├── domain/
   │   ├── models.py
   │   └── services.py
   ├── api/
   │   ├── serializers.py
   │   ├── views.py
   │   └── urls.py
   └── tasks.py
   ```

2. Register in settings:
   ```python
   INSTALLED_APPS = [
       # ...
       "backend.apps.my_feature",
   ]
   ```

3. Add API routes:
   ```python
   # backend/urls.py
   path('api/v1/my-feature/', include('backend.apps.my_feature.api.urls')),
   ```

### Database Migrations

```bash
# Create migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection**:
   ```bash
   python manage.py dbshell
   ```

2. **Celery Issues**:
   ```bash
   celery -A backend inspect active
   celery -A backend inspect stats
   ```

3. **Redis Issues**:
   ```bash
   redis-cli ping
   redis-cli info
   ```

### Logs

- **Django**: Check console output
- **Celery**: Worker logs
- **Redis**: `redis-cli monitor`

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add tests for new features
3. Update documentation
4. Use structured logging
5. Follow the API versioning strategy

## 📄 License

[Your License Here]
