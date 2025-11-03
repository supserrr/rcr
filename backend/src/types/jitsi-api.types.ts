/**
 * Jitsi Meet API Type Definitions
 * 
 * Type definitions for Jitsi Meet External API functions
 * Used with React SDK onApiReady callback and IFrame API
 */

/**
 * Jitsi Meet External API interface
 * 
 * This interface defines all available methods on the Jitsi Meet API
 */
export interface JitsiMeetExternalAPI {
  // Device Management
  getAvailableDevices(): Promise<{
    audioInput: MediaDeviceInfo[];
    audioOutput: MediaDeviceInfo[];
    videoInput: MediaDeviceInfo[];
  }>;
  getCurrentDevices(): Promise<{
    audioInput?: MediaDeviceInfo;
    audioOutput?: MediaDeviceInfo;
    videoInput?: MediaDeviceInfo;
  }>;
  setAudioInputDevice(deviceLabel: string, deviceId?: string): void;
  setAudioOutputDevice(deviceLabel: string, deviceId?: string): void;
  setVideoInputDevice(deviceLabel: string, deviceId?: string): void;
  isDeviceChangeAvailable(deviceType?: 'input' | 'output'): Promise<boolean>;
  isDeviceListAvailable(): Promise<boolean>;
  isMultipleAudioInputSupported(): Promise<boolean>;

  // Media Control
  isAudioMuted(): Promise<boolean>;
  isVideoMuted(): Promise<boolean>;
  isAudioAvailable(): Promise<boolean>;
  isVideoAvailable(): Promise<boolean>;
  isAudioDisabled(): Promise<boolean>;

  // Participant Management
  getRoomsInfo(): Promise<{
    rooms: Array<{
      isMainRoom: boolean;
      id: string;
      jid: string;
      participants: Array<{
        id: string;
        jid: string;
        role: string;
        displayName: string;
        avatarUrl?: string;
      }>;
    }>;
  }>;
  getNumberOfParticipants(): number;
  getDisplayName(participantId: string): string;
  getEmail(participantId: string): string;
  pinParticipant(participantId: string, videoType?: 'camera' | 'desktop'): void;
  setLargeVideoParticipant(participantId?: string): void;

  // Conference Information
  getSessionId(): Promise<string>;
  getVideoQuality(): number;
  getDeploymentInfo(): Promise<{
    region?: string;
    shard?: string;
    [key: string]: unknown;
  }>;
  getLivestreamUrl(): Promise<{
    livestreamUrl: string;
  }>;
  getSharedDocumentUrl(): Promise<string>;

  // Screenshots
  captureLargeVideoScreenshot(): Promise<{
    dataURL: string;
  }>;
  captureCameraPicture(
    cameraFacingMode?: 'environment' | 'user',
    descriptionText?: string,
    titleText?: string
  ): Promise<{
    dataURL?: string;
    error?: string;
  }>;

  // Content Sharing
  getContentSharingParticipants(): Promise<{
    sharingParticipantIds: string[];
  }>;

  // Virtual Background
  setVirtualBackground(enabled: boolean, backgroundImage?: string): void;

  // UI Control
  resizeLargeVideo(width: number, height: number): void;
  isParticipantsPaneOpen(): Promise<boolean>;

  // Recording
  startRecording(options: {
    mode: 'file' | 'stream';
    [key: string]: unknown;
  }): void;
  stopRecording(mode: 'file' | 'stream', transcription?: boolean): void;

  // Invitations
  invite(invitees: Array<{
    type: 'phone';
    number: string;
  } | {
    type: 'sip';
    address: string;
  }>): Promise<void>;

  // Moderation
  isModerationOn(mediaType?: 'audio' | 'video'): Promise<boolean>;
  isParticipantForceMuted(
    participantId: string,
    mediaType?: 'audio' | 'video'
  ): Promise<boolean>;

  // Other Functions
  isVisitor(): boolean;
  isP2pActive(): Promise<boolean | null>;
  isStartSilent(): Promise<boolean>;
  listBreakoutRooms(): Promise<Record<string, unknown>>;
  getSupportedCommands(): string[];
  getSupportedEvents(): string[];
  getIFrame(): unknown; // HTMLIFrameElement (DOM type, use in frontend)
  dispose(): void;

  // Commands
  executeCommand(command: string, ...args: unknown[]): void;
  executeCommands(commands: Record<string, unknown[]>): void;

  // Event Listeners
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  addEventListener(event: string, listener: (...args: unknown[]) => void): void;
  removeEventListener(event: string, listener: (...args: unknown[]) => void): void;
}

/**
 * Jitsi Meet Commands
 * 
 * Available commands for executeCommand
 */
export interface JitsiMeetCommands {
  // Participant Settings
  displayName: (name: string) => void;
  email: (email: string) => void;

