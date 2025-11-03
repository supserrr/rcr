# Prerequisites Checklist

## ✅ Verified Prerequisites

### System Requirements
- [x] **Node.js**: v20.18.0 (requires >= 18.0.0) ✓
- [x] **npm**: v10.8.2 (requires >= 9.0.0) ✓
- [x] **Backend directory**: Exists at `/backend` ✓
- [x] **Project initialized**: package.json created ✓
- [x] **Folder structure**: Created ✓
- [x] **TypeScript config**: tsconfig.json created ✓
- [x] **Git ignore**: .gitignore created ✓

## ⏳ Pending Verification

### Supabase Configuration
- [ ] **SUPABASE_URL**: Get from Supabase Dashboard → Project Settings → API
- [ ] **SUPABASE_KEY**: Get from Supabase Dashboard → Project Settings → API (anon/public key)
- [ ] **SUPABASE_SERVICE_KEY**: Get from Supabase Dashboard → Project Settings → API (service_role key)

**Action Required:**
1. Log in to your Supabase account
2. Navigate to Project Settings → API
3. Copy the following values:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`
4. Create `.env` file in `/backend` directory using `env.example` as template

### Render Configuration
- [ ] **Render account**: Access confirmed
- [ ] **Render project**: Project created (to be done during deployment)

**Action Required:**
1. Ensure you have a Render account
2. We'll create the project during deployment phase

### MCPs in Cursor
Verify the following MCPs are installed and configured:

- [x] **Supabase MCP**: Configured in `.cursor/mcp.json`
- [x] **Render MCP**: Configured in `.cursor/mcp.json` (requires API key)
- [x] **shadcn MCP**: Already configured (for UI components)
- [x] **next-devtools MCP**: Already configured (for Next.js)

**Action Required:**
1. ✅ Supabase MCP - Configured via URL (`https://mcp.supabase.com/mcp`)
2. ✅ **Render MCP** - API key configured
   - Get your API key from: https://dashboard.render.com/account/api-keys
   - Update `.cursor/mcp.json` with: `"Authorization": "Bearer YOUR_ACTUAL_API_KEY"`
3. ✅ Node.js capabilities - Built into Cursor (no separate MCP needed)
4. ✅ HTTP capabilities - Built into Cursor (no separate MCP needed)
5. ✅ Zod validation - Can use directly in code (no separate MCP needed)
6. ✅ Socket.IO - Can use directly in code (no separate MCP needed)

**Note:** The essential MCPs for backend development (Supabase and Render) are now configured. Node, HTTP, Zod, and Socket.IO functionality is available through built-in Cursor capabilities or direct code usage.

### Frontend Status
- [ ] **Frontend running**: Should be accessible at http://localhost:3000

**Action Required:**
1. Navigate to `/frontend/apps/web`
2. Run `pnpm dev` or `npm run dev`
3. Verify frontend loads at http://localhost:3000

## 📋 Environment Setup

### Step 1: Create .env File
```bash
cd /Users/password/rwanda-cancer-relief/backend
cp env.example .env
```

### Step 2: Fill in .env Values
Edit `.env` file and replace placeholder values with actual credentials:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_actual_supabase_url
SUPABASE_KEY=your_actual_supabase_anon_key
SUPABASE_SERVICE_KEY=your_actual_supabase_service_key

JITSI_APP_ID=your_jitsi_app_id
JITSI_APP_SECRET=your_jitsi_app_secret
JITSI_DOMAIN=8x8.vc

RESEND_API_KEY=your_resend_api_key  # Optional

FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Step 3: Install Dependencies
```bash
cd /Users/password/rwanda-cancer-relief/backend
npm install
```

## 🔍 Testing Prerequisites

### Test Supabase Connection
Once `.env` is configured, we'll test the Supabase connection using:
- Supabase MCP (if available)
- Direct Supabase client initialization
- Connection test endpoint

### Test Node.js Setup
```bash
node --version  # Should show v20.18.0
npm --version   # Should show 10.8.2
```

### Test Frontend Connection
```bash
# In frontend directory
cd /Users/password/rwanda-cancer-relief/frontend/apps/web
pnpm dev
# Should start on http://localhost:3000
```

## 📦 Next Steps After Prerequisites

Once all prerequisites are verified:

1. **Install Dependencies**
   ```bash
   npm install express socket.io @supabase/supabase-js zod dotenv cors
   npm install -D typescript @types/node @types/express tsx ts-node
   ```

2. **Create Basic Server**
   - Set up Express server
   - Configure Socket.IO
   - Test Supabase connection
   - Create health check endpoint

3. **Verify Connections**
   - Test Express server (localhost:5000)
   - Test Supabase connection
   - Test Socket.IO connection
   - Test frontend backend communication

## 📝 Notes

- `.env` file is gitignored (see .gitignore)
- Use `env.example` as a template
- Never commit `.env` with real credentials
- Supabase keys: Use anon key for client, service_role for admin operations
- For production, configure environment variables on Render dashboard

## 🚀 Ready to Proceed?

Once all items above are checked off, proceed with Phase 2 of the implementation plan.

