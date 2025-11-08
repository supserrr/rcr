# API Services Documentation

Complete guide to all API services available in the frontend.

## Overview

All API services are located in `lib/api/` and provide type-safe access to the backend API.

## Services

### Authentication (`lib/api/auth.ts`)

**AuthApi**

- `signUp(credentials)` - Sign up new user
- `signIn(credentials)` - Sign in existing user
- `signOut()` - Sign out current user
- `getCurrentUser()` - Get current user profile
- `refreshToken()` - Refresh authentication token
- `updateProfile(data)` - Update user profile
- `changePassword(data)` - Change password
- `forgotPassword(email)` - Request password reset
- `resetPassword(data)` - Reset password with token

### Sessions (`lib/api/sessions.ts`)

**SessionsApi**

- `createSession(data)` - Create new session
- `getSession(sessionId)` - Get session by ID
- `listSessions(params?)` - List sessions with filters
- `updateSession(sessionId, data)` - Update session
- `rescheduleSession(sessionId, data)` - Reschedule session
- `cancelSession(sessionId, data?)` - Cancel session
- `completeSession(sessionId, data?)` - Complete session
- `getJitsiRoom(sessionId, apiType?)` - Get Jitsi room configuration

### Resources (`lib/api/resources.ts`)

**ResourcesApi**

- `createResource(data)` - Create new resource
- `createResourceWithFile(file, data)` - Create resource with file upload
- `getResource(resourceId)` - Get resource by ID
- `listResources(params?)` - List resources with filters
- `updateResource(resourceId, data)` - Update resource
- `deleteResource(resourceId)` - Delete resource
- `getDownloadUrl(resourceId)` - Get download URL
- `trackView(resourceId)` - Track resource view

### Chat (`lib/api/chat.ts`)

**ChatApi**

- `createChat(data)` - Create new chat
- `getChat(chatId)` - Get chat by ID
- `listChats(params?)` - List chats
- `sendMessage(data)` - Send message
- `getMessages(chatId, params?)` - Get messages for chat
- `markMessagesRead(chatId, data)` - Mark messages as read

### Notifications (`lib/api/notifications.ts`)

**NotificationsApi**

- `createNotification(data)` - Create notification
- `getNotification(notificationId)` - Get notification by ID
- `listNotifications(params?)` - List notifications
- `markNotificationsRead(data)` - Mark notifications as read
- `deleteNotification(notificationId)` - Delete notification

### Admin (`lib/api/admin.ts`)

**AdminApi** (Requires admin role)

- `getAnalytics(params?)` - Get analytics data
- `getUser(userId)` - Get user by ID
- `listUsers(params?)` - List users
- `updateUserRole(userId, data)` - Update user role
- `deleteUser(userId)` - Delete user

## Socket.IO Client

### Client (`lib/socket/client.ts`)

Real-time communication via Socket.IO.

**Events (Server → Client):**
- `newMessage` - New message received
- `userJoinedChat` - User joined chat
- `userLeftChat` - User left chat
- `messagesRead` - Messages marked as read
- `typing` - User typing indicator
- `notification` - New notification
- `sessionUpdate` - Session status updated

**Events (Client → Server):**
- `joinChat(chatId)` - Join chat room
- `leaveChat(chatId)` - Leave chat room
- `markMessagesRead(data)` - Mark messages as read
- `typing(data)` - Send typing indicator
- `joinSession(sessionId)` - Join session room
- `leaveSession(sessionId)` - Leave session room

### React Hook (`hooks/useSocket.ts`)

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { socket, connected, error } = useSocket({
    autoConnect: true,
    listeners: {
      newMessage: (data) => {
        console.log('New message:', data);
      },
      notification: (data) => {
        console.log('New notification:', data);
      },
    },
  });

  // Use socket...
}
```

## Usage Examples

### Authentication

```typescript
import { AuthApi } from '@/lib/api/auth';

// Sign up
const { user, tokens } = await AuthApi.signUp({
  email: 'user@example.com',
  password: 'password123',
  role: 'patient',
  fullName: 'John Doe',
});

// Sign in
const { user, tokens } = await AuthApi.signIn({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sessions

```typescript
import { SessionsApi } from '@/lib/api/sessions';

// Create session
const session = await SessionsApi.createSession({
  patientId: 'patient-id',
  counselorId: 'counselor-id',
  date: '2024-01-01',
  time: '10:00',
  duration: 60,
  type: 'video',
});

// Get Jitsi room
const jitsiRoom = await SessionsApi.getJitsiRoom(session.id, 'react-sdk');
```

### Resources

```typescript
import { ResourcesApi } from '@/lib/api/resources';

// List resources
const { resources } = await ResourcesApi.listResources({
  type: 'video',
  search: 'cancer',
  limit: 10,
});

// Upload resource
const resource = await ResourcesApi.createResourceWithFile(file, {
  title: 'Resource Title',
  description: 'Description',
  type: 'pdf',
  tags: ['tag1', 'tag2'],
  isPublic: true,
});
```

### Chat

```typescript
import { ChatApi } from '@/lib/api/chat';
import { useSocket } from '@/hooks/useSocket';

// Create chat
const chat = await ChatApi.createChat({
  participantId: 'other-user-id',
});

// Send message
const message = await ChatApi.sendMessage({
  chatId: chat.id,
  content: 'Hello!',
  type: 'text',
});

// Use Socket.IO for real-time
const { socket } = useSocket({
  listeners: {
    newMessage: (data) => {
      // Handle new message
    },
  },
});
```

## Error Handling

All API calls throw `ApiError` on failure:

```typescript
import { ApiError } from '@/lib/api/client';

try {
  const data = await SessionsApi.getSession('session-id');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    
    if (error.status === 401) {
      // Unauthorized - redirect to sign in
    }
  }
}
```

## Type Safety

All services are fully typed with TypeScript:

```typescript
import type { Session, CreateSessionInput } from '@/lib/api/sessions';

const input: CreateSessionInput = {
  patientId: '...',
  counselorId: '...',
  // TypeScript will check all required fields
};

const session: Session = await SessionsApi.createSession(input);
```

