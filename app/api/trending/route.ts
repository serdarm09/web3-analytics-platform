import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import TrendingCoin from '@/models/TrendingCoin'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || 'all'
    
    // Build query
    const query: any = {}
    if (category !== 'all') {
      query.category = category
    }
    
    // Get trending coins from database
    const trendingCoins = await TrendingCoin
      .find(query)
      .sort({ trendingScore: -1 })
      .limit(limit)
      .lean()
    
    return NextResponse.json({
      success: true,
      data: trendingCoins,
      count: trendingCoins.length
    })
  } catch (error) {
    console.error('Error fetching trending data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    )
  }
}

// POST endpoint to sync trending data from external sources
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Fetch trending data from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_URL}/search/trending`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    const trendingCoins = data.coins || []
    
    // Fetch additional price data for trending coins
    const coinIds = trendingCoins.map((coin: any) => coin.item.id).join(',')
    const priceResponse = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        }
      }
    )
    
    const priceData = await priceResponse.json()
    
    // Update or create trending coins in database
    const updatePromises = trendingCoins.map(async (coin: any, index: number) => {
      const coinItem = coin.item
      const priceInfo = priceData[coinItem.id] || {}
      
      // Determine category based on coin data
      let category = 'Other'
      if (coinItem.name.toLowerCase().includes('meme') || coinItem.symbol.toLowerCase().includes('doge') || coinItem.symbol.toLowerCase().includes('shib')) {
        category = 'Meme'
      } else if (coinItem.name.toLowerCase().includes('defi') || coinItem.name.toLowerCase().includes('finance')) {
        category = 'DeFi'
      } else if (coinItem.name.toLowerCase().includes('game') || coinItem.name.toLowerCase().includes('gaming')) {
        category = 'Gaming'
      } else if (coinItem.name.toLowerCase().includes('ai') || coinItem.name.toLowerCase().includes('artificial')) {
        category = 'AI'
      } else if (coinItem.market_cap_rank && coinItem.market_cap_rank <= 20) {
        category = 'Layer1'
      }
      
      const trendingData = {
        coinId: coinItem.id,
        name: coinItem.name,
        symbol: coinItem.symbol.toUpperCase(),
        thumb: coinItem.thumb,
        marketCapRank: coinItem.market_cap_rank || 9999,
        price: priceInfo.usd || 0,
        priceChange24h: priceInfo.usd_24h_change || 0,
        volume24h: priceInfo.usd_24h_vol || 0,
        trendingScore: 100 - (index * 2), // Higher score for higher ranking
        socialMentions: Math.floor(Math.random() * 10000) + 1000, // Mock data
        searchVolume: Math.floor(Math.random() * 50000) + 5000, // Mock data
        category: category,
        lastUpdated: new Date()
      }
      
      return TrendingCoin.findOneAndUpdate(
        { coinId: coinItem.id },
        trendingData,
        { upsert: true, new: true }
      )
    })
    
    const updatedCoins = await Promise.all(updatePromises)
    
    return NextResponse.json({
      success: true,
      message: 'Trending data synced successfully',
      data: updatedCoins,
      count: updatedCoins.length
    })
  } catch (error) {
    console.error('Error syncing trending data:', error)
    return NextResponse.json(
      { error: 'Failed to sync trending data' },
      { status: 500 }
    )
  }
}
