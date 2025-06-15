import pytest
from celery import Celery

@pytest.fixture(autouse=True)
def setup_celery():
    """Configure Celery to use the memory transport for testing."""
    app = Celery('test_app')
    app.conf.update(
        broker_url='memory://',
        result_backend='cache+memory://',  # Use memory cache backend
        task_always_eager=True,  # Tasks will be executed immediately
        task_eager_propagates=True,  # Exceptions will be propagated
        task_store_eager_result=True,  # Results will be stored
        accept_content=['json'],
        task_serializer='json',
        result_serializer='json',
    )
    return app 