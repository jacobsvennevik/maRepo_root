# STI Rollout - Phase 7: Staging Validation & Production Prep

## 🎯 Phase 7 Objectives

**Goal**: Prove the migration path in staging and prepare for production flag-flip.

**Timeline**: D+1 to D+7 (after Phase 6 merge)

## 📋 Phase 7 Task List

### 1. Staging Environment Setup ✅

**Prerequisites:**
- [x] Backfill utility merged to develop
- [x] Rollout documentation completed
- [x] Schemathesis CI step integrated

**Deployment Steps:**
```bash
# 1. Deploy latest backend to staging
git checkout develop
git pull origin develop

# 2. Deploy with STI enabled
export ENABLE_STI=true
python manage.py migrate
python manage.py collectstatic --noinput

# 3. Restart staging services
sudo systemctl restart oceanlearn-staging
sudo systemctl restart celery-staging
```

### 2. Staging Dry-Run Validation 🔍

**Objective**: Validate backfill script behavior on staging data without making changes.

**Commands:**
```bash
# Run dry-run with larger chunk size for staging
python manage.py backfill_sti --chunk 2000 --dry-run

# Alternative: Run with smaller chunks for detailed monitoring
python manage.py backfill_sti --chunk 500 --dry-run --verbose
```

**Expected Output Analysis:**
```bash
# Check staging data characteristics first
python manage.py shell -c "
from backend.apps.projects.models import Project
total = Project.objects.filter(is_draft=False).count()
school = Project.objects.filter(project_type='school', is_draft=False).count()
self_study = Project.objects.filter(project_type='self_study', is_draft=False).count()
print(f'Total non-draft projects: {total}')
print(f'School projects: {school}')
print(f'Self-study projects: {self_study}')
"
```

**Success Criteria:**
- [ ] Dry-run completes without errors
- [ ] Project counts match expectations
- [ ] No unexpected project types or data issues
- [ ] Performance acceptable (should complete within 5 minutes)

**Reporting:**
- Post log excerpt to #sti-rollout
- Include Prometheus metric `sti_backfill_processed_total`
- Document any warnings or unexpected behavior

### 3. Live Backfill in Staging 🚀

**Prerequisites:**
- [ ] Dry-run completed successfully
- [ ] Staging team notified
- [ ] Monitoring dashboards active
- [ ] Rollback plan ready

**Execution:**
```bash
# Run live backfill during off-peak hours (recommended: 2-4 AM)
python manage.py backfill_sti --chunk 2000

# Monitor progress
tail -f /var/log/oceanlearn/backfill.log
```

**Real-time Monitoring:**
```bash
# Check Prometheus metrics
curl -s "http://staging-prometheus:9090/api/v1/query?query=sti_backfill_processed_total"

# Monitor application performance
curl -s "http://staging-prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])"
```

**Validation Steps:**
```bash
# 1. Verify STI structure creation
python manage.py shell -c "
from backend.apps.projects.models import Project, SchoolProject, SelfStudyProject
total_projects = Project.objects.filter(is_draft=False).count()
school_sti = SchoolProject.objects.count()
self_study_sti = SelfStudyProject.objects.count()
print(f'Total projects: {total_projects}')
print(f'SchoolProject records: {school_sti}')
print(f'SelfStudyProject records: {self_study_sti}')
print(f'Coverage: {(school_sti + self_study_sti) / total_projects * 100:.1f}%')
"

# 2. Verify data integrity
python manage.py shell -c "
from backend.apps.projects.models import Project
issues = []
for project in Project.objects.filter(is_draft=False):
    if project.project_type == 'school' and not hasattr(project, 'school_project_data'):
        issues.append(f'Missing SchoolProject for {project.id}')
    elif project.project_type == 'self_study' and not hasattr(project, 'self_study_project_data'):
        issues.append(f'Missing SelfStudyProject for {project.id}')
print(f'Data integrity issues: {len(issues)}')
for issue in issues[:10]:  # Show first 10
    print(f'  - {issue}')
"
```

### 4. Observability & Monitoring 📊

**Grafana Dashboard Setup:**

**Panel 1: STI Backfill Progress**
```promql
# Backfill rate
rate(sti_backfill_processed_total[5m])

# Total processed
sti_backfill_processed_total

# By status and type
sti_backfill_processed_total{status="created", project_type="school"}
sti_backfill_processed_total{status="created", project_type="self_study"}
sti_backfill_processed_total{status="error"}
```

**Panel 2: API Performance**
```promql
# 5xx error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Response time 95th percentile
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Projects API specific
rate(http_requests_total{endpoint="/api/projects/", status=~"5.."}[5m])
```

**Panel 3: Database Performance**
```promql
# Database connections
pg_stat_activity_count

# Query performance
rate(pg_stat_database_tup_fetched[5m])
```

**Alerts Configuration:**
```yaml
# Alert: API 5xx > 1% sustained 5 min
- alert: HighAPIErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High API error rate detected"
    description: "API 5xx error rate is {{ $value | humanizePercentage }}"

# Alert: STI backfill stalled
- alert: STIBackfillStalled
  expr: rate(sti_backfill_processed_total[10m]) == 0
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "STI backfill appears to be stalled"
    description: "No projects processed in the last 10 minutes"

# Alert: Database performance degradation
- alert: DatabaseSlowQueries
  expr: rate(pg_stat_database_tup_fetched[5m]) < 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Database performance degradation detected"
    description: "Database query rate is {{ $value }} queries/sec"
```

