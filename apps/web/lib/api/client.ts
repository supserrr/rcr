/**
 * API client for backend communication
 * 
 * Provides a centralized HTTP client with authentication,
 * error handling, and request/response interceptors
 */

import { env } from '@/src/env';

// Backend API base URL
// Note: This application uses Supabase for all backend operations.
// The API client is only used if a separate backend API is configured.
// If NEXT_PUBLIC_API_URL is not set, all API operations should use Supabase directly.
const API_BASE_URL = env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? null // In production, if no API_URL is set, use Supabase instead
    : 'http://localhost:10000'); // Development fallback

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('auth-token');
}

/**
 * Set authentication token in storage
 */
function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }
}

/**
 * Clear authentication token from storage
 */
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
  }
}

/**
 * Make an API request
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Check if API_BASE_URL is configured
  if (!API_BASE_URL) {
    throw new ApiError(
      'Backend API is not configured. This application uses Supabase for all backend operations. ' +
      'Please use Supabase client methods instead of API client methods.',
      0
    );
  }

  // Add /api prefix if not already present (except for health check)
  const normalizedEndpoint = endpoint.startsWith('/api/') || endpoint === '/health' 
    ? endpoint 
    : `/api${endpoint}`;
  
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include credentials for CORS
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      throw new ApiError('Authentication required', 401);
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.statusText}`,
          response.status
        );
      }
      return response.text() as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // Extract error message from various possible response formats
      let errorMessage = `Request failed: ${response.statusText}`;
      
      if (data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : data.error.message || errorMessage;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.data?.error) {
        errorMessage = typeof data.data.error === 'string' ? data.data.error : data.data.error.message || errorMessage;
      } else if (data.data?.message) {
        errorMessage = data.data.message;
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        data
      );
    }

    // Handle wrapped responses
    if (data.success !== undefined && data.data !== undefined) {
      return data.data as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle fetch errors more specifically
    // "Failed to fetch" typically means:
    // 1. Backend server is not running
    // 2. CORS issue
    // 3. Network connectivity issue
    // 4. Browser security policy blocking the request
    if (error instanceof TypeError) {
      const isFetchError = error.message.includes('Failed to fetch') || error.message.includes('fetch');
      
      if (isFetchError) {
        // Log detailed error information for debugging
        console.error('Fetch error details:', {
          url,
          method: options.method || 'GET',
          error: error.message,
          stack: error.stack,
        });
        
        // Provide production-aware error message
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction
          ? `Unable to connect to backend server. This application uses Supabase for all backend operations. ` +
            `If you need a separate backend API, please set NEXT_PUBLIC_API_URL in your Vercel environment variables. ` +
            `Otherwise, use Supabase client methods directly.`
          : `Unable to connect to backend server at ${API_BASE_URL}. ` +
            `This application uses Supabase for all backend operations. ` +
            `If you need a separate backend API, ensure it's running and NEXT_PUBLIC_API_URL is configured. ` +
            `Otherwise, use Supabase client methods directly.`;
        
        throw new ApiError(errorMessage, 0);
      }
      
      throw new ApiError(error.message, 0);
    }

    if (error instanceof Error) {
      throw new ApiError(error.message, 0);
    }

    throw new ApiError('Network error', 0);
  }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, {
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = data instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Add /api prefix if not already present (except for health check)
  const normalizedEndpoint = endpoint.startsWith('/api/') || endpoint === '/health' 
    ? endpoint 
    : `/api${endpoint}`;
  
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? data as FormData : (data ? JSON.stringify(data) : undefined),
      credentials: 'include',
      ...options,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      throw new ApiError('Authentication required', 401);
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.statusText}`,
          response.status
        );
      }
      return response.text() as unknown as T;
    }

    const responseData = await response.json();

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.statusText}`;
      
      if (responseData.error) {
        errorMessage = typeof responseData.error === 'string' ? responseData.error : responseData.error.message || errorMessage;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.data?.error) {
        errorMessage = typeof responseData.data.error === 'string' ? responseData.data.error : responseData.data.error.message || errorMessage;
      } else if (responseData.data?.message) {
        errorMessage = responseData.data.message;
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        responseData
      );
    }

    // Handle wrapped responses
    if (responseData.success !== undefined && responseData.data !== undefined) {
      return responseData.data as T;
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      const isFetchError = error.message.includes('Failed to fetch') || error.message.includes('fetch');
      
      if (isFetchError) {
        console.error('Fetch error details:', {
          url,
    method: 'POST',
          error: error.message,
          stack: error.stack,
        });
        
        // Provide production-aware error message
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction
          ? `Unable to connect to backend server. This application uses Supabase for all backend operations. ` +
            `If you need a separate backend API, please set NEXT_PUBLIC_API_URL in your Vercel environment variables. ` +
            `Otherwise, use Supabase client methods directly.`
          : `Unable to connect to backend server at ${API_BASE_URL}. ` +
            `This application uses Supabase for all backend operations. ` +
            `If you need a separate backend API, ensure it's running and NEXT_PUBLIC_API_URL is configured. ` +
            `Otherwise, use Supabase client methods directly.`;
        
        throw new ApiError(errorMessage, 0);
      }
      
      throw new ApiError(error.message, 0);
    }

    if (error instanceof Error) {
      throw new ApiError(error.message, 0);
    }

    throw new ApiError('Network error', 0);
  }
}

/**
 * PATCH request
 */
export async function patch<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, {
    method: 'DELETE',
  });
}

/**
 * Upload file
 */
export async function upload<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, unknown>
): Promise<T> {
  const token = getAuthToken();
  const formData = new FormData();
  
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.error || error.message || `Upload failed: ${response.statusText}`,
      response.status,
      error
    );
  }

  const data = await response.json();
  return (data.data || data) as T;
}

/**
 * Export token management functions
 */
export const api = {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  get,
  post,
  patch,
  put,
  delete: del,
  upload,
};

export default api;

