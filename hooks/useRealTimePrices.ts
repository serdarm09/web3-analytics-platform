import { useState, useEffect, useCallback } from 'react'

interface CoinPrice {
  symbol: string
  price: number
  change24h: number
  marketCap?: number
  volume24h?: number
}

interface UseRealTimePricesOptions {
  symbols: string[]
  refreshInterval?: number
  enabled?: boolean
}

export function useRealTimePrices({ 
  symbols, 
  refreshInterval = 60000, // 1 minute default
  enabled = true 
}: UseRealTimePricesOptions) {
  const [prices, setPrices] = useState<Record<string, CoinPrice>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchPrices = useCallback(async () => {
    if (!symbols.length || !enabled) return

    setLoading(true)
    setError(null)

    try {
      // First, get coin IDs for symbols
      const symbolsQuery = symbols.join(',')
      const searchResponse = await fetch(`/api/crypto/search?symbols=${symbolsQuery}`)
      const searchData = await searchResponse.json()

      if (!searchData.success) {
        throw new Error('Failed to get coin data')
      }

      // Map symbols to CoinGecko IDs
      const coinIds: string[] = []
      const symbolToIdMap: Record<string, string> = {}
      
      if (searchData.data && Array.isArray(searchData.data)) {
        searchData.data.forEach((coin: any) => {
          if (coin.id && coin.symbol) {
            coinIds.push(coin.id)
            symbolToIdMap[coin.symbol.toUpperCase()] = coin.id
          }
        })
      }

      if (coinIds.length === 0) {
        // Fallback: try to fetch prices by symbol directly
        const pricesResponse = await fetch(`/api/crypto/prices-by-symbols?symbols=${symbolsQuery}`)
        const pricesData = await pricesResponse.json()
        
        if (pricesData.success && pricesData.data) {
          setPrices(pricesData.data)
          setLastUpdate(new Date())
          return
        }
        
        throw new Error('No valid coin IDs found')
      }

      // Fetch prices using CoinGecko IDs
      const idsQuery = coinIds.join(',')
      const pricesResponse = await fetch(
        `/api/market-data/prices?ids=${idsQuery}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      )
      const pricesData = await pricesResponse.json()

      // Transform the data back to symbol-based format
      const transformedPrices: Record<string, CoinPrice> = {}
      
      Object.entries(pricesData).forEach(([coinId, data]: [string, any]) => {
        // Find the symbol for this coin ID
        const symbol = Object.keys(symbolToIdMap).find(sym => symbolToIdMap[sym] === coinId)
        if (symbol && data) {
          transformedPrices[symbol] = {
            symbol,
            price: data.usd || 0,
            change24h: data.usd_24h_change || 0,
            marketCap: data.usd_market_cap,
            volume24h: data.usd_24h_vol
          }
        }
      })

      setPrices(transformedPrices)
      setLastUpdate(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices'
      setError(errorMessage)
      console.error('Error fetching real-time prices:', err)
    } finally {
      setLoading(false)
    }
  }, [symbols, enabled])

  // Initial fetch
  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  // Set up interval for real-time updates
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return

    const interval = setInterval(fetchPrices, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchPrices, refreshInterval, enabled])

  const refreshPrices = useCallback(() => {
    fetchPrices()
  }, [fetchPrices])

  return {
    prices,
    loading,
    error,
    lastUpdate,
    refreshPrices
  }
}
