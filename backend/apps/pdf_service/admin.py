from django.contrib import admin
from .django_models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'file_type', 'upload_type', 'status', 'upload_date')
    list_filter = ('file_type', 'upload_type', 'status', 'upload_date')
    search_fields = ('title', 'user__username')
    readonly_fields = ('upload_date',)
    date_hierarchy = 'upload_date'
