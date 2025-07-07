import pytest
from django.test import TestCase
from django.urls import reverse, resolve
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

from backend.apps.accounts.tests.factories import CustomUserFactory
from backend.apps.pdf_service.views_api import DocumentViewSet

User = get_user_model()


@pytest.mark.django_db
class URLRoutingTests(TestCase):
    """
    Tests for URL routing and endpoint configuration
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUserFactory()
        self.client.force_authenticate(user=self.user)

    def test_document_list_url_resolves(self):
        """Test that document list URL resolves correctly"""
        url = reverse('document-list')
        self.assertEqual(url, '/api/pdf_service/documents/')
        
        resolver = resolve(url)
        self.assertEqual(resolver.view_name, 'document-list')

    def test_document_detail_url_resolves(self):
        """Test that document detail URL resolves correctly"""
        url = reverse('document-detail', kwargs={'pk': 123})
        self.assertEqual(url, '/api/pdf_service/documents/123/')
        
        resolver = resolve(url)
        self.assertEqual(resolver.view_name, 'document-detail')

    def test_document_process_url_resolves(self):
        """Test that document process URL resolves correctly"""
        url = reverse('document-process', kwargs={'pk': 123})
        self.assertEqual(url, '/api/pdf_service/documents/123/process/')
        
        resolver = resolve(url)
        self.assertEqual(resolver.view_name, 'document-process')

    def test_document_processed_data_url_resolves(self):
        """Test that new processed_data URL resolves correctly"""
        url = reverse('document-processed-data', kwargs={'pk': 123})
        self.assertEqual(url, '/api/pdf_service/documents/123/processed_data/')
        
        resolver = resolve(url)
        self.assertEqual(resolver.view_name, 'document-processed-data')

    def test_all_document_endpoints_are_accessible(self):
        """Test that all document endpoints return appropriate responses"""
        
        # Test list endpoint
        list_response = self.client.get(reverse('document-list'))
        self.assertIn(list_response.status_code, [status.HTTP_200_OK])
        
        # Test that 404 is returned for non-existent documents (not 500)
        detail_response = self.client.get(reverse('document-detail', kwargs={'pk': 99999}))
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)
        
        process_response = self.client.post(reverse('document-process', kwargs={'pk': 99999}))
        self.assertEqual(process_response.status_code, status.HTTP_404_NOT_FOUND)
        
        processed_data_response = self.client.get(reverse('document-processed-data', kwargs={'pk': 99999}))
        self.assertEqual(processed_data_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_endpoints_require_authentication(self):
        """Test that all endpoints properly require authentication"""
        
        # Remove authentication
        self.client.force_authenticate(user=None)
        
        # Test all endpoints return 401 without auth
        endpoints = [
            reverse('document-list'),
            reverse('document-detail', kwargs={'pk': 1}),
            reverse('document-process', kwargs={'pk': 1}),
            reverse('document-processed-data', kwargs={'pk': 1}),
        ]
        
        for url in endpoints:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(
                    response.status_code, 
                    status.HTTP_401_UNAUTHORIZED,
                    f"Endpoint {url} should require authentication"
                )

    def test_viewset_action_mapping(self):
        """Test that ViewSet actions are properly mapped"""
        
        # Test that our custom actions are properly registered
        viewset = DocumentViewSet()
        
        # Check that process action exists
        self.assertTrue(hasattr(viewset, 'process'))
        
        # Check that processed_data action exists  
        self.assertTrue(hasattr(viewset, 'processed_data'))
        
        # Check action decorators
        process_action = getattr(viewset.process, 'mapping', {})
        self.assertIn('post', process_action)
        
        processed_data_action = getattr(viewset.processed_data, 'mapping', {})
        self.assertIn('get', processed_data_action) 