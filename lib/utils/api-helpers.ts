import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  status: number
  code?: string
}

export class AppError extends Error {
  public status: number
  public code?: string

  constructor(message: string, status: number = 500, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'AppError'
  }
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        success: false
      },
      { status: error.status }
    )
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field'
    return NextResponse.json(
      {
        error: `Duplicate ${field}: This ${field} already exists`,
        code: 'DUPLICATE_KEY',
        success: false
      },
      { status: 409 }
    )
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message)
    return NextResponse.json(
      {
        error: messages.join(', '),
        code: 'VALIDATION_ERROR',
        success: false
      },
      { status: 400 }
    )
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json(
      {
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        success: false
      },
      { status: 401 }
    )
  }

  if (error.name === 'TokenExpiredError') {
    return NextResponse.json(
      {
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED',
        success: false
      },
      { status: 401 }
    )
  }

  // Default error
  return NextResponse.json(
    {
      error: 'Internal server error. Please try again later.',
      code: 'INTERNAL_ERROR',
      success: false
    },
    { status: 500 }
  )
}

export function validateRequired(fields: Record<string, any>): void {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key)

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'MISSING_FIELDS'
    )
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address', 400, 'INVALID_EMAIL')
  }
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400, 'WEAK_PASSWORD')
  }
}

export function validateUsername(username: string): void {
  if (username.length < 3 || username.length > 30) {
    throw new AppError('Username must be between 3 and 30 characters', 400, 'INVALID_USERNAME')
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new AppError('Username can only contain letters, numbers, and underscores', 400, 'INVALID_USERNAME')
  }
}
