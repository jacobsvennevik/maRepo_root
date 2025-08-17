from django.db import models
from django.conf import settings
import uuid

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
    goal_description = models.TextField(blank=True, null=True)
    study_frequency = models.CharField(max_length=50, blank=True, null=True)
    syllabus = models.JSONField(blank=True, null=True)

    # NEW RELATIONSHIPS (for STI structure)
    # These are added to support the new architecture
    school_project = models.OneToOneField('SchoolProject', null=True, blank=True, on_delete=models.CASCADE)
    self_study_project = models.OneToOneField('SelfStudyProject', null=True, blank=True, on_delete=models.CASCADE)

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
        # If we have new STI data, sync it to old fields
        if self.project_type == 'school' and self.school_project:
            self.course_name = self.school_project.course_name
            self.course_code = self.school_project.course_code
            self.teacher_name = self.school_project.teacher_name
        elif self.project_type == 'self_study' and self.self_study_project:
            self.goal_description = self.self_study_project.goal_description
            self.study_frequency = self.self_study_project.study_frequency
        
        super().save(*args, **kwargs)

    def get_course_name(self):
        """Get course name from either old or new structure."""
        if self.project_type == 'school' and self.school_project:
            return self.school_project.course_name
        return self.course_name

    def get_goal_description(self):
        """Get goal description from either old or new structure."""
        if self.project_type == 'self_study' and self.self_study_project:
            return self.self_study_project.goal_description
        return self.goal_description

    def __str__(self):
        return self.name


class SchoolProject(models.Model):
    """
    New STI model for school projects.
    This is the "new way" of storing school-specific data.
    """
    project = models.OneToOneField(Project, on_delete=models.CASCADE, primary_key=True)
    course_name = models.CharField(max_length=255)
    course_code = models.CharField(max_length=50)
    teacher_name = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        # Ensure the base project is of school type
        if self.project.project_type != 'school':
            self.project.project_type = 'school'
            self.project.save(update_fields=['project_type'])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"School Project: {self.course_name} ({self.course_code})"


class SelfStudyProject(models.Model):
    """
    New STI model for self-study projects.
    This is the "new way" of storing self-study-specific data.
    """
    project = models.OneToOneField(Project, on_delete=models.CASCADE, primary_key=True)
    goal_description = models.TextField()
    study_frequency = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        # Ensure the base project is of self-study type
        if self.project.project_type != 'self_study':
            self.project.project_type = 'self_study'
            self.project.save(update_fields=['project_type'])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Self-Study Project: {self.project.name}"


# Factory functions that work with hybrid model
def create_school_project_hybrid(name, owner, course_name, course_code, teacher_name, **kwargs):
    """
    Create a school project using the hybrid approach.
    This creates both old and new structures.
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
    
    # Create new STI structure
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
    This creates both old and new structures.
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
    
    # Create new STI structure
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
    if project.project_type == 'school':
        # Create STI structure if it doesn't exist
        if not hasattr(project, 'school_project'):
            SchoolProject.objects.create(
                project=project,
                course_name=project.course_name or '',
                course_code=project.course_code or '',
                teacher_name=project.teacher_name or '',
            )
    elif project.project_type == 'self_study':
        # Create STI structure if it doesn't exist
        if not hasattr(project, 'self_study_project'):
            SelfStudyProject.objects.create(
                project=project,
                goal_description=project.goal_description or '',
                study_frequency=project.study_frequency or '',
            )
    
    return project 