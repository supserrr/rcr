# Jitsi Meet Integration Guide

## Overview

The Rwanda Cancer Relief backend provides comprehensive support for Jitsi Meet video conferencing integration. The backend supports three different API approaches, allowing the frontend to choose the integration method that best fits its needs.

## Supported API Types

### 1. React SDK (`react-sdk`)
**Recommended for React applications**

Uses the `@jitsi/react-sdk` package with components:
- `JaaSMeeting` - For 8x8.vc domain
- `JitsiMeeting` - For custom domains

**Pros:**
- Easiest to integrate
- React component-based
- Full TypeScript support
- Automatic room management

**Cons:**
- Less customization control
- Requires React

### 2. IFrame API (`iframe`)
**Recommended for quick integration**

Uses `JitsiMeetExternalAPI` via external_api.js script.

**Pros:**
- Simple integration
- Works in any JavaScript framework
- Good default configuration

**Cons:**
- Less customization options
- Limited programmatic control

### 3. lib-jitsi-meet API (`lib-jitsi-meet`)
**Recommended for maximum control and customization**

Low-level API for complete control over Jitsi Meet functionality.

**Pros:**
- Maximum customization
- Full programmatic control
- Access to all Jitsi Meet features
- Custom UI implementation possible

**Cons:**
- More complex implementation
- Requires more code
- Lower-level API

## Backend API Endpoint

### Get Jitsi Room Configuration

```
GET /api/sessions/:id/jitsi-room?apiType={react-sdk|iframe|lib-jitsi-meet}
```

**Query Parameters:**
- `apiType` (optional): Specifies which API configuration to return
  - `react-sdk` (default) - React SDK configuration
  - `iframe` - IFrame API configuration
  - `lib-jitsi-meet` - lib-jitsi-meet API configuration

**Response:**
```json
{
  "success": true,
  "data": {
    "roomUrl": "https://8x8.vc/rcr-abc123-1234567890",
    "roomName": "rcr-abc123-1234567890",
    "config": {
      // API-specific configuration
      // React SDK: JitsiMeetingConfig | JaaSMeetingConfig
      // IFrame: Similar to React SDK
      // lib-jitsi-meet: LibJitsiMeetConfig
    },
    "isJaaS": true,
    "apiType": "react-sdk"
  }
}
```

## Configuration Examples

### React SDK Configuration (JaaS)

```typescript
{
  "appId": "your-app-id",
  "roomName": "rcr-abc123-1234567890",
  "jwt": "eyJhbGc...",
  "useStaging": false,
  "configOverwrite": {
    "startWithAudioMuted": false,
    "startWithVideoMuted": false,
    "enableEmailInStats": false
  },
  "interfaceConfigOverwrite": {
    "DISABLE_JOIN_LEAVE_NOTIFICATIONS": false,
    "VIDEO_LAYOUT_FIT": "both",
    "MOBILE_APP_PROMO": false
  },
  "userInfo": {
    "displayName": "John Doe",
    "email": "john@example.com"
  }
}
```

### lib-jitsi-meet Configuration

```typescript
{
  "connectionOptions": {
    "hosts": {
      "domain": "your-app-id.8x8.vc"
    },
    "serviceUrl": "https://your-app-id.8x8.vc/xmpp-websocket",
    "enableRemb": true,
    "enableTcc": true,
    "useStunTurn": true,
    "enableIceRestart": true
  },
  "conferenceOptions": {
    "startAudioMuted": false,
    "startVideoMuted": false,
    "openBridgeChannel": true,
    "configOverwrite": {
      "enableEmailInStats": false
    }
  },
  "localTracksOptions": {
    "devices": ["audio", "video"],
    "resolution": 720
  },
  "roomName": "rcr-abc123-1234567890",
  "jwt": "eyJhbGc...",
  "userInfo": {
    "displayName": "John Doe",
    "email": "john@example.com"
  }
}
```

## Frontend Implementation Examples

### Using React SDK

```tsx
import { JaaSMeeting } from '@jitsi/react-sdk';

function VideoSession({ sessionId }) {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/jitsi-room?apiType=react-sdk`)
      .then(res => res.json())
      .then(data => setConfig(data.data.config));
  }, [sessionId]);

  if (!config) return <div>Loading...</div>;

  return config.isJaaS ? (
    <JaaSMeeting
      {...config}
      onApiReady={(externalApi) => {
        // Handle API ready
      }}
    />
  ) : (
    <JitsiMeeting
      {...config}
      onApiReady={(externalApi) => {
        // Handle API ready
      }}
    />
  );
}
```

### Using lib-jitsi-meet API

```typescript
// Load lib-jitsi-meet script
<script src="https://your-domain/libs/lib-jitsi-meet.min.js"></script>

async function initializeJitsiSession(sessionId) {
  // Get configuration from backend
  const response = await fetch(
    `/api/sessions/${sessionId}/jitsi-room?apiType=lib-jitsi-meet`
  );
  const { config, roomName } = await response.json();

  // Initialize JitsiMeetJS
  JitsiMeetJS.init();

  // Create connection
  const connection = new JitsiMeetJS.JitsiConnection(
    null,
    null,
    config.connectionOptions
  );

  // Setup event listeners
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed
  );

  // Connect
  connection.connect();

  function onConnectionSuccess() {
    // Create conference
    const room = connection.initJitsiConference(
      roomName,
      config.conferenceOptions
    );

    // Setup conference event listeners
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );

    // Get local tracks
    JitsiMeetJS.createLocalTracks(config.localTracksOptions)
      .then(onLocalTracks)
      .catch(error => console.error('Failed to create local tracks', error));

    // Join conference
    room.join();
  }

  function onRemoteTrack(track) {
    // Handle remote track
    document.getElementById('remoteVideo').appendChild(track.containers[0]);
  }

  function onConferenceJoined() {
    // Conference joined successfully
    console.log('Conference joined');
  }

  function onLocalTracks(tracks) {
    // Handle local tracks
    tracks.forEach(track => {
      if (track.getType() === 'video') {
        document.getElementById('localVideo').appendChild(track.containers[0]);
      }
    });
  }
}
```

## Environment Variables

Required for Jitsi Meet integration:

```env
# Jitsi Meet Configuration
JITSI_APP_ID=your_jitsi_app_id          # Required for JaaS
JITSI_APP_SECRET=your_jitsi_app_secret  # Required for JWT generation
JITSI_DOMAIN=8x8.vc                      # Default: 8x8.vc
```

**Optional:**
- Install `jsonwebtoken` package for JWT token generation:
  ```bash
  npm install jsonwebtoken
  npm install --save-dev @types/jsonwebtoken
  ```

## Building Custom Jitsi Meet

If you need to customize Jitsi Meet itself, you can build from source:

### Requirements
- Node.js >= 22
- npm >= 10
- Linux/macOS (Windows not supported)

### Build Process

```bash
# Clone Jitsi Meet repository
git clone https://github.com/jitsi/jitsi-meet
cd ./jitsi-meet

# Install dependencies
npm install

# Build for production
make

# Run development server
make dev

# Point to custom backend
export WEBPACK_DEV_SERVER_PROXY_TARGET=https://your-custom-server.com
make dev
```

### Using lib-jitsi-meet

**lib-jitsi-meet** is a core dependency of Jitsi Meet. When building custom Jitsi Meet, you may need to work with local copies of lib-jitsi-meet.

#### Default Installation

By default, lib-jitsi-meet is installed from GitHub releases:

```json
{
  "dependencies": {
    "lib-jitsi-meet": "https://github.com/jitsi/lib-jitsi-meet/releases/download/v<version>+<commit-hash>/lib-jitsi-meet.tgz"
  }
}
```

#### Using Local Copy

**Option 1: Packed Archive**

```bash
# In lib-jitsi-meet directory
cd lib-jitsi-meet
npm pack
# Creates lib-jitsi-meet.tgz
```

Then in jitsi-meet's `package.json`:

```json
{
  "dependencies": {
    "lib-jitsi-meet": "file:///path/to/lib-jitsi-meet.tgz"
  }
}
```

**Option 2: npm link (for development)**

```bash
# In lib-jitsi-meet directory
cd lib-jitsi-meet
npm link

