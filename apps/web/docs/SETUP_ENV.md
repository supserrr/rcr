# Environment Setup

## Quick Setup

Create `.env.local` file in `apps/web/` directory:

```bash
cd apps/web
touch .env.local
```

Then add the following content:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Required Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:5000`)

## Optional Variables

- `NEXT_PUBLIC_SOCKET_URL` - Socket.IO server URL (defaults to API_URL if not set)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (if using Supabase client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (if using Supabase client-side)
- `NEXT_PUBLIC_JITSI_DOMAIN` - Jitsi domain (default: `8x8.vc`)
- `NEXT_PUBLIC_JITSI_APP_ID` - Jitsi app ID (if using JaaS)

## Production Variables

For production, update the URLs:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

## Verification

After creating `.env.local`, restart the Next.js dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

Verify the environment variables are loaded:

1. Check browser console for API calls
2. API calls should go to `http://localhost:5000` (or your configured URL)
3. No CORS errors should appear

## Troubleshooting

### Variables Not Loading

- Ensure file is named `.env.local` (not `.env` or `.env.local.txt`)
- Restart Next.js dev server after creating/updating file
- Variables must start with `NEXT_PUBLIC_` to be accessible in browser

### Wrong URL

- Check the URL in browser Network tab
- Verify backend is running on the configured port
- Check for typos in the URL

