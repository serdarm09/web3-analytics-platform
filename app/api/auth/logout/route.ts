import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { 
        message: 'Logout successful',
        success: true 
      },
      { status: 200 }
    )

    // Clear the httpOnly cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    // Also clear any other auth-related cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        success: false 
      },
      { status: 500 }
    )
  }
}
