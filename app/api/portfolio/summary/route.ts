import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import { withAuth } from '@/lib/auth/middleware'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect()

    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      )
    }

    // Get user's portfolio
    const portfolio = await Portfolio.findOne({ userId })

    if (!portfolio) {
      // Return default values if no portfolio exists
      return NextResponse.json({
        totalValue: 0,
        change24h: 0,
        totalProjects: 0,
        activeAlerts: 0
      })
    }

    // Calculate 24h change (this would need real-time price data)
    const change24h = portfolio.totalProfitLossPercentage || 0

    return NextResponse.json({
      totalValue: portfolio.totalValue || 0,
      change24h: change24h,
      totalProjects: portfolio.assets?.length || 0,
      activeAlerts: 0 // This would come from a separate alerts collection
    })
  } catch (error) {
    console.error('Portfolio summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio summary' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
