from django.db import models
from django.conf import settings
import uuid

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

class ImportantDate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='important_dates')
    title = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.date}) for {self.project.name}"
