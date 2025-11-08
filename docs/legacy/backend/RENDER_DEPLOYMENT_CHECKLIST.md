# Render Deployment Checklist

Complete checklist for deploying the Rwanda Cancer Relief backend to Render.

## Pre-Deployment Checklist

### 1. Code Preparation

- [ ] All code is committed to Git
- [ ] All tests pass locally (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Health endpoint works (`curl http://localhost:10000/health`)

### 2. Environment Variables

Ensure all required environment variables are documented and ready to be set in Render:

- [ ] `NODE_ENV=production` (set automatically by render.yaml)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_KEY` - Your Supabase anon/public key
- [ ] `SUPABASE_SERVICE_KEY` - Your Supabase service role key (keep secret)
- [ ] `JITSI_APP_ID` - Jitsi application ID
- [ ] `JITSI_APP_SECRET` - Jitsi application secret (keep secret)
- [ ] `JITSI_DOMAIN=8x8.vc` (set automatically by render.yaml)
- [ ] `FRONTEND_URL` - Your frontend deployment URL (e.g., `https://your-app.vercel.app`)
- [ ] `CORS_ORIGIN` - Same as FRONTEND_URL or comma-separated list of allowed origins

**Note**: `PORT` is automatically set by Render - do not set it manually.

### 3. Database Setup

- [ ] Supabase project is created and configured
- [ ] All migrations are applied to production database
  - [ ] `001_initial_schema.sql`
  - [ ] `002_rls_policies.sql`
  - [ ] `003_seed_data.sql` (if needed)
- [ ] Database connection tested from local environment
- [ ] RLS policies are properly configured
- [ ] Service role key has necessary permissions

### 4. Configuration Files

- [ ] `render.yaml` is in the `backend/` directory
- [ ] `render.yaml` has correct `rootDir: backend`
- [ ] `package.json` has correct build and start scripts
- [ ] `tsconfig.json` is properly configured
- [ ] `.gitignore` excludes `node_modules`, `dist`, and `.env`

### 5. Dependencies

- [ ] All production dependencies are in `dependencies` (not `devDependencies`)
- [ ] Node.js version is compatible (>=18.0.0, specified in `package.json` engines)
- [ ] npm version is compatible (>=9.0.0)

## Render Setup Steps

### 1. Create Render Account

- [ ] Sign up at https://render.com
- [ ] Verify email address
- [ ] Set up billing (required for web services)

### 2. Connect Repository

- [ ] Go to Render Dashboard
- [ ] Click "New" → "Blueprint" (for render.yaml) OR "Web Service" (for manual setup)
- [ ] Connect your GitHub/GitLab/Bitbucket account
- [ ] Select the `rwanda-cancer-relief` repository
- [ ] Select the branch (usually `main`)

### 3. Configure Service (if not using render.yaml)

If using manual setup instead of render.yaml:

- [ ] **Name**: `rwanda-cancer-relief-api`
- [ ] **Environment**: `Node`
- [ ] **Region**: `Oregon` (or closest to your users)
- [ ] **Branch**: `main`
- [ ] **Root Directory**: `backend`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: `Starter` ($7/month) or higher

### 4. Set Environment Variables

In Render Dashboard → Environment:

- [ ] Set `NODE_ENV=production`
- [ ] Set `SUPABASE_URL` (from Supabase dashboard)
- [ ] Set `SUPABASE_KEY` (anon/public key from Supabase)
- [ ] Set `SUPABASE_SERVICE_KEY` (service role key from Supabase)
- [ ] Set `JITSI_APP_ID` (from Jitsi configuration)
- [ ] Set `JITSI_APP_SECRET` (from Jitsi configuration)
- [ ] Set `JITSI_DOMAIN=8x8.vc`
- [ ] Set `FRONTEND_URL` (your frontend URL)
- [ ] Set `CORS_ORIGIN` (same as FRONTEND_URL or comma-separated list)

**Important**: 
- Never commit secrets to Git
- Use Render's environment variable management
- Mark sensitive variables as "Secret" in Render

### 5. Configure Health Check

- [ ] **Health Check Path**: `/health`
- [ ] **Health Check Interval**: 30 seconds (default)

### 6. Deploy

- [ ] Review all settings
- [ ] Click "Create Web Service" or "Apply" (if using Blueprint)
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete
- [ ] Check deployment status (should be "Live")

## Post-Deployment Verification

### 1. Health Check

- [ ] Health endpoint responds: `curl https://your-app.onrender.com/health`
- [ ] Response is: `{"status":"UP","timestamp":"..."}`

### 2. API Endpoints

- [ ] API root works: `curl https://your-app.onrender.com/api`
- [ ] Authentication endpoints are accessible
- [ ] CORS is properly configured (test from frontend)

### 3. Database Connection

- [ ] Server logs show "Supabase connection successful"
- [ ] No database connection errors in logs
- [ ] Can query database through API endpoints

### 4. Socket.IO

- [ ] Socket.IO server is running
- [ ] WebSocket connections work from frontend
- [ ] No Socket.IO errors in logs

### 5. Logs and Monitoring

- [ ] Check Render logs for errors
- [ ] Verify no critical errors
- [ ] Set up log monitoring (optional)
- [ ] Set up error tracking (e.g., Sentry) - optional but recommended

### 6. Performance

- [ ] Response times are acceptable
- [ ] Health check passes consistently
- [ ] No memory leaks (monitor over time)

## Troubleshooting

### Build Fails

1. Check build logs in Render Dashboard
2. Verify Node.js version compatibility
3. Check for missing dependencies
4. Verify build command is correct
5. Check TypeScript compilation errors

### Deployment Fails

1. Check deployment logs
2. Verify environment variables are set
3. Check for runtime errors
4. Verify start command is correct
5. Check port binding (should use Render's PORT)

### Health Check Fails

1. Verify health endpoint exists: `/health`
2. Check server is listening on correct port
3. Verify server binds to all interfaces (0.0.0.0)
4. Check for startup errors in logs
5. Verify NODE_ENV is set to production

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check Supabase project is active
3. Verify network connectivity
4. Check RLS policies allow access
5. Test connection manually from local environment

### CORS Errors

1. Verify `FRONTEND_URL` matches frontend domain
2. Verify `CORS_ORIGIN` is set correctly
3. Check CORS configuration in code
4. Verify frontend is using correct API URL
5. Check for trailing slashes in URLs

### Socket.IO Issues

1. Verify Socket.IO server initializes
2. Check WebSocket support in Render plan
3. Verify authentication is working
4. Check client connection code
5. Verify CORS allows WebSocket connections

## Environment-Specific Notes

### Development vs Production

- Development uses port 10000 (to avoid macOS AirPlay conflict)
- Production uses Render's automatically assigned PORT
- CORS is more permissive in development
- Error messages are more detailed in development

### Render-Specific

- Render automatically sets `PORT` environment variable
- Render provides SSL/HTTPS automatically
- Render supports WebSockets on all plans
- Render automatically restarts on crashes
- Render provides automatic scaling (on paid plans)

## Scaling Considerations

### Starter Plan ($7/month)

- 512 MB RAM
- 0.5 CPU
- Suitable for low traffic

### Standard Plan ($25/month)

- 2 GB RAM
- 1 CPU
- Better for moderate traffic

### Pro Plan ($85/month)

- 4 GB RAM
- 2 CPUs
- Better for high traffic

### Auto-Scaling

- Configure in Render Dashboard
- Set min/max instances
- Monitor usage and adjust

## Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS is restricted to known origins
- [ ] Rate limiting is implemented (consider adding)
- [ ] Input validation is in place
- [ ] Authentication is required for protected endpoints
- [ ] RLS policies are properly configured
- [ ] Service role key is kept secret

## Backup and Recovery

- [ ] Database backups are configured (Supabase automatic)
- [ ] Code is in version control (Git)
- [ ] Environment variables are documented
- [ ] Rollback procedure is documented
- [ ] Recovery plan is in place

## Monitoring and Alerts

- [ ] Health check monitoring is set up
- [ ] Error tracking is configured (optional)
- [ ] Log aggregation is set up (optional)
- [ ] Alerts are configured for critical issues (optional)
- [ ] Uptime monitoring is set up (optional)

## Next Steps After Deployment

1. Update frontend to use production API URL
2. Test all features end-to-end
3. Set up monitoring and alerts
4. Configure backups
5. Document API endpoints
6. Set up staging environment (optional)
7. Configure CI/CD pipeline (optional)

## Rollback Procedure

If deployment fails:

1. Go to Render Dashboard
2. Navigate to "Manual Deploy"
3. Select previous working commit
4. Deploy that version

Or use Render CLI:

```bash
render deployments rollback --service <service-id> --deployment <deployment-id>
```

## Support and Resources

- Render Documentation: https://render.com/docs
- Render Status: https://status.render.com
- Supabase Documentation: https://supabase.com/docs
- Project Documentation: See `backend/docs/` directory

