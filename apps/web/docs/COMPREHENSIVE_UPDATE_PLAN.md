# Comprehensive Component Update Plan

Complete plan for migrating all components from dummy data to real API services.

## Overview

This document provides a systematic approach to updating all frontend components to use real backend API services instead of dummy/mock data.

## Status Summary

- ✅ **Infrastructure**: 100% Complete
- ✅ **Patient Sessions Page**: 100% Updated
- ✅ **SessionCard Component**: 100% Updated
- ⏳ **Remaining Components**: 0% Updated

---

## Phase 1: Core Features (Priority 1)

### 1.1 Sessions Management

#### ✅ Completed
- [x] Patient Sessions Page (`app/dashboard/patient/sessions/page.tsx`)
- [x] SessionCard Component (`components/dashboard/shared/SessionCard.tsx`)

#### 🔄 In Progress
- [ ] Counselor Sessions Page (`app/dashboard/counselor/sessions/page.tsx`)

**Update Steps:**
1. Replace `dummySessions` with `useSessions` hook
2. Replace `dummyCounselors` with real user data from `useAuth`
3. Replace `dummyPatients` with API call to fetch patients
4. Update handlers:
   - `handleConfirmReschedule` → Use `rescheduleSession` from hook
   - `handleConfirmCancel` → Use `cancelSession` from hook
   - `handleConfirmSchedule` → Use `createSession` from hook
5. Add loading states
6. Add error handling
7. Add toast notifications

**Estimated Time:** 30 minutes

#### ⏳ Pending
- [ ] Patient Session Detail Page (`app/dashboard/patient/sessions/session/[sessionId]/page.tsx`)
- [ ] Counselor Session Detail Page (`app/dashboard/counselor/sessions/session/[sessionId]/page.tsx`)

**Update Steps:**
1. Replace `dummySessions.find()` with `SessionsApi.getSession(sessionId)`
2. Replace dummy user lookups with real user data
3. Update Jitsi integration to use real API
4. Add loading and error states

**Estimated Time:** 20 minutes each

---

### 1.2 Chat & Messaging

#### ⏳ Pending
- [ ] Patient Chat Page (`app/dashboard/patient/chat/page.tsx`)
- [ ] Counselor Chat Page (`app/dashboard/counselor/chat/page.tsx`)
- [ ] ChatThreadsSidebar Component (`components/dashboard/shared/ChatThreadsSidebar.tsx`)

**Update Steps:**
1. Replace `dummyChats` with `useChat` hook
2. Replace `dummyMessages` with messages from hook
3. Add Socket.IO integration:
   - Listen for `newMessage` events
   - Listen for `messagesRead` events
   - Emit `joinChat` when chat selected
   - Emit `leaveChat` when chat deselected
4. Update send message handler:
   - Use `sendMessage` from hook
   - Show typing indicator via Socket.IO
5. Update message read handling:
   - Use `markMessagesRead` from hook
   - Listen for read confirmations
6. Replace dummy user lookups with real user data
7. Add loading states
8. Add error handling
9. Add real-time connection status indicator

**Estimated Time:** 45 minutes each page

---

### 1.3 Resources

#### ⏳ Pending
- [ ] Patient Resources Page (`app/dashboard/patient/resources/page.tsx`)
- [ ] Counselor Resources Page (`app/dashboard/counselor/resources/page.tsx`)
- [ ] ResourceCard Component (`components/dashboard/shared/ResourceCard.tsx`)

**Update Steps:**
1. Replace `dummyResources` with `useResources` hook
2. Update filtering to use API query parameters
3. Update resource creation:
   - Use `createResource` or `createResourceWithFile` from hook
4. Update resource viewing:
   - Use `ResourcesApi.trackView(resourceId)`
5. Update resource download:
   - Use `ResourcesApi.getDownloadUrl(resourceId)`
6. Add loading states
7. Add error handling
8. Add toast notifications

**Estimated Time:** 30 minutes each page

---

## Phase 2: Dashboard Pages (Priority 2)

### 2.1 Patient Dashboard

#### ⏳ Pending
- [ ] Patient Dashboard (`app/dashboard/patient/page.tsx`)

**Update Steps:**
1. Replace `dummySessions` with `useSessions` hook
2. Replace `dummyMessages` with `useChat` hook (for recent messages)
3. Replace `dummyResources` with `useResources` hook (for recommended)
4. Replace `dummyCounselors` with API call (for quick booking)
5. Update stats to use real data:
   - Upcoming sessions count
   - Recent messages count
   - Recommended resources
6. Add loading states
7. Add error handling

**Estimated Time:** 40 minutes

---

### 2.2 Counselor Dashboard

#### ⏳ Pending
- [ ] Counselor Dashboard (`app/dashboard/counselor/page.tsx`)

