#!/bin/bash

# Script to add Jitsi private key to .env.local

ENV_FILE="/Users/password/rwanda-cancer-relief/apps/web/.env.local"

echo "Adding Jitsi private key to .env.local"
echo ""
echo "Paste your private key below (including BEGIN and END lines)"
echo "Press Enter after pasting, then Ctrl+D to finish:"
echo ""

# Read multiline input
PRIVATE_KEY=$(cat)

# Add to .env.local
cat >> "$ENV_FILE" << EOF
JITSI_PRIVATE_KEY="$PRIVATE_KEY"
EOF

echo ""
echo "✅ Private key added successfully!"
echo ""
echo "Verify with: cat $ENV_FILE | grep -A 10 JITSI_PRIVATE_KEY"

