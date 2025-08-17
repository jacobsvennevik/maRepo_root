# Project Models Migration Strategy

## Overview

This document outlines the strategy for migrating from the current single-table Project model to the improved architecture with Single Table Inheritance (STI) and better data modeling.

## Current Issues

1. **NULL Pollution**: Many optional fields in the main Project table
2. **Schema Rigidity**: Adding new project types requires schema changes
3. **Query Performance**: Inefficient queries due to lack of proper indexing
4. **Data Integrity**: No enforcement of required fields at the database level
5. **Scalability**: Single table approach doesn't scale well for large datasets

## Target Architecture

### 1. Single Table Inheritance (STI)
- **Base Model**: `Project` with common fields and `project_type` discriminator
- **Specific Models**: `SchoolProject` and `SelfStudyProject` with required fields
- **Benefits**: 
  - Enforces invariants at DB layer
  - Allows independent schema evolution
  - Better query performance with narrower indexes

### 2. Flexible Metadata Storage
- **ProjectMeta Model**: JSONB-based metadata storage
- **Benefits**:
  - Schema-less data without polluting main table
  - GIN indexes for efficient JSON queries
  - Easy to add new metadata without migrations

### 3. Improved Relationships
- **on_delete=PROTECT**: Prevents accidental deletions
- **Soft Delete**: File deletion without data loss
- **Better Indexing**: Optimized for common query patterns

## Migration Plan

### Phase 1: Preparation (Backward Compatible)

#### 1.1 Create New Models
```python
# Create models_improved.py with new structure
# Keep existing models.py unchanged
```

#### 1.2 Data Validation
```python
# Create validation script to check data integrity
def validate_existing_data():
    """Validate that existing data can be migrated safely."""
    projects = Project.objects.all()
    
    for project in projects:
        if project.project_type == 'school':
            # Check required school fields
            if not project.course_name:
                print(f"Warning: School project {project.id} missing course_name")
        elif project.project_type == 'self_study':
            # Check required self-study fields
            if not project.goal_description:
                print(f"Warning: Self-study project {project.id} missing goal_description")
```

#### 1.3 Create Migration Scripts
```python
# migration_scripts.py
from django.db import transaction
from .models import Project as OldProject
from .models_improved import Project, SchoolProject, SelfStudyProject, ProjectMeta

def migrate_project_data():
    """Migrate existing project data to new structure."""
    with transaction.atomic():
        old_projects = OldProject.objects.all()
        
        for old_project in old_projects:
            # Create new project with common fields
            new_project = Project.objects.create(
                id=old_project.id,  # Preserve ID
                name=old_project.name,
                project_type=old_project.project_type,
                owner=old_project.owner,
                start_date=old_project.start_date,
                end_date=old_project.end_date,
                is_draft=old_project.is_draft,
                created_at=old_project.created_at,
                updated_at=old_project.updated_at,
            )
            
            # Create type-specific data
            if old_project.project_type == 'school':
                SchoolProject.objects.create(
                    project=new_project,
                    course_name=old_project.course_name or '',
                    course_code=old_project.course_code or '',
                    teacher_name=old_project.teacher_name or '',
                )
                
                # Migrate syllabus data to metadata
                if old_project.syllabus:
                    ProjectMeta.objects.create(
                        project=new_project,
                        key='syllabus',
                        value=old_project.syllabus
                    )
                    
            elif old_project.project_type == 'self_study':
                SelfStudyProject.objects.create(
                    project=new_project,
                    goal_description=old_project.goal_description or '',
                    study_frequency=old_project.study_frequency or '',
                )
            
            # Migrate important dates
            for old_date in old_project.important_dates.all():
                ImportantDate.objects.create(
                    project=new_project,
                    title=old_date.title,
                    date=old_date.date,
                    description=old_date.description,
                )
```

### Phase 2: Gradual Rollout

#### 2.1 Feature Flags
```python
# settings.py
USE_IMPROVED_MODELS = os.getenv('USE_IMPROVED_MODELS', 'false').lower() == 'true'

# views.py
if settings.USE_IMPROVED_MODELS:
    from .models_improved import Project
    from .serializers_improved import ProjectSerializer
else:
    from .models import Project
    from .serializers import ProjectSerializer
```

#### 2.2 Dual Write Strategy
```python
class ProjectViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        # Write to both old and new models during transition
        project = serializer.save(owner=self.request.user)
        
        if settings.USE_IMPROVED_MODELS:
            # Also write to old model for backward compatibility
            self._write_to_old_model(project)
        
        return project
    
    def _write_to_old_model(self, new_project):
        """Write to old model for backward compatibility."""
        from .models import Project as OldProject
        
        old_data = {
            'id': new_project.id,
            'name': new_project.name,
            'project_type': new_project.project_type,
            'owner': new_project.owner,
            'start_date': new_project.start_date,
            'end_date': new_project.end_date,
            'is_draft': new_project.is_draft,
            'created_at': new_project.created_at,
            'updated_at': new_project.updated_at,
        }
        
        if new_project.project_type == 'school':
            old_data.update({
                'course_name': new_project.schoolproject.course_name,
                'course_code': new_project.schoolproject.course_code,
                'teacher_name': new_project.schoolproject.teacher_name,
            })
        elif new_project.project_type == 'self_study':
            old_data.update({
                'goal_description': new_project.selfstudyproject.goal_description,
                'study_frequency': new_project.selfstudyproject.study_frequency,
            })
        
        OldProject.objects.update_or_create(
            id=new_project.id,
            defaults=old_data
        )
```

