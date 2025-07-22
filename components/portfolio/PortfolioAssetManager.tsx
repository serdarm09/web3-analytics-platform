'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { toast } from 'sonner'

interface Asset {
  _id?: string
  projectId?: string
  symbol: string
  amount: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
  currentValue?: number
  profitLoss?: number
  profitLossPercentage?: number
}

interface PortfolioAssetManagerProps {
  portfolioId: string
  assets: Asset[]
  onAssetsUpdate: () => void
}

export default function PortfolioAssetManager({ portfolioId, assets, onAssetsUpdate }: PortfolioAssetManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })

  const resetForm = () => {
    setFormData({
      symbol: '',
      amount: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    })
    setEditingAsset(null)
    setShowAddForm(false)
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: formData.symbol.toUpperCase(),
          amount: parseFloat(formData.amount),
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseDate: formData.purchaseDate
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add asset')
      }

      toast.success('Asset added successfully!')
      resetForm()
      onAssetsUpdate()
    } catch (error) {
      console.error('Error adding asset:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add asset')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData({
      symbol: asset.symbol,
      amount: asset.amount.toString(),
      purchasePrice: asset.purchasePrice.toString(),
      purchaseDate: new Date(asset.purchaseDate).toISOString().split('T')[0]
    })
    setShowAddForm(true)
  }

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset?._id) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/assets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: editingAsset._id,
          amount: parseFloat(formData.amount),
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseDate: formData.purchaseDate
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update asset')
      }

      toast.success('Asset updated successfully!')
      resetForm()
      onAssetsUpdate()
    } catch (error) {
      console.error('Error updating asset:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update asset')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to remove this asset?')) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/assets?assetId=${assetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete asset')
      }

      toast.success('Asset removed successfully!')
      onAssetsUpdate()
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove asset')
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Portfolio Assets</h3>
        <PremiumButton 
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </PremiumButton>
      </div>

      {/* Add/Edit Asset Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h4>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Symbol
                    </label>
                    <PremiumInput
                      type="text"
                      placeholder="BTC, ETH, etc."
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      required
                      disabled={!!editingAsset}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount
                    </label>
                    <PremiumInput
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Price ($)
                    </label>
                    <PremiumInput
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <PremiumInput
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <PremiumButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Add Asset')}
                  </PremiumButton>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assets List */}
      <div className="space-y-4">
        {assets.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <div className="text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No assets in this portfolio yet</p>
              <p className="text-sm">Add your first crypto asset to start tracking your portfolio performance</p>
            </div>
          </PremiumCard>
        ) : (
          assets.map((asset, index) => (
            <motion.div
              key={asset._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PremiumCard className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-slate/20 rounded-lg flex items-center justify-center">
                      <span className="text-accent-slate font-bold text-sm">
                        {asset.symbol}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {asset.symbol}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {asset.amount} tokens
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatCurrency(asset.currentValue || (asset.amount * asset.purchasePrice))}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Current Value
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatCurrency(asset.amount * asset.purchasePrice)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Cost Basis
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`font-medium flex items-center gap-1 ${
                        (asset.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(asset.profitLoss || 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatCurrency(Math.abs(asset.profitLoss || 0))}
                      </p>
                      <p className={`text-sm ${
                        (asset.profitLossPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercentage(asset.profitLossPercentage || 0)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAsset(asset)}
                        className="p-2 text-gray-400 hover:text-accent-slate transition-colors"
                        disabled={isLoading}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => asset._id && handleDeleteAsset(asset._id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Purchase Price</p>
                      <p className="text-white font-medium">
                        {formatCurrency(asset.purchasePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Current Price</p>
                      <p className="text-white font-medium">
                        {formatCurrency(asset.currentPrice || asset.purchasePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Purchase Date</p>
                      <p className="text-white font-medium">
                        {new Date(asset.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
