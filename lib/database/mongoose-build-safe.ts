import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var __mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.__mongoose || { conn: null, promise: null }

if (!global.__mongoose) {
  global.__mongoose = cached
}

async function dbConnect(): Promise<typeof mongoose | null> {
  // During build time, return null to skip database connection
  if (process.env.NODE_ENV === 'production' && !MONGODB_URI) {
    console.warn('⚠️ MongoDB URI not found during build, skipping connection')
    return null
  }

  // In runtime, check for MongoDB URI
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables')
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    console.log('🔄 Connecting to MongoDB Atlas...')
    console.log('📍 MongoDB URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')) // Hide password in logs
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ MongoDB Atlas connected successfully')
  } catch (e) {
    cached.promise = null
    console.error('❌ MongoDB connection error:', e)
    // During build, don't throw error
    if (process.env.VERCEL) {
      console.warn('⚠️ Running on Vercel, continuing without database')
      return null
    }
    throw e
  }

  return cached.conn
}

export default dbConnect