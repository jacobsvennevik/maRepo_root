# Cleanup Mechanisms for Draft Projects

This document outlines the cleanup mechanisms implemented to prevent performance degradation and memory leaks when users repeatedly start and abandon draft projects.

## 🚨 Problem Solved

The application was experiencing performance degradation when users:
1. Started multiple draft projects
2. Abandoned them without completion
3. Created new drafts repeatedly

This caused:
- **localStorage accumulation** from auto-save data
- **Memory leaks** from file objects and component state
- **Backend database bloat** from abandoned draft projects
- **Component state persistence** without cleanup

## 🧹 Cleanup Mechanisms Implemented

### 1. Frontend localStorage Cleanup

**Location**: `frontend/src/app/projects/create/utils/cleanup-utils.ts`

**Functions**:
- `cleanupLocalStorage()` - Removes all project creation localStorage keys
- `cleanupOnAbandon()` - Immediate cleanup when users abandon projects
- `performComprehensiveCleanup()` - Full cleanup before starting new projects

**Keys Cleaned**:
- `project-setup-guided-setup`
- `self-study-guided-setup`

### 2. Component Unmount Cleanup

**Location**: 
- `frontend/src/app/projects/create/components/guided-setup.tsx`
- `frontend/src/app/projects/create-self-study/components/guided-setup.tsx`

**Implementation**:
```typescript
useEffect(() => {
  return () => {
    clearStorage();
    console.log('🧹 Cleaned up localStorage on unmount');
  };
}, [clearStorage]);
```

### 3. Navigation Cleanup

**Location**: All project creation pages

**Implementation**:
- Cleanup triggered when users start new projects
- Cleanup when navigating away from creation flows
- Cleanup after successful project creation

### 4. Backend Draft Cleanup

**Location**: `backend/apps/projects/views.py`

**API Endpoint**: `POST /api/projects/cleanup_drafts/`

**Management Command**: `python manage.py cleanup_drafts`

