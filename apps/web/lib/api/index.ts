/**
 * API services index
 * 
 * Central export point for all API services
 */

export * from './client';
export * from './auth';
export * from './sessions';
export * from './resources';
export * from './chat';
export * from './notifications';
export * from './admin';

// Default exports for convenience
export { default as api } from './client';
export { AuthApi } from './auth';
export { SessionsApi } from './sessions';
export { ResourcesApi } from './resources';
export { ChatApi } from './chat';
export { NotificationsApi } from './notifications';
export { AdminApi } from './admin';

