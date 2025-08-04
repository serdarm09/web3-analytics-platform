import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import InviteCode from '@/models/InviteCode'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Validate invite called')
    await dbConnect()
    console.log('✅ DB connected')

    const { code } = await request.json()
    console.log('📝 Received code:', code)

    if (!code) {
      console.log('❌ No code provided')
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Searching for code:', code.toUpperCase())
    
    // Find the invite code
    const inviteCode = await InviteCode.findOne({ 
      code: code.toUpperCase() 
    }).populate('createdBy', 'name')

    console.log('🔍 Search result:', inviteCode ? 'FOUND' : 'NOT FOUND')
    
    if (!inviteCode) {
      console.log('❌ Invite code not found in database')
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      )
    }

    // Check if code is valid (usage limit and expiration)
    const isExpired = inviteCode.expiresAt && inviteCode.expiresAt < new Date()
    const hasReachedLimit = inviteCode.usageCount >= inviteCode.usageLimit

    if (isExpired || hasReachedLimit) {
      return NextResponse.json(
        { error: 'Invite code has expired or reached usage limit' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: inviteCode.code,
      usageCount: inviteCode.usageCount,
      usageLimit: inviteCode.usageLimit,
      remainingUses: inviteCode.usageLimit - inviteCode.usageCount,
      createdBy: (inviteCode.createdBy as any)?.name || 'Admin'
    })

  } catch (error) {
    console.error('Invite code validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
