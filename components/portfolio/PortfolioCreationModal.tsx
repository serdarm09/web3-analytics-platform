'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Search, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { FormInput } from '@/components/ui/form-input'
import { toast } from 'sonner'

interface Asset {
  id: string
  symbol: string
  name: string
  amount: number
  purchasePrice: number
  currentPrice?: number
}

interface PortfolioCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function PortfolioCreationModal({ isOpen, onClose, onSuccess }: PortfolioCreationModalProps) {
  const [portfolioName, setPortfolioName] = useState('')
  const [description, setDescription] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Asset form states
  const [assetSearch, setAssetSearch] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; name: string } | null>(null)
  const [amount, setAmount] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')

  const popularAssets = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'DOT', name: 'Polkadot' },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!portfolioName.trim()) {
      newErrors.name = 'Portfolio name is required'
    }
    
    if (assets.length === 0) {
      newErrors.assets = 'Add at least one asset to your portfolio'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAsset = () => {
    if (!selectedAsset) {
      toast.error('Please select an asset')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      toast.error('Please enter a valid purchase price')
      return
    }
    
    const newAsset: Asset = {
      id: `${selectedAsset.symbol}-${Date.now()}`,
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      amount: parseFloat(amount),
      purchasePrice: parseFloat(purchasePrice),
    }
    
    setAssets([...assets, newAsset])
    
    // Reset form
    setSelectedAsset(null)
    setAssetSearch('')
    setAmount('')
    setPurchasePrice('')
    
    toast.success(`${selectedAsset.symbol} added to portfolio`)
  }

  const removeAsset = (assetId: string) => {
    setAssets(assets.filter(a => a.id !== assetId))
  }

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      return total + (asset.amount * asset.purchasePrice)
    }, 0)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Create portfolio payload
      const portfolioData = {
        name: portfolioName,
        description,
        assets: assets.map(asset => ({
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          purchasePrice: asset.purchasePrice,
        }))
      }
      
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      toast.success('Portfolio created successfully!')
      onSuccess?.()
      handleClose()
    } catch (error) {
      toast.error('Failed to create portfolio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setPortfolioName('')
      setDescription('')
      setAssets([])
      setSelectedAsset(null)
      setAssetSearch('')
      setAmount('')
      setPurchasePrice('')
      setErrors({})
      onClose()
    }
  }

  const filteredAssets = popularAssets.filter(asset => 
    asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.name.toLowerCase().includes(assetSearch.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-50 flex min-h-full items-center justify-center p-4"
        >
          <PremiumCard className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
                  Create New Portfolio
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Track your crypto investments in one place
                </p>
              </div>
              
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Portfolio Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Portfolio Details</h3>
                  
                  <FormInput
                    label="Portfolio Name"
                    placeholder="My Crypto Portfolio"
                    value={portfolioName}
                    onChange={(e) => setPortfolioName(e.target.value)}
                    error={errors.name}
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Description (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-teal focus:border-transparent resize-none h-24"
                      placeholder="Add notes about your investment strategy..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Add Assets */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Add Assets</h3>
                  
                  {errors.assets && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <p className="text-sm text-red-400">{errors.assets}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Asset
                      </label>
                      <div className="relative">
                        <PremiumInput
                          placeholder="Search for assets..."
                          value={assetSearch}
                          onChange={(e) => setAssetSearch(e.target.value)}
                          icon={Search}
                        />
                        {assetSearch && (
                          <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                            {filteredAssets.map(asset => (
                              <button
                                key={asset.symbol}
                                onClick={() => {
                                  setSelectedAsset(asset)
                                  setAssetSearch(asset.symbol)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-medium text-white">{asset.symbol}</p>
                                  <p className="text-sm text-gray-400">{asset.name}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <FormInput
                      label="Amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    
                    <FormInput
                      label="Purchase Price ($)"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                  
                  <PremiumButton
                    onClick={handleAddAsset}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </PremiumButton>
                </div>

                {/* Assets List */}
                {assets.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Portfolio Assets</h3>
                    <div className="space-y-2">
                      {assets.map(asset => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center text-white font-bold">
                              {asset.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{asset.symbol}</p>
                              <p className="text-sm text-gray-400">{asset.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Amount</p>
                              <p className="font-medium">{asset.amount}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Price</p>
                              <p className="font-medium">${asset.purchasePrice}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Value</p>
                              <p className="font-medium">
                                ${(asset.amount * asset.purchasePrice).toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeAsset(asset.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-gray-300">Total Portfolio Value</p>
                        <p className="text-2xl font-bold text-white">
                          ${calculateTotalValue().toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-end gap-4">
                <PremiumButton
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  onClick={handleSubmit}
                  disabled={isLoading || assets.length === 0}
                >
                  {isLoading ? 'Creating...' : 'Create Portfolio'}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}