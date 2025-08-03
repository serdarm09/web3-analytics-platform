// Script to check admin user status in database
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

const checkAdminUser = async () => {
  try {
    await connectDB()

    // Find admin user
    const admin = await User.findOne({ username: 'admin' })
    
    if (admin) {
      console.log('✅ Admin user found:')
      console.log('ID:', admin._id)
      console.log('Username:', admin.username)
      console.log('Email:', admin.email)
      console.log('Name:', admin.name)
      console.log('Role:', admin.role)
      console.log('isAdmin:', admin.isAdmin)
      console.log('Registration Method:', admin.registrationMethod)
      console.log('Created:', admin.createdAt)
      
      // Update admin if needed
      if (!admin.isAdmin) {
        console.log('🔧 Updating admin user to set isAdmin = true')
        admin.isAdmin = true
        admin.role = 'admin'
        await admin.save()
        console.log('✅ Admin user updated successfully')
      } else {
        console.log('✅ Admin user already has isAdmin = true')
      }
    } else {
      console.log('❌ Admin user not found')
    }

    // List all users
    console.log('\n📋 All users in database:')
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

checkAdminUser()
