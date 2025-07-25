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
  // During Vercel build, skip if no MongoDB URI
  if (!MONGODB_URI) {
    if (process.env.VERCEL || process.env.CI) {
      console.warn('⚠️ MongoDB URI not found, skipping database connection')
      return null
    }
    // Only throw error in local development
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Reduced for Vercel
      serverSelectionTimeoutMS: 5000, // Reduced timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true
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
    throw e
  }

  return cached.conn
}

export default dbConnect
