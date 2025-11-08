# Quick Start Guide

Get started with the Rwanda Cancer Relief frontend-backend integration.

## Prerequisites

1. **Backend Running**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Node.js 20+**
   ```bash
   node --version
   ```

3. **pnpm**
   ```bash
   pnpm --version
   ```

## Setup (5 minutes)

### Step 1: Environment Variables

Create `.env.local` in `apps/web/`:

```bash
cd apps/web
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF
```

Or manually create the file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Step 2: Install Dependencies

```bash
cd apps/web
pnpm install
```

### Step 3: Start Frontend

```bash
cd apps/web
pnpm dev
```

Frontend runs on `http://localhost:3000`

### Step 4: Test Integration

```bash
cd apps/web
pnpm run test:integration
```

## Verify Setup

1. **Check Backend**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"UP","timestamp":"..."}`

2. **Check Frontend**
   - Open `http://localhost:3000`
   - Should see the landing page
   - No console errors

3. **Test Authentication**
   - Go to `/signin`
   - Try signing in (or sign up first)
   - Should redirect to dashboard

## Using the Hooks

### Sessions

```typescript
import { useSessions } from '@/hooks/useSessions';

function SessionsPage() {
  const { sessions, loading, error, createSession } = useSessions();
  // Use sessions...
}
```

### Chat

```typescript
import { useChat } from '@/hooks/useChat';

function ChatPage() {
  const { chats, messages, sendMessage, socketConnected } = useChat();
  // Real-time chat...
}
```

### Resources

```typescript
import { useResources } from '@/hooks/useResources';

function ResourcesPage() {
  const { resources, loading, createResource } = useResources();
  // Use resources...
}
```

## Next Steps

1. **Update Components**
   - See `NEXT_STEPS.md` for component updates
   - Replace dummy data with hooks

2. **Test Features**
   - Test authentication
   - Test sessions
   - Test chat
   - Test resources

3. **Deploy**
   - See deployment docs when ready

## Troubleshooting

### Backend Not Running

```bash
cd backend
npm run dev
```

### Port 5000 in Use

The backend automatically kills processes on port 5000. If issues persist:
- Check what's using port 5000: `lsof -i :5000`
- On macOS, disable AirPlay: System Preferences > General > AirDrop & Handoff

### CORS Errors

- Check `CORS_ORIGIN` in backend `.env`
- Ensure it matches frontend URL: `http://localhost:3000`

### Environment Variables Not Loading

- File must be named `.env.local` (not `.env`)
- Restart Next.js dev server after creating/updating
- Variables must start with `NEXT_PUBLIC_`

## Documentation

- **Integration Status**: `docs/INTEGRATION_STATUS.md`
- **Next Steps**: `docs/NEXT_STEPS.md`
- **Testing**: `docs/TESTING_INTEGRATION.md`
- **API Reference**: `docs/API_SERVICES.md`

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify environment variables
4. Test API endpoints with curl
5. Review documentation

