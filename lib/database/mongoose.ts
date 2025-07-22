import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

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
  // Skip database connection during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping database connection during build')
    return null
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
    throw e
  }

  return cached.conn
}

export default dbConnect
