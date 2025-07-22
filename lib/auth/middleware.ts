import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'

export interface AuthResult {
  authenticated: boolean
  userId?: string
  email?: string
  subscription?: string
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Check for token in both Authorization header and cookies
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
    // If no token in header, check cookies
    if (!token) {
      token = request.cookies.get('token')?.value || null
    }
    
    if (!token) {
      return { authenticated: false }
    }

    const payload: JWTPayload = verifyToken(token)
    
    return {
      authenticated: true,
      userId: payload.userId,
      email: payload.email,
      subscription: payload.subscription
    }
  } catch (error) {
    return { authenticated: false }
  }
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔐 Auth middleware started')
    
    // Check for token in both Authorization header and cookies
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
    console.log('📋 Auth header:', authHeader ? 'PROVIDED' : 'NOT PROVIDED')
    
    // If no token in header, check cookies
    if (!token) {
      token = request.cookies.get('token')?.value || null
      console.log('🍪 Cookie token:', token ? 'PROVIDED' : 'NOT PROVIDED')
    }
    
    if (!token) {
      console.log('❌ No token found in request')
      return NextResponse.json(
        { error: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      )
    }

    console.log('🔍 Verifying token...')
    const payload: JWTPayload = verifyToken(token)
    console.log('✅ Token verified successfully:', { userId: payload.userId, email: payload.email })
    
    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-subscription', payload.subscription)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('❌ Auth middleware error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Invalid or expired token'
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}

export function withAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    console.log('🔒 WithAuth wrapper called for:', request.url)
    
    try {
      console.log('🔐 Auth middleware started')
      
      // Check for token in both Authorization header and cookies
      const authHeader = request.headers.get('authorization')
      let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
      
      console.log('📋 Auth header:', authHeader ? 'PROVIDED' : 'NOT PROVIDED')
      
      // If no token in header, check cookies
      if (!token) {
        token = request.cookies.get('token')?.value || null
        console.log('🍪 Cookie token:', token ? 'PROVIDED' : 'NOT PROVIDED')
      }
      
      if (!token) {
        console.log('❌ No token found in request')
        return NextResponse.json(
          { error: 'Authentication required. Please provide a valid token.' },
          { status: 401 }
        )
      }

      console.log('🔍 Verifying token...')
      const payload: JWTPayload = verifyToken(token)
      console.log('✅ Token verified successfully:', { userId: payload.userId, email: payload.email })
      
      // Create new request with auth headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-email', payload.email)
      requestHeaders.set('x-user-subscription', payload.subscription)
      
      console.log('📤 Setting headers:', {
        'x-user-id': payload.userId,
        'x-user-email': payload.email,
        'x-user-subscription': payload.subscription
      })
      
      const newRequest = new NextRequest(request.url, {
        method: request.method,
        headers: requestHeaders,
        body: request.body,
      })

      console.log('✅ Calling handler with authenticated request')
      return handler(newRequest, context)
      
    } catch (error) {
      console.error('❌ Auth middleware error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Invalid or expired token'
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }
  }
}