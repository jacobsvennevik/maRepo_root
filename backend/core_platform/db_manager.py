"""
Database manager for manual read/write control.
Provides context managers and decorators for explicit database selection.
"""
from contextlib import contextmanager
from functools import wraps
from django.db import connections
from django.conf import settings


class DatabaseManager:
    """
    Manager for explicit database read/write operations.
    """
    
    @staticmethod
    @contextmanager
    def read_db():
        """Context manager for read operations."""
        db = connections['read_replica']
        try:
            yield db
        finally:
            db.close()
    
    @staticmethod
    @contextmanager
    def write_db():
        """Context manager for write operations."""
        db = connections['default']
        try:
            yield db
        finally:
            db.close()
    
    @staticmethod
    def using_read_replica():
        """Decorator to force read operations to use read replica."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                with DatabaseManager.read_db():
                    return func(*args, **kwargs)
            return wrapper
        return decorator
    
    @staticmethod
    def using_primary():
        """Decorator to force operations to use primary database."""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                with DatabaseManager.write_db():
                    return func(*args, **kwargs)
            return wrapper
        return decorator


# Convenience functions
def read_from_replica():
    """Context manager for read operations."""
    return DatabaseManager.read_db()


def write_to_primary():
    """Context manager for write operations."""
    return DatabaseManager.write_db()


def force_read_replica(func):
    """Decorator to force read operations to use read replica."""
    return DatabaseManager.using_read_replica()(func)


def force_primary(func):
    """Decorator to force operations to use primary database."""
    return DatabaseManager.using_primary()(func)
