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
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
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
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      )
    }

    const payload: JWTPayload = verifyToken(token)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Invalid or expired token'
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    )
  }
}

export function withAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const authResponse = await authMiddleware(request)
    
    if (authResponse.status === 401) {
      return authResponse
    }

    // Update request with authenticated headers
    const authHeaders = authResponse.headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', authHeaders.get('x-user-id') || '')
    requestHeaders.set('x-user-email', authHeaders.get('x-user-email') || '')
    requestHeaders.set('x-user-subscription', authHeaders.get('x-user-subscription') || '')
    
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    })

    return handler(newRequest, context)
  }
}