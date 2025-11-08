# Backend Implementation Plan

## Prerequisites Status

### Verified ✅
- Node.js v20.18.0 (>= 18) ✓
- npm 10.8.2 ✓
- Backend directory exists ✓
- Project initialized ✓

### To Verify
- [ ] Supabase project credentials (SUPABASE_URL, SUPABASE_KEY)
- [ ] Render account access
- [ ] MCPs configured in Cursor:
  - [ ] Supabase MCP
  - [ ] Node MCP
  - [ ] HTTP MCP
  - [ ] Zod MCP
  - [ ] Socket.IO MCP
- [ ] Frontend running on localhost:3000

## Technology Stack

### Core
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Validation**: Zod
- **Video Calls**: Jitsi Meet API

### Additional
- **Deployment**: Render
- **Notifications**: Resend or Supabase Realtime
- **Environment**: dotenv

## Folder Structure

```
backend/
├── src/
│   ├── server.ts              # Express server entry point
│   ├── app.ts                 # Express app configuration
│   │
│   ├── config/
│   │   ├── index.ts           # Configuration loader
│   │   ├── supabase.ts        # Supabase client setup
│   │   └── socket.ts          # Socket.IO configuration
│   │
│   ├── routes/
│   │   ├── index.ts           # Route aggregator
│   │   ├── auth.routes.ts      # Authentication routes
│   │   ├── users.routes.ts     # User management routes
│   │   ├── sessions.routes.ts  # Session booking routes
│   │   ├── resources.routes.ts # Resource management routes
│   │   ├── chat.routes.ts      # Chat/messaging routes
│   │   ├── jitsi.routes.ts     # Jitsi meeting routes
│   │   └── notifications.routes.ts # Notification routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── sessions.controller.ts
│   │   ├── resources.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── jitsi.controller.ts
│   │   └── notifications.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── sessions.service.ts
│   │   ├── resources.service.ts
│   │   ├── chat.service.ts
│   │   ├── jitsi.service.ts
│   │   └── notifications.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── error.middleware.ts # Error handling
│   │   ├── validation.middleware.ts # Request validation
│   │   └── logger.middleware.ts # Request logging
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts      # Auth validation schemas
│   │   ├── users.schema.ts
│   │   ├── sessions.schema.ts
│   │   ├── resources.schema.ts
│   │   └── chat.schema.ts
│   │
│   ├── types/
│   │   ├── index.ts            # Shared TypeScript types
│   │   ├── express.d.ts        # Express type extensions
│   │   └── socket.d.ts         # Socket.IO type definitions
│   │
│   ├── utils/
│   │   ├── logger.ts           # Logging utility
│   │   ├── errors.ts           # Error classes
│   │   └── helpers.ts          # Helper functions
│   │
│   └── socket/
│       ├── index.ts            # Socket.IO server setup
│       ├── handlers/
│       │   ├── chat.handler.ts  # Chat socket handlers
│       │   ├── notifications.handler.ts
│       │   └── sessions.handler.ts
│       └── middleware/
│           └── socketAuth.middleware.ts # Socket authentication
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                # Environment variables template
├── .env                        # Local environment (gitignored)
├── .gitignore
├── tsconfig.json               # TypeScript configuration
├── package.json
├── README.md
└── IMPLEMENTATION_PLAN.md      # This file

```

## Implementation Steps

### Phase 1: Project Setup (Current)
1. ✅ Initialize npm project
2. ⏳ Create folder structure
3. ⏳ Install core dependencies
4. ⏳ Configure TypeScript
5. ⏳ Set up environment variables (.env.example)
6. ⏳ Create basic Express server
7. ⏳ Test Supabase connection

### Phase 2: Core Infrastructure
1. Set up Express app with middleware
2. Configure Socket.IO server
3. Set up Supabase client
4. Implement authentication middleware
5. Create error handling middleware
6. Set up request validation middleware
7. Configure CORS for frontend integration

### Phase 3: Authentication & Users
1. Implement sign up endpoint (patients, counselors)
2. Implement sign in endpoint
3. Implement sign out endpoint
4. Implement token refresh endpoint
5. Create user profile endpoints
6. Implement role-based access control
7. Set up user types: Patient, Counselor, Admin

