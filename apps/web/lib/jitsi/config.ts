/**
 * Jitsi Meet configuration utility
 * 
 * Provides configuration for Jitsi Meet integration, supporting both
 * free Jitsi (meet.jit.si) and Jitsi as a Service (JaaS) via 8x8.vc.
 */

import { env } from '../../src/env';

/**
 * Jitsi deployment type
 */
export type JitsiDeploymentType = 'free' | 'jaas' | 'self-hosted';

/**
 * Jitsi configuration
 */
export interface JitsiConfig {
  /** Jitsi domain (e.g., 'meet.jit.si', '8x8.vc', or custom domain) */
  domain: string;
  /** JaaS app ID (required for JaaS deployments) */
  appId?: string;
  /** Deployment type */
  deploymentType: JitsiDeploymentType;
  /** Whether this is a JaaS deployment */
  isJaaS: boolean;
}

/**
 * Get Jitsi configuration from environment variables
 * 
 * Supports:
 * - Free Jitsi: Uses meet.jit.si (default)
 * - JaaS: Uses 8x8.vc with app ID
 * - Self-hosted: Uses custom domain
 * 
 * @returns Jitsi configuration
 */
export function getJitsiConfig(): JitsiConfig {
  const domain = env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
  const appId = env.NEXT_PUBLIC_JITSI_APP_ID;

  // Determine deployment type
  let deploymentType: JitsiDeploymentType = 'free';
  let isJaaS = false;

  if (domain === '8x8.vc' || domain.includes('8x8.vc')) {
    deploymentType = 'jaas';
    isJaaS = true;
  } else if (domain !== 'meet.jit.si' && !domain.includes('jit.si')) {
    deploymentType = 'self-hosted';
  }

  // JaaS requires app ID
  if (isJaaS && !appId) {
    console.warn(
      'Jitsi JaaS deployment detected but NEXT_PUBLIC_JITSI_APP_ID is not set. ' +
      'Some features may not work correctly.'
    );
  }

  return {
    domain,
    appId,
    deploymentType,
    isJaaS,
  };
}

/**
 * Generate room name for Jitsi meeting
 * 
 * For JaaS deployments, the room name should be in format: <AppID>/<room>
 * where AppID is the full vpaas-magic-cookie-{appId} format.
 * For free/self-hosted, use the room name as-is.
 * 
 * @param roomName - Base room name
 * @returns Formatted room name for the deployment type
 */
export function formatRoomName(roomName: string): string {
  const config = getJitsiConfig();
  
  if (config.isJaaS && config.appId) {
    // JaaS format: vpaas-magic-cookie-{appId}/{roomName}
    // The AppID must include the "vpaas-magic-cookie-" prefix
    const fullAppId = config.appId.startsWith('vpaas-magic-cookie-')
      ? config.appId
      : `vpaas-magic-cookie-${config.appId}`;
    return `${fullAppId}/${roomName}`;
  }
  
  return roomName;
}

/**
 * Get Jitsi Meet external API script URL
 * 
 * For JaaS deployments, the script URL includes the app ID:
 * https://8x8.vc/vpaas-magic-cookie-{appId}/external_api.js
 * 
 * For free/self-hosted, use the standard external API URL.
 * 
 * @returns URL to the external API script
 */
export function getJitsiExternalApiUrl(): string {
  const config = getJitsiConfig();
  
  if (config.isJaaS && config.appId) {
    // JaaS uses app-ID-specific script URLs
    // Format: https://8x8.vc/vpaas-magic-cookie-{appId}/external_api.js
    const fullAppId = config.appId.startsWith('vpaas-magic-cookie-')
      ? config.appId
      : `vpaas-magic-cookie-${config.appId}`;
    return `https://${config.domain}/${fullAppId}/external_api.js`;
  }
  
  // Free or self-hosted external API URL
  return `https://${config.domain}/external_api.js`;
}

