from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.contrib.postgres.indexes import GinIndex
import uuid
import hashlib
from typing import Optional


class Project(models.Model):
    """
    Abstract base class for all projects.
    Uses Single Table Inheritance pattern with project_type discriminator.
    """
    PROJECT_TYPE_CHOICES = [
        ('self_study', 'Self-Study'),
        ('school', 'School'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='projects'
    )

    # Common fields
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['project_type', 'is_draft']),
            models.Index(fields=['owner', 'is_draft']),
            models.Index(fields=['created_at']),
            # Partition-friendly index for cleanup queries
            models.Index(fields=['owner', 'is_draft', 'created_at']),
        ]

    def __str__(self):
        return self.name

    @property
    def is_school_project(self) -> bool:
        return self.project_type == 'school'

    @property
    def is_self_study_project(self) -> bool:
        return self.project_type == 'self_study'

    def get_specific_project(self):
        """Get the specific project instance (SchoolProject or SelfStudyProject)"""
        if self.is_school_project:
            return self.schoolproject
        elif self.is_self_study_project:
            return self.selfstudyproject
        return self


class SchoolProject(models.Model):
    """
    Specific model for school projects with required fields.
    One-to-one relationship with Project base class.
    """
    project = models.OneToOneField(
        Project, 
        on_delete=models.CASCADE, 
        related_name='schoolproject',
        primary_key=True
    )
    
    # Required fields for school projects
    course_name = models.CharField(max_length=255)
    course_code = models.CharField(max_length=50)
    teacher_name = models.CharField(max_length=255)
    
    class Meta:
        indexes = [
            models.Index(fields=['course_code']),
            models.Index(fields=['teacher_name']),
        ]

    def __str__(self):
        return f"School Project: {self.course_name} ({self.course_code})"

    def save(self, *args, **kwargs):
        # Ensure the base project is of school type
        if self.project.project_type != 'school':
            self.project.project_type = 'school'
            self.project.save(update_fields=['project_type'])
        super().save(*args, **kwargs)


class SelfStudyProject(models.Model):
    """
    Specific model for self-study projects with required fields.
    One-to-one relationship with Project base class.
    """
    project = models.OneToOneField(
        Project, 
        on_delete=models.CASCADE, 
        related_name='selfstudyproject',
        primary_key=True
    )
    
    # Required fields for self-study projects
    goal_description = models.TextField()
    study_frequency = models.CharField(max_length=50)  # e.g., 'daily', 'weekly'

    def __str__(self):
        return f"Self-Study Project: {self.project.name}"

    def save(self, *args, **kwargs):
        # Ensure the base project is of self-study type
        if self.project.project_type != 'self_study':
            self.project.project_type = 'self_study'
            self.project.save(update_fields=['project_type'])
        super().save(*args, **kwargs)


class ProjectMeta(models.Model):
    """
    Flexible metadata storage for projects using JSONB.
    Allows for schema-less data without polluting the main table.
    """
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='metadata'
    )
    key = models.CharField(max_length=255)
    value = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('project', 'key')
        indexes = [
            GinIndex(fields=['value']),  # GIN index for JSONB queries
            models.Index(fields=['project', 'key']),
        ]

    def __str__(self):
        return f"{self.project.name} - {self.key}"


class UploadedFile(models.Model):
    """
    File upload model with improved relationship handling.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, 
        on_delete=models.PROTECT,  # Prevent accidental deletion
        related_name='uploaded_files'
    )
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_hash = models.CharField(max_length=64, blank=True, editable=False)
    raw_text = models.TextField(blank=True)
    
    # Soft delete support
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['project', 'is_deleted']),
            models.Index(fields=['content_hash']),
        ]

    def save(self, *args, **kwargs):
        if self.file and not self.content_hash:
            hasher = hashlib.sha256()
            for chunk in self.file.chunks():
                hasher.update(chunk)
            self.content_hash = hasher.hexdigest()
        super().save(*args, **kwargs)

    def soft_delete(self):
        """Soft delete the file instead of hard deletion"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def __str__(self):
        return f"File for {self.project.name} uploaded at {self.uploaded_at}"


