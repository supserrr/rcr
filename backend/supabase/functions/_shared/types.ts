/**
 * Shared types for Edge Functions
 */

/**
 * User role type
 */
export type UserRole = 'patient' | 'counselor' | 'admin';

/**
 * API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create error response
 */
export function errorResponse(error: string, message?: string): ErrorResponse {
  return {
    success: false,
    error,
    ...(message && { message }),
  };
}

