import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Watchlist from '@/models/Watchlist'
import { verifyAuth } from '@/lib/auth/middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    await dbConnect()

    const result = await Watchlist.findOneAndDelete({
      _id: id,
      userId: authResult.userId
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from watchlist'
    })

  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { alertPrice, notes } = body

    await dbConnect()

    const watchlistItem = await Watchlist.findOneAndUpdate(
      {
        _id: id,
        userId: authResult.userId
      },
      {
        ...(alertPrice !== undefined && { alertPrice }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!watchlistItem) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item: watchlistItem
    })

  } catch (error) {
    console.error('Error updating watchlist item:', error)
    return NextResponse.json(
      { error: 'Failed to update watchlist item' },
      { status: 500 }
    )
  }
}