**Update Steps:**
1. Replace `dummySessions` with `useSessions` hook
2. Replace `dummyPatients` with API call (for assigned patients)
3. Replace `dummyMessages` with `useChat` hook
4. Replace `dummyChats` with `useChat` hook
5. Update stats to use real data
6. Add loading states
7. Add error handling

**Estimated Time:** 40 minutes

---

### 2.3 Admin Dashboard

#### ⏳ Pending
- [ ] Admin Dashboard (`app/dashboard/admin/page.tsx`)

**Update Steps:**
1. Use `AdminApi.getAnalytics()` for dashboard stats
2. Replace dummy data with real analytics
3. Add loading states
4. Add error handling
5. Add date range filters for analytics

**Estimated Time:** 30 minutes

---

## Phase 3: User Management (Priority 2)

### 3.1 Patient Features

#### ⏳ Pending
- [ ] Patient Counselors Page (`app/dashboard/patient/counselors/page.tsx`)

**Update Steps:**
1. Replace `dummyCounselors` with API call to list counselors
2. Update counselor selection to use real IDs
3. Update booking flow to use real counselor data
4. Add loading states
5. Add error handling

**Estimated Time:** 25 minutes

---

### 3.2 Counselor Features

#### ⏳ Pending
- [ ] Counselor Patients Page (`app/dashboard/counselor/patients/page.tsx`)

**Update Steps:**
1. Replace `dummyPatients` with API call to list assigned patients
2. Update patient selection to use real IDs
3. Add loading states
4. Add error handling

**Estimated Time:** 25 minutes

---

## Phase 4: Settings & Support (Priority 3)

### 4.1 Settings Pages

#### ⏳ Pending
- [ ] Patient Settings Page (`app/dashboard/patient/settings/page.tsx`)
- [ ] Counselor Settings Page (`app/dashboard/counselor/settings/page.tsx`)

**Update Steps:**
1. Replace `dummyPatients`/`dummyCounselors` with `useAuth` user data
2. Replace `dummySupportTickets` with API call (if support tickets API exists)
3. Update profile editing to use `AuthApi.updateProfile()`
4. Update password change to use `AuthApi.changePassword()`
5. Add loading states
6. Add error handling
7. Add toast notifications

**Estimated Time:** 30 minutes each

---

### 4.2 Admin Features

#### ⏳ Pending
- [ ] Admin Users Page (`app/dashboard/admin/users/page.tsx`)
- [ ] Admin Approvals Page (`app/dashboard/admin/approvals/page.tsx`)
- [ ] Admin Support Page (`app/dashboard/admin/support/page.tsx`)
- [ ] Admin Systems Page (`app/dashboard/admin/systems/page.tsx`)
- [ ] Admin Resources Review (`app/dashboard/admin/resources-review/page.tsx`)
- [ ] Admin Training Resources (`app/dashboard/admin/training-resources/page.tsx`)

**Update Steps:**
1. Use `AdminApi.listUsers()` for users page
2. Use `AdminApi.getAnalytics()` for stats
3. Replace dummy data with real API calls
4. Add admin-specific API calls where needed
5. Add loading states
6. Add error handling

**Estimated Time:** 20-30 minutes each

---

## Phase 5: Additional Features (Priority 4)

### 5.1 Session Modals

#### ⏳ Pending
- [ ] SessionBookingModal (`components/session/SessionBookingModal.tsx`)
- [ ] RescheduleModal (`components/session/RescheduleModal.tsx`)
- [ ] CancelSessionModal (`components/session/CancelSessionModal.tsx`)
- [ ] CounselorRescheduleModal (`components/session/CounselorRescheduleModal.tsx`)
- [ ] ScheduleSessionModal (`components/session/ScheduleSessionModal.tsx`)

**Update Steps:**
1. Update to accept API functions as props (from hooks)
2. Remove internal dummy data manipulation
3. Add loading states during API calls
4. Add error handling
5. Add success/error callbacks

**Estimated Time:** 15 minutes each

---

### 5.2 Training Resources

#### ⏳ Pending
- [ ] Counselor Training Page (`app/dashboard/counselor/training/page.tsx`)
- [ ] Admin Training Resources (`app/dashboard/admin/training-resources/page.tsx`)

**Update Steps:**
1. Replace `dummyTrainingResources` with API call
2. Add filtering and search
3. Add loading states
4. Add error handling

**Estimated Time:** 30 minutes each

---

## Migration Patterns

### Pattern 1: List Pages

**Before:**
```typescript
import { dummySessions } from '@/lib/dummy-data';
const sessions = dummySessions.filter(...);
```

**After:**
```typescript
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/components/auth/AuthProvider';

const { user } = useAuth();
const { sessions, loading, error } = useSessions({
  patientId: user?.id,
});
```

### Pattern 2: Detail Pages

**Before:**
```typescript
const session = dummySessions.find(s => s.id === sessionId);
```

