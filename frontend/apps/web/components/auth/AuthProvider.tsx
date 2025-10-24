'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService, AuthSession, User, UserRole, getDashboardRoute } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  const checkAuth = () => {
    const token = AuthSession.getToken();
    const userData = AuthSession.getUser();
    
    if (token && userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

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

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    const isPublicRoute = ['/', '/about', '/contact', '/counselors', '/get-help', '/dashboard-demo'].includes(pathname);

    if (!isAuthenticated) {
      // Redirect unauthenticated users from protected routes
      if (isDashboardRoute) {
        router.push('/signin');
      }
    } else {
      // Redirect authenticated users away from auth pages
      if (isAuthRoute) {
        const dashboardRoute = getDashboardRoute(user.role);
        router.push(dashboardRoute);
      }
    }
  }, [isAuthenticated, isLoading, pathname, user, router]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
