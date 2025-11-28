/**
 * Authentication utilities and types
 * 
 * This module provides:
 * - User type definitions
 * - Authentication state management
 * - Role-based access control utilities
 * - Session management helpers
 */

import { AuthApi } from './api/auth';
import type {
  VisibilitySettings,
  CounselorApprovalStatus,
  CounselorProfileRecord,
  CounselorDocument,
} from './types';

export type UserRole = 'patient' | 'counselor' | 'admin' | 'guest'

export interface User {
  id: string
  email: string
  name: string
  title?: string
  role: UserRole
  avatar?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  metadata?: Record<string, unknown>
  phoneNumber?: string
  preferredLanguage?: string
  treatmentStage?: string
  contactPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  notificationPreferences?: Record<string, unknown>
  securityPreferences?: Record<string, unknown>
  supportPreferences?: Record<string, unknown>
  visibilitySettings?: VisibilitySettings
  approvalStatus?: CounselorApprovalStatus
  approvalSubmittedAt?: string | null
  approvalReviewedAt?: string | null
  approvalNotes?: string | null
  counselorProfile?: CounselorProfileRecord | null
  documents?: CounselorDocument[]
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
 * Get the appropriate onboarding route for a user role
 */
export function getOnboardingRoute(userRole: UserRole): string {
  switch (userRole) {
    case ROLES.PATIENT:
      return '/onboarding/patient'
    case ROLES.COUNSELOR:
      return '/onboarding/counselor'
    default:
      return '/onboarding/patient'
  }
}

/**
 * Check if user has completed onboarding
 * 
 * For counselors: Checks if they have completed onboarding (submitted form) or are approved/active
 * For patients: Checks if they have essential profile data (treatment stage, contact info, etc.)
 */
export function isOnboardingComplete(user: User | null): boolean {
  if (!user) return false;
  
  // First, check the onboarding_completed flag in metadata (this is set when onboarding form is submitted)
  const metadata = (user as any).metadata || {};
  const onboardingFlag =
    metadata.onboarding_completed ??
    metadata.onboardingCompleted ??
    metadata.onboarding_complete ??
    metadata.has_completed_onboarding ??
    metadata.onboarding?.completed ??
    metadata.onboarding?.isComplete ??
    metadata.onboarding?.is_completed;

  if (typeof onboardingFlag === 'boolean' && onboardingFlag === true) {
    return true;
  }

  if (typeof onboardingFlag === 'string') {
    const normalized = onboardingFlag.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'completed') {
      return true;
    }
  }

  if (typeof onboardingFlag === 'number' && onboardingFlag === 1) {
    return true;
  }

  // Check for completion timestamp
  if (metadata.onboarding_completed_at || metadata.onboardingCompletedAt) {
    return true;
  }
  
  // For counselors: If they are approved or active, they have completed onboarding
  if (user.role === 'counselor') {
    // Check approval status from multiple sources
    const approvalStatus = 
      user.approvalStatus || 
      (user.metadata?.approvalStatus as string) || 
      (user.metadata?.approval_status as string);
    
    if (approvalStatus === 'approved' || approvalStatus === 'active') {
      return true;
    }
    
    // Also check if they have a counselor profile (indicates they've completed onboarding)
    if (user.counselorProfile) {
      return true;
    }
    
    // Check if approval was reviewed (even if status is pending, if reviewed, they've completed onboarding)
    if (user.approvalReviewedAt || user.metadata?.approvalReviewedAt || user.metadata?.approval_reviewed_at) {
      // If they have a reviewed timestamp, they've gone through the approval process
      // Only consider it complete if status is not 'rejected'
      if (approvalStatus !== 'rejected') {
        return true;
      }
    }
  }
  
  // For patients: Check if they have essential profile data indicating onboarding completion
  if (user.role === 'patient') {
    // Check if patient has essential onboarding data filled out
    // These fields are typically required during patient onboarding
    const hasTreatmentInfo = 
      user.treatmentStage || 
      metadata.treatmentStage || 
      metadata.treatment_stage ||
      metadata.diagnosis ||
      metadata.cancerType ||
      metadata.cancer_type;
    
    const hasContactInfo = 
      user.contactPhone || 
      user.phoneNumber ||
      metadata.contactPhone || 
      metadata.contact_phone ||
      metadata.phoneNumber ||
      metadata.phone_number;
    
    const hasEmergencyContact = 
      user.emergencyContactName ||
      user.emergencyContactPhone ||
      metadata.emergencyContactName ||
      metadata.emergency_contact_name ||
      metadata.emergencyContactPhone ||
      metadata.emergency_contact_phone;
    
    const hasLocation = 
      metadata.location ||
      metadata.address ||
      metadata.city ||
      metadata.country;
    
    // If patient has treatment info and contact info, they've likely completed onboarding
    if (hasTreatmentInfo && hasContactInfo) {
      return true;
    }
    
    // If they have emergency contact and location, also consider it complete
    if (hasEmergencyContact && hasLocation && hasContactInfo) {
      return true;
    }
  }

  return false;
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
 * Authentication service
 * 
 * Uses real backend API for authentication
 */
export class AuthService {
  static async signIn(credentials: SignInCredentials): Promise<{ user: User; token: string }> {
    const response = await AuthApi.signIn(credentials);
    
    // Store refresh token
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh-token', response.tokens.refreshToken);
    }
    
    return {
      user: response.user,
      token: response.tokens.accessToken,
    };
  }

  static async signUp(credentials: SignUpCredentials): Promise<{ user: User; token: string }> {
    const response = await AuthApi.signUp(credentials);
    
    // Store refresh token
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh-token', response.tokens.refreshToken);
    }
    
    return {
      user: response.user,
      token: response.tokens.accessToken,
    };
  }

  static async signOut(): Promise<void> {
    await AuthApi.signOut();
    AuthSession.clear();
    
    // Clear refresh token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh-token');
    }
  }

  static async refreshToken(): Promise<string> {
    const response = await AuthApi.refreshToken();
    return response.accessToken;
  }

  /**
   * Retrieve the currently authenticated user.
   *
   * @returns The authenticated user or null when no active session exists.
   */
  static async getCurrentUser(): Promise<User | null> {
    return AuthApi.getCurrentUser();
  }

  static async updateProfile(data: {
    fullName?: string;
    professionalTitle?: string;
    phoneNumber?: string;
    avatar?: string;
    metadata?: Record<string, unknown>;
  }): Promise<User> {
    return AuthApi.updateProfile(data);
  }

  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return AuthApi.changePassword(data);
  }

  static async forgotPassword(email: string): Promise<void> {
    return AuthApi.forgotPassword(email);
  }

  static async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<void> {
    return AuthApi.resetPassword(data);
  }
}
