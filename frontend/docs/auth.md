# Authentication Flow Documentation

## Overview

OceanLearn uses JWT (JSON Web Token) authentication with the following flow:

1. **Login**: User provides email/password → receives access + refresh tokens
2. **API Calls**: Access token automatically included in Authorization header
3. **Token Refresh**: Automatic refresh when access token expires
4. **Logout**: Tokens cleared from localStorage

## Components

### AuthService (`/app/(auth)/services/auth.ts`)
- Handles login/logout operations
- Manages token storage in localStorage
- Provides token refresh functionality

### Axios Instance (`/lib/axios.ts`)
- Automatically adds Authorization header to all requests
- Handles 401 responses with automatic token refresh
- Redirects to login on authentication failure

### useAuth Hook (`/hooks/useAuth.ts`)
- Provides authentication state management
- Handles authentication checks in components
- Provides logout functionality

## Protected Routes

The following routes require authentication:
- `/projects/*`
- `/dashboard/*`
- `/active-project/*`

## Development

### Quick Login
In development mode, a "Quick Login (Dev)" button appears in the top-right corner for easy testing with:
- Email: `test@example.com`
- Password: `testpass123`

### Test Users
Available test users in the database:
- `test@example.com` / `testpass123`
- `user0@example.com`
- `jacob.svennevik@gmail.com`

## Implementation Details

### Token Storage
- Access token: `localStorage.getItem("authToken")`
- Refresh token: `localStorage.getItem("refreshToken")`

### Automatic Token Refresh
When a 401 response is received:
1. Attempt to refresh using refresh token
2. Update access token in localStorage
3. Retry original request
4. If refresh fails, redirect to login

### Error Handling
- Network errors: Show user-friendly messages
- Authentication errors: Redirect to login
- Server errors: Display error details

## Security Considerations

- Tokens stored in localStorage (vulnerable to XSS)
- Consider HttpOnly cookies for production
- Implement CSRF protection
- Add Content Security Policy headers 