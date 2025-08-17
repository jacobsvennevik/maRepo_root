"""
STI synchronization utilities for bidirectional field sync between legacy and STI structures.
"""

from decouple import config

# Feature flag for STI
ENABLE_STI = config('ENABLE_STI', default=False, cast=bool)


def sync_sti_to_legacy(instance):
    """
    Sync data from STI structure to legacy fields.
    
    Args:
        instance: A SchoolProject or SelfStudyProject instance
    """
    if not ENABLE_STI:
        return
    
    project = instance.project
    
    if hasattr(instance, 'course_name'):  # SchoolProject
        project.course_name = instance.course_name
        project.course_code = instance.course_code
        project.teacher_name = instance.teacher_name
        project.save(update_fields=['course_name', 'course_code', 'teacher_name'])
    elif hasattr(instance, 'goal_description'):  # SelfStudyProject
        project.goal_description = instance.goal_description
        project.study_frequency = instance.study_frequency
        project.save(update_fields=['goal_description', 'study_frequency'])


def sync_legacy_to_sti(instance):
    """
    Sync data from legacy fields to STI structure.
    
    Args:
        instance: A Project instance
    """
    if not ENABLE_STI:
        return
    
    if instance.project_type == 'school' and hasattr(instance, 'school_project_data'):
        sti_data = instance.school_project_data
        sti_data.course_name = instance.course_name or ''
        sti_data.course_code = instance.course_code or ''
        sti_data.teacher_name = instance.teacher_name or ''
        sti_data.save()
    elif instance.project_type == 'self_study' and hasattr(instance, 'self_study_project_data'):
        sti_data = instance.self_study_project_data
        sti_data.goal_description = instance.goal_description or ''
        sti_data.study_frequency = instance.study_frequency or ''
        sti_data.save()


def ensure_sti_structure(project):
    """
    Ensure that a project has the appropriate STI structure.
    Creates STI objects if they don't exist and have meaningful data.
    
    Args:
        project: A Project instance
    """
    if not ENABLE_STI:
        return
    
    if project.project_type == 'school' and not hasattr(project, 'school_project_data'):
        # Only create if we have meaningful school data
        if project.course_name or project.course_code or project.teacher_name:
            from .models import SchoolProject
            SchoolProject.objects.get_or_create(
                project=project,
                defaults={
                    'course_name': project.course_name or '',
                    'course_code': project.course_code or '',
                    'teacher_name': project.teacher_name or ''
                }
            )
    elif project.project_type == 'self_study' and not hasattr(project, 'self_study_project_data'):
        # Only create if we have meaningful self-study data
        if project.goal_description or project.study_frequency:
            from .models import SelfStudyProject
            SelfStudyProject.objects.get_or_create(
                project=project,
                defaults={
                    'goal_description': project.goal_description or '',
                    'study_frequency': project.study_frequency or ''
                }
            ) 