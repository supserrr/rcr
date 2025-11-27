# Environment Variables Example

This document lists all environment variables used in the Rwanda Cancer Relief application.

## Supabase Configuration

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public, safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Development URL (optional, for local development)
NEXT_PUBLIC_SUPABASE_DEV_URL=http://localhost:54321

# Supabase Development Anonymous Key (optional)
NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY=your-dev-anon-key
```

## Resend Email Configuration

**Note**: Resend SMTP is configured directly in Supabase Dashboard, not via environment variables.

To configure Resend in Supabase:
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable Custom SMTP
3. Use these settings:
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **User**: `resend`
   - **Password**: Your Resend API key
   - **Sender Email**: `noreply@yourdomain.com`
   - **Sender Name**: `Rwanda Cancer Relief`

See [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md) for detailed setup instructions.

## API Configuration

```env
# API Base URL (optional, defaults to same origin)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Socket URL for real-time features (optional)
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
```

## Google OAuth

```env
# Google OAuth Client ID (for Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed setup instructions.

## Jitsi Video Conferencing

```env
# Jitsi Domain (default: meet.jit.si for free tier)
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc

# Jitsi JaaS App ID (required for JaaS)
NEXT_PUBLIC_JITSI_APP_ID=your-jitsi-app-id

# Jitsi Private Key (server-side only, for JWT signing)
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
[... your full private key ...]
-----END RSA PRIVATE KEY-----"
```

See [Jitsi Setup Guide](../features/jitsi/SETUP.md) and [Jitsi Production Deployment](./JITSI_PRODUCTION.md) for detailed setup instructions.

## AI Assistant

```env
# AI Assistant API URL (optional)
NEXT_PUBLIC_ASSISTANT_API_URL=https://api.example.com
```

## Server-Side Only Variables

These are only available on the server and should NOT be prefixed with `NEXT_PUBLIC_`:

```env
# Node Environment
NODE_ENV=development

# Supabase Service Role Key (server-side only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase Access Token (for Management API, server-side only)
SUPABASE_ACCESS_TOKEN=your-access-token

# Jitsi Private Key (server-side only, for JWT signing)
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
[... your full private key ...]
-----END RSA PRIVATE KEY-----"
```

## Development Setup

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values**:
   - Get Supabase credentials from [supabase.com/dashboard](https://supabase.com/dashboard)
   - Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Configure Resend in Supabase Dashboard (see [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md))

3. **Never commit `.env.local`**:
   - It's already in `.gitignore`
   - Contains sensitive credentials

## Production Setup (Vercel)

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add all required variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_JITSI_DOMAIN` (if using JaaS)
   - `NEXT_PUBLIC_JITSI_APP_ID` (if using JaaS)
   - `JITSI_PRIVATE_KEY` (server-side only, if using JaaS)
   - Any other required variables

3. **Set environment-specific values**:
   - Production: Use production Supabase project
   - Preview: Use staging Supabase project (optional)
   - Development: Use local `.env.local`

4. **Configure Resend in Supabase Dashboard**:
   - Production project: Use production Resend API key
   - Staging project: Use development Resend API key (optional)

## Security Notes

- ✅ **Safe for client-side** (NEXT_PUBLIC_*): Supabase URL, Anon Key, Google Client ID, Jitsi Domain, Jitsi App ID
- ❌ **Never expose to client**: Service Role Key, Access Token, API Keys, Jitsi Private Key
- 🔒 **Keep secrets secure**: Use Vercel Environment Variables for production
- 🔄 **Rotate keys regularly**: Especially after team member changes
