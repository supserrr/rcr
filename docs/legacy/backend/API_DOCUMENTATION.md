# API Documentation

Complete API documentation for Rwanda Cancer Relief backend.

## Base URL

```
Development: http://localhost:10000
Production: https://api.rwandacancerrelief.org
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## Endpoints

### Authentication

#### Sign Up

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "role": "patient",
  "fullName": "John Doe",
  "phoneNumber": "+250788123456",
  "metadata": {}
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient",
      "fullName": "John Doe",
      "phoneNumber": "+250788123456"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 3600,
      "expiresAt": 1234567890
    }
  }
}
```

#### Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient",
      "fullName": "John Doe",
      "phoneNumber": "+250788123456",
      "metadata": {}
    }
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "phoneNumber": "+250788123457",
  "metadata": {}
}
```

#### Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "NewPassword123!"
}
```

---

### Sessions

#### List Sessions

```http
GET /api/sessions?status=scheduled&patientId=uuid&counselorId=uuid&limit=10&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status: `scheduled`, `completed`, `cancelled`, `rescheduled`
- `patientId` - Filter by patient ID
- `counselorId` - Filter by counselor ID
- `limit` - Number of results (default: 10, max: 100)
- `offset` - Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "counselorId": "uuid",
        "date": "2024-01-15",
        "time": "10:00:00",
        "duration": 60,
        "type": "video",
        "status": "scheduled",
        "notes": "First consultation",
        "jitsiRoomUrl": "https://8x8.vc/room-name",
        "jitsiRoomName": "session-uuid",
        "rating": null,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

#### Get Session by ID

```http
GET /api/sessions/:id
Authorization: Bearer <token>
```

#### Create Session

```http
POST /api/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "uuid",
  "counselorId": "uuid",
  "date": "2024-01-15",
  "time": "10:00:00",
  "duration": 60,
  "type": "video",
  "notes": "First consultation"
}
```

**Types:** `video`, `audio`, `chat`

#### Update Session

```http
PUT /api/sessions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Updated notes",
  "rating": 5
}
```

#### Reschedule Session

```http
POST /api/sessions/:id/reschedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-20",
  "time": "14:00:00"
}
```

#### Cancel Session

```http
POST /api/sessions/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Emergency situation"
}
```

#### Complete Session

```http
POST /api/sessions/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "notes": "Great session"
}
```

#### Get Jitsi Room Configuration

```http
GET /api/sessions/:id/jitsi-room?apiType=react
Authorization: Bearer <token>
```

**Query Parameters:**
- `apiType` - API type: `react`, `iframe`, `lib-jitsi-meet` (default: `react`)

**Response:**

```json
{
  "success": true,
  "data": {
    "apiType": "react",
    "roomName": "session-uuid",
    "roomUrl": "https://8x8.vc/session-uuid",
    "jwt": "jwt_token",
    "config": {
      "domain": "8x8.vc",
      "appId": "your_app_id",
      "userInfo": {
        "displayName": "John Doe"
      }
    }
  }
}
```

---

### Resources

#### List Resources

```http
GET /api/resources?type=pdf&isPublic=true&limit=10&offset=0&search=title
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` - Filter by type: `audio`, `pdf`, `video`, `article`
- `isPublic` - Filter by public/private (default: `true`)
- `category` - Filter by category
- `search` - Search in title and description
- `limit` - Number of results (default: 10, max: 100)
- `offset` - Pagination offset (default: 0)

#### Get Resource by ID

```http
GET /api/resources/:id
Authorization: Bearer <token>
```

#### Create Resource

```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Resource Title",
  "description": "Resource description",
  "type": "pdf",
  "tags": ["tag1", "tag2"],
  "isPublic": true,
  "category": "Education",
  "file": <file> // Optional for file uploads
}
```

#### Update Resource

```http
PUT /api/resources/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Resource

```http
DELETE /api/resources/:id
Authorization: Bearer <token>
```

#### Track Resource View

```http
POST /api/resources/:id/view
Authorization: Bearer <token>
```

#### Download Resource

```http
GET /api/resources/:id/download
Authorization: Bearer <token>
```

Returns file download with appropriate headers.

---

### Chat

#### List Chats

```http
GET /api/chat?limit=10&offset=0
Authorization: Bearer <token>
```

#### Get Chat by ID

```http
GET /api/chat/:id
Authorization: Bearer <token>
```

#### Create Chat

```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "uuid"
}
```

#### Get Messages

```http
GET /api/chat/:id/messages?limit=50&offset=0
Authorization: Bearer <token>
```

#### Send Message

```http
POST /api/chat/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you?",
  "type": "text",
  "fileUrl": null
}
```

**Types:** `text`, `image`, `file`

#### Mark Messages as Read

```http
POST /api/chat/:id/messages/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageIds": ["uuid1", "uuid2"]
}
```

### Socket.IO Events

#### Join Chat

```javascript
socket.emit('joinChat', { chatId: 'uuid' });
```

#### Leave Chat

```javascript
socket.emit('leaveChat', { chatId: 'uuid' });
```

#### Send Message

```javascript
socket.emit('sendMessage', {
  chatId: 'uuid',
  content: 'Hello!',
  type: 'text'
});
```

#### Typing Indicator

```javascript
socket.emit('typing', {
  chatId: 'uuid',
  isTyping: true
});
```

#### Receive Message

```javascript
socket.on('message', (data) => {
  console.log('New message:', data);
});
```

---

### Notifications

#### List Notifications

```http
GET /api/notifications?isRead=false&limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `isRead` - Filter by read status
- `type` - Filter by notification type
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

#### Get Notification by ID

```http
GET /api/notifications/:id
Authorization: Bearer <token>
```

#### Mark Notification as Read

```http
PUT /api/notifications/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isRead": true
}
```

#### Mark All Notifications as Read

```http
PUT /api/notifications/read
Authorization: Bearer <token>
```

#### Delete Notification

```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

### Socket.IO Events

#### Receive Notification

```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

---

### Admin

#### Get Analytics

```http
GET /api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` - Start date for analytics (ISO format)
- `endDate` - End date for analytics (ISO format)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "patients": 70,
      "counselors": 25,
      "admins": 5
    },
    "sessions": {
      "total": 500,
      "scheduled": 200,
      "completed": 250,
      "cancelled": 50
    },
    "resources": {
      "total": 150,
      "views": 5000,
      "downloads": 1000
    },
    "messages": {
      "total": 2000,
      "today": 50
    },
    "notifications": {
      "total": 3000,
      "unread": 150
    }
  }
}
```

#### List Users

```http
GET /api/admin/users?role=patient&limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` - Filter by role: `patient`, `counselor`, `admin`
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

#### Get User by ID

```http
GET /api/admin/users/:id
Authorization: Bearer <token>
```

#### Update User Role

```http
PUT /api/admin/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "counselor"
}
```

#### Delete User

```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

## Rate Limiting

API rate limiting may be applied in production. Check response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## WebSocket Connection

Connect to Socket.IO server:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

## Testing

### Using curl

```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","role":"patient","fullName":"Test User"}'

# Sign in
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Using Postman

1. Import the collection (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `token`: (will be set after signin)
3. Run requests in order:
   - Sign up / Sign in
   - Get current user
   - Other endpoints

