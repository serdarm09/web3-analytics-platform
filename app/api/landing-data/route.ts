import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import TrendingCoin from '@/models/TrendingCoin'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET() {
  try {
    await dbConnect()

    // Fetch top gainers from CoinGecko
    const gainersResponse = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=percent_change_24h&per_page=6&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    // Fetch new listings from CoinGecko
    const newListingsResponse = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        next: { revalidate: 300 }
      }
    )

    let topGainers = []
    let newListings = []

    if (gainersResponse.ok) {
      const gainersData = await gainersResponse.json()
      // Sort by price change percentage and get top 3 gainers
      topGainers = gainersData
        .sort((a: any, b: any) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 3)
        .map((coin: any) => ({
          symbol: coin.symbol,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0
        }))
    }

    if (newListingsResponse.ok) {
      const listingsData = await newListingsResponse.json()
      // Get coins with lowest market cap rank (newer coins typically have higher ranks)
      newListings = listingsData
        .sort((a: any, b: any) => b.market_cap_rank - a.market_cap_rank)
        .slice(0, 3)
        .map((coin: any) => ({
          symbol: coin.symbol,
          current_price: coin.current_price || 0
        }))
    }

    // Get trending from database (already real data)
    const trending = await TrendingCoin.find({ isActive: true })
      .sort({ trendingScore: -1 })
      .limit(3)
      .select('symbol marketCapRank')
      .lean()

    return NextResponse.json({
      topGainers,
      trending: trending.map(coin => ({
        symbol: coin.symbol,
        marketCapRank: coin.marketCapRank
      })),
      newListings
    })
  } catch (error) {
    console.error('Error fetching landing data:', error)
    // Return empty arrays on error
    return NextResponse.json({
      topGainers: [],
      trending: [],
      newListings: []
    })
  }
}