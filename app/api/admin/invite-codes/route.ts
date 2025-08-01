import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database/mongoose'
import InviteCode from '@/models/InviteCode'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

// Helper function to verify admin token
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value

  if (!token) {
    throw new Error('No authentication token')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await User.findById(decoded.userId || decoded.id)
    
    if (!user || user.role !== 'admin') {
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
    await connectDB()
    await verifyAdmin(request)

    const codes = await InviteCode.find()
      .populate('createdBy', 'username email')
      .populate('usedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(100)

    return NextResponse.json({ codes })

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
    await connectDB()
    const admin = await verifyAdmin(request)

    const { code, expiresAt } = await request.json()

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

    const inviteCode = new InviteCode({
      code: finalCode.toUpperCase(),
      createdBy: admin._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    })

    await inviteCode.save()

    return NextResponse.json(
      { 
        message: 'Invite code created successfully',
        code: inviteCode
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
    await connectDB()
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
