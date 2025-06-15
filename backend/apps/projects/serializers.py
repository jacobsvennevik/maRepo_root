from rest_framework import serializers
from .models import Project, ImportantDate

class ImportantDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantDate
        fields = ['id', 'title', 'date', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    important_dates = ImportantDateSerializer(many=True, required=False)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'project_type', 'owner', 'course_name', 'course_code',
            'teacher_name', 'goal_description', 'study_frequency', 'start_date',
            'end_date', 'is_draft', 'important_dates'
        ]
        read_only_fields = ['owner']

    def validate(self, data):
        project_type = data.get('project_type')
        if project_type == 'school':
            if not data.get('course_name'):
                raise serializers.ValidationError({'course_name': 'Course name is required for school projects.'})
        elif project_type == 'self_study':
            if not data.get('goal_description'):
                raise serializers.ValidationError({'goal_description': 'Goal description is required for self-study projects.'})
        return data

    def create(self, validated_data):
        important_dates_data = validated_data.pop('important_dates', [])
        project = Project.objects.create(**validated_data)
        for date_data in important_dates_data:
            ImportantDate.objects.create(project=project, **date_data)
        return project

    def update(self, instance, validated_data):
        important_dates_data = validated_data.pop('important_dates', [])
        instance = super().update(instance, validated_data)

        # Naive implementation: clear existing and create new dates
        instance.important_dates.all().delete()
        for date_data in important_dates_data:
            ImportantDate.objects.create(project=instance, **date_data)

        return instance 