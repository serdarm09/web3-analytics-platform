import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database/mongoose'
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

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const registrationMethod = searchParams.get('registrationMethod') || ''

    const query: any = {}

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (role) {
      query.role = role
    }

    if (registrationMethod) {
      query.registrationMethod = registrationMethod
    }

    const skip = (page - 1) * limit

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(query)

    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          emailUsers: { $sum: { $cond: [{ $eq: ['$registrationMethod', 'email'] }, 1, 0] } },
          walletUsers: { $sum: { $cond: [{ $eq: ['$registrationMethod', 'wallet'] }, 1, 0] } },
          codeUsers: { $sum: { $cond: [{ $eq: ['$registrationMethod', 'code'] }, 1, 0] } }
        }
      }
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0,
        emailUsers: 0,
        walletUsers: 0,
        codeUsers: 0
      }
    })

  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    await verifyAdmin(request)

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const allowedUpdates = ['role', 'isVerified', 'isVerifiedCreator']
    const validUpdates = Object.keys(updates).filter(key => allowedUpdates.includes(key))
    
    if (validUpdates.length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    const updateObject: any = {}
    validUpdates.forEach(key => {
      updateObject[key] = updates[key]
    })

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateObject,
      { new: true, select: '-password' }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const admin = await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === admin._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const deletedUser = await User.findByIdAndDelete(userId)
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}
