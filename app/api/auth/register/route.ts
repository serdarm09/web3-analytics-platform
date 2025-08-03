import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import InviteCode from '@/models/InviteCode'
import { generateToken } from '@/lib/auth/jwt'
import { rateLimitPresets } from '@/lib/middleware/rateLimiter'

export async function POST(request: NextRequest) {
  try {
    // Check database connection
    const dbConnection = await dbConnect()
    if (!dbConnection) {
      console.error('❌ Database connection failed')
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          success: false 
        },
        { status: 500 }
      )
    }



    const { username, email, password, inviteCode, registrationMethod = 'email', name, walletAddress } = await request.json()

    // Validate invite code - REQUIRED for all registrations
    if (!inviteCode) {
      return NextResponse.json(
        { 
          error: 'Invite code is required for registration',
          success: false 
        },
        { status: 400 }
      )
    }

    // Find and validate invite code
    const inviteCodeDoc = await InviteCode.findOne({ 
      code: inviteCode.toUpperCase() 
    })

    if (!inviteCodeDoc) {
      return NextResponse.json(
        { 
          error: 'Invalid invite code',
          success: false 
        },
        { status: 400 }
      )
    }

    // Check if invite code is still valid
    const isExpired = inviteCodeDoc.expiresAt && inviteCodeDoc.expiresAt < new Date()
    const hasReachedLimit = inviteCodeDoc.usageCount >= inviteCodeDoc.usageLimit

    if (isExpired) {
      return NextResponse.json(
        { 
          error: 'Invite code has expired',
          success: false 
        },
        { status: 400 }
      )
    }

    if (hasReachedLimit) {
      return NextResponse.json(
        { 
          error: 'Invite code has reached its usage limit',
          success: false 
        },
        { status: 400 }
      )
    }



    // Validate username for both registration methods
    if (!username) {
      return NextResponse.json(
        { 
          error: 'Username is required',
          success: false 
        },
        { status: 400 }
      )
    }

    // Check if username already exists

    const existingUsername = await User.findOne({ username })
    if (existingUsername) {

      return NextResponse.json(
        { 
          error: 'Username is already taken',
          success: false 
        },
        { status: 409 }
      )
    }


    // Validate required fields based on registration method
    if (registrationMethod === 'wallet') {
      if (!walletAddress) {
        return NextResponse.json(
          { 
            error: 'Wallet address is required for wallet registration',
            success: false 
          },
          { status: 400 }
        )
      }

      // Check if wallet address already exists
      const existingWallet = await User.findOne({ walletAddress })
      if (existingWallet) {
        return NextResponse.json(
          { 
            error: 'This wallet address is already registered',
            success: false 
          },
          { status: 400 }
        )
      }
    } else if (registrationMethod === 'email') {
      // Email registration validation
      if (!email || !password || !username) {
        return NextResponse.json(
          { 
            error: 'Email, password, and username are required for email registration',
            success: false 
          },
          { status: 400 }
        )
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { 
            error: 'Please provide a valid email address',
            success: false 
          },
          { status: 400 }
        )
      }

      // Password validation
      if (password.length < 6) {
        return NextResponse.json(
          { 
            error: 'Password must be at least 6 characters',
            success: false 
          },
          { status: 400 }
        )
      }

      // Check if user already exists (only for email registration)

      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser) {

        return NextResponse.json(
          { 
            error: 'User with this email already exists',
            success: false 
          },
          { status: 409 }
        )
      }

    } else {
      return NextResponse.json(
        { 
          error: 'Invalid registration method',
          success: false 
        },
        { status: 400 }
      )
    }

    let userData: any = {
      registrationMethod,
      username
    }

    if (registrationMethod === 'wallet') {
      userData.walletAddress = walletAddress
      userData.name = name || username || `User-${walletAddress.slice(0, 6)}`
      // Don't set email field for wallet registration to avoid null constraint issues
    } else {
      userData.email = email.toLowerCase()
      userData.password = password
      userData.name = username // Use username as name for email registration
    }

    // Create new user
    const user = await User.create(userData)


    // Update invite code usage
    if (!inviteCodeDoc.usedBy) {
      inviteCodeDoc.usedBy = []
    }
    inviteCodeDoc.usedBy.push(user._id)
    inviteCodeDoc.usageCount += 1
    if (inviteCodeDoc.usageCount >= inviteCodeDoc.usageLimit) {
      inviteCodeDoc.isUsed = true
    }
    await inviteCodeDoc.save()

    // Generate JWT token
    const token = generateToken(user)

    // Return user data without password
    const userResponse = {
      id: (user._id as any).toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      walletAddress: user.walletAddress,
      registrationMethod: user.registrationMethod,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin || false,
      avatar: user.avatar,
      createdAt: user.createdAt,
    }

    // Set cookie for web clients
    const response = NextResponse.json(
      {
        user: userResponse,
        token,
        success: true,
        message: 'Registration successful'
      },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return NextResponse.json(
        { 
          error: `User with this ${field} already exists`,
          success: false 
        },
        { status: 409 }
      )
    }

    // More specific error messages
    let errorMessage = 'Internal server error. Please try again later.'
    if (error.message) {
      if (error.message.includes('authentication failed') || error.code === 8000) {
        errorMessage = 'Database authentication failed. Please check your MongoDB credentials.'
        console.error('❌ MongoDB Authentication Error - Check your MongoDB Atlas credentials')
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to database server.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Database connection timeout. Please try again.'
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: 500 }
    )
  }
}
