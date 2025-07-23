'use client'

import { useState, useEffect, useCallback } from 'react'
import { coinGeckoService, type CoinPrice, type TrendingCoin, type GlobalMarketData } from '@/lib/services/coinGeckoService'
import { toast } from 'sonner'

export interface MarketDataState {
  coins: CoinPrice[]
  trending: TrendingCoin[]
  global: GlobalMarketData | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useMarketData(
  perPage: number = 50,
  autoRefresh: boolean = true,
  refreshInterval: number = 60000 // 1 minute
) {
  const [data, setData] = useState<MarketDataState>({
    coins: [],
    trending: [],
    global: null,
    loading: true,
    error: null,
    lastUpdated: null
  })

  const fetchMarketData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Fetch all data in parallel
      const [coinsData, trendingData, globalData] = await Promise.allSettled([
        coinGeckoService.getCoinsList('usd', perPage, 1, false, '24h,7d'),
        coinGeckoService.getTrendingCoins(),
        coinGeckoService.getGlobalMarketData()
      ])

      const newData: Partial<MarketDataState> = {
        loading: false,
        lastUpdated: new Date()
      }

      if (coinsData.status === 'fulfilled') {
        newData.coins = coinsData.value
      } else {
        console.error('Failed to fetch coins data:', coinsData.reason)
      }

      if (trendingData.status === 'fulfilled') {
        newData.trending = trendingData.value
      } else {
        console.error('Failed to fetch trending data:', trendingData.reason)
      }

      if (globalData.status === 'fulfilled') {
        newData.global = globalData.value
      } else {
        console.error('Failed to fetch global data:', globalData.reason)
      }

      setData(prev => ({ ...prev, ...newData }))

    } catch (error) {
      console.error('Market data fetch error:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market data'
      }))
      toast.error('Failed to fetch market data')
    }
  }, [perPage])

  const refreshData = useCallback(() => {
    fetchMarketData()
  }, [fetchMarketData])

  useEffect(() => {
    fetchMarketData()
  }, [fetchMarketData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchMarketData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchMarketData])

  return {
    ...data,
    refresh: refreshData,
    isLoading: data.loading
  }
}

// Hook for getting specific coin data
export function useCoinData(coinId: string) {
  const [coin, setCoin] = useState<CoinPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoin = useCallback(async () => {
    if (!coinId) return

    try {
      setLoading(true)
      setError(null)
      
      const coinData = await coinGeckoService.getCoinDetails(coinId)
      setCoin(coinData as CoinPrice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coin data')
      toast.error('Failed to fetch coin data')
    } finally {
      setLoading(false)
    }
  }, [coinId])

  useEffect(() => {
    fetchCoin()
  }, [fetchCoin])

  return { coin, loading, error, refresh: fetchCoin }
}

// Hook for searching coins
export function useCoinSearch() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await coinGeckoService.searchCoins(query)
      setResults(searchResults.coins || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}

// Hook for portfolio price data
export function usePortfolioPrices(coinSymbols: string[]) {
  const [prices, setPrices] = useState<{ [symbol: string]: CoinPrice | null }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    if (!coinSymbols.length) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const pricesData = await coinGeckoService.getPortfolioPrices(coinSymbols)
      setPrices(pricesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
      toast.error('Failed to fetch portfolio prices')
    } finally {
      setLoading(false)
    }
  }, [coinSymbols])

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  return { prices, loading, error, refresh: fetchPrices }
}

// Hook for price history/charts
export function usePriceHistory(coinId: string, days: number = 7) {
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!coinId) return

    try {
      setLoading(true)
      setError(null)
      
      const historyData = await coinGeckoService.getHistoricalData(coinId, 'usd', days)
      setHistory(historyData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price history')
    } finally {
      setLoading(false)
    }
  }, [coinId, days])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refresh: fetchHistory }
}

// Utility functions
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return coinGeckoService.formatPrice(price, currency)
}

export const formatPercentage = (percentage: number): string => {
  return coinGeckoService.formatPercentage(percentage)
}

export const formatMarketCap = (value: number): string => {
  return coinGeckoService.formatMarketCap(value)
}
