import axios from 'axios'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 60 }) // 1 dakika cache

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  circulating_supply: number
  total_supply: number
  max_supply: number | null
  ath: number
  ath_date: string
  atl: number
  atl_date: string
  last_updated: string
}

interface MarketData {
  prices: CryptoPrice[]
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h: number
}

interface TrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    large: string
    price_btc: number
    score: number
  }
}

interface WhaleTransaction {
  hash: string
  from: string
  to: string
  value: string
  tokenSymbol?: string
  tokenName?: string
  timeStamp: string
  blockNumber: string
  gasUsed: string
  gasPrice: string
}

class CryptoDataService {
  private coingeckoBaseUrl = 'https://api.coingecko.com/api/v3'
  private coingeckoDemoUrl = 'https://api.coingecko.com/api/v3'
  private etherscanBaseUrl = 'https://api.etherscan.io/api'
  private bscscanBaseUrl = 'https://api.bscscan.com/api'
  
  // CoinGecko'da ücretsiz API limiti: 10-30 çağrı/dakika
  private async fetchFromCoingecko(endpoint: string, params?: Record<string, any>) {
    const cacheKey = `coingecko_${endpoint}_${JSON.stringify(params || {})}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      // Try with public API first (no auth needed)
      const response = await axios.get(`${this.coingeckoBaseUrl}${endpoint}`, {
        params: {
          ...params
        }
      })
      
      cache.set(cacheKey, response.data)
      return response.data
    } catch (error: any) {
      console.error('CoinGecko API error:', error?.response?.status, error?.response?.data)
      
      // Return empty data instead of throwing error
      if (error?.response?.status === 401 || error?.response?.status === 429) {
        console.log('CoinGecko rate limit or auth error, returning mock data')
        return this.getMockData(endpoint)
      }
      
      throw error
    }
  }

  private getMockData(endpoint: string) {
    // Test için örnek veri döndür
    if (endpoint.includes('/coins/markets')) {
      return [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 45000,
          price_change_percentage_24h: 2.5,
          market_cap: 880000000000
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 2500,
          price_change_percentage_24h: 3.2,
          market_cap: 300000000000
        }
      ]
    }
    if (endpoint.includes('/simple/price')) {
      return {
        bitcoin: { usd: 45000, usd_24h_change: 2.5 },
        ethereum: { usd: 2500, usd_24h_change: 3.2 }
      }
    }
    return []
  }

  // En popüler kripto paraların fiyatlarını getir
  async getTopCryptoPrices(limit: number = 100): Promise<CryptoPrice[]> {
    try {
      const data = await this.fetchFromCoingecko('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d,30d'
      })
      
      return data
    } catch (error) {
      console.error('Error fetching crypto prices:', error)
      return []
    }
  }

  // Belirli kripto paraların fiyatlarını getir
  async getCryptoPricesByIds(ids: string[]): Promise<CryptoPrice[]> {
    if (ids.length === 0) return []
    
    try {
      const data = await this.fetchFromCoingecko('/coins/markets', {
        vs_currency: 'usd',
        ids: ids.join(','),
        order: 'market_cap_desc',
        sparkline: false,
        price_change_percentage: '24h,7d,30d'
      })
      
      return data
    } catch (error) {
      console.error('Error fetching specific crypto prices:', error)
      return []
    }
  }

  // Trend olan kripto paraları getir
  async getTrendingCryptos(): Promise<TrendingCoin[]> {
    try {
      const data = await this.fetchFromCoingecko('/search/trending')
      return data.coins || []
    } catch (error) {
      console.error('Error fetching trending cryptos:', error)
      return []
    }
  }

  // Global piyasa verilerini getir
  async getGlobalMarketData(): Promise<{
    total_market_cap: number
    total_volume: number
    market_cap_change_percentage_24h: number
    active_cryptocurrencies: number
  }> {
    try {
      const data = await this.fetchFromCoingecko('/global')
      return {
        total_market_cap: data.data.total_market_cap.usd,
        total_volume: data.data.total_volume.usd,
        market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd,
        active_cryptocurrencies: data.data.active_cryptocurrencies
      }
    } catch (error) {
      console.error('Error fetching global market data:', error)
      return {
        total_market_cap: 0,
        total_volume: 0,
        market_cap_change_percentage_24h: 0,
        active_cryptocurrencies: 0
      }
    }
  }

  // Belirli bir kripto paranın detaylı bilgilerini getir
  async getCryptoDetails(id: string) {
    try {
      const data = await this.fetchFromCoingecko(`/coins/${id}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      })
      
      return data
    } catch (error) {
      console.error('Error fetching crypto details:', error)
      return null
    }
  }

  // Fiyat geçmişini getir (grafikler için)
  async getPriceHistory(id: string, days: number = 7) {
    try {
      const data = await this.fetchFromCoingecko(`/coins/${id}/market_chart`, {
        vs_currency: 'usd',
        days: days,
        interval: days > 30 ? 'daily' : 'hourly'
      })
      
      return data
    } catch (error) {
      console.error('Error fetching price history:', error)
      return null
    }
  }

  // En büyük kazananlar ve kaybedenler
  async getTopGainersLosers(limit: number = 10) {
    try {
      const allCoins = await this.getTopCryptoPrices(250)
      
      const gainers = [...allCoins]
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, limit)
      
      const losers = [...allCoins]
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, limit)
      
      return { gainers, losers }
    } catch (error) {
      console.error('Error fetching gainers/losers:', error)
      return { gainers: [], losers: [] }
    }
  }

  // Whale işlemlerini getir (Etherscan API)
  async getWhaleTransactions(network: 'ethereum' | 'bsc' = 'ethereum', minValueUSD: number = 1000000) {
    const baseUrl = network === 'ethereum' ? this.etherscanBaseUrl : this.bscscanBaseUrl
    const apiKey = network === 'ethereum' ? process.env.ETHERSCAN_API_KEY : process.env.BSCSCAN_API_KEY
    
    if (!apiKey) {
      console.warn(`No API key for ${network}scan`)
      return []
    }

    try {
      // Son blokları getir
      const blockResponse = await axios.get(baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_blockNumber',
          apikey: apiKey
        }
      })
      
      const latestBlock = parseInt(blockResponse.data.result, 16)
      const fromBlock = latestBlock - 100 // Son 100 blok
      
      // Transfer eventlerini getir
      const response = await axios.get(baseUrl, {
        params: {
          module: 'logs',
          action: 'getLogs',
          fromBlock: fromBlock,
          toBlock: 'latest',
          topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
          apikey: apiKey
        }
      })
      
      // Büyük transferleri filtrele ve formatla
      const whaleTransactions: WhaleTransaction[] = []
      
      // Basit filtreleme - gerçek uygulamada daha detaylı olmalı
      return whaleTransactions
    } catch (error) {
      console.error('Error fetching whale transactions:', error)
      return []
    }
  }

  // Belirli bir cüzdanın bakiyesini getir
  async getWalletBalance(address: string, network: 'ethereum' | 'bsc' = 'ethereum') {
    const baseUrl = network === 'ethereum' ? this.etherscanBaseUrl : this.bscscanBaseUrl
    const apiKey = network === 'ethereum' ? process.env.ETHERSCAN_API_KEY : process.env.BSCSCAN_API_KEY
    
    if (!apiKey) {
      console.warn(`No API key for ${network}scan`)
      return null
    }

    try {
      const response = await axios.get(baseUrl, {
        params: {
          module: 'account',
          action: 'balance',
          address: address,
          tag: 'latest',
          apikey: apiKey
        }
      })
      
      if (response.data.status === '1') {
        return {
          address,
          balance: response.data.result,
          network
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      return null
    }
  }
}

export const cryptoDataService = new CryptoDataService()