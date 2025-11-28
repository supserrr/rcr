# Supabase Edge Functions Deployment Guide

Complete guide for deploying the Rwanda Cancer Relief backend to Supabase Edge Functions.

## Prerequisites

Before deploying, ensure you have:

1. ✅ Supabase project created (see `SUPABASE_SETUP.md`)
2. ✅ Supabase CLI installed
3. ✅ All migrations applied (including Realtime migration)
4. ✅ Environment variables configured

## Step 1: Install Supabase CLI

If not already installed:

```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate with Supabase.

## Step 3: Link Your Project

```bash
cd backend
supabase link --project-ref your-project-ref
```

To find your project ref:
- Go to Supabase Dashboard → Settings → General
- Copy the "Reference ID"

## Step 4: Apply Realtime Migration

The Realtime migration must be applied before deploying Edge Functions:

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Using Supabase Dashboard
# 1. Go to SQL Editor
# 2. Open supabase/migrations/20251106000004_enable_realtime.sql
# 3. Copy and paste into SQL Editor
# 4. Click "Run"
```

Verify Realtime is enabled:

```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see: `messages`, `notifications`, `sessions`, `chats`

## Step 5: Set Edge Function Secrets

Set environment variables for Edge Functions:

```bash
# Set Supabase URL
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co

# Set Supabase Anon Key
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here

# Set Supabase Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Set Frontend URL (for CORS)
supabase secrets set FRONTEND_URL=https://your-frontend-domain.com

# Set Jitsi Domain (optional)
supabase secrets set JITSI_DOMAIN=8x8.vc
```

To view all secrets:

```bash
supabase secrets list
```

## Step 6: Deploy Edge Functions

Deploy all Edge Functions:

```bash
# Deploy auth function
supabase functions deploy auth

# Deploy sessions function
supabase functions deploy sessions

# Deploy chat function
supabase functions deploy chat

# Deploy resources function
supabase functions deploy resources

# Deploy notifications function
supabase functions deploy notifications

# Deploy admin function
supabase functions deploy admin

# Deploy health function
supabase functions deploy health
```

Or deploy all at once:

```bash
supabase functions deploy
```

## Step 7: Verify Deployment

Check deployed functions:

```bash
supabase functions list
```

Test health endpoint:

```bash
curl https://your-project-ref.supabase.co/functions/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "database": "connected"
  }
}
```

## Step 8: Update Frontend Environment Variables

Update your frontend `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Remove or update these (no longer needed for Edge Functions)
# NEXT_PUBLIC_API_URL=http://localhost:10000
# NEXT_PUBLIC_SOCKET_URL=http://localhost:10000
```

## Step 9: Test Edge Functions

### Test Authentication

```bash
# Sign up
curl -X POST https://your-project-ref.supabase.co/functions/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "patient",
    "fullName": "Test User"
  }'

# Sign in
curl -X POST https://your-project-ref.supabase.co/functions/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Test Chat

```bash
# Create chat (requires auth token)
curl -X POST https://your-project-ref.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "participantId": "user-id-here"
  }'
```

### Test Sessions

```bash
# List sessions (requires auth token)
curl -X GET https://your-project-ref.supabase.co/functions/v1/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Step 10: Test Realtime Subscriptions

1. **Start your frontend**:

```bash
cd apps/web
pnpm dev
```

2. **Open browser console** and verify:
   - No Socket.IO connection errors
   - Supabase Realtime subscriptions working
   - Real-time messages updating

3. **Test chat real-time**:
   - Open chat in two browser windows
   - Send message from one window
   - Verify it appears in the other window immediately

## Step 11: Configure CORS (If Needed)

Edge Functions automatically handle CORS, but you can customize in the function code:

```typescript
// In _shared/cors.ts
const defaultOptions: CorsOptions = {
  origin: Deno.env.get('FRONTEND_URL') || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
```

## Troubleshooting

### Edge Function Deployment Fails

**Error: "Function not found"**
- Ensure you're in the `backend` directory
- Check function name matches directory name
- Verify `supabase/functions/` directory structure

**Error: "Permission denied"**
- Verify you're logged in: `supabase login`
- Check project is linked: `supabase link`

**Error: "Module not found"**
- Check import paths in Edge Functions
- Verify shared utilities are in `_shared/` directory
- Ensure Deno-compatible imports (use `https://` URLs)

### Realtime Not Working

**No real-time updates**
- Verify Realtime migration is applied
- Check tables are in `supabase_realtime` publication
- Verify RLS policies allow reads
- Check browser console for subscription errors

**Subscription errors**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
- Ensure user is authenticated before subscribing

### Authentication Errors

**Error: "Invalid token"**
- Verify token is being sent in Authorization header
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

**Error: "Authentication required"**
- Verify user is signed in
- Check token is stored in localStorage
- Verify token is sent with requests

### CORS Errors

**Error: "CORS policy blocked"**
- Verify `FRONTEND_URL` secret is set correctly
- Check CORS configuration in Edge Functions
- Ensure frontend URL matches exactly

## Monitoring

### View Function Logs

```bash
# View logs for specific function
supabase functions logs auth

# View all function logs
supabase functions logs
```

### View in Dashboard

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on function name
4. View logs and metrics

## Performance Optimization

### Function Cold Starts

- Edge Functions have cold start latency (~100-500ms)
- Consider function warming for critical paths
- Use connection pooling for database queries

### Realtime Performance

- Realtime subscriptions are efficient
- Consider pagination for large message lists
- Use indexes (already created in migration)

## Security Checklist

- [ ] Service role key is in secrets only (never in code)
- [ ] CORS is configured correctly
- [ ] RLS policies are enabled on all tables
- [ ] Authentication is required for protected endpoints
- [ ] Rate limiting is configured (if needed)
- [ ] Environment variables are set as secrets

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Test real-time features (chat, notifications, sessions)
3. ✅ Monitor function logs for errors
4. ✅ Set up error tracking (Sentry, etc.)
5. ✅ Configure monitoring and alerts
6. ✅ Update frontend production environment variables
7. ✅ Test end-to-end user flows

## Rollback (If Needed)

If deployment fails:

```bash
# View deployment history
supabase functions list --version

# Rollback to previous version
supabase functions deploy auth --version previous-version
```

## Support

For issues:

1. Check Supabase Dashboard → Edge Functions → Logs
2. Review function logs: `supabase functions logs <function-name>`
3. Verify environment variables: `supabase secrets list`
4. Check Supabase documentation: https://supabase.com/docs/guides/functions

