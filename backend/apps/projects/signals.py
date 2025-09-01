"""
Signal handlers for project-related events.
"""
import os
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UploadedFile


@receiver(post_save, sender=UploadedFile)
def schedule_text_extraction(sender, instance: UploadedFile, created, **kwargs):
    """
    Schedule text extraction for newly uploaded files.
    
    This signal triggers an async Celery task to extract text from uploaded files
    without blocking the upload response.
    """
    if created and instance.file:
        # Set content_type if not already set
        if not instance.content_type and instance.file.name:
            # Simple content type detection based on file extension
            ext = os.path.splitext(instance.file.name)[1].lower()
            content_type_map = {
                '.pdf': 'application/pdf',
                '.txt': 'text/plain',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.doc': 'application/msword',
            }
            instance.content_type = content_type_map.get(ext, 'application/octet-stream')
            instance.save(update_fields=['content_type'])
        
        # Schedule extraction after transaction commits to avoid race conditions
        def schedule_extraction():
            try:
                from .tasks import extract_text_from_file
                extract_text_from_file.delay(str(instance.id))
                print(f"🔍 DEBUG: Scheduled text extraction for file {instance.id}")
            except ImportError:
                # Fallback for development when Celery is not running
                print(f"⚠️  WARNING: Celery not available, skipping text extraction for file {instance.id}")
            except Exception as e:
                print(f"❌ ERROR: Failed to schedule text extraction: {e}")
        
        transaction.on_commit(schedule_extraction)
