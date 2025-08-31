from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class ReflectionSession(models.Model):
    """A reflection session triggered after quiz/study activities."""
    
    class Source(models.TextChoices):
        QUIZ = "quiz"
        STUDY = "study"
        OTHER = "other"
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, null=True, blank=True)
    source = models.CharField(max_length=16, choices=Source.choices)
    source_ref = models.CharField(max_length=64, blank=True)  # quiz_id, document_id, etc.
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Reflection for {self.user.username} - {self.source} ({self.started_at.strftime('%Y-%m-%d %H:%M')})"


class ReflectionEntry(models.Model):
    """Individual reflection responses from the user."""
    
    session = models.ForeignKey(ReflectionSession, on_delete=models.CASCADE, related_name="entries")
    # Fixed keys keep UI minimal, analytics consistent
    key = models.CharField(max_length=32)  # e.g., "what_was_hard", "misapplied_rule", "what_went_well", "next_time"
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        unique_together = ['session', 'key']
    
    def __str__(self):
        return f"{self.key}: {self.text[:50]}..."


class ReflectionAnalysis(models.Model):
    """AI analysis of the reflection session."""
    
    session = models.OneToOneField(ReflectionSession, on_delete=models.CASCADE, related_name="analysis")
    tags = models.JSONField(default=list)  # ["misreading", "formula_error", "concept_link", "time_mgmt"]
    confidence = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )  # internal classifier confidence (0..1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Analysis: {', '.join(self.tags)} (confidence: {self.confidence:.2f})"


class Checklist(models.Model):
    """Checklist derived from slides/notes or curated content."""
    
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE)
    source_ref = models.CharField(max_length=64, blank=True)  # pdf/doc id
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.project.name}"


class ChecklistItem(models.Model):
    """Individual items in a checklist."""
    
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name="items")
    order = models.PositiveIntegerField()
    text = models.TextField()
    hint = models.TextField(blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['checklist', 'order']
    
    def __str__(self):
        return f"{self.order}. {self.text}"


class Recommendation(models.Model):
    """What the user should do next, produced from analysis & context."""
    
    class Kind(models.TextChoices):
        PRACTICE_SET = "practice_set"
        FLASHCARDS = "flashcards"
        TIP = "tip"
        MINI_LESSON = "mini_lesson"
        REVIEW = "review"
    
    session = models.ForeignKey(ReflectionSession, on_delete=models.CASCADE, related_name="recommendations")
    kind = models.CharField(max_length=32, choices=Kind.choices)
    payload = models.JSONField(default=dict)  # e.g., {mcq_set_id, topic, deck_id, url}
    label = models.CharField(max_length=255)  # CTA label shown in UI
    dismissed = models.BooleanField(default=False)
    clicked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.kind}: {self.label}"


class ReflectionStreak(models.Model):
    """Track user's reflection completion streaks."""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_reflection_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}: {self.current_streak} day streak"
