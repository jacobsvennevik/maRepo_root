from django.db import models
from django.conf import settings


# Define choices for file types and statuses.
FILE_TYPE_CHOICES = (
    ('pdf', 'PDF'),
    ('ppt', 'PowerPoint'),
    ('audio', 'Audio'),
)

STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('completed', 'Completed'),
    ('error', 'Error'),
)

class Document(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    file_type = models.CharField(max_length=50, choices=FILE_TYPE_CHOICES)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    original_text = models.TextField(blank=True, null=True)  # Extracted text or transcript.
    metadata = models.JSONField(blank=True, null=True)       # Additional metadata (e.g., file size, page count)

    def __str__(self):
        return f"Document {self.id} uploaded by {self.user.username}"
