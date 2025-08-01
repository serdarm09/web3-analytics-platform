import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database/mongoose'
import User from '@/models/User'
import InviteCode from '@/models/InviteCode'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { code, username } = await request.json()

    if (!code || !username) {
      return NextResponse.json(
        { error: 'Code and username are required' },
        { status: 400 }
      )
    }

    // Find and validate invite code
    const inviteCode = await InviteCode.findOne({ code: code.toUpperCase() })
    
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    if (inviteCode.isUsed || (inviteCode.expiresAt && inviteCode.expiresAt < new Date())) {
      return NextResponse.json(
        { error: 'Invite code has expired or already been used' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      username,
      registrationMethod: 'code',
      isVerified: true,
      role: 'user'
    })

    await user.save()

    // Mark invite code as used
    inviteCode.isUsed = true
    inviteCode.usedBy = user._id
    await inviteCode.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        registrationMethod: user.registrationMethod,
        isVerified: user.isVerified,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Set cookie
    const response = NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: user._id,
          username: user.username,
          registrationMethod: user.registrationMethod,
          isVerified: user.isVerified,
          role: user.role,
          createdAt: user.createdAt
        }
      },
      { status: 201 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Code registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
