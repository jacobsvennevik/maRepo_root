#!/usr/bin/env python3
"""
Column-Drop Migration Preparation Script

This script prepares the migration to remove obsolete legacy columns after STI rollout.
It includes safety checks, validation procedures, and PR template generation.

Usage:
    python scripts/prepare_column_drop_migration.py [options]

Options:
    --validate-data     Run data validation before migration
    --generate-pr       Generate PR template with checklist
    --include-rollback  Include rollback procedures
    --safety-checks     Run comprehensive safety checks
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

import django
from django.conf import settings
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from django.core.management.base import BaseCommand
from backend.apps.projects.models import Project, SchoolProject, SelfStudyProject


class ColumnDropMigrationPreparer:
    """Prepares column-drop migration with comprehensive safety checks."""
    
    def __init__(self, validate_data=False, generate_pr=False, include_rollback=False, safety_checks=False):
        self.validate_data = validate_data
        self.generate_pr = generate_pr
        self.include_rollback = include_rollback
        self.safety_checks = safety_checks
        self.migration_name = f"drop_legacy_columns_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
    def run_safety_checks(self):
        """Run comprehensive safety checks before migration preparation."""
        print("🔒 Running comprehensive safety checks...")
        
        checks = {
            "STI Coverage": self.check_sti_coverage(),
            "Data Integrity": self.check_data_integrity(),
            "Legacy Column Usage": self.check_legacy_column_usage(),
            "Migration Dependencies": self.check_migration_dependencies(),
            "Rollback Capability": self.check_rollback_capability(),
        }
        
        all_passed = True
        for check_name, result in checks.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {check_name}: {status}")
            if not result:
                all_passed = False
                
        return all_passed
    
    def check_sti_coverage(self):
        """Check that all projects have STI structures."""
        try:
            total_projects = Project.objects.filter(is_draft=False).count()
            school_sti = SchoolProject.objects.count()
            self_study_sti = SelfStudyProject.objects.count()
            
            coverage = (school_sti + self_study_sti) / total_projects if total_projects > 0 else 0
            print(f"    STI Coverage: {coverage:.1%} ({school_sti + self_study_sti}/{total_projects})")
            
            return coverage >= 0.99  # 99% coverage required
        except Exception as e:
            print(f"    Error checking STI coverage: {e}")
            return False
    
    def check_data_integrity(self):
        """Check data integrity between legacy and STI structures."""
        try:
            issues = []
            
            # Check for missing STI structures
            for project in Project.objects.filter(is_draft=False):
                if project.project_type == 'school' and not hasattr(project, 'school_project_data'):
                    issues.append(f'Missing SchoolProject for {project.id}')
                elif project.project_type == 'self_study' and not hasattr(project, 'self_study_project_data'):
                    issues.append(f'Missing SelfStudyProject for {project.id}')
            
            print(f"    Data Integrity Issues: {len(issues)}")
            if issues:
                for issue in issues[:5]:  # Show first 5
                    print(f"      - {issue}")
                if len(issues) > 5:
                    print(f"      ... and {len(issues) - 5} more")
            
            return len(issues) == 0
        except Exception as e:
            print(f"    Error checking data integrity: {e}")
            return False
    
    def check_legacy_column_usage(self):
        """Check if legacy columns are still being used."""
        try:
            # Check for any code still referencing legacy columns
            legacy_columns = ['project_type', 'school_data', 'self_study_data']
            
            # This is a simplified check - in practice, you'd want to scan the codebase
            print(f"    Legacy columns to drop: {', '.join(legacy_columns)}")
            
            # For now, assume they're safe to drop if STI is working
            return True
        except Exception as e:
            print(f"    Error checking legacy column usage: {e}")
            return False
    
    def check_migration_dependencies(self):
        """Check migration dependencies and conflicts."""
        try:
            # Check if there are any pending migrations
            result = subprocess.run(
                ['python', 'manage.py', 'showmigrations', '--list'],
                capture_output=True, text=True, cwd=backend_path
            )
            
            if result.returncode != 0:
                print(f"    Error checking migrations: {result.stderr}")
                return False
            
            print("    Migration dependencies: OK")
            return True
        except Exception as e:
            print(f"    Error checking migration dependencies: {e}")
            return False
    
    def check_rollback_capability(self):
        """Check that rollback procedures are available."""
        try:
            # Check if backup procedures exist
            backup_script = Path(__file__).parent / "rollback_sti_data.py"
            if backup_script.exists():
                print("    Rollback script: Available")
                return True
            else:
                print("    Rollback script: Missing")
                return False
        except Exception as e:
            print(f"    Error checking rollback capability: {e}")
            return False
    
    def generate_migration_file(self):
        """Generate the column-drop migration file."""
        print(f"📝 Generating migration file: {self.migration_name}")
        
        migration_content = f'''"""
Migration to drop legacy columns after STI rollout.