# In jitsi-meet directory
cd ../jitsi-meet
npm link lib-jitsi-meet
```

After making changes to lib-jitsi-meet:

```bash
cd node_modules/lib-jitsi-meet
npm run build
```

To unlink:

```bash
cd jitsi-meet
npm unlink lib-jitsi-meet
npm install
```

**Note:** `npm link` does not work when building mobile applications.

#### Force Install Local Changes

If you've modified lib-jitsi-meet locally:

```bash
# Force install and rebuild
npm install lib-jitsi-meet --force && make

# Or if only lib-jitsi-meet changed:
npm install lib-jitsi-meet --force && make deploy-lib-jitsi-meet
```

### When to Build Custom Jitsi Meet

Building custom Jitsi Meet is only necessary if you need to:
- Customize the UI significantly
- Add custom features at the Jitsi Meet core level
- Modify core Jitsi Meet functionality
- Deploy your own Jitsi Meet instance
- Customize lib-jitsi-meet itself

**For most use cases:** The standard Jitsi Meet with API customization (React SDK, IFrame API, or lib-jitsi-meet API) is sufficient. The backend already provides all necessary configurations without requiring custom builds.

## Security Notes

1. **JWT Tokens**: Use JWT tokens for production deployments to ensure secure access
2. **Domain Configuration**: Use your own Jitsi Meet deployment for maximum security
3. **App Secret**: Never expose `JITSI_APP_SECRET` in client-side code
4. **Room Names**: Room names are auto-generated and include session IDs for uniqueness

## Troubleshooting

### JWT Token Generation Fails
- Ensure `jsonwebtoken` package is installed: `npm install jsonwebtoken`
- Verify `JITSI_APP_SECRET` is correctly set
- Check that `JITSI_APP_ID` matches your Jitsi account

### Connection Issues
- Verify domain configuration matches your Jitsi deployment
- Check network connectivity and firewall settings
- Ensure WebSocket connections are allowed

### API Type Not Recognized
- Ensure `apiType` parameter is one of: `react-sdk`, `iframe`, `lib-jitsi-meet`
- Default is `react-sdk` if parameter is omitted

## Jitsi Meet API Functions

The Jitsi Meet API (available via `externalApi` from React SDK or IFrame API) provides numerous functions to control the embedded conference. Below is a comprehensive list of available functions:

### Device Management

#### getAvailableDevices()
Retrieves a list of available audio/video devices.

```typescript
api.getAvailableDevices().then(devices => {
  // devices = {
  //   audioInput: [{ deviceId, groupId, kind, label }, ...],
  //   audioOutput: [{ deviceId, groupId, kind, label }, ...],
  //   videoInput: [{ deviceId, groupId, kind, label }, ...]
  // }
});
```

#### getCurrentDevices()
Retrieves currently selected devices.

```typescript
api.getCurrentDevices().then(devices => {
  // devices = {
  //   audioInput: { deviceId, groupId, kind, label },
  //   audioOutput: { deviceId, groupId, kind, label },
  //   videoInput: { deviceId, groupId, kind, label }
  // }
});
```

#### setAudioInputDevice(deviceLabel, deviceId)
Sets the audio input device.

```typescript
api.setAudioInputDevice('Microphone Name', 'device-id');
```

#### setAudioOutputDevice(deviceLabel, deviceId)
Sets the audio output device.

```typescript
api.setAudioOutputDevice('Speaker Name', 'device-id');
```

#### setVideoInputDevice(deviceLabel, deviceId)
Sets the video input device.

```typescript
api.setVideoInputDevice('Camera Name', 'device-id');
```

#### isDeviceChangeAvailable(deviceType?)
Checks if device change is available.

```typescript
api.isDeviceChangeAvailable('input').then(available => { ... });
```

#### isDeviceListAvailable()
Checks if device list is available.

```typescript
api.isDeviceListAvailable().then(available => { ... });
```

### Media Control

#### isAudioMuted()
Checks if audio is muted.

```typescript
api.isAudioMuted().then(muted => { ... });
```

#### isVideoMuted()
Checks if video is muted.

```typescript
api.isVideoMuted().then(muted => { ... });
```

#### isAudioAvailable()
Checks if audio is available.

```typescript
api.isAudioAvailable().then(available => { ... });
```

#### isVideoAvailable()
Checks if video is available.

```typescript
api.isVideoAvailable().then(available => { ... });
```

#### isAudioDisabled()
Checks if audio is disabled.

```typescript
api.isAudioDisabled().then(disabled => { ... });
```

### Participant Management

#### getRoomsInfo()
Returns array of available rooms and participant details.

```typescript
api.getRoomsInfo().then(rooms => {
  // rooms = [{
  //   isMainRoom: boolean,
  //   id: string,
  //   jid: string,
  //   participants: [{
  //     id: string,
  //     jid: string,
  //     role: string,
  //     displayName: string
  //   }]
  // }]
});
```

#### getNumberOfParticipants()
Returns the number of conference participants.

```typescript
const count = api.getNumberOfParticipants();
```

#### getDisplayName(participantId)
Returns a participant's display name.

```typescript
const name = api.getDisplayName('participant-id');
```

#### getEmail(participantId)
Returns a participant's email.

```typescript
const email = api.getEmail('participant-id');
```

#### pinParticipant(participantId, videoType?)
Pins a participant to always show their video.

```typescript
api.pinParticipant('participant-id', 'camera'); // or 'desktop'
```

#### setLargeVideoParticipant(participantId?)
Displays a participant on the large video view.

```typescript
api.setLargeVideoParticipant('participant-id');
```

### Conference Information

#### getSessionId()
Returns the meeting's unique session ID.

```typescript
api.getSessionId().then(sessionId => { ... });
```

#### getVideoQuality()
Returns the current video quality setting.

```typescript
const quality = api.getVideoQuality();
```

#### getDeploymentInfo()
Retrieves deployment information.

```typescript
api.getDeploymentInfo().then(info => {
  // info = { region, shard, ... }
});
```

#### getLivestreamUrl()
Retrieves livestream URL information.

```typescript
api.getLivestreamUrl().then(data => {
  // data = { livestreamUrl: string }
});
```

#### getSharedDocumentUrl()
Returns the Etherpad shared document URL.

```typescript
api.getSharedDocumentUrl().then(url => { ... });
```

### Screenshots

#### captureLargeVideoScreenshot()
Captures screenshot of the large video view.

```typescript
api.captureLargeVideoScreenshot().then(data => {
  // data = { dataURL: 'data:image/png;base64,...' }
});
```

#### captureCameraPicture(cameraFacingMode?, descriptionText?, titleText?)
Mobile browsers only. Captures high-quality picture using device camera.

```typescript
api.captureCameraPicture('environment', 'Description', 'Title').then(data => {
  // data = { dataURL: 'data:image/png;base64,...' } or { error: string }
});
```

### Content Sharing

#### getContentSharingParticipants()
Returns array of participants currently sharing content.

```typescript
api.getContentSharingParticipants().then(res => {
  // res.sharingParticipantIds = [id1, id2, ...]
});
```

### Virtual Background

#### setVirtualBackground(enabled, backgroundImage)
Sets virtual background with base64 image.

```typescript
api.setVirtualBackground(
  true,
  'data:image/png;base64,iVBORw0KGgo...'
);
```

### UI Control

#### resizeLargeVideo(width, height)
Resizes the large video container.

```typescript
api.resizeLargeVideo(1280, 720);
```

#### isParticipantsPaneOpen()
Checks if participants pane is open.

```typescript
api.isParticipantsPaneOpen().then(open => { ... });
```

### Recording

#### startRecording(options)
Starts file recording or streaming.

```typescript
api.startRecording({
  mode: 'file', // or 'stream'
  // ... other options
});
```

#### stopRecording(mode, transcription?)
Stops ongoing recording, streaming, or transcription.

```typescript
api.stopRecording('file', false);
```

### Invitations

#### invite(invitees)
Invites participants to the meeting.

```typescript
// PSTN invite
api.invite([{
  type: 'phone',
  number: '+31201234567'
}]);

