import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import { generateToken } from '@/lib/auth/jwt'
import { rateLimitPresets } from '@/lib/middleware/rateLimiter'

export async function POST(request: NextRequest) {
  return rateLimitPresets.auth(request, async (req) => {
  try {
    await dbConnect()

    const body = await req.json()
    const { email, password, walletAddress, loginMethod } = body

    // Validate based on login method
    if (loginMethod === 'wallet') {
      if (!walletAddress) {
        return NextResponse.json(
          { 
            error: 'Wallet address is required for wallet login',
            success: false 
          },
          { status: 400 }
        )
      }

      // Find user by wallet address
      const user = await User.findOne({ walletAddress })

      if (!user) {
        return NextResponse.json(
          { 
            error: 'No account found with this wallet address',
            success: false 
          },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = generateToken(user)

      // Return user data
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
      }

      // Set cookie for web clients
      const response = NextResponse.json(
        {
          user: userResponse,
          token,
          success: true,
          message: 'Wallet login successful'
        },
        { status: 200 }
      )

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response

    } else if (loginMethod === 'email') {
      // Email login validation
      if (!email || !password) {
        return NextResponse.json(
          { 
            error: 'Email and password are required',
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

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() })

      if (!user) {
        return NextResponse.json(
          { 
            error: 'Invalid email or password',
            success: false 
          },
          { status: 401 }
        )
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            error: 'Invalid email or password',
            success: false 
          },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = generateToken(user)

      // Return user data
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
      }

      // Set cookie for web clients
      const response = NextResponse.json(
        {
          user: userResponse,
          token,
          success: true,
          message: 'Login successful'
        },
        { status: 200 }
      )

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response

    } else {
      return NextResponse.json(
        { 
          error: 'Invalid login method',
          success: false 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        success: false 
      },
      { status: 500 }
    )
  }
  })
}