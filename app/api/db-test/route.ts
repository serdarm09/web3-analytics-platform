import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection...')
    
    const connection = await dbConnect()
    
    if (!connection) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to MongoDB',
        connected: false
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection successful',
      connected: true,
      database: connection.connection.db?.databaseName || 'Unknown'
    })
  } catch (error: any) {
    console.error('❌ Database test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error',
      connected: false,
      errorCode: error.code || null,
      errorName: error.codeName || null
    }, { status: 500 })
  }
}