import { NextRequest, NextResponse } from 'next/server'

// CoinGecko API base URL
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Cache for storing coin list and top coins
let coinListCache: any[] = []
let topCoinsCache: any[] = []
let cacheTimestamp = 0
let topCoinsCacheTimestamp = 0
const CACHE_DURATION = 3600000 // 1 hour for coin list
const TOP_COINS_CACHE_DURATION = 300000 // 5 minutes for top coins

// Fetch and cache top coins by market cap
async function fetchTopCoins() {
  try {
    const now = Date.now()
    
    // Check if cache is still valid
    if (topCoinsCache.length > 0 && now - topCoinsCacheTimestamp < TOP_COINS_CACHE_DURATION) {
      return topCoinsCache
    }

    // Fetch top 500 coins by market cap
    const responses = await Promise.all([
      fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`),
      fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2&sparkline=false`)
    ])

    const [page1, page2] = await Promise.all(responses.map(r => r.ok ? r.json() : []))
    
    topCoinsCache = [...page1, ...page2].map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_percentage_24h: coin.price_change_percentage_24h
    }))
    
    topCoinsCacheTimestamp = now
    return topCoinsCache
  } catch (error) {
    console.error('Error fetching top coins:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim() || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // If no query, return top coins
    if (!query || query.length < 1) {
      const topCoins = await fetchTopCoins()
      
      return NextResponse.json({
        success: true,
        data: topCoins.slice(0, limit).map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          marketCap: coin.market_cap || 0,
          logo: coin.image,
          rank: coin.market_cap_rank
        })),
        timestamp: new Date().toISOString()
      })
    }

    // First, search in top coins (faster and includes prices)
    const topCoins = await fetchTopCoins()
    let matchedCoins = topCoins.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query) ||
      coin.id.toLowerCase().includes(query)
    )

    // If we found matches in top coins, return them immediately
    if (matchedCoins.length >= 10) {
      return NextResponse.json({
        success: true,
        data: matchedCoins.slice(0, limit).map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          marketCap: coin.market_cap || 0,
          logo: coin.image,
          rank: coin.market_cap_rank
        })),
        timestamp: new Date().toISOString()
      })
    }

    // If not enough results, search in full coin list
    const now = Date.now()
    if (!coinListCache.length || now - cacheTimestamp > CACHE_DURATION) {
      try {
        const listResponse = await fetch(`${COINGECKO_API}/coins/list?include_platform=false`)
        if (listResponse.ok) {
          coinListCache = await listResponse.json()
          cacheTimestamp = now
          console.log(`Cached ${coinListCache.length} coins`)
        }
      } catch (error) {
        console.error('Error fetching coin list:', error)
      }
    }

    // Search in full coin list
    if (coinListCache.length > 0) {
      const additionalMatches = coinListCache.filter(coin => {
        // Skip if already in top coins results
        if (matchedCoins.some(mc => mc.id === coin.id)) return false
        
        return coin.name.toLowerCase().includes(query) ||
               coin.symbol.toLowerCase().includes(query) ||
               coin.id.toLowerCase().includes(query)
      }).slice(0, limit - matchedCoins.length)

      // Fetch prices for additional matches
      if (additionalMatches.length > 0) {
        const coinIds = additionalMatches.map(coin => coin.id).join(',')
        
        try {
          const priceResponse = await fetch(
            `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
          )
          
          if (priceResponse.ok) {
            const priceData = await priceResponse.json()
            
            additionalMatches.forEach(coin => {
              const data = priceData[coin.id] || {}
              matchedCoins.push({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                current_price: data.usd || 0,
                price_change_percentage_24h: data.usd_24h_change || 0,
                market_cap: data.usd_market_cap || 0,
                image: null,
                market_cap_rank: null
              })
            })
          }
        } catch (error) {
          console.error('Error fetching prices for additional matches:', error)
          // Add without prices if API fails
          additionalMatches.forEach(coin => {
            matchedCoins.push({
              id: coin.id,
              symbol: coin.symbol,
              name: coin.name,
              current_price: 0,
              price_change_percentage_24h: 0,
              market_cap: 0,
              image: null,
              market_cap_rank: null
            })
          })
        }
      }
    }

    // Return all matched coins
    return NextResponse.json({
      success: true,
      data: matchedCoins.slice(0, limit).map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap || 0,
        logo: coin.image,
        rank: coin.market_cap_rank
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in crypto search:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search cryptocurrencies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Search by exact symbol
export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const searchSymbol = symbol.toLowerCase().trim()

    // First check top coins
    const topCoins = await fetchTopCoins()
    const topCoin = topCoins.find(c => c.symbol.toLowerCase() === searchSymbol)
    
    if (topCoin) {
      return NextResponse.json({
        success: true,
        data: {
          id: topCoin.id,
          symbol: topCoin.symbol.toUpperCase(),
          name: topCoin.name,
          price: topCoin.current_price || 0,
          change24h: topCoin.price_change_percentage_24h || 0,
          logo: topCoin.image,
          marketCap: topCoin.market_cap || 0,
          rank: topCoin.market_cap_rank
        }
      })
    }

    // Check full coin list
    const now = Date.now()
    if (!coinListCache.length || now - cacheTimestamp > CACHE_DURATION) {
      try {
        const listResponse = await fetch(`${COINGECKO_API}/coins/list?include_platform=false`)
        if (listResponse.ok) {
          coinListCache = await listResponse.json()
          cacheTimestamp = now
        }
      } catch (error) {
        console.error('Error fetching coin list:', error)
      }
    }

    // Find coin by symbol
    const coin = coinListCache.find(c => c.symbol.toLowerCase() === searchSymbol)

    if (coin) {
      // Fetch price for this specific coin
      try {
        const priceResponse = await fetch(
          `${COINGECKO_API}/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
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
              change24h: data.usd_24h_change || 0,
              marketCap: data.usd_market_cap || 0
            }
          })
        }
      } catch (error) {
        console.error('Error fetching price:', error)
      }
    }

    // Allow custom entry for unknown symbols
    return NextResponse.json({
      success: true,
      data: {
        id: searchSymbol,
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: 0,
        change24h: 0,
        marketCap: 0,
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