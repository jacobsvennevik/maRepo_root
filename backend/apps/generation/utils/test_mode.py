from django.conf import settings
from rest_framework.response import Response

def is_test_mode(request):
    """
    Safely check if the request is in test mode.
    Only returns True when DEBUG=True and X-Test-Mode header is present.
    """
    return (
        settings.DEBUG and 
        request.headers.get('X-Test-Mode', '').lower() == 'true'
    )

def safe_test_mode_response(request, mock_data, real_response_func):
    """
    Safely handle test mode responses.
    
    Args:
        request: The Django request object
        mock_data: The mock data to return in test mode
        real_response_func: Function to call for real data (if not in test mode)
    
    Returns:
        Response with either mock data or real data
    """
    if is_test_mode(request):
        return Response(mock_data)
    else:
        return real_response_func()
