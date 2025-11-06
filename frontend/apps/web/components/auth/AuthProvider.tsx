'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService, AuthSession, User, UserRole, getDashboardRoute, ROLES } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

/**
 * Authentication context interface with complete API
 */
interface AuthContextType {
  // State
  session: { user: User | null };
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => void;
  checkRole: (requiredRole: keyof typeof ROLES) => boolean;
  redirectToDashboard: () => void;
  redirectToSignIn: () => void;
  
  // Role checks
  isPatient: boolean;
  isCounselor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Main authentication provider component
 * 
 * Provides authentication state and methods to all child components.
 * Handles automatic route protection and redirects.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const userRole = user?.role || 'guest';

  /**
   * Create a single Supabase client instance to avoid multiple GoTrueClient instances
   * Only create if Supabase is configured
   */
  const supabaseClient = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      try {
        return createClient();
      } catch (error) {
        console.warn('Failed to create Supabase client:', error);
        return null;
      }
    }
    
    return null;
  }, []);

  /**
   * Check authentication status from storage and verify with backend
   * Also checks Supabase session for OAuth authentication
   */
  const checkAuth = async () => {
    try {
      // First, check Supabase session (for OAuth) - only if Supabase is configured
      if (supabaseClient) {
        try {
          const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
          
          if (session && !sessionError) {
            // User is authenticated via Supabase (OAuth)
            // Convert Supabase user to our User type
            const supabaseUser = session.user;
            const userMetadata = supabaseUser.user_metadata || {};
            
            const currentUser: User = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              name: userMetadata.full_name || userMetadata.name || supabaseUser.email || '',
              role: (userMetadata.role as UserRole) || 'guest',
              avatar: userMetadata.avatar_url || supabaseUser.user_metadata?.avatar_url,
              isVerified: supabaseUser.email_confirmed_at !== null,
              createdAt: new Date(supabaseUser.created_at),
              updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
            };
            
            setUser(currentUser);
            AuthSession.setUser(currentUser);
            AuthSession.setToken(session.access_token);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // Supabase not configured or error, fall through to backend auth
          console.warn('Supabase auth check failed, using backend auth:', error);
        }
      }
      
      // Fallback to backend token-based auth
      const token = AuthSession.getToken();
      const userData = AuthSession.getUser();
      
      if (token && userData) {
        try {
          // Verify token by getting current user from backend
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          AuthSession.setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear storage
          console.error('Token verification failed:', error);
          AuthSession.clear();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // Catch any unexpected errors during auth check
      console.error('Unexpected error during auth check:', error);
      setUser(null);
      AuthSession.clear();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has required role
   */
  const checkRole = (requiredRole: keyof typeof ROLES): boolean => {
    if (!userRole) return false;
    return userRole === ROLES[requiredRole];
  };

  /**
   * Redirect to appropriate dashboard based on role
   */
  const redirectToDashboard = () => {
    if (userRole && userRole !== 'guest') {
      const dashboardRoute = getDashboardRoute(userRole);
      router.push(dashboardRoute);
    }
  };

  /**
   * Redirect to sign in page
   */
  const redirectToSignIn = () => {
    router.push('/signin');
  };

  /**
   * Sign in user with credentials
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signIn({ email, password, rememberMe: false });
      
      // Store auth data
      AuthSession.setToken(result.token);
      AuthSession.setUser(result.user);
      
      setUser(result.user);
      
      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute(result.user.role);
      router.push(dashboardRoute);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Sign out from Supabase (for OAuth) - only if configured
      if (supabaseClient) {
        try {
          await supabaseClient.auth.signOut();
        } catch (error) {
          // Supabase not configured, continue with backend signout
          console.warn('Supabase signout failed, continuing with backend signout:', error);
        }
      }
      
      // Sign out from backend (for token-based auth)
      await AuthService.signOut();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount and when pathname changes
  useEffect(() => {
    let isMounted = true;
    
    const runCheckAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Error checking auth:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    
    runCheckAuth();
    
    // Listen for Supabase auth state changes (for OAuth) - only if configured
    let subscription: { unsubscribe: () => void } | null = null;
    if (supabaseClient) {
      try {
        const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // User signed in via OAuth, refresh auth state
            runCheckAuth();
          } else if (event === 'SIGNED_OUT') {
            // User signed out, clear state
            if (isMounted) {
              setUser(null);
              AuthSession.clear();
            }
          }
        });
        subscription = data;
      } catch (error) {
        // Supabase not configured, no subscription needed
        console.warn('Supabase auth state listener not available:', error);
      }
    }
    
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [pathname, supabaseClient]);

  // Handle route protection - only run after auth check is complete
  useEffect(() => {
    // Don't redirect while loading - wait for auth check to complete
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isPublicRoute = ['/', '/about', '/contact', '/counselors', '/get-help', '/onboarding'].includes(pathname) || pathname.startsWith('/onboarding');

    // Allow unauthenticated users to access auth pages and public routes
    if (!isAuthenticated) {
      // Only redirect unauthenticated users from protected routes (dashboard)
      if (isDashboardRoute) {
        router.push('/signin');
      }
      // Allow access to auth pages and public routes - no redirect needed
      return;
    }

    // Authenticated users: redirect away from auth pages
    if (isAuthenticated && isAuthRoute && user) {
      const dashboardRoute = getDashboardRoute(user.role);
      // Only redirect if we have a valid dashboard route (not '/')
      if (dashboardRoute !== '/') {
        router.push(dashboardRoute);
      }
    }
  }, [isAuthenticated, isLoading, pathname, user, router]);

  const value: AuthContextType = {
    session: { user },
    user,
    userRole,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    checkAuth,
    checkRole,
    redirectToDashboard,
    redirectToSignIn,
    isPatient: checkRole('PATIENT'),
    isCounselor: checkRole('COUNSELOR'),
    isAdmin: checkRole('ADMIN'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
