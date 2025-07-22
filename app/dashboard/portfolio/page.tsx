'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumSkeleton } from '@/components/ui/premium-skeleton'
import { AreaChart, PieChart as PieChartComponent } from '@/components/charts'
import PortfolioCreationModal from '@/components/portfolio/PortfolioCreationModal'

export default function PortfolioPage() {
  const { portfolios, isLoading, createPortfolio, isCreating } = usePortfolio()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const totalValue = portfolios?.reduce((sum, p) => sum + p.totalValue, 0) || 0
  const totalCost = portfolios?.reduce((sum, p) => sum + p.totalCost, 0) || 0
  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

  const mockChartData = [
    { name: 'Jan', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 },
    { name: 'May', value: 58000 },
    { name: 'Jun', value: 67000 },
    { name: 'Jul', value: 72000 }
  ]

  const pieData = portfolios?.map(p => ({
    name: p.name,
    value: p.totalValue,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`
  })) || []

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
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
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
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="border border-gray-800 rounded-lg p-4 hover:border-accent-slate/50 transition-colors">
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
                          Value: ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`text-sm ${portfolio.totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {portfolio.totalProfitLossPercentage >= 0 ? '+' : ''}{portfolio.totalProfitLossPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <PremiumButton variant="outline" size="sm">
                      View Details
                    </PremiumButton>
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
          // Refresh portfolios after creation
          window.location.reload()
        }}
      />
    </div>
  )
}