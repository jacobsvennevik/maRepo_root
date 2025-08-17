# STI (Study Type Identifier) Rollout Playbook

## Overview

This document outlines the operational procedures for rolling out the STI (Study Type Identifier) feature, which migrates from flat project models to a hybrid approach with subtype-specific tables.

## 🎯 Objectives

- Migrate existing flat projects to STI subtype rows
- Enable gradual rollout with feature flags
- Maintain backward compatibility throughout the process
- Provide clear rollback procedures
- Establish monitoring and observability

## 📋 Prerequisites

- [ ] STI hybrid models implemented and tested
- [ ] Backfill script (`scripts/backfill_sti.py`) created and tested
- [ ] Management command (`backfill_sti`) available
- [ ] CI pipeline updated with schemathesis contract testing
- [ ] Monitoring dashboards prepared
- [ ] DevOps team notified and available

## 🚀 Phase 1: Development Environment

### Timeline: D-7 to D-5

**Actions:**
1. Enable STI in development environment
   ```bash
   export ENABLE_STI=true
   ```

2. Run backfill dry-run to validate script
   ```bash
   python manage.py backfill_sti --chunk 1000 --dry-run
   ```

3. Verify API contract tests pass
   ```bash
   ENABLE_STI=true schemathesis run --checks all openapi_v2.yaml
   ```

**Success Criteria:**
- [ ] Dry-run completes without errors
- [ ] All existing tests pass with `ENABLE_STI=true`
- [ ] API contract tests pass
- [ ] No performance regressions detected

## 🧪 Phase 2: Staging Environment

### Timeline: D-4 to D-2

**Actions:**
1. Deploy to staging with STI disabled
   ```bash
   export ENABLE_STI=false
   ```

2. Run backfill dry-run on staging data
   ```bash
   python manage.py backfill_sti --chunk 1000 --dry-run
   ```

3. Analyze staging data characteristics
   ```sql
   -- Check project distribution
   SELECT project_type, COUNT(*) FROM projects_project GROUP BY project_type;
   
   -- Check existing STI structures
   SELECT COUNT(*) FROM projects_schoolproject;
   SELECT COUNT(*) FROM projects_selfstudyproject;
   ```

4. Enable STI in staging
   ```bash
   export ENABLE_STI=true
   ```

5. Run live backfill during off-peak hours
   ```bash
   python manage.py backfill_sti --chunk 2000
   ```

6. Verify data integrity
   ```bash
   # Check that all non-draft projects have STI structures
   python manage.py shell -c "
   from backend.apps.projects.models import Project
   total = Project.objects.filter(is_draft=False).count()
   with_sti = Project.objects.filter(
       is_draft=False
   ).exclude(
       school_project__isnull=True
   ).exclude(
       self_study_project__isnull=True
   ).count()
   print(f'Projects with STI: {with_sti}/{total}')
   "
   ```

**Success Criteria:**
- [ ] Dry-run shows expected project counts
- [ ] Live backfill completes successfully
- [ ] All projects have appropriate STI structures
- [ ] API endpoints work correctly
- [ ] Performance metrics remain stable

## 🌐 Phase 3: Production Rollout

### Timeline: D-1 to D+3

**Actions:**

#### D-1: Pre-deployment
1. Schedule maintenance window (if needed)
2. Notify stakeholders
3. Prepare rollback plan
4. Verify monitoring is active

#### D+0: Deployment
1. Deploy with STI disabled
   ```bash
   export ENABLE_STI=false
   ```

2. Run production dry-run
   ```bash
   python manage.py backfill_sti --chunk 1000 --dry-run
   ```

3. Enable STI for 5% of traffic (if using feature flags)
   ```bash
   export ENABLE_STI=true
   ```

#### D+1: Gradual Rollout
1. Monitor application performance
2. Check error rates and response times
3. Verify Prometheus metrics
4. Gradually increase STI-enabled traffic

#### D+2: Full Rollout
1. Enable STI for all traffic
   ```bash
   export ENABLE_STI=true
   ```

