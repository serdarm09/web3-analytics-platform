import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? '✅ Set' : '❌ Not set',
      CRON_SECRET: process.env.CRON_SECRET ? '✅ Set' : '❌ Not set',
      VERCEL: process.env.VERCEL ? '✅ Running on Vercel' : '❌ Not on Vercel',
      VERCEL_URL: process.env.VERCEL_URL || 'Not set',
    },
    timestamp: new Date().toISOString()
  })
}