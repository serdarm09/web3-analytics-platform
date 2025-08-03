import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Watchlist from '@/models/Watchlist'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Get user's watchlist with current prices
    const watchlist = await Watchlist.find({ userId: authResult.userId })
      .sort({ addedAt: -1 })
      .lean()

    // Fetch current prices for watchlist items
    const coinIds = watchlist.map(item => item.coinId).join(',')
    
    if (coinIds) {
      try {
        // Try to fetch from CoinGecko
        const priceResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
        )
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          
          // Update watchlist items with current data
          watchlist.forEach((item: any) => {
            const data = priceData[item.coinId]
            if (data) {
              item.currentPrice = data.usd
              item.priceChange24h = data.usd_24h_change
              item.volume24h = data.usd_24h_vol
              item.marketCap = data.usd_market_cap
            }
          })
        }
      } catch (error) {
        console.error('Error fetching prices:', error)
      }
    }

    return NextResponse.json({ 
      success: true,
      watchlist 
    })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
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
    const { coinId, symbol, name, alertPrice, notes } = body

    if (!coinId || !symbol || !name) {
      return NextResponse.json(
        { error: 'Coin ID, symbol, and name are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      userId: authResult.userId,
      coinId
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu coin zaten watchlist\'inizde' },
        { status: 400 }
      )
    }

    // Create new watchlist item
    const watchlistItem = await Watchlist.create({
      userId: authResult.userId,
      coinId,
      symbol: symbol.toUpperCase(),
      name,
      alertPrice,
      notes,
      addedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      item: watchlistItem
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}
