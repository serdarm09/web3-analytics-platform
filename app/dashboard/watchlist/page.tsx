"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Plus, Trash2, Bell, TrendingUp, TrendingDown, Search, Filter, Eye, Loader2 } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { StarBorder } from "@/components/ui/star-border"
import { PremiumInput } from "@/components/ui/premium-input"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { useWatchlist } from "@/hooks/use-watchlist"
import { AddToWatchlistModal } from "@/components/watchlist/AddToWatchlistModal"



export default function WatchlistPage() {
  const { watchlist, isLoading, removeFromWatchlist, isRemoving } = useWatchlist()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    return `$${(volume / 1e3).toFixed(2)}K`
  }

  const handleRemove = (id: string) => {
    removeFromWatchlist(id)
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

  const filteredItems = (watchlist || []).filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PremiumSkeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <PremiumSkeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
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
                Watchlist
              </h1>
              <p className="text-muted-foreground mt-2">
                Favori kripto paralarınızı takip edin ve fiyat uyarıları ayarlayın
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StarBorder 
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Coin Ekle
              </StarBorder>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <PremiumInput
                placeholder="Watchlist'te ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex gap-2">
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                {watchlist?.length || 0} Takip Ediliyor
              </PremiumBadge>
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Bell className="h-4 w-4 mr-2" />
                {watchlist?.filter(item => item.alertPrice).length || 0} Uyarı
              </PremiumBadge>
            </div>
          </div>
        </motion.div>


        {/* Watchlist Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center text-white font-bold text-lg">
                          {item.symbol.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.symbol}</p>
                        </div>
                      </div>
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-secondary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(item._id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>

                    {/* Price Info */}
                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{formatPrice(item.currentPrice || 0)}</p>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${(item.priceChange24h || 0) > 0 ? "text-green-500" : "text-red-500"}`}>
                            {(item.priceChange24h || 0) > 0 ? "+" : ""}{(item.priceChange24h || 0).toFixed(2)}%
                          </p>
                          <p className="text-xs text-muted-foreground">24h</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">7d:</span>
                        <span className={(item.priceChange7d || 0) > 0 ? "text-green-500" : "text-red-500"}>
                          {(item.priceChange7d || 0) > 0 ? "+" : ""}{(item.priceChange7d || 0).toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Volume:</span>
                        <span>{formatVolume(item.volume24h)}</span>
                      </div>
                    </div>

                    {/* Alert & Notes */}
                    {(item.alertPrice || item.notes) && (
                      <div className="pt-3 border-t space-y-2">
                        {item.alertPrice && (
                          <div className="flex items-center gap-2">
                            <Bell className="h-3 w-3 text-accent-slate" />
                            <span className="text-xs">Alert: {formatPrice(item.alertPrice)}</span>
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
                        )}
                      </div>
                    )}

                    {/* Added Date */}
                    <div className="text-xs text-muted-foreground">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Watchlist boş</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Aramanıza uygun sonuç bulunamadı" : "Takip etmek için kripto para ekleyin"}
            </p>
            {!searchQuery && (
              <StarBorder 
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Coin'i Ekle
              </StarBorder>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Add to Watchlist Modal */}
      <AddToWatchlistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}