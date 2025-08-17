from rest_framework import serializers
from .models import Project, UploadedFile, Extraction, FieldCorrection, ImportantDate, SchoolProject, SelfStudyProject
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class SchoolProjectSerializer(serializers.ModelSerializer):
    """Serializer for the new STI SchoolProject model."""
    class Meta:
        model = SchoolProject
        fields = ['course_name', 'course_code', 'teacher_name']


class SelfStudyProjectSerializer(serializers.ModelSerializer):
    """Serializer for the new STI SelfStudyProject model."""
    class Meta:
        model = SelfStudyProject
        fields = ['goal_description', 'study_frequency']


class ProjectSerializer(serializers.ModelSerializer):
    """
    Hybrid serializer that supports both old and new data structures.
    When ENABLE_STI=True, returns nested structure with school_data/self_study_data.
    When ENABLE_STI=False, returns flat structure with direct fields.
    """
    owner = UserSerializer(read_only=True)
    
    # New STI fields (conditionally read-only based on ENABLE_STI)
    school_data = SchoolProjectSerializer(source='school_project_data', required=False)
    self_study_data = SelfStudyProjectSerializer(source='self_study_project_data', required=False)
    
    # Legacy fields (always available for backward compatibility)
    course_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    course_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    teacher_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    goal_description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    study_frequency = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'project_type', 'owner',
            # Legacy fields (always included)
            'course_name', 'course_code', 'teacher_name',
            'goal_description', 'study_frequency', 'syllabus',
            # STI fields (conditionally included in to_representation)
            'school_data', 'self_study_data',
            # Common fields
            'start_date', 'end_date', 'is_draft', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_fields(self):
        """
        Dynamically set field read-only status based on ENABLE_STI setting.
        """
        fields = super().get_fields()
        
        # Read ENABLE_STI dynamically
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if not enable_sti:
            # Make STI fields read-only when STI is disabled
            if 'school_data' in fields:
                fields['school_data'].read_only = True
            if 'self_study_data' in fields:
                fields['self_study_data'].read_only = True
        
        return fields

    def to_internal_value(self, data):
        """
        Handle nested STI data during deserialization.
        """
        # Extract nested STI data before validation (make a copy to avoid modifying original)
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        school_data = data_copy.pop('school_data', None)
        self_study_data = data_copy.pop('self_study_data', None)
        
        # Call parent method to validate the rest
        validated_data = super().to_internal_value(data_copy)
        
        # Add STI data back to validated_data
        if school_data:
            validated_data['school_data'] = school_data
        if self_study_data:
            validated_data['self_study_data'] = self_study_data
        
        return validated_data

    def to_representation(self, instance):
        """
        Custom representation that adapts based on ENABLE_STI flag.
        """
        data = super().to_representation(instance)
        
        # Read ENABLE_STI dynamically
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if enable_sti:
            # When STI is enabled, prioritize new structure but keep legacy fields
            if instance.project_type == 'school' and hasattr(instance, 'school_project_data'):
                # Ensure legacy fields are synced from STI data
                data['course_name'] = instance.school_project_data.course_name
                data['course_code'] = instance.school_project_data.course_code
                data['teacher_name'] = instance.school_project_data.teacher_name
            elif instance.project_type == 'self_study' and hasattr(instance, 'self_study_project_data'):
                # Ensure legacy fields are synced from STI data
                data['goal_description'] = instance.self_study_project_data.goal_description
                data['study_frequency'] = instance.self_study_project_data.study_frequency
        else:
            # When STI is disabled, remove new fields to avoid confusion
            if 'school_data' in data:
                data.pop('school_data')
            if 'self_study_data' in data:
                data.pop('self_study_data')
        
        return data

    def create(self, validated_data):
        """
        Create project with support for both old and new structures.
        The post_save signal will automatically create STI structures when needed.
        """
        # Extract STI-specific data
        school_data = validated_data.pop('school_data', None)
        self_study_data = validated_data.pop('self_study_data', None)
        
        # Create the base project
        project = Project.objects.create(**validated_data)
        
        # Create STI structure if enabled and data provided
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        
        if enable_sti:
            if project.project_type == 'school' and school_data:
                sti_obj, created = SchoolProject.objects.get_or_create(
                    project=project,
                    defaults=school_data
                )
                if not created:
                    # Update existing object
                    for attr, value in school_data.items():
                        setattr(sti_obj, attr, value)
                    sti_obj.save()
            elif project.project_type == 'self_study' and self_study_data:
                sti_obj, created = SelfStudyProject.objects.get_or_create(
                    project=project,
                    defaults=self_study_data
                )
                if not created:
                    # Update existing object
                    for attr, value in self_study_data.items():
                        setattr(sti_obj, attr, value)
                    sti_obj.save()
        
        return project

    def update(self, instance, validated_data):
        """
        Update project with support for both old and new structures.
        The post_save signal will automatically create STI structures when needed.
        """
        # Extract STI-specific data
        school_data = validated_data.pop('school_data', None)
        self_study_data = validated_data.pop('self_study_data', None)
        
        # Update STI structure first if enabled (this will sync to legacy fields)
        enable_sti = config('ENABLE_STI', default=False, cast=bool)
        if enable_sti:
            if instance.project_type == 'school':
                # Update STI data if provided, otherwise update with legacy data
                if school_data:
                    if hasattr(instance, 'school_project_data'):
                        for attr, value in school_data.items():
                            setattr(instance.school_project_data, attr, value)
                        instance.school_project_data.save()
                    else:
                        sti_obj, created = SchoolProject.objects.get_or_create(
                            project=instance,
                            defaults=school_data
                        )
                        if not created:
                            for attr, value in school_data.items():
                                setattr(sti_obj, attr, value)
                            sti_obj.save()
                else:
                    # Update STI data with legacy field values
                    if hasattr(instance, 'school_project_data'):
                        for attr, value in validated_data.items():
                            if attr in ['course_name', 'course_code', 'teacher_name']:
                                setattr(instance.school_project_data, attr, value)
                        instance.school_project_data.save()
            elif instance.project_type == 'self_study':
                if self_study_data:
                    if hasattr(instance, 'self_study_project_data'):
                        for attr, value in self_study_data.items():
                            setattr(instance.self_study_project_data, attr, value)
                        instance.self_study_project_data.save()
                    else:
                        sti_obj, created = SelfStudyProject.objects.get_or_create(
                            project=instance,
                            defaults=self_study_data
                        )
                        if not created:
                            for attr, value in self_study_data.items():
                                setattr(sti_obj, attr, value)
                            sti_obj.save()
                else:
                    # Update STI data with legacy field values
                    if hasattr(instance, 'self_study_project_data'):
                        for attr, value in validated_data.items():
                            if attr in ['goal_description', 'study_frequency']:
                                setattr(instance.self_study_project_data, attr, value)
                        instance.self_study_project_data.save()
        else:
            # In legacy mode, just update the base project
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
        
        return instance


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'file', 'uploaded_at', 'content_hash', 'raw_text']
        read_only_fields = ['id', 'uploaded_at', 'content_hash']


class ExtractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extraction
        fields = [
            'id', 'request_id', 'prompt', 'response', 'tokens_used',
            'latency_ms', 'confidence_score', 'is_valid_schema',
            'is_valid_syntax', 'retry_attempt', 'created_at'
        ]
        read_only_fields = ['id', 'request_id', 'created_at']


class FieldCorrectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldCorrection
        fields = ['id', 'field_name', 'original_value', 'corrected_value', 'corrected_by', 'created_at']
        read_only_fields = ['id', 'created_at']


class ImportantDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantDate
        fields = ['id', 'title', 'date', 'description']


class ProjectDetailSerializer(ProjectSerializer):
    """
    Extended serializer for project detail views that includes related data.
    """
    uploaded_files = UploadedFileSerializer(many=True, read_only=True)
    important_dates = ImportantDateSerializer(many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['uploaded_files', 'important_dates'] 