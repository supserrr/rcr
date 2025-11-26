# Quick Jitsi Test Checklist

## ✅ Configuration Status
- [x] Environment variables set in `.env.local`
- [x] Dev server running on port 3000
- [x] App ID: `2ec2e4abf2874096ba00d895b9672444`
- [x] Domain: `8x8.vc`

## 🧪 Testing Steps

### 1. Open Application
```bash
# Server should be running at:
open http://localhost:3000
```

### 2. Login & Navigate
1. Log in as patient or counselor
2. Go to Sessions page: `/dashboard/[role]/sessions`

### 3. Find or Create Session
- If you have existing sessions: Click "Join Session" on any scheduled session
- If no sessions: Create one via "Book a Session"

### 4. Join Session
1. Click "Join Session" button
2. Check pre-session lobby appears
3. Click "Join Session" in lobby
4. **Allow camera/microphone permissions when prompted**

### 5. Verify Jitsi Loads
- [ ] Jitsi interface appears (black screen)
- [ ] Your video feed visible
- [ ] Controls toolbar visible
- [ ] No error messages

### 6. Test Controls
- [ ] Microphone mute/unmute
- [ ] Camera on/off
- [ ] Participant list
- [ ] Chat (if available)

### 7. Check Browser Console
Open DevTools (F12) and verify:
- ✅ No red errors
- ✅ "Participant joined" messages
- ✅ Jitsi API loaded successfully

## 🔍 What to Look For

### ✅ Success Indicators
- Jitsi interface loads smoothly
- Video/audio permissions work
- Room connects successfully
- No console errors

### ❌ Error Indicators
- "Failed to load Jitsi Meet API" error
- "Room not found" error
- Blank screen with error message
- Console errors about configuration

## 📝 Room Name Format

Expected format for JaaS:
- Base room: `session-abc123`
- Formatted: `2ec2e4abf2874096ba00d895b9672444/session-abc123`

## 🌐 Expected External API URL

Should load from:
```
https://8x8.vc/vpaas-magic-cookie-2ec2e4abf2874096ba00d895b9672444/external_api.js
```

## 🚀 Ready to Test!

1. Open: http://localhost:3000
2. Login
3. Navigate to Sessions
4. Join a session
5. Report any issues!

