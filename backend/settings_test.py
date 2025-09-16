from .settings import *  # noqa

# Use fast, isolated SQLite DB for tests
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Faster password hasher for tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# In-memory email backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Celery: run tasks eagerly in tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Relax DRF permissions during tests
REST_FRAMEWORK["DEFAULT_PERMISSION_CLASSES"] = [
    "rest_framework.permissions.AllowAny",
]

# Disable migrations for local apps to speed tests and avoid duplicate DDL
MIGRATION_MODULES = {
    "accounts": None,
    "generation": None,
    "pdf_service": None,
    "projects": None,
    "reflection": None,
    "study_materials": None,
}

# Hosts for Django test client
ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]