// SIP invite
api.invite([{
  type: 'sip',
  address: 'user@example.com'
}]);
```

### Moderation

#### isModerationOn(mediaType?)
Checks if moderation is enabled.

```typescript
api.isModerationOn('audio').then(on => { ... });
```

#### isParticipantForceMuted(participantId, mediaType?)
Checks if participant is force muted.

```typescript
api.isParticipantForceMuted('participant-id', 'audio').then(forceMuted => { ... });
```

### Other Functions

#### isMultipleAudioInputSupported()
Checks if multiple audio inputs are supported.

```typescript
api.isMultipleAudioInputSupported().then(supported => { ... });
```

#### isVisitor()
Checks if current user is a visitor.

```typescript
const visitor = api.isVisitor();
```

#### isP2pActive()
Checks if P2P connection is active.

```typescript
api.isP2pActive().then(isP2p => { ... });
```

#### isStartSilent()
Checks if meeting started in view-only mode.

```typescript
api.isStartSilent().then(silent => { ... });
```

#### listBreakoutRooms()
Returns map of breakout rooms.

```typescript
api.listBreakoutRooms().then(rooms => { ... });
```

#### getSupportedCommands()
Returns array of supported commands.

```typescript
const commands = api.getSupportedCommands();
```

#### getSupportedEvents()
Returns array of supported events.

```typescript
const events = api.getSupportedEvents();
```

#### getIFrame()
Returns the IFrame HTML element.

```typescript
const iframe = api.getIFrame();
```

#### dispose()
Removes the embedded Jitsi Meet conference.

```typescript
api.dispose();
```

**Note:** Jitsi recommends calling `dispose()` before page unload.

## Jitsi Meet Commands

The Jitsi Meet API provides commands that can be executed using `executeCommand()` or `executeCommands()` for batch execution. Commands allow you to control conference behavior, participant actions, UI elements, and more.

### Command Execution

#### Single Command
```typescript
api.executeCommand('toggleAudio');
api.executeCommand('displayName', 'New Nickname');
api.executeCommand('setVideoQuality', 720);
```

#### Multiple Commands (Batch)
```typescript
api.executeCommands({
  displayName: ['New Nickname'],
  toggleAudio: [],
  setVideoQuality: [720]
});
```

### Available Commands

#### Participant Settings

**displayName**
Sets the display name of the local participant.

```typescript
api.executeCommand('displayName', 'New Nickname');
```

**email**
Changes the local email address.

```typescript
api.executeCommand('email', 'example@example.com');
```

#### Room Management

**password**
Sets the password for the room.

```typescript
// Set password (moderator only)
api.executeCommand('password', 'The Password');

// Join protected channel
api.on('passwordRequired', () => {
  api.executeCommand('password', 'The Password');
});
```

**subject**
Sets the conference subject (moderator only).

```typescript
api.executeCommand('subject', 'New Conference Subject');
```

**localSubject**
Sets the local conference subject (all participants).

```typescript
api.executeCommand('localSubject', 'My Local Subject');
```

**toggleLobby**
Toggles lobby mode on/off (moderator only).

```typescript
api.executeCommand('toggleLobby', true);
```

#### Media Control

**toggleAudio**
Mutes/unmutes audio for the local participant.

```typescript
api.executeCommand('toggleAudio');
```

**toggleVideo**
Mutes/unmutes video for the local participant.

```typescript
api.executeCommand('toggleVideo');
```

**toggleCamera**
Sets camera facing mode (mobile web).

```typescript
api.executeCommand('toggleCamera', 'user'); // or 'environment'
api.executeCommand('toggleCamera'); // toggles between modes
```

**toggleCameraMirror**
Toggles mirroring of local video.

```typescript
api.executeCommand('toggleCameraMirror');
```

**setVideoQuality**
Sets video resolution height.

```typescript
api.executeCommand('setVideoQuality', 720); // 360, 480, 720, 1080
```

**setAudioOnly**
Enables/disables audio-only mode.

```typescript
api.executeCommand('setAudioOnly', true);
```

**setNoiseSuppressionEnabled**
Enable/disable noise suppression.

```typescript
api.executeCommand('setNoiseSuppressionEnabled', {
  enabled: true
});
```

#### UI Control

**toggleFilmStrip**
Hide/show the filmstrip.

```typescript
api.executeCommand('toggleFilmStrip');
```

**toggleChat**
Hide/show chat messaging.

```typescript
api.executeCommand('toggleChat');
```

**toggleRaiseHand**
Show/hide raised hand.

```typescript
api.executeCommand('toggleRaiseHand');
```

**toggleShareScreen**
Start/stop screen sharing.

```typescript
api.executeCommand('toggleShareScreen');
```

**toggleSubtitles**
Start/stop subtitles.

```typescript
api.executeCommand('toggleSubtitles');
```

**toggleTileView**
Enter/exit tile view layout mode.

```typescript
api.executeCommand('toggleTileView');
```

**setTileView**
Enable/disable tile view.

```typescript
api.executeCommand('setTileView', true);
```

**toggleWhiteboard**
Toggle whiteboard visibility.

```typescript
api.executeCommand('toggleWhiteboard');
```

**toggleParticipantsPane**
Change visibility of participants pane.

```typescript
api.executeCommand('toggleParticipantsPane', true);
```

**resizeFilmStrip**
Resize the filmstrip.

```typescript
api.executeCommand('resizeFilmStrip', { width: 200 });
```

**resizeLargeVideo**
Resize the large video container.

```typescript
api.executeCommand('resizeLargeVideo', 1280, 720);
```

#### Video Sharing

**startShareVideo**
Starts sharing a YouTube video or web video (mp4).

```typescript
api.executeCommand('startShareVideo', 'https://www.youtube.com/watch?v=...');
api.executeCommand('startShareVideo', 'https://example.com/video.mp4');
```

**stopShareVideo**
Stops sharing video (if user started it).

```typescript
api.executeCommand('stopShareVideo');
```

#### Participant Control

**pinParticipant**
Pins a participant or unpins all.

```typescript
api.executeCommand('pinParticipant', 'participant-id');
api.executeCommand('pinParticipant'); // unpin all
```

**setLargeVideoParticipant**
Displays participant on large video.

```typescript
api.executeCommand('setLargeVideoParticipant', 'participant-id', 'desktop');
api.executeCommand('setLargeVideoParticipant'); // auto-select
```

**setParticipantVolume**
Change participant volume (0-1).

```typescript
api.executeCommand('setParticipantVolume', 'participant-id', 0.5);
```

**muteEveryone**
Mute all participants (moderator only).

```typescript
api.executeCommand('muteEveryone', 'audio'); // or 'video'
api.executeCommand('muteEveryone'); // defaults to 'audio'
```

**kickParticipant**
Kicks participant from meeting.

```typescript
api.executeCommand('kickParticipant', 'participant-id');
```

**grantModerator**
Grants moderator rights to participant.

```typescript
api.executeCommand('grantModerator', 'participant-id');
```

#### Chat

**sendChatMessage**
Sends a chat message.

```typescript
// Group chat
api.executeCommand('sendChatMessage', 'Hello everyone!');

// Private chat
api.executeCommand('sendChatMessage', 'Private message', 'participant-id');

