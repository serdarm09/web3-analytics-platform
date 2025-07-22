'use client'

import { useQuery } from '@tanstack/react-query'

interface MarketData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
  sparkline_in_7d?: {
    price: number[]
  }
}

interface TrendingCoin {
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

interface GlobalData {
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

export function useMarketData(
  page = 1,
  perPage = 100,
  currency = 'usd',
  sparkline = false
) {
  const { data: marketData, isLoading, error } = useQuery<MarketData[]>({
    queryKey: ['market-data', page, perPage, currency, sparkline],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        vs_currency: currency,
        sparkline: sparkline.toString()
      })
      
      const response = await fetch(`/api/market-data?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }
      
      return response.json()
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000
  })

  return {
    marketData,
    isLoading,
    error
  }
}

export function useCoinDetails(coinId: string) {
  const { data: coinDetails, isLoading, error } = useQuery({
    queryKey: ['coin-details', coinId],
    queryFn: async () => {
      const response = await fetch(`/api/market-data/coins/${coinId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch coin details')
      }
      
      return response.json()
    },
    enabled: !!coinId,
    staleTime: 30 * 1000
  })

  return {
    coinDetails,
    isLoading,
    error
  }
}

export function useTrendingCoins() {
  const { data: trending, isLoading, error } = useQuery<TrendingCoin[]>({
    queryKey: ['trending-coins'],
    queryFn: async () => {
      const response = await fetch('/api/market-data/trending')
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins')
      }
      
      const data = await response.json()
      return data.coins
    },
    staleTime: 5 * 60 * 1000
  })

  return {
    trending,
    isLoading,
    error
  }
}

export function useGlobalMarketData() {
  const { data: globalData, isLoading, error } = useQuery<GlobalData>({
    queryKey: ['global-market-data'],
    queryFn: async () => {
      const response = await fetch('/api/market-data/global')
      
      if (!response.ok) {
        throw new Error('Failed to fetch global market data')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000
  })

  return {
    globalData,
    isLoading,
    error
  }
}

export function usePriceHistory(
  coinId: string,
  days: number = 7,
  interval?: 'daily' | 'hourly'
) {
  const { data: priceHistory, isLoading, error } = useQuery({
    queryKey: ['price-history', coinId, days, interval],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: days.toString(),
        ...(interval && { interval })
      })
      
      const response = await fetch(`/api/market-data/coins/${coinId}/history?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch price history')
      }
      
      return response.json()
    },
    enabled: !!coinId,
    staleTime: 5 * 60 * 1000
  })

  return {
    priceHistory,
    isLoading,
    error
  }
}