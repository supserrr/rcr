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

## Jitsi Meet API Commands

The Jitsi Meet API provides numerous commands that can be executed using `executeCommand()` or `executeCommands()`:

### Command Execution

#### Single Command
```typescript
api.executeCommand('toggleAudio');
api.executeCommand('displayName', 'John Doe');
api.executeCommand('setVideoQuality', 720);
```

#### Multiple Commands
```typescript
api.executeCommands({
  displayName: ['John Doe'],
  toggleAudio: []
});
```

### Available Commands

#### Participant Settings

**displayName** - Sets the display name
```typescript
api.executeCommand('displayName', 'New Nickname');
```

**email** - Changes the local email address
```typescript
api.executeCommand('email', 'example@example.com');
```

#### Room Management

**password** - Sets the password for the room
```typescript
api.executeCommand('password', 'The Password');
```

**subject** - Sets the subject (moderator only)
```typescript
api.executeCommand('subject', 'New Conference Subject');
```

**localSubject** - Sets local subject (all participants)
```typescript
api.executeCommand('localSubject', 'Local Subject');
```

**toggleLobby** - Toggles lobby mode (moderator only)
```typescript
api.executeCommand('toggleLobby', true);
```

#### Media Control

**toggleAudio** - Mutes/unmutes audio
```typescript
api.executeCommand('toggleAudio');
```

**toggleVideo** - Mutes/unmutes video
```typescript
api.executeCommand('toggleVideo');
```

**toggleCamera** - Toggles camera facing mode (mobile)
```typescript
api.executeCommand('toggleCamera', 'user'); // or 'environment'
```

**toggleCameraMirror** - Toggles camera mirroring
```typescript
api.executeCommand('toggleCameraMirror');
```

**setVideoQuality** - Sets video quality
```typescript
api.executeCommand('setVideoQuality', 720); // 180, 360, 720, 1080
```

**setAudioOnly** - Enables/disables audio-only mode
```typescript
api.executeCommand('setAudioOnly', true);
```

**setNoiseSuppressionEnabled** - Controls noise suppression
```typescript
api.executeCommand('setNoiseSuppressionEnabled', { enabled: true });
```

#### UI Control

**toggleFilmStrip** - Shows/hides filmstrip
```typescript
api.executeCommand('toggleFilmStrip');
```

**toggleChat** - Shows/hides chat
```typescript
api.executeCommand('toggleChat');
```

**toggleRaiseHand** - Shows/hides raise hand
```typescript
api.executeCommand('toggleRaiseHand');
```

**toggleShareScreen** - Starts/stops screen sharing
```typescript
api.executeCommand('toggleShareScreen');
```

**toggleSubtitles** - Starts/stops subtitles
```typescript
api.executeCommand('toggleSubtitles');
```

**toggleTileView** - Enters/exits tile view
```typescript
api.executeCommand('toggleTileView');
```

**setTileView** - Sets tile view mode
```typescript
api.executeCommand('setTileView', true);
```

**toggleWhiteboard** - Shows/hides whiteboard
```typescript
api.executeCommand('toggleWhiteboard');
```

**toggleParticipantsPane** - Shows/hides participants pane
```typescript
api.executeCommand('toggleParticipantsPane', true);
```

#### Video Sharing

**startShareVideo** - Starts sharing a video (YouTube or web)
```typescript
api.executeCommand('startShareVideo', 'https://youtube.com/watch?v=...');
```

**stopShareVideo** - Stops video sharing
```typescript
api.executeCommand('stopShareVideo');
```

#### Participant Control

**pinParticipant** - Pins a participant
```typescript
api.executeCommand('pinParticipant', 'participant-id');
api.executeCommand('pinParticipant'); // Unpin all
```

**setLargeVideoParticipant** - Sets large video participant
```typescript
api.executeCommand('setLargeVideoParticipant', 'participant-id', 'camera'); // or 'desktop'
```

**setParticipantVolume** - Sets participant volume (0-1)
```typescript
api.executeCommand('setParticipantVolume', 'participant-id', 0.8);
```

