from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.test.utils import override_settings
import jwt
import requests
from .backend import KeycloakAuthenticationBackend

User = get_user_model()

# Module-level valid settings for use in decorators
valid_settings = {
    'KEYCLOAK_SERVER_URL': 'http://keycloak.example.com',
    'KEYCLOAK_REALM': 'test-realm',
    'KEYCLOAK_CLIENT_ID': 'test-client',
    'KEYCLOAK_CLIENT_SECRET': 'test-secret',
}

class KeycloakAuthenticationBackendTests(TestCase):
    def setUp(self):
        self.valid_settings = {
            'KEYCLOAK_SERVER_URL': 'http://keycloak.example.com',
            'KEYCLOAK_REALM': 'test-realm',
            'KEYCLOAK_CLIENT_ID': 'test-client',
            'KEYCLOAK_CLIENT_SECRET': 'test-secret',
        }
        
        # Sample JWT payload
        self.sample_payload = {
            'sub': 'user123',
            'email': 'test@example.com',
            'given_name': 'Test',
            'family_name': 'User',
            'realm_access': {'roles': ['user']},
            'resource_access': {
                'test-client': {
                    'roles': ['admin']
                }
            }
        }
        
        # Sample JWKS
        self.sample_jwks = {
            'keys': [{
                'kid': 'test-key-id',
                'kty': 'RSA',
                'alg': 'RS256',
                'n': 'sample-modulus',
                'e': 'AQAB'
            }]
        }

    @override_settings(**valid_settings)
    def test_init_with_valid_settings(self):
        """Test initialization with valid settings."""
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = self.sample_jwks
            backend = KeycloakAuthenticationBackend()
            self.assertEqual(backend.server_url, valid_settings['KEYCLOAK_SERVER_URL'])
            self.assertEqual(backend.realm, valid_settings['KEYCLOAK_REALM'])

    def test_init_with_missing_settings(self):
        """Test initialization with missing settings raises ImproperlyConfigured."""
        with self.assertRaises(ImproperlyConfigured):
            KeycloakAuthenticationBackend()

    @override_settings(**valid_settings)
    def test_get_jwks(self):
        """Test fetching JWKS from Keycloak server."""
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = self.sample_jwks
            backend = KeycloakAuthenticationBackend()
            jwks = backend._get_jwks()
            self.assertEqual(jwks, self.sample_jwks)
            # _get_jwks is called twice: once during __init__ and once explicitly
            self.assertEqual(mock_get.call_count, 2)
            mock_get.assert_any_call(
                f"{valid_settings['KEYCLOAK_SERVER_URL']}/realms/{valid_settings['KEYCLOAK_REALM']}/protocol/openid-connect/certs"
            )

    @override_settings(**valid_settings)
    def test_validate_token_success(self):
        """Test successful token validation."""
        with patch('requests.get') as mock_get, \
             patch('jwt.decode') as mock_decode, \
             patch('jwt.get_unverified_header') as mock_header:
            
            mock_get.return_value.json.return_value = self.sample_jwks
            mock_header.return_value = {'kid': 'test-key-id'}
            mock_decode.return_value = self.sample_payload
            
            backend = KeycloakAuthenticationBackend()
            result = backend.validate_token('valid-token')
            
            self.assertEqual(result, self.sample_payload)

    @override_settings(**valid_settings)
    def test_validate_token_invalid_kid(self):
        """Test token validation with invalid key ID."""
        with patch('requests.get') as mock_get, \
             patch('jwt.get_unverified_header') as mock_header:
            
            mock_get.return_value.json.return_value = self.sample_jwks
            mock_header.return_value = {'kid': 'invalid-key-id'}
            
            backend = KeycloakAuthenticationBackend()
            
            with self.assertRaises(jwt.InvalidTokenError):
                backend.validate_token('invalid-token')

    @override_settings(**valid_settings)
    @patch.object(KeycloakAuthenticationBackend, '_get_jwks')
    def test_authenticate_invalid_token(self, mock_get_jwks):
        """Test authentication with invalid token."""
        mock_get_jwks.return_value = self.sample_jwks
        
        with patch.object(KeycloakAuthenticationBackend, 'validate_token') as mock_validate:
            mock_validate.side_effect = jwt.InvalidTokenError()

            backend = KeycloakAuthenticationBackend()
            result = backend.authenticate(request=None, access_token='invalid-token')
            
            self.assertIsNone(result)

    @override_settings(**valid_settings)
    @patch.object(KeycloakAuthenticationBackend, '_get_jwks')
    def test_authenticate_success(self, mock_get_jwks):
        """Test successful authentication with valid token."""
        mock_get_jwks.return_value = self.sample_jwks
        
        with patch.object(KeycloakAuthenticationBackend, 'validate_token') as mock_validate:
            mock_validate.return_value = self.sample_payload

            backend = KeycloakAuthenticationBackend()
            user = backend.authenticate(request=None, token='valid-token')
            
            self.assertIsNotNone(user)
            self.assertEqual(user.email, self.sample_payload['email'])
            self.assertEqual(user.first_name, self.sample_payload['given_name'])
            self.assertEqual(user.last_name, self.sample_payload['family_name'])

    @override_settings(**valid_settings)
    def test_update_user_roles(self):
        """Test updating user roles from token data."""
        user = User.objects.create_user(email='test@example.com', first_name='Test', last_name='User')
        
        # Mock the _get_jwks method to avoid network calls
        with patch.object(KeycloakAuthenticationBackend, '_get_jwks') as mock_get_jwks:
            mock_get_jwks.return_value = self.sample_jwks
            backend = KeycloakAuthenticationBackend()
            backend._update_user_roles(user, self.sample_payload)
        
        # Check if user has both realm and resource roles
        self.assertTrue(user.groups.filter(name='user').exists())
        self.assertTrue(user.groups.filter(name='admin').exists())

    @override_settings(**valid_settings)
    @patch.object(KeycloakAuthenticationBackend, '_get_jwks')
    def test_get_user_info(self, mock_get_jwks):
        """Test fetching user info from Keycloak."""
        mock_get_jwks.return_value = self.sample_jwks
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'sub': 'user123',
                'email': 'test@example.com'
            }
            
            backend = KeycloakAuthenticationBackend()
            user_info = backend.get_user_info('valid-token')
            
            self.assertEqual(user_info['sub'], 'user123')
            self.assertEqual(user_info['email'], 'test@example.com')
            
            mock_get.assert_called_once_with(
                f"{valid_settings['KEYCLOAK_SERVER_URL']}/realms/{valid_settings['KEYCLOAK_REALM']}/protocol/openid-connect/userinfo",
                headers={'Authorization': 'Bearer valid-token'}
            ) 