/**
 * Console error filtering utility
 * 
 * Suppresses known non-critical errors and warnings that don't affect functionality.
 * This provides a cleaner console experience for developers.
 */

/**
 * Patterns of errors/warnings to suppress
 */
const SUPPRESSED_PATTERNS = [
  // Gravatar 404 errors (expected when users don't have Gravatar accounts)
  /gravatar\.com.*404/i,
  /GET.*gravatar.*404/i,
  /gravatar.*not found/i,
  /gravatar.*failed/i,
  
  // Amplitude analytics errors (non-critical, analytics disabled)
  /amplitude/i,
  /Amplitude Logger/i,
  /Failed to fetch.*amplitude/i,
  /ERR_NAME_NOT_RESOLVED.*amplitude/i,
  /Event rejected due to exceeded retry count/i,
  /Status 'failed' provided for/i,
  /amplitude.*error/i,
  /amplitude.*failed/i,
  /amplitude.*rejected/i,
  
  // Jitsi permission warnings (expected during prejoin)
  /gum\.permission_denied/i,
  /Permission denied.*audio.*video/i,
  /NotAllowedError.*Permission denied/i,
  /User denied permission.*device/i,
  
  // Jitsi feature warnings (non-critical)
  /Unrecognized feature.*speaker-selection/i,
  /Unrecognized feature/i,
  
  // Network errors from third-party services (non-critical)
  /net::ERR_BLOCKED_BY_CLIENT/i,
  /net::ERR_NAME_NOT_RESOLVED/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /ERR_NAME_NOT_RESOLVED/i,
  
  // Jitsi internal warnings
  /PLAY_SOUND: no sound found/i,
  /RECORDING_OFF_SOUND/i,
  /no sound found for id/i,
];

/**
 * Check if an error message should be suppressed
 */
function shouldSuppress(message: string): boolean {
  return SUPPRESSED_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Initialize console error filtering
 * 
 * This should be called once when the app loads to filter out
 * known non-critical errors and warnings.
 */
export function initConsoleFilter(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Override console.error
  console.error = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    if (!shouldSuppress(message)) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };

  // Keep console.log as-is (don't filter it, as it's used for debugging)
  // Only filter errors and warnings

  // Suppress unhandled promise rejections for known non-critical errors
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason || '');
    if (shouldSuppress(message)) {
      event.preventDefault();
    }
  });

  // Suppress resource loading errors for Gravatar and other known non-critical resources
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const errorMessage = String(message || '');
    if (shouldSuppress(errorMessage) || (source && shouldSuppress(source))) {
      return true; // Suppress the error
    }
    // Call original handler if it exists
    if (originalErrorHandler) {
      return originalErrorHandler.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // Suppress image loading errors for Gravatar
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as HTMLElement).tagName === 'IMG') {
      const img = event.target as HTMLImageElement;
      if (img.src && shouldSuppress(img.src)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  }, true);
}