2. Run production backfill during off-peak hours
   ```bash
   python manage.py backfill_sti --chunk 2000
   ```

3. Monitor backfill progress
4. Verify data integrity

#### D+3: Validation
1. Run comprehensive data validation
2. Check API contract compliance
3. Verify frontend functionality
4. Monitor user feedback

**Success Criteria:**
- [ ] Zero downtime during deployment
- [ ] Backfill completes successfully
- [ ] All API endpoints respond correctly
- [ ] Performance metrics within acceptable ranges
- [ ] No user-reported issues

## 📊 Monitoring & Observability

### Key Metrics

#### Prometheus Metrics
```promql
# STI backfill progress
sti_backfill_processed_total{status="created", project_type="school"}
sti_backfill_processed_total{status="created", project_type="self_study"}
sti_backfill_processed_total{status="error"}

# API performance
http_request_duration_seconds{endpoint="/api/projects/"}
http_requests_total{status=~"5.."}

# Database performance
pg_stat_activity_count
pg_stat_database_tup_fetched
```

#### Grafana Dashboards
- **STI Backfill Progress**: Real-time backfill status
- **API Performance**: Response times and error rates
- **Database Health**: Query performance and connection counts
- **Application Health**: Overall system metrics

### Alerts

#### Critical Alerts (P0)
- STI backfill errors > 0
- API 5xx errors > 1%
- Database connection failures
- Application crashes

#### Warning Alerts (P1)
- API response time > 2s (95th percentile)
- STI backfill progress stalled
- High memory usage
- Slow database queries

## 🔄 Rollback Procedures

### Quick Rollback (Feature Flag)
If issues are detected during rollout:

```bash
# Disable STI immediately
export ENABLE_STI=false

# Restart application
sudo systemctl restart oceanlearn
```

### Data Rollback (If Needed)
If STI structures need to be removed:

```bash
# Create rollback script
python manage.py shell -c "
from backend.apps.projects.models import SchoolProject, SelfStudyProject
print(f'Removing {SchoolProject.objects.count()} SchoolProject records')
print(f'Removing {SelfStudyProject.objects.count()} SelfStudyProject records')
# SchoolProject.objects.all().delete()
# SelfStudyProject.objects.all().delete()
"
```

### Full Rollback (Emergency)
If complete rollback is needed:

1. Disable STI feature flag
2. Stop application
3. Restore database from backup (if necessary)
4. Redeploy previous version
5. Restart application

## 🧪 Testing Procedures

### Pre-rollout Testing
```bash
# Unit tests
python manage.py test backend.apps.projects.tests.test_hybrid_models

# API contract tests
ENABLE_STI=true schemathesis run --checks all openapi_v2.yaml

# Integration tests
python manage.py test backend.apps.projects.tests.test_api_django
```

### Post-rollout Validation
```bash
# Data integrity check
python manage.py shell -c "
from backend.apps.projects.models import Project
total = Project.objects.filter(is_draft=False).count()
with_sti = Project.objects.filter(
    is_draft=False
).exclude(
    school_project__isnull=True
).exclude(
    self_study_project__isnull=True
).count()
print(f'Data integrity: {with_sti}/{total} projects have STI structures')
"

# API validation
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/projects/ | jq '.[0]'
```

## 📞 Emergency Contacts

- **DevOps Lead**: [Contact Info]
- **Backend Lead**: [Contact Info]
- **Database Admin**: [Contact Info]
- **On-call Engineer**: [Contact Info]

## 📝 Post-Rollout Checklist

- [ ] All metrics within acceptable ranges
- [ ] No critical alerts active
- [ ] User feedback positive
- [ ] Documentation updated
- [ ] Team debrief completed
- [ ] Lessons learned documented
- [ ] Monitoring dashboards finalized

## 🔗 Related Documents

- [STI Migration Strategy](./MIGRATION_STRATEGY.md)
- [API Documentation](./backend_autogen.rst)
- [Database Schema](./directory_structure.txt)
- [Testing Strategy](./test_cleanup_simple.py)

---

**Last Updated**: [Date]
**Version**: 1.0
**Approved By**: [Names] 