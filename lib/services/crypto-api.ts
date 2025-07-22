// CoinGecko API service for real-time crypto data

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_24h: number
  price_change_percentage_24h: number
  volume_24h: number
  high_24h: number
  low_24h: number
  image: string
  last_updated: string
}

export interface CryptoDetail {
  id: string
  symbol: string
  name: string
  description: { en: string }
  links: {
    homepage: string[]
    blockchain_site: string[]
    twitter_screen_name: string
    telegram_channel_identifier: string
  }
  image: {
    thumb: string
    small: string
    large: string
  }
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    total_volume: { usd: number }
    high_24h: { usd: number }
    low_24h: { usd: number }
    price_change_24h: number
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    circulating_supply: number
    total_supply: number
    max_supply: number
  }
}

export interface TrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    small: string
    large: string
    slug: string
    price_btc: number
    score: number
  }
}

// Fetch top cryptocurrencies
export async function getTopCryptos(limit: number = 100): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&locale=en`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching top cryptos:', error)
    return []
  }
}

// Get specific crypto details
export async function getCryptoDetails(id: string): Promise<CryptoDetail | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto details')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching crypto details:', error)
    return null
  }
}

// Get trending cryptocurrencies
export async function getTrendingCryptos(): Promise<TrendingCoin[]> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/search/trending`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending data')
    }
    
    const data = await response.json()
    return data.coins || []
  } catch (error) {
    console.error('Error fetching trending cryptos:', error)
    return []
  }
}

// Get crypto price history
export async function getCryptoPriceHistory(
  id: string,
  days: number = 7
): Promise<{ prices: [number, number][] }> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch price history')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching price history:', error)
    return { prices: [] }
  }
}

// Search cryptocurrencies
export async function searchCryptos(query: string): Promise<any[]> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error('Failed to search cryptos')
    }
    
    const data = await response.json()
    return data.coins || []
  } catch (error) {
    console.error('Error searching cryptos:', error)
    return []
  }
}

// Get global crypto market data
export async function getGlobalMarketData() {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/global`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch global market data')
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching global market data:', error)
    return null
  }
}

// Get multiple crypto prices
export async function getCryptoPrices(ids: string[]): Promise<Record<string, any>> {
  try {
    const idsString = ids.join(',')
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${idsString}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return {}
  }
}