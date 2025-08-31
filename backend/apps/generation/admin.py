from django.contrib import admin
from .models import (
    FlashcardSet, MindMap, MindMapSet, QuestionSet, Choice, GeneratedContent,
    Topic, Principle, FlashcardProfile, InterleavingSessionConfig,
    DiagnosticSession, DiagnosticQuestion, DiagnosticResponse, DiagnosticAnalytics
)

@admin.register(FlashcardSet)
class FlashcardSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at')
    list_filter = ('created_at', 'owner')
    search_fields = ('title', 'owner__username')

@admin.register(MindMap)
class MindMapAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'owner')
    search_fields = ('title', 'owner__username')

@admin.register(MindMapSet)
class MindMapSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at')
    list_filter = ('created_at', 'owner')
    search_fields = ('title', 'owner__username')

@admin.register(QuestionSet)
class QuestionSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at')
    list_filter = ('created_at', 'owner')
    search_fields = ('title', 'owner__username')

@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('choice_text', 'question', 'is_correct', 'choice_letter')
    list_filter = ('is_correct',)
    search_fields = ('choice_text', 'question__question_text')

@admin.register(GeneratedContent)
class GeneratedContentAdmin(admin.ModelAdmin):
    list_display = ('user', 'id')
    list_filter = ('user',)
    search_fields = ('user__username',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'created_at')
    list_filter = ('parent', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(Principle)
class PrincipleAdmin(admin.ModelAdmin):
    list_display = ('name', 'topic', 'created_at')
    list_filter = ('topic', 'created_at')
    search_fields = ('name', 'topic__name')
    ordering = ('topic__name', 'name')
    filter_horizontal = ('contrasts_with',)


@admin.register(FlashcardProfile)
class FlashcardProfileAdmin(admin.ModelAdmin):
    list_display = ('flashcard', 'topic', 'principle', 'difficulty_est', 'created_at')
    list_filter = ('topic', 'principle', 'difficulty_est', 'created_at')
    search_fields = ('flashcard__question', 'topic__name', 'principle__name')
    ordering = ('topic__name', 'principle__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(InterleavingSessionConfig)
class InterleavingSessionConfigAdmin(admin.ModelAdmin):
    list_display = ('user', 'difficulty', 'session_size', 'auto_adapt', 'updated_at')
    list_filter = ('difficulty', 'auto_adapt', 'updated_at')
    search_fields = ('user__username', 'user__email')
    ordering = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')


# Diagnostic Admin
@admin.register(DiagnosticSession)
class DiagnosticSessionAdmin(admin.ModelAdmin):
    list_display = ('topic', 'project', 'status', 'delivery_mode', 'created_by', 'created_at')
    list_filter = ('status', 'delivery_mode', 'created_at', 'project__project_type')
    search_fields = ('topic', 'project__name', 'created_by__username')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    list_select_related = ('project', 'created_by')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'project', 'topic', 'content_source', 'status')
        }),
        ('Configuration', {
            'fields': ('delivery_mode', 'scheduled_for', 'due_at', 'time_limit_sec', 'max_questions')
        }),
        ('Advanced', {
            'fields': ('questions_order', 'seed', 'variant', 'feature_flag_key')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(DiagnosticQuestion)
class DiagnosticQuestionAdmin(admin.ModelAdmin):
    list_display = ('type', 'text', 'session', 'difficulty', 'bloom_level', 'concept_id')
    list_filter = ('type', 'difficulty', 'bloom_level', 'created_at')
    search_fields = ('text', 'concept_id', 'session__topic')
    ordering = ('session', 'created_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    list_select_related = ('session',)
    
    fieldsets = (
        ('Question Content', {
            'fields': ('id', 'session', 'type', 'text', 'explanation')
        }),
        ('MCQ Options', {
            'fields': ('choices', 'correct_choice_index'),
            'classes': ('collapse',)
        }),
        ('Answer Validation', {
            'fields': ('acceptable_answers', 'concept_id')
        }),
        ('Metadata', {
            'fields': ('difficulty', 'bloom_level', 'source_anchor', 'tags')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(DiagnosticResponse)
class DiagnosticResponseAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'question', 'is_correct', 'confidence', 'score', 'submitted_at')
    list_filter = ('is_correct', 'confidence', 'submitted_at', 'question__type')
    search_fields = ('user__username', 'session__topic', 'question__text')
    ordering = ('-submitted_at',)
    readonly_fields = ('id', 'is_correct', 'score', 'brier_component', 'submitted_at')
    list_select_related = ('user', 'session', 'question')
    
    fieldsets = (
        ('Response', {
            'fields': ('id', 'session', 'question', 'user')
        }),
        ('Answer', {
            'fields': ('answer_text', 'selected_choice_index', 'confidence')
        }),
        ('Results', {
            'fields': ('is_correct', 'score', 'brier_component')
        }),
        ('Timing', {
            'fields': ('latency_ms', 'started_at', 'submitted_at', 'feedback_shown_at')
        }),
        ('Metadata', {
            'fields': ('attempt_no', 'meta')
        })
    )


@admin.register(DiagnosticAnalytics)
class DiagnosticAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('session', 'total_participants', 'participation_rate', 'average_score', 'brier_score')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('session__topic', 'session__project__name')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    list_select_related = ('session',)
    
    fieldsets = (
        ('Session', {
            'fields': ('id', 'session')
        }),
        ('Participation', {
            'fields': ('total_participants', 'participation_rate')
        }),
        ('Performance', {
            'fields': ('average_score', 'median_confidence', 'overconfidence_rate')
        }),
        ('Calibration', {
            'fields': ('brier_score',)
        }),
        ('Concept Analytics', {
            'fields': ('concept_analytics',),
            'classes': ('collapse',)
        }),
        ('Insights', {
            'fields': ('top_misconceptions', 'talking_points'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def has_add_permission(self, request):
        """Analytics are auto-generated, don't allow manual creation."""
        return False
