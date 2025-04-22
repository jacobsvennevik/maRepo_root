from django.contrib.auth import authenticate
from django.utils.functional import SimpleLazyObject
from django.utils.deprecation import MiddlewareMixin

class KeycloakAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to handle Keycloak token authentication.
    Extracts the token from the Authorization header and authenticates the user.
    """
    
    def process_request(self, request):
        """
        Process each request to extract and validate the token,
        and set request.user if authentication is successful.
        """
        # Don't process if user is already authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            return
        
        # Get the Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return
        
        # Extract the token
        token = auth_header.split(' ')[1]
        
        # Lazy authentication - only performed when request.user is accessed
        request.user = SimpleLazyObject(lambda: authenticate(request, token=token) or request.user) 