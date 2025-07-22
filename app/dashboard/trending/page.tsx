"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Star, Clock, DollarSign, BarChart3 } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"

interface TrendingCoin {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  sparkline: number[]
  rank: number
}

const mockTrendingCoins: TrendingCoin[] = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    price: 45234.56,
    change24h: 5.34,
    volume24h: 28456789012,
    marketCap: 883456789012,
    sparkline: [40000, 41000, 42000, 43000, 44000, 45000, 45234],
    rank: 1
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    price: 2456.78,
    change24h: -2.15,
    volume24h: 15678901234,
    marketCap: 295678901234,
    sparkline: [2500, 2480, 2470, 2460, 2450, 2460, 2456],
    rank: 2
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    price: 98.45,
    change24h: 12.67,
    volume24h: 2345678901,
    marketCap: 42345678901,
    sparkline: [85, 87, 90, 92, 95, 97, 98],
    rank: 3
  },
  {
    id: "4",
    name: "Cardano",
    symbol: "ADA",
    price: 0.456,
    change24h: 8.91,
    volume24h: 1234567890,
    marketCap: 15987654321,
    sparkline: [0.42, 0.43, 0.44, 0.445, 0.45, 0.455, 0.456],
    rank: 4
  },
  {
    id: "5",
    name: "Avalanche",
    symbol: "AVAX",
    price: 34.56,
    change24h: -5.23,
    volume24h: 987654321,
    marketCap: 11234567890,
    sparkline: [36, 35.5, 35, 34.8, 34.6, 34.5, 34.56],
    rank: 5
  }
]

export default function TrendingPage() {
  const [coins, setCoins] = useState<TrendingCoin[]>(mockTrendingCoins)
  const [timeframe, setTimeframe] = useState("24h")
  const [category, setCategory] = useState("all")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    return `$${(volume / 1e3).toFixed(2)}K`
  }

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
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trending Cryptocurrencies
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover the hottest coins and tokens in the market
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Add to Watchlist
              </PremiumButton>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {["24h", "7d", "30d", "1y"].map((tf) => (
              <PremiumButton
                key={tf}
                variant={timeframe === tf ? "gradient" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </PremiumButton>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Gainer</p>
                <p className="text-2xl font-bold">SOL</p>
                <p className="text-sm text-green-500">+12.67%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Loser</p>
                <p className="text-2xl font-bold">AVAX</p>
                <p className="text-sm text-red-500">-5.23%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">$48.7B</p>
                <p className="text-sm text-muted-foreground">24h</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Trend</p>
                <p className="text-2xl font-bold">Bullish</p>
                <p className="text-sm text-green-500">67% up</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </PremiumCard>
        </motion.div>

        {/* Trending Table */}
        <motion.div variants={itemVariants}>
          <PremiumCard className="overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Top Trending Coins</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">#</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-right p-4">Price</th>
                    <th className="text-right p-4">24h %</th>
                    <th className="text-right p-4">Volume (24h)</th>
                    <th className="text-right p-4">Market Cap</th>
                    <th className="text-center p-4">Last 7 Days</th>
                    <th className="text-center p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.map((coin, index) => (
                    <motion.tr
                      key={coin.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <PremiumBadge variant="outline">{coin.rank}</PremiumBadge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {coin.symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{coin.name}</p>
                            <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono">{formatPrice(coin.price)}</td>
                      <td className="p-4 text-right">
                        <span className={coin.change24h > 0 ? "text-green-500" : "text-red-500"}>
                          {coin.change24h > 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-4 text-right">{formatVolume(coin.volume24h)}</td>
                      <td className="p-4 text-right">{formatVolume(coin.marketCap)}</td>
                      <td className="p-4">
                        <div className="w-24 h-8 mx-auto">
                          <svg viewBox="0 0 100 30" className="w-full h-full">
                            <polyline
                              fill="none"
                              stroke={coin.change24h > 0 ? "#10b981" : "#ef4444"}
                              strokeWidth="2"
                              points={coin.sparkline.map((value, i) => 
                                `${(i / (coin.sparkline.length - 1)) * 100},${30 - ((value - Math.min(...coin.sparkline)) / (Math.max(...coin.sparkline) - Math.min(...coin.sparkline))) * 30}`
                              ).join(" ")}
                            />
                          </svg>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <PremiumButton size="sm" variant="ghost">
                          <Star className="h-4 w-4" />
                        </PremiumButton>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </div>
  )
}