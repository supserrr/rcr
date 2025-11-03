/**
 * Jitsi Meet types
 * 
 * Types for Jitsi Meet integration with React SDK and lib-jitsi-meet API
 */

/**
 * Jitsi Meet configuration for React SDK
 */
export interface JitsiMeetingConfig {
  domain?: string;
  appId?: string;
  roomName: string;
  jwt?: string;
  useStaging?: boolean;
  configOverwrite?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    disableModeratorIndicator?: boolean;
    startScreenSharing?: boolean;
    enableEmailInStats?: boolean;
    backgroundAlpha?: number;
    disableLocalVideoFlip?: boolean;
    [key: string]: unknown;
  };
  interfaceConfigOverwrite?: {
    DISABLE_JOIN_LEAVE_NOTIFICATIONS?: boolean;
    VIDEO_LAYOUT_FIT?: string;
    MOBILE_APP_PROMO?: boolean;
    TILE_VIEW_MAX_COLUMNS?: number;
    [key: string]: unknown;
  };
  userInfo?: {
    displayName?: string;
    email?: string;
    [key: string]: unknown;
  };
}

/**
 * JaaS Meeting configuration for React SDK
 */
export interface JaaSMeetingConfig {
  appId: string;
  roomName: string;
  jwt?: string;
  useStaging?: boolean;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: Record<string, unknown>;
}

/**
 * lib-jitsi-meet connection options
 */
export interface JitsiConnectionOptions {
  hosts?: {
    domain?: string;
    muc?: string;
    focus?: string;
  };
  bosh?: string;
  websocket?: string;
  clientNode?: string;
  serviceUrl?: string;
  enableRemb?: boolean;
  enableTcc?: boolean;
  useStunTurn?: boolean;
  enableIceRestart?: boolean;
  enableLayerSuspension?: boolean;
  enableOpusRed?: boolean;
  enableWebSocketFallback?: boolean;
  [key: string]: unknown;
}

/**
 * lib-jitsi-meet conference options
 */
export interface JitsiConferenceOptions {
  openBridgeChannel?: boolean | string;
  channelLastN?: number;
  startAudioMuted?: boolean;
  startVideoMuted?: boolean;
  startAudioOnly?: boolean;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  enableLayerSuspension?: boolean;
  enableNoAudioDetection?: boolean;
  enableNoisyMicDetection?: boolean;
  enableTalkWhileMuted?: boolean;
  enableClosePage?: boolean;
  p2p?: {
    enabled?: boolean;
    stunServers?: Array<{ urls: string }>;
    backToP2PDelay?: number;
    disabledCodec?: string;
    preferredCodec?: string;
  };
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * lib-jitsi-meet local tracks options
 */
export interface JitsiLocalTracksOptions {
  devices?: string[];
  resolution?: number;
  cameraDeviceId?: string;
  microphoneDeviceId?: string;
  facingMode?: string;
  constraints?: {
    video?: boolean | {
      width?: number;
      height?: number;
      frameRate?: number;
      facingMode?: string;
    };
    audio?: boolean | {
      deviceId?: string;
    };
  };
  [key: string]: unknown;
}

/**
 * lib-jitsi-meet API configuration
 */
export interface LibJitsiMeetConfig {
  connectionOptions: JitsiConnectionOptions;
  conferenceOptions: JitsiConferenceOptions;
  localTracksOptions?: JitsiLocalTracksOptions;
  roomName: string;
  jwt?: string;
  userInfo?: {
    displayName?: string;
    email?: string;
    avatar?: string;
    [key: string]: unknown;
  };
}

/**
 * Jitsi room details with support for multiple API types
 */
export interface JitsiRoomDetails {
  roomName: string;
  roomUrl: string;
  meetingId: string;
  config: JitsiMeetingConfig | JaaSMeetingConfig | LibJitsiMeetConfig;
  isJaaS: boolean;
  apiType: 'react-sdk' | 'iframe' | 'lib-jitsi-meet';
}
