'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Loader2, Bitcoin, Bell, FileText, Plus } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { useWatchlist } from '@/hooks/use-watchlist'
import { toast } from 'sonner'

interface SearchResult {
  id: string
  symbol: string
  name: string
  thumb?: string
  large?: string
  market_cap_rank?: number
  price?: number
  price_change_24h?: number
}

interface AddToWatchlistModalProps {
  isOpen: boolean
  onClose: () => void
}

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

export function AddToWatchlistModal({ isOpen, onClose }: AddToWatchlistModalProps) {
  const { addToWatchlist, isAdding } = useWatchlist()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState<SearchResult | null>(null)
  const [alertPrice, setAlertPrice] = useState('')
  const [notes, setNotes] = useState('')

  // Search coins using CoinGecko API
  const searchCoins = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.coins?.slice(0, 10) || [])
        }
      } catch (error) {
        console.error('Error searching coins:', error)
        toast.error('Arama başarısız oldu')
      } finally {
        setIsSearching(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    searchCoins(searchQuery)
  }, [searchQuery, searchCoins])

  const handleSelectCoin = async (coin: SearchResult) => {
    setSelectedCoin(coin)
    setSearchQuery(coin.name)
    setSearchResults([])

    // Try to fetch current price
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data[coin.id]) {
          setSelectedCoin({
            ...coin,
            price: data[coin.id].usd,
            price_change_24h: data[coin.id].usd_24h_change
          })
        }
      }
    } catch (error) {
      console.error('Error fetching price:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCoin) {
      toast.error('Lütfen bir coin seçin')
      return
    }

    addToWatchlist({
      coinId: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      alertPrice: alertPrice ? parseFloat(alertPrice) : undefined,
      notes: notes || undefined
    })

    // Reset form
    setSelectedCoin(null)
    setSearchQuery('')
    setAlertPrice('')
    setNotes('')
    onClose()
  }

  const resetModal = () => {
    setSelectedCoin(null)
    setSearchQuery('')
    setSearchResults([])
    setAlertPrice('')
    setNotes('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <PremiumCard variant="glass" className="relative p-6">
              <button
                onClick={() => {
                  resetModal()
                  onClose()
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">
                Watchlist'e Ekle
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Coin Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coin Ara
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                      placeholder="Bitcoin, Ethereum, BNB..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                    )}
                  </div>

                  {/* Search Results */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                      >
                        {searchResults.map((coin) => (
                          <button
                            key={coin.id}
                            type="button"
                            onClick={() => handleSelectCoin(coin)}
                            className="w-full px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3"
                          >
                            {coin.thumb ? (
                              <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <Bitcoin className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <p className="text-white font-medium">{coin.name}</p>
                              <p className="text-gray-400 text-sm">{coin.symbol}</p>
                            </div>
                            {coin.market_cap_rank && (
                              <span className="text-gray-500 text-sm">#{coin.market_cap_rank}</span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Coin Info */}
                {selectedCoin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {selectedCoin.large ? (
                        <img src={selectedCoin.large} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <Bitcoin className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium">{selectedCoin.name}</p>
                        <p className="text-gray-400 text-sm">{selectedCoin.symbol.toUpperCase()}</p>
                      </div>
                      {selectedCoin.price && (
                        <div className="text-right">
                          <p className="text-white font-medium">
                            ${selectedCoin.price.toFixed(selectedCoin.price < 1 ? 6 : 2)}
                          </p>
                          {selectedCoin.price_change_24h && (
                            <p className={`text-sm ${selectedCoin.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {selectedCoin.price_change_24h >= 0 ? '+' : ''}{selectedCoin.price_change_24h.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Alert Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fiyat Uyarısı (İsteğe Bağlı)
                  </label>
                  <PremiumInput
                    type="number"
                    step="any"
                    placeholder="Hedef fiyat girin"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    icon={Bell}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notlar (İsteğe Bağlı)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all resize-none"
                    placeholder="Bu coin hakkında notlarınız..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetModal()
                      onClose()
                    }}
                    className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    İptal
                  </button>
                  <PremiumButton
                    type="submit"
                    disabled={!selectedCoin || isAdding}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Ekleniyor...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Watchlist'e Ekle
                      </>
                    )}
                  </PremiumButton>
                </div>
              </form>
            </PremiumCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}