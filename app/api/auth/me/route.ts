import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import { withAuth } from '@/lib/auth/middleware'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {

    await dbConnect()

    const userId = request.headers.get('x-user-id')
    const authHeader = request.headers.get('authorization')
    
    if (!userId) {

      return NextResponse.json(
        { 
          error: 'User ID not found in request',
          success: false 
        },
        { status: 400 }
      )
    }

    const user = await User.findById(userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          success: false 
        },
        { status: 404 }
      )
    }

    const userResponse = {
      _id: (user._id as any).toString(),
      id: (user._id as any).toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      walletAddress: user.walletAddress,
      registrationMethod: user.registrationMethod,
      isVerified: user.isVerified,
      avatar: user.avatar,
      twoFactorEnabled: user.twoFactorEnabled,
      role: user.role || 'user',
      isAdmin: user.isAdmin || false, // Added isAdmin field!
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(
      { 
        user: userResponse,
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        success: false 
      },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
