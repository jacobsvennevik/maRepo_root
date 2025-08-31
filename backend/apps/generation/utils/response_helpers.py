"""
Response helper utilities for standardized API responses.

This module provides helper functions to create consistent API responses
across all views, reducing code duplication and improving maintainability.
"""

from rest_framework.response import Response
from rest_framework import status


def create_success_response(data, message="Success", status_code=status.HTTP_200_OK):
    """
    Create a standardized success response.
    
    Args:
        data: The response data
        message: Optional success message
        status_code: HTTP status code (default: 200)
    
    Returns:
        Response: Standardized success response
    """
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status_code)


def create_error_response(error_message, status_code=status.HTTP_400_BAD_REQUEST, details=None):
    """
    Create a standardized error response.
    
    Args:
        error_message: The error message
        status_code: HTTP status code (default: 400)
        details: Optional additional error details
    
    Returns:
        Response: Standardized error response
    """
    response_data = {
        'success': False,
        'error': error_message
    }
    
    if details:
        response_data['details'] = details
    
    return Response(response_data, status=status_code)


def create_file_response(content, filename, content_type='application/octet-stream'):
    """
    Create a standardized file download response.
    
    Args:
        content: The file content
        filename: The filename for download
        content_type: MIME type of the file
    
    Returns:
        Response: File download response
    """
    response = Response(content, content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def create_paginated_response(queryset, serializer_class, request, page_size=20):
    """
    Create a standardized paginated response.
    
    Args:
        queryset: The queryset to paginate
        serializer_class: Serializer class for the data
        request: The request object
        page_size: Number of items per page
    
    Returns:
        Response: Paginated response
    """
    from rest_framework.pagination import PageNumberPagination
    
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = serializer_class(queryset, many=True)
    return Response(serializer.data)
