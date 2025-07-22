import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Vercel:', process.env.VERCEL)
    
    // Try to connect
    const connection = await dbConnect()
    
    if (!connection) {
      return NextResponse.json({
        success: false,
        message: 'Database connection returned null',
        environment: {
          hasMongoUri: !!process.env.MONGODB_URI,
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
      }
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
      }
    }, { status: 500 })
  }
}