// Ignore privacy notification
api.executeCommand('sendChatMessage', 'Message', 'participant-id', true);
```

**initiatePrivateChat**
Opens chat with specific participant.

```typescript
api.executeCommand('initiatePrivateChat', 'participant-id');
```

**cancelPrivateChat**
Resets chat to group chat.

```typescript
api.executeCommand('cancelPrivateChat');
```

#### Moderation

**toggleModeration**
Change moderation status.

```typescript
api.executeCommand('toggleModeration', true, 'audio'); // or 'video'
```

**askToUnmute**
Asks participant to unmute (may approve if moderation on).

```typescript
api.executeCommand('askToUnmute', 'participant-id');
```

**approveVideo**
Approves participant for video (if video moderation on).

```typescript
api.executeCommand('approveVideo', 'participant-id');
```

**rejectParticipant**
Rejects participant from moderation.

```typescript
api.executeCommand('rejectParticipant', 'participant-id', 'audio'); // or 'video'
```

#### Recording

**startRecording**
Starts recording, streaming, or transcription.

```typescript
// Local recording
api.executeCommand('startRecording', {
  mode: 'local',
  onlySelf: false
});

// File recording
api.executeCommand('startRecording', {
  mode: 'file',
  shouldShare: true,
  extraMetadata: { key: 'value' }
});

// RTMP streaming
api.executeCommand('startRecording', {
  mode: 'stream',
  rtmpStreamKey: 'stream-key',
  rtmpBroadcastID: 'broadcast-id'
});

// YouTube streaming
api.executeCommand('startRecording', {
  mode: 'stream',
  youtubeStreamKey: 'stream-key',
  youtubeBroadcastID: 'broadcast-id'
});

// Dropbox recording (requires OAuth token)
api.executeCommand('startRecording', {
  mode: 'file',
  dropboxToken: 'oauth-token'
});

// Transcription
api.executeCommand('startRecording', {
  mode: 'file',
  transcription: true
});
```

**stopRecording**
Stops recording, streaming, or transcription.

```typescript
api.executeCommand('stopRecording', 'local', false);
api.executeCommand('stopRecording', 'file', false);
api.executeCommand('stopRecording', 'stream', false);
```

#### Breakout Rooms

**addBreakoutRoom**
Creates a breakout room (moderator only).

```typescript
api.executeCommand('addBreakoutRoom', 'Room Name');
api.executeCommand('addBreakoutRoom'); // unnamed room
```

**autoAssignToBreakoutRooms**
Auto-assigns participants to breakout rooms (moderator only).

```typescript
api.executeCommand('autoAssignToBreakoutRooms');
```

**closeBreakoutRoom**
Closes breakout room and sends participants to main room (moderator only).

```typescript
api.executeCommand('closeBreakoutRoom', 'room-id');
```

**joinBreakoutRoom**
Joins a breakout room or main room.

```typescript
api.executeCommand('joinBreakoutRoom', 'room-id');
api.executeCommand('joinBreakoutRoom'); // join main room
```

**removeBreakoutRoom**
Removes a breakout room (moderator only).

```typescript
api.executeCommand('removeBreakoutRoom', 'breakout-room-jid');
```

**sendParticipantToRoom**
Sends participant to a room (moderator only).

```typescript
api.executeCommand('sendParticipantToRoom', 'participant-id', 'room-id');
```

#### Virtual Background

**setVirtualBackground**
Sets virtual background with base64 image.

```typescript
api.executeCommand('setVirtualBackground', true, 'data:image/png;base64,iVBOR...');
api.executeCommand('setVirtualBackground', false);
```

**setBlurredBackground**
Sets or removes blurred virtual background.

```typescript
api.executeCommand('setBlurredBackground', 'slight-blur'); // or 'blur', 'none'
```

**toggleVirtualBackgroundDialog**
Opens/closes virtual background selection dialog.

```typescript
api.executeCommand('toggleVirtualBackgroundDialog');
```

#### Other Commands

**setFollowMe**
Toggle follow me functionality (moderator only).

```typescript
api.executeCommand('setFollowMe', true, false); // value, recorderOnly
```

**setSubtitles**
Enable/disable subtitles.

```typescript
api.executeCommand('setSubtitles', true, true, 'en'); // enabled, displaySubtitles, language
```

**overwriteConfig**
Overwrite config.js properties.

```typescript
api.executeCommand('overwriteConfig', {
  toolbarButtons: ['chat']
});
```

**setAssumedBandwidthBps**
Sets assumed bandwidth in bps.

```typescript
api.executeCommand('setAssumedBandwidthBps', 1000000);
```

**sendCameraFacingMode**
Sends request to participant to set camera facing mode.

```typescript
api.executeCommand('sendCameraFacingMode', 'participant-id', 'user');
api.executeCommand('sendCameraFacingMode', 'participant-id'); // toggle
```

**sendEndpointTextMessage**
Sends text message to participant via data channels.

```typescript
api.executeCommand('sendEndpointTextMessage', 'participant-id', 'Message text');
```

**sendTones**
Plays touch tone dial pads.

```typescript
api.executeCommand('sendTones', {
  tones: '12345#',
  duration: 200, // ms
  pause: 200 // ms between tones
});
```

**answerKnockingParticipant**
Approves/rejects knocking participant in lobby.

```typescript
api.executeCommand('answerKnockingParticipant', 'participant-id', true); // approved
```

**showNotification**
Shows custom notification.

```typescript
api.executeCommand('showNotification', {
  title: 'Notification Title',
  description: 'Notification description',
  type: 'success', // 'normal', 'success', 'warning', 'error'
  timeout: 'medium', // 'short', 'medium', 'long', 'sticky'
  uid: 'unique-id',
  customActions: [
    { label: 'Action 1', uuid: 'action-1' },
    { label: 'Action 2', uuid: 'action-2' }
  ]
});
```

**hideNotification**
Hides notification by UID.

```typescript
api.executeCommand('hideNotification', 'unique-id');
```

**overwriteNames**
Overwrites participant names locally.

```typescript
api.executeCommand('overwriteNames', [
  { id: 'participant-1', name: 'New Name 1' },
  { id: 'participant-2', name: 'New Name 2' }
]);
```

**hangup**
Ends the call for the local participant.

```typescript
api.executeCommand('hangup');
```

**endConference**
Ends conference for everyone (moderator only, requires support).

```typescript
api.executeCommand('endConference');
```

### Command Examples

#### Example: Set Up Conference
```typescript
api.executeCommands({
  displayName: ['John Doe'],
  email: ['john@example.com'],
  subject: ['Patient Counseling Session'],
  toggleLobby: [true]
});
```

#### Example: Control Media
```typescript
// Toggle audio and set video quality
api.executeCommands({
  toggleAudio: [],
  setVideoQuality: [720]
});
```

#### Example: Participant Management
```typescript
// Pin participant and set on large video
api.executeCommands({
  pinParticipant: ['participant-id'],
  setLargeVideoParticipant: ['participant-id', 'camera']
});
```

#### Example: Recording Setup
```typescript
api.executeCommand('startRecording', {
  mode: 'file',
  shouldShare: true,
  transcription: true
});
```

## Jitsi Meet Events

The Jitsi Meet API implements the EventEmitter API for emitting and listening to events. You can add event listeners using `addListener` or `on`, and remove them with `removeListener` or `off`.

### Event Listener Methods

```typescript
// Add listener (both methods work)
api.addListener('participantJoined', (data) => {
  console.log('Participant joined:', data);
});

api.on('participantJoined', (data) => {
  console.log('Participant joined:', data);
});

