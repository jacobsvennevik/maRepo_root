from typing import Optional, Dict, Any
import jwt
import requests
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

User = get_user_model()

class KeycloakAuthenticationBackend(BaseBackend):
    """
    Custom authentication backend for Keycloak integration.
    Handles token validation, user info extraction, and role mapping.
    """
    
    def __init__(self):
        # Keycloak settings validation
        required_settings = [
            'KEYCLOAK_SERVER_URL',
            'KEYCLOAK_REALM',
            'KEYCLOAK_CLIENT_ID',
            'KEYCLOAK_CLIENT_SECRET',
        ]
        
        for setting in required_settings:
            if not hasattr(settings, setting):
                raise ImproperlyConfigured(f"Missing required setting: {setting}")
                
        self.server_url = settings.KEYCLOAK_SERVER_URL
        self.realm = settings.KEYCLOAK_REALM
        self.client_id = settings.KEYCLOAK_CLIENT_ID
        self.client_secret = settings.KEYCLOAK_CLIENT_SECRET
        
        # Cache the JWKS data
        self.jwks = self._get_jwks()
    
    def _get_jwks(self) -> Dict:
        """Fetch the JSON Web Key Set from Keycloak."""
        jwks_url = f"{self.server_url}/realms/{self.realm}/protocol/openid-connect/certs"
        response = requests.get(jwks_url)
        response.raise_for_status()
        return response.json()
    
    def _get_matching_jwk(self, kid: str) -> Optional[Dict]:
        """Find the matching JWK for the given key ID."""
        for key in self.jwks.get('keys', []):
            if key.get('kid') == kid:
                return key
        return None
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate the JWT token and return the decoded payload.
        Raises jwt.InvalidTokenError if validation fails.
        """
        # Decode the token header without verification to get the key ID
        header = jwt.get_unverified_header(token)
        kid = header.get('kid')
        
        if not kid:
            raise jwt.InvalidTokenError('No key ID in token header')
            
        # Get the matching JWK
        jwk = self._get_matching_jwk(kid)
        if not jwk:
            self.jwks = self._get_jwks()  # Refresh JWKS
            jwk = self._get_matching_jwk(kid)
            if not jwk:
                raise jwt.InvalidTokenError('No matching key found')
        
        # Convert JWK to PEM format for PyJWT
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
        
        # Validate and decode the token
        decoded = jwt.decode(
            token,
            key=public_key,
            algorithms=['RS256'],
            audience=self.client_id,
            issuer=f"{self.server_url}/realms/{self.realm}"
        )
        
        return decoded
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Fetch additional user info from Keycloak."""
        userinfo_url = f"{self.server_url}/realms/{self.realm}/protocol/openid-connect/userinfo"
        headers = {'Authorization': f'Bearer {access_token}'}
        
        response = requests.get(userinfo_url, headers=headers)
        response.raise_for_status()
        return response.json()
    
    def authenticate(self, request, token=None, **kwargs) -> Optional[User]:
        """
        Authenticate the user using the provided token.
        Returns User instance if successful, None otherwise.
        """
        if not token:
            return None
            
        try:
            # Validate the token
            decoded_token = self.validate_token(token)
            
            # Get user info from token
            sub = decoded_token.get('sub')
            email = decoded_token.get('email')
            
            if not sub or not email:
                return None
            
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': decoded_token.get('given_name', ''),
                    'last_name': decoded_token.get('family_name', ''),
                }
            )
            
            # Update user roles
            self._update_user_roles(user, decoded_token)
            
            return user
            
        except (jwt.InvalidTokenError, requests.RequestException):
            return None
    
    def _update_user_roles(self, user: User, token_data: Dict):
        """Update user roles based on Keycloak roles in the token."""
        realm_roles = token_data.get('realm_access', {}).get('roles', [])
        resource_roles = token_data.get('resource_access', {}).get(self.client_id, {}).get('roles', [])
        
        # Combine realm and resource roles
        all_roles = set(realm_roles + resource_roles)
        
        # Update Django groups/permissions based on roles
        # This is a basic implementation - customize based on your needs
        from django.contrib.auth.models import Group
        
        # Remove old groups
        user.groups.clear()
        
        # Add new groups based on Keycloak roles
        for role_name in all_roles:
            group, _ = Group.objects.get_or_create(name=role_name)
            user.groups.add(group)
        
        user.save()
    
    def get_user(self, user_id):
        """Retrieve user by ID."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 