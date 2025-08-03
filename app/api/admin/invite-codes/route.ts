import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import InviteCode from '@/models/InviteCode'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth/jwt'

// Helper function to verify admin token
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('No authentication token')
  }

  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      throw new Error('Invalid token')
    }
    
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      throw new Error('User not found')
    }

    // Check if user is admin (you can modify this logic as needed)
    const isAdmin = user.isAdmin === true || user.username === 'admin'
    
    if (!isAdmin) {
      throw new Error('Admin access required')
    }

    return user
  } catch (error) {
    console.error('Admin verification error:', error)
    throw new Error('Invalid token or insufficient permissions')
  }
}

// GET - List all invite codes
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    await verifyAdmin(request)

    const codes = await InviteCode.find()
      .populate('createdBy', 'username name')
      .populate('usedBy', 'username name')
      .sort({ createdAt: -1 })
      .limit(100)

    const formattedCodes = codes.map(code => ({
      id: code._id,
      code: code.code,
      usageLimit: code.usageLimit,
      usageCount: code.usageCount,
      remainingUses: code.usageLimit - code.usageCount,
      isUsed: code.isUsed,
      expiresAt: code.expiresAt,
      createdAt: code.createdAt,
      createdBy: (code.createdBy as any)?.name || (code.createdBy as any)?.username || 'Unknown',
      usedBy: Array.isArray(code.usedBy) 
        ? (code.usedBy as any[]).map(u => u.name || u.username)
        : []
    }))

    return NextResponse.json({ 
      success: true,
      codes: formattedCodes 
    })

  } catch (error: any) {
    console.error('Get invite codes error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}

// POST - Create new invite code
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const admin = await verifyAdmin(request)

    const { code, expiresAt, usageLimit = 1 } = await request.json()

    // Validate usage limit
    if (usageLimit < 1 || usageLimit > 1000) {
      return NextResponse.json(
        { error: 'Usage limit must be between 1 and 1000' },
        { status: 400 }
      )
    }

    // Generate code if not provided
    let finalCode = code
    if (!finalCode) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      finalCode = result
    }

    // Check if code already exists
    const existingCode = await InviteCode.findOne({ code: finalCode.toUpperCase() })
    if (existingCode) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 400 }
      )
    }

    // Validate expiration date
    let expirationDate = null
    if (expiresAt) {
      expirationDate = new Date(expiresAt)
      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        )
      }
    }

    const inviteCode = new InviteCode({
      code: finalCode.toUpperCase(),
      createdBy: admin._id,
      usageLimit,
      usageCount: 0,
      isUsed: false,
      expiresAt: expirationDate,
      usedBy: []
    })

    await inviteCode.save()

    return NextResponse.json(
      { 
        success: true,
        message: 'Invite code created successfully',
        inviteCode: {
          id: inviteCode._id,
          code: inviteCode.code,
          usageLimit: inviteCode.usageLimit,
          usageCount: inviteCode.usageCount,
          remainingUses: inviteCode.usageLimit - inviteCode.usageCount,
          expiresAt: inviteCode.expiresAt,
          createdAt: inviteCode.createdAt,
          createdBy: admin.name || admin.username
        }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Create invite code error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}

// DELETE - Delete invite code
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const codeId = searchParams.get('id')

    if (!codeId) {
      return NextResponse.json(
        { error: 'Code ID is required' },
        { status: 400 }
      )
    }

    const deletedCode = await InviteCode.findByIdAndDelete(codeId)
    
    if (!deletedCode) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Code deleted successfully' })

  } catch (error: any) {
    console.error('Delete invite code error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}