// Remove listener (both methods work)
api.removeListener('participantJoined', listener);
api.off('participantJoined', listener);
```

### Available Events

#### Error Events

**cameraError**
Fired when Jitsi Meet fails to access the camera.

```typescript
api.addListener('cameraError', (error) => {
  // error = { type: string, message: string }
  console.error('Camera error:', error);
});
```

**micError**
Fired when Jitsi Meet fails to access the microphone.

```typescript
api.addListener('micError', (error) => {
  // error = { type: string, message: string }
  console.error('Microphone error:', error);
});
```

**errorOccurred**
Fired when any error occurs in the conference.

```typescript
api.addListener('errorOccurred', (error) => {
  // error = { details?, message?, name, type: 'CONFIG'|'CONNECTION'|'CONFERENCE', isFatal }
  if (error.isFatal) {
    // Handle fatal error
  }
});
```

**feedbackSubmitted**
Fired when conference feedback is submitted.

```typescript
api.addListener('feedbackSubmitted', (data) => {
  // data = { error?: string }
  if (data.error) {
    console.error('Feedback submission error:', data.error);
  }
});
```

#### Participant Events

**avatarChanged**
Fired when a participant's avatar changes.

```typescript
api.addListener('avatarChanged', (data) => {
  // data = { id: string, avatarURL: string }
  console.log(`Participant ${data.id} changed avatar to ${data.avatarURL}`);
});
```

**displayNameChange**
Fired when a participant's display name changes.

```typescript
api.addListener('displayNameChange', (data) => {
  // data = { id: string, displayname: string }
  console.log(`Participant ${data.id} changed name to ${data.displayname}`);
});
```

**emailChange**
Fired when a participant's email changes.

```typescript
api.addListener('emailChange', (data) => {
  // data = { id: string, email: string }
  console.log(`Participant ${data.id} changed email to ${data.email}`);
});
```

**participantJoined**
Fired when a new participant joins the room.

```typescript
api.addListener('participantJoined', (data) => {
  // data = { id: string, displayName: string }
  console.log(`${data.displayName} joined the room`);
});
```

**participantLeft**
Fired when a participant leaves the room.

```typescript
api.addListener('participantLeft', (data) => {
  // data = { id: string }
  console.log(`Participant ${data.id} left the room`);
});
```

**participantKickedOut**
Fired when a participant is removed from the room.

```typescript
api.addListener('participantKickedOut', (data) => {
  // data = { kicked: { id, local }, kicker: { id } }
  if (data.kicked.local) {
    console.log('You were kicked out');
  }
});
```

**participantRoleChanged**
Fired when the local user's role changes (e.g., becomes moderator).

```typescript
api.addListener('participantRoleChanged', (data) => {
  // data = { id: string, role: string }
  if (data.role === 'moderator') {
    console.log('You are now a moderator');
  }
});
```

#### Media Events

**audioAvailabilityChanged**
Fired when audio availability changes.

```typescript
api.addListener('audioAvailabilityChanged', (data) => {
  // data = { available: boolean }
  console.log('Audio available:', data.available);
});
```

**audioMuteStatusChanged**
Fired when audio mute status changes.

```typescript
api.addListener('audioMuteStatusChanged', (data) => {
  // data = { muted: boolean }
  console.log('Audio muted:', data.muted);
});
```

**videoAvailabilityChanged**
Fired when video availability changes.

```typescript
api.addListener('videoAvailabilityChanged', (data) => {
  // data = { available: boolean }
  console.log('Video available:', data.available);
});
```

**videoMuteStatusChanged**
Fired when video mute status changes.

```typescript
api.addListener('videoMuteStatusChanged', (data) => {
  // data = { muted: boolean }
  console.log('Video muted:', data.muted);
});
```

**videoQualityChanged**
Fired when video quality changes.

```typescript
api.addListener('videoQualityChanged', (data) => {
  // data = { videoQuality: number }
  console.log('Video quality changed to:', data.videoQuality);
});
```

**audioOnlyChanged**
Fired when audio-only mode changes.

```typescript
api.addListener('audioOnlyChanged', (data) => {
  // data = { audioOnlyChanged: boolean }
  console.log('Audio-only mode:', data.audioOnlyChanged);
});
```

#### UI Events

**largeVideoChanged**
Fired when the participant on large video changes.

```typescript
api.addListener('largeVideoChanged', (data) => {
  // data = { id: string }
  console.log('Large video participant:', data.id);
});
```

**dominantSpeakerChanged**
Fired when the dominant speaker changes.

```typescript
api.addListener('dominantSpeakerChanged', (data) => {
  // data = { id: string }
  console.log('Dominant speaker:', data.id);
});
```

**tileViewChanged**
Fired when tile view is enabled/disabled.

```typescript
api.addListener('tileViewChanged', (data) => {
  // data = { enabled: boolean }
  console.log('Tile view:', data.enabled);
});
```

**chatUpdated**
Fired when chat state changes.

```typescript
api.addListener('chatUpdated', (data) => {
  // data = { isOpen: boolean, unreadCount: number }
  console.log(`Chat is ${data.isOpen ? 'open' : 'closed'}, ${data.unreadCount} unread`);
});
```

**incomingMessage**
Fired when a chat message is received.

```typescript
api.addListener('incomingMessage', (data) => {
  // data = { from, nick, privateMessage, message, stamp }
  console.log(`${data.nick}: ${data.message}`);
});
```

**outgoingMessage**
Fired when a chat message is sent.

```typescript
api.addListener('outgoingMessage', (data) => {
  // data = { message, privateMessage }
  console.log('Message sent:', data.message);
});
```

**filmstripDisplayChanged**
Fired when filmstrip visibility changes.

```typescript
api.addListener('filmstripDisplayChanged', (data) => {
  // data = { visible: boolean }
  console.log('Filmstrip visible:', data.visible);
});
```

**participantsPaneToggled**
Fired when participants pane is toggled.

```typescript
api.addListener('participantsPaneToggled', (data) => {
  // data = { open: boolean }
  console.log('Participants pane:', data.open ? 'open' : 'closed');
});
```

**raiseHandUpdated**
Fired when a participant raises/lowers their hand.

```typescript
api.addListener('raiseHandUpdated', (data) => {
  // data = { id, handRaised: number }
  if (data.handRaised > 0) {
    console.log(`Participant ${data.id} raised hand`);
  }
});
```

**screenSharingStatusChanged**
Fired when screen sharing starts/stops.

```typescript
api.addListener('screenSharingStatusChanged', (data) => {
  // data = { on: boolean, details: { sourceType?: 'window'|'screen'|'proxy'|'device' } }
  console.log('Screen sharing:', data.on, 'Source:', data.details.sourceType);
});
```

**contentSharingParticipantsChanged**
Fired when participants sharing content change.

```typescript
api.addListener('contentSharingParticipantsChanged', (data) => {
  // data = { data: string[] }
  console.log('Sharing participants:', data.data);
});
```

#### Conference Events

**videoConferenceJoined**
Fired when the local user joins the conference.

```typescript
api.addListener('videoConferenceJoined', (data) => {
  // data = { roomName, id, displayName, avatarURL, breakoutRoom, visitor }
  console.log('Joined conference:', data.roomName);
});
```

**videoConferenceLeft**
Fired when the local user leaves the conference.

```typescript
api.addListener('videoConferenceLeft', (data) => {
  // data = { roomName }
  console.log('Left conference:', data.roomName);
});
```

**conferenceCreatedTimestamp**
Fired with the conference start timestamp.

```typescript
api.addListener('conferenceCreatedTimestamp', (data) => {
  // data = { timestamp: number }
  console.log('Conference started at:', new Date(data.timestamp));
});
```

**subjectChange**
Fired when conference subject changes.

```typescript
api.addListener('subjectChange', (data) => {
  // data = { subject: string }
  console.log('Subject changed to:', data.subject);
});
```

**passwordRequired**
Fired when a password is required to join a protected room.

```typescript
api.addListener('passwordRequired', () => {
  api.executeCommand('password', 'The Password');
});
```

#### Breakout Rooms

**breakoutRoomsUpdated**
Fired when breakout rooms are updated.

```typescript
api.addListener('breakoutRoomsUpdated', (data) => {
  // data = { [roomId]: { id, jid, name, isMainRoom?, participants } }
  console.log('Breakout rooms updated:', Object.keys(data));
});
```

**knockingParticipant**
Fired when a participant knocks in the lobby.

```typescript
api.addListener('knockingParticipant', (data) => {
  // data = { participant: { id, name } }
  console.log(`${data.participant.name} is knocking`);
  api.executeCommand('answerKnockingParticipant', data.participant.id, true);
});
```

#### Recording Events

**recordingStatusChanged**
Fired when recording status changes.

```typescript
api.addListener('recordingStatusChanged', (data) => {
  // data = { on: boolean, mode: 'local'|'stream'|'file', error?, transcription }
  if (data.on) {
    console.log(`Recording started (${data.mode})`);
  } else {
    console.log('Recording stopped');
  }
});
```

**recordingLinkAvailable**
Fired when recording link becomes available.

```typescript
api.addListener('recordingLinkAvailable', (data) => {
  // data = { link: string, ttl: number }
  console.log('Recording link:', data.link);
});
```

#### Transcription Events

**transcribingStatusChanged**
Fired when transcription status changes.

```typescript
api.addListener('transcribingStatusChanged', (data) => {
  // data = { on: boolean }
  console.log('Transcription:', data.on ? 'started' : 'stopped');
});
```

**transcriptionChunkReceived**
Fired when a transcription chunk is received.

```typescript
api.addListener('transcriptionChunkReceived', (data) => {
  // data = { language, messageID, participant, final?, stable?, unstable? }
  const text = data.final || data.stable || data.unstable || '';
  console.log(`${data.participant.name}: ${text}`);
});
```

#### Moderation Events

**moderationStatusChanged**
Fired when moderation status changes.

```typescript
api.addListener('moderationStatusChanged', (data) => {
  // data = { mediaType: string, enabled: boolean }
  console.log(`Moderation ${data.enabled ? 'enabled' : 'disabled'} for ${data.mediaType}`);
});
```

**moderationParticipantApproved**
Fired when a participant is approved for moderation.

```typescript
api.addListener('moderationParticipantApproved', (data) => {
  // data = { id, mediaType }
  console.log(`Participant ${data.id} approved for ${data.mediaType}`);
});
```

**moderationParticipantRejected**
Fired when a participant is rejected from moderation.

```typescript
api.addListener('moderationParticipantRejected', (data) => {
  // data = { id, mediaType }
  console.log(`Participant ${data.id} rejected for ${data.mediaType}`);
});
```

#### Device Events

**deviceListChanged**
Fired when available devices change.

```typescript
api.addListener('deviceListChanged', (data) => {
  // data = { devices: { audioInput, audioOutput, videoInput } }
  console.log('Available devices updated');
});
```

#### Communication Events

**endpointTextMessageReceived**
Fired when a text message is received via data channels.

```typescript
api.addListener('endpointTextMessageReceived', (data) => {
  // data = { senderInfo: { jid, id }, eventData: { name, text } }
  console.log(`Message from ${data.senderInfo.id}: ${data.eventData.text}`);
});
```

**nonParticipantMessageReceived**
Fired when a message is received from a non-participant (e.g., custom prosody).

```typescript
api.addListener('nonParticipantMessageReceived', (data) => {
  // data = { id: string|null, message: string }
  console.log('Non-participant message:', data.message);
});
```

**dataChannelOpened**
Fired when data channel is opened and ready.

```typescript
api.addListener('dataChannelOpened', () => {
  console.log('Data channel is open');
});
```

#### Browser/Mouse Events

**browserSupport**
Fired with browser support status.

```typescript
api.addListener('browserSupport', (data) => {
  // data = { supported: boolean }
  if (!data.supported) {
    console.warn('Browser not fully supported');
  }
});
```

**mouseEnter**
Fired when mouse enters the iframe.

```typescript
api.addListener('mouseEnter', (data) => {
  // data = { event: { clientX, clientY, ... } }
  console.log('Mouse entered iframe at:', data.event.clientX, data.event.clientY);
});
```

**mouseLeave**
Fired when mouse leaves the iframe.

```typescript
api.addListener('mouseLeave', (data) => {
  // data = { event: { clientX, clientY, ... } }
  console.log('Mouse left iframe');
});
```

**mouseMove**
Fired when mouse moves inside the iframe (triggered on interval).

```typescript
api.addListener('mouseMove', (data) => {
  // data = { event: { clientX, clientY, ... } }
  // This fires on an interval configured by mouseMoveCallbackInterval
});
```

#### Button Click Events

**toolbarButtonClicked**
Fired when a toolbar button is clicked (requires button in `buttonsWithNotifyClick` config).

```typescript
api.addListener('toolbarButtonClicked', (data) => {
  // data = { key: string, preventExecution: boolean }
  console.log('Button clicked:', data.key);
});
```

**participantMenuButtonClick**
Fired when a participant context menu button is clicked.

```typescript
api.addListener('participantMenuButtonClick', (data) => {
  // data = { key, participantId, preventExecution }
  console.log(`Button ${data.key} clicked for participant ${data.participantId}`);
});
```

#### Notification Events

**notificationTriggered**
Fired when an application notification is triggered.

```typescript
api.addListener('notificationTriggered', (data) => {
  // data = { title, description }
  console.log(`Notification: ${data.title} - ${data.description}`);
});
```

**customNotificationActionTriggered**
Fired when a custom notification action is triggered.

```typescript
api.addListener('customNotificationActionTriggered', (data) => {
  // data = { data: { id } }
  console.log('Custom action triggered:', data.data.id);
});
```

#### Face Landmarks

**faceLandmarkDetected**
Fired when a face landmark is detected.

```typescript
api.addListener('faceLandmarkDetected', (data) => {
  // data = { faceBox?: { left, right, width }, faceExpression: string }
  console.log('Face expression:', data.faceExpression);
});
```

#### Whiteboard

**whiteboardStatusChanged**
Fired when whiteboard status changes.

```typescript
api.addListener('whiteboardStatusChanged', (data) => {
  // data = { status: string }
  console.log('Whiteboard status:', data.status);
});
```

#### Connection Events

**p2pStatusChanged**
Fired when P2P connection status changes.

```typescript
api.addListener('p2pStatusChanged', (data) => {
  // data = { isP2p: boolean|null }
  console.log('P2P connection:', data.isP2p);
});
```

**suspendDetected**
Fired when host computer suspension is detected.

```typescript
api.addListener('suspendDetected', () => {
  console.log('Host computer suspended');
});
```

**peerConnectionFailure**
Fired when PeerConnection loses connectivity (requires rtcstats enabled).

```typescript
api.addListener('peerConnectionFailure', (data) => {
  // data = { isP2P: boolean, wasConnected: boolean }
  console.log('PeerConnection failed:', data);
});
```

**readyToClose**
Fired when Jitsi Meet is ready to be closed (hangup operations completed).

```typescript
api.addListener('readyToClose', () => {
  console.log('Ready to close');
  // Clean up resources
});
```

#### Log Events

**log**
Fired when log events occur (requires `apiLogLevels` in config).

```typescript
api.addListener('log', (data) => {
  // data = { logLevel: 'info'|'error'|'debug'|'warn', args: string }
  console[data.logLevel]('Jitsi log:', data.args);
});
```

### Event Examples

#### Example: Track Participant Joins/Leaves
```typescript
const participants = new Set();

