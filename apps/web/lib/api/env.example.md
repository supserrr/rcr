# Frontend Environment Variables

Create a `.env.local` file in `apps/web/` with the following variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:10000

# Supabase Configuration (if using Supabase client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth Configuration (for Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Socket.IO Configuration (if using Socket.IO client)
NEXT_PUBLIC_SOCKET_URL=http://localhost:10000

# Jitsi Configuration (if using Jitsi client-side)
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=your_jitsi_app_id

```

## Required Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:10000`)

## Optional Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (if using Supabase client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (if using Supabase client-side)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID (for Google Sign-In)
- `NEXT_PUBLIC_SOCKET_URL`: Socket.IO server URL (defaults to API_URL, default: `http://localhost:10000`)
- `NEXT_PUBLIC_JITSI_DOMAIN`: Jitsi domain (default: `8x8.vc`)
- `NEXT_PUBLIC_JITSI_APP_ID`: Jitsi app ID (if using JaaS)

