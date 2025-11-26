# Production Environment Variables

Complete list of environment variables needed for production deployment.

## Client-Side Variables (Public)

These are exposed to the browser and prefixed with `NEXT_PUBLIC_`:

```env
# Jitsi Configuration
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=2ec2e4abf2874096ba00d895b9672444

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Other client-side variables
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_SOCKET_URL=https://your-socket-url.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Server-Side Variables (Private)

These are **NEVER** exposed to the client and have **NO** `NEXT_PUBLIC_` prefix:

```env
# Jitsi Private Key (SERVER-SIDE ONLY)
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCQ6pm5ysUJ2zJ
[... full private key ...]
-----END PRIVATE KEY-----"

# Node Environment
NODE_ENV=production

# Other server-side variables (if any)
# Example: Database connection strings, API secrets, etc.
```

## Security Rules

### ✅ DO:

- Store private keys in server-side variables
- Use your deployment platform's secrets management
- Rotate keys periodically
- Limit access to environment variables
- Enable audit logs

### ❌ DON'T:

- Use `NEXT_PUBLIC_` prefix for private keys
- Commit `.env` files to git
- Store secrets in client-side code
- Share private keys in documentation
- Expose private keys in logs

## Vercel Setup

See [JITSI_PRODUCTION_SETUP.md](./JITSI_PRODUCTION_SETUP.md) for detailed Vercel instructions.

## Quick Reference

| Variable | Type | Required | Purpose |
|----------|------|----------|---------|
| `NEXT_PUBLIC_JITSI_DOMAIN` | Client | Yes | Jitsi domain |
| `NEXT_PUBLIC_JITSI_APP_ID` | Client | Yes | JaaS app ID |
| `JITSI_PRIVATE_KEY` | Server | Yes | Private key for JWT signing |

## Verification

After deployment, verify:
1. Private key is NOT in browser bundle
2. Client variables are accessible in browser
3. Server variables work in API routes
4. Jitsi integration functions correctly

