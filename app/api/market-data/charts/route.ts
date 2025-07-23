import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// En popüler 100 coin'in geçmiş fiyat verilerini al
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '30'
    const vs_currency = searchParams.get('vs_currency') || 'usd'
    
    // Bitcoin, Ethereum ve diğer major coinlerin ID'leri
    const coinIds = [
      'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 
      'polkadot', 'avalanche-2', 'chainlink', 'polygon', 'cosmos'
    ]

    const promises = coinIds.map(async (coinId) => {
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=${vs_currency}&days=${days}&interval=daily`,
        {
          headers: {
            'accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error(`Failed to fetch data for ${coinId}:`, response.status)
        return null
      }

      const data = await response.json()
      
      return {
        id: coinId,
        prices: data.prices?.map(([timestamp, price]: [number, number]) => ({
          date: new Date(timestamp).toISOString().split('T')[0],
          price: price
        })) || [],
        market_caps: data.market_caps?.map(([timestamp, cap]: [number, number]) => ({
          date: new Date(timestamp).toISOString().split('T')[0],
          market_cap: cap
        })) || [],
        total_volumes: data.total_volumes?.map(([timestamp, volume]: [number, number]) => ({
          date: new Date(timestamp).toISOString().split('T')[0],
          volume: volume
        })) || []
      }
    })

    const results = await Promise.all(promises)
    const validResults = results.filter(result => result !== null)

    return NextResponse.json({
      success: true,
      data: validResults,
      metadata: {
        coins_fetched: validResults.length,
        days: days,
        vs_currency: vs_currency
      }
    })

  } catch (error) {
    console.error('Error fetching market charts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market chart data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
