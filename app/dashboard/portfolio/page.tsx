'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Wallet, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumSkeleton } from '@/components/ui/premium-skeleton'
import { AreaChart, PieChart as PieChartComponent } from '@/components/charts'
import PortfolioCreationModal from '@/components/portfolio/PortfolioCreationModal'
import PortfolioAssetManager from '@/components/portfolio/PortfolioAssetManager'

interface Portfolio {
  _id: string
  name: string
  description?: string
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  assets: any[]
  lastUpdated: string
}

export default function PortfolioPage() {
  const { portfolios, isLoading, createPortfolio, isCreating } = usePortfolio()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview')

  const totalValue = portfolios?.reduce((sum: number, p: any) => sum + p.totalValue, 0) || 0
  const totalCost = portfolios?.reduce((sum: number, p: any) => sum + p.totalCost, 0) || 0
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  // Enhanced mock chart data with more realistic portfolio tracking
  const mockChartData = [
    { name: 'Jan', value: totalCost * 0.8 },
    { name: 'Feb', value: totalCost * 0.9 },
    { name: 'Mar', value: totalCost * 0.85 },
    { name: 'Apr', value: totalCost * 1.1 },
    { name: 'May', value: totalCost * 1.05 },
    { name: 'Jun', value: totalCost * 1.2 },
    { name: 'Jul', value: totalValue }
  ]

  const pieData = portfolios?.map((p: any, index: number) => ({
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PremiumSkeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-24" />
          ))}
        </div>
        <PremiumSkeleton className="h-96" />
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
              className="text-accent-slate hover:text-white transition-colors mb-2 text-sm"
            >
              ← Back to Overview
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
                  <p className="text-sm text-gray-400">P&L Percentage</p>
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
          <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
          <p className="text-gray-400 mt-1">Track and manage your crypto investments</p>
        </div>
        <PremiumButton onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Portfolio
        </PremiumButton>
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
                <p className="text-sm text-gray-400">ROI</p>
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
            data={mockChartData}
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
              <p className="text-gray-400 mb-4">No portfolios yet. Create your first portfolio to get started.</p>
              <PremiumButton onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Portfolio
              </PremiumButton>
            </div>
          )}
        </PremiumCard>
      </motion.div>

      {/* Portfolio Creation Modal */}
      <PortfolioCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          // Refresh portfolios after creation
          window.location.reload()
        }}
      />
    </div>
  )
}