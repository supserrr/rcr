# Environment Setup Guide

This guide provides detailed instructions for setting up the development and production environments for the Rwanda Cancer Relief project.

## Overview

The project requires environment variables for multiple services:

- Supabase (database, auth, storage)
- Vercel AI Gateway
- ElevenLabs
- Resend (email)
- Jitsi JaaS
- Application configuration

## Development Environment

### Required Files

Create the following environment file:

- `apps/web/.env.local` - Local development environment variables

### Environment Variables

#### Supabase Configuration

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase Access Token (for migrations)
SUPABASE_ACCESS_TOKEN=your-access-token
```

**Where to find**:
- Project URL and keys: Supabase Dashboard > Project Settings > API
- Access Token: Supabase Dashboard > Account Settings > Access Tokens

#### Google OAuth (Supabase)

```bash
# Google OAuth Client ID
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id

# Google OAuth Client Secret
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Setup**: See [Google OAuth Setup Guide](../deployment/GOOGLE_OAUTH_SETUP.md)

#### Vercel AI Gateway

```bash
# Vercel AI Gateway API Key
ASSISTANT_API_KEY=your-vercel-ai-gateway-key
```

**Where to find**: Vercel Dashboard > Project Settings > Environment Variables

#### ElevenLabs (Voice Features)

```bash
# ElevenLabs API Key (if using voice features)
ELEVENLABS_API_KEY=your-elevenlabs-key
```

**Where to find**: ElevenLabs Dashboard > Profile > API Keys

#### Resend (Email)

```bash
# Resend API Key (for email services)
RESEND_API_KEY=your-resend-api-key
```

**Setup**: See [Resend Email Setup Guide](../deployment/RESEND_EMAIL_SETUP.md)

#### Jitsi JaaS (Video Conferencing)

```bash
# Jitsi JaaS App ID
NEXT_PUBLIC_JITSI_APP_ID=your-jitsi-app-id

# Jitsi JaaS Key ID
NEXT_PUBLIC_JITSI_KEY_ID=your-jitsi-key-id

# Jitsi JaaS Private Key
JITSI_PRIVATE_KEY=your-jitsi-private-key
```

**Setup**: See [Jitsi Setup Guide](../features/jitsi/SETUP.md)

#### Application Configuration

```bash
# Application URL (for callbacks and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Complete Example

See `docs/deployment/ENV_EXAMPLE.md` for a complete example with all variables.

## Production Environment

### Vercel Environment Variables

All environment variables must be set in the Vercel dashboard:

1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add each variable for the `production` environment
3. Ensure sensitive keys use secure values

### Supabase Production

1. Use production Supabase project credentials
2. Ensure RLS policies are configured
3. Verify storage buckets are set up
4. Confirm Edge Functions are deployed

### Environment-Specific Configuration

**Development**:
- Use development Supabase project
- Use local URLs for callbacks
- Enable debug logging

**Production**:
- Use production Supabase project
- Use production domain for callbacks
- Disable debug logging
- Enable error tracking

## Verification

### Check Environment Variables

```bash
# Verify environment variables are loaded
cd apps/web
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Test Connections

1. **Supabase Connection**:
   ```bash
   # Test database connection
   pnpm --filter @apps/web seed:dashboard
   ```

2. **Authentication**:
   - Test sign up flow
   - Test sign in flow
   - Test Google OAuth

3. **Services**:
   - Test email sending (if configured)
   - Test video calls (if configured)
   - Test AI features (if configured)

## Security Considerations

### Never Commit Secrets

- `.env.local` is in `.gitignore`
- Never commit environment files
- Use Vercel environment variables for production
- Rotate keys regularly

### Key Rotation

1. Generate new keys in service dashboards
2. Update environment variables
3. Test functionality
4. Remove old keys

### Access Control

- Limit access to production credentials
- Use service role keys only server-side
- Use anon keys for client-side
- Implement proper RLS policies

## Troubleshooting

### Common Issues

**Issue**: Environment variables not loading
- **Solution**: Restart development server
- **Solution**: Verify file is named `.env.local`
- **Solution**: Check variable names match code

**Issue**: Supabase connection fails
- **Solution**: Verify URL and keys are correct
- **Solution**: Check Supabase project is active
- **Solution**: Verify network connectivity

**Issue**: OAuth redirect fails
- **Solution**: Check redirect URLs in Supabase
- **Solution**: Verify OAuth credentials
- **Solution**: See [Supabase Redirect URLs](../deployment/SUPABASE_REDIRECT_URLS.md)

## Additional Resources

- [Environment Variables Example](../deployment/ENV_EXAMPLE.md)
- [Supabase Setup](../deployment/SUPABASE_REDIRECT_URLS.md)
- [Google OAuth Setup](../deployment/GOOGLE_OAUTH_SETUP.md)
- [Resend Email Setup](../deployment/RESEND_EMAIL_SETUP.md)
- [Jitsi Setup](../features/jitsi/SETUP.md)

---

**Last Updated**: [Date]
**Maintained By**: Development Team