api.addListener('participantJoined', (data) => {
  participants.add(data.id);
  console.log(`${data.displayName} joined (${participants.size} total)`);
});

api.addListener('participantLeft', (data) => {
  participants.delete(data.id);
  console.log(`Participant left (${participants.size} total)`);
});
```

#### Example: Handle Audio/Video Mute
```typescript
api.addListener('audioMuteStatusChanged', (data) => {
  updateUI({ audioMuted: data.muted });
});

api.addListener('videoMuteStatusChanged', (data) => {
  updateUI({ videoMuted: data.muted });
});
```

#### Example: Monitor Recording Status
```typescript
api.addListener('recordingStatusChanged', (data) => {
  if (data.on) {
    showRecordingIndicator(data.mode);
  } else if (data.error) {
    showError(`Recording failed: ${data.error}`);
  } else {
    hideRecordingIndicator();
  }
});

api.addListener('recordingLinkAvailable', (data) => {
  showRecordingLink(data.link);
});
```

#### Example: Handle Chat Messages
```typescript
api.addListener('incomingMessage', (data) => {
  addMessageToChat({
    from: data.from,
    name: data.nick,
    message: data.message,
    timestamp: data.stamp,
    private: data.privateMessage
  });
});

api.addListener('chatUpdated', (data) => {
  updateUnreadBadge(data.unreadCount);
});
```

#### Example: Breakout Rooms
```typescript
api.addListener('breakoutRoomsUpdated', (rooms) => {
  updateBreakoutRoomsList(rooms);
});

