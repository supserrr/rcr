# Vercel Deployment Guide - Rwanda Cancer Relief

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/supserrr/rwanda-cancer-relief)

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Optional: AI SDK key for chat functionality

## Deployment Steps

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository `supserrr/rwanda-cancer-relief`
4. Vercel will auto-detect the monorepo structure

### 2. Configure Project Settings

Vercel should auto-detect these settings from `vercel.json`:

```json
{
  "rootDirectory": "apps/web",
  "buildCommand": "pnpm build --filter=web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

**Verify Settings:**
- Framework Preset: **Next.js**
- Root Directory: **apps/web**
- Build Command: **pnpm build --filter=web**
- Output Directory: **apps/web/.next**

### 3. Configure Environment Variables

Go to **Settings → Environment Variables** and add:

#### Required for Build and Full Functionality

```
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get from: https://supabase.com/dashboard/project/_/settings/api

#### Optional but Recommended

```
# AI SDK for chat functionality
AI_SDK_KEY=your_ai_sdk_key_here
```

Get from: https://sdk.vercel.ai/docs/getting-started

#### Optional Variables

```
# For web search in AI chat
PERPLEXITY_API_KEY=your_perplexity_key_here

# Alternative AI provider
OPENAI_API_KEY=your_openai_key_here

# Custom Jitsi instance (currently using free 8x8.vc)
NEXT_PUBLIC_JITSI_DOMAIN=your-jitsi-domain.com
NEXT_PUBLIC_JITSI_APP_ID=your-app-id
```

**Environment Selection:**
- Production: Select for production deployments
- Preview: Select for pull request previews
- Development: Select for local development

**Note:** Supabase variables are optional during build, but required at runtime for Supabase features (OAuth authentication) to work. If you don't have Supabase configured yet, the build will succeed, but Supabase features will show helpful error messages when accessed.

### 4. Deploy

Click **Deploy** and wait for the build to complete.

Build time: ~3-5 minutes for first deployment

## Post-Deployment

### Verify Deployment

Your app will be available at:
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch-username.vercel.app`

### Test Key Features

1. **Landing Page** - `/`
2. **Authentication** - `/signin`
3. **Dashboards** - `/dashboard/patient`, `/dashboard/counselor`, `/dashboard/admin`
4. **AI Chat** - `/dashboard/patient/ai-chat`
5. **Video Sessions** - `/dashboard/patient/sessions`

### Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will handle SSL certificates automatically

## Troubleshooting

### Build Failures

**Issue:** Package manager errors
```bash
Solution: Ensure pnpm version matches package.json
"packageManager": "pnpm@10.4.1"
```

**Issue:** Monorepo workspace not found
```bash
Solution: Verify pnpm-workspace.yaml is in root
```

**Issue:** @workspace/ui not transpiling
```bash
Solution: Check next.config.mjs has transpilePackages
```

### Runtime Errors

**Issue:** AI chat not working
```
Solution: Add AI_SDK_KEY environment variable
```

**Issue:** Jitsi video not loading
```
Solution: Check browser console for CORS issues
Current: Using 8x8.vc (no API key required)
```

**Issue:** Module not found errors
```
Solution: Verify all workspace dependencies are in root package.json
```

### Performance Issues

**Issue:** Slow page loads
```
Solution: Enable Vercel Edge Network in settings
```

**Issue:** Large bundle size
```
Solution: Review dynamic imports and code splitting
```

## Monorepo Considerations

### Build Configuration

Vercel automatically handles:
- Turborepo build caching
- Workspace dependency resolution
- Parallel package builds

### Output Directory

The build output is located at:
```
apps/web/.next/
```

This is configured in `vercel.json`.

### Cache Configuration

Vercel caches:
- `node_modules/` (shared across workspaces)
- `.next/cache/` (Next.js build cache)
- `.turbo/` (Turborepo cache)

## Environment-Specific Configuration

### Production

Recommended settings:
```env
NODE_ENV=production
DEBUG=false
```

Enable:
- Analytics
- Error tracking
- Performance monitoring

### Preview (Staging)

Use same variables as production but with:
- Test data
- Pre-production API endpoints
- Debug mode enabled

### Development

Local `.env.local` file:
```env
NODE_ENV=development
DEBUG=true
```

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- Production: Pushes to `main` branch
- Preview: Pull requests and branches
- Development: Local development server

### Deployment Configuration

Configure in `vercel.json` or Vercel Dashboard:
- Build commands
- Environment variables
- Ignored build commands
- Deployment protection

## Monitoring & Analytics

### Vercel Analytics

1. Go to **Settings → Analytics**
2. Enable Web Vitals
3. Track Core Web Vitals in dashboard

### Error Tracking

Consider integrating:
- Sentry (error monitoring)
- LogRocket (session replay)
- Vercel Analytics (performance)

## Security Considerations

### Authentication

Current: Mock authentication
- Production requires backend integration
- Implement JWT token validation
- Add CSRF protection

### API Security

- Rate limiting on `/api/chat`
- Validate all inputs
- Sanitize user data
- Use HTTPS only

### Environment Variables

- Never commit `.env` files
- Use Vercel's encrypted storage
- Rotate keys periodically
- Review access logs

## Cost Estimation

### Free Tier

Vercel Hobby (Free) includes:
- 100GB bandwidth/month
- 1,000,000 requests/day
- 100GB storage
- Free SSL certificates
- Custom domains
- Preview deployments

### Paid Plans

If you exceed free tier:
- Pro: $20/month
- Enterprise: Custom pricing

## Next Steps

### Production Readiness

1. **Backend Integration**
   - Replace mock authentication
   - Connect to real database
   - Implement API endpoints

2. **Security Hardening**
   - Add rate limiting
   - Implement CSRF protection
   - Set up monitoring

3. **Performance**
   - Enable ISR (Incremental Static Regeneration)
   - Implement caching strategies
   - Optimize images

4. **Compliance**
   - HIPAA compliance for healthcare data
   - GDPR compliance for EU users
   - COPPA compliance if applicable

## Support

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Turborepo Deployment](https://turbo.build/repo/docs/deploy)
- [Project README](../README.md)

### Getting Help

- Check [Vercel Status](https://www.vercel-status.com/)
- Review build logs in Vercel Dashboard
- Check [GitHub Issues](https://github.com/supserrr/rwanda-cancer-relief/issues)

## Deployment Checklist

Before deploying:

- [ ] Environment variables configured
- [ ] Build tests passing locally
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] All dependencies installed
- [ ] Custom domains configured (if needed)
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Documentation updated

## Success!

Your app is now deployed and accessible at:
**https://your-project.vercel.app**

Monitor deployments in the Vercel Dashboard and continue developing with instant preview deployments on every commit!

