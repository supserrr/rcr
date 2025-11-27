# Google OAuth Setup Guide

Complete guide for setting up Google OAuth authentication with Supabase in the Rwanda Cancer Relief application.

## Prerequisites

1. Supabase project configured
2. Google Cloud Console project created
3. OAuth 2.0 credentials created in Google Cloud Console

## Step 1: Configure Google OAuth in Supabase

### Using Supabase Dashboard

1. **Navigate to Authentication Settings**
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Providers
   - Find "Google" in the list

2. **Enable Google Provider**
   - Toggle "Enable Google provider" to ON
   - Enter your Google OAuth Client ID
   - Enter your Google OAuth Client Secret
   - Click "Save"

3. **Add Redirect URLs**
   - Add your redirect URLs to the allowed list:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://yourdomain.com/auth/callback` (for production)

### Using Supabase Management API

You can also configure Google OAuth programmatically using the Management API:

```bash
curl -X PATCH \
  'https://api.supabase.com/v1/projects/{project-ref}/config/auth' \
  -H 'Authorization: Bearer {access-token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "external_google_enabled": true,
    "external_google_client_id": "your-google-client-id",
    "external_google_secret": "your-google-client-secret"
  }'
```

## Step 2: Configure Environment Variables

### Frontend Environment Variables

Add to `apps/web/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Server-Side Environment Variables (Optional)

If you need to configure Google OAuth in Supabase via the backend, add to server-side environment variables:

```env
# Google OAuth Configuration (for Supabase Auth)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Note:** The client secret should be kept secure and not exposed to the client.

## Step 3: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select or create a project

2. **Enable Google+ API**
   - Navigate to APIs & Services → Library
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Navigate to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Click "Create"
   - Copy the Client ID and Client Secret

## Step 4: Implementation Details

### OAuth Flow

1. **User clicks "Sign in with Google"**
   - Frontend calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - User is redirected to Google's consent screen

2. **User authorizes the application**
   - Google redirects back to Supabase
   - Supabase exchanges the authorization code for tokens

3. **Supabase redirects to your callback**
   - User is redirected to `/auth/callback`
   - The callback route exchanges the code for a session
   - User is redirected to the original page or dashboard

### Code Structure

- **`lib/supabase/client.ts`**: Client-side Supabase client
- **`lib/supabase/server.ts`**: Server-side Supabase client (for API routes)
- **`app/auth/callback/route.ts`**: OAuth callback handler
- **`app/signin/page.tsx`**: Sign-in page with Google OAuth button
- **`components/auth/AuthProvider.tsx`**: Auth context with OAuth support

## Step 5: Testing

1. **Start the development server**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Test Google Sign-In**
   - Navigate to `/signin`
   - Click "Sign in with Google"
   - Complete the OAuth flow
   - Verify you're redirected to the dashboard

3. **Verify Session**
   - Check that the user session is stored
   - Verify user data is accessible
   - Test sign-out functionality

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure redirect URIs match exactly in Google Cloud Console
   - Check that Supabase redirect URL is configured correctly

2. **"Invalid client ID"**
   - Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
   - Check that the client ID matches in Google Cloud Console

3. **"Session not found"**
   - Ensure cookies are enabled in the browser
   - Check that the callback route is working correctly
   - Verify Supabase session is being created

4. **"CORS errors"**
   - Ensure Supabase URL is correct
   - Check that redirect URLs are whitelisted in Supabase

### Debug Steps

1. **Check browser console** for errors
2. **Check network tab** for failed requests
3. **Verify environment variables** are loaded correctly
4. **Test Supabase connection** independently
5. **Check Supabase logs** in the dashboard

## Security Considerations

1. **Never expose client secrets** to the frontend
2. **Use HTTPS** in production
3. **Validate redirect URLs** to prevent open redirects
4. **Implement rate limiting** on authentication endpoints
5. **Use secure cookies** for session storage

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)

