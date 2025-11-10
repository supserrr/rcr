'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService, AuthSession, User, UserRole, getDashboardRoute, getOnboardingRoute, isOnboardingComplete, ROLES } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

const PUBLIC_PATHS = ['/', '/about', '/contact', '/counselors', '/get-help'];

const isPublicPath = (path: string) => PUBLIC_PATHS.includes(path);

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
   * Uses validated environment variables from @t3-oss/env-core
   */
  const supabaseClient = useMemo(() => {
    try {
      return createClient();
    } catch (error) {
      console.warn('Failed to create Supabase client:', error);
      return null;
    }
  }, []);

  /**
   * Check authentication status from storage and verify with backend
   * Also checks Supabase session for OAuth authentication
   * Optimized with timeout to prevent infinite loading
   */
  const checkAuth = async () => {
    // Set a timeout to prevent infinite loading (3 seconds max)
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });

    const authCheckPromise = (async () => {
    try {
      // First, check Supabase session (for OAuth) - only if Supabase is configured
      if (supabaseClient) {
        try {
            // Use Promise.race to timeout Supabase call if it takes too long
            // Increased timeout to 5 seconds to allow OAuth sessions to be available
            const sessionPromise = supabaseClient.auth.getSession();
            const sessionResult = await Promise.race([
              sessionPromise,
              new Promise<{ data: { session: null }; error: null }>((resolve) => 
                setTimeout(() => resolve({ data: { session: null }, error: null }), 5000)
              )
            ]);
            
            const { data: { session }, error: sessionError } = sessionResult;
          
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
              metadata: userMetadata,
            };
            
            setUser(currentUser);
            AuthSession.setUser(currentUser);
            AuthSession.setToken(session.access_token);
            
            // Check onboarding status and redirect if needed
              // Only redirect if not already on onboarding page to prevent loops
            if (currentUser && currentUser.role !== 'guest' && currentUser.role !== 'admin') {
              const onboardingComplete = isOnboardingComplete(currentUser);
                // Check if we're already on the correct onboarding route
                const expectedOnboardingRoute = getOnboardingRoute(currentUser.role);
                const isOnCorrectOnboardingRoute = pathname === expectedOnboardingRoute;
                
              if (!onboardingComplete && !pathname.startsWith('/onboarding') && !isPublicPath(pathname)) {
                  // Not on onboarding page, redirect to appropriate onboarding
                  const onboardingRoute = getOnboardingRoute(currentUser.role);
                  router.push(onboardingRoute);
                  setIsLoading(false);
                  return;
                } else if (
                  !onboardingComplete &&
                  pathname.startsWith('/onboarding') &&
                  !isOnCorrectOnboardingRoute
                ) {
                  // On wrong onboarding route, redirect to correct one
                const onboardingRoute = getOnboardingRoute(currentUser.role);
                router.push(onboardingRoute);
                setIsLoading(false);
                return;
              }
                // If already on correct onboarding route, or public route, don't redirect
            }
            
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // Supabase not configured or error, fall through to backend auth
            if (process.env.NODE_ENV === 'development') {
          console.warn('Supabase auth check failed, using backend auth:', error);
            }
        }
      }
      
      // Fallback to backend token-based auth
      const token = AuthSession.getToken();
      const userData = AuthSession.getUser();
      
      if (token && userData) {
        try {
            // Verify token by getting current user from backend with timeout
            const currentUserPromise = AuthService.getCurrentUser();
            const timeoutPromise = new Promise<User | null>((resolve) => 
              setTimeout(() => resolve(null), 8000)
            );
            
            const currentUser = await Promise.race<User | null>([
              currentUserPromise,
              timeoutPromise
            ]);
            
          if (currentUser) {
            setUser(currentUser);
            AuthSession.setUser(currentUser);
            
            // Check onboarding status and redirect if needed
            if (currentUser.role !== 'guest' && currentUser.role !== 'admin') {
              const onboardingComplete = isOnboardingComplete(currentUser);
              const isPublicRoute = isPublicPath(pathname);
              if (!onboardingComplete && !pathname.startsWith('/onboarding') && !isPublicRoute) {
                const onboardingRoute = getOnboardingRoute(currentUser.role);
                router.push(onboardingRoute);
                return;
              }
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Token verification failed or returned no user; clearing cached credentials.');
            }
            AuthSession.clear();
            setUser(null);
          }
        } catch (error) {
            // Token is invalid or timeout, clear storage
            if (process.env.NODE_ENV === 'development') {
          console.error('Token verification failed:', error);
            }
          AuthSession.clear();
          setUser(null);
        }
      } else {
          // No token or user data - user is not authenticated
        setUser(null);
      }
    } catch (error) {
      // Catch any unexpected errors during auth check
        if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error during auth check:', error);
        }
      setUser(null);
      AuthSession.clear();
    } finally {
      setIsLoading(false);
    }
    })();

    // Race between auth check and timeout
    await Promise.race([authCheckPromise, timeoutPromise]);
    
    // If we're still loading after timeout, set loading to false
    setIsLoading(false);
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
      
      // Check onboarding status and redirect accordingly
      if (result.user.role !== 'guest' && result.user.role !== 'admin') {
        const onboardingComplete = isOnboardingComplete(result.user);
        const isPublicRoute = isPublicPath(pathname);
        if (!onboardingComplete && !isPublicRoute) {
          // Redirect to onboarding if not completed
          const onboardingRoute = getOnboardingRoute(result.user.role);
          router.push(onboardingRoute);
          return;
        }
      }
      
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
    let subscription: { unsubscribe?: () => void } | null = null;
    if (supabaseClient) {
      try {
        const result = supabaseClient.auth.onAuthStateChange((event, session) => {
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
        
        // onAuthStateChange returns an object with a data property
        // The data property contains the subscription object with unsubscribe method
        if (result && typeof result === 'object') {
          // Check if result has a data property (Supabase v2 structure)
          if ('data' in result && result.data) {
            const data = result.data as any;
            // Check if data has subscription property
            if (data && typeof data === 'object' && 'subscription' in data && data.subscription) {
              subscription = data.subscription;
            } else if (data && typeof data === 'object' && 'unsubscribe' in data) {
              // Fallback: data itself is the subscription
              subscription = data;
            }
          } else if ('unsubscribe' in result && typeof result.unsubscribe === 'function') {
            // Fallback: result itself is the subscription
            subscription = result as { unsubscribe: () => void };
          }
        }
      } catch (error) {
        // Supabase not configured, no subscription needed
        console.warn('Supabase auth state listener not available:', error);
      }
    }
    
    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          // Ignore errors during cleanup
          console.warn('Error unsubscribing from auth state changes:', error);
        }
      }
    };
  }, [pathname, supabaseClient]);

  // Handle route protection - only run after auth check is complete
  useEffect(() => {
    // Don't redirect while loading - wait for auth check to complete
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    // Auth callback and error pages are special - they handle OAuth flow
    const isAuthCallbackRoute = pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/auth-code-error');
    const isPublicRoute = isPublicPath(pathname);

    // Allow unauthenticated users to access auth pages, auth callback routes, and public routes only
    if (!isAuthenticated) {
      // Redirect unauthenticated users from all protected routes
      // Everything after signup/signin requires authentication
      if (isDashboardRoute || isOnboardingRoute) {
        router.push('/signin');
        return;
      }
      // Allow access to auth pages, auth callback routes, and public routes only
      if (!isAuthRoute && !isAuthCallbackRoute && !isPublicRoute) {
        // Any other route requires authentication
        router.push('/signin');
        return;
      }
      return;
    }

    // Authenticated users: redirect away from auth pages
    if (isAuthenticated && isAuthRoute && user) {
      // Check onboarding status first
      if (user.role !== 'guest' && user.role !== 'admin') {
        const onboardingComplete = isOnboardingComplete(user);
        const isPublicRoute = isPublicPath(pathname);
        if (!onboardingComplete && !pathname.startsWith('/onboarding') && !isPublicRoute) {
          // Redirect to onboarding if not completed
          const onboardingRoute = getOnboardingRoute(user.role);
          router.push(onboardingRoute);
          return;
        }
      }
      
      // Redirect to dashboard if onboarding is complete
      const dashboardRoute = getDashboardRoute(user.role);
      // Only redirect if we have a valid dashboard route (not '/')
      if (dashboardRoute !== '/') {
        router.push(dashboardRoute);
      }
    }
    
    // Check if user is trying to access dashboard without completing onboarding
    if (isAuthenticated && isDashboardRoute && user) {
      if (user.role !== 'guest' && user.role !== 'admin') {
        const onboardingComplete = isOnboardingComplete(user);
        const isPublicRoute = isPublicPath(pathname);
        if (!onboardingComplete && !pathname.startsWith('/onboarding') && !isPublicRoute) {
          // Redirect to onboarding if not completed
          const onboardingRoute = getOnboardingRoute(user.role);
          router.push(onboardingRoute);
          return;
        }
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
