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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || undefined

    const result = await (Activity as any).getUserActivities(
      new mongoose.Types.ObjectId(user.userId), 
      limit, 
      page, 
      type
    )

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activities' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = await verifyAuth(request)
    if (!user || !user.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, description, metadata, status } = await request.json()

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      )
    }

    const activity = await (Activity as any).createActivity(
      new mongoose.Types.ObjectId(user.userId),
      type,
      description,
      metadata || {},
      status || 'success'
    )

    return NextResponse.json({
      success: true,
      data: activity
    })

  } catch (error) {
    console.error('Activity creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create activity' 
      }, 
      { status: 500 }
    )
  }
}
