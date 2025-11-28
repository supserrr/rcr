/**
 * Test script to verify Jitsi configuration
 * Run with: tsx scripts/test-jitsi-config.ts
 */

import { getJitsiConfig, formatRoomName, getJitsiExternalApiUrl } from '../lib/jitsi/config';

console.log('Testing Jitsi Configuration...\n');

try {
  const config = getJitsiConfig();
  
  console.log('[OK] Configuration loaded successfully!\n');
  console.log('Configuration Details:');
  console.log('   Domain:', config.domain);
  console.log('   App ID:', config.appId || 'Not set');
  console.log('   Deployment Type:', config.deploymentType);
  console.log('   Is JaaS:', config.isJaaS);
  console.log('');
  
  // Test room name formatting
  const testRoomName = 'session-test-123';
  const formattedRoom = formatRoomName(testRoomName);
  console.log('Room Name Formatting Test:');
  console.log('   Input:', testRoomName);
  console.log('   Formatted:', formattedRoom);
  console.log('');
  
  // Test external API URL
  const apiUrl = getJitsiExternalApiUrl();
  console.log('External API URL:');
  console.log('   ', apiUrl);
  console.log('');
  
  // Validation checks
  console.log('[OK] Validation Checks:');
  if (config.isJaaS && !config.appId) {
    console.log('   [WARNING] JaaS detected but App ID is missing!');
  } else if (config.isJaaS && config.appId) {
    console.log('   [OK] JaaS configuration complete');
  } else {
    console.log('   [OK] Free Jitsi configuration');
  }
  
  if (apiUrl.includes('external_api.js')) {
    console.log('   [OK] External API URL is valid');
  } else {
    console.log('   [WARNING] External API URL format may be incorrect');
  }
  
  console.log('\nConfiguration test complete!');
  
} catch (error) {
  console.error('[ERROR] Error testing configuration:');
  console.error(error);
  process.exit(1);
}

