'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Bitcoin
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumInput } from '@/components/ui/premium-input'
import { toast } from 'sonner'
// Removed useRealTimePrices import - using direct API calls instead

// Simple debounce implementation
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

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

// Format helpers
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount).replace('US$', '$')
}

const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

interface SearchResult {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  logo?: string
  marketCap?: number
  volume24h?: number
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState<SearchResult | null>(null)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(10)
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })

  // Get symbols from assets for real-time price updates - memoized to prevent unnecessary re-renders
  const assetSymbols = useMemo(() => assets.map(asset => asset.symbol.toUpperCase()), [assets])
  
  // Fetch real-time prices from API
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshPrices = useCallback(async () => {
    if (assetSymbols.length === 0) return;
    
    setPricesLoading(true);
    try {
      const response = await fetch(`/api/crypto/market-data?symbols=${assetSymbols.join(',')}`);
      const data = await response.json();
      
      if (data.success) {
        const priceMap: Record<string, any> = {};
        data.data.forEach((coin: any) => {
          priceMap[coin.symbol] = {
            price: coin.price,
            change24h: coin.change24h
          };
        });
        setPrices(priceMap);
        setLastUpdate(new Date());
        console.log(`🟢 Portfolio prices updated successfully for ${assetSymbols.join(', ')}`);
      } else {
        console.log(`🟡 API returned success=false: ${data.error || 'Unknown error'}`);
        // Don't throw error, just log it
      }
    } catch (error) {
      console.error('🔴 Error fetching prices:', error);
      // Don't throw error to prevent UI breaks, just log
    } finally {
      setPricesLoading(false);
    }
  }, [assetSymbols]);

  // Auto-refresh prices - increased frequency to reduce API calls and prevent rate limiting
  useEffect(() => {
    if (assetSymbols.length > 0) {
      refreshPrices();
      const interval = setInterval(refreshPrices, 600000); // Refresh every 10 minutes to reduce API load
      return () => clearInterval(interval);
    }
  }, [assetSymbols]); // Depend on memoized assetSymbols

  // Calculate portfolio totals with real-time prices
  const portfolioTotals = useMemo(() => {
    let totalCurrentValue = 0
    let totalPurchaseValue = 0

    assets.forEach(asset => {
      const realTimePrice = prices[asset.symbol.toUpperCase()]
      
      // Use better price logic: real-time > stored current price > purchase price
      let currentPrice = asset.purchasePrice; // Default fallback
      if (realTimePrice?.price && realTimePrice.price > 0) {
        currentPrice = realTimePrice.price;
      } else if (asset.currentPrice && asset.currentPrice > 0) {
        currentPrice = asset.currentPrice;
      }
      
      const currentValue = asset.amount * currentPrice
      const purchaseValue = asset.amount * asset.purchasePrice

      totalCurrentValue += currentValue
      totalPurchaseValue += purchaseValue
    })

    const totalProfitLoss = totalCurrentValue - totalPurchaseValue
    const totalProfitLossPercentage = totalPurchaseValue > 0 ? (totalProfitLoss / totalPurchaseValue) * 100 : 0

    return {
      totalCurrentValue,
      totalPurchaseValue,
      totalProfitLoss,
      totalProfitLossPercentage
    }
  }, [assets, prices])

  // Fetch popular coins when search is empty
  const fetchPopularCoins = useCallback(async () => {
    setIsSearching(true)
    try {
      const response = await fetch('/api/crypto/search?q=&limit=20')
      const data = await response.json()
      
      if (data.success && data.data) {
        setSearchResults(data.data)
        setShowSearchDropdown(true)
      }
    } catch (error) {
      console.error('Error fetching popular coins:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Search for cryptocurrencies
  const searchCrypto = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 1) {
        // Show popular coins instead of empty results
        fetchPopularCoins()
        setManualEntry(false)
        return
      }

      setIsSearching(true)
      try {
        // Use our API endpoint which handles CoinGecko calls server-side
        const response = await fetch(`/api/crypto/search?q=${encodeURIComponent(query)}&limit=50`)
        const data = await response.json()
        
        console.log('Search response:', data) // Debug log
        
        if (data.success && data.data && data.data.length > 0) {
          // Results already include price data from the improved API
          setSearchResults(data.data)
          
          setShowSearchDropdown(true)
          setManualEntry(false)
        } else {
          // No results found, enable manual entry
          setSearchResults([])
          setManualEntry(true)
          setShowSearchDropdown(false)
        }
      } catch (error) {
        console.error('Error searching crypto:', error)
        setSearchResults([])
        setManualEntry(true)
        setShowSearchDropdown(false)
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [fetchPopularCoins]
  )

  // Check if entered symbol exists
  const checkSymbol = async (symbol: string) => {
    if (!symbol) return
    
    try {
      const response = await fetch('/api/crypto/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      })
      
      const data = await response.json()
      if (data.success && data.data) {
        if (!data.data.custom && data.data.price > 0) {
          setSelectedCoin(data.data)
          setFormData(prev => ({
            ...prev,
            symbol: data.data.symbol,
            purchasePrice: data.data.price.toFixed(2)
          }))
        } else {
          // Custom coin entry
          setSelectedCoin({
            id: symbol.toLowerCase(),
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(),
            price: 0,
            change24h: 0
          })
          setFormData(prev => ({
            ...prev,
            symbol: symbol.toUpperCase()
          }))
        }
      }
    } catch (error) {
      console.error('Error checking symbol:', error)
    }
  }

  useEffect(() => {
    setDisplayLimit(10) // Reset display limit when search query changes
    searchCrypto(searchQuery)
  }, [searchQuery, searchCrypto])

  const handleCoinSelect = async (coin: SearchResult) => {
    setSelectedCoin(coin)
    setSearchQuery(coin.name)
    setShowSearchDropdown(false)
    
    // If price is not available, try to get it from our API
    if (!coin.price || coin.price === 0) {
      try {
        const response = await fetch('/api/crypto/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: coin.symbol })
        })
        
        const data = await response.json()
        if (data.success && data.data && data.data.price > 0) {
          const updatedCoin = {
            ...coin,
            price: data.data.price,
            change24h: data.data.change24h || 0
          }
          setSelectedCoin(updatedCoin)
          setFormData({
            ...formData,
            symbol: coin.symbol,
            purchasePrice: data.data.price.toFixed(data.data.price < 1 ? 6 : 2)
          })
          return
        }
      } catch (error) {
        console.error('Error fetching coin price from API:', error)
      }
    }
    
    // Use existing price if available
    setFormData({
      ...formData,
      symbol: coin.symbol,
      purchasePrice: coin.price ? coin.price.toFixed(coin.price < 1 ? 6 : 2) : ''
    })
  }

  const resetForm = () => {
    setFormData({
      symbol: '',
      amount: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    })
    setEditingAsset(null)
    setShowAddForm(false)
    setSearchQuery('')
    setSelectedCoin(null)
    setSearchResults([])
    setManualEntry(false)
    setDisplayLimit(10)
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // If manual entry and no symbol set, use search query
      const symbol = formData.symbol || (manualEntry ? searchQuery.toUpperCase() : '')
      
      if (!symbol) {
        toast.error('Please select a coin or enter a symbol')
        setIsLoading(false)
        return
      }

      // Get auth token
      const token = localStorage.getItem('auth_token')
      
      console.log('Adding asset:', {
        portfolioId,
        symbol,
        amount: formData.amount,
        purchasePrice: formData.purchasePrice,
        token: token ? 'exists' : 'missing'
      })
      
      const response = await fetch(`/api/portfolios/${portfolioId}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          amount: parseFloat(formData.amount),
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseDate: formData.purchaseDate
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { error: errorText }
        }
        console.error('Asset add error:', {
          status: response.status,
          statusText: response.statusText,
          error: error,
          url: response.url
        })
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

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Bu varlığı kaldırmak istediğinizden emin misiniz?')) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`/api/portfolios/${portfolioId}/assets?assetId=${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove asset')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">Portfolio Assets</h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-400 text-sm">Manage and track your crypto holdings</p>
            {lastUpdate && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${pricesLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs text-gray-500">
                  Last updated: {lastUpdate.toLocaleTimeString('en-US')}
                </p>
                <button
                  onClick={refreshPrices}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                  disabled={pricesLoading}
                >
                  {pricesLoading ? 'Updating...' : 'Refresh'}
                </button>
              </div>
            )}
            {!lastUpdate && !pricesLoading && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <p className="text-xs text-gray-500">
                  Prices not loaded yet
                </p>
                <button
                  onClick={refreshPrices}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Load Prices
                </button>
              </div>
            )}
          </div>
          
        </div>
        <StarBorder
          as="button"
          type="button"
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          color="#3B82F6"
          speed="4s"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </div>
        </StarBorder>
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

              <form onSubmit={handleAddAsset} className="space-y-6">
                {/* Coin Search Section */}
                {!editingAsset && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Cryptocurrency or Enter Symbol
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Örn: Bitcoin, BTC, PEPE, SHIB..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (searchResults.length > 0) {
                            setShowSearchDropdown(true)
                          } else if (!searchQuery) {
                            fetchPopularCoins()
                          }
                        }}
                        onBlur={(e) => {
                          // Delay to allow click on dropdown
                          setTimeout(() => {
                            if (manualEntry && searchQuery) {
                              checkSymbol(searchQuery)
                            }
                            setShowSearchDropdown(false)
                          }, 200)
                        }}
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {showSearchDropdown && searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto"
                        >
                          {searchResults.slice(0, displayLimit).map((coin) => (
                            <button
                              key={coin.id}
                              type="button"
                              onClick={() => handleCoinSelect(coin)}
                              className="w-full px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                {coin.logo ? (
                                  <img 
                                    src={coin.logo} 
                                    alt={coin.name} 
                                    className="w-10 h-10 rounded-full"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <div className={`w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center ${coin.logo ? 'hidden' : ''}`}>
                                  <span className="text-xs font-bold text-gray-400">{coin.symbol.slice(0, 3)}</span>
                                </div>
                                <div className="text-left">
                                  <p className="text-white font-medium">{coin.name}</p>
                                  <p className="text-gray-400 text-sm">{coin.symbol}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {coin.price > 0 ? (
                                  <>
                                    <p className="text-white font-medium">
                                      ${coin.price.toFixed(coin.price < 1 ? 6 : 2)}
                                    </p>
                                    <p className={`text-sm ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-gray-500 text-sm">Getting price...</p>
                                )}
                              </div>
                            </button>
                          ))}
                          {searchResults.length > displayLimit && (
                            <button
                              type="button"
                              onClick={() => setDisplayLimit(prev => prev + 20)}
                              className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 transition-colors text-center text-blue-400 hover:text-blue-300 font-medium border-t border-gray-700"
                            >
                              Daha fazla göster ({searchResults.length - displayLimit} coin daha)
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Manual Entry Notice */}
                    {manualEntry && searchQuery && !selectedCoin && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-40 w-full mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <p className="text-sm text-yellow-200">
                            "{searchQuery.toUpperCase()}" not found. You can add it manually.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Selected Coin Info */}
                {selectedCoin && !editingAsset && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">{selectedCoin.name} selected</p>
                          {selectedCoin.price > 0 ? (
                            <p className="text-gray-400 text-sm">
                              Current price: ${selectedCoin.price.toFixed(selectedCoin.price < 1 ? 6 : 2)}
                              {selectedCoin.change24h !== 0 && (
                                <span className={`ml-2 ${selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ({selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h.toFixed(2)}%)
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="text-yellow-400 text-sm">Price information not found, please enter manually</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCoin(null)
                          setSearchQuery('')
                          setFormData({ ...formData, symbol: '', purchasePrice: '' })
                          setManualEntry(false)
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {editingAsset && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sembol
                      </label>
                      <PremiumInput
                        type="text"
                        value={formData.symbol}
                        disabled
                        className="opacity-60"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <PremiumInput
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="pr-16"
                      />
                      {formData.symbol && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          {formData.symbol}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Purchase Price ($) 
                      <span className="text-blue-400 text-xs ml-1">- The price you paid</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <PremiumInput
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        required
                        className="pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    {selectedCoin && !editingAsset && selectedCoin.price > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Current market price: ${selectedCoin.price.toFixed(selectedCoin.price < 1 ? 6 : 2)}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, purchasePrice: selectedCoin.price!.toFixed(selectedCoin.price! < 1 ? 6 : 2) })}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline text-xs"
                        >
                          Use Current Market Price
                        </button>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <PremiumInput
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Cost Preview */}
                {formData.amount && formData.purchasePrice && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">Toplam Maliyet:</span>
                      </div>
                      <span className="text-xl font-bold text-white">
                        ${(parseFloat(formData.amount) * parseFloat(formData.purchasePrice)).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <StarBorder
                    as="button"
                    type="submit"
                    disabled={isLoading || !formData.symbol}
                    color="#3B82F6"
                    speed="4s"
                    className="min-w-[150px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <span>Add to Portfolio</span>
                    )}
                  </StarBorder>
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
              <p className="text-lg mb-2">No assets found in your portfolio</p>
              <p className="text-sm">Add your first crypto asset to track your portfolio performance</p>
            </div>
          </PremiumCard>
        ) : (
          assets.map((asset, index) => {
            // Get real-time price data for this asset
            const realTimePrice = prices[asset.symbol.toUpperCase()]
            
            // Improved price fallback logic
            let currentPrice = asset.purchasePrice; // Start with purchase price as baseline
            let isPriceReal = false;
            
            if (realTimePrice?.price && realTimePrice.price > 0) {
              currentPrice = realTimePrice.price;
              isPriceReal = true;
            } else if (asset.currentPrice && asset.currentPrice > 0) {
              currentPrice = asset.currentPrice;
              isPriceReal = true;
            }
            
            const currentValue = asset.amount * currentPrice
            const profitLoss = currentValue - (asset.amount * asset.purchasePrice)
            const profitLossPercentage = asset.purchasePrice > 0 ? (profitLoss / (asset.amount * asset.purchasePrice)) * 100 : 0
            
            return (
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
                          {asset.amount} units
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(currentValue)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Current Value
                          {isPriceReal && realTimePrice && (
                            <span className="ml-1 text-green-400 text-xs">● Live Market</span>
                          )}
                          {!isPriceReal && (
                            <span className="ml-1 text-yellow-400 text-xs">⚠ Using Purchase Price</span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatCurrency(asset.amount * asset.purchasePrice)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Initial Investment
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`font-medium flex items-center gap-1 ${
                          profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {profitLoss >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {formatCurrency(Math.abs(profitLoss))}
                        </p>
                        <p className={`text-sm ${
                          profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercentage(profitLossPercentage)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
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
                        <p className="text-gray-400">Your Purchase Price</p>
                        <p className="text-white font-medium">
                          {formatCurrency(asset.purchasePrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">
                          Current Market Price
                          {isPriceReal && realTimePrice && (
                            <span className="ml-1 text-green-400 text-xs">● Live</span>
                          )}
                          {!isPriceReal && (
                            <span className="ml-1 text-yellow-400 text-xs">⚠ Using purchase price</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">
                            {formatCurrency(currentPrice)}
                          </p>
                          {isPriceReal && realTimePrice && realTimePrice.change24h !== 0 && (
                            <span className={`text-xs ${realTimePrice.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({realTimePrice.change24h >= 0 ? '+' : ''}{realTimePrice.change24h.toFixed(2)}%)
                            </span>
                          )}
                          {!isPriceReal && (
                            <span className="text-xs text-yellow-400">
                              (Rate limited - showing your purchase price)
                            </span>
                          )}
                        </div>
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
            )
          })
        )}
      </div>
    </div>
  )
}