**After:**
```typescript
import { SessionsApi } from '@/lib/api/sessions';

const [session, setSession] = useState<Session | null>(null);
useEffect(() => {
  SessionsApi.getSession(sessionId).then(setSession);
}, [sessionId]);
```

### Pattern 3: Mutations

**Before:**
```typescript
dummySessions[index] = { ...dummySessions[index], status: 'cancelled' };
```

**After:**
```typescript
const { cancelSession, refreshSessions } = useSessions();

await cancelSession(sessionId, { reason });
await refreshSessions(); // Auto-updates the list
```

### Pattern 4: Real-time Features

**Before:**
```typescript
const messages = dummyMessages;
```

**After:**
```typescript
import { useChat } from '@/hooks/useChat';

const { messages, sendMessage, socketConnected } = useChat();
// Messages update automatically via Socket.IO
```

---

## Component Checklist Template

For each component update:

- [ ] Remove dummy data imports
- [ ] Add appropriate hook/API import
- [ ] Replace data source with hook/API call
- [ ] Add loading state
- [ ] Add error state
- [ ] Update handlers to use API functions
- [ ] Add toast notifications
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test API calls
- [ ] Test real-time features (if applicable)
- [ ] Verify types are correct
- [ ] Check for linting errors

---

## Priority Order

### Week 1: Core Features
1. ✅ Patient Sessions Page
2. ✅ SessionCard Component
3. 🔄 Counselor Sessions Page
4. Patient Chat Page
5. Counselor Chat Page
6. Patient Resources Page
7. Counselor Resources Page

### Week 2: Dashboards & User Management
8. Patient Dashboard
9. Counselor Dashboard
10. Admin Dashboard
11. Patient Counselors Page
12. Counselor Patients Page

### Week 3: Settings & Admin
13. Patient Settings
14. Counselor Settings
15. Admin Users Page
16. Admin Approvals Page
17. Admin Support Page

### Week 4: Additional Features
18. Session Detail Pages
19. Session Modals
20. Training Resources Pages
21. Admin Systems Page
22. Admin Resources Review

---

## Testing Strategy

### After Each Component Update

1. **Manual Testing**
   - Load the page
   - Verify data loads correctly
   - Test create/update/delete operations
   - Test error scenarios
   - Test loading states

2. **Integration Testing**
   - Test with real backend
   - Verify API calls in Network tab
   - Check for CORS errors
   - Verify Socket.IO connections

3. **User Flow Testing**
   - Test complete user journeys
   - Verify data persistence
   - Test real-time updates

---

## Common Issues & Solutions

### Issue: Type Mismatches

**Problem:** API types don't match component types

**Solution:**
- Create adapter functions
- Update component types
- Use type assertions carefully

### Issue: Date Formatting

**Problem:** API returns date strings, components expect Date objects

**Solution:**
- Parse dates in component: `new Date(dateString)`
- Use date-fns format() for display
- Handle timezone correctly

### Issue: Socket.IO Not Connecting

**Problem:** Real-time features not working

**Solution:**
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Verify backend Socket.IO is running
- Check browser console for errors
- Verify token is sent in auth

### Issue: User Data Missing

**Problem:** Components can't find user/counselor/patient data

**Solution:**
- Use `useAuth` hook for current user
- Create API calls to fetch other users
- Cache user data appropriately

---

## Progress Tracking

### Completed (2/22)
- ✅ Patient Sessions Page
- ✅ SessionCard Component

### In Progress (1/22)
- 🔄 Counselor Sessions Page

### Remaining (19/22)
- Patient Chat Page
- Counselor Chat Page
- Patient Resources Page
- Counselor Resources Page
- Patient Dashboard
- Counselor Dashboard
- Admin Dashboard
- Patient Counselors Page
- Counselor Patients Page
- Patient Settings
- Counselor Settings
- Admin Users Page
- Admin Approvals Page
- Admin Support Page
- Session Detail Pages (2)
- Session Modals (5)
- Training Resources Pages (2)
- Admin Systems Page
- Admin Resources Review

---

## Estimated Total Time

- **Phase 1 (Core)**: 4-5 hours
- **Phase 2 (Dashboards)**: 2 hours
- **Phase 3 (User Management)**: 1 hour
- **Phase 4 (Settings & Admin)**: 4-5 hours
- **Phase 5 (Additional)**: 2-3 hours

**Total:** ~13-16 hours

---

## Next Steps

1. **Start with Counselor Sessions Page** (similar to Patient Sessions)
2. **Then update Chat Pages** (add real-time features)
3. **Then update Resource Pages** (straightforward)
4. **Continue through dashboards** (aggregate data)
5. **Finish with admin pages** (if needed)

---

## Resources

- **API Services Documentation**: `docs/API_SERVICES.md`
- **Component Integration Guide**: `docs/COMPONENT_INTEGRATION_GUIDE.md`
- **Hooks Documentation**: See `hooks/` directory
- **Example Update**: `app/dashboard/patient/sessions/page.tsx`

