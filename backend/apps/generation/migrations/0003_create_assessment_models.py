# Generated migration for assessment models
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('generation', '0002_generatedcontent'),
    ]

    operations = [
        # Create AssessmentSet model
        migrations.CreateModel(
            name='AssessmentSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='Untitled Assessment Set', max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('kind', models.CharField(choices=[('FLASHCARDS', 'Flashcards'), ('MCQ', 'Multiple Choice'), ('MIXED', 'Mixed Assessment'), ('TRUE_FALSE', 'True/False'), ('FILL_BLANK', 'Fill in the Blank')], default='FLASHCARDS', max_length=20)),
                ('learning_objectives', models.JSONField(blank=True, default=list)),
                ('themes', models.JSONField(blank=True, default=list)),
                ('difficulty_level', models.CharField(default='INTERMEDIATE', max_length=20)),
                ('target_audience', models.CharField(blank=True, default='', max_length=255)),
                ('estimated_study_time', models.PositiveIntegerField(default=30)),
                ('tags', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('assessment_config', models.JSONField(blank=True, default=dict)),
                ('document', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assessments', to='pdf_service.document')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.customuser')),
            ],
            options={
                'indexes': [
                    models.Index(fields=['owner', 'kind'], name='generation_ass_owner_8b8c8c_idx'),
                    models.Index(fields=['kind', 'created_at'], name='generation_ass_kind_9a9d9d_idx'),
                ],
            },
        ),
        
        # Create AssessmentItem model
        migrations.CreateModel(
            name='AssessmentItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_type', models.CharField(choices=[('FLASHCARD', 'Flashcard'), ('MCQ', 'Multiple Choice'), ('TRUE_FALSE', 'True/False'), ('FILL_BLANK', 'Fill in the Blank'), ('MATCHING', 'Matching'), ('ORDERING', 'Ordering')], max_length=20)),
                ('order_index', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('question', models.TextField()),
                ('answer', models.TextField()),
                ('choices', models.JSONField(blank=True, default=list)),
                ('correct_index', models.PositiveIntegerField(blank=True, null=True)),
                ('explanation', models.TextField(blank=True, default='')),
                ('difficulty', models.CharField(choices=[('BEGINNER', 'Beginner'), ('INTERMEDIATE', 'Intermediate'), ('ADVANCED', 'Advanced'), ('EXPERT', 'Expert')], default='INTERMEDIATE', max_length=15)),
                ('bloom_level', models.CharField(choices=[('remember', 'Remember'), ('understand', 'Understand'), ('apply', 'Apply'), ('analyze', 'Analyze'), ('evaluate', 'Evaluate'), ('create', 'Create')], default='apply', max_length=15)),
                ('concept_id', models.CharField(blank=True, default='', max_length=255)),
                ('theme', models.CharField(blank=True, default='', max_length=100)),
                ('related_concepts', models.JSONField(blank=True, default=list)),
                ('hints', models.JSONField(blank=True, default=list)),
                ('examples', models.JSONField(blank=True, default=list)),
                ('common_misconceptions', models.JSONField(blank=True, default=list)),
                ('learning_objective', models.CharField(blank=True, default='', max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('algorithm', models.CharField(choices=[('sm2', 'SM-2'), ('leitner', 'Leitner')], default='sm2', max_length=20)),
                ('learning_state', models.CharField(choices=[('new', 'New'), ('learning', 'Learning'), ('review', 'Review'), ('mastered', 'Mastered')], default='new', max_length=20)),
                ('interval', models.PositiveIntegerField(default=1)),
                ('repetitions', models.PositiveIntegerField(default=0)),
                ('ease_factor', models.FloatField(default=2.5)),
                ('leitner_box', models.PositiveIntegerField(default=1)),
                ('next_review', models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
                ('last_reviewed', models.DateTimeField(blank=True, null=True)),
                ('total_reviews', models.PositiveIntegerField(default=0)),
                ('correct_reviews', models.PositiveIntegerField(default=0)),
                ('metrics', models.JSONField(blank=True, default=dict)),
                ('assessment_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='generation.assessmentset')),
            ],
            options={
                'ordering': ['order_index', 'next_review', 'updated_at'],
                'indexes': [
                    models.Index(fields=['assessment_set', 'order_index'], name='generation_ass_assess_1a2b3c_idx'),
                    models.Index(fields=['assessment_set', 'item_type'], name='generation_ass_assess_4d5e6f_idx'),
                    models.Index(fields=['learning_state', 'next_review'], name='generation_ass_learni_7g8h9i_idx'),
                    models.Index(fields=['next_review', 'assessment_set'], name='generation_ass_next__0j1k2l_idx'),
                ],
            },
        ),
        
        # Create AssessmentAttempt model
        migrations.CreateModel(
            name='AssessmentAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attempt_type', models.CharField(choices=[('SPACED_REPETITION', 'Spaced Repetition Review'), ('QUIZ', 'Quiz/Diagnostic'), ('PRACTICE', 'Practice Mode')], default='SPACED_REPETITION', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('response_time_ms', models.PositiveIntegerField(default=0)),
                ('payload', models.JSONField(default=dict)),
                ('quality', models.PositiveIntegerField(blank=True, null=True)),
                ('selected_index', models.PositiveIntegerField(blank=True, null=True)),
                ('is_correct', models.BooleanField(blank=True, null=True)),
                ('confidence', models.FloatField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, default='')),
                ('session_id', models.CharField(blank=True, default='', max_length=255)),
                ('assessment_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='generation.assessmentitem')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.customuser')),
            ],
            options={
                'indexes': [
                    models.Index(fields=['user', 'assessment_item', 'created_at'], name='generation_ass_user_3m4n5o_idx'),
                    models.Index(fields=['assessment_item', 'attempt_type'], name='generation_ass_assess_6p7q8r_idx'),
                    models.Index(fields=['created_at'], name='generation_ass_creat_9s0t1u_idx'),
                ],
            },
        ),
        
        # Create proxy models for backward compatibility
        migrations.CreateModel(
            name='FlashcardSet',
            fields=[],
            options={
                'verbose_name': 'Flashcard Set',
                'verbose_name_plural': 'Flashcard Sets',
                'proxy': True,
            },
            bases=('generation.assessmentset',),
        ),
        
        migrations.CreateModel(
            name='Flashcard',
            fields=[],
            options={
                'verbose_name': 'Flashcard',
                'verbose_name_plural': 'Flashcards',
                'proxy': True,
            },
            bases=('generation.assessmentitem',),
        ),
    ]

