import { NextRequest, NextResponse } from 'next/server'

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Cache for storing coin list
let coinListCache: any[] = []
let cacheTimestamp = 0
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const symbols = searchParams.get('symbols')?.toLowerCase() || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    // Handle symbols parameter for bulk lookup
    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim())
      
      // Check cache
      const now = Date.now()
      if (!coinListCache.length || now - cacheTimestamp > CACHE_DURATION) {
        try {
          const listResponse = await fetch(`${COINGECKO_API}/coins/list`)
          if (listResponse.ok) {
            coinListCache = await listResponse.json()
            cacheTimestamp = now
          }
        } catch (error) {
          console.error('Error fetching coin list:', error)
        }
      }

      // Find matching coins
      const matchedCoins = symbolList.map(symbol => {
        return coinListCache.find(coin => 
          coin.symbol.toLowerCase() === symbol.toLowerCase()
        )
      }).filter(Boolean).slice(0, limit)

      if (matchedCoins.length > 0) {
        return NextResponse.json({
          success: true,
          data: matchedCoins.map(coin => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: 0, // Will be filled by price endpoint
            change24h: 0
          })),
          timestamp: new Date().toISOString()
        })
      }

      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      })
    }

    // If no query, return empty results
    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      })
    }

    // Check if we need to refresh the coin list cache
    const now = Date.now()
    if (!coinListCache.length || now - cacheTimestamp > CACHE_DURATION) {
      try {
        // Fetch coin list from CoinGecko
        const listResponse = await fetch(`${COINGECKO_API}/coins/list`)
        if (listResponse.ok) {
          coinListCache = await listResponse.json()
          cacheTimestamp = now
        }
      } catch (error) {
        console.error('Error fetching coin list:', error)
      }
    }

    // Search in cached coin list
    let matchedCoins = coinListCache.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query) ||
      coin.id.toLowerCase().includes(query)
    ).slice(0, limit)

    // If we have matches, fetch their current prices
    if (matchedCoins.length > 0) {
      const coinIds = matchedCoins.map(coin => coin.id).join(',')
      
      try {
        const priceResponse = await fetch(
          `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        )
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          
          // Combine coin info with price data
          const results = matchedCoins.map(coin => {
            const data = priceData[coin.id] || {}
            return {
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              price: data.usd || 0,
              change24h: data.usd_24h_change || 0,
              marketCap: data.usd_market_cap || 0,
              volume24h: data.usd_24h_vol || 0
            }
          }) // Don't filter out coins without price data - allow all coins
          
          return NextResponse.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error fetching prices:', error)
      }
    }

    // Fallback to mock data if API fails
    const FALLBACK_CRYPTOS = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67890.45, change24h: 2.34 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: -1.23 },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 567.89, change24h: 3.45 },
      { id: 'solana', symbol: 'SOL', name: 'Solana', price: 156.78, change24h: 5.67 },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.5678, change24h: -2.34 }
    ]

    const fallbackResults = FALLBACK_CRYPTOS.filter(crypto => 
      crypto.name.toLowerCase().includes(query) ||
      crypto.symbol.toLowerCase().includes(query)
    ).slice(0, limit)

    return NextResponse.json({
      success: true,
      data: fallbackResults,
      timestamp: new Date().toISOString(),
      fallback: true
    })

  } catch (error) {
    console.error('Error in crypto search:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search cryptocurrencies' 
      },
      { status: 500 }
    )
  }
}

// Endpoint to search by exact symbol
export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Try to find by symbol in cache first
    const now = Date.now()
    if (!coinListCache.length || now - cacheTimestamp > CACHE_DURATION) {
      try {
        const listResponse = await fetch(`${COINGECKO_API}/coins/list`)
        if (listResponse.ok) {
          coinListCache = await listResponse.json()
          cacheTimestamp = now
        }
      } catch (error) {
        console.error('Error fetching coin list:', error)
      }
    }

    // Find coin by symbol
    const coin = coinListCache.find(c => 
      c.symbol.toLowerCase() === symbol.toLowerCase()
    )

    if (coin) {
      // Fetch price for this specific coin
      try {
        const priceResponse = await fetch(
          `${COINGECKO_API}/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`
        )
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          const data = priceData[coin.id] || {}
          
          return NextResponse.json({
            success: true,
            data: {
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              price: data.usd || 0,
              change24h: data.usd_24h_change || 0
            }
          })
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      }
    }

    // If not found or API fails, allow custom entry
    return NextResponse.json({
      success: true,
      data: {
        id: symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: 0,
        change24h: 0,
        custom: true
      }
    })

  } catch (error) {
    console.error('Error in symbol search:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search by symbol' },
      { status: 500 }
    )
  }
}