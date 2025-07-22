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
  Info
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { LineChart, AreaChart, BarChart, PieChart as PieChartComponent } from "@/components/charts"

interface MarketMetrics {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  altcoinMarketCap: number
  defiTVL: number
}

interface PerformanceData {
  date: string
  portfolio: number
  bitcoin: number
  ethereum: number
  sp500: number
}

const mockMarketMetrics: MarketMetrics = {
  totalMarketCap: 1876543210987,
  totalVolume24h: 98765432109,
  btcDominance: 48.5,
  ethDominance: 18.2,
  altcoinMarketCap: 625432109876,
  defiTVL: 45678901234
}

const mockPerformanceData: PerformanceData[] = [
  { date: "Jan", portfolio: 100000, bitcoin: 35000, ethereum: 2200, sp500: 4200 },
  { date: "Feb", portfolio: 112000, bitcoin: 38000, ethereum: 2400, sp500: 4250 },
  { date: "Mar", portfolio: 125000, bitcoin: 42000, ethereum: 2800, sp500: 4300 },
  { date: "Apr", portfolio: 118000, bitcoin: 40000, ethereum: 2600, sp500: 4280 },
  { date: "May", portfolio: 135000, bitcoin: 45000, ethereum: 3000, sp500: 4350 },
  { date: "Jun", portfolio: 142000, bitcoin: 43000, ethereum: 2900, sp500: 4400 },
  { date: "Jul", portfolio: 155000, bitcoin: 45234, ethereum: 2456, sp500: 4450 }
]

const mockSectorData = [
  { name: "DeFi", value: 35, color: "#8b5cf6" },
  { name: "Gaming", value: 20, color: "#ec4899" },
  { name: "Layer 1", value: 25, color: "#3b82f6" },
  { name: "Layer 2", value: 10, color: "#10b981" },
  { name: "Meme", value: 10, color: "#f59e0b" }
]

const mockVolumeData = [
  { name: "Mon", volume: 85 },
  { name: "Tue", volume: 92 },
  { name: "Wed", volume: 78 },
  { name: "Thu", volume: 95 },
  { name: "Fri", volume: 88 },
  { name: "Sat", volume: 72 },
  { name: "Sun", volume: 68 }
]

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("1M")
  const [chartType, setChartType] = useState<"area" | "line">("area")

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
                <p className="text-2xl font-bold">{formatMarketCap(mockMarketMetrics.totalMarketCap)}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+5.34%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-accent-slate" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">{formatMarketCap(mockMarketMetrics.totalVolume24h)}</p>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">-2.15%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-pink-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">DeFi TVL</p>
                <p className="text-2xl font-bold">{formatMarketCap(mockMarketMetrics.defiTVL)}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+8.76%</span>
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
                    data={mockPerformanceData}
                    dataKey="portfolio"
                    xDataKey="date"
                    title="Portfolio Performance"
                    color="#8B5CF6"
                    height={384}
                    showGrid={true}
                    showLegend={true}
                  />
                ) : (
                  <LineChart
                    data={mockPerformanceData}
                    dataKey="portfolio"
                    xDataKey="date"
                    title="Portfolio Performance"
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
                  data={mockSectorData}
                  title="Portfolio Allocation"
                  height={320}
                  showLegend={true}
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Trading Volume</h2>
              <p className="text-sm text-muted-foreground">Daily trading volume (billions)</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <BarChart
                  data={mockVolumeData}
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
                    <span className="text-sm">{mockMarketMetrics.btcDominance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mockMarketMetrics.btcDominance}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Ethereum Dominance</span>
                    <span className="text-sm">{mockMarketMetrics.ethDominance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mockMarketMetrics.ethDominance}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Altcoins</span>
                    <span className="text-sm">{(100 - mockMarketMetrics.btcDominance - mockMarketMetrics.ethDominance).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - mockMarketMetrics.btcDominance - mockMarketMetrics.ethDominance}%` }}
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