# Breaking Changes Analysis: STI Migration

## Current Status

✅ **Existing Django tests pass** - All 14 tests in `backend/apps/projects/tests/` are passing
✅ **No migration conflicts** - Django reports no pending migrations for the projects app
❌ **Model conflicts** - Cannot import both old and new models simultaneously due to naming conflicts

## Breaking Changes Identified

### 1. **Model Naming Conflicts**
**Issue**: Both `models.py` and `models_improved.py` define a `Project` class
**Error**: `RuntimeError: Conflicting 'project' models in application 'projects'`

**Solution**: Use feature flags and gradual migration approach

### 2. **Serializer Incompatibility**
**Issue**: Old serializers expect direct fields (`course_name`, `goal_description`) on Project model
**New Structure**: These fields are now in separate models (`SchoolProject`, `SelfStudyProject`)

### 3. **Frontend Data Mapping**
**Current Mapping**: Frontend expects flat structure with direct field access
**New Structure**: Data is nested in type-specific models

## Detailed Analysis

### Backend Tests Status

#### ✅ **Passing Tests**
All existing tests pass because they use the **old model structure**:

```python
# Current working structure
class Project(models.Model):
    # Direct fields (old structure)
    course_name = models.CharField(max_length=255, blank=True, null=True)
    goal_description = models.TextField(blank=True, null=True)
    # ... other fields
```

#### ❌ **Breaking Changes When Using New Models**

1. **Old Serializer with New Model**:
```python
# This will fail
new_project = create_school_project(...)
old_serializer = OldProjectSerializer(new_project)  # ❌ AttributeError: 'Project' object has no attribute 'course_name'
```

2. **New Serializer with Old Model**:
```python
# This will fail
old_project = OldProject.objects.create(...)
new_serializer = NewProjectSerializer(old_project)  # ❌ AttributeError: 'Project' object has no attribute 'schoolproject'
```

### Frontend Compatibility

#### ✅ **Current Frontend Works**
The frontend currently works because it receives this structure:
```javascript
{
  id: "uuid",
  name: "Project Name",
  project_type: "school",
  course_name: "Course Name",  // Direct field
  goal_description: "Goal",    // Direct field
  // ... other fields
}
```

#### ❌ **Frontend Will Break with New Structure**
New structure would be:
```javascript
{
  id: "uuid",
  name: "Project Name",
  project_type: "school",
  school_data: {               // Nested structure
    course_name: "Course Name",
    course_code: "CODE101",
    teacher_name: "Teacher"
  },
  // goal_description is now in self_study_data
}
```

## Migration Strategy

### Phase 1: Backward-Compatible Implementation

#### 1.1 Create Hybrid Models
```python
# models_hybrid.py
class Project(models.Model):
    # Keep old fields for backward compatibility
    course_name = models.CharField(max_length=255, blank=True, null=True)
    goal_description = models.TextField(blank=True, null=True)
    # ... other old fields
    
    # Add new relationships
    school_project = models.OneToOneField('SchoolProject', null=True, blank=True)
    self_study_project = models.OneToOneField('SelfStudyProject', null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # Sync old and new data
        if self.project_type == 'school' and self.school_project:
            self.course_name = self.school_project.course_name
        elif self.project_type == 'self_study' and self.self_study_project:
            self.goal_description = self.self_study_project.goal_description
        super().save(*args, **kwargs)
```

#### 1.2 Hybrid Serializer
```python
# serializers_hybrid.py
class ProjectSerializer(serializers.ModelSerializer):
    # Include both old and new fields
    course_name = serializers.CharField(source='get_course_name', read_only=True)
    goal_description = serializers.CharField(source='get_goal_description', read_only=True)
    
    def get_course_name(self, obj):
        if obj.project_type == 'school':
            return obj.school_project.course_name if obj.school_project else obj.course_name
        return obj.course_name
    
    def get_goal_description(self, obj):
        if obj.project_type == 'self_study':
            return obj.self_study_project.goal_description if obj.self_study_project else obj.goal_description
        return obj.goal_description
```

### Phase 2: Gradual Migration

#### 2.1 Feature Flag Implementation
```python
# settings.py
USE_NEW_PROJECT_MODELS = os.getenv('USE_NEW_PROJECT_MODELS', 'false').lower() == 'true'

# views.py
if settings.USE_NEW_PROJECT_MODELS:
    from .models_improved import Project
    from .serializers_improved import ProjectSerializer
else:
    from .models import Project
    from .serializers import ProjectSerializer
```

#### 2.2 Data Migration Script
```python
# migration_script.py
def migrate_project_to_sti(project):
    """Migrate old project to new STI structure."""
    if project.project_type == 'school':
        SchoolProject.objects.create(
            project=project,
            course_name=project.course_name or '',
            course_code=project.course_code or '',
            teacher_name=project.teacher_name or ''
        )
    elif project.project_type == 'self_study':
        SelfStudyProject.objects.create(
            project=project,
            goal_description=project.goal_description or '',
            study_frequency=project.study_frequency or ''
        )
```

