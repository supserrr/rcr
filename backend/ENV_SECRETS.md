# Environment Variables and Secrets Guide

Complete list of all required and optional environment variables for the Rwanda Cancer Relief backend, organized by service.

## Server Configuration

### Required

- `PORT` - Server port (default: `5000`)
- `NODE_ENV` - Environment mode (`development`, `production`, `test`)

## Supabase Configuration

### Required

- `SUPABASE_URL` - Your Supabase project URL
  - Format: `https://[project-ref].supabase.co`
  - Location: Supabase Dashboard > Settings > API
  
- `SUPABASE_KEY` - Supabase anonymous (anon) key
  - Used for: Client-side operations with Row Level Security
  - Safe to expose: Yes (with RLS enabled)
  - Location: Supabase Dashboard > Settings > API > Project API keys > `anon` `public` key

- `SUPABASE_SERVICE_KEY` - Supabase service role key
  - Used for: Server-side operations with full database access
  - Safe to expose: **NO** - Never expose to client
  - Location: Supabase Dashboard > Settings > API > Project API keys > `service_role` `secret` key
  - Warning: This key bypasses Row Level Security and has admin privileges

### Optional (for Supabase Edge Functions)

- `SUPABASE_DB_URL` - Direct PostgreSQL connection string
  - Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
  - Note: Database password is required but cannot be retrieved via Management API

### Supabase OAuth Integration (if using Management API)

- `SUPABASE_CLIENT_ID` - OAuth client ID (if building Supabase integrations)
- `SUPABASE_CLIENT_SECRET` - OAuth client secret (if building Supabase integrations)

## Jitsi Meet Configuration

### Required (if using Jitsi for video calls)

- `JITSI_APP_ID` - Jitsi application ID
- `JITSI_APP_SECRET` - Jitsi application secret
- `JITSI_DOMAIN` - Jitsi domain (default: `8x8.vc`)

### How to obtain:
1. Sign up for Jitsi Meet API at https://jitsi.org/
2. Create a new application
3. Retrieve App ID and Secret from dashboard

## Frontend Configuration

### Required

- `FRONTEND_URL` - Frontend application URL
  - Default: `http://localhost:3000` (development)
  - Production: Your production frontend URL

- `CORS_ORIGIN` - CORS allowed origin
  - Default: Same as `FRONTEND_URL`
  - Can be comma-separated for multiple origins

## JWT Configuration

### Required (if using custom JWT alongside Supabase)

- `JWT_SECRET` - Secret key for JWT signing
  - Generate: Strong random string (minimum 32 characters)
  - Warning: Change from default in production
  
- `JWT_EXPIRES_IN` - JWT expiration time
  - Default: `7d` (7 days)
  - Format: `1h`, `24h`, `7d`, etc.

### Recommended Generation

```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

## Email/Notifications Configuration

### Resend (Optional - if using Resend for emails)

- `RESEND_API_KEY` - Resend API key
  - Get from: https://resend.com/api-keys
  - Used for: Sending transactional emails

### SMTP Configuration (Alternative to Resend)

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (typically `587` or `465`)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - Default sender email address

### Supabase Realtime (Alternative - built into Supabase)

No additional environment variables needed. Uses `SUPABASE_KEY` or `SUPABASE_SERVICE_KEY`.

## Render Configuration

### Automatic (Set by Render)

- `RENDER_EXTERNAL_URL` - Full URL of your service
  - Example: `https://your-app.onrender.com`
  - Automatically set by Render

- `RENDER_SERVICE_NAME` - Unique identifier for your service
  - Automatically set by Render

- `RENDER_GIT_BRANCH` - Git branch associated with current deploy
  - Automatically set by Render

- `RENDER_GIT_COMMIT` - Commit SHA for current deploy
  - Automatically set by Render

### Manual Configuration

All other environment variables listed above should be manually configured in Render Dashboard:
1. Navigate to your service in Render Dashboard
2. Go to "Environment" tab
3. Add each required environment variable
4. Save changes

## MCP-Specific Environment Variables

### Supabase MCP

No additional environment variables required. Uses Supabase credentials configured in `.cursor/mcp.json`.

### Render MCP

- `RENDER_API_KEY` - Render API key for MCP access
  - Location: Already configured in `.cursor/mcp.json`
  - Format: Bearer token starting with `rnd_`

### Assistant-UI MCP

No environment variables required. Auto-installs via `npx`.

### shadcn MCP

No environment variables required.

### next-devtools MCP

No environment variables required.

## Environment File Template

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Jitsi Meet Configuration (Required for video calls)
JITSI_APP_ID=your_jitsi_app_id
JITSI_APP_SECRET=your_jitsi_app_secret
JITSI_DOMAIN=8x8.vc

# Frontend Configuration (Required)
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# JWT Configuration (Required if using custom JWT)
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# Email/Notifications (Optional - choose one)
# Option 1: Resend
RESEND_API_KEY=re_your_resend_api_key

# Option 2: SMTP
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your_smtp_username
# SMTP_PASS=your_smtp_password
# SMTP_FROM=noreply@yourdomain.com
```

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use different secrets for each environment** - Development, staging, production
3. **Rotate secrets regularly** - Especially `JWT_SECRET` and `SUPABASE_SERVICE_KEY`
4. **Use secrets managers in production** - Consider AWS Secrets Manager, HashiCorp Vault, etc.
5. **Limit access to service keys** - Only use `SUPABASE_SERVICE_KEY` on server-side
6. **Validate environment variables** - Ensure all required variables are set before starting

## How to Get Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_KEY` (keep this secret!)

## Verification Checklist

- [ ] `SUPABASE_URL` is set and valid
- [ ] `SUPABASE_KEY` is set (anon key)
- [ ] `SUPABASE_SERVICE_KEY` is set (service role key)
- [ ] `PORT` is set (default: 5000)
- [ ] `FRONTEND_URL` matches your frontend URL
- [ ] `CORS_ORIGIN` is configured correctly
- [ ] `JWT_SECRET` is set and secure (not default value)
- [ ] `JITSI_APP_ID` and `JITSI_APP_SECRET` are set (if using video calls)
- [ ] Email provider configured (Resend or SMTP)
- [ ] `.env` file is in `.gitignore`

## References

- [Supabase Environment Variables](https://supabase.com/docs/guides/functions/secrets)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Render Environment Variables](https://render.com/docs/configure-environment-variables)
- [Jitsi Meet API](https://jitsi.org/api/)
- [Resend API](https://resend.com/docs)