### Phase 3: Database Migration

#### 3.1 Create Migration Files
```bash
# Create migration for new models
python manage.py makemigrations projects --name create_improved_models

# Create data migration
python manage.py makemigrations projects --empty --name migrate_project_data
```

#### 3.2 Migration Operations
```python
# migrations/XXXX_migrate_project_data.py
from django.db import migrations

def migrate_data_forward(apps, schema_editor):
    """Migrate data from old structure to new structure."""
    from .migration_scripts import migrate_project_data
    migrate_project_data()

def migrate_data_backward(apps, schema_editor):
    """Migrate data back to old structure if needed."""
    # Implementation for rollback
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('projects', 'XXXX_create_improved_models'),
    ]
    
    operations = [
        migrations.RunPython(migrate_data_forward, migrate_data_backward),
    ]
```

### Phase 4: Cleanup

#### 4.1 Remove Old Models
```python
# After successful migration and validation
class Migration(migrations.Migration):
    dependencies = [
        ('projects', 'XXXX_migrate_project_data'),
    ]
    
    operations = [
        migrations.DeleteModel(name='Project'),  # Old model
        migrations.RenameModel('ProjectImproved', 'Project'),  # Rename new model
    ]
```

#### 4.2 Update References
```python
# Update all imports throughout the codebase
# Update serializers, views, tests, etc.
```

## Rollback Strategy

### 1. Feature Flag Rollback
```python
# Simply disable the feature flag
USE_IMPROVED_MODELS = False
```

### 2. Data Rollback
```python
def rollback_migration():
    """Rollback data to old structure if needed."""
    # Implementation to restore old data structure
    pass
```

### 3. Database Rollback
```python
# Use Django's migration rollback
python manage.py migrate projects 0004  # Rollback to specific migration
```

## Testing Strategy

### 1. Unit Tests
```python
# Test new models and serializers
class ImprovedProjectModelTest(TestCase):
    def test_school_project_creation(self):
        project = create_school_project(
            name="Test Course",
            owner=self.user,
            course_name="Mathematics 101",
            course_code="MATH101",
            teacher_name="Dr. Smith"
        )
        self.assertTrue(project.is_school_project)
        self.assertEqual(project.schoolproject.course_name, "Mathematics 101")
```

### 2. Integration Tests
```python
# Test API endpoints with new models
class ImprovedProjectAPITest(APITestCase):
    def test_create_school_project_api(self):
        data = {
            'name': 'Test Course',
            'project_type': 'school',
            'school_data': {
                'course_name': 'Mathematics 101',
                'course_code': 'MATH101',
                'teacher_name': 'Dr. Smith'
            }
        }
        response = self.client.post('/api/projects/', data)
        self.assertEqual(response.status_code, 201)
```

### 3. Performance Tests
```python
# Test query performance improvements
def test_query_performance():
    """Test that new queries are faster than old ones."""
    import time
    
    # Old query
    start = time.time()
    old_projects = OldProject.objects.filter(project_type='school')
    old_time = time.time() - start
    
    # New query
    start = time.time()
    new_projects = Project.objects.school_projects()
    new_time = time.time() - start
    
    assert new_time < old_time, "New queries should be faster"
```

## Monitoring and Validation

### 1. Data Integrity Checks
```python
def validate_migration():
    """Validate that migration was successful."""
    old_count = OldProject.objects.count()
    new_count = Project.objects.count()
    
    assert old_count == new_count, "All projects should be migrated"
    
    # Check type-specific data
    school_count_old = OldProject.objects.filter(project_type='school').count()
    school_count_new = SchoolProject.objects.count()
    assert school_count_old == school_count_new
```

### 2. Performance Monitoring
```python
# Monitor query performance
# Monitor API response times
# Monitor database size and growth
```

### 3. Error Tracking
```python
# Track any errors during migration
# Monitor for data inconsistencies
# Alert on rollback triggers
```

## Timeline

1. **Week 1-2**: Preparation and validation
2. **Week 3**: Feature flag implementation
3. **Week 4**: Gradual rollout with monitoring
4. **Week 5**: Full migration
5. **Week 6**: Cleanup and optimization

## Success Criteria

1. **Data Integrity**: 100% of existing data migrated successfully
2. **Performance**: Query performance improved by at least 20%
3. **Zero Downtime**: Migration completed without service interruption
4. **Backward Compatibility**: Existing API endpoints continue to work
5. **Error Rate**: No increase in error rates during migration

## Risk Mitigation

1. **Backup Strategy**: Full database backup before migration
2. **Feature Flags**: Ability to rollback quickly
3. **Monitoring**: Comprehensive monitoring during migration
4. **Testing**: Extensive testing in staging environment
5. **Documentation**: Clear rollback procedures 