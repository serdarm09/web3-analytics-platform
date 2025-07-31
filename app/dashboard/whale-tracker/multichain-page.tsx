"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  AlertCircle, 
  TrendingUp,
  Fish,
  Activity,
  Clock,
  DollarSign,
  RefreshCw,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Star,
  Copy,
  Settings,
  BarChart3,
  PieChart,
  Network,
  X,
  Trash2,
  Edit
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { StarBorder } from "@/components/ui/star-border"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumInput } from "@/components/ui/premium-input"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { toast } from "sonner"
import { 
  useTrackedWallets, 
  useWalletStats,
  formatWalletAddress,
  getNetworkDisplayName,
  getNetworkColor,
  getNetworkIcon,
  formatBalance,
  formatUSDValue,
  SUPPORTED_NETWORKS,
  type TrackedWallet,
  type WalletAsset,
  type WalletTransaction
} from "@/hooks/use-multichain-wallets"

interface AddWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (address: string, network: string, label?: string, isOwned?: boolean) => void
}

function AddWalletModal({ isOpen, onClose, onAdd }: AddWalletModalProps) {
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('ethereum')
  const [label, setLabel] = useState('')
  const [isOwned, setIsOwned] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    try {
      setLoading(true)
      await onAdd(address.trim(), network, label.trim() || undefined, isOwned)
      setAddress('')
      setLabel('')
      setIsOwned(false)
      onClose()
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add Wallet to Track</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address
            </label>
            <PremiumInput
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {SUPPORTED_NETWORKS.map((net) => (
                <option key={net.id} value={net.id}>
                  {net.icon} {net.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Label (Optional)
            </label>
            <PremiumInput
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="My wallet, DeFi wallet, etc."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isOwned"
              checked={isOwned}
              onChange={(e) => setIsOwned(e.target.checked)}
              className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded"
            />
            <label htmlFor="isOwned" className="text-sm text-gray-300">
              This is my wallet
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <PremiumButton
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              type="submit"
              disabled={loading || !address.trim()}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Wallet'}
            </PremiumButton>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

interface WalletDetailModalProps {
  wallet: TrackedWallet | null
  isOpen: boolean
  onClose: () => void
  onRefresh: (walletId: string) => void
  onRemove: (walletId: string) => void
}

function WalletDetailModal({ wallet, isOpen, onClose, onRefresh, onRemove }: WalletDetailModalProps) {
  const [refreshing, setRefreshing] = useState(false)

  if (!isOpen || !wallet) return null

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh(wallet._id)
    } finally {
      setRefreshing(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    toast.success('Address copied to clipboard!')
  }

  const openExplorer = () => {
    const network = SUPPORTED_NETWORKS.find(n => wallet.chains.some(c => c.chain === n.id))
    if (network) {
      window.open(`${network.explorerUrl}/address/${wallet.address}`, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {wallet.label || 'Wallet Details'}
              </h3>
              <p className="text-gray-400 font-mono text-sm">
                {formatWalletAddress(wallet.address, 12)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </PremiumButton>
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={copyAddress}
            >
              <Copy className="w-4 h-4" />
            </PremiumButton>
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={openExplorer}
            >
              <ExternalLink className="w-4 h-4" />
            </PremiumButton>
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {formatUSDValue(wallet.totalValue)}
            </p>
            <p className="text-sm text-gray-400">Total Value</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Network className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {wallet.chains.length}
            </p>
            <p className="text-sm text-gray-400">Networks</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {wallet.totalTransactions}
            </p>
            <p className="text-sm text-gray-400">Transactions</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
              wallet.portfolioChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`} />
            <p className={`text-2xl font-bold ${
              wallet.portfolioChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {wallet.portfolioChange24h >= 0 ? '+' : ''}{wallet.portfolioChange24h.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-400">24h Change</p>
          </div>
        </div>

        {/* Chain Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Chain Breakdown</h4>
            <div className="space-y-3">
              {wallet.chains.map((chain, index) => {
                const network = SUPPORTED_NETWORKS.find(n => n.id === chain.chain)
                return (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{network?.icon || '⚡'}</span>
                        <span className="text-white font-medium">
                          {network?.name || chain.chain}
                        </span>
                      </div>
                      <span className="text-white font-bold">
                        {formatUSDValue(chain.totalValue)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Native: </span>
                        <span className="text-white">
                          {formatBalance(chain.nativeBalanceFormatted)} {network?.symbol}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tokens: </span>
                        <span className="text-white">{chain.tokenCount}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Top Assets</h4>
            <div className="space-y-3">
              {wallet.assets.slice(0, 10).map((asset, index) => (
                <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {asset.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{asset.name}</p>
                        <p className="text-gray-400 text-sm">
                          {formatBalance(asset.balance)} {asset.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatUSDValue(asset.value)}
                      </p>
                      {asset.change24h !== undefined && (
                        <p className={`text-sm ${
                          asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {wallet.transactions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Recent Transactions</h4>
            <div className="space-y-2">
              {wallet.transactions.slice(0, 5).map((tx, index) => {
                const network = SUPPORTED_NETWORKS.find(n => n.id === tx.chain)
                return (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'in' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {tx.type === 'in' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {tx.type === 'in' ? 'Received' : 'Sent'} {tx.tokenSymbol}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {network?.name} • {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {formatBalance(tx.amount)} {tx.tokenSymbol}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatUSDValue(tx.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
          <PremiumButton
            variant="outline"
            onClick={() => onRemove(wallet._id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </PremiumButton>
          <PremiumButton
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </PremiumButton>
        </div>
      </motion.div>
    </div>
  )
}

export default function EnhancedWhaleTrackerPage() {
  const { wallets, loading, error, refetch, addWallet, removeWallet, refreshWallet } = useTrackedWallets()
  const stats = useWalletStats(wallets)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<TrackedWallet | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'transactions' | 'recent'>('value')

  const filteredWallets = wallets
    .filter(wallet => {
      const matchesSearch = 
        wallet.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesNetwork = !selectedNetwork || 
        wallet.chains.some(chain => chain.chain === selectedNetwork)
      
      return matchesSearch && matchesNetwork
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue
        case 'change':
          return b.portfolioChange24h - a.portfolioChange24h
        case 'transactions':
          return b.totalTransactions - a.totalTransactions
        case 'recent':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        default:
          return 0
      }
    })

  const handleAddWallet = async (address: string, network: string, label?: string, isOwned?: boolean) => {
    await addWallet(address, network, label, isOwned)
  }

  const handleWalletClick = (wallet: TrackedWallet) => {
    setSelectedWallet(wallet)
    setShowWalletModal(true)
  }

  const handleRefresh = async () => {
    await refetch()
    toast.success('Wallet data refreshed!')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <PremiumSkeleton className="h-8 w-64" />
          <PremiumSkeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-24" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
              Multichain Whale Tracker
            </h1>
            <p className="text-gray-400 mt-2">Track whale wallets across multiple blockchain networks</p>
          </div>
          
          <div className="flex items-center gap-3">
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </PremiumButton>
            <PremiumButton
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Wallet
            </PremiumButton>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Wallets</p>
                <p className="text-2xl font-bold text-white">{stats.totalWallets}</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white">{formatUSDValue(stats.totalValue)}</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                <Fish className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Whale Wallets</p>
                <p className="text-2xl font-bold text-white">{stats.whaleWallets}</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active (24h)</p>
                <p className="text-2xl font-bold text-white">{stats.activeWallets}</p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <PremiumInput
              icon={Search}
              placeholder="Search wallets by address or label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">All Networks</option>
              {SUPPORTED_NETWORKS.map(network => (
                <option key={network.id} value={network.id}>
                  {network.icon} {network.name}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="value">Sort by Value</option>
              <option value="change">Sort by Change</option>
              <option value="transactions">Sort by Activity</option>
              <option value="recent">Sort by Recent</option>
            </select>
          </div>
        </div>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredWallets.map((wallet, index) => (
              <motion.div
                key={wallet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard 
                  className="p-6 h-full cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => handleWalletClick(wallet)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {wallet.label || 'Unnamed Wallet'}
                        </h3>
                        <p className="text-sm text-gray-400 font-mono">
                          {formatWalletAddress(wallet.address)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {wallet.isWhale && (
                        <PremiumBadge variant="gold" size="sm">
                          <Fish className="w-3 h-3 mr-1" />
                          Whale
                        </PremiumBadge>
                      )}
                      <PremiumBadge variant="outline" size="sm">
                        Risk: {wallet.riskScore}
                      </PremiumBadge>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Value</span>
                      <span className="text-white font-bold">
                        {formatUSDValue(wallet.totalValue)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">24h Change</span>
                      <span className={`font-medium flex items-center gap-1 ${
                        wallet.portfolioChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {wallet.portfolioChange24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                        {Math.abs(wallet.portfolioChange24h).toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Networks</span>
                      <div className="flex items-center gap-1">
                        {wallet.chains.slice(0, 3).map((chain, idx) => {
                          const network = SUPPORTED_NETWORKS.find(n => n.id === chain.chain)
                          return (
                            <span key={idx} className="text-sm">
                              {network?.icon || '⚡'}
                            </span>
                          )
                        })}
                        {wallet.chains.length > 3 && (
                          <span className="text-gray-400 text-xs">
                            +{wallet.chains.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                    <div className="text-xs text-gray-400">
                      Last active: {new Date(wallet.lastActivity).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(wallet.address)
                          toast.success('Address copied!')
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWalletClick(wallet)
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredWallets.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No wallets found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || selectedNetwork 
                ? 'Try adjusting your search or filters'
                : 'Start tracking whale wallets to see their activity'
              }
            </p>
            {(!searchTerm && !selectedNetwork) && (
              <PremiumButton
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Wallet
              </PremiumButton>
            )}
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      <AddWalletModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddWallet}
      />

      {/* Wallet Detail Modal */}
      <WalletDetailModal
        wallet={selectedWallet}
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onRefresh={refreshWallet}
        onRemove={removeWallet}
      />
    </>
  )
}