**Features**:
- User-specific cleanup (only cleans current user's drafts)
- Configurable time threshold (default: 24 hours)
- Dry-run mode for testing
- Comprehensive logging

### 5. Scheduled Cleanup Script

**Location**: `backend/cleanup_drafts.py`

**Usage**:
```bash
# Manual cleanup
python cleanup_drafts.py

# Custom time threshold
python cleanup_drafts.py --hours 12

# Dry run (no actual deletion)
python cleanup_drafts.py --dry-run
```

**Cron Example**:
```bash
# Run every 6 hours
0 */6 * * * cd /path/to/backend && python cleanup_drafts.py
```

## 🔄 Cleanup Triggers

### Automatic Triggers
1. **Component Unmount**: When users navigate away from creation flows
2. **New Project Start**: Before starting any new project creation
3. **Successful Creation**: After project is successfully created
4. **Scheduled Backend**: Periodic cleanup of abandoned drafts

### Manual Triggers
1. **Navigation Back**: When users go back to project selection
2. **Abandon Detection**: When users leave creation flow without completion

## 📊 Performance Impact

### Before Cleanup
- ❌ localStorage accumulated indefinitely
- ❌ File objects leaked memory
- ❌ Backend drafts accumulated
- ❌ Component state persisted
- ❌ Progressive performance degradation

### After Cleanup
- ✅ localStorage cleaned on unmount
- ✅ File references cleared
- ✅ Backend drafts cleaned up
- ✅ Component state reset
- ✅ Consistent performance

## 🛠️ Usage Examples

### Frontend Cleanup
```typescript
import { performComprehensiveCleanup } from './utils/cleanup-utils';

// Before starting new project
await performComprehensiveCleanup();

// When abandoning project
cleanupOnAbandon();
```

### Backend Cleanup
```bash
# Manual cleanup
python manage.py cleanup_drafts

# Scheduled cleanup (add to crontab)
0 */6 * * * cd /path/to/backend && python cleanup_drafts.py
```

### API Cleanup
```bash
curl -X POST http://localhost:8000/api/projects/cleanup_drafts/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hours": 24}'
```

## 🔍 Monitoring

### Console Logs
All cleanup operations log to console with 🧹 emoji:
```
🧹 Cleaned up guided-setup localStorage on unmount
🧹 Cleaned up all project creation localStorage
🧹 Backend cleanup result: {deleted_count: 5}
🧹 Comprehensive cleanup completed
```

### Backend Logs
Django logs cleanup operations:
```
INFO: User 123 cleaning up 5 abandoned draft projects older than 24 hours
INFO: User 123 successfully deleted 5 abandoned draft projects
```

## 🚀 Benefits

1. **Performance**: Consistent app performance regardless of usage patterns
2. **Memory**: No memory leaks from abandoned drafts
3. **Storage**: localStorage doesn't accumulate indefinitely
4. **Database**: Backend stays clean and performant
5. **User Experience**: Smooth performance even with multiple abandoned drafts

## 🔧 Maintenance

### Regular Tasks
1. Monitor cleanup logs for any issues
2. Adjust cleanup frequency if needed
3. Review cleanup thresholds based on usage patterns

### Troubleshooting
1. Check console logs for cleanup errors
2. Verify backend cleanup command works
3. Monitor localStorage usage in browser dev tools
4. Check database for abandoned draft accumulation

## 📝 Future Enhancements

1. **Analytics**: Track cleanup frequency and impact
2. **User Notifications**: Inform users about abandoned drafts
3. **Recovery**: Allow users to recover recently abandoned drafts
4. **Smart Cleanup**: AI-powered detection of truly abandoned vs. in-progress drafts

## 🧪 Testing

### Frontend Tests
**Location**: `frontend/src/app/projects/create/utils/__tests__/cleanup-utils.test.ts`

**Test Coverage**:
- localStorage cleanup functionality
- Race condition protection
- Error handling
- Upload cleanup
- Quota management

**Running Tests**:
```bash
npm test cleanup-utils.test.ts
```

### Component Integration Tests
**Location**: `frontend/src/app/projects/create/components/__tests__/guided-setup-cleanup.test.tsx`

**Test Coverage**:
- Component unmount cleanup
- Navigation cleanup
- State reset functionality
- localStorage integration
- Error handling

**Running Tests**:
```bash
npm test guided-setup-cleanup.test.tsx
```

### Backend Tests
**Location**: `backend/apps/projects/tests/test_cleanup.py`

**Test Coverage**:
- Management command functionality
- API endpoint behavior
- Idempotency
- User isolation
- Metrics tracking
- Concurrent request handling

**Running Tests**:
```bash
python manage.py test apps.projects.tests.test_cleanup
```

### Test Style Consistency
All tests follow the project's established patterns:
- Use shared test utilities (`createLocalStorageMock`, `createUploadTestSetup`)
- Mock external dependencies consistently
- Follow the same describe/it structure
- Use the same assertion patterns
- Include proper setup/teardown

## ⚠️ Risk Mitigations

### Race Conditions
- **Problem**: Multiple tabs/windows could trigger cleanup simultaneously
- **Solution**: Sequential cleanup execution with queue system
- **Implementation**: `executeCleanupSafely()` function with operation queuing

### localStorage Quota
- **Problem**: Browsers have ~5MB localStorage limit
- **Solution**: Quota checking before writes
- **Implementation**: `checkLocalStorageQuota()` with 4MB safe threshold

### File Upload Memory Leaks
- **Problem**: In-flight uploads not aborted on cleanup
- **Solution**: AbortController registration and cleanup
- **Implementation**: `registerUpload()` and `abortInFlightUploads()`

### Backend Performance
- **Problem**: No index on draft status and update time
- **Solution**: Database index for cleanup queries
- **Implementation**: `idx_project_draft_status_updated` index

### Idempotency
- **Problem**: Multiple cleanup calls could cause issues
- **Solution**: Cache-based operation deduplication
- **Implementation**: User-specific cache keys with 5-minute timeout

### Auth & Security
- **Problem**: Cleanup could affect other users' data
- **Solution**: User-specific cleanup with proper auth
- **Implementation**: `get_queryset()` filtering by current user

## 📋 Quick Checklist Before Merge

- [x] UNIQUE constraint or locking to enforce ≤ 1 active draft per user
- [x] DB index on status, updated_at
- [x] AbortController cleanup for in-flight uploads
- [x] Unit tests for cleanup_drafts management command
- [x] Frontend integration tests for cleanup utilities
- [x] Component tests for cleanup integration
- [x] Race condition protection implemented
- [x] localStorage quota guards added
- [x] Idempotency ensured
- [x] Auth rules enforced
- [x] Metrics tracking implemented
- [x] Error handling comprehensive
- [x] Documentation complete 