api.addListener('knockingParticipant', (data) => {
  showApprovalDialog(data.participant, (approved) => {
    api.executeCommand('answerKnockingParticipant', data.participant.id, approved);
  });
});
```

## Jitsi Meet Configuration

Jitsi Meet supports extensive configuration options that can be set in `config.js` on the server side or overridden at runtime using `configOverwrite`. Configuration options marked with 🚫 cannot be overwritten through `configOverwrite`.

### Configuration Structure

```typescript
const config: JitsiMeetConfig = {
  // API Configuration
  apiLogLevels: ['warn', 'error', 'info'],
  buttonsWithNotifyClick: ['camera', 'chat'],
  
  // Audio Configuration
  startWithAudioMuted: false,
  startAudioOnly: false,
  
  // Video Configuration
  startWithVideoMuted: false,
  resolution: 720,
  
  // ... more options
};
```

### API Configuration

#### apiLogLevels
Logs that should be passed through the 'log' event.

```typescript
apiLogLevels: ['warn', 'log', 'error', 'info', 'debug']
```

#### buttonsWithNotifyClick
Toolbar buttons with click events exposed through the API.

```typescript
buttonsWithNotifyClick: [
  'camera',
  {
    key: 'chat',
    preventExecution: false
  },
  {
    key: 'closedcaptions',
    preventExecution: true
  }
]
```

#### customToolbarButtons
Custom buttons for the toolbar.

```typescript
customToolbarButtons: [{
  icon: 'data:image/svg+xml;base64,...',
  id: 'custom-button',
  text: 'Custom Button'
}]
```

#### customParticipantMenuButtons
Custom buttons for participant context menu.

```typescript
customParticipantMenuButtons: [{
  icon: 'data:image/svg+xml;base64,...',
  id: 'custom-menu-button',
  text: 'Custom Menu Button'
}]
```

#### mouseMoveCallbackInterval
Interval (milliseconds) for triggering `mouseMove` event.

```typescript
mouseMoveCallbackInterval: 1000
```

#### useHostPageLocalStorage
Use host page local storage instead of iframe's (for IFrame API).

```typescript
useHostPageLocalStorage: true
```

### Audio Configuration

#### startWithAudioMuted
Start calls with audio muted (local only).

```typescript
startWithAudioMuted: false
```

#### startAudioMuted
Every participant after Nth starts audio muted.

```typescript
startAudioMuted: 10
```

#### startAudioOnly
Start conference in audio-only mode.

```typescript
startAudioOnly: false
```

#### startSilent
Disable local audio output of remote participants.

```typescript
startSilent: false
```

#### audioQuality
Enable HD audio (disables echo cancellation, noise suppression, AGC).

```typescript
audioQuality: {
  stereo: false,
  opusMaxAverageBitrate: null // 6000 to 510000 range
}
```

#### enableNoAudioDetection
Enable no audio detection module.

```typescript
enableNoAudioDetection: true
```

#### enableNoisyMicDetection
Enable noisy microphone detection.

```typescript
enableNoisyMicDetection: true
```

#### disabledSounds
Disable specific sounds.

```typescript
disabledSounds: [
  'PARTICIPANT_JOINED_SOUND',
  'PARTICIPANT_LEFT_SOUND',
  'RAISE_HAND_SOUND'
]
```

#### speakerStats
Configure speaker stats feature.

```typescript
speakerStats: {
  disabled: false,
  disableSearch: false,
  order: ['role', 'name', 'hasLeft']
}
```

### Video Configuration

#### startWithVideoMuted
Start calls with video muted (local only).

```typescript
startWithVideoMuted: true
```

#### startVideoMuted
Every participant after Nth starts video muted.

```typescript
startVideoMuted: 5
```

#### resolution
Preferred resolution (height) for local video.

```typescript
resolution: 720 // 360, 480, 720, 1080
```

#### constraints
W3C-compliant video constraints for video capture.

```typescript
constraints: {
  video: {
    height: {
      ideal: 720,
      max: 720,
      min: 240
    }
  }
}
```

#### videoQuality
Video quality optimization settings.

```typescript
videoQuality: {
  codecPreferenceOrder: ['AV1', 'VP9', 'VP8', 'H264'],
  mobileCodecPreferenceOrder: ['VP8', 'H264', 'VP9'],
  vp8: {
    maxBitratesVideo: {
      low: 200000,
      standard: 500000,
      high: 1500000,
      fullHd: 3000000
    },
    scalabilityModeEnabled: false
  },
  minHeightForQualityLvl: {
    low: 180,
    standard: 360,
    high: 720
  }
}
```

#### disableH264
Disable H.264 video codec.

```typescript
disableH264: true
```

#### disableSelfView
Disable self-view tile.

```typescript
disableSelfView: true
```

#### maxFullResolutionParticipants
How many participants in tile view before reducing quality to SD.

```typescript
maxFullResolutionParticipants: 5 // -1 to disable
```

### Connection Configuration

#### hosts
URLs for app connection.

```typescript
hosts: {
  domain: 'jitsi-meet.example.com',
  anonymousdomain: 'guest.example.com',
  authdomain: 'jitsi-meet.example.com',
  focus: 'focus.jitsi-meet.example.com',
  muc: 'conference.jitsi-meet.example.com'
}
```

#### bosh
BOSH URL for connection.

```typescript
bosh: '//jitsi-meet.example.com/http-bind'
```

#### websocket 🚫
WebSocket URL (not overwritable).

```typescript
websocket: 'wss://jitsi-meet.example.com/xmpp-websocket'
```

#### p2p
Peer-to-peer mode configuration.

```typescript
p2p: {
  enabled: true,
  enableUnifiedOnChrome: false,
  iceTransportPolicy: 'all',
  backToP2PDelay: 5,
  stunServers: [
    { urls: 'stun:jitsi-meet.example.com:3478' },
    { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
  ]
}
```

#### e2ee
End-to-end encryption configuration.

```typescript
e2ee: {
  labels: {
    labelTooltip: 'E2EE Tooltip',
    description: 'E2EE Description',
    label: 'E2EE',
    warning: 'E2EE Warning'
  },
  externallyManagedKey: false
}
```

### Breakout Rooms Configuration

#### breakoutRooms
Breakout rooms feature options.

```typescript
breakoutRooms: {
  hideAddRoomButton: false,
  hideAutoAssignButton: false,
  hideJoinRoomButton: false,
  hideModeratorSettingsTab: false,
  hideMoreActionsButton: false,
  hideMuteAllButton: false
}
```

### Lobby Configuration

#### lobby
Lobby screen options.

```typescript
lobby: {
  autoKnock: true,
  enableChat: false
}
```

### Recording Configuration

#### fileRecordingsEnabled
Enable file recording.

```typescript
fileRecordingsEnabled: false
```

#### localRecording
Local recording configuration.

```typescript
localRecording: {
  disable: false,
  notifyAllParticipants: true
}
```

#### dropbox
Dropbox integration configuration.

```typescript
dropbox: {
  appKey: 'DROPBOX_APP_KEY',
  redirectURI: 'https://jitsi-meet.example.com/static/oauth.html'
}
```

#### recordings
Recording feature options.

```typescript
recordings: {
  recordAudioAndVideo: true,
  suggestRecording: false,
  showPrejoinWarning: true,
  showRecordingLink: true
}
```

#### hideRecordingLabel
Auto-hide recording label instead of always on screen.

```typescript
hideRecordingLabel: true
```

### Transcription Configuration

#### transcription
Transcription options.

```typescript
transcription: {
  enabled: true,
  translationLanguages: ['en-US', 'es'],
  useAppLanguage: false,
  preferredLanguage: 'en-US',
  autoTranscribeOnRecord: true
}
```

### Screen Sharing Configuration

#### desktopSharingFrameRate
Desktop sharing frame rate options.

```typescript
desktopSharingFrameRate: {
  min: 3,
  max: 10
}
```

#### screenshotCapture
Screenshot capture feature.

```typescript
screenshotCapture: {
  enabled: true,
  mode: 'recording' // or 'always'
}
```

### Notifications Configuration

#### notifications
Configure which notifications to show.

```typescript
notifications: []
```

#### disabledNotifications
List of notifications to disable.

```typescript
disabledNotifications: [
  'notify.chatMessages',
  'notify.grantedTo'
]
```

### Filmstrip Configuration

#### filmstrip
Filmstrip options.

```typescript
filmstrip: {
  disableResizable: true,
  disableStageFilmstrip: false
}
```

#### disableFilmstripAutohiding
Prevent filmstrip from autohiding on small screens.

```typescript
disableFilmstripAutohiding: true
```

#### disableCameraTintForeground
Disable camera tint foreground on active speaker.

```typescript
disableCameraTintForeground: true
```

### Face Landmarks Configuration

#### faceLandmarks
Face landmarks feature options.

```typescript
faceLandmarks: {
  enableFaceCentering: false,
  enableFaceExpressionsDetection: false,
  enableDisplayFaceExpressions: false,
  enableRTCStats: false,
  faceCenteringThreshold: 20,
  captureInterval: 1000
}
```

### Giphy Configuration

#### giphy
Giphy integration options.

```typescript
giphy: {
  enabled: true,
  sdkKey: 'example-key',
  displayMode: 'tile', // 'tile', 'chat', or 'all'
  tileTime: 7000,
  rating: 'pg' // 'g', 'pg', 'pg-13', or 'r'
}
```

### Gravatar Configuration

#### gravatar
Gravatar-compatible service configuration.

```typescript
gravatar: {
  baseUrl: 'https://www.gravatar.com/avatar/', // 🚫 Not overwritable
  disabled: false
}
```

### Etherpad Configuration

#### etherpad_base
Etherpad base URL.

```typescript
etherpad_base: 'https://your-etherpad-installati.on/p/'
```

#### openSharedDocumentOnJoin
Automatically open shared document on join.

```typescript
openSharedDocumentOnJoin: false
```

### Whiteboard Configuration

#### whiteboard
Excalidraw whiteboard integration options.

```typescript
whiteboard: {
  enabled: true,
  collabServerBaseUrl: 'https://excalidraw-backend.example.com',
  userLimit: 25,
  limitUrl: 'https://example.com/blog/whiteboard-limits'
}
```

### Security UI Configuration

#### securityUi
Security-related UI elements.

```typescript
securityUi: {
  hideLobbyButton: true,
  disableLobbyPassword: false
}
```

### Participants Pane Configuration

#### participantsPane
Participants pane options.

```typescript
participantsPane: {
  hideModeratorSettingsTab: false,
  hideMoreActionsButton: false,
  hideMuteAllButton: false
}
```

### Moderator Configuration

#### disableModeratorIndicator
Hide moderator indicators.

```typescript
disableModeratorIndicator: true
```

#### disableRemoteMute
Disable muting operations of remote participants.

```typescript
disableRemoteMute: true
```

#### disableReactionsModeration
Disable moderation of reactions feature.

```typescript
disableReactionsModeration: true
```

### Callstats Configuration

#### callStatsID
Callstats Application ID.

```typescript
callStatsID: 'my-callstats-app-id'
```

#### callStatsSecret
Callstats Secret.

```typescript
callStatsSecret: 'my-callstats-secret'
```

#### callStatsConfigParams
Callstats initialization config params.

```typescript
callStatsConfigParams: {
  disableBeforeUnloadHandler: true,
  applicationVersion: 'app_version',
  disablePrecalltest: true,
  siteID: 'siteID',
  additionalIDs: {
    customerID: 'Customer Identifier',
    tenantID: 'Tenant Identifier'
  },
  collectLegacyStats: true,
  collectIP: true
}
```

#### enableDisplayNameInStats
Enable sending display names to callstats.

```typescript
enableDisplayNameInStats: false
```

#### enableEmailInStats
Enable sending emails to callstats and analytics.

```typescript
enableEmailInStats: false
```

#### feedbackPercentage
Percentage of automatic feedback shown (0-100).

```typescript
feedbackPercentage: 100
```

### People Search Configuration

#### peopleSearchQueryTypes
Entity types queryable when inviting people.

```typescript
peopleSearchQueryTypes: ['user', 'email', 'phone']
```

#### peopleSearchUrl
Directory endpoint for invite dialog autocomplete.

```typescript
peopleSearchUrl: 'https://myservice.com/api/people'
```

#### inviteServiceUrl
Endpoint for sending invitation requests.

```typescript
inviteServiceUrl: 'https://myservice.com/api/invite'
```

#### peopleSearchTokenLocation
localStorage key for alternate authentication token.

```typescript
peopleSearchTokenLocation: 'service_token'
```

### Virtual Background Configuration

#### disableAddingBackgroundImages
Disable adding custom background images.

```typescript
disableAddingBackgroundImages: true
```

### Testing Configuration

#### testing
Experimental/testing features.

```typescript
testing: {
  assumeBandwidth: true,
  disableE2EE: false,
  mobileXmppWsThreshold: 10,
  p2pTestMode: false,
  testMode: false,
  noAutoPlayVideo: false
}
```

### Configuration Override (configOverwrite)

Most configuration options can be overridden at runtime using `configOverwrite`:

```typescript
// React SDK
const configOverwrite = {
  startWithAudioMuted: true,
  startWithVideoMuted: false,
  resolution: 1080
};

<JitsiMeeting
  domain="meet.jit.si"
  roomName="test-room"
  configOverwrite={configOverwrite}
/>
```

```typescript
// IFrame API
const options = {
  roomName: 'test-room',
  configOverwrite: {
    startWithAudioMuted: true,
    startWithVideoMuted: false,
    resolution: 1080
  }
};

const api = new JitsiMeetExternalAPI(domain, options);
```

**Note:** Options marked with 🚫 cannot be overwritten through `configOverwrite`:
- `enableForcedReload`
- `websocket`
- `fileRecordingsServiceEnabled`
- `fileRecordingsServiceSharingEnabled`
- `recordingLimit`
- `gravatar.baseUrl`

### Configuration Examples

#### Example: Basic Video Call
```typescript
const config = {
  startWithAudioMuted: false,
  startWithVideoMuted: false,
  resolution: 720
};
```

#### Example: Audio-Only Conference
```typescript
const config = {
  startAudioOnly: true,
  startWithAudioMuted: false
};
```

#### Example: Moderated Conference
```typescript
const config = {
  startWithAudioMuted: true,
  startWithVideoMuted: true,
  lobby: {
    autoKnock: true,
    enableChat: true
  },
  breakoutRooms: {
    hideAddRoomButton: false
  }
};
```

#### Example: Recording Enabled
```typescript
const config = {
  fileRecordingsEnabled: true,
  recordings: {
    recordAudioAndVideo: true,
    showPrejoinWarning: true,
    showRecordingLink: true
  },
  transcription: {
    enabled: true,
    autoTranscribeOnRecord: true
  }
};
```

#### Example: Custom UI
```typescript
const config = {
  customToolbarButtons: [{
    icon: 'data:image/svg+xml;base64,...',
    id: 'help-button',
    text: 'Help'
  }],
  buttonsWithNotifyClick: ['camera', 'chat'],
  disableModeratorIndicator: true
};
```

## Additional Resources

- [Jitsi Meet React SDK Documentation](https://github.com/jitsi/jitsi-meet-react-sdk)
- [Jitsi Meet IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [lib-jitsi-meet API Documentation](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-ljm)
- [Jitsi Meet Developer Guide](https://github.com/jitsi/jitsi-meet)

