"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Plus, Trash2, Bell, TrendingUp, TrendingDown, Search, Filter, Eye } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumInput } from "@/components/ui/premium-input"
import { PremiumBadge } from "@/components/ui/premium-badge"

interface WatchlistItem {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
  alertPrice?: number
  notes?: string
  addedAt: Date
}

const mockWatchlistItems: WatchlistItem[] = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    price: 45234.56,
    change24h: 5.34,
    change7d: 12.45,
    volume24h: 28456789012,
    marketCap: 883456789012,
    alertPrice: 50000,
    notes: "Watching for breakout above 50k",
    addedAt: new Date("2024-01-15")
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    price: 2456.78,
    change24h: -2.15,
    change7d: 8.23,
    volume24h: 15678901234,
    marketCap: 295678901234,
    alertPrice: 2300,
    notes: "Support level at 2300",
    addedAt: new Date("2024-01-10")
  },
  {
    id: "3",
    name: "Chainlink",
    symbol: "LINK",
    price: 14.56,
    change24h: 3.45,
    change7d: -1.23,
    volume24h: 567890123,
    marketCap: 8765432109,
    notes: "Oracle leader, long-term hold",
    addedAt: new Date("2024-01-20")
  }
]

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlistItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null)
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

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter(item => item.id !== id))
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

  const filteredItems = watchlist.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                My Watchlist
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your favorite cryptocurrencies and set price alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Coin
              </PremiumButton>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <PremiumInput
                placeholder="Search watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex gap-2">
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                {watchlist.length} Watching
              </PremiumBadge>
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Bell className="h-4 w-4 mr-2" />
                {watchlist.filter(item => item.alertPrice).length} Alerts
              </PremiumBadge>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PremiumCard className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold">$125,456.78</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">+5.67% (24h)</span>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Best Performer</p>
              <p className="text-2xl font-bold">BTC</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">+12.45% (7d)</span>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Price targets pending</p>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Watchlist Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
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
                      <PremiumButton
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromWatchlist(item.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </PremiumButton>
                    </div>

                    {/* Price Info */}
                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{formatPrice(item.price)}</p>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${item.change24h > 0 ? "text-green-500" : "text-red-500"}`}>
                            {item.change24h > 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                          </p>
                          <p className="text-xs text-muted-foreground">24h</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">7d:</span>
                        <span className={item.change7d > 0 ? "text-green-500" : "text-red-500"}>
                          {item.change7d > 0 ? "+" : ""}{item.change7d.toFixed(2)}%
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
            <h3 className="text-lg font-semibold mb-2">No items in watchlist</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No items match your search" : "Start adding cryptocurrencies to track"}
            </p>
            {!searchQuery && (
              <PremiumButton onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Coin
              </PremiumButton>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}