### 5. Column-Drop Migration Preparation 🔧

**Objective**: Prepare migration to remove obsolete legacy columns after production rollout.

**Branch Creation:**
```bash
git checkout -b feature/sti-column-drop-migration
```

**Migration File Creation:**
```bash
python manage.py makemigrations projects --empty --name remove_legacy_sti_columns
```

**Migration Content:**
```python
# migrations/XXXX_remove_legacy_sti_columns.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('projects', 'XXXX_previous_migration'),
    ]

    operations = [
        # Remove legacy columns after STI rollout is complete
        migrations.RemoveField(
            model_name='project',
            name='course_name',
        ),
        migrations.RemoveField(
            model_name='project',
            name='course_code',
        ),
        migrations.RemoveField(
            model_name='project',
            name='teacher_name',
        ),
        migrations.RemoveField(
            model_name='project',
            name='goal_description',
        ),
        migrations.RemoveField(
            model_name='project',
            name='study_frequency',
        ),
    ]
```

**Safety Checks:**
```python
# Add to migration
def check_sti_coverage(apps, schema_editor):
    """Ensure all projects have STI structures before removing legacy columns."""
    Project = apps.get_model('projects', 'Project')
    SchoolProject = apps.get_model('projects', 'SchoolProject')
    SelfStudyProject = apps.get_model('projects', 'SelfStudyProject')
    
    total_projects = Project.objects.filter(is_draft=False).count()
    school_sti = SchoolProject.objects.count()
    self_study_sti = SelfStudyProject.objects.count()
    
    if (school_sti + self_study_sti) < total_projects:
        raise ValueError(
            f"STI coverage incomplete: {school_sti + self_study_sti}/{total_projects} "
            f"projects have STI structures. Cannot remove legacy columns."
        )

def reverse_check(apps, schema_editor):
    """No-op reverse check."""
    pass

# Add to operations
migrations.RunPython(check_sti_coverage, reverse_check),
```

**PR Creation:**
- Mark as "Do Not Merge"
- Add label: `sti-column-drop`
- Include rollback instructions
- Document dependency on production STI rollout completion

### 6. Production Preparation Checklist 📋

**Infrastructure:**
- [ ] Production monitoring dashboards configured
- [ ] Alerting rules tested in staging
- [ ] Rollback procedures documented and tested
- [ ] Database backup procedures verified
- [ ] Team on-call schedule updated

**Application:**
- [ ] Feature flag configuration ready
- [ ] API contract tests passing in CI
- [ ] Performance baselines established
- [ ] Load testing completed (if applicable)
- [ ] Frontend compatibility verified

**Operational:**
- [ ] Rollout timeline finalized
- [ ] Stakeholder communication plan ready
- [ ] Support team trained on new procedures
- [ ] Documentation updated for production
- [ ] Emergency contacts confirmed

## 🔒 Definition of Done

### Phase 7 Completion Criteria:
- [ ] **Staging Validation**: All staging rows back-filled successfully
- [ ] **Dual-Write Verification**: Both legacy and STI structures working correctly
- [ ] **Performance Validation**: No significant performance degradation
- [ ] **Monitoring Active**: Prometheus & Grafana dashboards live and functional
- [ ] **Alerting Configured**: All alerts tested and working
- [ ] **Migration Prepared**: Column-drop migration PR created (Do Not Merge)
- [ ] **Documentation Updated**: Production rollout procedures finalized
- [ ] **Team Ready**: Operations team trained and prepared

### Success Metrics:
- **Data Integrity**: 100% of non-draft projects have appropriate STI structures
- **Performance**: API response times within 10% of baseline
- **Error Rate**: 5xx errors < 0.1% sustained
- **Coverage**: STI backfill processes all eligible projects
- **Monitoring**: All key metrics visible and alerting functional

## 🚨 Risk Mitigation

### High-Risk Scenarios:
1. **Backfill fails mid-process**
   - **Mitigation**: Resumable script, rollback procedures
   
2. **Performance degradation**
   - **Mitigation**: Monitoring, feature flag rollback
   
3. **Data corruption**
   - **Mitigation**: Dry-run validation, backup procedures
   
4. **Monitoring failure**
   - **Mitigation**: Multiple monitoring layers, manual checks

### Rollback Triggers:
- API 5xx error rate > 1% for 5+ minutes
- STI backfill error rate > 5%
- Database performance degradation > 20%
- User-reported issues (immediate)

## 📅 Timeline

| Day | Task | Owner | Status |
|-----|------|-------|--------|
| D+1 | Staging deployment | DevOps | ⏳ |
| D+2 | Dry-run execution | Backend | ⏳ |
| D+3 | Dry-run analysis | Backend | ⏳ |
| D+4 | Live backfill | Backend | ⏳ |
| D+5 | Validation & monitoring | Backend + DevOps | ⏳ |
| D+6 | Column-drop migration prep | Backend | ⏳ |
| D+7 | Production prep completion | All | ⏳ |

## 📞 Communication Plan

### Stakeholder Updates:
- **Daily**: Progress updates to #sti-rollout
- **Milestone**: Completion notifications to stakeholders
- **Issues**: Immediate escalation to on-call team

### Documentation Updates:
- Update `docs/sti_rollout.md` with staging results
- Create production deployment checklist
- Update monitoring runbooks

---

**Phase 7 Status**: 🚀 READY TO START  
**Next Phase**: Production Rollout  
**Last Updated**: 2025-07-27  
**Team**: Backend + DevOps 