# Frontend-Backend Integration Test

This document explains how to test the connection between the frontend and backend components of the project.

## Overview

The integration test verifies that:
- ✅ Frontend can communicate with the backend API
- ✅ Authentication flow works correctly 
- ✅ Project CRUD operations function properly
- ✅ File upload functionality is working
- ✅ Data persistence and retrieval is successful

## Test Methods

### 1. Command Line Integration Test (Comprehensive)

**Location**: `test_frontend_backend_integration.py`

This is a comprehensive Python script that tests all API endpoints directly.

#### Prerequisites:
1. Backend server running on `localhost:8000`
2. Virtual environment activated
3. Required Python packages installed

#### Running the test:
```bash
# Make the script executable (already done)
chmod +x run_integration_test.sh

# Run the integration test
./run_integration_test.sh
```

#### What it tests:
- Backend server health check
- JWT authentication flow
- Project listing (GET /api/projects/)
- Project creation (POST /api/projects/)
- Project retrieval (GET /api/projects/{id}/)
- Project updates (PATCH /api/projects/{id}/)
- File uploads (POST /api/projects/{id}/upload_file/)
- Project deletion (DELETE /api/projects/{id}/)

### 2. Frontend Visual Test (Interactive)

**Location**: `frontend/src/app/test-connection/page.tsx`

This is a React component that provides a visual interface for testing the connection.

#### Access:
Navigate to: `http://localhost:3000/test-connection`

#### Features:
- Real-time test execution with visual feedback
- Status indicators for each test
- Error messages and duration tracking
- Live display of projects from the database
- User-friendly interface

## Expected Results

### ✅ Successful Test Output:
```
🚀 Frontend-Backend Integration Test Suite
============================================================
[HH:MM:SS] 🔧 Setting up test environment...
[HH:MM:SS] ✅ Created new test user
[HH:MM:SS] 🔐 Authenticating...
[HH:MM:SS] ✅ Authentication successful
[HH:MM:SS] 📋 Testing project list endpoint...
[HH:MM:SS] ✅ Project list retrieved successfully. Found X projects
[HH:MM:SS] 🏫 Testing school project creation...
[HH:MM:SS] ✅ School project created successfully: Integration Test - Advanced Computer Science (ID: xxx)
[HH:MM:SS] ✅ Project data verification passed
[HH:MM:SS] 📚 Testing self-study project creation...
[HH:MM:SS] ✅ Self-study project created successfully: Integration Test - Machine Learning Mastery (ID: xxx)
[HH:MM:SS] ✅ Project data verification passed
[HH:MM:SS] 🔍 Testing project retrieval for ID: xxx
[HH:MM:SS] ✅ Project retrieved successfully: Integration Test - Advanced Computer Science
[HH:MM:SS] ✏️ Testing project update for ID: xxx
[HH:MM:SS] ✅ Project updated successfully: Updated Integration Test Project
[HH:MM:SS] 📁 Testing file upload for project ID: xxx
[HH:MM:SS] ✅ File uploaded successfully: test_file.txt
[HH:MM:SS] 🗑️ Testing project deletion for ID: xxx
[HH:MM:SS] ✅ Project deleted successfully

============================================================
🏁 Test Suite Summary:
============================================================
Setup: ✅ PASS
Api Health: ✅ PASS
Authentication: ✅ PASS
Project List: ✅ PASS
Create School Project: ✅ PASS
Create Self Study Project: ✅ PASS
Retrieve Project: ✅ PASS
Update Project: ✅ PASS
File Upload: ✅ PASS
Delete Project: ✅ PASS

Overall Result: 10/10 tests passed
🎉 ALL TESTS PASSED! Frontend and Backend are properly connected.
```

## Troubleshooting

### Common Issues:

#### 1. "Backend server is not running"
**Solution**: Start the Django development server:
```bash
cd backend
python manage.py runserver
```

#### 2. "Authentication failed"
**Solution**: 
- Ensure the test user exists in the database
- Check if JWT authentication is configured properly
- Run: `python manage.py createsuperuser` to create an admin user

#### 3. "Connection refused"
**Solution**:
- Verify backend is running on `localhost:8000`
- Check firewall settings
- Ensure no other service is using port 8000

#### 4. "CORS errors in frontend test"
**Solution**:
- Verify CORS settings in Django settings
- Check `ALLOWED_HOSTS` configuration
- Ensure frontend is running on `localhost:3000`

### Manual Verification

You can also manually verify the connection by:

1. **API Browser**: Visit `http://localhost:8000/api/projects/` in your browser
2. **Django Admin**: Visit `http://localhost:8000/admin/` and check projects
3. **Frontend**: Visit `http://localhost:3000/projects` and see if projects load

## Files Created/Modified

- `test_frontend_backend_integration.py` - Main test script
- `run_integration_test.sh` - Test runner script
- `frontend/src/app/test-connection/page.tsx` - Visual test interface
- `FRONTEND_BACKEND_INTEGRATION_TEST.md` - This documentation

## API Endpoints Tested

The test covers these key endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects/` | List all projects |
| POST | `/api/projects/` | Create new project |
| GET | `/api/projects/{id}/` | Retrieve specific project |
| PATCH | `/api/projects/{id}/` | Update project |
| DELETE | `/api/projects/{id}/` | Delete project |
| POST | `/api/projects/{id}/upload_file/` | Upload file |
| POST | `/api/token/` | Authenticate user |

## Success Criteria

The frontend and backend are successfully connected when:
- ✅ All integration tests pass
- ✅ Projects can be created via frontend
- ✅ Projects appear in the backend database
- ✅ Files can be uploaded through the frontend
- ✅ Authentication flow works end-to-end

## Next Steps

After confirming the connection works:
1. Deploy to staging/production environments
2. Set up automated testing in CI/CD pipeline
3. Monitor API performance and error rates
4. Implement additional features with confidence
