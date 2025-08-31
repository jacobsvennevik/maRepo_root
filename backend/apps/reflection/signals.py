from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

from .models import ReflectionSession, ReflectionEntry, ReflectionStreak


@receiver(post_save, sender=ReflectionSession)
def update_reflection_streak_on_session_complete(sender, instance, created, **kwargs):
    """Update reflection streak when a session is completed."""
    if not created and instance.ended_at:
        # Session was completed, update streak
        update_user_reflection_streak(instance.user)


@receiver(post_save, sender=ReflectionEntry)
def update_reflection_streak_on_entry_added(sender, instance, created, **kwargs):
    """Update reflection streak when an entry is added to a session."""
    if created and instance.session.ended_at:
        # Entry added to completed session, update streak
        update_user_reflection_streak(instance.session.user)


def update_user_reflection_streak(user):
    """Update the user's reflection streak."""
    try:
        streak, created = ReflectionStreak.objects.get_or_create(user=user)
        
        today = timezone.now().date()
        
        if not streak.last_reflection_date:
            # First reflection
            streak.current_streak = 1
            streak.longest_streak = 1
            streak.last_reflection_date = today
        elif streak.last_reflection_date == today:
            # Already reflected today
            pass
        elif streak.last_reflection_date == today - timedelta(days=1):
            # Consecutive day
            streak.current_streak += 1
            streak.last_reflection_date = today
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
        else:
            # Streak broken
            streak.current_streak = 1
            streak.last_reflection_date = today
        
        streak.save()
        
    except Exception as e:
        # Log error but don't fail
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating reflection streak for user {user.id}: {str(e)}")


@receiver(post_delete, sender=ReflectionSession)
def cleanup_reflection_data(sender, instance, **kwargs):
    """Clean up related data when a reflection session is deleted."""
    # This will cascade delete entries, analysis, and recommendations
    # due to the foreign key relationships
    pass
