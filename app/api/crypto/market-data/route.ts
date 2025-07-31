import { NextRequest, NextResponse } from 'next/server'

// Static mapping for common coins
const SYMBOL_TO_ID_MAP: Record<string, string> = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'xrp': 'ripple',
  'ada': 'cardano',
  'avax': 'avalanche-2',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'matic': 'matic-network',
  'shib': 'shiba-inu',
  'trx': 'tron',
  'link': 'chainlink',
  'uni': 'uniswap',
  'atom': 'cosmos',
  'ltc': 'litecoin',
  'etc': 'ethereum-classic',
  'xlm': 'stellar',
  'near': 'near',
  'algo': 'algorand',
  'usdt': 'tether',
  'usdc': 'usd-coin',
  'dai': 'dai',
  'busd': 'binance-usd',
  'mnt': 'mantle',
  'arb': 'arbitrum',
  'op': 'optimism',
  'grt': 'the-graph',
  'aave': 'aave',
  'mkr': 'maker',
  'comp': 'compound-governance-token',
  'sushi': 'sushi',
  '1inch': '1inch',
  'crv': 'curve-dao-token',
  'ldo': 'lido-dao'
}

// Rate limiting
const RATE_LIMIT_DELAY = 1200
let lastCallTime = 0

const rateLimit = () => {
  const now = Date.now()
  const timeSinceLastCall = now - lastCallTime
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    return new Promise(resolve => {
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall)
    })
  }
  lastCallTime = now
  return Promise.resolve()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')
    
    if (!symbolsParam) {
      return NextResponse.json({ 
        success: false, 
        error: 'symbols parameter is required' 
      }, { status: 400 })
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toLowerCase())
    console.log('🔍 API Debug - Requested symbols:', symbolsParam)

    if (symbols.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      })
    }

    await rateLimit()

    // Map symbols to CoinGecko IDs
    const validIds = symbols
      .map(symbol => SYMBOL_TO_ID_MAP[symbol])
      .filter(Boolean)

    if (validIds.length === 0) {
      console.log('⚠️ No supported symbols found in:', symbols)
      return NextResponse.json({ 
        success: true, 
        data: [] 
      })
    }

    const idsString = validIds.join(',')
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch price data' 
      }, { status: response.status })
    }

    const priceData = await response.json()

    // Map back to symbols
    const results = symbols.map(symbol => {
      const coinId = SYMBOL_TO_ID_MAP[symbol]
      const data = coinId ? priceData[coinId] : null
      
      return {
        symbol: symbol.toUpperCase(),
        price: data?.usd || 0,
        change24h: data?.usd_24h_change || 0
      }
    }).filter(item => item.price > 0)

    console.log('🔍 API Debug - Results:', results.map(r => `${r.symbol}: $${r.price}`).join(', '))

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Market data API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