  // Room Management
  password: (password: string) => void;
  subject: (subject: string) => void;
  localSubject: (subject: string) => void;
  toggleLobby: (enabled: boolean) => void;

  // Media Control
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleCamera: (facingMode?: 'user' | 'environment') => void;
  toggleCameraMirror: () => void;
  setVideoQuality: (height: number) => void;
  setAudioOnly: (enable: boolean) => void;

  // UI Control
  toggleFilmStrip: () => void;
  toggleChat: () => void;
  toggleRaiseHand: () => void;
  toggleShareScreen: () => void;
  toggleSubtitles: () => void;
  toggleTileView: () => void;
  toggleWhiteboard: () => void;
  toggleParticipantsPane: (enabled: boolean) => void;
  setTileView: (enabled: boolean) => void;

  // Video Sharing
  startShareVideo: (url: string) => void;
  stopShareVideo: () => void;

  // Participant Control
  pinParticipant: (id?: string) => void;
  setLargeVideoParticipant: (participantId?: string, videoType?: 'camera' | 'desktop') => void;
  setParticipantVolume: (participantID: string, volume: number) => void;
  muteEveryone: (mediaType?: 'audio' | 'video') => void;
  kickParticipant: (participantID: string) => void;
  grantModerator: (participantID: string) => void;

  // Chat
  sendChatMessage: (message: string, to?: string, ignorePrivacy?: boolean) => void;
  initiatePrivateChat: (participantID: string) => void;
  cancelPrivateChat: () => void;

  // Moderation
  toggleModeration: (enable: boolean, mediaType?: 'audio' | 'video') => void;
  askToUnmute: (participantId: string) => void;
  approveVideo: (participantId: string) => void;
  rejectParticipant: (participantId: string, mediaType?: 'audio' | 'video') => void;

  // Recording
  startRecording: (options: {
    mode: 'local' | 'file' | 'stream';
    dropboxToken?: string;
    onlySelf?: boolean;
    shouldShare?: boolean;
    rtmpStreamKey?: string;
    rtmpBroadcastID?: string;
    youtubeStreamKey?: string;
    youtubeBroadcastID?: string;
    extraMetadata?: Record<string, unknown>;
    transcription?: boolean;
  }) => void;
  stopRecording: (mode: 'local' | 'file' | 'stream', transcription?: boolean) => void;

  // Breakout Rooms
  addBreakoutRoom: (name?: string) => void;
  autoAssignToBreakoutRooms: () => void;
  closeBreakoutRoom: (roomId: string) => void;
  joinBreakoutRoom: (roomId?: string) => void;
  removeBreakoutRoom: (breakoutRoomJid: string) => void;
  sendParticipantToRoom: (participantId: string, roomId: string) => void;

  // Virtual Background
  setVirtualBackground: (enabled: boolean, backgroundImage: string) => void;
  setBlurredBackground: (blurType: 'slight-blur' | 'blur' | 'none') => void;
  toggleVirtualBackgroundDialog: () => void;

  // Noise Suppression
  setNoiseSuppressionEnabled: (enabled: boolean) => void;

  // Follow Me
  setFollowMe: (value: boolean, recorderOnly?: boolean) => void;

  // Subtitles
  setSubtitles: (enabled: boolean, displaySubtitles?: boolean, language?: string | null) => void;

  // Configuration
  overwriteConfig: (config: Record<string, unknown>) => void;
  setAssumedBandwidthBps: (assumedBandwidthBps: number) => void;

  // Participant Messages
  sendCameraFacingMode: (receiverParticipantId: string, facingMode?: 'user' | 'environment') => void;
  sendEndpointTextMessage: (receiverParticipantId: string, text: string) => void;
  sendTones: (options: {
    tones: string;
    duration?: number;
    pause?: number;
  }) => void;

  // Lobby
  answerKnockingParticipant: (id: string, approved: boolean) => void;

  // Notifications
  showNotification: (options: {
    title: string;
    description: string;
    customActions?: Array<{ label: string; uuid: string }>;
    uid?: string;
    type?: 'normal' | 'success' | 'warning' | 'error';
    timeout?: 'short' | 'medium' | 'long' | 'sticky';
  }) => void;
  hideNotification: (uid: string) => void;

  // Participant Names
  overwriteNames: (participants: Array<{ id: string; name: string }>) => void;

  // Resize
  resizeFilmStrip: (options: { width: number }) => void;
  resizeLargeVideo: (width: number, height: number) => void;

  // Conference Control
  hangup: () => void;
  endConference: () => void;
}

/**
 * Media Device Info
 */
export interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
}

/**
 * Participant Information
 */
export interface ParticipantInfo {
  id: string;
  jid: string;
  role: 'participant' | 'moderator';
  displayName: string;
  avatarUrl?: string;
}

/**
 * Room Information
 */
export interface RoomInfo {
  isMainRoom: boolean;
  id: string;
  jid: string;
  participants: ParticipantInfo[];
}

