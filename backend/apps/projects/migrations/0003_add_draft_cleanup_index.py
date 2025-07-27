# Generated manually for draft cleanup performance

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_project_syllabus'),
    ]

    operations = [
        migrations.RunSQL(
            # Add index for draft cleanup performance
            sql="""
            CREATE INDEX IF NOT EXISTS idx_project_draft_status_updated 
            ON projects_project(is_draft, updated_at) 
            WHERE is_draft = true;
            """,
            reverse_sql="""
            DROP INDEX IF EXISTS idx_project_draft_status_updated;
            """
        ),
    ] 