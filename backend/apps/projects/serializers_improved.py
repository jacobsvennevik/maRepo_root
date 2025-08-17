from rest_framework import serializers
from .models_improved import (
    Project, SchoolProject, SelfStudyProject, ProjectMeta, 
    ImportantDate, UploadedFile, Extraction, FieldCorrection
)


class ProjectMetaSerializer(serializers.ModelSerializer):
    """Serializer for flexible project metadata."""
    
    class Meta:
        model = ProjectMeta
        fields = ['key', 'value', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ImportantDateSerializer(serializers.ModelSerializer):
    """Serializer for important dates with enhanced features."""
    
    class Meta:
        model = ImportantDate
        fields = [
            'id', 'title', 'date', 'description', 
            'is_recurring', 'recurrence_pattern', 'priority'
        ]


class SchoolProjectSerializer(serializers.ModelSerializer):
    """Serializer for school-specific project data."""
    
    class Meta:
        model = SchoolProject
        fields = ['course_name', 'course_code', 'teacher_name']


class SelfStudyProjectSerializer(serializers.ModelSerializer):
    """Serializer for self-study-specific project data."""
    
    class Meta:
        model = SelfStudyProject
        fields = ['goal_description', 'study_frequency']


class ProjectSerializer(serializers.ModelSerializer):
    """
    Main project serializer with type-specific data and validation.
    """
    # Type-specific data
    school_data = SchoolProjectSerializer(source='schoolproject', required=False)
    self_study_data = SelfStudyProjectSerializer(source='selfstudyproject', required=False)
    
    # Related data
    important_dates = ImportantDateSerializer(many=True, required=False)
    metadata = ProjectMetaSerializer(many=True, required=False, read_only=True)
    
    # Computed fields
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    is_school_project = serializers.BooleanField(read_only=True)
    is_self_study_project = serializers.BooleanField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'project_type', 'project_type_display',
            'owner', 'start_date', 'end_date', 'is_draft',
            'created_at', 'updated_at',
            'school_data', 'self_study_data',
            'important_dates', 'metadata',
            'is_school_project', 'is_self_study_project'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate project data based on project type."""
        project_type = data.get('project_type')
        
        if project_type == 'school':
            school_data = data.get('school_data', {})
            if not school_data.get('course_name'):
                raise serializers.ValidationError({
                    'school_data': {'course_name': 'Course name is required for school projects.'}
                })
            if not school_data.get('course_code'):
                raise serializers.ValidationError({
                    'school_data': {'course_code': 'Course code is required for school projects.'}
                })
            if not school_data.get('teacher_name'):
                raise serializers.ValidationError({
                    'school_data': {'teacher_name': 'Teacher name is required for school projects.'}
                })
                
        elif project_type == 'self_study':
            self_study_data = data.get('self_study_data', {})
            if not self_study_data.get('goal_description'):
                raise serializers.ValidationError({
                    'self_study_data': {'goal_description': 'Goal description is required for self-study projects.'}
                })
            if not self_study_data.get('study_frequency'):
                raise serializers.ValidationError({
                    'self_study_data': {'study_frequency': 'Study frequency is required for self-study projects.'}
                })
        
        return data

    def create(self, validated_data):
        """Create project with type-specific data."""
        # Extract related data
        school_data = validated_data.pop('school_data', None)
        self_study_data = validated_data.pop('self_study_data', None)
        important_dates_data = validated_data.pop('important_dates', [])
        metadata_data = validated_data.pop('metadata', [])
        
        # Create base project
        project = Project.objects.create(**validated_data)
        
        # Create type-specific data
        if project.project_type == 'school' and school_data:
            SchoolProject.objects.create(project=project, **school_data)
        elif project.project_type == 'self_study' and self_study_data:
            SelfStudyProject.objects.create(project=project, **self_study_data)
        
        # Create important dates
        for date_data in important_dates_data:
            ImportantDate.objects.create(project=project, **date_data)
        
        # Create metadata
        for meta_data in metadata_data:
            ProjectMeta.objects.create(project=project, **meta_data)
        
        return project

    def update(self, instance, validated_data):
        """Update project with type-specific data."""
        # Extract related data
        school_data = validated_data.pop('school_data', None)
        self_study_data = validated_data.pop('self_study_data', None)
        important_dates_data = validated_data.pop('important_dates', None)
        metadata_data = validated_data.pop('metadata', None)
        
        # Update base project
        instance = super().update(instance, validated_data)
        
        # Update type-specific data
        if instance.project_type == 'school' and school_data:
            school_project, created = SchoolProject.objects.get_or_create(project=instance)
            for attr, value in school_data.items():
                setattr(school_project, attr, value)
            school_project.save()
        elif instance.project_type == 'self_study' and self_study_data:
            self_study_project, created = SelfStudyProject.objects.get_or_create(project=instance)
            for attr, value in self_study_data.items():
                setattr(self_study_project, attr, value)
            self_study_project.save()
        
        # Update important dates if provided
        if important_dates_data is not None:
            instance.important_dates.all().delete()
            for date_data in important_dates_data:
                ImportantDate.objects.create(project=instance, **date_data)
        
        # Update metadata if provided
        if metadata_data is not None:
            instance.metadata.all().delete()
            for meta_data in metadata_data:
                ProjectMeta.objects.create(project=instance, **meta_data)
        
        return instance


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for project lists with essential data only.
    """
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    
    # Include type-specific data for display
    course_name = serializers.CharField(source='schoolproject.course_name', read_only=True)
    goal_description = serializers.CharField(source='selfstudyproject.goal_description', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'project_type', 'project_type_display',
            'course_name', 'goal_description',
            'start_date', 'end_date', 'is_draft',
            'created_at', 'updated_at'
        ]


class UploadedFileSerializer(serializers.ModelSerializer):
    """Serializer for uploaded files with soft delete support."""
    
    class Meta:
        model = UploadedFile
        fields = [
            'id', 'file', 'uploaded_at', 'content_hash', 
            'raw_text', 'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'content_hash', 'is_deleted', 'deleted_at']


class ExtractionSerializer(serializers.ModelSerializer):
    """Serializer for LLM extraction results."""
    
    class Meta:
        model = Extraction
        fields = [
            'id', 'request_id', 'prompt', 'response',
            'tokens_used', 'latency_ms', 'confidence_score',
            'is_valid_schema', 'is_valid_syntax', 'retry_attempt',
            'created_at'
        ]
        read_only_fields = ['id', 'request_id', 'created_at']


class FieldCorrectionSerializer(serializers.ModelSerializer):
    """Serializer for field corrections."""
    
    class Meta:
        model = FieldCorrection
        fields = [
            'id', 'field_name', 'original_value', 'corrected_value',
            'corrected_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# Specialized serializers for different use cases
class ProjectDetailSerializer(ProjectSerializer):
    """
    Detailed project serializer with all related data.
    """
    uploaded_files = UploadedFileSerializer(many=True, read_only=True)
    extractions = ExtractionSerializer(many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['uploaded_files', 'extractions']


class ProjectCreateSerializer(ProjectSerializer):
    """
    Serializer for project creation with simplified validation.
    """
    def validate(self, data):
        """Simplified validation for creation."""
        project_type = data.get('project_type')
        
        if project_type == 'school':
            school_data = data.get('school_data', {})
            required_fields = ['course_name', 'course_code', 'teacher_name']
            for field in required_fields:
                if not school_data.get(field):
                    raise serializers.ValidationError({
                        'school_data': {field: f'{field.replace("_", " ").title()} is required for school projects.'}
                    })
                    
        elif project_type == 'self_study':
            self_study_data = data.get('self_study_data', {})
            required_fields = ['goal_description', 'study_frequency']
            for field in required_fields:
                if not self_study_data.get(field):
                    raise serializers.ValidationError({
                        'self_study_data': {field: f'{field.replace("_", " ").title()} is required for self-study projects.'}
                    })
        
        return data


class ProjectUpdateSerializer(ProjectSerializer):
    """
    Serializer for project updates with partial data support.
    """
    def validate(self, data):
        """Allow partial updates."""
        # Only validate if project_type is being changed
        if 'project_type' in data:
            return super().validate(data)
        return data 