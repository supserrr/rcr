# Deployment Guide

Guide for deploying the Rwanda Cancer Relief backend to production.

## Prerequisites

1. Render account created
2. Supabase project configured
3. Environment variables documented (see `ENV_SECRETS.md`)
4. Database migrations applied
5. All tests passing

## Deployment Platforms

### Render (Recommended)

Render is the recommended deployment platform for this backend.

#### Setup Steps

1. **Create Render Account**
   - Go to https://render.com
   - Sign up or log in

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `rwanda-cancer-relief-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to users (e.g., `Oregon`)
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**

   Add all required environment variables:

   ```env
   NODE_ENV=production
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   JITSI_APP_ID=your_jitsi_app_id
   JITSI_APP_SECRET=your_jitsi_app_secret
   JITSI_DOMAIN=8x8.vc
   FRONTEND_URL=https://your-frontend-domain.com
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

   **Important**: Never commit secrets to Git. Use Render's environment variable management.

5. **Configure Health Check**

   - **Health Check Path**: `/health`
   - **Health Check Interval**: 30 seconds

6. **Deploy**

   - Click "Create Web Service"
   - Wait for deployment to complete
   - Check logs for any errors

#### Using render.yaml

Alternatively, use the `render.yaml` file:

1. Ensure `render.yaml` is in the `backend/` directory
2. Connect repository to Render
3. Render will automatically detect `render.yaml`
4. Review and confirm deployment settings
5. Deploy

### Other Platforms

#### Heroku

1. Install Heroku CLI
2. Create Heroku app: `heroku create rwanda-cancer-relief-api`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

#### Railway

1. Create Railway account
2. Create new project
3. Connect repository
4. Configure environment variables
5. Deploy

#### AWS

1. Use Elastic Beanstalk or EC2
2. Configure environment variables
3. Set up load balancer
4. Deploy application

## Database Setup

### Apply Migrations

Before deploying, ensure database migrations are applied:

```bash
# Using Supabase Dashboard
1. Go to SQL Editor
2. Run migrations in order:
   - 001_initial_schema.sql
   - 002_rls_policies.sql
   - 003_seed_data.sql

# Or using Supabase CLI
supabase db push
```

### Verify Database Connection

Test database connection after deployment:

```bash
curl https://your-api-url.com/health
```

## Post-Deployment Checklist

- [ ] Verify API is accessible
- [ ] Test authentication endpoints
- [ ] Verify database connection
- [ ] Test Socket.IO connection
- [ ] Check logs for errors
- [ ] Verify CORS configuration
- [ ] Test all endpoints
- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Set up backups

## Monitoring

### Health Check Endpoint

```bash
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Logs

Monitor logs via:

- Render Dashboard → Logs
- Supabase Dashboard → Logs
- Error tracking service (Sentry, etc.)

## Environment Variables

All required environment variables are documented in `ENV_SECRETS.md`.

**Critical Variables:**

- `SUPABASE_URL` - Database connection
- `SUPABASE_SERVICE_KEY` - Admin operations
- `JITSI_APP_SECRET` - Video calls
- `FRONTEND_URL` - CORS configuration

## SSL/HTTPS

Render automatically provides SSL certificates. No additional configuration needed.

## Scaling

### Auto-scaling (Render)

Render automatically scales based on traffic. Configure in service settings:

- **Min Instances**: 1
- **Max Instances**: 5 (adjust based on needs)

### Manual Scaling

Increase plan size in Render dashboard:

- Starter: $7/month
- Standard: $25/month
- Pro: $85/month

## Backup Strategy

### Database Backups

1. Supabase automatically backs up PostgreSQL
2. Manual backups via Supabase Dashboard
3. Export data via Supabase CLI

### Application Backups

1. Git repository serves as code backup
2. Environment variables backed up in Render
3. Consider external backup service for critical data

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

## Troubleshooting

### Deployment Fails

1. Check build logs for errors
2. Verify environment variables are set
3. Check Node.js version compatibility
4. Review error logs

### Database Connection Issues

1. Verify Supabase URL and keys
2. Check network connectivity
3. Verify RLS policies allow access
4. Test connection manually

### CORS Errors

1. Verify `FRONTEND_URL` matches frontend domain
2. Check CORS configuration in code
3. Verify frontend is using correct API URL

### Socket.IO Connection Issues

1. Verify Socket.IO server is running
2. Check WebSocket support in Render plan
3. Verify authentication is working
4. Check client connection code

## Performance Optimization

1. **Caching**: Implement Redis for session caching
2. **CDN**: Use CDN for static assets
3. **Database Indexes**: Ensure all indexes are created
4. **Connection Pooling**: Configure PostgreSQL connection pooling
5. **Monitoring**: Set up APM (Application Performance Monitoring)

## Security

1. **Environment Variables**: Never commit secrets
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict CORS to known origins
4. **Rate Limiting**: Implement rate limiting
5. **Input Validation**: Validate all inputs
6. **Authentication**: Secure all endpoints

## Next Steps

1. Set up CI/CD pipeline
2. Configure automated testing
3. Set up monitoring and alerts
4. Create staging environment
5. Document API endpoints
6. Set up error tracking

