# Quick Jitsi Keys Setup - Copy & Paste Commands

## What You Need
1. Your **App ID** from JaaS dashboard (looks like: `f6d1c6c8a5c746ea991dc0f4b92e8b62`)
2. Your **Private Key** file (the .pem file you downloaded)

## Step 1: Navigate to Project Directory

```bash
cd /Users/password/rwanda-cancer-relief/apps/web
```

## Step 2: Add App ID and Domain

Replace `YOUR_APP_ID_HERE` with your actual App ID:

```bash
cat >> .env.local << 'EOF'

# Jitsi JaaS Configuration
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=YOUR_APP_ID_HERE
EOF
```

Or use this one-liner (replace YOUR_APP_ID_HERE):

```bash
echo -e "\n# Jitsi JaaS Configuration\nNEXT_PUBLIC_JITSI_DOMAIN=8x8.vc\nNEXT_PUBLIC_JITSI_APP_ID=YOUR_APP_ID_HERE" >> .env.local
```

## Step 3: Add Private Key

### Option A: If your private key file is in Downloads folder

```bash
# Adjust the filename if different
cat >> .env.local << EOF
JITSI_PRIVATE_KEY="$(cat ~/Downloads/jitsi-private-key.pem)"
EOF
```

### Option B: If you know the exact path to your key file

```bash
cat >> .env.local << EOF
JITSI_PRIVATE_KEY="$(cat /path/to/your/private-key.pem)"
EOF
```

### Option C: Manual entry (if key is on clipboard or you want to paste)

1. Open `.env.local` in your editor
2. Add this line:
```
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
(paste entire key here)
-----END RSA PRIVATE KEY-----"
```

## Step 4: Verify Everything Was Added

```bash
cat .env.local | grep JITSI
```

You should see:
- `NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc`
- `NEXT_PUBLIC_JITSI_APP_ID=...`
- `JITSI_PRIVATE_KEY="-----BEGIN...`

## Step 5: Restart Your Server

```bash
# Stop current server (Ctrl+C if running)
# Then restart
pnpm dev
```

## Complete Command Sequence (Copy All at Once)

Replace `YOUR_APP_ID_HERE` and `/path/to/private-key.pem`:

```bash
cd /Users/password/rwanda-cancer-relief/apps/web

# Add App ID and Domain
cat >> .env.local << EOF

# Jitsi JaaS Configuration
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=YOUR_APP_ID_HERE
EOF

# Add Private Key (adjust path)
cat >> .env.local << EOF
JITSI_PRIVATE_KEY="$(cat /path/to/your/private-key.pem)"
EOF

# Verify
cat .env.local | grep JITSI
```

