# Backend - Rwanda Cancer Relief

Backend services and API for Rwanda Cancer Relief platform.

## Status

🚧 **In Development** - Backend is being set up. See `IMPLEMENTATION_PLAN.md` for detailed roadmap.

## Technology Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **Real-time:** Socket.IO
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Validation:** Zod
- **Video Calls:** Jitsi Meet API
- **Deployment:** Render
- **Notifications:** Resend or Supabase Realtime

## Prerequisites

Before starting development, ensure:

1. ✅ Node.js >= 18 installed (v20.18.0 verified)
2. ✅ npm >= 9 installed (v10.8.2 verified)
3. ⏳ Supabase project configured (see `PREREQUISITES_CHECKLIST.md`)
4. ⏳ Environment variables set up (see `env.example`)
5. ⏳ Frontend running on localhost:3000

See `PREREQUISITES_CHECKLIST.md` for complete verification checklist.

## Quick Start

### 1. Install Dependencies

```bash
npm install express socket.io @supabase/supabase-js zod dotenv cors
npm install -D typescript @types/node @types/express tsx ts-node
```

### 2. Configure Environment

```bash
cp env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Express server entry point
│   ├── app.ts                 # Express app configuration
│   ├── config/                # Configuration files
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   ├── services/               # Business logic
│   ├── middleware/             # Express middleware
│   ├── schemas/                # Zod validation schemas
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── socket/                 # Socket.IO setup
├── tests/                      # Test files
├── env.example                 # Environment template
└── tsconfig.json              # TypeScript config
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run typecheck` - Type check without building
- `npm test` - Run tests (to be implemented)

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Cancel session

### Resources
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `GET /api/resources/:id` - Get resource

### Chat
- Real-time via Socket.IO
- `GET /api/chat/conversations` - List conversations

See `IMPLEMENTATION_PLAN.md` for complete API documentation.

## Documentation

- `IMPLEMENTATION_PLAN.md` - Detailed implementation roadmap
- `PREREQUISITES_CHECKLIST.md` - Prerequisites verification checklist
- `env.example` - Environment variables template

## Development Guidelines

1. All request payloads validated with Zod
2. Use TypeScript strict mode
3. Follow Express.js best practices
4. Implement proper error handling
5. Use Supabase for database operations
6. Socket.IO for real-time features

## Next Steps

1. Complete prerequisites (see `PREREQUISITES_CHECKLIST.md`)
2. Install dependencies
3. Set up basic Express server
4. Test Supabase connection
5. Follow `IMPLEMENTATION_PLAN.md` for phased development

---

**Status:** Setup Phase  
**Last Updated:** November 2, 2025

