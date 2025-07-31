import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname

  console.log('🔧 Middleware:', { 
    pathname, 
    hasToken: !!token, 
    tokenLength: token?.length || 0,
    cookies: {
      token: !!request.cookies.get('token')?.value,
      auth_token: !!request.cookies.get('auth_token')?.value
    }
  })

  // List of protected routes
  const protectedRoutes = ['/dashboard', '/portfolio', '/projects', '/analytics', '/watchlist', '/settings', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Auth routes
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // API routes and static files should not be redirected
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Check if the user is trying to access a protected route without token
  if (isProtectedRoute && !token) {
    console.log('🚫 Redirecting to login: no token for protected route')
    const loginUrl = new URL('/login', request.url)
    // Add return URL for better UX
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user has token and trying to access auth pages or home, redirect to dashboard
  if ((isAuthRoute || pathname === '/') && token) {
    console.log('🔄 Redirecting to dashboard: has token')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}