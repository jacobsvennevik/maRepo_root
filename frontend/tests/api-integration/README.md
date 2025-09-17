# API Integration Tests

These tests are specifically designed to identify and fix the API errors you've been experiencing.

## What These Tests Do

### 🔍 **Error Detection**
- Capture and analyze API errors in real-time
- Identify double-slash URL construction issues
- Detect authentication problems
- Monitor network connectivity issues

### 🛠 **URL Validation**
- Test all endpoint URL construction
- Verify no leading slashes cause double-slash issues
- Validate full URL formation with base URLs
- Check specific problematic endpoints that were failing

### 📊 **Error Reporting**
- Log detailed error information including:
  - Full URLs being constructed
  - HTTP methods and status codes
  - Error messages and stack traces
  - Base URL + endpoint combinations

## Test Files

### `flashcards.test.ts`
Tests flashcard API endpoints that were returning 404 errors:
- `/projects/{id}/flashcard-sets/` (the main failing endpoint)
- Individual flashcard operations
- Due flashcards retrieval
- URL construction validation

### `quiz-center.test.ts`
Tests Quiz Center API endpoints:
- Quiz CRUD operations
- Quiz session management
- Quiz analytics
- Template-based quiz generation

### `projects.test.ts`
Tests project management API endpoints:
- Project CRUD operations
- File upload/download
- Study materials management
- Cleanup operations

## Running the Tests

```bash
# Run all API integration tests
npm test -- --testPathPattern="api-integration"

# Run specific test file
npm test -- --testPathPattern="flashcards.test"

# Run with detailed logging
npm test -- --testPathPattern="api-integration" --verbose
```

## Expected Behavior

In the test environment (no backend running):
- ✅ **Network errors are expected** (no actual server)
- ❌ **Double-slash URLs should NOT occur**
- ❌ **URL construction errors should NOT occur**

## What to Look For

### 🟢 **Good Signs**
- Tests pass with "Network Error" messages
- URLs are constructed correctly
- No double slashes in error logs

### 🔴 **Bad Signs**
- Double-slash URLs like `http://localhost:8000/api//projects/`
- URL construction failures
- Unexpected error patterns

## Common Issues These Tests Catch

1. **Double Slash Problem**: 
   - Wrong: `axiosApi.get('/projects/123/flashcard-sets/')`
   - Right: `axiosApi.get('projects/123/flashcard-sets/')`

2. **Base URL Issues**:
   - Base URL: `http://localhost:8000/api/`
   - Endpoint: `projects/123/flashcard-sets/`
   - Result: `http://localhost:8000/api/projects/123/flashcard-sets/` ✅

3. **Axios Instance Configuration**:
   - Verify `axiosApi` and `axiosGeneration` have correct base URLs
   - Check interceptor behavior

## Debugging Tips

1. **Check Console Output**: Tests log detailed URL information
2. **Look for Double Slashes**: Search for `//` in error messages
3. **Verify Base URLs**: Confirm axios instances are configured correctly
4. **Test Network Calls**: Use browser dev tools to see actual requests
