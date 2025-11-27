# Jitsi Production Deployment Guide

This guide explains how to configure Jitsi JaaS keys for production deployments.

## Security Principles

### Private Key Storage Rules

1. NEVER store in client-side environment variables (`NEXT_PUBLIC_*`)
2. ALWAYS store as server-side environment variable
3. NEVER commit to git or version control
4. ALWAYS use your deployment platform's secure secrets management

## Current Configuration

The private key is correctly configured as a **server-side only** variable:

```typescript
// apps/web/src/env.ts
server: {
  JITSI_PRIVATE_KEY: z.string().min(1).optional(), // ✅ Server-side only
}
```

This means:
- ✅ **Secure**: Not exposed to client bundle
- ✅ **Server-only**: Only accessible in API routes and server components
- ✅ **Validated**: Type-checked and validated at runtime

## Production Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Add Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

**Client-Side Variables** (Public):
```
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=your_app_id_here
```

**Server-Side Variables** (Private):
```
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[... your full private key ...]
-----END PRIVATE KEY-----"
```

#### Step 2: Environment Selection

For each variable, select which environments to apply:
- ✅ **Production** - Select for production deployments
- ✅ **Preview** - Select if you want to test in preview deployments
- ❌ **Development** - Optional (use local .env.local instead)

#### Step 3: Add Multiline Private Key

**Important**: Vercel's UI allows multiline values. When pasting the private key:

1. Click "Add" next to `JITSI_PRIVATE_KEY`
2. Paste the **entire** private key including:
   - `-----BEGIN PRIVATE KEY-----`
   - All lines of the key
   - `-----END PRIVATE KEY-----`
3. Wrap in double quotes if needed
4. Save

#### Step 4: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Or push a new commit to trigger deployment

### Option 2: Other Platforms

#### Netlify

1. Go to **Site settings → Environment variables**
2. Add variables (same as Vercel)
3. Private key can be multiline

#### Railway

1. Go to **Variables** tab in project
2. Add environment variables
3. Supports multiline values

#### AWS Amplify / Other AWS Services

1. Use AWS Systems Manager Parameter Store or Secrets Manager
2. Store private key as encrypted secret
3. Reference in your deployment configuration

#### Docker / Self-Hosted

1. Use Docker secrets or environment files
2. Mount `.env` file (never commit it)
3. Or use a secrets management service

### Option 3: Secrets Management Services

For advanced setups, consider:

- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Cloud Secret Manager**

Access from your application using their SDKs.

## Verifying Production Configuration

### Check 1: Environment Variables Loaded

In your production deployment, verify variables are set:

```bash
# This should NOT expose the private key
echo $NEXT_PUBLIC_JITSI_DOMAIN
echo $NEXT_PUBLIC_JITSI_APP_ID

# This should be empty/undefined (server-side only)
echo $JITSI_PRIVATE_KEY
# Output: (empty - this is correct!)
```

### Check 2: Server-Side Access

The private key is only accessible in:
- ✅ API routes (`app/api/**`)
- ✅ Server Components
- ✅ Server Actions
- ✅ Middleware
- ❌ Client Components (cannot access)

### Check 3: Browser Check

Open browser DevTools → Network tab:
- ✅ Should see `NEXT_PUBLIC_JITSI_DOMAIN` in client code
- ✅ Should see `NEXT_PUBLIC_JITSI_APP_ID` in client code
- ❌ Should NEVER see `JITSI_PRIVATE_KEY` anywhere

## Troubleshooting

### Issue: Private Key Not Loading in Production

**Check:**
1. Variable name is exactly `JITSI_PRIVATE_KEY` (case-sensitive)
2. Multiline key is properly formatted
3. Environment is selected (Production/Preview)
4. Deployment was triggered after adding variables

**Solution:**
```bash
# Check variable exists (in server-side code)
console.log('Private key set:', !!process.env.JITSI_PRIVATE_KEY);
```

### Issue: Private Key Exposed to Client

**Danger**: If you see `JITSI_PRIVATE_KEY` in browser console or network requests:

1. **Immediately** rotate the key in JaaS dashboard
2. Check for `NEXT_PUBLIC_JITSI_PRIVATE_KEY` (should not exist)
3. Verify variable is in `server` section of env.ts
4. Redeploy with corrected configuration

### Issue: Key Format Errors

**Symptoms:**
- "Invalid key format" errors
- JWT signing failures

**Solution:**
- Ensure key includes BEGIN/END markers
- Preserve all newlines
- Use double quotes in environment variable
- Verify no extra spaces or characters

## Security Best Practices

### 1. Key Rotation

Rotate keys periodically:
1. Generate new key pair in JaaS dashboard
2. Update environment variable
3. Deploy with new key
4. Revoke old key after verification

### 2. Access Control

- Limit who can view/modify environment variables
- Use separate keys for staging/production
- Enable audit logs for environment variable changes

### 3. Monitoring

Monitor for:
- Unauthorized access attempts
- Key exposure in logs
- Unexpected API usage

### 4. Backup

Keep encrypted backups of:
- Private key (encrypted)
- App ID
- Key rotation history

## Example: Vercel CLI

You can also set environment variables via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add server-side variable (private)
vercel env add JITSI_PRIVATE_KEY production

# Add client-side variables (public)
vercel env add NEXT_PUBLIC_JITSI_DOMAIN production
vercel env add NEXT_PUBLIC_JITSI_APP_ID production

# Verify
vercel env ls
```

## Production Checklist

Before going live:

- [ ] Private key added to production environment variables
- [ ] Private key NOT in any client-side variables
- [ ] App ID added to client-side variables
- [ ] Domain configured (8x8.vc)
- [ ] Variables verified in deployment
- [ ] Key rotation policy established
- [ ] Access logs enabled
- [ ] Backup of key stored securely
- [ ] Team members know key location
- [ ] Documentation updated

## Current Setup Summary

**Development (Local):**
- Stored in: `apps/web/.env.local`
- Access: Server-side only
- Git: Ignored (in `.gitignore`)

**Production:**
- Stored in: Deployment platform's environment variables
- Access: Server-side only
- Security: Encrypted by platform

## Next Steps

1. **Add to Vercel** (or your deployment platform)
2. **Verify** deployment uses correct variables
3. **Test** Jitsi integration in production
4. **Monitor** for any security issues

For setup instructions, see:
- [Jitsi Setup Guide](../features/jitsi/SETUP.md)
- [Keys Setup Guide](../features/jitsi/KEYS_SETUP.md)

