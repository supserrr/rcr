# Jitsi Meet Configuration Guide

This guide explains how to configure Jitsi Meet for video conferencing in the Rwanda Cancer Relief platform.

## Overview

The platform supports three Jitsi deployment options:

1. **Free Jitsi** (default) - Uses `meet.jit.si`, no setup required
2. **Jitsi as a Service (JaaS)** - Uses `8x8.vc` with app ID
3. **Self-hosted Jitsi** - Your own Jitsi instance

## Quick Start

### Option 1: Free Jitsi (Recommended for Development)

No configuration needed! The platform defaults to using the free Jitsi service at `meet.jit.si`.

Simply start using video sessions - no environment variables required.

### Option 2: Jitsi as a Service (JaaS)

For production use with better reliability and support:

1. **Sign up for JaaS**:
   - Visit [8x8.vc](https://8x8.vc) or [Jitsi as a Service](https://jaas.8x8.com)
   - Create an account and get your App ID

2. **Configure environment variables**:
   ```env
   NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
   NEXT_PUBLIC_JITSI_APP_ID=your_app_id_here
   ```

3. **Restart your development server**:
   ```bash
   pnpm dev
   ```

### Option 3: Self-Hosted Jitsi

For full control and HIPAA compliance:

1. **Deploy your own Jitsi instance**:
   - Follow the [Jitsi Self-Hosting Guide](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart)
   - Ensure your domain is properly configured

2. **Configure environment variables**:
   ```env
   NEXT_PUBLIC_JITSI_DOMAIN=your-jitsi-domain.com
   ```

3. **Restart your development server**:
   ```bash
   pnpm dev
   ```

## Configuration Details

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_JITSI_DOMAIN` | No | `meet.jit.si` | Jitsi domain to use |
| `NEXT_PUBLIC_JITSI_APP_ID` | Yes (for JaaS) | - | JaaS application ID |

### Configuration Files

The Jitsi configuration is managed in:
- **Configuration utility**: `apps/web/lib/jitsi/config.ts`
- **Component**: `apps/web/components/session/JitsiMeeting.tsx`
- **API integration**: `apps/web/lib/api/sessions.ts`

## How It Works

### Room Name Formatting

The platform automatically formats room names based on your deployment type:

- **Free Jitsi**: `session-{sessionId}`
- **JaaS**: `{appId}/session-{sessionId}`
- **Self-hosted**: `session-{sessionId}`

### External API Loading

The component automatically loads the correct Jitsi external API script:

- **Free Jitsi**: `https://meet.jit.si/external_api.js`
- **JaaS**: `https://8x8.vc/vpaas-magic-cookie-{appId}/external_api.js`
- **Self-hosted**: `https://{your-domain}/external_api.js`

## Features

### Enabled Features

- Prejoin page (device checks)
- Noise detection
- Screen sharing
- Chat
- Recording (optional)
- Virtual backgrounds
- Closed captions

### Disabled Features

- Jitsi watermarks
- Mobile app promotion
- Guest invitations
- Room storage

## Testing

To test your Jitsi configuration:

1. **Start the development server**:
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Navigate to a session**:
   - Log in as a patient or counselor
   - Go to Sessions page
   - Click "Join Session" on a scheduled session

3. **Verify connection**:
   - Check that the Jitsi interface loads
   - Test audio/video controls
   - Verify room name format in browser console

## Troubleshooting

### Issue: Jitsi fails to load

**Solution**: Check your environment variables:
```bash
# Verify variables are set
echo $NEXT_PUBLIC_JITSI_DOMAIN
echo $NEXT_PUBLIC_JITSI_APP_ID
```

### Issue: "Failed to load Jitsi Meet API"

**Possible causes**:
- Incorrect domain configuration
- Network/firewall blocking Jitsi
- Invalid JaaS app ID

**Solution**:
1. Verify your domain is correct
2. Check browser console for specific errors
3. For JaaS, verify your app ID is correct

### Issue: Room not found

**Solution**: 
- Check that room names are being formatted correctly
- Verify session exists in database
- Check browser console for room name

## Production Considerations

### HIPAA Compliance

For healthcare applications requiring HIPAA compliance:

1. **Use self-hosted Jitsi** or **JaaS with BAA**
2. **Enable end-to-end encryption**
3. **Disable recording** (or require explicit consent)
4. **Implement proper access controls**
5. **Use secure room names** (not predictable)

### Performance

- **Free Jitsi**: Good for development, may have limitations in production
- **JaaS**: Reliable, scalable, with support options
- **Self-hosted**: Full control, requires infrastructure management

### Security

- All sessions use unique room names per session
- Rooms are not stored after meeting ends
- End-to-end encryption is supported
- No guest invitations by default

## Additional Resources

- [Jitsi Handbook](https://jitsi.github.io/handbook/)
- [Jitsi Meet API Documentation](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [JaaS Documentation](https://jaas.8x8.com)
- [Self-Hosting Guide](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Jitsi documentation
3. Check browser console for errors
4. Verify environment variable configuration

