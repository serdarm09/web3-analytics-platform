import axios from 'axios'

export interface MarketData {
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  change7d: number
  circulatingSupply: number
  totalSupply: number
}

export interface CoinData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  total_volume: number
  price_change_percentage_24h: number
  price_change_percentage_7d: number
  circulating_supply: number
  total_supply: number
}

// Popular crypto symbols to CoinGecko IDs mapping
const SYMBOL_TO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2',
  'DOGE': 'dogecoin',
  'TRX': 'tron',
  'LINK': 'chainlink',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'SHIB': 'shiba-inu',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'ATOM': 'cosmos',
  'XLM': 'stellar',
  'NEAR': 'near',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'AAVE': 'aave',
  'MKR': 'maker',
  'SNX': 'synthetix-network-token',
  'GRT': 'the-graph',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AXS': 'axie-infinity',
  'APE': 'apecoin',
  'CRV': 'curve-dao-token',
  'LDO': 'lido-dao',
  'QNT': 'quant-network',
  'FTM': 'fantom',
  'ALGO': 'algorand',
  'FIL': 'filecoin',
  'VET': 'vechain',
  'ICP': 'internet-computer',
  'HBAR': 'hedera',
  'FLOW': 'flow',
  'THETA': 'theta-token',
  'XTZ': 'tezos',
  'CHZ': 'chiliz',
  'CAKE': 'pancakeswap-token',
  'GALA': 'gala',
  'ENJ': 'enjincoin',
  'ZIL': 'zilliqa',
  'SUSHI': 'sushi',
  'COMP': 'compound-governance-token',
  'YFI': 'yearn-finance',
  'BAL': 'balancer',
  '1INCH': '1inch',
  'REN': 'republic-protocol',
  'OCEAN': 'ocean-protocol',
}

export async function fetchMarketData(symbols: string[]): Promise<Map<string, MarketData>> {
  const marketDataMap = new Map<string, MarketData>()
  
  try {
    // Convert symbols to CoinGecko IDs
    const ids = symbols
      .map(symbol => SYMBOL_TO_ID[symbol.toUpperCase()])
      .filter(Boolean)
    
    if (ids.length === 0) {
      console.log('No valid CoinGecko IDs found')
      return marketDataMap
    }

    // CoinGecko public API endpoint (no key required for basic data)
    const url = `https://api.coingecko.com/api/v3/coins/markets`
    const params = {
      vs_currency: 'usd',
      ids: ids.join(','),
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d'
    }

    const response = await axios.get<CoinData[]>(url, {
      params,
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    })

    // Map response to our format
    for (const coin of response.data) {
      const symbol = Object.entries(SYMBOL_TO_ID)
        .find(([_, id]) => id === coin.id)?.[0]
      
      if (symbol) {
        marketDataMap.set(symbol, {
          price: coin.current_price || 0,
          marketCap: coin.market_cap || 0,
          volume24h: coin.total_volume || 0,
          change24h: coin.price_change_percentage_24h || 0,
          change7d: coin.price_change_percentage_7d || 0,
          circulatingSupply: coin.circulating_supply || 0,
          totalSupply: coin.total_supply || 0
        })
      }
    }

    return marketDataMap
  } catch (error) {
    console.error('Error fetching market data:', error)
    // Return empty map on error
    return marketDataMap
  }
}

// Mock data fallback for development
export function getMockMarketData(symbol: string): MarketData {
  const basePrice = Math.random() * 1000 + 0.01
  const marketCap = basePrice * (Math.random() * 1000000000 + 1000000)
  
  return {
    price: basePrice,
    marketCap: marketCap,
    volume24h: marketCap * (Math.random() * 0.2 + 0.01),
    change24h: (Math.random() - 0.5) * 20,
    change7d: (Math.random() - 0.5) * 40,
    circulatingSupply: marketCap / basePrice,
    totalSupply: (marketCap / basePrice) * (Math.random() * 0.2 + 1)
  }
}