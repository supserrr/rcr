# Deployment Complete - Next Steps

## ✅ Deployment Status

All Edge Functions have been successfully deployed to Supabase:

- ✅ **health** - ACTIVE
- ✅ **auth** - ACTIVE  
- ✅ **sessions** - ACTIVE
- ✅ **chat** - ACTIVE
- ✅ **resources** - ACTIVE
- ✅ **notifications** - ACTIVE
- ✅ **admin** - ACTIVE

**Project:** `bdsepglppqbnazfepvmi`  
**Functions URL:** `https://bdsepglppqbnazfepvmi.supabase.co/functions/v1`

## Next Steps

### 1. Test Edge Functions

#### Test Health Endpoint
```bash
curl -X GET https://bdsepglppqbnazfepvmi.supabase.co/functions/v1/health \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Test Authentication
```bash
# Sign up
curl -X POST https://bdsepglppqbnazfepvmi.supabase.co/functions/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "patient",
    "fullName": "Test User"
  }'

# Sign in
curl -X POST https://bdsepglppqbnazfepvmi.supabase.co/functions/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 2. Test Frontend Integration

#### Start Frontend
```bash
cd frontend/apps/web
pnpm dev
```

#### Verify Environment Variables
Check that `frontend/apps/web/.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bdsepglppqbnazfepvmi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Test Frontend Features
1. **Authentication**
   - Go to `/signup` and create an account
   - Go to `/signin` and sign in
   - Verify redirect to dashboard works

2. **Sessions**
   - Create a new session
   - View session list
   - Join a session (if applicable)

3. **Chat**
   - Start a chat
   - Send messages
   - Verify real-time updates work

4. **Resources**
   - View resources
   - Create/edit resources (if authorized)
   - Download resources

5. **Notifications**
   - Check notifications appear
   - Mark notifications as read
   - Verify real-time notifications work

### 3. Test Real-time Features

#### Verify Realtime Subscriptions
1. Open browser console
2. Check for Supabase Realtime connection
3. Test chat real-time:
   - Open chat in two browser windows
   - Send message from one window
   - Verify it appears in the other window immediately
4. Test notifications real-time:
   - Trigger a notification
   - Verify it appears without refresh
5. Test session updates real-time:
   - Update a session
   - Verify updates appear in real-time

### 4. Monitor and Debug

#### View Function Logs
```bash
# View logs for specific function
supabase functions logs auth

# View all function logs
supabase functions logs
```

#### View in Dashboard
1. Go to https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi/functions
2. Click on a function to view logs and metrics
3. Check for any errors or warnings

#### Check Database
1. Go to https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi/editor
2. Verify tables exist and have data
3. Check Realtime is enabled on:
   - `messages` table
   - `notifications` table
   - `sessions` table
   - `chats` table

### 5. Clean Up (Optional)

#### Remove Old References
The following files may still reference old API URLs:
- `frontend/apps/web/lib/socket/client.ts` (deprecated - replaced by Realtime)
- `frontend/apps/web/scripts/test-integration.ts` (may need updating)
- Documentation files (for reference only)

#### Update Documentation
- Update any deployment guides
- Update API documentation
- Update testing guides

### 6. Production Checklist

Before going to production:

- [ ] Test all authentication flows
- [ ] Test all API endpoints
- [ ] Test real-time features
- [ ] Verify CORS is configured correctly
- [ ] Set production environment variables
- [ ] Update frontend production environment variables
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up monitoring and alerts
- [ ] Test with multiple users
- [ ] Load testing (if needed)
- [ ] Security audit
- [ ] Backup strategy

### 7. Troubleshooting

#### Common Issues

**401 Unauthorized Errors**
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- Check token is being sent in Authorization header
- Verify user is authenticated

**CORS Errors**
- Verify `FRONTEND_URL` secret is set correctly
- Check CORS configuration in Edge Functions
- Ensure frontend URL matches exactly

**Real-time Not Working**
- Verify Realtime migration is applied
- Check tables are in `supabase_realtime` publication
- Verify RLS policies allow reads
- Check browser console for subscription errors

**Function Errors**
- Check function logs: `supabase functions logs <function-name>`
- Verify environment variables are set: `supabase secrets list`
- Check Supabase Dashboard → Edge Functions → Logs

### 8. Support Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi
- **Function Logs:** https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi/functions
- **Database Editor:** https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi/editor
- **Documentation:** https://supabase.com/docs/guides/functions

## Summary

✅ **Deployment Complete** - All Edge Functions are deployed and active  
✅ **Migrations Applied** - Database schema and Realtime are configured  
✅ **Environment Variables** - Frontend and backend are configured  
⏳ **Testing Required** - Test all features end-to-end  
⏳ **Monitoring** - Set up monitoring and error tracking  

Next: Test the deployment and verify all features work correctly!

