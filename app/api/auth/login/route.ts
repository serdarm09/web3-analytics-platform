import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import { generateToken } from '@/lib/auth/jwt'
import { rateLimitPresets } from '@/lib/middleware/rateLimiter'

export async function POST(request: NextRequest) {
  try {
    // Check database connection first
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

    // Apply rate limiting
    return rateLimitPresets.auth(request, async (req) => {
      try {
        // Better request body parsing with error handling
        let body
        try {
          const text = await req.text()
          
          if (!text || text.trim() === '') {
            return NextResponse.json(
              { 
                error: 'Request body is empty',
                success: false 
              },
              { status: 400 }
            )
          }
          
          body = JSON.parse(text)
        } catch (parseError) {
          console.error('❌ JSON parsing error:', parseError)
          return NextResponse.json(
            { 
              error: 'Invalid JSON in request body',
              success: false 
            },
            { status: 400 }
          )
        }

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

          // Also set non-httpOnly cookie for client-side access
          response.cookies.set('auth_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
          })

          return response

        } else if (loginMethod === 'email') {
          // Email/Username login validation
          if (!email || !password) {
            return NextResponse.json(
              { 
                error: 'Email/Username and password are required',
                success: false 
              },
              { status: 400 }
            )
          }

          // Check if input is email or username
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const isEmail = emailRegex.test(email)

          let user;
          if (isEmail) {
            // Find user by email
            user = await User.findOne({ email: email.toLowerCase() })
          } else {
            // Find user by username
            user = await User.findOne({ username: email })
          }

          if (!user) {
            return NextResponse.json(
              { 
                error: 'Invalid credentials',
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

          // Also set non-httpOnly cookie for client-side access
          response.cookies.set('auth_token', token, {
            httpOnly: false,
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
        console.error('Login processing error:', error)
        return NextResponse.json(
          { 
            error: 'Internal server error. Please try again later.',
            success: false 
          },
          { status: 500 }
        )
      }
    })

  } catch (error) {
    console.error('Login endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        success: false 
      },
      { status: 500 }
    )
  }
}
