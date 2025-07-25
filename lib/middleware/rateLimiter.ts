import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Simple in-memory store (in production, use Redis)
const rateLimitStore: RateLimitStore = {}

// Clean up old entries on each request
function cleanupOldEntries() {
  const now = Date.now()
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  }
}

export interface RateLimitConfig {
  windowMs?: number // Time window in milliseconds
  max?: number // Max requests per window
  message?: string // Error message
  keyGenerator?: (req: NextRequest) => string // Function to generate key
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  keyGenerator: (req: NextRequest) => {
    // Use IP address as key (fallback to 'anonymous' if not found)
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'anonymous'
    return ip
  }
}

export function rateLimit(config: RateLimitConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance on each request
      cleanupOldEntries()
    }
    
    const key = finalConfig.keyGenerator(request)
    const now = Date.now()
    const windowStart = now - finalConfig.windowMs

    // Get or create rate limit entry
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + finalConfig.windowMs
      }
    }

    const rateLimit = rateLimitStore[key]

    // Check if limit exceeded
    if (rateLimit.count >= finalConfig.max) {
      const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: finalConfig.message,
          retryAfter: retryAfter
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': finalConfig.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': retryAfter.toString()
          }
        }
      )
    }

    // Increment count
    rateLimit.count++

    // Call the handler and add rate limit headers
    const response = await handler(request)
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', finalConfig.max.toString())
    response.headers.set('X-RateLimit-Remaining', (finalConfig.max - rateLimit.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())

    return response
  }
}

// Preset configurations
export const rateLimitPresets = {
  // Strict limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many authentication attempts, please try again later.'
  }),

  // Standard API limit
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  }),

  // Relaxed limit for read operations
  read: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
  }),

  // Strict limit for write operations
  write: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many write requests, please slow down.'
  })
}