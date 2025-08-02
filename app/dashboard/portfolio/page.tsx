'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Wallet, Activity, ArrowLeft, RefreshCw, Eye, EyeOff, BarChart3, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/contexts/AuthContext'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PremiumCard } from '@/components/ui/premium-card'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumSkeleton } from '@/components/ui/premium-skeleton'
import { PremiumButton } from '@/components/ui/premium-button'
import { AreaChart, PieChart as PieChartComponent } from '@/components/charts'
import PortfolioAssetManager from '@/components/portfolio/PortfolioAssetManager'
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal'
import { toast } from 'sonner'

interface PortfolioAsset {
  _id?: string
  symbol: string
  name: string
  amount: number
  averagePrice?: number
  purchasePrice?: number
  avgBuyPrice?: number
  purchaseDate?: Date
  currentPrice?: number
  value?: number
  change24h?: number
  changePercent24h?: number
  image?: string
}

interface Portfolio {
  _id?: string
  id: string
  name: string
  description?: string
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  assets: PortfolioAsset[]
  isPublic?: boolean
  lastUpdated: string
  createdAt: string
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const { 
    portfolios: dbPortfolios, 
    isLoading, 
    createPortfolio,
    deletePortfolio,
    refreshPrices 
  } = usePortfolio()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [showTotalValue, setShowTotalValue] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Auto-refresh prices every 60 seconds (reduced frequency to prevent rate limiting)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshPrices(undefined)
        setLastRefresh(new Date())
      } catch (error) {
        console.error('Auto-refresh failed:', error)
        // Don't show toast for auto-refresh failures to avoid spam
      }
    }, 60000) // 1 minute intervals to reduce API calls

    return () => clearInterval(interval)
  }, [refreshPrices])

  // Format portfolios from database to match the component structure
  const portfolios = useMemo(() => 
    dbPortfolios?.map(portfolio => ({
      ...portfolio,
      _id: portfolio.id,
      id: portfolio.id,
      assets: portfolio.assets.map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.name,
        amount: asset.amount,
        averagePrice: asset.avgBuyPrice || 0,
        purchasePrice: asset.avgBuyPrice || 0,
        projectId: undefined,
        purchaseDate: new Date(),
        currentPrice: asset.currentPrice,
        value: asset.currentPrice ? asset.amount * asset.currentPrice : undefined,
        change24h: asset.change24h,
        changePercent24h: asset.changePercent24h,
        image: asset.image
      }))
    })) || []
  , [dbPortfolios])

  const totalValue = portfolios?.reduce((sum: number, p: Portfolio) => sum + p.totalValue, 0) || 0
  const totalCost = portfolios?.reduce((sum: number, p: Portfolio) => sum + p.totalCost, 0) || 0
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshPrices(undefined)
      setLastRefresh(new Date())
      toast.success('Prices refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh prices')
    } finally {
      setRefreshing(false)
    }
  }

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setViewMode('detail')
  }

  const handleBackToOverview = () => {
    setSelectedPortfolio(null)
    setViewMode('overview')
  }

  // Update selected portfolio when portfolios refresh
  useEffect(() => {
    if (selectedPortfolio && portfolios) {
      const updated = portfolios.find(p => p._id === selectedPortfolio._id || p.id === selectedPortfolio.id)
      if (updated) {
        setSelectedPortfolio(updated)
      }
    }
  }, [portfolios, selectedPortfolio])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PremiumSkeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Detail View - Individual Portfolio
  if (viewMode === 'detail' && selectedPortfolio) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <PremiumButton
              onClick={handleBackToOverview}
              variant="ghost"
              size="sm"
              className="gap-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolios
            </PremiumButton>
            <h1 className="text-3xl font-bold text-white">{selectedPortfolio.name}</h1>
            {selectedPortfolio.description && (
              <p className="text-gray-400 mt-1">{selectedPortfolio.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <PremiumButton
              onClick={handleRefresh}
              disabled={refreshing}
              variant="glow"
              size="md"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Prices
            </PremiumButton>
          </div>
        </div>

        {/* Portfolio Performance Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard className="glassmorphism p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(selectedPortfolio.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard className="glassmorphism p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(selectedPortfolio.totalCost)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard className="glassmorphism p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Total P&L</p>
                  <p className={`text-2xl font-bold ${
                    selectedPortfolio.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedPortfolio.totalProfitLoss >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(selectedPortfolio.totalProfitLoss))}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${
                  selectedPortfolio.totalProfitLoss >= 0 
                    ? 'bg-gradient-to-br from-green-500/20 to-green-600/20' 
                    : 'bg-gradient-to-br from-red-500/20 to-red-600/20'
                }`}>
                  {selectedPortfolio.totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PremiumCard className="glassmorphism p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Return %</p>
                  <p className={`text-2xl font-bold ${
                    selectedPortfolio.totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(selectedPortfolio.totalProfitLossPercentage)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* Asset Manager */}
        <PortfolioAssetManager
          portfolioId={selectedPortfolio._id || selectedPortfolio.id}
          assets={selectedPortfolio.assets as any}
          onAssetsUpdate={() => {
            window.location.reload()
          }}
        />
      </div>
    )
  }

  // Overview - All Portfolios
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Dashboard</h1>
          <p className="text-gray-400 mt-1">Track and manage your crypto investments</p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumButton
            onClick={() => setShowTotalValue(!showTotalValue)}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            {showTotalValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTotalValue ? 'Hide' : 'Show'} Values
          </PremiumButton>
          <PremiumButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="glow"
            size="md"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </PremiumButton>
          <PremiumButton
            onClick={() => setShowCreateModal(true)}
            variant="gradient"
            size="md"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Portfolio
          </PremiumButton>
        </div>
      </div>

      {/* Total Stats Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PremiumCard className="glassmorphism p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-slate" />
              Overall Performance
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Updated {new Date(lastRefresh).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                {showTotalValue ? formatCurrency(totalValue) : '••••••'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Initial Investment</p>
              <p className="text-xl font-semibold text-gray-300">
                {showTotalValue ? formatCurrency(totalCost) : '••••••'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Profit/Loss</p>
              <p className={`text-xl font-semibold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {showTotalValue ? (
                  <>
                    {totalProfitLoss >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(totalProfitLoss))}
                  </>
                ) : '••••••'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Return %</p>
              <p className={`text-xl font-semibold ${totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {showTotalValue ? formatPercentage(totalProfitLossPercentage) : '••••'}
              </p>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Portfolio List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Your Portfolios</h2>
        {portfolios && portfolios.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio: any, index: number) => {
              const portfolioKey = `portfolio-${portfolio._id || portfolio.id || index}`;
              return (
              <motion.div
                key={portfolioKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <PremiumCard 
                  className="glassmorphism p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  onClick={() => handlePortfolioSelect(portfolio)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{portfolio.name}</h3>
                      {portfolio.description && (
                        <p className="text-sm text-gray-400 mt-1">{portfolio.description}</p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${
                      portfolio.totalProfitLoss >= 0 
                        ? 'bg-green-500/20' 
                        : 'bg-red-500/20'
                    }`}>
                      {portfolio.totalProfitLoss >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Value</span>
                      <span className="font-semibold text-white">
                        {showTotalValue ? formatCurrency(portfolio.totalValue) : '••••••'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">P&L</span>
                      <span className={`font-semibold ${
                        portfolio.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {showTotalValue ? (
                          <>
                            {portfolio.totalProfitLoss >= 0 ? '+' : ''}
                            {formatCurrency(portfolio.totalProfitLoss)}
                          </>
                        ) : '••••'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Assets</span>
                      <span className="text-white">{portfolio.assets.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Last updated: {new Date(portfolio.lastUpdated).toLocaleDateString()}
                      </span>
                      <span className={`text-sm font-semibold ${
                        portfolio.totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercentage(portfolio.totalProfitLossPercentage)}
                      </span>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <PremiumCard className="glassmorphism p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No portfolios yet</h3>
            <p className="text-gray-400 mb-6">Create your first portfolio to start tracking your crypto investments</p>
            <PremiumButton
              onClick={() => setShowCreateModal(true)}
              variant="gradient"
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Portfolio
            </PremiumButton>
          </PremiumCard>
        )}
      </motion.div>

      {/* Create Portfolio Modal */}
      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePortfolio={async (data) => {
          return new Promise((resolve, reject) => {
            createPortfolio(data, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            })
          })
        }}
      />
    </div>
  )
}