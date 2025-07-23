import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

// Cache for coin list to avoid repeated API calls
let coinListCache: any[] = []
let cacheTimestamp = 0
const CACHE_DURATION = 3600000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')

    if (!symbols) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      )
    }

    const symbolList = symbols.split(',').map(s => s.trim().toLowerCase())

    // Refresh coin list cache if needed
    const now = Date.now()
    if (!coinListCache.length || now - cacheTimestamp > CACHE_DURATION) {
      try {
        const listResponse = await fetch(`${COINGECKO_API_URL}/coins/list`, {
          headers: {
            'Accept': 'application/json',
            ...(process.env.COINGECKO_API_KEY && {
              'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
            })
          }
        })
        
        if (listResponse.ok) {
          coinListCache = await listResponse.json()
          cacheTimestamp = now
        }
      } catch (error) {
        console.error('Error fetching coin list:', error)
      }
    }

    // Find coin IDs for the given symbols
    const coinIds: string[] = []
    const symbolToIdMap: Record<string, string> = {}

    symbolList.forEach(symbol => {
      const coin = coinListCache.find(c => 
        c.symbol.toLowerCase() === symbol.toLowerCase()
      )
      if (coin) {
        coinIds.push(coin.id)
        symbolToIdMap[symbol.toUpperCase()] = coin.id
      }
    })

    if (coinIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid coins found for given symbols',
        data: {}
      })
    }

    // Fetch prices for found coins
    const idsQuery = coinIds.join(',')
    const pricesResponse = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${idsQuery}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        next: { revalidate: 60 }
      }
    )

    if (!pricesResponse.ok) {
      throw new Error(`CoinGecko API error: ${pricesResponse.status}`)
    }

    const pricesData = await pricesResponse.json()

    // Transform to symbol-based format
    const result: Record<string, any> = {}
    
    Object.entries(symbolToIdMap).forEach(([symbol, coinId]) => {
      const coinData = pricesData[coinId]
      if (coinData) {
        result[symbol] = {
          symbol,
          price: coinData.usd || 0,
          change24h: coinData.usd_24h_change || 0,
          marketCap: coinData.usd_market_cap,
          volume24h: coinData.usd_24h_vol
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching prices by symbols:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch crypto prices',
        data: {}
      },
      { status: 500 }
    )
  }
}
