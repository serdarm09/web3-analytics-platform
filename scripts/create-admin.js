// Script to create admin user
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

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
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  name: String,
  registrationMethod: { type: String, default: 'email' },
  isVerified: { type: Boolean, default: true },
  isVerifiedCreator: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },
  trackedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
}, {
  timestamps: true,
  versionKey: false,
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

const createAdmin = async () => {
  try {
    await connectDB()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' })
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists')
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const admin = await User.create({
        username: 'admin',
        email: 'admin@velocitycrypto.tech',
        password: hashedPassword,
        name: 'Administrator',
        registrationMethod: 'email',
        role: 'admin',
        isAdmin: true,
        isVerified: true
      })

      console.log('✅ Admin user created:', {
        username: admin.username,
        email: admin.email,
        id: admin._id
      })
    }

    // Get admin user for invite code creation capability
    const admin = await User.findOne({ username: 'admin' })

    console.log('\n🎉 Admin setup completed successfully!')
    console.log('\n📋 Admin Login Credentials:')
    console.log('Username: admin')
    console.log('Password: admin123')
    console.log('\nℹ️ You can now create invite codes through the admin panel.')
    console.log('🌐 Login at: /login')
    console.log('🔧 Admin Panel: /dashboard/admin')

  } catch (error) {
    console.error('❌ Setup error:', error)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

createAdmin()
