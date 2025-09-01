# Project Files Page

A minimal, functional page for listing and uploading files to a specific project.

## Features

- **File List**: Displays all files uploaded to the project
- **File Upload**: Simple file picker with progress indicator
- **Real-time Updates**: Automatically refreshes after successful uploads
- **Error Handling**: Shows inline error messages for failed operations
- **Accessibility**: Keyboard accessible with proper ARIA labels

## API Endpoints

### Get Project Files
```
GET /api/projects/{project_id}/
```
Returns project data including `uploaded_files` array.

### Upload File
```
POST /api/projects/{project_id}/upload_file/
```
Multipart form data with `file` field.

## Configuration

### Environment Variables

The page automatically uses the configured `BASE_API_URL` from your axios instance:

```typescript
// In lib/axios.ts
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000'  // Django development server
  : env.NEXT_PUBLIC_API_URL; // Production URL
```

### Authentication

The page uses the existing axios instance which automatically:
- Includes JWT tokens in Authorization headers
- Handles token refresh on 401 responses
- Redirects to login on authentication failure

### CSRF Protection

CSRF tokens are automatically handled by Django's middleware. The axios instance includes the necessary headers for authenticated requests.

## File Types Supported

The file input accepts common document and media formats:
- Documents: `.pdf`, `.docx`, `.pptx`, `.txt`, `.md`
- Images: `.png`, `.jpg`, `.jpeg`
- Data: `.csv`
- Archives: `.zip`
- Media: `.mp4`

## Implementation Details

### State Management
- `project`: Current project data with files
- `loading`: API request state
- `uploading`: File upload state
- `uploadProgress`: Upload progress percentage
- `error`: API error messages
- `uploadError`: Upload-specific error messages

### File Upload Flow
1. User selects file via file picker
2. File is uploaded via multipart POST
3. Progress bar shows upload status
4. On success, project data is refreshed
5. New file appears in the list

### Error Handling
- Network errors show inline messages
- Upload failures display specific error details
- Failed API calls show retry buttons
- All errors are logged to console for debugging

## Styling

The page uses a minimal, clean design with:
- Tailwind CSS for styling
- Existing UI components from `@/components/ui`
- Responsive layout that works on all screen sizes
- Consistent spacing and typography

## Accessibility Features

- Proper heading hierarchy (h1 for page title)
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly file information
- Loading states with appropriate messaging

## Future Enhancements

- Drag and drop file upload
- File size validation
- File type filtering
- Bulk file operations
- File preview capabilities
- Advanced search and filtering
