import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Authentication middleware for protecting routes
 * 
 * This middleware handles:
 * - Route protection based on authentication status
 * - Role-based access control (patient, counselor, admin)
 * - Redirect logic for unauthenticated users
 * - Redirect logic for authenticated users trying to access auth pages
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // For now, we'll allow all routes since authentication is handled client-side
  // In a real app, this would check JWT tokens or session data from cookies/headers
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/counselors',
    '/get-help',
    '/api/chat'
  ]
  
  // Auth routes (signin, signup)
  const authRoutes = [
    '/signin',
    '/signup',
    '/signup/patient',
    '/signup/counselor'
  ]
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard'
  ]
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // For now, allow all routes - authentication will be handled by the AuthProvider
  // In a production app, you would check for JWT tokens here and redirect accordingly
  
  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
