import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from backend.apps.projects.models_improved import (
    Project, SchoolProject, SelfStudyProject, ProjectMeta, 
    ImportantDate, UploadedFile, Extraction, FieldCorrection
)
from backend.apps.accounts.tests.factories import CustomUserFactory

User = get_user_model()


class ProjectFactory(DjangoModelFactory):
    """Factory for creating base Project instances."""
    
    class Meta:
        model = Project

    name = factory.Faker('sentence', nb_words=4)
    owner = factory.SubFactory(CustomUserFactory)
    project_type = 'school'  # Default project type
    start_date = factory.Faker('future_date')
    end_date = factory.Faker('future_date')
    is_draft = True


class SchoolProjectFactory(DjangoModelFactory):
    """Factory for creating school projects with complete data."""
    
    class Meta:
        model = SchoolProject

    project = factory.SubFactory(
        ProjectFactory,
        project_type='school'
    )
    course_name = factory.Faker('catch_phrase')
    course_code = factory.Faker('bothify', text='???-###')
    teacher_name = factory.Faker('name')


class SelfStudyProjectFactory(DjangoModelFactory):
    """Factory for creating self-study projects with complete data."""
    
    class Meta:
        model = SelfStudyProject

    project = factory.SubFactory(
        ProjectFactory,
        project_type='self_study'
    )
    goal_description = factory.Faker('text', max_nb_chars=500)
    study_frequency = factory.Iterator(['daily', 'weekly', 'bi-weekly', 'monthly'])


class ProjectMetaFactory(DjangoModelFactory):
    """Factory for creating project metadata."""
    
    class Meta:
        model = ProjectMeta

    project = factory.SubFactory(ProjectFactory)
    key = factory.Faker('word')
    value = factory.Faker('pydict', nb_elements=3)


class ImportantDateFactory(DjangoModelFactory):
    """Factory for creating important dates."""
    
    class Meta:
        model = ImportantDate

    project = factory.SubFactory(ProjectFactory)
    title = factory.Faker('sentence', nb_words=3)
    date = factory.Faker('future_date')
    description = factory.Faker('text', max_nb_chars=200)
    is_recurring = False
    recurrence_pattern = ''
    priority = factory.Iterator(['low', 'medium', 'high', 'critical'])


class UploadedFileFactory(DjangoModelFactory):
    """Factory for creating uploaded files."""
    
    class Meta:
        model = UploadedFile

    project = factory.SubFactory(ProjectFactory)
    file = factory.django.FileField(filename='test_file.pdf')
    raw_text = factory.Faker('text', max_nb_chars=1000)
    is_deleted = False


class ExtractionFactory(DjangoModelFactory):
    """Factory for creating extraction results."""
    
    class Meta:
        model = Extraction

    uploaded_file = factory.SubFactory(UploadedFileFactory)
    prompt = factory.Faker('text', max_nb_chars=500)
    response = factory.Faker('pydict', nb_elements=5)
    tokens_used = factory.Faker('random_int', min=100, max=1000)
    latency_ms = factory.Faker('random_int', min=100, max=5000)
    confidence_score = factory.Faker('pyfloat', left_digits=1, right_digits=2, min_value=0, max_value=1)
    is_valid_schema = True
    is_valid_syntax = True
    retry_attempt = 0


class FieldCorrectionFactory(DjangoModelFactory):
    """Factory for creating field corrections."""
    
    class Meta:
        model = FieldCorrection

    extraction = factory.SubFactory(ExtractionFactory)
    field_name = factory.Faker('word')
    original_value = factory.Faker('sentence')
    corrected_value = factory.Faker('sentence')
    corrected_by = factory.SubFactory(CustomUserFactory)


# Composite factories for common use cases
class CompleteSchoolProjectFactory:
    """Factory for creating complete school projects with all related data."""
    
    @staticmethod
    def create(**kwargs):
        """Create a complete school project with metadata and important dates."""
        # Create base project
        project = SchoolProjectFactory(**kwargs)
        
        # Add metadata
        ProjectMetaFactory.create_batch(3, project=project.project)
        
        # Add important dates
        ImportantDateFactory.create_batch(2, project=project.project)
        
        return project.project
    
    @staticmethod
    def create_with_files(**kwargs):
        """Create a school project with uploaded files and extractions."""
        project = CompleteSchoolProjectFactory.create(**kwargs)
        
        # Add uploaded files with extractions
        for _ in range(2):
            uploaded_file = UploadedFileFactory(project=project)
            ExtractionFactory(uploaded_file=uploaded_file)
        
        return project


