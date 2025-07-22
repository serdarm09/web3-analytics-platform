import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import { handleApiError } from '@/lib/utils/api-helpers'

export async function GET(request: NextRequest) {
  try {
    // Test database connection only if not in build phase
    let dbStatus = 'skipped';
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      try {
        await dbConnect()
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'error';
        console.error('Database connection error:', dbError);
      }
    }
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: 'API is working correctly',
      received: body,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
