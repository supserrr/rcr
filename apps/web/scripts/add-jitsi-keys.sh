#!/bin/bash

# Jitsi JaaS Keys Setup Script
# This script helps you add Jitsi JaaS keys to your .env.local file

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$WEB_DIR/.env.local"

echo "🔧 Jitsi JaaS Keys Setup"
echo "========================"
echo ""

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env.local file..."
    touch "$ENV_FILE"
fi

# Step 1: Add App ID
echo "1️⃣  Enter your Jitsi JaaS App ID:"
read -r APP_ID

if [ -z "$APP_ID" ]; then
    echo "❌ App ID cannot be empty. Exiting."
    exit 1
fi

# Remove existing JITSI entries if any
sed -i.bak '/^NEXT_PUBLIC_JITSI_DOMAIN=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^NEXT_PUBLIC_JITSI_APP_ID=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^JITSI_PRIVATE_KEY=/d' "$ENV_FILE" 2>/dev/null || true

# Add domain and app ID
echo "" >> "$ENV_FILE"
echo "# Jitsi JaaS Configuration" >> "$ENV_FILE"
echo "NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc" >> "$ENV_FILE"
echo "NEXT_PUBLIC_JITSI_APP_ID=$APP_ID" >> "$ENV_FILE"

echo "✅ Added App ID to .env.local"
echo ""

# Step 2: Add Private Key
echo "2️⃣  Enter the path to your private key file (or press Enter to skip):"
read -r PRIVATE_KEY_PATH

if [ -n "$PRIVATE_KEY_PATH" ] && [ -f "$PRIVATE_KEY_PATH" ]; then
    echo "📄 Reading private key from: $PRIVATE_KEY_PATH"
    
    # Read private key and escape it properly for .env file
    PRIVATE_KEY=$(cat "$PRIVATE_KEY_PATH")
    
    # Add to .env.local with proper escaping
    echo "JITSI_PRIVATE_KEY=\"$PRIVATE_KEY\"" >> "$ENV_FILE"
    
    echo "✅ Added private key to .env.local"
else
    echo "⏭️  Skipping private key (you can add it manually later)"
    echo ""
    echo "To add it manually, add this to .env.local:"
    echo "JITSI_PRIVATE_KEY=\"-----BEGIN RSA PRIVATE KEY-----"
    echo "..."
    echo "-----END RSA PRIVATE KEY-----\""
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   - App ID: $APP_ID"
echo "   - Domain: 8x8.vc"
if [ -n "$PRIVATE_KEY_PATH" ] && [ -f "$PRIVATE_KEY_PATH" ]; then
    echo "   - Private Key: Added from $PRIVATE_KEY_PATH"
else
    echo "   - Private Key: Not added (optional for basic setup)"
fi
echo ""
echo "🔄 Next steps:"
echo "   1. Restart your dev server: pnpm dev"
echo "   2. Test a video session"
echo ""
echo "📁 Your .env.local file is located at: $ENV_FILE"
echo ""

