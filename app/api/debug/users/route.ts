import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get all users (limited to username, email, registrationMethod for security)
    const users = await User.find({}, {
      username: 1,
      email: 1,
      registrationMethod: 1,
      createdAt: 1,
      _id: 1
    }).limit(20)
    
    console.log('📊 Users in database:', users)
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
