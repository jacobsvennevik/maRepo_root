"""
Keycloak authentication settings.

These settings must be configured in your Django settings.py file:

KEYCLOAK_SERVER_URL:
    The base URL of your Keycloak server
    Example: 'https://keycloak.example.com'

KEYCLOAK_REALM:
    The name of your Keycloak realm
    Example: 'my-realm'

KEYCLOAK_CLIENT_ID:
    The client ID for your application in Keycloak
    Example: 'my-client'

KEYCLOAK_CLIENT_SECRET:
    The client secret for your application in Keycloak
    Example: '1234567890abcdef'

Example configuration:

    KEYCLOAK_SERVER_URL = 'https://keycloak.example.com'
    KEYCLOAK_REALM = 'my-realm'
    KEYCLOAK_CLIENT_ID = 'my-client'
    KEYCLOAK_CLIENT_SECRET = '1234567890abcdef'

    AUTHENTICATION_BACKENDS = [
        'backend.apps.keycloak_auth.backend.KeycloakAuthenticationBackend',
        'django.contrib.auth.backends.ModelBackend',
    ]

    MIDDLEWARE = [
        ...
        'backend.apps.keycloak_auth.middleware.KeycloakAuthenticationMiddleware',
        ...
    ]
"""

# Default settings
KEYCLOAK_SERVER_URL = None
KEYCLOAK_REALM = None
KEYCLOAK_CLIENT_ID = None
KEYCLOAK_CLIENT_SECRET = None 