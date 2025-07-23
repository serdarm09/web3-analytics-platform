import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // List of protected routes
  const protectedRoutes = ['/dashboard', '/portfolio', '/projects', '/analytics', '/watchlist', '/settings', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Auth routes
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Check if the user is trying to access a protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user has token and trying to access auth pages, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/portfolio/:path*',
    '/projects/:path*',
    '/analytics/:path*',
    '/watchlist/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/login', 
    '/register'
  ]
}