**muteEveryone** - Mutes all participants (moderator only)
```typescript
api.executeCommand('muteEveryone', 'audio'); // or 'video'
```

**kickParticipant** - Kicks a participant (moderator only)
```typescript
api.executeCommand('kickParticipant', 'participant-id');
```

**grantModerator** - Grants moderator rights (moderator only)
```typescript
api.executeCommand('grantModerator', 'participant-id');
```

#### Chat

**sendChatMessage** - Sends a chat message
```typescript
api.executeCommand('sendChatMessage', 'Hello!', 'participant-id', false);
// Group chat
api.executeCommand('sendChatMessage', 'Hello everyone!', '', false);
```

**initiatePrivateChat** - Opens private chat
```typescript
api.executeCommand('initiatePrivateChat', 'participant-id');
```

**cancelPrivateChat** - Closes private chat
```typescript
api.executeCommand('cancelPrivateChat');
```

#### Moderation

**toggleModeration** - Toggles moderation (moderator only)
```typescript
api.executeCommand('toggleModeration', true, 'audio'); // or 'video'
```

**askToUnmute** - Asks participant to unmute
```typescript
api.executeCommand('askToUnmute', 'participant-id');
```

**approveVideo** - Approves participant for video
```typescript
api.executeCommand('approveVideo', 'participant-id');
```

**rejectParticipant** - Rejects participant from moderation
```typescript
api.executeCommand('rejectParticipant', 'participant-id', 'audio');
```

#### Recording

**startRecording** - Starts recording/streaming/transcription
```typescript
// File recording
api.executeCommand('startRecording', {
  mode: 'file',
  shouldShare: true
});

// RTMP streaming
api.executeCommand('startRecording', {
  mode: 'stream',
  rtmpStreamKey: 'your-stream-key',
  rtmpBroadcastID: 'broadcast-id'
});

// YouTube streaming
api.executeCommand('startRecording', {
  mode: 'stream',
  youtubeStreamKey: 'your-stream-key',
  youtubeBroadcastID: 'broadcast-id'
});

// Local recording
api.executeCommand('startRecording', {
  mode: 'local',
  onlySelf: false
});

// Transcription
api.executeCommand('startRecording', {
  mode: 'file',
  transcription: true
});

// Dropbox recording
api.executeCommand('startRecording', {
  mode: 'file',
  dropboxToken: 'oauth-token'
});
```

**stopRecording** - Stops recording
```typescript
api.executeCommand('stopRecording', 'file', false); // mode, transcription?
```

#### Breakout Rooms

**addBreakoutRoom** - Creates a breakout room (moderator only)
```typescript
api.executeCommand('addBreakoutRoom', 'Room Name');
```

**autoAssignToBreakoutRooms** - Auto-assigns participants (moderator only)
```typescript
api.executeCommand('autoAssignToBreakoutRooms');
```

**closeBreakoutRoom** - Closes a breakout room (moderator only)
```typescript
api.executeCommand('closeBreakoutRoom', 'room-id');
```

**joinBreakoutRoom** - Joins a breakout room
```typescript
api.executeCommand('joinBreakoutRoom', 'room-id');
// Join main room
api.executeCommand('joinBreakoutRoom');
```

**removeBreakoutRoom** - Removes a breakout room (moderator only)
```typescript
api.executeCommand('removeBreakoutRoom', 'room-jid');
```

**sendParticipantToRoom** - Sends participant to room (moderator only)
```typescript
api.executeCommand('sendParticipantToRoom', 'participant-id', 'room-id');
```

#### Virtual Background

**setVirtualBackground** - Sets virtual background
```typescript
api.executeCommand('setVirtualBackground', true, 'data:image/png;base64,...');
```

**setBlurredBackground** - Sets blurred background
```typescript
api.executeCommand('setBlurredBackground', 'blur'); // 'slight-blur', 'blur', 'none'
```

**toggleVirtualBackgroundDialog** - Toggles virtual background dialog
```typescript
api.executeCommand('toggleVirtualBackgroundDialog');
```

#### Follow Me

**setFollowMe** - Toggles follow me functionality (moderator only)
```typescript
api.executeCommand('setFollowMe', true, false);
```

