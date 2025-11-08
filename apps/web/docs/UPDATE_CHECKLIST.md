# Component Update Checklist

Quick reference checklist for updating each component.

## Quick Checklist Per Component

### Pre-Update
- [ ] Identify dummy data imports
- [ ] Identify which API service/hook to use
- [ ] Check component types match API types
- [ ] Review existing handlers

### During Update
- [ ] Remove dummy data imports
- [ ] Add hook/API imports
- [ ] Replace data source
- [ ] Update handlers to use API functions
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add toast notifications
- [ ] Update types if needed

### Post-Update
- [ ] Test component loads
- [ ] Test API calls work
- [ ] Test error handling
- [ ] Test loading states
- [ ] Check for linting errors
- [ ] Verify types are correct
- [ ] Test real-time features (if applicable)

---

## Component-Specific Checklists

### Sessions Pages

**Files:**
- `app/dashboard/patient/sessions/page.tsx` ✅
- `app/dashboard/counselor/sessions/page.tsx` ⏳
- `app/dashboard/patient/sessions/session/[sessionId]/page.tsx` ⏳
- `app/dashboard/counselor/sessions/session/[sessionId]/page.tsx` ⏳

**Checklist:**
- [ ] Replace `dummySessions` with `useSessions` hook
- [ ] Replace `dummyCounselors` with real user data
- [ ] Replace `dummyPatients` with real user data
- [ ] Update `createSession` handler
- [ ] Update `rescheduleSession` handler
- [ ] Update `cancelSession` handler
- [ ] Update `completeSession` handler (if applicable)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add toast notifications
- [ ] Test Jitsi integration (for detail pages)

---

### Chat Pages

**Files:**
- `app/dashboard/patient/chat/page.tsx` ⏳
- `app/dashboard/counselor/chat/page.tsx` ⏳
- `components/dashboard/shared/ChatThreadsSidebar.tsx` ⏳

**Checklist:**
- [ ] Replace `dummyChats` with `useChat` hook
- [ ] Replace `dummyMessages` with messages from hook
- [ ] Add Socket.IO integration
- [ ] Listen for `newMessage` events
- [ ] Listen for `messagesRead` events
- [ ] Emit `joinChat` when chat selected
- [ ] Emit `leaveChat` when chat deselected
- [ ] Update send message handler
- [ ] Add typing indicator (Socket.IO)
- [ ] Update mark as read handler
- [ ] Add connection status indicator
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test real-time message delivery

---

### Resources Pages

**Files:**
- `app/dashboard/patient/resources/page.tsx` ⏳
- `app/dashboard/counselor/resources/page.tsx` ⏳
- `components/dashboard/shared/ResourceCard.tsx` ⏳

**Checklist:**
- [ ] Replace `dummyResources` with `useResources` hook
- [ ] Update filtering to use API query parameters
- [ ] Update resource creation handler
- [ ] Update resource viewing handler (track views)
- [ ] Update resource download handler
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add toast notifications
- [ ] Test file uploads (if applicable)

---

### Dashboard Pages

**Files:**
- `app/dashboard/patient/page.tsx` ⏳
- `app/dashboard/counselor/page.tsx` ⏳
- `app/dashboard/admin/page.tsx` ⏳

**Checklist:**
- [ ] Replace all dummy data with hooks/API calls
- [ ] Update stats to use real data
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test data aggregation

---

### User Management Pages

**Files:**
- `app/dashboard/patient/counselors/page.tsx` ⏳
- `app/dashboard/counselor/patients/page.tsx` ⏳

**Checklist:**
- [ ] Replace dummy users with API calls
- [ ] Update selection handlers
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test user lookup

---

### Settings Pages

**Files:**
- `app/dashboard/patient/settings/page.tsx` ⏳
- `app/dashboard/counselor/settings/page.tsx` ⏳

**Checklist:**
- [ ] Replace dummy user data with `useAuth`
- [ ] Update profile editing to use `AuthApi.updateProfile()`
- [ ] Update password change to use `AuthApi.changePassword()`
- [ ] Replace support tickets (if applicable)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add toast notifications
- [ ] Test profile updates
- [ ] Test password changes

---

### Admin Pages

**Files:**
- `app/dashboard/admin/users/page.tsx` ⏳
- `app/dashboard/admin/approvals/page.tsx` ⏳
- `app/dashboard/admin/support/page.tsx` ⏳
- `app/dashboard/admin/systems/page.tsx` ⏳
- `app/dashboard/admin/resources-review/page.tsx` ⏳
- `app/dashboard/admin/training-resources/page.tsx` ⏳

**Checklist:**
- [ ] Use `AdminApi` for admin operations
- [ ] Use `AdminApi.getAnalytics()` for stats
- [ ] Replace dummy data with API calls
- [ ] Add admin-specific API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test admin permissions

---

### Session Modals

**Files:**
- `components/session/SessionBookingModal.tsx` ⏳
- `components/session/RescheduleModal.tsx` ⏳
- `components/session/CancelSessionModal.tsx` ⏳
- `components/session/CounselorRescheduleModal.tsx` ⏳
- `components/session/ScheduleSessionModal.tsx` ⏳

**Checklist:**
- [ ] Update to accept API functions as props
- [ ] Remove internal dummy data manipulation
- [ ] Add loading states during API calls
- [ ] Add error handling
- [ ] Add success/error callbacks
- [ ] Test modal interactions

---

## Testing Checklist (After Updates)

### Basic Functionality
- [ ] Component loads without errors
- [ ] Data displays correctly
- [ ] Loading states show appropriately
- [ ] Error states handle gracefully

### API Operations
- [ ] Create operations work
- [ ] Read operations work
- [ ] Update operations work
- [ ] Delete operations work

### Real-time Features
- [ ] Socket.IO connects
- [ ] Real-time updates received
- [ ] Connection status shown
- [ ] Reconnection works

### User Experience
- [ ] Toast notifications show
- [ ] Loading indicators appear
- [ ] Error messages are clear
- [ ] Success feedback provided

---

## Common Patterns

### Loading State Pattern

```typescript
if (loading) {
  return <LoadingSpinner />;
}
```

### Error State Pattern

```typescript
if (error) {
  return <ErrorMessage message={error} />;
}
```

### Toast Notification Pattern

```typescript
try {
  await apiCall();
  toast.success('Operation successful!');
} catch (error) {
  toast.error(error instanceof Error ? error.message : 'Operation failed');
}
```

---

## Quick Reference

### Hooks Available
- `useSessions()` - Session management
- `useChat()` - Chat with real-time
- `useResources()` - Resource management
- `useSocket()` - Socket.IO integration
- `useAuth()` - Authentication

### API Services Available
- `AuthApi` - Authentication
- `SessionsApi` - Sessions
- `ChatApi` - Chat
- `ResourcesApi` - Resources
- `NotificationsApi` - Notifications
- `AdminApi` - Admin operations

### Documentation
- See `docs/API_SERVICES.md` for API reference
- See `docs/COMPONENT_INTEGRATION_GUIDE.md` for examples
- See `app/dashboard/patient/sessions/page.tsx` for reference implementation

