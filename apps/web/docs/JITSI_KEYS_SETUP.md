# Jitsi JaaS Keys Setup Guide

This guide explains how to securely add your Jitsi JaaS API keys to your project.

## What You Need

From your Jitsi JaaS dashboard, you should have:
1. **App ID** - Used in URLs (can be public)
2. **RSA Public Key** - Stored on JaaS servers (optional to save)
3. **RSA Private Key** - Used for JWT signing (must be kept secret)

## Security Notes

- **App ID**: Can be in client-side env vars (NEXT_PUBLIC_*)
- **Private Key**: Must be in server-side env vars only (never NEXT_PUBLIC_*)

## Step-by-Step Setup

### Step 1: Locate Your Keys

Make sure you have:
- Your **App ID** from JaaS dashboard
- Your **Private Key** file (downloaded .pem file)

### Step 2: Create or Edit .env.local

Navigate to your project directory:

```bash
cd /Users/password/rwanda-cancer-relief/apps/web
```

Create or edit the `.env.local` file:

```bash
# If file doesn't exist, create it
touch .env.local

# Or open it in your editor
code .env.local
```

### Step 3: Add Your App ID (Client-Side)

Add your App ID to `.env.local`:

```bash
# Add this line (replace with your actual App ID)
echo "NEXT_PUBLIC_JITSI_APP_ID=your-app-id-here" >> .env.local
```

Or use `cat` to append:

```bash
cat >> .env.local << 'EOF'
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=your-app-id-here
EOF
```

### Step 4: Add Your Private Key (Server-Side)

**Option A: Using cat with a multiline string**

If your private key is in a file (e.g., `jitsi-private-key.pem`):

```bash
# Add the private key (multiline)
cat >> .env.local << 'EOF'
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
(paste your private key here)
-----END RSA PRIVATE KEY-----"
EOF
```

**Option B: Read from file**

If you downloaded the private key to a file:

```bash
# Read the private key file and add it
echo 'JITSI_PRIVATE_KEY="'$(cat /path/to/your/private-key.pem | tr '\n' '\\n')'"' >> .env.local
```

**Option C: Manual entry**

1. Open `.env.local` in your editor
2. Add this line:
```env
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
(paste your entire private key here, including BEGIN and END lines)
-----END RSA PRIVATE KEY-----"
```

### Step 5: Verify Your Configuration

Check that your `.env.local` file has the correct format:

```bash
cat .env.local | grep JITSI
```

You should see:
- `NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc`
- `NEXT_PUBLIC_JITSI_APP_ID=your-app-id`
- `JITSI_PRIVATE_KEY="-----BEGIN RSA..."` (should be multiline)

### Step 6: Format the Private Key Properly

The private key needs to preserve newlines. In your `.env.local`, it should look like:

```env
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(multiple lines of base64 encoded data)
...
-----END RSA PRIVATE KEY-----"
```

**Important**: The private key must be:
- Enclosed in double quotes
- Preserve the `\n` newlines (they'll be converted automatically)
- Include the BEGIN and END markers

### Step 7: Restart Your Development Server

After adding the keys, restart your dev server:

```bash
# Stop your current server (Ctrl+C)
# Then restart
pnpm dev
```

## Quick Commands Reference

### Complete Setup in One Go

If you have:
- App ID saved in a variable
- Private key file saved

```bash
cd /Users/password/rwanda-cancer-relief/apps/web

# Add Jitsi configuration
cat >> .env.local << EOF
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=your-actual-app-id
EOF

# Add private key (adjust path to your key file)
echo 'JITSI_PRIVATE_KEY="'$(cat ~/Downloads/jitsi-private-key.pem | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$//')'"' >> .env.local
```

### Verify Setup

```bash
# Check if variables are set
cd apps/web
cat .env.local | grep -A 5 JITSI
```

## Troubleshooting

### Issue: Private key not working

**Solution**: Make sure the private key:
- Is properly formatted with BEGIN/END markers
- Has all newlines preserved
- Is in double quotes in `.env.local`

### Issue: App ID not found

**Solution**: 
- Verify your App ID from JaaS dashboard
- Check that `NEXT_PUBLIC_JITSI_APP_ID` is set correctly
- Restart your dev server after adding

### Issue: Keys not loading

**Solution**:
1. Check `.env.local` exists in `apps/web/` directory
2. Verify file syntax (no typos)
3. Restart dev server completely
4. Check browser console for errors

## For Production Deployment

When deploying to production (Vercel, etc.):

1. **App ID**: Add to your deployment platform's environment variables as `NEXT_PUBLIC_JITSI_APP_ID`
2. **Private Key**: Add as `JITSI_PRIVATE_KEY` (server-side only)
3. **Domain**: Add as `NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc`

**Never commit `.env.local` to git** - it's already in `.gitignore`

## Next Steps

After setting up keys:
1. Restart your dev server
2. Test a video session
3. Check browser console for any errors
4. Verify room names are formatted correctly

For more details, see [JITSI_SETUP.md](./JITSI_SETUP.md)

