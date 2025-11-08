# Next Steps - Supabase Edge Functions Deployment

## Current Status

### ✅ Completed

1. **Code Migration**
   - ✅ All Edge Functions created (7 functions)
   - ✅ Shared utilities created
   - ✅ Frontend API client updated
   - ✅ Frontend Realtime client created
   - ✅ Frontend hooks updated
   - ✅ Realtime migration created

2. **Environment Files**
   - ✅ Backend `.env` exists
   - ✅ Frontend `.env.local` exists

3. **Migrations**
   - ✅ Initial schema migration exists
   - ✅ RLS policies migration exists
   - ✅ Seed data migration exists
   - ✅ Realtime migration exists

### ❌ Not Done

1. **Supabase CLI**
   - ❌ Supabase CLI not installed
   - ❌ Project not linked
   - ❌ Edge Functions not deployed

2. **Database Migrations**
   - ❓ Migrations may or may not be applied (need to verify)

3. **Environment Variables**
   - ❓ Need to verify if Supabase credentials are set

## Next Steps

### Step 1: Install Supabase CLI

```bash
# Option A: Using npm
npm install -g supabase

# Option B: Using Homebrew (macOS)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate with Supabase.

### Step 3: Link Your Project

```bash
cd backend
supabase link --project-ref your-project-ref
```

**To find your project ref:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID"

### Step 4: Verify Database Migrations

Check if migrations have been applied:

```bash
# Option A: Using Supabase CLI
supabase db remote list

# Option B: Using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Run this query:
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
ORDER BY inserted_at DESC;
```

**If migrations are NOT applied:**

```bash
# Apply all migrations
supabase db push
```

**If Realtime migration is NOT applied:**

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Open supabase/migrations/20251106000004_enable_realtime.sql
# 3. Copy and paste into SQL Editor
# 4. Click "Run"
```

### Step 5: Set Edge Function Secrets

Set environment variables for Edge Functions:

```bash
# Get your Supabase credentials from Dashboard → Settings → API

# Set Supabase URL
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co

# Set Supabase Anon Key
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here

# Set Supabase Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Set Frontend URL (for CORS)
supabase secrets set FRONTEND_URL=https://your-frontend-domain.com

# Optional: Set Jitsi Domain
supabase secrets set JITSI_DOMAIN=8x8.vc
```

**To view all secrets:**

```bash
supabase secrets list
```

### Step 6: Deploy Edge Functions

Deploy all Edge Functions:

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy auth
supabase functions deploy sessions
supabase functions deploy chat
supabase functions deploy resources
supabase functions deploy notifications
supabase functions deploy admin
supabase functions deploy health
```

### Step 7: Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test health endpoint
curl https://your-project-ref.supabase.co/functions/v1/health
```

### Step 8: Update Frontend Environment Variables

Update `apps/web/.env.local`:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Remove or comment out these (no longer needed):
# NEXT_PUBLIC_API_URL=http://localhost:10000
# NEXT_PUBLIC_SOCKET_URL=http://localhost:10000
```

### Step 9: Test Deployment

```bash
# Test health endpoint
curl https://your-project-ref.supabase.co/functions/v1/health

# Test authentication (sign up)
curl -X POST https://your-project-ref.supabase.co/functions/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "patient",
    "fullName": "Test User"
  }'
```

### Step 10: Test Real-time Features

1. **Start frontend:**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Open browser console** and verify:
   - No Socket.IO connection errors
   - Supabase Realtime subscriptions working
   - Real-time messages updating

3. **Test chat real-time:**
   - Open chat in two browser windows
   - Send message from one window
   - Verify it appears in the other window immediately

## Quick Checklist

- [ ] Install Supabase CLI
- [ ] Login to Supabase
- [ ] Link project
- [ ] Verify/apply database migrations
- [ ] Apply Realtime migration
- [ ] Set Edge Function secrets
- [ ] Deploy Edge Functions
- [ ] Update frontend environment variables
- [ ] Test health endpoint
- [ ] Test authentication
- [ ] Test real-time features

## Troubleshooting

### Supabase CLI Not Found

```bash
# Install globally
npm install -g supabase

# Or use npx
npx supabase --version
```

### Project Link Fails

- Verify you're logged in: `supabase login`
- Check project ref is correct
- Ensure you have access to the project

### Migration Errors

- Check if migrations were already applied
- Verify database connection
- Check Supabase Dashboard → SQL Editor for errors

### Deployment Fails

- Verify secrets are set: `supabase secrets list`
- Check function code for errors
- Review Supabase Dashboard → Edge Functions → Logs

## Need Help?

1. Check `SUPABASE_EDGE_FUNCTIONS_DEPLOYMENT.md` for detailed instructions
2. Review Supabase Dashboard → Edge Functions → Logs
3. Verify environment variables are set correctly
4. Check Supabase documentation: https://supabase.com/docs/guides/functions

