from django.contrib import admin
from .models import StudyMaterial, Test

@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'material_type', 'owner', 'project', 'created_at', 'updated_at')
    list_filter = ('material_type', 'created_at', 'updated_at')
    search_fields = ('title', 'owner__username', 'project__name')
    date_hierarchy = 'created_at'

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('study_material', 'time_limit', 'passing_score')
    list_filter = ('time_limit', 'passing_score')
    search_fields = ('study_material__title',) 