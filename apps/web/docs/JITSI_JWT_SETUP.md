# Jitsi JaaS JWT Setup Guide

This guide explains how to set up JWT (JSON Web Token) authentication for Jitsi as a Service (JaaS) integration.

## Overview

JWT tokens are required for authenticated access to Jitsi JaaS meetings. They provide:
- User authentication and authorization
- Moderator permissions
- Feature access control (recording, livestreaming, etc.)
- Secure meeting access

## Prerequisites

- Jitsi JaaS account with App ID
- Access to generate RSA key pairs
- Server-side environment variable access

## Step 1: Generate RSA Key Pair

Generate a 4096-bit RSA key pair using `ssh-keygen`:

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jaasauth.key
```

This creates two files:
- `jaasauth.key` - Private key (keep this secret!)
- `jaasauth.key.pub` - Public key (upload to JaaS dashboard)

**Important**: Do not set a passphrase when generating the key, as the server needs to use it without interaction.

## Step 2: Convert Public Key to PEM Format

Convert the public key to PEM format:

```bash
openssl rsa -in jaasauth.key -pubout -outform PEM -out jaasauth.key.pub
```

## Step 3: Upload Public Key to JaaS Dashboard

1. Log in to your Jitsi JaaS Developer Console
2. Navigate to **API Keys** section
3. Click **Add API Key**
4. Upload the `jaasauth.key.pub` file
5. Note the **Key ID (kid)** - this will be used in JWT generation

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Jitsi JaaS Configuration
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_JITSI_APP_ID=2ec2e4abf2874096ba00d895b9672444

# Jitsi JWT Private Key (server-side only)
# Paste the entire contents of jaasauth.key including BEGIN/END markers
JITSI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----"

# Jitsi JaaS API Key ID (optional)
# If your JaaS dashboard shows a key ID (e.g., "4f4910"), set it here
# Format in JWT will be: vpaas-magic-cookie-{appId}/{keyId}
# If not set, uses just the App ID
JITSI_KEY_ID=4f4910
```

**Security Note**: 
- The `JITSI_PRIVATE_KEY` should NEVER be exposed to the client
- It's a server-side only variable (no `NEXT_PUBLIC_` prefix)
- Keep the private key file secure and never commit it to version control

## Step 5: Verify Configuration

Check if JWT generation is configured:

```bash
curl http://localhost:3000/api/jitsi/jwt
```

Should return:
```json
{
  "configured": true
}
```

## JWT Token Structure

The generated JWT contains:

### Header
```json
{
  "alg": "RS256",
  "kid": "vpaas-magic-cookie-{appId}",
  "typ": "JWT"
}
```

### Payload
```json
{
  "aud": "jitsi",
  "context": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "https://...",
      "moderator": "true" | "false"
    },
    "features": {
      "livestreaming": "true" | "false",
      "recording": "true" | "false",
      "moderation": "true" | "false"
    }
  },
  "exp": 1696284052,
  "iss": "chat",
  "nbf": 1596197652,
  "room": "vpaas-magic-cookie-{appId}/{roomName}",
  "sub": "vpaas-magic-cookie-{appId}"
}
```

## Usage in Components

The `JitsiMeeting` component automatically fetches and uses JWT tokens when:
- JaaS is configured (`NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc`)
- App ID is set (`NEXT_PUBLIC_JITSI_APP_ID`)
- Private key is configured (`JITSI_PRIVATE_KEY`)
- User ID is provided to the component

Example:

```tsx
<JitsiMeeting
  roomName="session-123"
  displayName="John Doe"
  email="john@example.com"
  userId="user-123"
  isModerator={true}
  sessionType="video"
  onMeetingEnd={handleEnd}
/>
```

## API Endpoint

The JWT generation API endpoint is available at:

**POST** `/api/jitsi/jwt`

Request body:
```json
{
  "userId": "user-123",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userAvatar": "https://...",
  "isModerator": true,
  "roomName": "session-123",
  "expirationSeconds": 3600,
  "features": {
    "livestreaming": false,
    "recording": false,
    "moderation": true
  }
}
```

Response:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1696284052
}
```

## Troubleshooting

### JWT Generation Fails

1. **Check private key format**: Ensure it includes `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
2. **Verify key is correct**: The private key must match the public key uploaded to JaaS dashboard
3. **Check environment variables**: Ensure `JITSI_PRIVATE_KEY` is set correctly
4. **Verify App ID**: Ensure `NEXT_PUBLIC_JITSI_APP_ID` matches your JaaS App ID

### 403 Forbidden Errors

- Verify the public key is uploaded to JaaS dashboard
- Check that the Key ID (kid) in the JWT header matches the uploaded key
- Ensure the App ID in the JWT `sub` field matches your JaaS App ID

### Rate Limiting (429 Errors)

- JaaS may rate limit requests if too many are made
- The component includes automatic retry logic with exponential backoff
- Wait a few minutes and try again

## Security Best Practices

1. **Never commit private keys**: Add `*.key` and `*.pem` to `.gitignore`
2. **Use environment variables**: Store private keys in secure environment variable management
3. **Rotate keys regularly**: Generate new key pairs periodically
4. **Limit JWT expiration**: Use reasonable expiration times (default: 1 hour)
5. **Validate user permissions**: Only grant moderator permissions to authorized users
6. **Monitor usage**: Track JWT generation and usage for security auditing

## References

- [Jitsi JaaS Documentation](https://jaas.8x8.vc/)
- [JWT.io Debugger](https://jwt.io/) - For debugging JWT tokens
- [Jitsi JaaS API Keys Guide](https://jaas.8x8.vc/docs/api-keys)

