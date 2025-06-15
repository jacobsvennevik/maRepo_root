from django.contrib import admin
from .models import Project, ImportantDate

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'project_type', 'owner', 'start_date', 'end_date', 'is_draft')
    list_filter = ('project_type', 'is_draft', 'start_date', 'end_date')
    search_fields = ('name', 'owner__username', 'course_name', 'course_code')
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {
            'fields': ('name', 'project_type', 'owner', 'is_draft')
        }),
        ('School Project Details', {
            'fields': ('course_name', 'course_code', 'teacher_name', 'syllabus'),
            'classes': ('collapse',),
        }),
        ('Self-Study Details', {
            'fields': ('goal_description', 'study_frequency'),
            'classes': ('collapse',),
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date'),
        }),
    )

@admin.register(ImportantDate)
class ImportantDateAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'date')
    list_filter = ('date', 'project')
    search_fields = ('title', 'project__name')
    date_hierarchy = 'date'
