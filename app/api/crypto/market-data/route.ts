import { NextRequest, NextResponse } from 'next/server'

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Cache for market data
let marketDataCache: any = {}
let cacheTimestamp = 0
const CACHE_DURATION = 300000 // 5 minutes for price data to reduce API calls

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.toLowerCase() || ''
    
    if (!symbols) {
      return NextResponse.json({
        success: false,
        error: 'Symbols parameter is required'
      }, { status: 400 })
    }

    const symbolList = symbols.split(',').map(s => s.trim())
    const now = Date.now()
    
    // Check if we need to refresh cache
    if (now - cacheTimestamp > CACHE_DURATION) {
      marketDataCache = {}
      cacheTimestamp = now
    }

    // Find which symbols need fresh data
    const uncachedSymbols = symbolList.filter(symbol => !marketDataCache[symbol])
    
    if (uncachedSymbols.length > 0) {
      try {
        // Get top 250 coins by market cap
        const response = await fetch(
          `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
        )
        
        if (response.ok) {
          const coins = await response.json()
          
          // Cache the data
          coins.forEach((coin: any) => {
            marketDataCache[coin.symbol.toLowerCase()] = {
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              price: coin.current_price || 0,
              change24h: coin.price_change_percentage_24h || 0,
              marketCap: coin.market_cap || 0,
              volume24h: coin.total_volume || 0,
              image: coin.image,
              lastUpdated: new Date().toISOString()
            }
          })
        }
      } catch (error) {
        console.error('Error fetching market data:', error)
      }
    }

    // Return requested symbols data
    const results = symbolList.map(symbol => {
      return marketDataCache[symbol] || {
        id: symbol,
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: 0,
        change24h: 0,
        marketCap: 0,
        volume24h: 0,
        notFound: true
      }
    })

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in market data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch market data' 
      },
      { status: 500 }
    )
  }
}