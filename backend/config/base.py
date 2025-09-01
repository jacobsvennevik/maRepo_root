"""
Base Django settings for backend project.
"""
from pathlib import Path
from datetime import timedelta
from backend.core_platform.config import settings

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = settings.SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = settings.DEBUG

ALLOWED_HOSTS = settings.ALLOWED_HOSTS

AUTH_USER_MODEL = 'accounts.CustomUser'

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "backend.apps.accounts",
    "backend.apps.pdf_service", 
    "backend.apps.generation",
    "backend.apps.study_materials",
    "backend.apps.projects",
    "backend.apps.reflection",
    'debug_toolbar',  
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',  # OpenAPI schema generation
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "backend.core_platform.http.deprecation.APIDeprecationMiddleware",
]

CORS_ALLOWED_ORIGINS = settings.CORS_ALLOWED_ORIGINS

INTERNAL_IPS = [
    "127.0.0.1",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Database
DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': settings.DB_NAME,
        'USER': settings.DB_USER,
        'PASSWORD': settings.DB_PASSWORD,
        'HOST': settings.DB_HOST,
        'PORT': settings.DB_PORT,
        'CONN_MAX_AGE': 60,  # seconds; set to 0 in tests, higher in prod behind pgbouncer
    }
}

# Caching
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": settings.REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
        "KEY_PREFIX": f"ocean:{settings.DJANGO_ENV}",
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Avoid implicit redirect on POST when trailing slash is missing
APPEND_SLASH = False

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / settings.STATIC_ROOT
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / settings.MEDIA_ROOT

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Temporarily changed for testing
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'backend.core_platform.throttling.APIThrottle',
        'backend.core_platform.throttling.AnonAPIThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'api': '120/min',
        'anon_api': '30/min',
        'generation': '10/min',  # Stricter for AI generation
        'pdf_upload': '5/min',   # Very strict for PDF uploads
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'backend.core_platform.http.exceptions.exception_handler',
    'DEFAULT_ROUTER_TRAILING_SLASH': '/?',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 25,
    'MAX_PAGE_SIZE': 100,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'TOKEN_USER_CLASS': 'rest_framework.authentication.get_user_model',
}

# Account settings
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'

# Celery Configuration
CELERY_BROKER_URL = settings.CELERY_BROKER_URL
CELERY_RESULT_BACKEND = settings.CELERY_RESULT_BACKEND
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Celery Reliability Settings
CELERY_TASK_DEFAULT_QUEUE = "default"
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_TASK_TIME_LIMIT = 60 * 5        # 5 minutes hard limit
CELERY_TASK_SOFT_TIME_LIMIT = 60 * 4   # 4 minutes soft limit
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = True

# Celery Worker Stamina
CELERY_WORKER_MAX_TASKS_PER_CHILD = 500
CELERY_WORKER_MAX_MEMORY_PER_CHILD = 300_000  # ~300MB, tune per workload

# Celery Task Queues
CELERY_TASK_QUEUES = {
    "default": {},
    "pdf": {},
    "generation": {},
}

# Celery Task Routes
CELERY_TASK_ROUTES = {
    "backend.apps.pdf_service.tasks.*": {"queue": "pdf"},
    "backend.apps.projects.tasks.*": {"queue": "default"},
    "backend.apps.generation.*": {"queue": "generation"},
}

# DRF Spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'OceanLearn API',
    'DESCRIPTION': 'API for OceanLearn study assistant application',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'AUTHENTICATION_WHITELIST': [],
    'SECURITY': [{'bearerAuth': []}],
    'COMPONENTS': {
        'securitySchemes': {
            'bearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT'
            }
        }
    },
    'TAGS': [
        {'name': 'Projects', 'description': 'Project management endpoints'},
        {'name': 'PDF', 'description': 'PDF processing and analysis'},
        {'name': 'Generation', 'description': 'AI-powered content generation'},
        {'name': 'Health', 'description': 'System health and monitoring'},
    ],
}
