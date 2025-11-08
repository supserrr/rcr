# Assistant UI Cloud API Setup

This document describes how to configure and use the Assistant UI Cloud API for AI chat functionality.

## Configuration

The Assistant UI Cloud API is configured via environment variables in `.env.local`:

```env
# Assistant UI Cloud API URL
NEXT_PUBLIC_ASSISTANT_API_URL=https://proj-0698j5uztrp3.assistant-api.com

# Assistant UI Cloud API Key (keep this secret, do not commit to git)
ASSISTANT_API_KEY=your_assistant_api_key_here
```

**Important**: The `ASSISTANT_API_KEY` is a server-side environment variable (not prefixed with `NEXT_PUBLIC_`), so it will not be exposed to the client. Keep this key secret and do not commit it to version control.

## Project Details

- **Project Name**: rwanda-cancer-relief
- **Project Slug**: rwanda-cancer-relief
- **API URL**: https://proj-0698j5uztrp3.assistant-api.com

## How It Works

The AI chat functionality (`/api/chat` route) will:

1. **Check for Assistant UI Cloud API**: If `NEXT_PUBLIC_ASSISTANT_API_URL` is configured, it will use the Assistant UI Cloud API
2. **Fallback to Local AI SDK**: If the Assistant UI Cloud API is not available or fails, it falls back to the local AI SDK using `streamText`

## Usage

The Assistant UI Cloud API is automatically used when:
- The environment variable is set
- The API route receives a chat request
- The API endpoint is accessible

## Troubleshooting

### API Not Working

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_ASSISTANT_API_URL` is set in `.env.local`
2. **Restart Dev Server**: Restart the Next.js dev server after changing environment variables
3. **Check API Endpoint**: Verify the API URL is correct and accessible
4. **Check Console**: Look for errors in the browser console and server logs

### Fallback to Local AI SDK

If the Assistant UI Cloud API fails, the system will automatically fall back to the local AI SDK. This ensures the chat functionality continues to work even if the cloud API is unavailable.

## API Route

The chat API route is located at:
- **File**: `apps/web/app/api/chat/route.ts`
- **Endpoint**: `/api/chat`
- **Method**: `POST`

## Request Format

```json
{
  "messages": [...],
  "model": "gpt-4",
  "webSearch": false
}
```

## Response Format

The API returns a streamed response compatible with the AI SDK's `useChat` hook.