class Extraction(models.Model):
    """
    LLM extraction results with improved validation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uploaded_file = models.OneToOneField(
        UploadedFile, 
        on_delete=models.CASCADE, 
        related_name='extraction'
    )
    request_id = models.UUIDField(default=uuid.uuid4, editable=False)

    # LLM Request/Response
    prompt = models.TextField()
    response = JSONField()

    # Metrics
    tokens_used = models.IntegerField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)

    # Validation
    is_valid_schema = models.BooleanField(default=False)
    is_valid_syntax = models.BooleanField(default=False)
    retry_attempt = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['request_id']),
            models.Index(fields=['is_valid_schema', 'is_valid_syntax']),
        ]

    def __str__(self):
        return f"Extraction for {self.uploaded_file.id}"


class FieldCorrection(models.Model):
    """
    Manual corrections to extracted data.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    extraction = models.ForeignKey(
        Extraction, 
        on_delete=models.CASCADE, 
        related_name='corrections'
    )
    field_name = models.CharField(max_length=255)
    original_value = models.TextField()
    corrected_value = models.TextField()
    corrected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('extraction', 'field_name')
        indexes = [
            models.Index(fields=['field_name']),
            models.Index(fields=['corrected_by']),
        ]

    def __str__(self):
        return f"Correction for {self.field_name} in extraction {self.extraction.id}"


class ImportantDate(models.Model):
    """
    Important dates for projects with improved relationship.
    """
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='important_dates'
    )
    title = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    
    # Additional metadata
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=100, blank=True)  # e.g., 'weekly', 'monthly'
    priority = models.CharField(
        max_length=20, 
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        default='medium'
    )

    class Meta:
        indexes = [
            models.Index(fields=['project', 'date']),
            models.Index(fields=['date', 'priority']),
        ]
        ordering = ['date', 'priority']

    def __str__(self):
        return f"{self.title} ({self.date}) for {self.project.name}"


# Manager classes for better querying
class ProjectManager(models.Manager):
    """Custom manager for Project model with type-specific methods."""
    
    def school_projects(self):
        """Get only school projects."""
        return self.filter(project_type='school')
    
    def self_study_projects(self):
        """Get only self-study projects."""
        return self.filter(project_type='self_study')
    
    def drafts(self):
        """Get only draft projects."""
        return self.filter(is_draft=True)
    
    def completed(self):
        """Get only completed (non-draft) projects."""
        return self.filter(is_draft=False)
    
    def abandoned_drafts(self, hours: int = 24):
        """Get abandoned draft projects older than specified hours."""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_time = timezone.now() - timedelta(hours=hours)
        return self.filter(
            is_draft=True,
            created_at__lt=cutoff_time
        )


# Attach the custom manager to the Project model
Project.objects = ProjectManager()


# Factory functions for creating typed projects
def create_school_project(
    name: str,
    owner,
    course_name: str,
    course_code: str,
    teacher_name: str,
    **kwargs
) -> Project:
    """Create a school project with proper type-specific data."""
    project = Project.objects.create(
        name=name,
        project_type='school',
        owner=owner,
        **kwargs
    )
    
    SchoolProject.objects.create(
        project=project,
        course_name=course_name,
        course_code=course_code,
        teacher_name=teacher_name,
    )
    
    return project


def create_self_study_project(
    name: str,
    owner,
    goal_description: str,
    study_frequency: str,
    **kwargs
) -> Project:
    """Create a self-study project with proper type-specific data."""
    project = Project.objects.create(
        name=name,
        project_type='self_study',
        owner=owner,
        **kwargs
    )
    
    SelfStudyProject.objects.create(
        project=project,
        goal_description=goal_description,
        study_frequency=study_frequency,
    )
    
    return project 