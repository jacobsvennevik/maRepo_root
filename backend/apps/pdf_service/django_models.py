from django.db import models
from django.conf import settings
from .constants import DocumentType

# Choices for file types
FILE_TYPE_CHOICES = [
    ('pdf', 'PDF'),
    ('ppt', 'PowerPoint'),
    ('audio', 'Audio'),
]

# Choices for document processing status
STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('completed', 'Completed'),
    ('error', 'Error'),
]

UPLOAD_TYPE_CHOICES = [
    ('course_files', 'Course Files'),
    ('test_files', 'Test Files'),
    ('learning_materials', 'Learning Materials'),
]

class Document(models.Model):
    """
    Represents an uploaded document belonging to a user.
    Supports different file types and stores extracted text.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='uploads/%Y/%m/%d/', max_length=255)
    upload_type = models.CharField(max_length=50, choices=UPLOAD_TYPE_CHOICES, default='learning_materials')

    document_type = models.CharField(
        max_length=20,
        choices=[(tag.value, tag.name.title()) for tag in DocumentType],
        default=DocumentType.UNKNOWN,
        blank=True,
        null=True,
    )
    file_type = models.CharField(max_length=50, choices=FILE_TYPE_CHOICES)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    original_text = models.TextField(blank=True, null=True)  # Extracted text or transcript.
    metadata = models.JSONField(blank=True, null=True)  # Additional metadata (e.g., file size, page count)

    title = models.CharField(max_length=255, default="Untitled Document")  # ✅ Default value added

    def __str__(self):
        return f"Document {self.id} - {self.title} uploaded by {self.user.username}"


class ProcessedData(models.Model):
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='processed_data')
    data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Processed data for Document {self.document.id}"
