import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Create response
  const response = NextResponse.json(
    { 
      message: 'All auth tokens cleared',
      success: true 
    },
    { status: 200 }
  )

  // Clear all auth-related cookies
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })

  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}
