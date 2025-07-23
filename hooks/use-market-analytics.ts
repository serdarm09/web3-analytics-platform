'use client'

import { useState, useEffect } from 'react'

interface GlobalMarketData {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  marketCapChange24h: number
  volumeChange24h: number
  activeCryptocurrencies: number
  markets: number
}

interface TrendingCoin {
  id: string
  symbol: string
  name: string
  image: string
  market_cap_rank: number
  price_usd: number
  price_change_24h: number
  market_cap: number
  volume_24h: number
}

interface DeFiData {
  totalTVL: number
  tvlChange24h: number
  protocolCount: number
  chainCount: number
  topProtocols: Array<{
    name: string
    tvl: number
    change_1d: number
    category: string
  }>
  categoryDistribution: Array<{
    name: string
    tvl: number
  }>
}

interface ChartData {
  date: string
  bitcoin: number
  ethereum: number
  totalMarket: number
}

interface MarketAnalytics {
  globalData: GlobalMarketData | null
  trendingCoins: TrendingCoin[]
  defiData: DeFiData | null
  chartData: ChartData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useMarketAnalytics = (): MarketAnalytics => {
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null)
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [defiData, setDefiData] = useState<DeFiData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Paralel olarak tüm verileri al
      const [globalResponse, trendingResponse, defiResponse, chartResponse] = await Promise.all([
        fetch('/api/market-data/global'),
        fetch('/api/market-data/trending'),
        fetch('/api/market-data/defi'),
        fetch('/api/market-data/charts?days=30')
      ])

      // Global market data
      if (globalResponse.ok) {
        const globalResult = await globalResponse.json()
        if (globalResult.success && globalResult.data) {
          setGlobalData({
            totalMarketCap: globalResult.data.total_market_cap?.usd || 0,
            totalVolume24h: globalResult.data.total_volume?.usd || 0,
            btcDominance: globalResult.data.market_cap_percentage?.btc || 0,
            ethDominance: globalResult.data.market_cap_percentage?.eth || 0,
            marketCapChange24h: globalResult.data.market_cap_change_percentage_24h_usd || 0,
            volumeChange24h: 0,
            activeCryptocurrencies: globalResult.data.active_cryptocurrencies || 0,
            markets: globalResult.data.markets || 0
          })
        }
      }

      // Trending coins
      if (trendingResponse.ok) {
        const trendingResult = await trendingResponse.json()
        if (trendingResult.success && trendingResult.data?.coins) {
          const formattedTrending: TrendingCoin[] = trendingResult.data.coins.slice(0, 10).map((coin: any) => ({
            id: coin.item.id,
            symbol: coin.item.symbol,
            name: coin.item.name,
            image: coin.item.large,
            market_cap_rank: coin.item.market_cap_rank || 0,
            price_usd: coin.item.data?.price || 0,
            price_change_24h: coin.item.data?.price_change_percentage_24h?.usd || 0,
            market_cap: coin.item.data?.market_cap || 0,
            volume_24h: coin.item.data?.total_volume || 0
          }))
          setTrendingCoins(formattedTrending)
        }
      }

      // DeFi data
      if (defiResponse.ok) {
        const defiResult = await defiResponse.json()
        if (defiResult.success && defiResult.data) {
          setDefiData({
            totalTVL: defiResult.data.summary?.totalTVL || 0,
            tvlChange24h: defiResult.data.summary?.tvlChange24h || 0,
            protocolCount: defiResult.data.summary?.protocolCount || 0,
            chainCount: defiResult.data.summary?.chainCount || 0,
            topProtocols: defiResult.data.topProtocols || [],
            categoryDistribution: defiResult.data.categoryDistribution || []
          })
        }
      }

      // Chart data
      if (chartResponse.ok) {
        const chartResult = await chartResponse.json()
        if (chartResult.success && chartResult.data) {
          const bitcoinData = chartResult.data.find((coin: any) => coin.id === 'bitcoin')
          const ethereumData = chartResult.data.find((coin: any) => coin.id === 'ethereum')
          
          if (bitcoinData && ethereumData) {
            const formattedChartData: ChartData[] = bitcoinData.prices.map((btcPrice: any, index: number) => ({
              date: btcPrice.date,
              bitcoin: btcPrice.price,
              ethereum: ethereumData.prices[index]?.price || 0,
              totalMarket: (btcPrice.price * 0.48) + (ethereumData.prices[index]?.price * 0.18) // Approximation
            }))
            setChartData(formattedChartData)
          }
        }
      }

    } catch (err) {
      console.error('Error fetching market analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch market data')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchMarketData()
  }

  useEffect(() => {
    fetchMarketData()
  }, [])

  return {
    globalData,
    trendingCoins,
    defiData,
    chartData,
    loading,
    error,
    refetch
  }
}