#### Subtitles

**setSubtitles** - Sets subtitles
```typescript
api.executeCommand('setSubtitles', true, true, 'en');
```

#### Configuration

**overwriteConfig** - Overwrites config values
```typescript
api.executeCommand('overwriteConfig', {
  toolbarButtons: ['chat', 'microphone', 'camera']
});
```

**setAssumedBandwidthBps** - Sets assumed bandwidth
```typescript
api.executeCommand('setAssumedBandwidthBps', 2000000);
```

#### Participant Messages

**sendCameraFacingMode** - Requests camera facing mode change
```typescript
api.executeCommand('sendCameraFacingMode', 'participant-id', 'user');
```

**sendEndpointTextMessage** - Sends text message via data channels
```typescript
api.executeCommand('sendEndpointTextMessage', 'participant-id', 'Hello');
```

**sendTones** - Plays touch tones
```typescript
api.executeCommand('sendTones', {
  tones: '12345#',
  duration: 200,
  pause: 200
});
```

#### Lobby

**answerKnockingParticipant** - Approves/rejects knocking participant
```typescript
api.executeCommand('answerKnockingParticipant', 'participant-id', true);
```

#### Notifications

**showNotification** - Shows custom notification
```typescript
api.executeCommand('showNotification', {
  title: 'Hello',
  description: 'This is a notification',
  type: 'success',
  timeout: 'medium',
  uid: 'unique-id',
  customActions: [
    { label: 'Action 1', uuid: 'action-1' },
    { label: 'Action 2', uuid: 'action-2' }
  ]
});
```

**hideNotification** - Hides a notification
```typescript
api.executeCommand('hideNotification', 'unique-id');
```

#### Participant Names

**overwriteNames** - Overwrites participant names locally
```typescript
api.executeCommand('overwriteNames', [
  { id: 'participant-id-1', name: 'New Name 1' },
  { id: 'participant-id-2', name: 'New Name 2' }
]);
```

#### Resize

**resizeFilmStrip** - Resizes filmstrip
```typescript
api.executeCommand('resizeFilmStrip', { width: 200 });
```

**resizeLargeVideo** - Resizes large video
```typescript
api.executeCommand('resizeLargeVideo', 1280, 720);
```

#### Conference Control

**hangup** - Ends the call
```typescript
api.executeCommand('hangup');
```

**endConference** - Ends conference for everyone (moderator only)
```typescript
api.executeCommand('endConference');
```

### Command Categories

- **Participant Settings**: displayName, email
- **Room Management**: password, subject, localSubject, toggleLobby
- **Media Control**: toggleAudio, toggleVideo, setVideoQuality, setAudioOnly, etc.
- **UI Control**: toggleFilmStrip, toggleChat, toggleTileView, etc.
- **Video Sharing**: startShareVideo, stopShareVideo
- **Participant Control**: pinParticipant, muteEveryone, kickParticipant, etc.
- **Chat**: sendChatMessage, initiatePrivateChat, cancelPrivateChat
- **Moderation**: toggleModeration, askToUnmute, approveVideo, rejectParticipant
- **Recording**: startRecording, stopRecording
- **Breakout Rooms**: addBreakoutRoom, joinBreakoutRoom, etc.
- **Virtual Background**: setVirtualBackground, setBlurredBackground
- **Configuration**: overwriteConfig, setAssumedBandwidthBps
- **Notifications**: showNotification, hideNotification

## Additional Resources

- [Jitsi Meet React SDK Documentation](https://github.com/jitsi/jitsi-meet-react-sdk)
- [Jitsi Meet IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [lib-jitsi-meet API Documentation](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-ljm)
- [Jitsi Meet Developer Guide](https://github.com/jitsi/jitsi-meet)

- [Jitsi Meet React SDK Documentation](https://github.com/jitsi/jitsi-meet-react-sdk)
- [Jitsi Meet IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [lib-jitsi-meet API Documentation](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-ljm)
- [Jitsi Meet Developer Guide](https://github.com/jitsi/jitsi-meet)

