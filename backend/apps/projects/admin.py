from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Project, UploadedFile, Extraction, ProjectMeta, ImportantDate, SchoolProject, SelfStudyProject, ProjectFlashcardSet

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

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'project', 'processing_status', 'content_type', 'file_size', 'uploaded_at')
    list_filter = ('processing_status', 'content_type', 'uploaded_at')
    search_fields = ('original_name', 'project__name')
    readonly_fields = ('id', 'content_hash', 'uploaded_at', 'processing_started_at', 'processing_completed_at')
    
    fieldsets = (
        ('File Info', {
            'fields': ('id', 'project', 'file', 'original_name', 'content_type', 'file_size', 'uploaded_at')
        }),
        ('Processing Status', {
            'fields': ('processing_status', 'processing_error', 'processing_started_at', 'processing_completed_at')
        }),
        ('Content', {
            'fields': ('raw_text', 'extracted_text', 'content_hash')
        }),
    )
    
    actions = ['reprocess_files', 'reset_to_pending']
    
    def reprocess_files(self, request, queryset):
        """Reprocess selected files that failed or were skipped."""
        from .services import process_uploaded_file
        count = 0
        for uploaded_file in queryset:
            if uploaded_file.processing_status in ['failed', 'skipped']:
                # Reset to pending so it can be reprocessed
                uploaded_file.processing_status = 'pending'
                uploaded_file.processing_error = ''
                uploaded_file.processing_started_at = None
                uploaded_file.processing_completed_at = None
                uploaded_file.save()
                
                # Trigger reprocessing
                process_uploaded_file(str(uploaded_file.id))
                count += 1
        
        self.message_user(request, f"Reprocessed {count} files.")
    reprocess_files.short_description = "Reprocess failed/skipped files"
    
    def reset_to_pending(self, request, queryset):
        """Reset selected files to pending status."""
        updated = queryset.update(
            processing_status='pending',
            processing_error='',
            processing_started_at=None,
            processing_completed_at=None
        )
        self.message_user(request, f"Reset {updated} files to pending status.")
    reset_to_pending.short_description = "Reset to pending status"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project')