### Phase 4: Sessions & Bookings
1. Create session booking endpoints
2. Implement session CRUD operations
3. Add session status management
4. Implement session rescheduling
5. Add session cancellation
6. Create session list/filter endpoints
7. Integrate Jitsi Meet room generation

### Phase 5: Resources
1. Create resource CRUD endpoints
2. Implement resource types (audio, pdf, video, article)
3. Add resource upload/storage (Supabase Storage)
4. Create resource filtering/search
5. Implement resource recommendations
6. Add resource views/download tracking

### Phase 6: Chat & Messaging
1. Set up Socket.IO for real-time chat
2. Implement chat room creation
3. Create message send/receive handlers
4. Add message history endpoints
5. Implement read receipts
6. Add typing indicators
7. Create chat notifications

### Phase 7: Notifications
1. Set up notification system
2. Implement email notifications (Resend)
3. Create notification preferences
4. Add real-time notification delivery (Socket.IO)
5. Implement notification history
6. Add notification types (session reminders, messages, etc.)

### Phase 8: Admin Features
1. Create admin dashboard endpoints
2. Implement counselor approval system
3. Add user management endpoints
4. Create analytics endpoints
5. Implement support ticket system
6. Add system health monitoring

### Phase 9: Testing & Optimization
1. Write unit tests
2. Write integration tests
3. Write E2E tests
4. Performance optimization
5. Security audit
6. API documentation

### Phase 10: Deployment
1. Configure Render deployment
2. Set up environment variables on Render
3. Configure database migrations
4. Set up CI/CD pipeline
5. Monitor and logging setup
6. Production testing

## API Endpoints Structure

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/:id/profile` - Get user profile

### Sessions
- `GET /api/sessions` - List sessions (filtered by user/role)
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create session booking
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Cancel session
- `POST /api/sessions/:id/reschedule` - Reschedule session
- `POST /api/sessions/:id/complete` - Mark session as completed

### Resources
- `GET /api/resources` - List resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (counselor/admin)
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/resources/:id/download` - Download resource
- `POST /api/resources/:id/view` - Track resource view

### Chat
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations` - Create conversation
- `POST /api/chat/messages` - Send message (Socket.IO preferred)
- `PUT /api/chat/messages/:id/read` - Mark message as read

### Jitsi
- `POST /api/jitsi/create-room` - Generate Jitsi room
- `GET /api/jitsi/room/:sessionId` - Get room details

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/counselors/pending` - Pending counselor applications
- `POST /api/admin/counselors/:id/approve` - Approve counselor
- `POST /api/admin/counselors/:id/reject` - Reject counselor
- `GET /api/admin/support/tickets` - List support tickets
- `PUT /api/admin/support/tickets/:id` - Update ticket

## Database Schema (Supabase)

### Tables
- `users` - User accounts
- `profiles` - Extended user profiles
- `sessions` - Counseling sessions
- `resources` - Educational resources
- `messages` - Chat messages
- `conversations` - Chat conversations
- `notifications` - User notifications
- `support_tickets` - Support tickets
- `counselor_applications` - Pending counselor applications

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Jitsi
JITSI_APP_ID=your_jitsi_app_id
JITSI_APP_SECRET=your_jitsi_app_secret
JITSI_DOMAIN=8x8.vc

# Notifications (Optional)
RESEND_API_KEY=your_resend_api_key

# CORS
FRONTEND_URL=http://localhost:3000

# JWT (if using custom JWT)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- Socket.IO events

### E2E Tests
- Complete user flows
- Authentication flows
- Session booking flows

## Deployment Checklist

1. Environment variables configured on Render
2. Database migrations run
3. Supabase connection tested
4. CORS configured for production frontend URL
5. Health check endpoint working
6. Logging configured
7. Error tracking setup
8. SSL/HTTPS enabled

## Next Steps

1. Complete Phase 1 setup
2. Verify Supabase connection
3. Set up basic Express server
4. Begin Phase 2: Core Infrastructure

