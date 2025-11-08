# Render Deployment Quick Start

Quick guide to deploy the Rwanda Cancer Relief backend to Render.

## Prerequisites

1. Render account (sign up at https://render.com)
2. Supabase project configured
3. All environment variables ready

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Connect Repository**
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your Git repository
   - Select the `rwanda-cancer-relief` repository

2. **Review Configuration**
   - Render will detect `backend/render.yaml`
   - Review the service configuration
   - Click "Apply"

3. **Set Environment Variables**
   - Go to the service → Environment
   - Set all required variables (see checklist)
   - Click "Save Changes"

4. **Deploy**
   - Render will automatically deploy
   - Monitor build logs
   - Wait for deployment to complete

### Option 2: Manual Setup

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your Git repository
   - Select the `rwanda-cancer-relief` repository

2. **Configure Service**
   - **Name**: `rwanda-cancer-relief-api`
   - **Environment**: `Node`
   - **Region**: `Oregon`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter`

3. **Set Environment Variables**
   - Add all required variables (see checklist)
   - Mark sensitive ones as "Secret"

4. **Configure Health Check**
   - **Health Check Path**: `/health`

5. **Deploy**
   - Click "Create Web Service"
   - Monitor build logs
   - Wait for deployment

## Required Environment Variables

Set these in Render Dashboard → Environment:

```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
JITSI_APP_ID=your_jitsi_app_id
JITSI_APP_SECRET=your_jitsi_app_secret
JITSI_DOMAIN=8x8.vc
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

**Note**: `PORT` is automatically set by Render - do not set it manually.

## Verify Deployment

1. **Health Check**
   ```bash
   curl https://your-app.onrender.com/health
   ```
   Should return: `{"status":"UP","timestamp":"..."}`

2. **API Root**
   ```bash
   curl https://your-app.onrender.com/api
   ```

3. **Check Logs**
   - Go to Render Dashboard → Logs
   - Verify no errors
   - Check for "Supabase connection successful"

## Troubleshooting

### Build Fails
- Check build logs
- Verify Node.js version (>=18.0.0)
- Check for TypeScript errors

### Deployment Fails
- Check deployment logs
- Verify environment variables are set
- Check for runtime errors

### Health Check Fails
- Verify `/health` endpoint exists
- Check server is running
- Verify PORT is not manually set

### Database Connection Issues
- Verify Supabase credentials
- Check Supabase project is active
- Test connection manually

## Next Steps

1. Update frontend to use production API URL
2. Test all endpoints
3. Set up monitoring
4. Configure backups

For detailed information, see `RENDER_DEPLOYMENT_CHECKLIST.md`.

