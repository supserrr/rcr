# Testing Session Card Fixes

## Overview

This document provides a comprehensive testing guide for verifying that the session card patient details fixes are working correctly.

## Test Environment Setup

### Prerequisites
- Local development environment running with `npm run dev`
- Database seeded with test patients and counselors
- Browser Developer Tools (F12) available
- One counselor and at least one patient account to test

### Initial Setup
1. Start the development server: `npm run dev`
2. Log in as a counselor account
3. Ensure there are scheduled sessions with patients

## Test Cases

### Test 1: Sessions List Page - Patient Names Display

**File**: `/dashboard/counselor/sessions`

**Steps**:
1. Navigate to `/dashboard/counselor/sessions`
2. Click on the "Upcoming" tab
3. Observe the session cards

**Expected Results**:
- Each session card displays the patient's full name (not "Patient")
- Patient names appear in two locations:
  - Below the patient avatar icon
  - In the Session Card component

**Verification**:
- [ ] Patient names display correctly (not showing "Patient")
- [ ] Multiple patients show their correct names
- [ ] Names match the database records

**Browser Console Logs to Check**:
```
[PRIMARY] Fetching X patients from sessions: [...]
[PRIMARY] ✅ Fetched patient [ID]: "[PATIENT_NAME]"
[PRIMARY] Adding X patients to list
```

---

### Test 2: Sessions List Page - Patient Avatars Display

**File**: `/dashboard/counselor/sessions`

**Steps**:
1. Navigate to `/dashboard/counselor/sessions`
2. Observe the session cards
3. Look for patient profile pictures in the avatar area

**Expected Results**:
- Patient avatars display profile pictures (if available in database)
- Avatar fallback shows initials if no picture is available
- Avatars are properly normalized and rendered

**Verification**:
- [ ] Avatars display for patients with pictures
- [ ] Avatar fallbacks work (showing initials) for patients without pictures
- [ ] No broken image URLs or 404 errors

**Browser Console Logs to Check**:
```
[getPatientAvatar] ✅ Found avatar for [ID]: [NORMALIZED_URL]
```

---

### Test 3: Join Session Modal - Patient Details

**File**: `/dashboard/counselor/sessions/session/[sessionId]`

**Steps**:
1. Navigate to `/dashboard/counselor/sessions`
2. Click "Join Session" on an upcoming session
3. Observe the pre-session check modal

**Expected Results**:
- Patient name displays in the "Patient" field (not "Patient" placeholder)
- The modal shows:
  - Patient: [Actual Patient Name]
  - Date & Time: [Session Date and Time]
  - Duration: [Session Duration] minutes
  - Session Type: [video/audio/chat/in-person]

**Verification**:
- [ ] Patient name displays correctly (not "Patient")
- [ ] Patient identifier is the actual name, not fallback
- [ ] All other session details are correct

**Browser Console Logs to Check**:
```
[SessionRoom] Fetching X patients from sessions
[SessionRoom] ✅ Fetched patient [ID]: "[PATIENT_NAME]"
[SessionRoom] Created participant object with fullName: "[PATIENT_NAME]"
```

---

### Test 4: Fallback Behavior - Missing Patient Data

**File**: `/dashboard/counselor/sessions`

**Steps**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Manually delete a patient from the database (optional for testing)
3. Navigate to a session with a deleted/unavailable patient
4. Check console for fallback behavior

**Expected Results**:
- If patient data can't be fetched, shows "Patient" as fallback
- Console shows clear error messages and fallback attempts
- UI doesn't break even with missing data

**Verification**:
- [ ] Fallback mechanism works
- [ ] No JavaScript errors in console
- [ ] UI remains functional

**Browser Console Logs to Check**:
```
[FALLBACK] Fetching X missing patients
[FALLBACK] Query returned 0 profiles
[getPatientName] Returning default "Patient" for [ID]
```

---

### Test 5: Avatar Normalization

**File**: Any session page with avatars

**Steps**:
1. Open browser DevTools
2. Navigate to a session page
3. Inspect avatar URLs in Network tab or check console logs
4. Verify URLs are properly formatted

**Expected Results**:
- Avatar URLs are fully qualified (http/https)
- URLs point to valid Supabase storage paths
- Images load without 404 errors

**Verification**:
- [ ] Avatar URLs are properly formatted
- [ ] No 404 errors in Network tab for avatar images
- [ ] Avatar normalization is working correctly

---

### Test 6: Multiple Sessions Display

**File**: `/dashboard/counselor/sessions`

**Steps**:
1. Create multiple sessions with different patients
2. Navigate to `/dashboard/counselor/sessions`
3. Verify all sessions display correctly

**Expected Results**:
- Each session shows the correct patient name
- Each patient avatar is correct
- No mixing of names or avatars between sessions