### Phase 3: Frontend Updates

#### 3.1 Update Frontend Types
```typescript
// types.ts - Updated for new structure
export interface Project {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  type: ProjectType;
  progress?: number;
  collaborators?: number;
  // New fields for STI
  project_type: 'school' | 'self_study';
  school_data?: {
    course_name: string;
    course_code: string;
    teacher_name: string;
  };
  self_study_data?: {
    goal_description: string;
    study_frequency: string;
  };
}
```

#### 3.2 Update Frontend Mapping
```typescript
// page.tsx - Updated mapping
const mapped = data
  .filter((p: any) => !p.is_draft)
  .map((p: any) => ({
    id: p.id,
    title: p.name || p.school_data?.course_name || p.self_study_data?.goal_description || 'Untitled',
    description: p.self_study_data?.goal_description || p.school_data?.course_name || '',
    lastUpdated: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '',
    type: p.project_type === 'school' ? 'biology' : 'computer-science',
    progress: 0,
    collaborators: 1,
    // Include new structure
    project_type: p.project_type,
    school_data: p.school_data,
    self_study_data: p.self_study_data,
  }));
```

## Test Updates Required

### 1. **Update Existing Tests**
```python
# test_api.py - Update to work with new structure
def test_create_school_project():
    """Test creating a school project with new structure."""
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    
    data = {
        'name': 'History Thesis',
        'project_type': 'school',
        'school_data': {
            'course_name': 'History 101',
            'course_code': 'HIST101',
            'teacher_name': 'Dr. Smith'
        }
    }
    
    response = client.post('/api/projects/', data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['name'] == 'History Thesis'
    assert response.data['school_data']['course_name'] == 'History 101'
```

### 2. **Add New Tests for STI**
```python
# test_sti_models.py
def test_school_project_creation():
    """Test school project creation with STI."""
    project = create_school_project(
        name='Test Course',
        owner=user,
        course_name='Mathematics',
        course_code='MATH101',
        teacher_name='Dr. Smith'
    )
    
    assert project.is_school_project
    assert project.schoolproject.course_name == 'Mathematics'
    assert not hasattr(project, 'course_name')  # Old field should not exist
```

### 3. **Update Test Factories**
```python
# factories.py - Update for new structure
class SchoolProjectFactory(DjangoModelFactory):
    class Meta:
        model = SchoolProject

    project = factory.SubFactory(ProjectFactory, project_type='school')
    course_name = factory.Faker('catch_phrase')
    course_code = factory.Faker('bothify', text='???-###')
    teacher_name = factory.Faker('name')
```

## Cypress Test Updates

### 1. **Update API Mocks**
```javascript
// cypress/support/api-mocks.js
cy.intercept('POST', '/api/projects/', {
  statusCode: 201,
  body: {
    id: 'test-uuid',
    name: 'Test Project',
    project_type: 'school',
    school_data: {
      course_name: 'Test Course',
      course_code: 'TEST101',
      teacher_name: 'Test Teacher'
    },
    is_draft: true
  }
}).as('createProject');
```

### 2. **Update Test Fixtures**
```javascript
// cypress/fixtures/project.json
{
  "id": "test-uuid",
  "name": "Test Project",
  "project_type": "school",
  "school_data": {
    "course_name": "Test Course",
    "course_code": "TEST101",
    "teacher_name": "Test Teacher"
  },
  "is_draft": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Implementation Plan

### Week 1: Preparation
1. ✅ Create improved models (done)
2. ✅ Create improved serializers (done)
3. ✅ Create migration strategy (done)
4. Create hybrid models for backward compatibility
5. Update test factories

### Week 2: Backward Compatibility
1. Implement hybrid models
2. Update serializers to support both structures
3. Add feature flags
4. Update existing tests to work with both structures

### Week 3: Data Migration
1. Create data migration scripts
2. Test migration on staging
3. Validate data integrity
4. Update test fixtures

### Week 4: Frontend Updates
1. Update TypeScript types
2. Update data mapping logic
3. Update Cypress tests
4. Test frontend compatibility

### Week 5: Gradual Rollout
1. Enable feature flags for subset of users
2. Monitor for issues
3. Rollback plan if needed
4. Full rollout

### Week 6: Cleanup
1. Remove old model fields
2. Remove hybrid code
3. Update documentation
4. Performance optimization

## Success Criteria

1. **Zero Downtime**: Migration completed without service interruption
2. **Backward Compatibility**: Existing API endpoints continue to work
3. **Data Integrity**: 100% of existing data migrated successfully
4. **Performance**: Query performance improved by at least 20%
5. **Test Coverage**: All tests pass with new structure
6. **Frontend Compatibility**: Frontend works seamlessly with new API structure

## Risk Mitigation

1. **Feature Flags**: Ability to rollback quickly
2. **Dual Write**: Write to both old and new structures during transition
3. **Comprehensive Testing**: Extensive testing in staging environment
4. **Monitoring**: Real-time monitoring during migration
5. **Rollback Plan**: Clear procedures for reverting changes 