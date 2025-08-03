// Script to update all admin role users to have isAdmin = true
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  registrationMethod: String,
  isVerified: Boolean,
  isVerifiedCreator: Boolean,
  twoFactorEnabled: Boolean,
  role: String,
  isAdmin: Boolean,
  trackedProjects: Array,
}, {
  timestamps: true,
  versionKey: false,
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

const updateAllAdmins = async () => {
  try {
    await connectDB()

    // Update all users with role 'admin' to have isAdmin = true
    const result = await User.updateMany(
      { role: 'admin' },
      { 
        $set: { 
          isAdmin: true 
        } 
      }
    )

    console.log(`✅ Updated ${result.modifiedCount} admin users`)

    // Also update users without role but should be admin
    const userResult = await User.updateMany(
      { role: { $exists: false } },
      { 
        $set: { 
          role: 'user',
          isAdmin: false 
        } 
      }
    )

    console.log(`✅ Updated ${userResult.modifiedCount} regular users`)

    // Show final state
    console.log('\n📋 Final user state:')
    const allUsers = await User.find({}).select('username email isAdmin role')
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}, isAdmin: ${user.isAdmin}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

updateAllAdmins()
