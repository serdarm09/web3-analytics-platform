import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/middleware'
import dbConnect from '@/lib/database/mongoose'
import Activity from '@/models/Activity'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = await verifyAuth(request)
    if (!user || !user.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const stats = await (Activity as any).getActivityStats(
      new mongoose.Types.ObjectId(user.userId),
      days
    )

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Activity stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activity stats' 
      }, 
      { status: 500 }
    )
  }
}
