# API Testing Guide

Guide for testing the Rwanda Cancer Relief backend API.

## Prerequisites

1. Backend server running on `http://localhost:10000`
2. Supabase project configured with migrations applied
3. Environment variables set (see `docs/ENV_SECRETS.md`)
4. Real user accounts created through authentication (no test accounts)

## Testing Tools

### Recommended Tools

1. **Postman** - GUI-based API testing
2. **Insomnia** - Alternative GUI tool
3. **curl** - Command-line testing
4. **HTTPie** - User-friendly CLI
5. **REST Client** (VS Code extension)

### Quick Setup

```bash
# Install HTTPie (optional)
brew install httpie  # macOS
# or
pip install httpie  # Python

# Test server health
curl http://localhost:10000/health
# or
http GET http://localhost:10000/health
```

## Test Scenarios

### 1. Authentication Flow

#### Test Sign Up

**Note:** Use real email addresses and create actual user accounts. No test accounts should be used.

```bash
# Using curl - Replace with real user information
curl -X POST http://localhost:10000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "role": "patient",
    "fullName": "Real User Name",
    "phoneNumber": "+250788123456"
  }'

# Using HTTPie - Replace with real user information
http POST http://localhost:10000/api/auth/signup \
  email=user@example.com \
  password=SecurePassword123! \
  role=patient \
  fullName="Real User Name" \
  phoneNumber=+250788123456
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "patient@test.com",
      "role": "patient",
      "fullName": "Test Patient"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 3600
    }
  }
}
```

#### Test Sign In

**Note:** Use real user credentials. No test accounts should be used.

```bash
# Save token to variable - Replace with real user credentials
TOKEN=$(curl -X POST http://localhost:10000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}' \
  | jq -r '.data.tokens.accessToken')

echo $TOKEN
```

#### Test Get Current User

```bash
curl -X GET http://localhost:10000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Session Management

#### Create Session

```bash
# First, create a counselor account
COUNSELOR_TOKEN=$(curl -X POST http://localhost:10000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"counselor@test.com","password":"TestPassword123!","role":"counselor","fullName":"Test Counselor"}' \
  | jq -r '.data.tokens.accessToken')

# Get counselor ID
COUNSELOR_ID=$(curl -X GET http://localhost:10000/api/auth/me \
  -H "Authorization: Bearer $COUNSELOR_TOKEN" \
  | jq -r '.data.user.id')

# Create session as patient
curl -X POST http://localhost:10000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": \"$(curl -X GET http://localhost:10000/api/auth/me -H \"Authorization: Bearer $TOKEN\" | jq -r '.data.user.id')\",
    \"counselorId\": \"$COUNSELOR_ID\",
    \"date\": \"2024-12-15\",
    \"time\": \"10:00:00\",
    \"duration\": 60,
    \"type\": \"video\",
    \"notes\": \"First consultation\"
  }"
```

#### List Sessions

```bash
curl -X GET "http://localhost:10000/api/sessions?status=scheduled" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Jitsi Room

```bash
# Get session ID from previous create call
SESSION_ID="..."

curl -X GET "http://localhost:10000/api/sessions/$SESSION_ID/jitsi-room?apiType=react" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Resource Management

#### Create Resource

```bash
curl -X POST http://localhost:10000/api/resources \
  -H "Authorization: Bearer $COUNSELOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Cancer Treatment",
    "description": "A comprehensive guide to cancer treatment options",
    "type": "article",
    "tags": ["treatment", "education"],
    "isPublic": true,
    "category": "Education",
    "url": "https://example.com/article"
  }'
```

#### List Resources

```bash
curl -X GET "http://localhost:10000/api/resources?type=article&isPublic=true" \
  -H "Authorization: Bearer $TOKEN"
```

#### Track Resource View

```bash
RESOURCE_ID="..."

curl -X POST "http://localhost:10000/api/resources/$RESOURCE_ID/view" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Chat & Messaging

#### Create Chat

```bash
# As patient, create chat with counselor
curl -X POST http://localhost:10000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"participantId\": \"$COUNSELOR_ID\"}"
```

#### Send Message

```bash
CHAT_ID="..."

curl -X POST "http://localhost:10000/api/chat/$CHAT_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, I have a question about my treatment",
    "type": "text"
  }'
```

#### Get Messages

```bash
curl -X GET "http://localhost:10000/api/chat/$CHAT_ID/messages?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Notifications

#### List Notifications

```bash
curl -X GET "http://localhost:10000/api/notifications?isRead=false" \
  -H "Authorization: Bearer $TOKEN"
```

#### Mark Notification as Read

```bash
NOTIFICATION_ID="..."

curl -X PUT "http://localhost:10000/api/notifications/$NOTIFICATION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isRead": true}'
```

### 6. Admin Endpoints

#### Get Analytics

```bash
ADMIN_TOKEN="..."

curl -X GET "http://localhost:10000/api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### List Users

```bash
curl -X GET "http://localhost:10000/api/admin/users?role=patient" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Update User Role

```bash
USER_ID="..."

curl -X PUT "http://localhost:10000/api/admin/users/$USER_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "counselor"}'
```

## Test Scripts

Create a test script file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:10000"

# Test sign up
echo "Testing sign up..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"patient","fullName":"Test User"}')

echo "$SIGNUP_RESPONSE" | jq

# Extract token
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.tokens.accessToken')

if [ "$TOKEN" = "null" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token: $TOKEN"

# Test get current user
echo "Testing get current user..."
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "Tests completed!"
```

Make it executable:

```bash
chmod +x test-api.sh
./test-api.sh
```

## Postman Collection

Create a Postman collection with the following structure:

```
Rwanda Cancer Relief API
├── Authentication
│   ├── Sign Up
│   ├── Sign In
│   ├── Get Current User
│   ├── Refresh Token
│   └── Update Profile
├── Sessions
│   ├── List Sessions
│   ├── Create Session
│   ├── Get Session
│   ├── Reschedule Session
│   └── Cancel Session
├── Resources
│   ├── List Resources
│   ├── Create Resource
│   ├── Get Resource
│   └── Track View
├── Chat
│   ├── List Chats
│   ├── Create Chat
│   ├── Get Messages
│   └── Send Message
├── Notifications
│   ├── List Notifications
│   └── Mark as Read
└── Admin
    ├── Get Analytics
    ├── List Users
    └── Update User Role
```

## Environment Variables

Set up Postman environment variables:

```
base_url: http://localhost:10000
token: (auto-set after signin)
patient_id: (auto-set after signup)
counselor_id: (auto-set after signup)
```

## Common Issues

### 401 Unauthorized

- Check token is included in Authorization header
- Verify token hasn't expired
- Refresh token if expired

### 403 Forbidden

- Verify user role has required permissions
- Check RLS policies are correctly configured

### 404 Not Found

- Verify endpoint URL is correct
- Check resource ID exists

### 422 Validation Error

- Check request body matches schema
- Verify all required fields are provided
- Check data types match expected format

## Automated Testing

### Using Jest

```javascript
// tests/integration/auth.test.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:10000';

describe('Authentication API', () => {
  it('should sign up a new user', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'patient',
      fullName: 'Test User'
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.user.email).toBe('test@example.com');
  });
});
```

## Next Steps

1. Run all test scenarios
2. Verify error handling
3. Test edge cases
4. Performance testing
5. Load testing

