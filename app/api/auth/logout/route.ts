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

    // Try multiple approaches to clear the httpOnly token cookie
    response.cookies.delete('token')
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0)
    })

    // Try multiple approaches to clear the client-side auth_token cookie  
    response.cookies.delete('auth_token')
    response.cookies.set('auth_token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0)
    })

    // Additional cookie clearing with different configurations for compatibility
    response.cookies.set('token', '', {
      maxAge: 0,
      path: '/',
      expires: new Date(0)
    })

    response.cookies.set('auth_token', '', {
      maxAge: 0,
      path: '/',
      expires: new Date(0)
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