class CompleteSelfStudyProjectFactory:
    """Factory for creating complete self-study projects with all related data."""
    
    @staticmethod
    def create(**kwargs):
        """Create a complete self-study project with metadata and important dates."""
        # Create base project
        project = SelfStudyProjectFactory(**kwargs)
        
        # Add metadata
        ProjectMetaFactory.create_batch(2, project=project.project)
        
        # Add important dates
        ImportantDateFactory.create_batch(1, project=project.project)
        
        return project.project
    
    @staticmethod
    def create_with_files(**kwargs):
        """Create a self-study project with uploaded files and extractions."""
        project = CompleteSelfStudyProjectFactory.create(**kwargs)
        
        # Add uploaded files with extractions
        for _ in range(1):
            uploaded_file = UploadedFileFactory(project=project)
            ExtractionFactory(uploaded_file=uploaded_file)
        
        return project


# Utility functions for testing
def create_draft_project(user=None, project_type='school', **kwargs):
    """Create a draft project for testing."""
    if user is None:
        user = CustomUserFactory()
    
    if project_type == 'school':
        return SchoolProjectFactory(
            project__owner=user,
            project__is_draft=True,
            **kwargs
        ).project
    else:
        return SelfStudyProjectFactory(
            project__owner=user,
            project__is_draft=True,
            **kwargs
        ).project


def create_completed_project(user=None, project_type='school', **kwargs):
    """Create a completed (non-draft) project for testing."""
    if user is None:
        user = CustomUserFactory()
    
    if project_type == 'school':
        return SchoolProjectFactory(
            project__owner=user,
            project__is_draft=False,
            **kwargs
        ).project
    else:
        return SelfStudyProjectFactory(
            project__owner=user,
            project__is_draft=False,
            **kwargs
        ).project


def create_project_with_metadata(user=None, metadata_keys=None, **kwargs):
    """Create a project with specific metadata."""
    if user is None:
        user = CustomUserFactory()
    
    project = ProjectFactory(owner=user, **kwargs)
    
    if metadata_keys:
        for key in metadata_keys:
            ProjectMetaFactory(project=project, key=key)
    
    return project


# Performance testing utilities
def create_bulk_projects(user, count=100, project_type='school'):
    """Create multiple projects for performance testing."""
    projects = []
    
    if project_type == 'school':
        for _ in range(count):
            project = SchoolProjectFactory(project__owner=user)
            projects.append(project.project)
    else:
        for _ in range(count):
            project = SelfStudyProjectFactory(project__owner=user)
            projects.append(project.project)
    
    return projects


def create_project_with_files(user, file_count=5):
    """Create a project with multiple uploaded files."""
    project = ProjectFactory(owner=user)
    
    files = []
    for _ in range(file_count):
        uploaded_file = UploadedFileFactory(project=project)
        extraction = ExtractionFactory(uploaded_file=uploaded_file)
        files.append((uploaded_file, extraction))
    
    return project, files


# Data validation utilities
def validate_project_data(project):
    """Validate that a project has all required data."""
    assert project.name, "Project must have a name"
    assert project.owner, "Project must have an owner"
    assert project.project_type in ['school', 'self_study'], "Invalid project type"
    
    if project.project_type == 'school':
        assert hasattr(project, 'schoolproject'), "School project must have school data"
        school_data = project.schoolproject
        assert school_data.course_name, "School project must have course name"
        assert school_data.course_code, "School project must have course code"
        assert school_data.teacher_name, "School project must have teacher name"
    
    elif project.project_type == 'self_study':
        assert hasattr(project, 'selfstudyproject'), "Self-study project must have self-study data"
        self_study_data = project.selfstudyproject
        assert self_study_data.goal_description, "Self-study project must have goal description"
        assert self_study_data.study_frequency, "Self-study project must have study frequency"
    
    return True


def create_test_data_for_user(user, project_count=10):
    """Create comprehensive test data for a user."""
    projects = []
    
    # Create school projects
    for i in range(project_count // 2):
        project = CompleteSchoolProjectFactory.create(
            project__owner=user,
            project__name=f"School Project {i+1}"
        )
        projects.append(project)
    
    # Create self-study projects
    for i in range(project_count // 2):
        project = CompleteSelfStudyProjectFactory.create(
            project__owner=user,
            project__name=f"Self-Study Project {i+1}"
        )
        projects.append(project)
    
    return projects 