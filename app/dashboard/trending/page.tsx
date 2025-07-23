"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Star, DollarSign, BarChart3, Activity, RefreshCw, Filter } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { StarBorder } from "@/components/ui/star-border"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { useMarketData } from "@/hooks/use-market-data"
import { toast } from 'sonner'

export default function TrendingPage() {
  const { 
    coins, 
    trending, 
    global, 
    loading, 
    refresh 
  } = useMarketData(100)
  
  const [timeframe, setTimeframe] = useState("24h")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("market_cap_rank")
  const [refreshing, setRefreshing] = useState(false)

  const categories = ["all", "defi", "nft", "gaming", "meme", "ai"]

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
      toast.success('Trending data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  // Filter and sort coins based on selection
  const filteredCoins = coins
    .filter(coin => {
      if (category === "all") return true
      // Simple category filtering based on coin name/symbol
      const name = coin.name.toLowerCase()
      
      switch (category) {
        case "defi":
          return name.includes("defi") || name.includes("swap") || name.includes("finance") || name.includes("uni")
        case "nft":
          return name.includes("nft") || name.includes("ape") || name.includes("punk") || name.includes("flow")
        case "gaming":
          return name.includes("game") || name.includes("axie") || name.includes("sandbox") || name.includes("gala")
        case "meme":
          return name.includes("doge") || name.includes("shib") || name.includes("pepe") || name.includes("floki")
        case "ai":
          return name.includes("ai") || name.includes("artificial") || name.includes("fetch") || name.includes("ocean")
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_change_percentage_24h":
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        case "market_cap":
          return (b.market_cap || 0) - (a.market_cap || 0)
        case "total_volume":
          return (b.total_volume || 0) - (a.total_volume || 0)
        default:
          return (a.market_cap_rank || 999) - (b.market_cap_rank || 999)
      }
    })
    .slice(0, 50) // Show top 50

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

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
            <span>Loading trending cryptocurrencies...</span>
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
          <h1 className="text-3xl font-bold text-white">Trending Cryptocurrencies</h1>
          <p className="text-gray-400 mt-1">Discover trending and popular cryptocurrencies with real-time data from CoinGecko</p>
        </div>
        <StarBorder
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </StarBorder>
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
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400" />
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
                  <p className="text-sm text-gray-400">24h Volume</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatMarketCap(global.data?.total_volume?.usd || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-400" />
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
                  <p className="text-sm text-gray-400">BTC Dominance</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {(global.data?.market_cap_percentage?.btc || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-400" />
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
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Category:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-accent-slate text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 text-sm"
          >
            <option value="market_cap_rank">Market Cap Rank</option>
            <option value="price_change_percentage_24h">24h Change</option>
            <option value="market_cap">Market Cap</option>
            <option value="total_volume">Volume</option>
          </select>
        </div>
      </div>

      {/* Trending Coins */}
      {trending && trending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-slate" />
              Top Trending (Last 24h)
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 6).map((trend, index) => (
                <div key={trend.item.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm font-medium text-accent-slate">#{index + 1}</span>
                  {trend.item.large && (
                    <img src={trend.item.large} alt={trend.item.name} className="w-8 h-8 rounded-full" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{trend.item.name}</p>
                    <p className="text-xs text-gray-400 uppercase">{trend.item.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">#{trend.item.market_cap_rank || 'N/A'}</p>
                    <p className="text-xs text-gray-400">Rank</p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Coins List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Market Overview ({filteredCoins.length} coins)
            </h2>
            <PremiumBadge variant="primary">
              Live Data from CoinGecko
            </PremiumBadge>
          </div>

          <div className="space-y-3">
            {filteredCoins.slice(0, 20).map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-accent-slate w-8 text-right">
                    #{coin.market_cap_rank || index + 1}
                  </span>
                  
                  {coin.image && (
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{coin.name}</h3>
                    <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
                  </div>
                </div>

                <div className="text-right min-w-0 flex-shrink-0">
                  <p className="font-semibold text-white">
                    {formatCurrency(coin.current_price)}
                  </p>
                  <p className={`text-sm font-medium ${
                    (coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(coin.price_change_percentage_24h || 0)}
                  </p>
                </div>

                <div className="text-right min-w-0 flex-shrink-0 hidden md:block">
                  <p className="text-sm text-gray-400">Market Cap</p>
                  <p className="font-medium text-white">
                    {formatMarketCap(coin.market_cap || 0)}
                  </p>
                </div>

                <div className="text-right min-w-0 flex-shrink-0 hidden lg:block">
                  <p className="text-sm text-gray-400">Volume 24h</p>
                  <p className="font-medium text-white">
                    {formatMarketCap(coin.total_volume || 0)}
                  </p>
                </div>

                <div className="flex items-center justify-center w-8">
                  {(coin.price_change_percentage_24h || 0) >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCoins.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No cryptocurrencies found for the selected category.</p>
            </div>
          )}
        </PremiumCard>
      </motion.div>
    </div>
  )
}
