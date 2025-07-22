import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const email = searchParams.get('email')
    
    if (!username && !email) {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      )
    }
    
    let query: any = {}
    if (username) query.username = username
    if (email) query.email = email.toLowerCase()
    
    const result = await User.deleteOne(query)
    
    console.log('🗑️ User deletion result:', { query, deletedCount: result.deletedCount })
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: result.deletedCount > 0 ? 'User deleted successfully' : 'User not found'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
