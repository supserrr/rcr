/**
 * Authentication utilities and types
 * 
 * This module provides:
 * - User type definitions
 * - Authentication state management
 * - Role-based access control utilities
 * - Session management helpers
 */

export type UserRole = 'patient' | 'counselor' | 'admin' | 'guest'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface SignInCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'patient' | 'counselor'
  agreeToTerms: boolean
}

/**
 * Role-based access control utilities
 */
export const ROLES = {
  PATIENT: 'patient' as const,
  COUNSELOR: 'counselor' as const,
  ADMIN: 'admin' as const,
  GUEST: 'guest' as const,
} as const

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  MANAGE_PATIENTS: 'manage:patients',
  MANAGE_COUNSELORS: 'manage:counselors',
  VIEW_ANALYTICS: 'view:analytics',
  MANAGE_SYSTEM: 'manage:system',
} as const

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  patient: [PERMISSIONS.VIEW_DASHBOARD],
  counselor: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.MANAGE_PATIENTS],
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.MANAGE_COUNSELORS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SYSTEM,
  ],
  guest: [],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Define route access rules
  const routePermissions: Record<string, string[]> = {
    '/dashboard/patient': [PERMISSIONS.VIEW_DASHBOARD],
    '/dashboard/counselor': [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.MANAGE_PATIENTS],
    '/dashboard/admin': [PERMISSIONS.MANAGE_SYSTEM],
    '/onboarding': [PERMISSIONS.VIEW_DASHBOARD],
  }

  const requiredPermissions = routePermissions[route] || []
  return requiredPermissions.every(permission => 
    hasPermission(userRole, permission)
  )
}

/**
 * Get the appropriate dashboard route for a user role
 */
export function getDashboardRoute(userRole: UserRole): string {
  switch (userRole) {
    case ROLES.PATIENT:
      return '/dashboard/patient'
    case ROLES.COUNSELOR:
      return '/dashboard/counselor'
    case ROLES.ADMIN:
      return '/dashboard/admin'
    default:
      return '/'
  }
}

/**
 * Session management utilities
 */
export class AuthSession {
  private static readonly TOKEN_KEY = 'auth-token'
  private static readonly USER_KEY = 'user-data'
  private static readonly ROLE_KEY = 'user-role'

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      localStorage.setItem(this.ROLE_KEY, user.role)
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  static getUserRole(): UserRole {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(this.ROLE_KEY) as UserRole) || ROLES.GUEST
    }
    return ROLES.GUEST
  }

  static clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
      localStorage.removeItem(this.ROLE_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

/**
 * Mock authentication service
 * In a real app, this would make API calls to your backend
 */
export class AuthService {
  static async signIn(credentials: SignInCredentials): Promise<{ user: User; token: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user data based on email
    let user: User;
    
    if (credentials.email.includes('counselor')) {
      user = {
        id: '1',
        email: credentials.email,
        name: 'Dr. Grace Mukamana',
        role: ROLES.COUNSELOR,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else if (credentials.email.includes('admin')) {
      user = {
        id: '2',
        email: credentials.email,
        name: 'Admin User',
        role: ROLES.ADMIN,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else {
      user = {
        id: '3',
        email: credentials.email,
        name: 'Jean Baptiste',
        role: ROLES.PATIENT,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    
    const token = 'mock-jwt-token-' + Date.now()
    
    return { user, token }
  }

  static async signUp(credentials: SignUpCredentials): Promise<{ user: User; token: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      role: credentials.role,
      avatar: undefined,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const token = 'mock-jwt-token-' + Date.now()
    
    return { user, token }
  }

  static async signOut(): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    AuthSession.clear()
  }

  static async refreshToken(): Promise<string> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return 'refreshed-jwt-token-' + Date.now()
  }
}
