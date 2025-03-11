# backend/apps/mindmap/models.py

from django.db import models
from django.conf import settings

class MindMap(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mindmaps"
    )
    title = models.CharField(max_length=255)
    # Store the mind map content (for example, XML, markdown, or JSON)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
