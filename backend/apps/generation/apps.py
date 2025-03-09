# backend/apps/generation/apps.py
from django.apps import AppConfig

class GenerationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.apps.generation'

    def ready(self):
        # Import the models to ensure they are registered.
        import backend.apps.generation.models