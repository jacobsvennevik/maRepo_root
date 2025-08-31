from django.apps import AppConfig


class ReflectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.apps.reflection'
    verbose_name = 'Reflection & AAR'
    
    def ready(self):
        """Import signals when the app is ready."""
        try:
            import backend.apps.reflection.signals
        except ImportError:
            pass
