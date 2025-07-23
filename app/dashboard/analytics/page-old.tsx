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
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { LineChart, AreaChart, BarChart, PieChart as PieChartComponent } from "@/components/charts"
import { useMarketData } from "@/hooks/use-market-data"

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("1M")
  const [chartType, setChartType] = useState<"area" | "line">("area")
  
  const { coins, trending, global, loading, error, refresh } = useMarketData(100)

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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Market Analytics</h1>
            <p className="text-gray-400 mt-1">Comprehensive market data and insights</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <PremiumCard key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/3"></div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Market Analytics</h1>
            <p className="text-gray-400 mt-1">Comprehensive market data and insights</p>
          </div>
          <PremiumButton onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </PremiumButton>
        </div>
        
        <PremiumCard className="p-6">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load market data</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </PremiumCard>
      </div>
    )
  }

  // Sector data from DeFi categories
  const sectorData = defiData?.categoryDistribution.slice(0, 5).map((category, index) => ({
    name: category.name,
    value: Math.round((category.tvl / (defiData?.totalTVL || 1)) * 100),
    color: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'][index]
  })) || []

  // Volume data from trending coins
  const volumeData = trendingCoins.slice(0, 7).map(coin => ({
    name: coin.symbol.toUpperCase(),
    volume: Math.round(coin.volume_24h / 1000000) // Convert to millions
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
                Advanced Analytics
              </h1>
              <p className="text-muted-foreground mt-2">
                Deep insights into market trends and portfolio performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Market Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PremiumCard className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold">
                  {globalData ? formatMarketCap(globalData.totalMarketCap) : '$0'}
                </p>
                <div className="flex items-center gap-2">
                  {globalData && globalData.marketCapChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${globalData && globalData.marketCapChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {globalData ? formatPercentage(globalData.marketCapChange24h) : '0%'}
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-accent-slate" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">
                  {globalData ? formatMarketCap(globalData.totalVolume24h) : '$0'}
                </p>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-400">
                    {globalData ? `${globalData.markets} markets` : '0 markets'}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-pink-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">DeFi TVL</p>
                <p className="text-2xl font-bold">
                  {defiData ? formatMarketCap(defiData.totalTVL) : '$0'}
                </p>
                <div className="flex items-center gap-2">
                  {defiData && defiData.tvlChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${defiData && defiData.tvlChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {defiData ? formatPercentage(defiData.tvlChange24h) : '0%'}
                  </span>
                </div>
              </div>
              <PieChart className="h-8 w-8 text-blue-500" />
            </div>
          </PremiumCard>
        </motion.div>

        {/* Portfolio Performance Chart */}
        <motion.div variants={itemVariants}>
          <PremiumCard>
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Portfolio Performance</h2>
                  <p className="text-sm text-muted-foreground">Compare your portfolio against major indices</p>
                </div>
                <div className="flex gap-2">
                  {["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"].map((tf) => (
                    <PremiumButton
                      key={tf}
                      size="sm"
                      variant={timeframe === tf ? "gradient" : "outline"}
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </PremiumButton>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-96">
                {chartType === "area" ? (
                  <AreaChart
                    data={chartData}
                    dataKey="bitcoin"
                    xDataKey="date"
                    title="Market Performance"
                    color="#8B5CF6"
                    height={384}
                    showGrid={true}
                    showLegend={true}
                  />
                ) : (
                  <LineChart
                    data={chartData}
                    dataKey="bitcoin"
                    xDataKey="date"
                    title="Market Performance"
                    color="#8B5CF6"
                    height={384}
                    showGrid={true}
                    showLegend={true}
                  />
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-slate"></div>
                  <span className="text-sm">Your Portfolio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Bitcoin</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Ethereum</span>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Sector Analysis and Volume */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Sector Distribution</h2>
              <p className="text-sm text-muted-foreground">Portfolio allocation by sector</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <PieChartComponent
                  data={sectorData}
                  title="DeFi Categories"
                  height={320}
                  showLegend={true}
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Trading Volume</h2>
              <p className="text-sm text-muted-foreground">Top coins volume (millions)</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <BarChart
                  data={volumeData}
                  dataKey="volume"
                  xDataKey="name"
                  title="Trading Volume"
                  color="#8B5CF6"
                  height={320}
                  showGrid={true}
                  showLegend={false}
                />
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Market Dominance */}
        <motion.div variants={itemVariants}>
          <PremiumCard>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Market Dominance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Bitcoin Dominance</span>
                    <span className="text-sm">{globalData?.btcDominance ? `${globalData.btcDominance.toFixed(1)}%` : 'Loading...'}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${globalData?.btcDominance || 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Ethereum Dominance</span>
                    <span className="text-sm">{globalData?.ethDominance ? `${globalData.ethDominance.toFixed(1)}%` : 'Loading...'}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${globalData?.ethDominance || 0}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Altcoins</span>
                    <span className="text-sm">
                      {globalData?.btcDominance && globalData?.ethDominance 
                        ? `${(100 - globalData.btcDominance - globalData.ethDominance).toFixed(1)}%`
                        : 'Loading...'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: globalData?.btcDominance && globalData?.ethDominance 
                          ? `${100 - globalData.btcDominance - globalData.ethDominance}%`
                          : '0%'
                      }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-accent-slate to-accent-teal"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </div>
  )
}