/**
 * Simple logging utility
 * 
 * Provides structured logging with different log levels
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

/**
 * Format log entry
 */
function formatLog(level: LogLevel, message: string, data?: unknown): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (data !== undefined) {
    entry.data = data;
  }

  return entry;
}

/**
 * Log info message
 */
export function logInfo(message: string, data?: unknown): void {
  const entry = formatLog(LogLevel.INFO, message, data);
  console.log(JSON.stringify(entry));
}

/**
 * Log warning message
 */
export function logWarn(message: string, data?: unknown): void {
  const entry = formatLog(LogLevel.WARN, message, data);
  console.warn(JSON.stringify(entry));
}

/**
 * Log error message
 */
export function logError(message: string, error?: unknown): void {
  const entry = formatLog(LogLevel.ERROR, message, error);
  console.error(JSON.stringify(entry));
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    const entry = formatLog(LogLevel.DEBUG, message, data);
    console.debug(JSON.stringify(entry));
  }
}

