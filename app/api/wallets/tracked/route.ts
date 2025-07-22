import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Wallet from '@/models/Wallet'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.userId
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    await dbConnect()

    // Get wallets tracked by the user
    const wallets = await Wallet.find({ trackingUsers: userId })
      .sort({ totalValue: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-recentTransactions') // Exclude large transaction arrays for list view
      .lean()

    const total = await Wallet.countDocuments({ trackingUsers: userId })

    return NextResponse.json({
      wallets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tracked wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracked wallets' },
      { status: 500 }
    )
  }
}