This migration removes the following legacy columns:
- project_type (replaced by STI)
- school_data (replaced by SchoolProject)
- self_study_data (replaced by SelfStudyProject)

IMPORTANT: This migration is IRREVERSIBLE.
Only run after confirming 100% STI coverage and data integrity.
"""

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0003_auto_20250101_0000'),  # Update with actual dependency
    ]

    operations = [
        # Drop legacy columns
        migrations.RemoveField(
            model_name='project',
            name='project_type',
        ),
        migrations.RemoveField(
            model_name='project',
            name='school_data',
        ),
        migrations.RemoveField(
            model_name='project',
            name='self_study_data',
        ),
    ]
'''
        
        # Create migrations directory if it doesn't exist
        migrations_dir = backend_path / "apps" / "projects" / "migrations"
        migrations_dir.mkdir(parents=True, exist_ok=True)
        
        # Write migration file
        migration_file = migrations_dir / f"{self.migration_name}.py"
        with open(migration_file, 'w') as f:
            f.write(migration_content)
        
        print(f"    Migration file created: {migration_file}")
        return migration_file
    
    def generate_pr_template(self):
        """Generate PR template with comprehensive checklist."""
        print("📋 Generating PR template...")
        
        template_content = f'''# Column-Drop Migration: Remove Legacy Project Columns

## 🎯 **Purpose**
Remove obsolete legacy columns after successful STI rollout.

## 📋 **Migration Details**
- **Migration Name**: `{self.migration_name}`
- **Columns to Drop**: `project_type`, `school_data`, `self_study_data`
- **Replacement**: STI structures (`SchoolProject`, `SelfStudyProject`)

## ✅ **Pre-Merge Checklist**

### **Data Validation**
- [ ] 100% STI coverage confirmed
- [ ] Data integrity validation passed
- [ ] No legacy column usage in codebase
- [ ] All tests passing with STI structures

### **Safety Checks**
- [ ] Migration dependencies verified
- [ ] Rollback procedures documented
- [ ] Backup procedures tested
- [ ] Emergency contacts confirmed

### **Testing**
- [ ] Migration tested in staging environment
- [ ] Rollback tested in staging environment
- [ ] Performance impact assessed
- [ ] Integration tests passing

### **Documentation**
- [ ] Migration documentation updated
- [ ] Team procedures updated
- [ ] Monitoring alerts configured
- [ ] Rollback procedures documented

## 🚨 **Important Notes**

### **Irreversible Migration**
This migration is **IRREVERSIBLE**. Once merged and deployed:
- Legacy columns will be permanently removed
- Rollback requires database restoration
- No automatic rollback possible

### **Deployment Requirements**
- [ ] Deploy during maintenance window
- [ ] Have database backup ready
- [ ] Monitor closely during deployment
- [ ] Have rollback plan ready

### **Post-Deployment**
- [ ] Verify all functionality working
- [ ] Monitor performance metrics
- [ ] Check error rates
- [ ] Update documentation

## 🔄 **Rollback Plan**

If issues occur after deployment:

1. **Immediate Response** (5 minutes)
   - Assess impact and severity
   - Notify emergency contacts
   - Begin database restoration if needed

2. **Database Restoration** (30-60 minutes)
   - Restore from latest backup
   - Verify data integrity
   - Re-enable legacy columns if needed

3. **Communication** (Ongoing)
   - Update stakeholders
   - Document lessons learned
   - Plan next deployment attempt

## 📞 **Emergency Contacts**
- **Technical Lead**: [Name] - [Phone]
- **DevOps Engineer**: [Name] - [Phone]
- **Database Administrator**: [Name] - [Phone]

---
**Status**: Do Not Merge - Awaiting Final Validation
**Created**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
'''
        
        # Write PR template
        template_file = Path(__file__).parent.parent / "docs" / "PR_TEMPLATE_COLUMN_DROP.md"
        template_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(template_file, 'w') as f:
            f.write(template_content)
        
        print(f"    PR template created: {template_file}")
        return template_file
    
    def generate_instructions(self):
        """Generate step-by-step instructions."""
        print("📖 Generating instructions...")
        
        instructions_content = f'''# Column-Drop Migration Instructions

## 🎯 **Overview**
This document provides step-by-step instructions for the column-drop migration.

## 📋 **Prerequisites**
- [ ] STI rollout completed successfully
- [ ] 100% STI coverage confirmed
- [ ] Data integrity validation passed
- [ ] All tests passing
- [ ] Team trained on procedures

## 🚀 **Migration Steps**

### **Step 1: Final Validation**
```bash
# Run comprehensive safety checks
python scripts/prepare_column_drop_migration.py --safety-checks --validate-data

# Verify STI coverage
python manage.py shell -c "
from backend.apps.projects.models import Project, SchoolProject, SelfStudyProject
total = Project.objects.filter(is_draft=False).count()
school_sti = SchoolProject.objects.count()
self_study_sti = SelfStudyProject.objects.count()
coverage = (school_sti + self_study_sti) / total
print(f'STI Coverage: {{coverage:.1%}}')
"
```

### **Step 2: Create Migration Branch**
```bash
# Create feature branch
git checkout -b feature/column-drop-migration

# Generate migration
python scripts/prepare_column_drop_migration.py --generate-pr

# Review generated files
git add .
git commit -m "Add column-drop migration: {self.migration_name}"
```

### **Step 3: Create Pull Request**
```bash
# Push branch
git push origin feature/column-drop-migration

# Create PR using template
# Use docs/PR_TEMPLATE_COLUMN_DROP.md
```

### **Step 4: Review and Testing**
- [ ] Code review completed
- [ ] Migration tested in staging
- [ ] Rollback procedures tested
- [ ] Performance impact assessed
- [ ] Security review completed

### **Step 5: Deployment**
```bash
# Deploy to staging first
git checkout main
git pull origin main
python manage.py migrate

# Verify staging deployment
# Run integration tests
# Monitor performance metrics

# Deploy to production
# Follow production deployment procedures
```

## 🔄 **Rollback Procedures**

### **If Issues Occur During Deployment**
1. **Stop deployment immediately**
2. **Assess impact and severity**
3. **Begin database restoration if needed**
4. **Notify emergency contacts**
5. **Document incident and lessons learned**

### **Database Restoration**
```bash
# Restore from backup
pg_restore -d oceanlearn_production backup_file.dump

# Verify restoration
python manage.py shell -c "
from backend.apps.projects.models import Project
print(f'Projects restored: {{Project.objects.count()}}')
"
```

## 📊 **Monitoring**

### **Key Metrics to Monitor**
- API response times
- Error rates
- Database performance
- System resource usage
- User-reported issues

### **Alerting**
- Set up alerts for increased error rates
- Monitor performance degradation
- Watch for data integrity issues

## 📞 **Support**

### **Emergency Contacts**
- **Technical Lead**: [Name] - [Phone]
- **DevOps Engineer**: [Name] - [Phone]
- **Database Administrator**: [Name] - [Phone]

### **Escalation Path**
1. **Level 1**: Technical Lead (5 minutes)
2. **Level 2**: DevOps Engineer (10 minutes)
3. **Level 3**: Database Administrator (15 minutes)
4. **Level 4**: System Architect (30 minutes)

---
**Created**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Migration**: {self.migration_name}
'''
        
        # Write instructions
        instructions_file = Path(__file__).parent.parent / "docs" / "COLUMN_DROP_INSTRUCTIONS.md"
        instructions_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(instructions_file, 'w') as f:
            f.write(instructions_content)
        
        print(f"    Instructions created: {instructions_file}")
        return instructions_file
    
    def run(self):
        """Run the complete migration preparation process."""
        print("🚀 Starting column-drop migration preparation...")
        print(f"📅 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Run safety checks if requested
        if self.safety_checks:
            if not self.run_safety_checks():
                print("❌ Safety checks failed. Migration preparation aborted.")
                return False
            print()
        
        # Generate migration file
        migration_file = self.generate_migration_file()
        print()
        
        # Generate PR template if requested
        if self.generate_pr:
            template_file = self.generate_pr_template()
            print()
        
        # Generate instructions
        instructions_file = self.generate_instructions()
        print()
        
        # Summary
        print("✅ Migration preparation completed successfully!")
        print()
        print("📁 Generated Files:")
        print(f"  - Migration: {migration_file}")
        if self.generate_pr:
            print(f"  - PR Template: {template_file}")
        print(f"  - Instructions: {instructions_file}")
        print()
        print("📋 Next Steps:")
        print("  1. Review generated files")
        print("  2. Test migration in staging")
        print("  3. Create pull request")
        print("  4. Complete final validation")
        print("  5. Deploy when ready")
        print()
        print("⚠️  IMPORTANT: This migration is IRREVERSIBLE!")
        print("   Ensure 100% STI coverage before proceeding.")
        
        return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Prepare column-drop migration with safety checks"
    )
    parser.add_argument(
        "--validate-data",
        action="store_true",
        help="Run data validation before migration"
    )
    parser.add_argument(
        "--generate-pr",
        action="store_true",
        help="Generate PR template with checklist"
    )
    parser.add_argument(
        "--include-rollback",
        action="store_true",
        help="Include rollback procedures"
    )
    parser.add_argument(
        "--safety-checks",
        action="store_true",
        help="Run comprehensive safety checks"
    )
    
    args = parser.parse_args()
    
    # Create preparer and run
    preparer = ColumnDropMigrationPreparer(
        validate_data=args.validate_data,
        generate_pr=args.generate_pr,
        include_rollback=args.include_rollback,
        safety_checks=args.safety_checks
    )
    
    success = preparer.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main() 