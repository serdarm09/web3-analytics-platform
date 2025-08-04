const mongoose = require('mongoose')
const path = require('path')

// Add the project root to the require path
require('app-module-path').addPath(path.join(__dirname, '..'))

const InviteCode = require('./models/InviteCode')
const User = require('./models/User')

require('dotenv').config({ path: '.env.local' })

async function checkInviteCodes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find all invite codes
    const inviteCodes = await InviteCode.find({}).populate('createdBy', 'name username')
    
    console.log('\n📋 Current Invite Codes:')
    console.log('========================')
    
    if (inviteCodes.length === 0) {
      console.log('❌ No invite codes found in database')
    } else {
      inviteCodes.forEach((code, index) => {
        console.log(`${index + 1}. Code: ${code.code}`)
        console.log(`   Usage: ${code.usageCount}/${code.usageLimit}`)
        console.log(`   Created by: ${code.createdBy?.name || code.createdBy?.username || 'Unknown'}`)
        console.log(`   Expires: ${code.expiresAt ? code.expiresAt.toLocaleDateString() : 'Never'}`)
        console.log(`   Status: ${code.usageCount >= code.usageLimit ? '❌ Used up' : code.expiresAt && code.expiresAt < new Date() ? '❌ Expired' : '✅ Valid'}`)
        console.log('   ---')
      })
    }

    // Find admin users to create codes if needed
    const adminUsers = await User.find({ isAdmin: true })
    console.log(`\n👤 Admin Users Found: ${adminUsers.length}`)
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Creating one...')
      
      const adminUser = new User({
        username: 'admin',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123', // Will be hashed by the model
        isAdmin: true
      })
      
      await adminUser.save()
      console.log('✅ Admin user created: admin / admin123')
      adminUsers.push(adminUser)
    }

    // Create some test invite codes if none exist
    if (inviteCodes.length === 0) {
      console.log('\n🔧 Creating test invite codes...')
      
      const testCodes = [
        { code: 'ALPHA100', usageLimit: 100 },
        { code: 'BETA50', usageLimit: 50 },
        { code: 'GAMMA10', usageLimit: 10 }
      ]

      for (const testCode of testCodes) {
        const inviteCode = new InviteCode({
          code: testCode.code,
          usageLimit: testCode.usageLimit,
          usageCount: 0,
          createdBy: adminUsers[0]._id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
        
        await inviteCode.save()
        console.log(`✅ Created invite code: ${testCode.code} (${testCode.usageLimit} uses)`)
      }
    }

    console.log('\n✅ Check complete')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    mongoose.connection.close()
  }
}

checkInviteCodes()
