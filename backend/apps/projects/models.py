from django.db import models
from django.conf import settings
import uuid
import hashlib

class Project(models.Model):
    PROJECT_TYPE_CHOICES = [
        ('self_study', 'Self-Study'),
        ('school', 'School'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')

    # Fields for 'school' type project
    course_name = models.CharField(max_length=255, blank=True, null=True)
    course_code = models.CharField(max_length=50, blank=True, null=True)
    teacher_name = models.CharField(max_length=255, blank=True, null=True)
    syllabus = models.JSONField(blank=True, null=True)  # Store syllabus data

    # Fields for 'self_study' type project
    goal_description = models.TextField(blank=True, null=True)
    study_frequency = models.CharField(max_length=50, blank=True, null=True) # e.g., 'daily', 'weekly'

    # Common fields
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UploadedFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='uploaded_files')
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_hash = models.CharField(max_length=64, blank=True, editable=False)
    raw_text = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if self.file and not self.content_hash:
            hasher = hashlib.sha256()
            for chunk in self.file.chunks():
                hasher.update(chunk)
            self.content_hash = hasher.hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"File for {self.project.name} uploaded at {self.uploaded_at}"

class Extraction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uploaded_file = models.OneToOneField(UploadedFile, on_delete=models.CASCADE, related_name='extraction')
    request_id = models.UUIDField(default=uuid.uuid4, editable=False)

    # LLM Request/Response
    prompt = models.TextField()
    response = models.JSONField()

    # Metrics
    tokens_used = models.IntegerField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)

    # Validation
    is_valid_schema = models.BooleanField(default=False)
    is_valid_syntax = models.BooleanField(default=False)
    retry_attempt = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Extraction for {self.uploaded_file.id}"

class FieldCorrection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    extraction = models.ForeignKey(Extraction, on_delete=models.CASCADE, related_name='corrections')
    field_name = models.CharField(max_length=255)
    original_value = models.TextField()
    corrected_value = models.TextField()
    corrected_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('extraction', 'field_name')

    def __str__(self):
        return f"Correction for {self.field_name} in extraction {self.extraction.id}"

class ImportantDate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='important_dates')
    title = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.date}) for {self.project.name}"
