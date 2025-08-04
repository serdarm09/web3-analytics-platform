import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import InviteCode from '@/models/InviteCode'
import User from '@/models/User'

export async function GET() {
  try {
    await dbConnect()

    // Check invite codes
    const inviteCodes = await InviteCode.find({}).populate('createdBy', 'name username')
    
    // Check admin users
    const adminUsers = await User.find({ isAdmin: true })
    
    // If no invite codes exist, create some test ones
    if (inviteCodes.length === 0) {
      // First, ensure we have an admin user
      let adminUser = adminUsers[0]
      if (!adminUser) {
        adminUser = new User({
          username: 'admin',
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'admin123',
          isAdmin: true
        })
        await adminUser.save()
      }

      // Create test invite codes
      const testCodes = [
        { code: 'ALPHA100', usageLimit: 100 },
        { code: 'BETA50', usageLimit: 50 },
        { code: 'GAMMA10', usageLimit: 10 }
      ]

      const createdCodes = []
      for (const testCode of testCodes) {
        const inviteCode = new InviteCode({
          code: testCode.code,
          usageLimit: testCode.usageLimit,
          usageCount: 0,
          createdBy: adminUser._id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
        
        await inviteCode.save()
        createdCodes.push(inviteCode)
      }

      return NextResponse.json({
        message: 'Database initialized with test invite codes',
        codesCreated: createdCodes.length,
        codes: createdCodes.map(code => ({
          code: code.code,
          usageLimit: code.usageLimit,
          usageCount: code.usageCount
        }))
      })
    }

    return NextResponse.json({
      message: 'Database status',
      inviteCodesCount: inviteCodes.length,
      adminUsersCount: adminUsers.length,
      codes: inviteCodes.map(code => ({
        code: code.code,
        usageCount: code.usageCount,
        usageLimit: code.usageLimit,
        isValid: code.usageCount < code.usageLimit && (!code.expiresAt || code.expiresAt > new Date()),
        createdBy: (code.createdBy as any)?.name || (code.createdBy as any)?.username || 'Unknown'
      }))
    })

  } catch (error: any) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { error: 'Database check failed', details: error.message },
      { status: 500 }
    )
  }
}
