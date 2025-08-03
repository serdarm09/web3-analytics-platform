import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import { withAuth } from '@/lib/auth/middleware'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect()

    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { username, email, name } = body

    // Find user
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update fields
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username })
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
      user.username = username
    }

    // For wallet users, allow adding email if not present
    if (user.registrationMethod === 'wallet' && !user.email && email) {
      // Check if email is already in use
      const existingEmailUser = await User.findOne({ email: email.toLowerCase() })
      if (existingEmailUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
      user.email = email.toLowerCase()
    }

    // Update name
    if (name !== undefined) {
      user.name = name
    }

    // Save changes
    await user.save()

    // Return updated user
    const userResponse = {
      id: (user._id as any).toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      walletAddress: user.walletAddress,
      registrationMethod: user.registrationMethod,
      subscription: user.subscription,
      isVerified: user.isVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(
      { 
        user: userResponse,
        success: true,
        message: 'Profile updated successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export const PUT = withAuth(handler)
