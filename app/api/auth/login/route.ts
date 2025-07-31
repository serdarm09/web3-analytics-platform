import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import { generateToken } from '@/lib/auth/jwt'
import { rateLimitPresets } from '@/lib/middleware/rateLimiter'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started')
    
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
          console.log('📋 Raw request body length:', text?.length || 0)
          
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

        console.log('📋 Login data received:', {
          email: body.email ? 'PROVIDED' : 'NOT PROVIDED',
          password: body.password ? 'PROVIDED' : 'NOT PROVIDED',
          walletAddress: body.walletAddress ? 'PROVIDED' : 'NOT PROVIDED',
          loginMethod: body.loginMethod
        })
        
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

          // Also set non-httpOnly cookie for client-side access
          response.cookies.set('auth_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
          })

          console.log('✅ Wallet login cookies set successfully')
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
          console.log('🔍 Looking for user with email:', email?.toLowerCase())
          const user = await User.findOne({ email: email.toLowerCase() })

          if (!user) {
            console.log('❌ User not found with email:', email?.toLowerCase())
            return NextResponse.json(
              { 
                error: 'Invalid email or password',
                success: false 
              },
              { status: 401 }
            )
          }
          
          console.log('✅ User found:', { id: user._id, email: user.email, username: user.username, registrationMethod: user.registrationMethod })

          // Check password
          console.log('🔐 Checking password...')
          const isPasswordValid = await user.comparePassword(password)
          console.log('🔐 Password check result:', isPasswordValid)

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

          // Also set non-httpOnly cookie for client-side access
          response.cookies.set('auth_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
          })

          console.log('✅ Login cookies set successfully')
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