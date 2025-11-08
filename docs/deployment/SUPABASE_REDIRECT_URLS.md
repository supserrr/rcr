# Supabase Redirect URL Configuration

This guide explains how to configure redirect URLs in Supabase for OAuth authentication (Google Sign-In) in the Rwanda Cancer Relief application.

## Overview

When users sign in with Google OAuth, Supabase redirects them back to your application after authentication. You must configure these redirect URLs in your Supabase project to allow the authentication flow to complete.

## Required Redirect URLs

Based on your application configuration, you need to add the following redirect URLs:

### Production URLs

1. **Main Production URL:**
   ```
   https://rcr-one.vercel.app/auth/callback
   ```

### Development URLs

2. **Local Development:**
   ```
   http://localhost:3000/auth/callback
   ```

### Vercel Preview URLs (Optional but Recommended)

3. **Vercel Preview Deployments:**
   ```
   https://*-*.vercel.app/auth/callback
   ```
   
   Or more specifically (if you know your Vercel team/account slug):
   ```
   https://*-<your-team-slug>.vercel.app/auth/callback
   ```

   **Note:** Replace `<your-team-slug>` with your actual Vercel team or account slug.

## How to Configure Redirect URLs in Supabase

### Step 1: Access URL Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **RCR** (project ID: `bdsepglppqbnazfepvmi`)
3. Navigate to **Authentication** in the left sidebar
4. Click on **URL Configuration** under the Configuration section
   - Direct link: `https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi/auth/url-configuration`

### Step 2: Set Site URL

The **Site URL** is your main production URL. Set it to:

```
https://rcr-one.vercel.app
```

### Step 3: Add Redirect URLs

In the **Redirect URLs** section, click **Add URL** and add each of the following:

1. **Production:**
   ```
   https://rcr-one.vercel.app/auth/callback
   ```

2. **Local Development:**
   ```
   http://localhost:3000/auth/callback
   ```

3. **Vercel Preview (with wildcard):**
   ```
   https://*-*.vercel.app/auth/callback
   ```

   Or if you want to be more specific:
   ```
   https://*-<your-team-slug>.vercel.app/auth/callback
   ```

### Step 4: Save Configuration

Click **Save** to apply the changes.

## Understanding Wildcards

Supabase supports wildcard patterns for redirect URLs, which is useful for preview deployments:

| Wildcard | Description | Example |
|----------|-------------|---------|
| `*` | Matches any sequence of non-separator characters | `https://*-*.vercel.app/**` |
| `**` | Matches any sequence of characters (including separators) | `https://rcr-one.vercel.app/**` |
| `?` | Matches any single non-separator character | `http://localhost:3000/?` |

**Important:** The separator characters in URLs are `.` and `/`.

### Wildcard Examples

- `http://localhost:3000/**` - Matches all paths on localhost:3000
- `https://*-*.vercel.app/**` - Matches all Vercel preview deployments
- `https://rcr-one.vercel.app/**` - Matches all paths on your production domain

## Verification

After configuring the redirect URLs:

1. **Test Local Development:**
   - Start your local server: `pnpm dev`
   - Navigate to `http://localhost:3000/signin`
   - Click "Sign in with Google"
   - You should be redirected back to `http://localhost:3000/auth/callback` after authentication

2. **Test Production:**
   - Navigate to `https://rcr-one.vercel.app/signin`
   - Click "Sign in with Google"
   - You should be redirected back to `https://rcr-one.vercel.app/auth/callback` after authentication

## Common Issues

### Issue: "redirect_uri_mismatch" Error

**Symptom:** Users see an error after Google authentication saying the redirect URI doesn't match.

**Solution:**
- Verify the exact redirect URL is added in Supabase (including the `/auth/callback` path)
- Check that the URL matches exactly (including `http` vs `https`, trailing slashes, etc.)
- Ensure the redirect URL in your code matches what's configured in Supabase

### Issue: Authentication Works Locally but Not in Production

**Solution:**
- Verify the production URL is added to Supabase redirect URLs
- Check that the production URL uses `https://` (not `http://`)
- Ensure Vercel environment variables are set correctly

### Issue: Preview Deployments Don't Work

**Solution:**
- Add a wildcard pattern for Vercel preview URLs: `https://*-*.vercel.app/auth/callback`
- Or add each preview URL individually as you create them

## Current Configuration in Code

Your application uses the following redirect URLs in the code:

### Sign In Page (`apps/web/app/signin/page.tsx`)
```typescript
const redirectTo = `${window.location.origin}/auth/callback`;
```

### Sign Up Pages (`apps/web/app/signup/*/page.tsx`)
```typescript
const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/onboarding/patient')}&role=${encodeURIComponent(role)}`;
```

This means the redirect URL is dynamically constructed based on the current origin, so:
- Local: `http://localhost:3000/auth/callback`
- Production: `https://rcr-one.vercel.app/auth/callback`
- Preview: `https://<preview-url>.vercel.app/auth/callback`

## Additional Resources

- [Supabase Redirect URLs Documentation](https://supabase.com/docs/guides/auth/redirect-urls)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google OAuth Configuration](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Next Steps

After configuring redirect URLs:

1. ✅ Verify redirect URLs are saved in Supabase
2. ✅ Test Google Sign-In in local development
3. ✅ Test Google Sign-In in production
4. ✅ Verify callback route handles authentication correctly
5. ✅ Check that users are redirected to onboarding after sign-up

