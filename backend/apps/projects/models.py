from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.indexes import GinIndex
import uuid
import hashlib
from decouple import config
from .sti_sync import sync_sti_to_legacy, ensure_sti_structure

# Feature flag for STI
ENABLE_STI = config('ENABLE_STI', default=False, cast=bool)

class Project(models.Model):
    """
    Hybrid model that supports both old and new data structures.
    This allows for gradual migration without breaking existing code.
    """
    PROJECT_TYPE_CHOICES = [
        ('self_study', 'Self-Study'),
        ('school', 'School'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')

    # OLD FIELDS (for backward compatibility)
    # These fields remain to ensure existing code continues to work
    course_name = models.CharField(max_length=255, blank=True, null=True)
    course_code = models.CharField(max_length=50, blank=True, null=True)
    teacher_name = models.CharField(max_length=255, blank=True, null=True)
    syllabus = models.JSONField(blank=True, null=True)  # Store syllabus data

    # Fields for 'self_study' type project
    goal_description = models.TextField(blank=True, null=True)
    study_frequency = models.CharField(max_length=50, blank=True, null=True) # e.g., 'daily', 'weekly'

    # NEW RELATIONSHIPS (for STI structure)
    # These are always created in the schema, but behavior is gated by ENABLE_STI
    school_project = models.OneToOneField('SchoolProject', null=True, blank=True, on_delete=models.CASCADE, related_name='base_project')
    self_study_project = models.OneToOneField('SelfStudyProject', null=True, blank=True, on_delete=models.CASCADE, related_name='base_project')

    # Common fields
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """
        Automatically sync data between old and new structures.
        This ensures both approaches work simultaneously.
        """
        if ENABLE_STI:
            # If we have new STI data, sync it to old fields
            if self.project_type == 'school' and hasattr(self, 'school_project_data'):
                self.course_name = self.school_project_data.course_name
                self.course_code = self.school_project_data.course_code
                self.teacher_name = self.school_project_data.teacher_name
            elif self.project_type == 'self_study' and hasattr(self, 'self_study_project_data'):
                self.goal_description = self.self_study_project_data.goal_description
                self.study_frequency = self.self_study_project_data.study_frequency
        
        super().save(*args, **kwargs)

    def get_course_name(self):
        """Get course name from either old or new structure."""
        if ENABLE_STI and self.project_type == 'school' and hasattr(self, 'school_project_data'):
            return self.school_project_data.course_name
        return self.course_name

    def get_goal_description(self):
        """Get goal description from either old or new structure."""
        if ENABLE_STI and self.project_type == 'self_study' and hasattr(self, 'self_study_project_data'):
            return self.self_study_project_data.goal_description
        return self.goal_description

    def __str__(self):
        return self.name

    class Meta:
        # Only create STI tables if feature flag is enabled
        managed = True


class SchoolProject(models.Model):
    """
    New STI model for school projects.
    This is the "new way" of storing school-specific data.
    """
    project = models.OneToOneField(Project, on_delete=models.CASCADE, primary_key=True, related_name='school_project_data')
    course_name = models.CharField(max_length=255)
    course_code = models.CharField(max_length=50)
    teacher_name = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        # Ensure the base project is of school type
        if self.project.project_type != 'school':
            self.project.project_type = 'school'
            self.project.save(update_fields=['project_type'])
        super().save(*args, **kwargs)
        # Sync data back to the base project
        sync_sti_to_legacy(self)

    def __str__(self):
        return f"School Project: {self.course_name} ({self.course_code})"


class SelfStudyProject(models.Model):
    """
    New STI model for self-study projects.
    This is the "new way" of storing self-study-specific data.
    """
    project = models.OneToOneField(Project, on_delete=models.CASCADE, primary_key=True, related_name='self_study_project_data')
    goal_description = models.TextField()
    study_frequency = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        # Ensure the base project is of self-study type
        if self.project.project_type != 'self_study':
            self.project.project_type = 'self_study'
            self.project.save(update_fields=['project_type'])
        super().save(*args, **kwargs)
        # Sync data back to the base project
        sync_sti_to_legacy(self)

    def __str__(self):
        return f"Self-Study Project: {self.project.name}"


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
        return f"{self.title} - {self.date}"


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
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('project', 'key')
        indexes = [
            models.Index(fields=['project', 'key']),
            GinIndex(fields=['value'], name='projectmeta_value_gin'),  # GIN index for JSONB queries
        ]

    def __str__(self):
        return f"{self.project.name} - {self.key}"


class ProjectFlashcardSet(models.Model):
    """
    Links projects with flashcard sets to enable project-specific flashcard workflows.
    This allows users to organize flashcards by project while maintaining the existing
    flashcard generation system.
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='flashcard_sets')
    flashcard_set = models.ForeignKey('generation.FlashcardSet', on_delete=models.CASCADE, related_name='project_links')
    created_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=False, help_text="Primary flashcard set for this project")
    
    class Meta:
        unique_together = ('project', 'flashcard_set')
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        return f"{self.project.name} - {self.flashcard_set.title}"


# Factory functions that work with hybrid model
def create_school_project_hybrid(name, owner, course_name, course_code, teacher_name, **kwargs):
    """
    Create a school project using the hybrid approach.
    This creates both old and new structures when STI is enabled.
    """
    # Create base project
    project = Project.objects.create(
        name=name,
        project_type='school',
        owner=owner,
        course_name=course_name,  # Old field
        course_code=course_code,  # Old field
        teacher_name=teacher_name, # Old field
        **kwargs
    )
    
    # Create new STI structure if enabled
    if ENABLE_STI:
        SchoolProject.objects.create(
            project=project,
            course_name=course_name,
            course_code=course_code,
            teacher_name=teacher_name,
        )
    
    return project


def create_self_study_project_hybrid(name, owner, goal_description, study_frequency, **kwargs):
    """
    Create a self-study project using the hybrid approach.
    This creates both old and new structures when STI is enabled.
    """
    # Create base project
    project = Project.objects.create(
        name=name,
        project_type='self_study',
        owner=owner,
        goal_description=goal_description,  # Old field
        study_frequency=study_frequency,    # Old field
        **kwargs
    )
    
    # Create new STI structure if enabled
    if ENABLE_STI:
        SelfStudyProject.objects.create(
            project=project,
            goal_description=goal_description,
            study_frequency=study_frequency,
        )
    
    return project


# Migration utility
def migrate_existing_project_to_sti(project):
    """
    Migrate an existing project to use the new STI structure.
    This is called during the migration process.
    """
    if not ENABLE_STI:
        return project
        
    if project.project_type == 'school':
        # Create STI structure if it doesn't exist
        if not hasattr(project, 'school_project_data'):
            SchoolProject.objects.create(
                project=project,
                course_name=project.course_name or '',
                course_code=project.course_code or '',
                teacher_name=project.teacher_name or '',
            )
    elif project.project_type == 'self_study':
        # Create STI structure if it doesn't exist
        if not hasattr(project, 'self_study_project_data'):
            SelfStudyProject.objects.create(
                project=project,
                goal_description=project.goal_description or '',
                study_frequency=project.study_frequency or '',
            )
    
    return project


@receiver(post_save, sender=Project)
def create_subtype_on_legacy_write(sender, instance, created, **kwargs):
    """
    Automatic subtype creation when legacy fields are written.
    This ensures that when ENABLE_STI=True, any project created or updated
    with legacy fields automatically gets the corresponding STI subtype.
    """
    ensure_sti_structure(instance)
