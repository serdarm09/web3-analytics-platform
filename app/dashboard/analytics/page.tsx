"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  Info,
  RefreshCw
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { StarBorder } from "@/components/ui/star-border"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { LineChart, AreaChart, BarChart, PieChart as PieChartComponent } from "@/components/charts"
import { useMarketData } from "@/hooks/use-market-data"
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("1M")
  const [chartType, setChartType] = useState<"area" | "line">("area")
  const [refreshing, setRefreshing] = useState(false)
  
  const { coins, trending, global, loading, error, refresh } = useMarketData(100)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
      toast.success('Analytics data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const formatValue = (value: number, decimals = 0) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    return `$${(value / 1e6).toFixed(2)}M`
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // Calculate analytics from real data
  const topGainers = coins
    .filter(coin => coin.price_change_percentage_24h && coin.price_change_percentage_24h > 0)
    .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    .slice(0, 10)

  const topLosers = coins
    .filter(coin => coin.price_change_percentage_24h && coin.price_change_percentage_24h < 0)
    .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
    .slice(0, 10)

  const topByVolume = coins
    .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
    .slice(0, 10)

  // Market cap distribution for pie chart
  const marketCapData = coins.slice(0, 10).map((coin, index) => ({
    name: coin.symbol.toUpperCase(),
    value: coin.market_cap || 0,
    color: [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ][index]
  }))

  // Volume trends (mock data for now)
  const volumeData = coins.slice(0, 7).map((coin, index) => ({
    name: coin.symbol.toUpperCase(),
    volume: (coin.total_volume || 0) / 1e6, // Convert to millions
    change: coin.price_change_percentage_24h || 0
  }))

  // Price performance chart data (mock historical data)
  const priceChartData = [
    { name: '7d ago', btc: 42000, eth: 2500, total: 1.8e12 },
    { name: '6d ago', btc: 41500, eth: 2450, total: 1.75e12 },
    { name: '5d ago', btc: 43000, eth: 2600, total: 1.85e12 },
    { name: '4d ago', btc: 44000, eth: 2700, total: 1.9e12 },
    { name: '3d ago', btc: 43500, eth: 2650, total: 1.88e12 },
    { name: '2d ago', btc: 45000, eth: 2800, total: 1.95e12 },
    { name: '1d ago', btc: 44500, eth: 2750, total: 1.92e12 },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-white"
          >
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading market analytics...</span>
          </motion.div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Market Analytics</h1>
          <p className="text-gray-400 mt-1">Comprehensive cryptocurrency market analysis and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <StarBorder
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </StarBorder>
          <StarBorder
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </StarBorder>
        </div>
      </div>

      {/* Global Market Stats */}
      {global && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatMarketCap(global.data?.total_market_cap?.usd || 0)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-400">
                      +{(global.data?.market_cap_change_percentage_24h_usd || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">24h Trading Volume</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatMarketCap(global.data?.total_volume?.usd || 0)}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {(global.data?.markets || 0).toLocaleString()} markets
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Bitcoin Dominance</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {(global.data?.market_cap_percentage?.btc || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    ETH: {(global.data?.market_cap_percentage?.eth || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <PieChart className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Cryptocurrencies</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {(global.data?.active_cryptocurrencies || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">Growing</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Market Cap Distribution</h2>
              <div className="flex items-center gap-2">
                <PremiumBadge variant="primary">Top 10</PremiumBadge>
              </div>
            </div>
            <PieChartComponent
              data={marketCapData}
              height={300}
            />
          </PremiumCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Trading Volume Trends</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType("area")}
                  className={`px-3 py-1 rounded text-xs ${chartType === "area" ? 'bg-accent-slate text-white' : 'text-gray-400'}`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1 rounded text-xs ${chartType === "line" ? 'bg-accent-slate text-white' : 'text-gray-400'}`}
                >
                  Line
                </button>
              </div>
            </div>
            {chartType === "area" ? (
              <AreaChart
                data={priceChartData}
                dataKey="total"
                height={300}
                color="#64748b"
              />
            ) : (
              <LineChart
                data={priceChartData}
                dataKey="total"
                height={300}
                color="#64748b"
              />
            )}
          </PremiumCard>
        </motion.div>
      </div>

      {/* Market Movers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PremiumCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Top Gainers (24h)
            </h2>
            <div className="space-y-4">
              {topGainers.slice(0, 5).map((coin, index) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-accent-slate w-6">#{index + 1}</span>
                    {coin.image && (
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium text-white">{coin.symbol.toUpperCase()}</p>
                      <p className="text-sm text-gray-400">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatValue(coin.current_price, 2)}</p>
                    <p className="text-sm text-green-400">
                      +{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <PremiumCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Top Losers (24h)
            </h2>
            <div className="space-y-4">
              {topLosers.slice(0, 5).map((coin, index) => (
                <div key={coin.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-accent-slate w-6">#{index + 1}</span>
                    {coin.image && (
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium text-white">{coin.symbol.toUpperCase()}</p>
                      <p className="text-sm text-gray-400">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatValue(coin.current_price, 2)}</p>
                    <p className="text-sm text-red-400">
                      {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Volume Leaders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <PremiumCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-slate" />
            Volume Leaders (24h)
          </h2>
          <div className="space-y-4">
            {topByVolume.slice(0, 10).map((coin, index) => (
              <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-accent-slate w-8 text-right">#{index + 1}</span>
                  {coin.image && (
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium text-white">{coin.symbol.toUpperCase()}</p>
                    <p className="text-sm text-gray-400">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatMarketCap(coin.total_volume || 0)}</p>
                  <p className="text-sm text-gray-400">{formatValue(coin.current_price, 2)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    (coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(coin.price_change_percentage_24h || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}
