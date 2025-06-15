import os
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model

from ..django_models import Document
from ..ingestion import ingest_pdf

User = get_user_model()

class IngestPdfTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        
        # Create a dummy file path. The file doesn't need to exist for the success test because we're mocking.
        self.dummy_file_path = '/tmp/test.pdf'

    @patch('backend.apps.pdf_service.ingestion.pdfplumber.open')
    def test_ingest_pdf_success(self, mock_pdfplumber_open):
        # Mock the context manager and the pdf object it returns
        mock_pdf = MagicMock()
        mock_pdf.pages = [MagicMock(extract_text=lambda: "Page 1 text."), MagicMock(extract_text=lambda: "Page 2 text.")]
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_pdf
        mock_pdfplumber_open.return_value = mock_context_manager

        # Call the function to be tested
        text_chunks, metadata = ingest_pdf(self.dummy_file_path)

        # Assertions
        self.assertEqual(len(text_chunks), 1) # The default splitter will likely create one chunk
        self.assertIn("Page 1 text.\nPage 2 text.", text_chunks[0])
        self.assertEqual(metadata['source'], self.dummy_file_path)
        self.assertEqual(metadata['pages'], 2)
        mock_pdfplumber_open.assert_called_once_with(self.dummy_file_path)

    @patch('backend.apps.pdf_service.ingestion.PyPDFLoader', side_effect=Exception("mocked PyPDFLoader failure"))
    @patch('backend.apps.pdf_service.ingestion.pdfplumber.open', side_effect=Exception("mocked pdfplumber failure"))
    def test_ingest_pdf_all_methods_fail(self, mock_pdfplumber_open, mock_pypdf_loader):
        # Test the case where both pdfplumber and PyPDFLoader fail
        with self.assertRaises(FileNotFoundError):
            ingest_pdf('non_existent_file.pdf')