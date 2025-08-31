# Interleaving Models
from django.db import models
from django.conf import settings


class Topic(models.Model):
    """Topic for organizing flashcards and enabling interleaving."""
    name = models.CharField(max_length=255, unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["name"])]

    def __str__(self):
        return self.name


class Principle(models.Model):
    """Learning principle that can contrast with other principles."""
    name = models.CharField(max_length=255, unique=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='principles')
    contrasts_with = models.ManyToManyField('self', symmetrical=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.topic.name})"


class InterleavingSessionConfig(models.Model):
    """User configuration for interleaving scheduler."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    difficulty = models.CharField(
        max_length=10, 
        choices=[("low", "low"), ("medium", "medium"), ("high", "high")], 
        default="medium"
    )
    session_size = models.PositiveIntegerField(default=10)
    w_due = models.FloatField(default=0.60)
    w_interleave = models.FloatField(default=0.25)
    w_new = models.FloatField(default=0.15)
    max_same_topic_streak = models.PositiveIntegerField(default=2)
    require_contrast_pair = models.BooleanField(default=True)
    auto_adapt = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Interleaving Session Configuration"
        verbose_name_plural = "Interleaving Session Configurations"

    def __str__(self):
        """Robust string representation with fallbacks."""
        try:
            # Avoid N+1 on user; assume user is already cached in admin list displays
            ident = (getattr(self.user, "email", None) or 
                    getattr(self.user, "username", None) or 
                    f"user:{self.user_id}")
            return f"InterleavingConfig<{ident} / {self.difficulty}>"
        except Exception:
            return f"InterleavingConfig<user:{self.user_id} / {self.difficulty}>"

    def clean(self):
        """Validate configuration constraints."""
        from django.core.exceptions import ValidationError
        
        # Ensure weights sum to approximately 1.0
        total_weight = self.w_due + self.w_interleave + self.w_new
        if abs(total_weight - 1.0) > 0.01:
            raise ValidationError(
                f"Weights must sum to 1.0, got {total_weight:.3f}"
            )
        
        # Validate session size bounds
        if self.session_size < 1:
            raise ValidationError("Session size must be at least 1")
        if self.session_size > 200:
            raise ValidationError("Session size cannot exceed 200")
        
        # Validate topic streak constraint
        if self.max_same_topic_streak < 1:
            raise ValidationError("Max topic streak must be at least 1")
        if self.max_same_topic_streak > 10:
            raise ValidationError("Max topic streak cannot exceed 10")

    def get_weights(self):
        """Get normalized weights that sum to 1.0"""
        total = self.w_due + self.w_interleave + self.w_new
        if total == 0:
            return 0.6, 0.25, 0.15
        return self.w_due / total, self.w_interleave / total, self.w_new / total

    def save(self, *args, **kwargs):
        """Ensure validation runs on save."""
        self.clean()
        super().save(*args, **kwargs)
