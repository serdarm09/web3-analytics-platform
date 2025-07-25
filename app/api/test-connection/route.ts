import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  const results = {
    mongodbUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    connectionAttempt: 'pending',
    error: null as any,
    connectionState: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  }

  try {
    if (!process.env.MONGODB_URI) {
      results.connectionAttempt = 'failed'
      results.error = 'MONGODB_URI not set in environment variables'
      return NextResponse.json(results, { status: 500 })
    }

    // Try direct connection without the dbConnect wrapper
    if (mongoose.connection.readyState === 0) {
      console.log('Attempting MongoDB connection...')
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      })
    }

    results.connectionAttempt = 'success'
    results.connectionState = mongoose.connection.readyState
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray()
    results.collections = collections.map(c => c.name)

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    console.error('Connection test error:', error)
    results.connectionAttempt = 'failed'
    results.error = error.message
    results.connectionState = mongoose.connection.readyState
    
    return NextResponse.json(results, { status: 500 })
  }
}