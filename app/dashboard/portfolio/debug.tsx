'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/contexts/AuthContext'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import PortfolioAssetManager from '@/components/portfolio/PortfolioAssetManager'
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal'
import { toast } from 'sonner'

interface PortfolioAsset {
  _id?: string
  symbol: string
  amount: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
  currentValue?: number
  profitLoss?: number
  profitLossPercentage?: number
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
  lastUpdated: string
  createdAt: string
}

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [hideValues, setHideValues] = useState(false)

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    if (hideValues) return '***'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }

  // Format percentage helper  
  const formatPercentage = (percentage: number): string => {
    if (hideValues) return '***'
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  // Fetch portfolios
  const fetchPortfolios = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Fetching portfolios...')
      
      const response = await fetch('/api/portfolios', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolios: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Portfolio data received:', data)
      
      setPortfolios(data)
      
      // Select first portfolio if none selected
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0])
        console.log('✅ Selected first portfolio:', data[0])
      }
    } catch (error) {
      console.error('❌ Error fetching portfolios:', error)
      toast.error('Failed to fetch portfolios')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh portfolios
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPortfolios()
    setRefreshing(false)
    toast.success('Portfolios refreshed')
  }

  // Update portfolios when assets change
  const handleAssetsUpdate = () => {
    console.log('🔄 Assets updated, refreshing portfolios...')
    fetchPortfolios()
  }

  // Handle portfolio creation
  const handlePortfolioCreated = (newPortfolio: Portfolio) => {
    console.log('✅ New portfolio created:', newPortfolio)
    setPortfolios(prev => [newPortfolio, ...prev])
    setSelectedPortfolio(newPortfolio)
    setShowCreateModal(false)
    toast.success('Portfolio created successfully!')
  }

  // Fetch portfolios on mount
  useEffect(() => {
    if (!authLoading && user) {
      fetchPortfolios()
    }
  }, [authLoading, user])

  // Debug log for selected portfolio assets
  useEffect(() => {
    if (selectedPortfolio?.assets) {
      console.log('🔍 Debug - Selected portfolio assets:', selectedPortfolio.assets.map(asset => ({
        symbol: asset.symbol,
        amount: asset.amount,
        purchasePrice: asset.purchasePrice,
        currentPrice: asset.currentPrice,
        profitLoss: asset.profitLoss
      })))
    }
  }, [selectedPortfolio])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Management</h1>
            <p className="text-gray-400 mt-2">Track and manage your crypto investments</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title={hideValues ? 'Show values' : 'Hide values'}
            >
              {hideValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh portfolios"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <PremiumButton
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Portfolio
            </PremiumButton>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {selectedPortfolio && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <PremiumCard className="p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Value</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(selectedPortfolio.totalValue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(selectedPortfolio.lastUpdated).toLocaleTimeString()}
              </p>
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Cost</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(selectedPortfolio.totalCost)}
              </p>
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">P&L</h3>
              <p className={`text-2xl font-bold ${
                selectedPortfolio.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(selectedPortfolio.totalProfitLoss)}
              </p>
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">P&L %</h3>
              <p className={`text-2xl font-bold ${
                selectedPortfolio.totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercentage(selectedPortfolio.totalProfitLossPercentage)}
              </p>
            </PremiumCard>
          </div>
        )}

        {/* Portfolio Selector */}
        {portfolios.length > 1 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select Portfolio</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors ${
                    selectedPortfolio?.id === portfolio.id
                      ? 'border-accent-slate bg-accent-slate/20 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-accent-slate hover:text-white'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{portfolio.name}</div>
                    <div className="text-xs">
                      {formatCurrency(portfolio.totalValue)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Asset Manager */}
        {selectedPortfolio ? (
          <PortfolioAssetManager
            portfolioId={selectedPortfolio.id}
            assets={selectedPortfolio.assets}
            onAssetsUpdate={handleAssetsUpdate}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-4">No Portfolios Found</h3>
            <p className="text-gray-400 mb-6">Create your first portfolio to start tracking your investments</p>
            <PremiumButton
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Portfolio
            </PremiumButton>
          </div>
        )}

        {/* Create Portfolio Modal */}
        <CreatePortfolioModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPortfolioCreated={handlePortfolioCreated}
        />
      </div>
    </div>
  )
}
