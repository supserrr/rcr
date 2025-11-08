# Testing Frontend-Backend Integration

Guide for testing the integration between frontend and backend.

## Prerequisites

1. **Backend Running**
   ```bash
   cd backend
   npm run dev
   ```
   Backend should be running on `http://localhost:5000`

2. **Environment Variables**
   Create `.env.local` in `apps/web/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. **Frontend Dependencies**
   ```bash
   cd apps/web
   pnpm install
   ```

## Quick Test

Run the integration test script:

```bash
cd apps/web
pnpm run test:integration
```

This tests:
- Health endpoint connectivity
- API root endpoint
- Authentication endpoints existence

## Manual Testing

### 1. Test Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"UP","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. Test API Root

```bash
curl http://localhost:5000/api
```

Expected response:
```json
{
  "message": "Welcome to the Rwanda Cancer Relief Backend API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "sessions": "/api/sessions",
    ...
  }
}
```

### 3. Test Authentication

#### Sign Up

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "patient",
    "fullName": "Test User"
  }'
```

Expected: User created with tokens returned

#### Sign In

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Expected: Tokens returned

#### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: User profile returned

### 4. Test Frontend Connection

1. **Start Frontend**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open Browser**
   Navigate to `http://localhost:3000`

3. **Test Sign In**
   - Go to `/signin`
   - Enter credentials
   - Should redirect to dashboard

4. **Check Browser Console**
   - No CORS errors
   - No network errors
   - API calls successful

## Testing Checklist

### Authentication
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Token stored in localStorage
- [ ] Token sent with API requests
- [ ] 401 errors redirect to sign in
- [ ] Protected routes redirect unauthenticated users

### Sessions
- [ ] List sessions works
- [ ] Create session works
- [ ] Update session works
- [ ] Reschedule session works
- [ ] Cancel session works
- [ ] Complete session works
- [ ] Get Jitsi room config works

### Chat
- [ ] List chats works
- [ ] Create chat works
- [ ] Send message works
- [ ] Get messages works
- [ ] Socket.IO connects
- [ ] Real-time messages received
- [ ] Mark messages as read works

### Resources
- [ ] List resources works
- [ ] Create resource works
- [ ] Update resource works
- [ ] Delete resource works
- [ ] File upload works
- [ ] Download URL works

### Notifications
- [ ] List notifications works
- [ ] Mark as read works
- [ ] Socket.IO notifications received

## Common Issues

### CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches
- Restart backend after changes

### Connection Refused

**Symptom:** Cannot connect to backend

**Solution:**
- Verify backend is running: `curl http://localhost:5000/health`
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Ensure no firewall blocking port 5000

### 401 Unauthorized

**Symptom:** All requests return 401

**Solution:**
- Check token in localStorage
- Verify token is sent in Authorization header
- Try signing in again
- Check backend logs for auth errors

### Socket.IO Not Connecting

**Symptom:** Real-time features not working

**Solution:**
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Verify Socket.IO server is running (backend)
- Check browser console for Socket.IO errors
- Verify token is sent in Socket.IO auth

## Debugging

### Enable API Logging

In browser console:
```javascript
// Log all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args);
  return originalFetch.apply(this, args);
};
```

### Check Socket.IO Connection

In browser console:
```javascript
// Check Socket.IO connection
import { getSocket } from '@/lib/socket/client';
const socket = getSocket();
console.log('Socket connected:', socket?.connected);
socket?.on('connect', () => console.log('Connected!'));
socket?.on('disconnect', () => console.log('Disconnected!'));
```

### Verify Environment Variables

```bash
# In frontend directory
cd apps/web
cat .env.local
```

Should show:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Next Steps After Testing

Once integration is verified:

1. Update components to use hooks (see `COMPONENT_INTEGRATION_GUIDE.md`)
2. Add error boundaries
3. Add loading states
4. Add toast notifications
5. Test end-to-end user flows

