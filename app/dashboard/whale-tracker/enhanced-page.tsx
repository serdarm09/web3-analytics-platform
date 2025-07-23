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
  Network
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumInput } from "@/components/ui/premium-input"
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
  type TrackedWallet,
  type WalletAsset,
  type WalletTransaction
} from "@/hooks/use-tracked-wallets"
import { useUserActivities } from "@/hooks/use-activities"

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

  const networks = [
    { value: 'ethereum', label: 'Ethereum', icon: '🟦' },
    { value: 'bitcoin', label: 'Bitcoin', icon: '🟠' },
    { value: 'solana', label: 'Solana', icon: '🟣' },
    { value: 'polygon', label: 'Polygon', icon: '🟪' },
    { value: 'binance-smart-chain', label: 'BSC', icon: '🟡' },
    { value: 'avalanche', label: 'Avalanche', icon: '🔴' },
    { value: 'arbitrum', label: 'Arbitrum', icon: '🔵' },
    { value: 'optimism', label: 'Optimism', icon: '🔴' }
  ]

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
      toast.success('Wallet added successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add wallet')
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
        className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Add Wallet to Track</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Wallet Address
            </label>
            <PremiumInput
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... or bc1... or other wallet address"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border bg-gray-900/50 border-gray-600 text-white focus:outline-none focus:border-accent-slate"
            >
              {networks.map((net) => (
                <option key={net.value} value={net.value}>
                  {net.icon} {net.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Label (Optional)
            </label>
            <PremiumInput
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Whale #1, Trading Wallet, etc."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isOwned"
              checked={isOwned}
              onChange={(e) => setIsOwned(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isOwned" className="text-sm text-gray-300">
              This is my wallet
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <PremiumButton
              type="button"
              variant="outline"
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

export default function EnhancedWhaleTrackerPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')
  const [filterOwned, setFilterOwned] = useState<boolean | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<TrackedWallet | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const { wallets, loading, error, fetchWallets, addWallet } = useTrackedWallets(
    selectedNetwork || undefined,
    filterOwned
  )
  const { stats, loading: statsLoading } = useWalletStats()
  const { createActivity } = useUserActivities()

  const filteredWallets = wallets.filter(wallet =>
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getNetworkDisplayName(wallet.network).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddWallet = async (
    address: string,
    network: string,
    label?: string,
    isOwned?: boolean
  ) => {
    await addWallet(address, network, label, isOwned)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchWallets()
      await createActivity(
        'whale_track',
        'Refreshed wallet tracking data',
        { action: 'refresh_all' }
      )
      toast.success('Wallet data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Address copied!')
  }

  const getExplorerUrl = (address: string, network: string) => {
    const explorers: { [key: string]: string } = {
      'ethereum': `https://etherscan.io/address/${address}`,
      'bitcoin': `https://blockstream.info/address/${address}`,
      'solana': `https://solscan.io/account/${address}`,
      'polygon': `https://polygonscan.com/address/${address}`,
      'binance-smart-chain': `https://bscscan.com/address/${address}`,
      'avalanche': `https://snowtrace.io/address/${address}`,
      'arbitrum': `https://arbiscan.io/address/${address}`,
      'optimism': `https://optimistic.etherscan.io/address/${address}`
    }
    return explorers[network] || '#'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-900/30 p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
              Multi-Chain Wallet Tracker
            </h1>
            <p className="text-gray-400 mt-2">
              Track wallets across multiple blockchain networks and monitor their activities
            </p>
          </div>
          <div className="flex gap-3">
            <PremiumButton
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </PremiumButton>
            <PremiumButton onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </PremiumButton>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Wallets</p>
                  <p className="text-2xl font-bold text-white">{stats.total.totalWallets}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  👛
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatUSDValue(stats.total.totalValue)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  💰
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Owned Wallets</p>
                  <p className="text-2xl font-bold text-white">{stats.total.totalOwned}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  🔐
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tracked Wallets</p>
                  <p className="text-2xl font-bold text-white">{stats.total.totalTracked}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  👁️
                </div>
              </div>
            </PremiumCard>
          </div>
        )}

        {/* Filters and Search */}
        <PremiumCard className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <PremiumInput
                  placeholder="Search wallets, labels, or networks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="px-4 py-2 rounded-lg border bg-gray-900/50 border-gray-600 text-white focus:outline-none focus:border-accent-slate"
              >
                <option value="">All Networks</option>
                <option value="ethereum">🟦 Ethereum</option>
                <option value="bitcoin">🟠 Bitcoin</option>
                <option value="solana">🟣 Solana</option>
                <option value="polygon">🟪 Polygon</option>
                <option value="binance-smart-chain">🟡 BSC</option>
                <option value="avalanche">🔴 Avalanche</option>
                <option value="arbitrum">🔵 Arbitrum</option>
                <option value="optimism">🔴 Optimism</option>
              </select>
              
              <select
                value={filterOwned === undefined ? 'all' : filterOwned ? 'owned' : 'tracked'}
                onChange={(e) => {
                  const value = e.target.value
                  setFilterOwned(
                    value === 'all' ? undefined : value === 'owned' ? true : false
                  )
                }}
                className="px-4 py-2 rounded-lg border bg-gray-900/50 border-gray-600 text-white focus:outline-none focus:border-accent-slate"
              >
                <option value="all">All Wallets</option>
                <option value="owned">Owned Wallets</option>
                <option value="tracked">Tracked Wallets</option>
              </select>
            </div>
          </div>
        </PremiumCard>

        {/* Wallet List */}
        <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Tracked Wallets ({filteredWallets.length})
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800/50 h-20 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <PremiumButton onClick={() => fetchWallets()}>Try Again</PremiumButton>
              </div>
            ) : filteredWallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No wallets found</p>
                <PremiumButton onClick={() => setShowAddModal(true)}>
                  Add Your First Wallet
                </PremiumButton>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWallets.map((wallet) => (
                  <motion.div
                    key={wallet._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-lg">
                          {getNetworkIcon(wallet.network)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-white">
                              {formatWalletAddress(wallet.address)}
                            </span>
                            {wallet.isOwned && (
                              <PremiumBadge variant="success" size="sm">
                                Owned
                              </PremiumBadge>
                            )}
                            {wallet.label && (
                              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                {wallet.label}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className={getNetworkColor(wallet.network)}>
                              {getNetworkDisplayName(wallet.network)}
                            </span>
                            <span>
                              Balance: {formatBalance(wallet.nativeBalance)} 
                              ({formatUSDValue(wallet.nativeBalanceUSD)})
                            </span>
                            <span>
                              Total: {formatUSDValue(wallet.totalValueUSD)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAddress(wallet.address)}
                        >
                          <Copy className="h-4 w-4" />
                        </PremiumButton>
                        
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(wallet.address, wallet.network), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </PremiumButton>
                        
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <Eye className="h-4 w-4" />
                        </PremiumButton>
                      </div>
                    </div>

                    {wallet.assets.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <p className="text-xs text-gray-400 mb-2">Top Assets:</p>
                        <div className="flex flex-wrap gap-2">
                          {wallet.assets.slice(0, 5).map((asset, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300"
                            >
                              {asset.tokenSymbol}: {formatBalance(asset.balance, asset.decimals)}
                            </span>
                          ))}
                          {wallet.assets.length > 5 && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-400">
                              +{wallet.assets.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Add Wallet Modal */}
        <AddWalletModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWallet}
        />

        {/* Wallet Detail Modal */}
        {selectedWallet && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Wallet Details</h3>
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Wallet Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">
                    {getNetworkIcon(selectedWallet.network)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-lg text-white">
                        {formatWalletAddress(selectedWallet.address, 12)}
                      </span>
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(selectedWallet.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </PremiumButton>
                    </div>
                    <p className={`${getNetworkColor(selectedWallet.network)} font-medium`}>
                      {getNetworkDisplayName(selectedWallet.network)}
                    </p>
                    {selectedWallet.label && (
                      <p className="text-gray-400">{selectedWallet.label}</p>
                    )}
                  </div>
                </div>

                {/* Assets */}
                {selectedWallet.assets.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Assets</h4>
                    <div className="space-y-3">
                      {selectedWallet.assets.map((asset, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {asset.logo && (
                              <img src={asset.logo} alt={asset.tokenSymbol} className="w-8 h-8 rounded-full" />
                            )}
                            <div>
                              <p className="font-medium text-white">{asset.tokenName}</p>
                              <p className="text-sm text-gray-400">{asset.tokenSymbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {formatBalance(asset.balance, asset.decimals)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatUSDValue(asset.balanceUSD)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {selectedWallet.transactions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Transactions</h4>
                    <div className="space-y-3">
                      {selectedWallet.transactions.slice(0, 10).map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'receive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.type === 'receive' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.tokenSymbol || 'ETH'}
                              </p>
                              <p className="text-sm text-gray-400 font-mono">
                                {formatWalletAddress(tx.hash, 8)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {formatBalance(tx.value, 18)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatUSDValue(tx.valueUSD)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
