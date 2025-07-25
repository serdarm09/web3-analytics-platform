import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

async function syncTrendingData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Call the sync endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/trending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to sync trending data: ${response.status}`)
    }

    const result = await response.json()
    console.log('Trending data synced successfully:', result)

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Error syncing trending data:', error)
    process.exit(1)
  }
}

// Run the sync
syncTrendingData()