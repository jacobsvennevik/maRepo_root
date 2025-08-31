from django.contrib import admin
from .models import (
    ReflectionSession, ReflectionEntry, ReflectionAnalysis, 
    Checklist, ChecklistItem, Recommendation, ReflectionStreak
)


@admin.register(ReflectionSession)
class ReflectionSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'project', 'source', 'started_at', 'ended_at', 'duration_seconds']
    list_filter = ['source', 'started_at', 'ended_at']
    search_fields = ['user__username', 'project__name', 'source_ref']
    readonly_fields = ['started_at', 'duration_seconds']
    date_hierarchy = 'started_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'project')


@admin.register(ReflectionEntry)
class ReflectionEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'key', 'text_preview', 'created_at']
    list_filter = ['key', 'created_at']
    search_fields = ['text', 'session__user__username']
    readonly_fields = ['created_at']
    
    def text_preview(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    text_preview.short_description = 'Text Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('session__user')


@admin.register(ReflectionAnalysis)
class ReflectionAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'tags_display', 'confidence', 'created_at']
    list_filter = ['confidence', 'created_at']
    search_fields = ['session__user__username', 'notes']
    readonly_fields = ['created_at']
    
    def tags_display(self, obj):
        return ', '.join(obj.tags[:3]) + ('...' if len(obj.tags) > 3 else '')
    tags_display.short_description = 'Tags'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('session__user')


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'project', 'source_ref', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'project__name', 'source_ref']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project')


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'checklist', 'order', 'text_preview', 'hint_preview']
    list_filter = ['order']
    search_fields = ['text', 'hint', 'checklist__title']
    ordering = ['checklist', 'order']
    
    def text_preview(self, obj):
        return obj.text[:80] + '...' if len(obj.text) > 80 else obj.text
    text_preview.short_description = 'Text'
    
    def hint_preview(self, obj):
        return obj.hint[:50] + '...' if obj.hint and len(obj.hint) > 50 else obj.hint or '-'
    hint_preview.short_description = 'Hint'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('checklist')


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'kind', 'label', 'dismissed', 'clicked_at', 'created_at']
    list_filter = ['kind', 'dismissed', 'clicked_at', 'created_at']
    search_fields = ['label', 'session__user__username']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('session__user')


@admin.register(ReflectionStreak)
class ReflectionStreakAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'current_streak', 'longest_streak', 'last_reflection_date', 'updated_at']
    list_filter = ['current_streak', 'longest_streak', 'last_reflection_date']
    search_fields = ['user__username']
    readonly_fields = ['updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
