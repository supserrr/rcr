# Testing Guide - Rwanda Cancer Relief

## Overview

This guide covers testing the complete frontend-backend integration after all TypeScript errors have been fixed.

## Prerequisites

✅ All TypeScript errors fixed (0 errors)
✅ All components updated to use real API data
✅ Backend server running on port 5000
✅ Frontend environment variables configured

## Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

If backend is not running:
```bash
cd backend
npm run dev
```

## Step 2: Verify Frontend Environment

Check that `.env.local` exists in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Step 3: Start Frontend

```bash
cd apps/web
pnpm dev
```

Frontend should start on `http://localhost:3000`

## Step 4: Test Core Features

### Authentication Flow

1. **Sign Up**
   - Navigate to `/signup/patient` or `/signup/counselor`
   - Fill out the form
   - Submit and verify user is created
   - Check backend logs for API calls

2. **Sign In**
   - Navigate to `/signin`
   - Enter credentials
   - Verify redirect to dashboard
   - Check that JWT token is stored

3. **Profile Update**
   - Navigate to `/dashboard/patient/settings` or `/dashboard/counselor/settings`
   - Update profile information
   - Verify changes are saved to backend

### Sessions

1. **Create Session** (Patient)
   - Navigate to `/dashboard/patient/sessions`
   - Click "Book Session"
   - Fill out session details
   - Verify session appears in list
   - Check backend database

2. **Reschedule Session** (Counselor)
   - Navigate to `/dashboard/counselor/sessions`
   - Click "Reschedule" on a session
   - Update date/time
   - Verify changes are saved

3. **Cancel Session**
   - Click "Cancel" on a session
   - Provide cancellation reason
   - Verify session status updates

### Chat & Messaging

1. **Send Message**
   - Navigate to `/dashboard/patient/chat` or `/dashboard/counselor/chat`
   - Select a chat or create new one
   - Send a message
   - Verify message appears in real-time (Socket.IO)
   - Check backend logs for Socket.IO events

2. **Real-time Updates**
   - Open chat in two browser windows
   - Send message from one window
   - Verify it appears in the other window instantly

### Resources

1. **View Resources** (Patient)
   - Navigate to `/dashboard/patient/resources`
   - Verify resources load from backend
   - Click on a resource to view
   - Test download functionality

2. **Manage Resources** (Counselor)
   - Navigate to `/dashboard/counselor/resources`
   - Create a new resource
   - Edit an existing resource
   - Delete a resource
   - Verify all changes persist

### AI Chat

1. **Patient AI Chat**
   - Navigate to `/dashboard/patient/ai-chat`
   - Send a message
   - Verify AI response is received
   - Check that messages are displayed correctly

2. **Counselor AI Chat**
   - Navigate to `/dashboard/counselor/ai-chat`
   - Test AI responses
   - Verify chat history works

## Step 5: Test Error Handling

1. **Network Errors**
   - Stop backend server
   - Try to perform an action
   - Verify error messages are displayed
   - Verify app doesn't crash

2. **Invalid Data**
   - Try to submit forms with invalid data
   - Verify validation errors are shown
   - Verify backend validation works

3. **Unauthorized Access**
   - Try to access protected routes without auth
   - Verify redirect to signin
   - Verify API calls return 401

## Step 6: Test Real-time Features

1. **Socket.IO Connection**
   - Check browser console for Socket.IO connection status
   - Verify connection indicator shows "Connected"
   - Test reconnection after network interruption

2. **Real-time Notifications**
   - Trigger an event (e.g., new message, session update)
   - Verify notification appears in real-time
   - Check Socket.IO events in browser console

## Step 7: Performance Testing

1. **Page Load Times**
   - Check initial page load
   - Verify lazy loading works
   - Check for any slow API calls

2. **Memory Leaks**
   - Navigate between pages multiple times
   - Check browser memory usage
   - Verify no memory leaks

## Step 8: Browser Compatibility

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Common Issues & Solutions

### Backend Not Responding
- Check if backend is running: `curl http://localhost:5000/health`
- Check backend logs for errors
- Verify port 5000 is not blocked

### Frontend Can't Connect to Backend
- Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check CORS settings in backend
- Verify backend is accessible from frontend

### Socket.IO Not Connecting
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Check backend Socket.IO configuration
- Verify Socket.IO server is running

### TypeScript Errors
- Run `pnpm typecheck` to see all errors
- Fix any remaining type issues
- Verify all imports are correct

## Next Steps After Testing

1. **Fix Any Bugs Found**
   - Document issues
   - Create fixes
   - Re-test

2. **Performance Optimization**
   - Optimize slow API calls
   - Add caching where appropriate
   - Optimize bundle size

3. **Production Preparation**
   - Set up production environment variables
   - Configure production API URLs
   - Set up monitoring and logging
   - Prepare deployment

## Success Criteria

✅ All authentication flows work
✅ All CRUD operations work
✅ Real-time features work (Socket.IO)
✅ Error handling works correctly
✅ No console errors
✅ No runtime errors
✅ All pages load correctly
✅ All API calls succeed

