# Jitsi Testing Guide

This guide will help you test the Jitsi video conferencing integration.

## Pre-Testing Checklist

- [x] Environment variables configured (`.env.local`)
  - [x] `NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc`
  - [x] `NEXT_PUBLIC_JITSI_APP_ID=your-app-id`
  - [x] `JITSI_PRIVATE_KEY` set (server-side only)
- [ ] Dev server running on port 3000
- [ ] Browser with camera/microphone access

## Testing Steps

### Step 1: Verify Dev Server is Running

```bash
# Check if server is running
curl http://localhost:3000 2>&1 | head -5

# Or check in browser
open http://localhost:3000
```

### Step 2: Test Configuration Loads

Open browser console (F12) and check:
- No errors about missing Jitsi configuration
- Environment variables are loaded (check Network tab for Jitsi API calls)

### Step 3: Create or Find a Test Session

You need an existing session to test. Options:

**Option A: Use existing session**
1. Log in to the dashboard
2. Navigate to Sessions page
3. Find a scheduled session

**Option B: Create a test session**
1. Log in as a patient
2. Go to Counselors page
3. Click "Book a Session"
4. Select a counselor
5. Choose date/time (can be in the past for testing)
6. Select "Video" session type
7. Complete booking

### Step 4: Join a Session

1. Navigate to `/dashboard/[role]/sessions`
2. Find a session with "Join Session" button
3. Click "Join Session"
4. You should see the pre-session lobby

### Step 5: Test Jitsi Integration

**Pre-Session Lobby Check:**
- [ ] Session details displayed
- [ ] Participant information shown
- [ ] Pre-session checklist visible
- [ ] "Join Session" button available

**Join Session:**
1. Click "Join Session" button
2. Browser should prompt for camera/microphone permissions
3. Allow access

**Jitsi Interface Check:**
- [ ] Jitsi interface loads (black background)
- [ ] Your video feed appears
- [ ] Audio/video controls visible
- [ ] Toolbar buttons present
- [ ] No error messages

**Functionality Test:**
- [ ] Toggle microphone (mute/unmute)
- [ ] Toggle camera (video on/off)
- [ ] Check participants list
- [ ] Test screen sharing (if needed)
- [ ] Test chat feature

### Step 6: Test with Second Participant (Optional)

1. Open a second browser window (or incognito)
2. Log in as a different user (patient/counselor)
3. Join the same session
4. Verify both participants can see each other
5. Test audio/video between participants

### Step 7: End Session

1. Click the hangup/end call button
2. Should return to post-session screen
3. Verify session completion

## Troubleshooting

### Issue: Jitsi interface doesn't load

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Environment variables are loaded
4. Jitsi API script loaded successfully

**Common errors:**
- `Failed to load Jitsi Meet API` - Check network, external API URL
- `Room not found` - Verify session exists, room name format
- `Unauthorized` - Check App ID configuration

### Issue: Camera/Microphone not working

**Solutions:**
1. Check browser permissions
2. Try different browser
3. Check device settings
4. Verify HTTPS (required for media access)

### Issue: Can't join session

**Check:**
1. Session status is "scheduled" or "in-progress"
2. User has permission to join (patient or counselor)
3. Room name is correctly formatted
4. Jitsi domain is accessible

## Browser Console Checks

Open browser console (F12) and look for:

**Success indicators:**
```
✅ Participant joined: {...}
✅ New participant joined: {...}
✅ Meeting room loaded
```

**Error indicators:**
```
❌ Failed to load Jitsi Meet API
❌ Room not found
❌ Invalid configuration
```

## Network Tab Checks

In browser DevTools Network tab, look for:

**Expected requests:**
- `external_api.js` - Should load from 8x8.vc
- WebSocket connections to Jitsi servers
- Media streams

**Failed requests:**
- 404 errors on external_api.js
- CORS errors
- SSL/TLS errors

## Quick Test Commands

```bash
# Test configuration script
cd apps/web
pnpm exec tsx scripts/test-jitsi-config.ts

# Check environment variables
cat .env.local | grep JITSI

# Verify dev server
curl -I http://localhost:3000
```

## Expected Behavior

### Successful Integration:
1. ✅ Jitsi interface loads within 5 seconds
2. ✅ Video/audio permissions requested
3. ✅ Local video feed visible
4. ✅ All controls functional
5. ✅ No console errors

### Room Name Format:
For JaaS, room names should be formatted as:
- Input: `session-abc123`
- Formatted: `{appId}/session-abc123`

### External API URL:
Should be:
```
https://8x8.vc/vpaas-magic-cookie-{appId}/external_api.js
```

## Next Steps After Testing

1. Test audio-only sessions
2. Test with multiple participants
3. Test on mobile devices
4. Test with poor network conditions
5. Test session recording (if enabled)
6. Test session end flow

## Reporting Issues

If you encounter issues, note:
- Browser and version
- Console errors (screenshot)
- Network errors (screenshot)
- Steps to reproduce
- Expected vs actual behavior

