"""
Database router for read/write splitting.
Automatically routes read queries to read replica and write queries to primary database.
"""
from django.conf import settings


class DatabaseRouter:
    """
    Database router that splits read and write operations.
    
    - Read operations go to read_replica
    - Write operations go to default (primary)
    - Migrations always go to default
    """
    
    read_db = 'read_replica'
    write_db = 'default'
    
    def db_for_read(self, model, **hints):
        """Point all read operations to read replica."""
        return self.read_db
    
    def db_for_write(self, model, **hints):
        """Point all write operations to primary database."""
        return self.write_db
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations between objects in the same database."""
        db_set = {self.read_db, self.write_db}
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Ensure migrations only run on the primary database."""
        return db == self.write_db


class ReadWriteRouter:
    """
    Advanced database router with model-specific routing.
    
    Allows fine-grained control over which models use read replicas.
    """
    
    # Models that should always use read replica for reads
    READ_ONLY_MODELS = {
        'generation.flashcard',
        'generation.flashcardset',
        'projects.project',
        'pdf_service.uploadedfile',
    }
    
    # Models that should always use primary database
    WRITE_ONLY_MODELS = {
        'auth.user',
        'accounts.customuser',
    }
    
    def db_for_read(self, model, **hints):
        """Route read operations based on model."""
        model_name = f"{model._meta.app_label}.{model._meta.model_name}"
        
        # Always use primary for write-only models
        if model_name in self.WRITE_ONLY_MODELS:
            return 'default'
        
        # Use read replica for read-only models
        if model_name in self.READ_ONLY_MODELS:
            return 'read_replica'
        
        # Default to read replica for other models
        return 'read_replica'
    
    def db_for_write(self, model, **hints):
        """Always route writes to primary database."""
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations between objects."""
        return True
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Ensure migrations only run on primary database."""
        return db == 'default'


# Use the advanced router
DATABASE_ROUTERS = ['backend.core_platform.database.ReadWriteRouter']
