import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Alert from '@/models/Alert'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    await dbConnect()

    const query: any = { userId: authResult.userId }
    
    if (status) {
      query.status = status
    }
    
    if (type) {
      query.type = type
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, coinId, condition, value, message, notificationChannels } = body

    if (!type || !coinId || !condition || value === undefined) {
      return NextResponse.json(
        { error: 'Type, coinId, condition and value are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const alert = await Alert.create({
      userId: authResult.userId,
      type,
      coinId,
      condition,
      value,
      message,
      notificationChannels: notificationChannels || ['email'],
      status: 'active',
      metadata: {}
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}