import { toast } from "sonner"

// CoinGecko API base URL
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Rate limiting - CoinGecko allows 10-50 calls per minute
const RATE_LIMIT_DELAY = 1200 // 1.2 seconds between calls

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

export interface CoinPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  image: string
  last_updated: string
}

export interface CoinDetails extends CoinPrice {
  description: {
    en: string
  }
  links: {
    homepage: string[]
    blockchain_site: string[]
    official_forum_url: string[]
    twitter_screen_name: string
    telegram_channel_identifier: string
  }
  market_data: {
    current_price: { [key: string]: number }
    market_cap: { [key: string]: number }
    total_volume: { [key: string]: number }
    high_24h: { [key: string]: number }
    low_24h: { [key: string]: number }
    price_change_24h: number
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    market_cap_rank: number
    circulating_supply: number
    total_supply: number
    max_supply: number
    ath: { [key: string]: number }
    atl: { [key: string]: number }
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

export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number
    upcoming_icos: number
    ongoing_icos: number
    ended_icos: number
    markets: number
    total_market_cap: { [key: string]: number }
    total_volume: { [key: string]: number }
    market_cap_percentage: { [key: string]: number }
    market_cap_change_percentage_24h_usd: number
    updated_at: number
  }
}

export interface HistoricalPrice {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

class CoinGeckoService {
  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await rateLimit()
    
    try {
      let url: URL
      
      // Check if we're in the browser
      if (typeof window !== 'undefined') {
        // Use our proxy endpoint for browser requests
        url = new URL('/api/crypto/coingecko', window.location.origin)
        url.searchParams.append('endpoint', endpoint)
        
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value))
            }
          })
        }
      } else {
        // Direct API call for server-side requests
        url = new URL(`${COINGECKO_API_BASE}${endpoint}`)
        
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value))
            }
          })
        }
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        throw new Error(`API error: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('CoinGecko API Error:', error)
      throw error
    }
  }

  // Get simple price for multiple coins
  async getSimplePrices(
    coinIds: string[], 
    vsCurrencies: string[] = ['usd'], 
    includeChange: boolean = true
  ): Promise<{ [key: string]: { [key: string]: number } }> {
    const params = {
      ids: coinIds.join(','),
      vs_currencies: vsCurrencies.join(','),
      include_24hr_change: includeChange ? 'true' : 'false',
      include_market_cap: 'true',
      include_24hr_vol: 'true',
      include_last_updated_at: 'true'
    }

    return this.makeRequest('/simple/price', params)
  }

  // Get coin list with market data
  async getCoinsList(
    vsCurrency: string = 'usd',
    perPage: number = 100,
    page: number = 1,
    sparkline: boolean = false,
    priceChangePercentage: string = '24h'
  ): Promise<CoinPrice[]> {
    const params = {
      vs_currency: vsCurrency,
      order: 'market_cap_desc',
      per_page: perPage,
      page: page,
      sparkline: sparkline ? 'true' : 'false',
      price_change_percentage: priceChangePercentage
    }

    return this.makeRequest('/coins/markets', params)
  }

  // Get specific coin details
  async getCoinDetails(
    coinId: string,
    localization: boolean = false,
    tickers: boolean = false,
    marketData: boolean = true,
    communityData: boolean = false,
    developerData: boolean = false,
    sparkline: boolean = false
  ): Promise<CoinDetails> {
    const params = {
      localization: localization ? 'true' : 'false',
      tickers: tickers ? 'true' : 'false',
      market_data: marketData ? 'true' : 'false',
      community_data: communityData ? 'true' : 'false',
      developer_data: developerData ? 'true' : 'false',
      sparkline: sparkline ? 'true' : 'false'
    }

    return this.makeRequest(`/coins/${coinId}`, params)
  }

  // Get trending coins
  async getTrendingCoins(): Promise<TrendingCoin[]> {
    const response = await this.makeRequest<{ coins: TrendingCoin[] }>('/search/trending')
    return response.coins
  }

  // Get global market data
  async getGlobalMarketData(): Promise<GlobalMarketData> {
    return this.makeRequest('/global')
  }

  // Get historical market data
  async getHistoricalData(
    coinId: string,
    vsCurrency: string = 'usd',
    days: number = 7,
    interval?: string
  ): Promise<HistoricalPrice> {
    const params = {
      vs_currency: vsCurrency,
      days: days.toString(),
      interval: interval
    }

    return this.makeRequest(`/coins/${coinId}/market_chart`, params)
  }

  // Search coins
  async searchCoins(query: string): Promise<{
    coins: Array<{
      id: string
      name: string
      symbol: string
      market_cap_rank: number
      thumb: string
      large: string
    }>
  }> {
    const params = { query }
    return this.makeRequest('/search', params)
  }

  // Get supported currencies
  async getSupportedCurrencies(): Promise<string[]> {
    return this.makeRequest('/simple/supported_vs_currencies')
  }

  // Helper function to format price
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price)
  }

  // Helper function to format percentage
  formatPercentage(percentage: number): string {
    const formatted = Math.abs(percentage).toFixed(2)
    const sign = percentage >= 0 ? '+' : '-'
    return `${sign}${formatted}%`
  }

  // Helper function to format large numbers
  formatMarketCap(value: number): string {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  // Get coin ID by symbol (useful for portfolio)
  async getCoinIdBySymbol(symbol: string): Promise<string | null> {
    try {
      const searchResult = await this.searchCoins(symbol)
      const exactMatch = searchResult.coins.find(
        coin => coin.symbol.toLowerCase() === symbol.toLowerCase()
      )
      return exactMatch ? exactMatch.id : null
    } catch (error) {
      console.error('Error getting coin ID:', error)
      return null
    }
  }

  // Batch get prices for portfolio
  async getPortfolioPrices(coinSymbols: string[]): Promise<{ [symbol: string]: CoinPrice | null }> {
    try {
      const coinIds: string[] = []
      const symbolToIdMap: { [symbol: string]: string } = {}

      // Get coin IDs for symbols
      for (const symbol of coinSymbols) {
        const coinId = await this.getCoinIdBySymbol(symbol)
        if (coinId) {
          coinIds.push(coinId)
          symbolToIdMap[symbol.toLowerCase()] = coinId
        }
      }

      if (coinIds.length === 0) {
        return {}
      }

      // Get market data for all coins
      const coinsData = await this.getCoinsList('usd', coinIds.length, 1, false, '24h,7d')
      
      const result: { [symbol: string]: CoinPrice | null } = {}
      
      coinSymbols.forEach(symbol => {
        const coinId = symbolToIdMap[symbol.toLowerCase()]
        if (coinId) {
          const coinData = coinsData.find(coin => coin.id === coinId)
          result[symbol] = coinData || null
        } else {
          result[symbol] = null
        }
      })

      return result
    } catch (error) {
      console.error('Error getting portfolio prices:', error)
      toast.error('Failed to fetch portfolio prices')
      return {}
    }
  }
}

export const coinGeckoService = new CoinGeckoService()
export default coinGeckoService
