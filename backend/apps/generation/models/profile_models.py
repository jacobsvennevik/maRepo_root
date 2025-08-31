# Profile Models
from django.db import models
from django.conf import settings
from django.utils import timezone


class FlashcardProfile(models.Model):
    """Non-breaking add-on for interleaving metadata."""
    flashcard = models.OneToOneField('Flashcard', on_delete=models.CASCADE, primary_key=True)
    topic = models.ForeignKey('Topic', null=True, blank=True, on_delete=models.SET_NULL)
    principle = models.ForeignKey('Principle', null=True, blank=True, on_delete=models.SET_NULL)
    difficulty_est = models.FloatField(default=1.0)  # 0.5..3.0 rough
    surface_features = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["topic"]),
            models.Index(fields=["principle"]),
            models.Index(fields=["difficulty_est"]),
        ]

    def __str__(self):
        return f"Profile for {self.flashcard}"


class GeneratedContent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='generated_contents')
    content_type = models.CharField(max_length=50, default="flashcard")  # flashcard, mindmap, question_set
    content_id = models.PositiveIntegerField(default=0)  # ID of the generated content
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.content_type} {self.content_id} for {self.user.username}"
