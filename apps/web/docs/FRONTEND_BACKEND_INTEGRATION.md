# Frontend-Backend Integration Guide

This guide explains how to connect the frontend to the backend API.

## Setup

### 1. Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. API Client

The API client is located at `lib/api/client.ts` and provides:

- Automatic token management
- Request/response interceptors
- Error handling
- Type-safe API calls

### 3. Authentication

The authentication service at `lib/api/auth.ts` connects to the backend:

- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `PATCH /api/auth/profile` - Update profile

## Usage

### Authentication

```typescript
import { AuthService } from '@/lib/auth';

// Sign in
const { user, token } = await AuthService.signIn({
  email: 'user@example.com',
  password: 'password123',
});

// Sign up
const { user, token } = await AuthService.signUp({
  name: 'John Doe',
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  role: 'patient',
  agreeToTerms: true,
});

// Sign out
await AuthService.signOut();

// Get current user
const user = await AuthService.getCurrentUser();
```

### API Calls

```typescript
import { api } from '@/lib/api/client';

// GET request
const data = await api.get('/api/sessions');

// POST request
const result = await api.post('/api/sessions', {
  date: '2024-01-01',
  time: '10:00',
  type: 'video',
});

// PATCH request
const updated = await api.patch('/api/sessions/123', {
  status: 'completed',
});

// DELETE request
await api.delete('/api/sessions/123');

// File upload
const uploaded = await api.upload('/api/resources', file, {
  title: 'Resource Title',
  description: 'Description',
});
```

## Error Handling

The API client automatically handles:

- 401 Unauthorized - Redirects to sign in
- Network errors - Throws `ApiError`
- Response parsing - Handles JSON and text responses

```typescript
import { ApiError } from '@/lib/api/client';

try {
  const data = await api.get('/api/sessions');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
  }
}
```

## Token Management

Tokens are automatically stored in localStorage:

- `auth-token` - Access token
- `refresh-token` - Refresh token

The API client automatically:
- Adds tokens to requests
- Refreshes tokens on 401 errors
- Clears tokens on sign out

## Next Steps

1. Create API services for other resources (sessions, resources, chat, etc.)
2. Set up Socket.IO client for real-time features
3. Update components to use real API services
4. Add error handling and loading states
5. Test the integration

