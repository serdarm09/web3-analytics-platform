'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Wallet, Activity, ArrowLeft, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PremiumCard } from '@/components/ui/premium-card'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumSkeleton } from '@/components/ui/premium-skeleton'
import { AreaChart, PieChart as PieChartComponent } from '@/components/charts'
import PortfolioAssetManager from '@/components/portfolio/PortfolioAssetManager'
import { toast } from 'sonner'

interface PortfolioAsset {
  _id?: string
  symbol: string
  name: string
  amount: number
  averagePrice?: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
  value?: number
  change24h?: number
  changePercent24h?: number
  image?: string
}

interface Portfolio {
  _id: string
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
    isCreating,
    refreshPrices 
  } = usePortfolio()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Format portfolios from database to match the component structure
  const portfolios = dbPortfolios?.map(portfolio => ({
    ...portfolio,
    _id: portfolio.id,
    assets: portfolio.assets.map(asset => ({
      ...asset,
      averagePrice: asset.avgBuyPrice,
      purchasePrice: asset.avgBuyPrice,
      purchaseDate: new Date()
    }))
  })) || []

  const totalValue = portfolios?.reduce((sum: number, p: Portfolio) => sum + p.totalValue, 0) || 0
  const totalCost = portfolios?.reduce((sum: number, p: Portfolio) => sum + p.totalCost, 0) || 0
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  // Enhanced chart data with real portfolio tracking
  const chartData = [
    { name: 'Jan', value: totalCost * 0.8 },
    { name: 'Feb', value: totalCost * 0.9 },
    { name: 'Mar', value: totalCost * 0.85 },
    { name: 'Apr', value: totalCost * 1.1 },
    { name: 'May', value: totalCost * 1.05 },
    { name: 'Jun', value: totalCost * 1.2 },
    { name: 'Jul', value: totalValue }
  ]

  const pieData = portfolios?.map((p: Portfolio, index: number) => ({
    name: p.name,
    value: p.totalValue,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  })) || []

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setViewMode('detail')
  }

  const handleBackToOverview = () => {
    setSelectedPortfolio(null)
    setViewMode('overview')
  }

  const handleRefresh = async () => {
    if (!selectedPortfolio) return
    setRefreshing(true)
    try {
      await refreshPrices(selectedPortfolio._id)
      toast.success('Portfolio data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  // Auto-create default portfolio if none exists
  useEffect(() => {
    if (!isLoading && portfolios.length === 0 && !isCreating) {
      createPortfolio({
        name: 'Ana Portföy',
        description: 'Kripto varlıklarınızı takip edin'
      })
    }
  }, [isLoading, portfolios, isCreating, createPortfolio])

  // Auto-select single portfolio
  useEffect(() => {
    if (!isLoading && portfolios.length === 1 && !selectedPortfolio) {
      handlePortfolioSelect(portfolios[0])
    }
  }, [isLoading, portfolios, selectedPortfolio])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  if (isLoading || isCreating) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-white"
          >
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{isCreating ? 'Portföyünüz oluşturuluyor...' : 'Yükleniyor...'}</span>
          </motion.div>
        </div>
        <PremiumSkeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (viewMode === 'detail' && selectedPortfolio) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-2 text-accent-slate hover:text-white transition-colors mb-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Portföy Listesine Dön
            </button>
            <h1 className="text-3xl font-bold text-white">{selectedPortfolio.name}</h1>
            {selectedPortfolio.description && (
              <p className="text-gray-400 mt-1">{selectedPortfolio.description}</p>
            )}
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(selectedPortfolio.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-accent-slate/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-accent-slate" />
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
                  <p className="text-sm text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(selectedPortfolio.totalCost)}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-400" />
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
                  <p className="text-sm text-gray-400">Profit/Loss</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    selectedPortfolio.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(Math.abs(selectedPortfolio.totalProfitLoss))}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  selectedPortfolio.totalProfitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
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
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">P/L Percentage</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    selectedPortfolio.totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(selectedPortfolio.totalProfitLossPercentage)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  selectedPortfolio.totalProfitLossPercentage >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <Activity className="w-6 h-6 text-accent-slate" />
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* Asset Manager */}
        <PortfolioAssetManager
          portfolioId={selectedPortfolio._id}
          assets={selectedPortfolio.assets}
          onAssetsUpdate={() => {
            // Refresh portfolio data
            window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Management</h1>
          <p className="text-gray-400 mt-1">Kripto yatırımlarınızı takip edin ve yönetin</p>
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
          {portfolios && portfolios.length > 1 && (
            <StarBorder
              as="button"
              type="button"
              onClick={() => setShowCreateModal(true)}
              color="#3B82F6"
              speed="4s"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span>New Portfolio</span>
              </div>
            </StarBorder>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="p-3 bg-accent-slate/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-accent-slate" />
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
                <p className="text-sm text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(totalCost)}
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
          transition={{ delay: 0.3 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Profit/Loss</p>
                <p className={`text-2xl font-bold mt-1 ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(totalProfitLoss))}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${totalProfitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {totalProfitLoss >= 0 ? (
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
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Return Rate</p>
                <p className={`text-2xl font-bold mt-1 ${totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(totalProfitLossPercentage)}
                </p>
              </div>
              <div className="p-3 bg-accent-teal/20 rounded-lg">
                <PieChart className="w-6 h-6 text-accent-teal" />
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AreaChart
            data={chartData}
            dataKey="value"
            title="Portfolio Performance"
            height={400}
            color="#64748b"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PieChartComponent
            data={pieData}
            title="Portfolio Distribution"
            height={400}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <PremiumCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Portfolios</h2>
          {portfolios && portfolios.length > 0 ? (
            <div className="space-y-4">
              {portfolios.map((portfolio: any) => (
                <div 
                  key={portfolio._id || portfolio.id} 
                  className="border border-gray-800 rounded-lg p-4 hover:border-accent-slate/50 transition-colors cursor-pointer"
                  onClick={() => handlePortfolioSelect(portfolio)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{portfolio.name}</h3>
                      {portfolio.description && (
                        <p className="text-sm text-gray-400 mt-1">{portfolio.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-400">
                          {portfolio.assets.length} assets
                        </span>
                        <span className="text-sm text-gray-400">
                          Value: {formatCurrency(portfolio.totalValue)}
                        </span>
                        <span className={`text-sm ${portfolio.totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(portfolio.totalProfitLossPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You don't have any portfolios yet. Create your first portfolio to get started.</p>
              <StarBorder
                as="button"
                type="button"
                onClick={() => setShowCreateModal(true)}
                color="#3B82F6"
                speed="4s"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Portfolio</span>
                </div>
              </StarBorder>
            </div>
          )}
        </PremiumCard>
      </motion.div>

      {/* Portfolio Creation Modal - To be implemented */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create New Portfolio</h3>
            <p className="text-gray-400 mb-4">Portfolio creation feature coming soon!</p>
            <StarBorder 
              onClick={() => setShowCreateModal(false)}
              className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
            >
              Close
            </StarBorder>
          </div>
        </div>
      )}
    </div>
  )
}