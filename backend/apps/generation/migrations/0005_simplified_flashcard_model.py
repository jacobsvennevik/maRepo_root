# Generated manually to avoid interactive prompts

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('generation', '0004_alter_flashcard_options_flashcard_difficulty_rating_and_more'),
    ]

    operations = [
        # Remove the problematic fields first
        migrations.RemoveField(
            model_name='flashcard',
            name='difficulty_rating',
        ),
        migrations.RemoveField(
            model_name='flashcard',
            name='tags',
        ),
        migrations.RemoveField(
            model_name='flashcard',
            name='leitner_box',
        ),
        migrations.RemoveField(
            model_name='flashcard',
            name='memory_strength',
        ),
        
        # Add the simplified fields
        migrations.AddField(
            model_name='flashcard',
            name='metrics',
            field=models.JSONField(blank=True, default=dict),
        ),
        
        # Add created_at field
        migrations.AddField(
            model_name='flashcard',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        
        # Update field types
        migrations.AlterField(
            model_name='flashcard',
            name='interval',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='flashcard',
            name='repetitions',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='flashcard',
            name='total_reviews',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='flashcard',
            name='correct_reviews',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='flashcard',
            name='next_review',
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        
        # Update indexes - optimized for due queries
        migrations.AlterIndexTogether(
            name='flashcard',
            index_together=set(),
        ),
        migrations.AddIndex(
            model_name='flashcard',
            index=models.Index(fields=['next_review', 'flashcard_set'], name='generation__next_re_flashca_123456_idx'),
        ),
        # Add optimized index for project-based due queries
        migrations.AddIndex(
            model_name='flashcard',
            index=models.Index(fields=['flashcard_set', 'next_review'], name='generation__flashca_next_re_789012_idx'),
        ),
    ] 