**Verification**:
- [ ] All session cards display unique patient names
- [ ] Patient-name-avatar pairs are correctly matched
- [ ] No data leakage between sessions

---

### Test 7: Session Filtering - All Tabs

**File**: `/dashboard/counselor/sessions`

**Steps**:
1. Navigate to `/dashboard/counselor/sessions`
2. Check "Upcoming" tab
3. Check "Past" tab
4. Check "All" tab

**Expected Results**:
- Patient names and avatars display correctly in all tabs
- Tabs filter sessions but maintain data integrity
- No differences in data display between tabs

**Verification**:
- [ ] Upcoming tab shows correct patient details
- [ ] Past tab shows correct patient details
- [ ] All tab shows correct patient details

---

## Browser Console Inspection

### Good Logs Pattern
```
[PRIMARY] Fetching 2 patients from sessions: ["patient-id-1", "patient-id-2"]
[PRIMARY] ✅ Query returned 2 profiles
[PRIMARY] ✅ Fetched patient patient-id-1: "John Doe"
[PRIMARY] ✅ Fetched patient patient-id-2: "Jane Smith"
[PRIMARY] Adding 2 patients to list
[getPatientAvatar] ✅ Found avatar for patient-id-1: https://...
```

### Bad Logs Pattern (Indicates Issues)
```
[PRIMARY] Fetching 2 patients from sessions: ["patient-id-1", "patient-id-2"]
[PRIMARY] ❌ Error fetching patient profiles: ...
[PRIMARY] Attempting fallback query without role filter...
[FALLBACK] Query returned 0 profiles
[getPatientName] Returning default "Patient" for patient-id-1
```

---

## Performance Checklist

- [ ] Page loads within 2 seconds
- [ ] Session cards render quickly (< 100ms)
- [ ] No unnecessary re-renders or infinite loops
- [ ] Console shows no performance warnings

---

## Troubleshooting

### Issue: Still Seeing "Patient" Instead of Real Names

**Possible Causes**:
1. Patient data not populated in database
2. Profile query failing due to RLS policies
3. Cache not cleared

**Solutions**:
1. Check browser console for [PRIMARY] or [FALLBACK] logs
2. Verify database has patient records with `full_name` set
3. Clear browser cache: Ctrl+Shift+Delete
4. Check Supabase logs for query errors

### Issue: Avatars Not Displaying

**Possible Causes**:
1. `avatar_url` field missing from profiles
2. Avatar URLs not properly normalized
3. Supabase storage access issues

**Solutions**:
1. Check database: `SELECT id, avatar_url FROM profiles`
2. Check browser Network tab for 404s on avatar images
3. Verify Supabase storage bucket policies allow public access
4. Check console logs for `[getPatientAvatar]` entries

### Issue: Session Cards Not Loading

**Possible Causes**:
1. Sessions not fetched properly
2. Patient queries timeout
3. RLS policy denying access

**Solutions**:
1. Check useSessions hook logs
2. Verify Supabase project status
3. Check RLS policies on sessions and profiles tables

---

## Database Verification

### Check Patient Data
```sql
SELECT id, full_name, email, avatar_url, role 
FROM profiles 
WHERE role = 'patient' 
LIMIT 10;
```

Expected output: Patients should have `full_name` populated (not NULL).

### Check Session Data
```sql
SELECT id, patient_id, counselor_id, date, status 
FROM sessions 
LIMIT 10;
```

Expected output: Sessions should have valid `patient_id` references.

### Check Avatar URLs
```sql
SELECT id, full_name, avatar_url 
FROM profiles 
WHERE avatar_url IS NOT NULL 
LIMIT 5;
```

Expected output: Avatar URLs should be populated and valid paths.

---

## Sign-Off Checklist

Complete the following checklist to verify all fixes are working:

- [ ] Patient names display in session cards (not "Patient")
- [ ] Patient avatars display correctly
- [ ] Join Session modal shows real patient names
- [ ] Fallback behavior works when data is missing
- [ ] No console errors or warnings
- [ ] Multiple sessions display unique patient data
- [ ] All tabs (Upcoming, Past, All) work correctly
- [ ] Performance is acceptable
- [ ] Database verification successful
- [ ] No RLS policy violations

---

## Regression Testing

After applying fixes, verify existing functionality still works:

- [ ] Creating new sessions still works
- [ ] Rescheduling sessions still works
- [ ] Cancelling sessions still works
- [ ] Session list pagination still works
- [ ] Filtering by session type still works
- [ ] Joining a session launches Jitsi properly

---

## Final Notes

If all checklist items pass, the patient details loading fix is working correctly. If issues remain:

1. Check browser console for specific error messages
2. Review database records to ensure data is populated
3. Check Supabase project logs for query errors
4. Verify RLS policies allow appropriate access
5. Clear browser cache and local storage before retesting

