# Supabase Setup Guide

Complete guide for setting up Supabase for the Rwanda Cancer Relief backend.

## Step 1: Create Supabase Project

1. **Sign Up/Log In**
   - Go to https://supabase.com
   - Sign up for a free account (if you don't have one)
   - Log in to your account

2. **Create New Project**
   - Click "New Project" or "Create Project"
   - Fill in project details:
     - **Name**: `rwanda-cancer-relief` (or your preferred name)
     - **Database Password**: Choose a strong password (save it securely)
     - **Region**: Choose closest to your users (e.g., `US East (Ohio)`)
     - **Pricing Plan**: Free tier is sufficient for development

3. **Wait for Project Initialization**
   - Project setup takes 2-3 minutes
   - Wait for all services to be ready (green checkmarks)

## Step 2: Get Project Credentials

1. **Navigate to Project Settings**
   - Click on your project in the dashboard
   - Go to Settings → API

2. **Copy Required Credentials**
   You'll need these values:

   ```
   Project URL: https://[project-ref].supabase.co
   Anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Important Notes:**
   - **Anon key** (SUPABASE_KEY): Safe to use in client-side code
   - **Service role key** (SUPABASE_SERVICE_KEY): Keep secret! Never expose to client
   - **Database password**: Required for direct PostgreSQL connections (not needed for API)

3. **Save Credentials**
   - Copy these values to your `.env` file (see Step 3)

## Step 3: Configure Environment Variables

1. **Copy Environment Template**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit `.env` File**
   ```bash
   # Open .env in your editor
   code .env
   # or
   nano .env
   ```

3. **Add Supabase Credentials**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Supabase (REQUIRED)
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_role_key_here

   # Frontend (REQUIRED for CORS)
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000

   # Jitsi (Optional - for video calls)
   # JITSI_APP_ID=your_app_id
   # JITSI_APP_SECRET=your_app_secret
   # JITSI_DOMAIN=8x8.vc
   ```

4. **Verify Environment Variables**
   ```bash
   # Check .env file exists and has values
   cat .env | grep SUPABASE
   ```

## Step 4: Apply Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Navigate to SQL Editor**
   - In Supabase dashboard, click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run First Migration (Schema)**
   - Open `backend/migrations/001_initial_schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for "Success" message

3. **Run Second Migration (RLS Policies)**
   - Open `backend/migrations/002_rls_policies.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"
   - Wait for "Success" message

4. **Run Third Migration (Seed Data)**
   - Open `backend/migrations/003_seed_data.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"
   - Wait for "Success" message

### Option B: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Project**
   ```bash
   cd backend
   supabase link --project-ref your-project-ref
   ```

4. **Push Migrations**
   ```bash
   supabase db push
   ```

### Option C: Using psql (Advanced)

1. **Get Connection String**
   - Go to Supabase Dashboard → Settings → Database
   - Find "Connection string" → "URI"
   - Copy the connection string

2. **Connect and Run Migrations**
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   
   # Then run migrations:
   \i migrations/001_initial_schema.sql
   \i migrations/002_rls_policies.sql
   \i migrations/003_seed_data.sql
   ```

## Step 5: Verify Database Setup

### Check Tables Created

1. **In Supabase Dashboard**
   - Go to "Table Editor"
   - Verify these tables exist:
     - ✅ `profiles`
     - ✅ `sessions`
     - ✅ `resources`
     - ✅ `chats`
     - ✅ `messages`
     - ✅ `notifications`

2. **Or Query in SQL Editor**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

### Check RLS Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

### Check Policies Created

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

## Step 6: Test Backend Connection

1. **Start Development Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:5000/health
   ```

   Expected response:
   ```json
   {"status":"UP","timestamp":"2024-01-01T00:00:00.000Z"}
   ```

3. **Test Supabase Connection**
   ```bash
   # Server logs should show:
   # "Testing Supabase connection..."
   # "Supabase connection successful"
   ```

4. **Test Authentication Endpoint**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPassword123!",
       "role": "patient",
       "fullName": "Test User"
     }'
   ```

   If successful, you should receive tokens and the user should be created in Supabase Auth.

## Troubleshooting

### Migration Errors

**Error: "relation already exists"**
- Tables already exist. Check if migrations were already applied.
- To start fresh: Drop tables and re-run migrations (see Rollback section)

**Error: "permission denied"**
- You're using the wrong key. Use service role key for migrations.
- Or ensure you're using service role in SQL Editor.

**Error: "syntax error"**
- Check SQL syntax. Copy entire migration file.
- Ensure no partial copy-paste.

### Connection Errors

**Error: "Invalid API key"**
- Verify `SUPABASE_KEY` matches your anon key exactly.
- Check for extra spaces or quotes in `.env` file.
- Restart server after changing `.env`.

**Error: "Invalid URL"**
- Verify `SUPABASE_URL` format: `https://[project-ref].supabase.co`
- No trailing slash.
- Use HTTPS, not HTTP.

**Error: "Failed to connect"**
- Check Supabase project is active (not paused).
- Verify network connectivity.
- Check firewall/proxy settings.

### RLS Policy Errors

**Error: "Permission denied for table"**
- RLS policies are too restrictive.
- Check policies allow your operations.
- Use service role key for admin operations.

**Error: "Policy not found"**
- Migrations may not have run completely.
- Re-run `002_rls_policies.sql` migration.

## Rollback (If Needed)

If you need to start fresh:

```sql
-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- ... (repeat for all policies)

-- Drop all tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

Then re-run migrations.

## Next Steps

After successful setup:

1. ✅ Test authentication endpoints
2. ✅ Create test users (patient, counselor, admin)
3. ✅ Test session creation
4. ✅ Test resource management
5. ✅ Test chat messaging
6. ✅ Verify notifications work

## Security Checklist

- [ ] Service role key is in `.env` only (never committed)
- [ ] `.env` is in `.gitignore`
- [ ] RLS policies are enabled on all tables
- [ ] Public tables use appropriate RLS policies
- [ ] Service role key is never exposed to client
- [ ] Database password is stored securely

## Support

For issues:

1. Check Supabase Dashboard → Logs for errors
2. Review server logs
3. Verify environment variables
4. Check migration execution logs
5. Review Supabase documentation: https://supabase.com/docs

