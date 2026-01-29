import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ['/admin']
  const publicRoutes = ['/login', '/register', '/', '/api/auth/login', '/api/auth/logout']
  
  const { pathname } = request.nextUrl
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('userSession')
    
    // If no session cookie, redirect to login
    if (!sessionCookie || !sessionCookie.value) {
      console.log('No session cookie found, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Try to parse session and check expiry
    try {
      const sessionData = JSON.parse(sessionCookie.value)
      const now = Date.now()
      
      // Check if session is expired
      if (sessionData.sessionExpiry && now > sessionData.sessionExpiry) {
        console.log('Session expired, redirecting to login')
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        loginUrl.searchParams.set('expired', 'true')
        
        // Clear the expired cookie
        const response = NextResponse.redirect(loginUrl)
        response.cookies.set('userSession', '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        return response
      }
    } catch (error) {
      console.log('Invalid session cookie, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // If user is logged in and tries to access login page, redirect to dashboard
  if (pathname === '/login') {
    const sessionCookie = request.cookies.get('userSession')
    if (sessionCookie && sessionCookie.value) {
      try {
        const sessionData = JSON.parse(sessionCookie.value)
        const now = Date.now()
        
        // Only redirect if session is still valid
        if (sessionData.sessionExpiry && now <= sessionData.sessionExpiry) {
          return NextResponse.redirect(new URL('/admin/bookings', request.url))
        }
      } catch (error) {
        // Invalid session, allow access to login page
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match login page
    '/login',
    // Exclude static files and API routes except auth
    '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
}
