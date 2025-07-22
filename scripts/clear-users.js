// Script to clear duplicate users from MongoDB
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function clearUsers() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected successfully')

    // Clear all users
    const result = await mongoose.connection.db.collection('users').deleteMany({})
    console.log(`Deleted ${result.deletedCount} users`)

    console.log('Database cleared successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error clearing database:', error)
    process.exit(1)
  }
}

clearUsers()
