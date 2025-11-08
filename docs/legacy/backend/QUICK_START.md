# Quick Start Guide

Get the Rwanda Cancer Relief backend up and running in minutes.

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js >= 18 installed
- ✅ npm >= 9 installed
- ✅ Supabase project created (free tier works)
- ✅ Git repository cloned

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs all required dependencies including:
- Express.js
- Socket.IO
- Supabase client
- Zod validation
- Testing frameworks

## Step 2: Set Up Supabase

### Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Create new project
4. Wait for project to initialize (2-3 minutes)
5. Note your project credentials:
   - Project URL: `https://[project-ref].supabase.co`
   - Anon Key: Found in Settings > API
   - Service Role Key: Found in Settings > API (keep secret!)

### Apply Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:

```sql
-- First, run 001_initial_schema.sql
-- Copy contents from backend/migrations/001_initial_schema.sql
-- Paste and execute in SQL Editor

-- Then, run 002_rls_policies.sql
-- Copy contents from backend/migrations/002_rls_policies.sql
-- Paste and execute in SQL Editor

-- Finally, run 003_seed_data.sql
-- Copy contents from backend/migrations/003_seed_data.sql
-- Paste and execute in SQL Editor
```

Or use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 3: Configure Environment Variables

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your credentials
```

Required variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Frontend (required for CORS)
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Jitsi (optional - for video calls)
JITSI_APP_ID=your_app_id
JITSI_APP_SECRET=your_app_secret
JITSI_DOMAIN=8x8.vc
```

See `ENV_SECRETS.md` for complete list.

## Step 4: Start Development Server

```bash
npm run dev
```

Server starts on `http://localhost:5000`

### Verify Server is Running

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"UP","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Test API Endpoints

```bash
# Get API info
curl http://localhost:5000/api

# Expected response:
# {
#   "message": "Welcome to the Rwanda Cancer Relief Backend API",
#   "version": "1.0.0",
#   "endpoints": { ... }
# }
```

## Step 5: Test Authentication

### Sign Up a Test User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "patient",
    "fullName": "Test User",
    "phoneNumber": "+250788123456"
  }'
```

### Sign In

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Save the `accessToken` from the response for authenticated requests.

### Get Current User

```bash
# Replace TOKEN with actual token from signin response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Step 6: Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Note**: Tests require test database configuration. See `tests/README.md` for details.

## Next Steps

### Development

1. **Connect Frontend**
   - Update frontend API URL to `http://localhost:5000`
   - Test authentication flow
   - Connect Socket.IO client

2. **Create Test Data**
   - Sign up test users (patient, counselor, admin)
   - Create test sessions
   - Upload test resources

3. **Test Features**
   - Session booking
   - Chat messaging
   - Resource management
   - Notifications

### Production Deployment

See `docs/DEPLOYMENT.md` for deployment instructions.

## Troubleshooting

### Server Won't Start

**Issue**: Port already in use

```bash
# Check what's using port 5000
lsof -i :5000

# Kill process or change PORT in .env
PORT=5001 npm run dev
```

### Database Connection Errors

**Issue**: Cannot connect to Supabase

1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_KEY` is correct (use anon key, not service key)
3. Check Supabase project is active
4. Verify migrations are applied

### CORS Errors

**Issue**: Frontend can't connect to API

1. Verify `FRONTEND_URL` matches frontend URL
2. Check `CORS_ORIGIN` in `.env`
3. Restart server after changing environment variables

### Authentication Errors

**Issue**: Token not working

1. Verify token is included in Authorization header
2. Check token format: `Bearer <token>`
3. Verify token hasn't expired
4. Check Supabase Auth is configured correctly

## Common Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start           # Start production server

# Testing
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Code Quality
npm run lint        # Run linter
npm run typecheck   # Type checking
```

## Documentation

- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Testing Guide**: `docs/API_TESTING.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Environment Variables**: `ENV_SECRETS.md`
- **Database Migrations**: `migrations/README.md`
- **Jitsi Integration**: `docs/JITSI_INTEGRATION.md`

## Support

For issues or questions:

1. Check documentation in `docs/`
2. Review error logs
3. Check Supabase dashboard for database issues
4. Verify environment variables are set correctly

## Success Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Migrations applied
- [ ] Environment variables configured
- [ ] Server starts successfully
- [ ] Health endpoint returns 200
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can get current user
- [ ] Tests pass (if configured)

Once all checks pass, you're ready to develop!


