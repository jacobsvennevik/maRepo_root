from django.db import models
from django.conf import settings
from backend.apps.documents.models import Document
from backend.apps.projects.models import Project

MATERIAL_TYPE_CHOICES = [
    ('note', 'Note'),
    ('test', 'Test'),
    ('mind_map', 'Mind Map'),
]

class StudyMaterial(models.Model):
    """
    Base model for all study materials (notes, tests, mind maps, etc.)
    Acts as a polymorphic parent for specific material types.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='study_materials',
        null=True,
        blank=True
    )
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='study_materials'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_materials'
    )
    title = models.CharField(max_length=255)
    material_type = models.CharField(
        max_length=20,
        choices=MATERIAL_TYPE_CHOICES
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (Type: {self.material_type})"

    def clean(self):
        """Validate that material_type is one of the allowed choices"""
        if self.material_type not in dict(MATERIAL_TYPE_CHOICES):
            raise ValidationError({
                'material_type': 'Invalid material type'
            })

class Note(models.Model):
    """
    Represents a text note study material.
    """
    study_material = models.OneToOneField(
        StudyMaterial,
        on_delete=models.CASCADE,
        related_name='note'
    )
    content = models.TextField()
    
    def __str__(self):
        return f"Note: {self.study_material.title}"

class Test(models.Model):
    """
    Represents a test/quiz study material.
    """
    study_material = models.OneToOneField(
        StudyMaterial,
        on_delete=models.CASCADE,
        related_name='test'
    )
    instructions = models.TextField()
    time_limit = models.IntegerField(
        help_text="Time limit in minutes",
        null=True,
        blank=True
    )
    passing_score = models.IntegerField(
        help_text="Minimum score to pass the test (percentage)",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Test: {self.study_material.title}" 