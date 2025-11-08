# Component Integration Guide

Guide for updating components to use real API services.

## Overview

All API services and React hooks are ready. Components need to be updated to use them instead of dummy data.

## React Hooks Available

### 1. `useSessions` Hook

**Location:** `hooks/useSessions.ts`

**Usage:**
```typescript
import { useSessions } from '@/hooks/useSessions';

function SessionsPage() {
  const { sessions, loading, error, createSession, rescheduleSession, cancelSession } = useSessions({
    patientId: user?.id,
    status: 'scheduled',
  });

  // Use sessions, loading, error states
  // Call createSession, rescheduleSession, cancelSession as needed
}
```

### 2. `useChat` Hook

**Location:** `hooks/useChat.ts`

**Usage:**
```typescript
import { useChat } from '@/hooks/useChat';

function ChatPage() {
  const { chats, messages, currentChat, loading, sendMessage, selectChat, socketConnected } = useChat();

  // Real-time messages via Socket.IO
  // socketConnected indicates Socket.IO connection status
}
```

### 3. `useResources` Hook

**Location:** `hooks/useResources.ts`

**Usage:**
```typescript
import { useResources } from '@/hooks/useResources';

function ResourcesPage() {
  const { resources, loading, error, createResource, createResourceWithFile } = useResources({
    type: 'video',
    isPublic: true,
  });

  // Use resources, loading, error states
}
```

### 4. `useSocket` Hook

**Location:** `hooks/useSocket.ts`

**Usage:**
```typescript
import { useSocket } from '@/hooks/useSocket';

function Component() {
  const { socket, connected, error } = useSocket({
    autoConnect: true,
    listeners: {
      newMessage: (data) => {
        // Handle new message
      },
      notification: (data) => {
        // Handle notification
      },
    },
  });
}
```

## Components to Update

### Authentication Components ✅

**Already Updated:**
- `components/auth/AuthProvider.tsx` - Uses real AuthService
- `app/signin/page.tsx` - Uses AuthProvider
- `app/signup/**/page.tsx` - Uses AuthService

### Session Components (Need Update)

**Files:**
- `app/dashboard/patient/sessions/page.tsx` - Replace dummySessions with `useSessions`
- `app/dashboard/counselor/sessions/page.tsx` - Replace dummySessions with `useSessions`
- `components/session/SessionBookingModal.tsx` - Use `createSession` from hook
- `components/session/RescheduleModal.tsx` - Use `rescheduleSession` from hook
- `components/session/CancelSessionModal.tsx` - Use `cancelSession` from hook

**Example Update:**
```typescript
// Before
import { dummySessions } from '@/lib/dummy-data';

// After
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/components/auth/AuthProvider';

function SessionsPage() {
  const { user } = useAuth();
  const { sessions, loading, error, createSession, rescheduleSession, cancelSession } = useSessions({
    patientId: user?.id,
  });

  // Use sessions instead of dummySessions
  // Use loading and error states
  // Use createSession, rescheduleSession, cancelSession functions
}
```

### Chat Components (Need Update)

**Files:**
- `app/dashboard/patient/chat/page.tsx` - Use `useChat` hook
- `app/dashboard/counselor/chat/page.tsx` - Use `useChat` hook
- `components/dashboard/shared/ChatThreadsSidebar.tsx` - Use `useChat` hook

**Example Update:**
```typescript
import { useChat } from '@/hooks/useChat';

function ChatPage() {
  const { chats, messages, currentChat, loading, sendMessage, selectChat, socketConnected } = useChat();

  // Display chats and messages
  // Use sendMessage for sending
  // Use selectChat for chat selection
  // Show socketConnected status
}
```

### Resource Components (Need Update)

**Files:**
- `app/dashboard/patient/resources/page.tsx` - Use `useResources` hook
- `app/dashboard/counselor/resources/page.tsx` - Use `useResources` hook
- `components/dashboard/shared/ResourceCard.tsx` - Use ResourcesApi

**Example Update:**
```typescript
import { useResources } from '@/hooks/useResources';

function ResourcesPage() {
  const { resources, loading, error, createResource, createResourceWithFile } = useResources({
    isPublic: true,
  });

  // Display resources
  // Use createResource or createResourceWithFile for new resources
}
```

### Notification Components (Need Update)

**Files:**
- Components that display notifications - Use NotificationsApi
- Add Socket.IO listener for real-time notifications

**Example:**
```typescript
import { NotificationsApi } from '@/lib/api/notifications';
import { useSocket } from '@/hooks/useSocket';

function NotificationComponent() {
  const [notifications, setNotifications] = useState([]);

  useSocket({
    listeners: {
      notification: (data) => {
        // Add new notification
        setNotifications(prev => [...prev, data]);
      },
    },
  });

  useEffect(() => {
    // Load notifications
    NotificationsApi.listNotifications().then(response => {
      setNotifications(response.notifications);
    });
  }, []);
}
```

## Migration Steps

### Step 1: Replace Dummy Data Imports

**Before:**
```typescript
import { dummySessions, dummyCounselors } from '@/lib/dummy-data';
```

**After:**
```typescript
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/components/auth/AuthProvider';
```

### Step 2: Use Hooks

**Before:**
```typescript
const sessions = dummySessions.filter(session => session.patientId === currentPatientId);
```

**After:**
```typescript
const { user } = useAuth();
const { sessions, loading, error } = useSessions({
  patientId: user?.id,
});
```

### Step 3: Handle Loading and Error States

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}
```

### Step 4: Use API Functions

**Before:**
```typescript
// Mock update
dummySessions[index] = { ...dummySessions[index], status: 'cancelled' };
```

**After:**
```typescript
try {
  await cancelSession(sessionId, { reason: 'Patient request' });
  // Success - hook will automatically refresh
} catch (error) {
  // Handle error
}
```

### Step 5: Add Real-time Features

For chat and notifications, add Socket.IO integration:

```typescript
const { socket, connected } = useSocket({
  listeners: {
    newMessage: (data) => {
      // Handle real-time message
    },
  },
});
```

## Testing Checklist

After updating components:

- [ ] Authentication flow works
- [ ] Sessions load from backend
- [ ] Can create sessions
- [ ] Can reschedule sessions
- [ ] Can cancel sessions
- [ ] Can join Jitsi sessions
- [ ] Chat loads messages
- [ ] Can send messages
- [ ] Real-time messages work (Socket.IO)
- [ ] Resources load from backend
- [ ] Can create resources
- [ ] Can upload files
- [ ] Notifications work
- [ ] Real-time notifications work (Socket.IO)

## Error Handling

All hooks and API services throw errors that should be caught:

```typescript
try {
  await createSession(data);
} catch (error) {
  if (error instanceof ApiError) {
    // Show user-friendly error message
    toast.error(error.message);
  } else {
    // Handle unexpected errors
    toast.error('An unexpected error occurred');
  }
}
```

## Next Steps

1. Update patient sessions page
2. Update counselor sessions page
3. Update chat pages
4. Update resource pages
5. Add notification components
6. Test all integrations
7. Add error boundaries
8. Add loading states
9. Add toast notifications

