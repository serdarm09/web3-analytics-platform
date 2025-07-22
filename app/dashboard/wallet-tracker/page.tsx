"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  AlertCircle, 
  TrendingUp,
  Search,
  Activity,
  Clock,
  DollarSign,
  Copy,
  ExternalLink,
  Plus,
  Star,
  Coins,
  History,
  PieChart,
  Download,
  RefreshCw
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumInput } from "@/components/ui/premium-input"
import { toast } from 'sonner'

interface WalletTransaction {
  id: string
  type: "send" | "receive" | "swap" | "contract"
  token: string
  tokenAddress: string
  amount: number
  value: number
  from: string
  to: string
  timestamp: Date
  txHash: string
  gasUsed: number
  status: "success" | "failed" | "pending"
}

interface TokenHolding {
  symbol: string
  name: string
  address: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
  logo?: string
}

interface WalletData {
  address: string
  ens?: string
  totalValue: number
  totalChange24h: number
  transactionCount: number
  firstSeen: Date
  lastActive: Date
  isContract: boolean
  tags: string[]
  holdings: TokenHolding[]
  recentTransactions: WalletTransaction[]
  profitLoss: number
  realizedPnL: number
  unrealizedPnL: number
}


export default function WalletTrackerPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [searchAddress, setSearchAddress] = useState("")
  const [currentWallet, setCurrentWallet] = useState<WalletData | null>(null)
  const [trackedWallets, setTrackedWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTracked, setLoadingTracked] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "transactions" | "analytics">("overview")

  const formatAddress = (address: string, ens?: string) => {
    if (ens) return ens
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  // Fetch tracked wallets on mount
  useEffect(() => {
    if (user) {
      fetchTrackedWallets()
    }
  }, [user])

  const fetchTrackedWallets = async () => {
    try {
      const response = await fetch('/api/wallets/tracked', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTrackedWallets(data.wallets)
      }
    } catch (error) {
      console.error('Error fetching tracked wallets:', error)
      toast.error('Failed to fetch tracked wallets')
    } finally {
      setLoadingTracked(false)
    }
  }

  const handleSearch = async () => {
    if (!searchAddress || !user) return
    
    setLoading(true)
    try {
      // Fetch wallet data
      const response = await fetch(`/api/wallets?address=${encodeURIComponent(searchAddress)}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Wallet not found')
        } else {
          toast.error('Failed to fetch wallet data')
        }
        return
      }
      
      const walletData = await response.json()
      
      // Transform data to match frontend interface
      const transformedWallet: WalletData = {
        address: walletData.address,
        ens: walletData.ens,
        totalValue: walletData.totalValue || 0,
        totalChange24h: walletData.totalChange24h || 0,
        transactionCount: walletData.transactionCount || 0,
        firstSeen: new Date(walletData.firstSeen),
        lastActive: new Date(walletData.lastActive),
        isContract: walletData.isContract || false,
        tags: walletData.tags || [],
        holdings: walletData.holdings || [],
        recentTransactions: walletData.recentTransactions || [],
        profitLoss: walletData.profitLoss || 0,
        realizedPnL: walletData.realizedPnL || 0,
        unrealizedPnL: walletData.unrealizedPnL || 0
      }
      
      setCurrentWallet(transformedWallet)
      
      // Add to tracked wallets if not already tracked
      const isTracked = trackedWallets.some(w => w.address.toLowerCase() === searchAddress.toLowerCase())
      if (!isTracked) {
        setTrackedWallets([...trackedWallets, transformedWallet])
        toast.success('Wallet added to tracking list')
      }
    } catch (error) {
      console.error('Error searching wallet:', error)
      toast.error('Failed to search wallet')
    } finally {
      setLoading(false)
    }
  }

  const removeFromTracking = async (address: string) => {
    try {
      const response = await fetch(`/api/wallets?address=${encodeURIComponent(address)}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setTrackedWallets(trackedWallets.filter(w => w.address.toLowerCase() !== address.toLowerCase()))
        if (currentWallet?.address.toLowerCase() === address.toLowerCase()) {
          setCurrentWallet(null)
        }
        toast.success('Wallet removed from tracking')
      } else {
        toast.error('Failed to remove wallet')
      }
    } catch (error) {
      console.error('Error removing wallet:', error)
      toast.error('Failed to remove wallet')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send": return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "receive": return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "swap": return <RefreshCw className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
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
                Wallet Tracker
              </h1>
              <p className="text-muted-foreground mt-2">
                Track wallet addresses, analyze holdings, and monitor transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                {loadingTracked ? 'Loading...' : `${trackedWallets.length} Tracking`}
              </PremiumBadge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <PremiumInput
              placeholder="Enter wallet address or ENS name..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              icon={Search}
              className="flex-1"
            />
            <PremiumButton onClick={handleSearch} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track
                </>
              )}
            </PremiumButton>
          </div>
        </motion.div>

        {/* No Wallets Message */}
        {!currentWallet && !loadingTracked && trackedWallets.length === 0 && (
          <motion.div variants={itemVariants}>
            <PremiumCard className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Wallets Tracked</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking wallet addresses to monitor their activity and holdings
              </p>
              <p className="text-sm text-muted-foreground">
                Enter a wallet address or ENS name in the search bar above to get started
              </p>
            </PremiumCard>
          </motion.div>
        )}

        {/* Tracked Wallets List */}
        {!currentWallet && trackedWallets.length > 0 && (
          <motion.div variants={itemVariants}>
            <PremiumCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Tracked Wallets</h3>
              <div className="space-y-3">
                {trackedWallets.map((wallet) => (
                  <div
                    key={wallet.address}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setCurrentWallet(wallet)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{formatAddress(wallet.address, wallet.ens)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatValue(wallet.totalValue)} • {wallet.holdings?.length || 0} tokens
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`text-sm ${wallet.totalChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {wallet.totalChange24h > 0 ? '+' : ''}{wallet.totalChange24h.toFixed(2)}%
                        </p>
                        <p className="text-xs text-muted-foreground">24h</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromTracking(wallet.address)
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {currentWallet && (
          <>
            {/* Wallet Overview */}
            <motion.div variants={itemVariants}>
              <PremiumCard className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">{formatAddress(currentWallet.address, currentWallet.ens)}</h2>
                        <button onClick={() => copyAddress(currentWallet.address)} className="text-gray-400 hover:text-white">
                          <Copy className="h-4 w-4" />
                        </button>
                        <a href={`https://etherscan.io/address/${currentWallet.address}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {currentWallet.tags.map(tag => (
                          <PremiumBadge key={tag} size="sm" variant="outline">{tag}</PremiumBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <PremiumButton 
                      size="sm" 
                      variant="outline"
                      onClick={() => setCurrentWallet(null)}
                    >
                      Back
                    </PremiumButton>
                    <PremiumButton 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeFromTracking(currentWallet.address)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Untrack
                    </PremiumButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatValue(currentWallet.totalValue)}</p>
                    <p className={`text-sm ${currentWallet.totalChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {currentWallet.totalChange24h > 0 ? '+' : ''}{currentWallet.totalChange24h.toFixed(2)}% (24h)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total P&L</p>
                    <p className={`text-2xl font-bold ${currentWallet.profitLoss > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatValue(currentWallet.profitLoss)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {((currentWallet.profitLoss / currentWallet.totalValue) * 100).toFixed(2)}% return
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{formatNumber(currentWallet.transactionCount)}</p>
                    <p className="text-sm text-gray-400">Since {currentWallet.firstSeen.getFullYear()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p className="text-sm font-medium">
                      {new Date(currentWallet.lastActive).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-500">Active</span>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "holdings", label: "Holdings", icon: Coins },
                { id: "transactions", label: "Transactions", icon: History },
                { id: "analytics", label: "Analytics", icon: PieChart }
              ].map(tab => (
                <PremiumButton
                  key={tab.id}
                  variant={activeTab === tab.id ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </PremiumButton>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <PremiumCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Profit & Loss</h3>
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Realized P&L</p>
                        <p className={`text-xl font-bold ${currentWallet.realizedPnL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatValue(currentWallet.realizedPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Unrealized P&L</p>
                        <p className={`text-xl font-bold ${currentWallet.unrealizedPnL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatValue(currentWallet.unrealizedPnL)}
                        </p>
                      </div>
                    </div>
                  </PremiumCard>

                  <PremiumCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Top Holdings</h3>
                      <Coins className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {currentWallet.holdings.slice(0, 3).map(holding => (
                        <div key={holding.symbol} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                              {holding.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{holding.symbol}</p>
                              <p className="text-xs text-gray-400">{holding.allocation.toFixed(1)}%</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatValue(holding.value)}</p>
                            <p className={`text-xs ${holding.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {holding.change24h > 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PremiumCard>

                  <PremiumCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Recent Activity</h3>
                      <Activity className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {currentWallet.recentTransactions.slice(0, 3).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.type)}
                            <div>
                              <p className="font-medium capitalize">{tx.type}</p>
                              <p className="text-xs text-gray-400">{tx.token}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatValue(tx.value)}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PremiumCard>
                </motion.div>
              )}

              {activeTab === "holdings" && (
                <motion.div
                  key="holdings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PremiumCard className="overflow-hidden">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Token Holdings</h3>
                        <PremiumButton size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </PremiumButton>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4">Token</th>
                            <th className="text-right p-4">Balance</th>
                            <th className="text-right p-4">Price</th>
                            <th className="text-right p-4">Value</th>
                            <th className="text-right p-4">24h %</th>
                            <th className="text-right p-4">Allocation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentWallet.holdings.map((holding, index) => (
                            <tr key={holding.symbol} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                                    {holding.symbol.slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{holding.name}</p>
                                    <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right font-mono">
                                {holding.balance.toLocaleString()}
                              </td>
                              <td className="p-4 text-right font-mono">
                                {formatValue(holding.price)}
                              </td>
                              <td className="p-4 text-right font-mono">
                                {formatValue(holding.value)}
                              </td>
                              <td className="p-4 text-right">
                                <span className={holding.change24h > 0 ? "text-green-500" : "text-red-500"}>
                                  {holding.change24h > 0 ? "+" : ""}{holding.change24h.toFixed(2)}%
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-24 bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-accent-slate to-accent-teal h-full rounded-full"
                                      style={{ width: `${holding.allocation}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{holding.allocation.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </PremiumCard>
                </motion.div>
              )}

              {activeTab === "transactions" && (
                <motion.div
                  key="transactions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PremiumCard className="overflow-hidden">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Recent Transactions</h3>
                        <div className="flex items-center gap-2">
                          <PremiumButton size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </PremiumButton>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4">Type</th>
                            <th className="text-left p-4">Token</th>
                            <th className="text-right p-4">Amount</th>
                            <th className="text-right p-4">Value</th>
                            <th className="text-left p-4">From/To</th>
                            <th className="text-right p-4">Time</th>
                            <th className="text-center p-4">Status</th>
                            <th className="text-center p-4">Hash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentWallet.recentTransactions.map((tx) => (
                            <tr key={tx.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {getTransactionIcon(tx.type)}
                                  <span className="capitalize">{tx.type}</span>
                                </div>
                              </td>
                              <td className="p-4">{tx.token}</td>
                              <td className="p-4 text-right font-mono">
                                {tx.amount.toLocaleString()}
                              </td>
                              <td className="p-4 text-right font-mono">
                                {formatValue(tx.value)}
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  {tx.type === "receive" ? (
                                    <>From: {formatAddress(tx.from)}</>
                                  ) : (
                                    <>To: {formatAddress(tx.to)}</>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right text-sm">
                                {new Date(tx.timestamp).toLocaleString()}
                              </td>
                              <td className="p-4 text-center">
                                <PremiumBadge 
                                  size="sm" 
                                  variant={tx.status === "success" ? "outline" : "default"}
                                  className={tx.status === "success" ? "text-green-500" : ""}
                                >
                                  {tx.status}
                                </PremiumBadge>
                              </td>
                              <td className="p-4 text-center">
                                <a
                                  href={`https://etherscan.io/tx/${tx.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-slate hover:text-accent-teal"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </PremiumCard>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <PremiumCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold">{currentWallet.holdings.length}</p>
                          <p className="text-sm text-gray-400">Tokens</p>
                        </div>
                      </div>
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {currentWallet.holdings.map((holding, index) => {
                          const startAngle = currentWallet.holdings
                            .slice(0, index)
                            .reduce((sum, h) => sum + h.allocation, 0) * 3.6
                          const endAngle = startAngle + holding.allocation * 3.6
                          const largeArcFlag = holding.allocation > 50 ? 1 : 0
                          
                          const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                          const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                          const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                          const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
                          
                          return (
                            <path
                              key={holding.symbol}
                              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                              fill={`hsl(${index * 60}, 70%, 50%)`}
                              className="hover:opacity-80 transition-opacity"
                            />
                          )
                        })}
                      </svg>
                    </div>
                  </PremiumCard>

                  <PremiumCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Transaction Volume (30d)</p>
                        <div className="h-32 flex items-end gap-1">
                          {Array.from({ length: 30 }, (_, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-accent-slate to-accent-teal rounded-t"
                              style={{ height: `${Math.random() * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Avg Daily Txns</p>
                          <p className="font-semibold">
                            {Math.floor(currentWallet.transactionCount / 365)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Most Active Day</p>
                          <p className="font-semibold">Tuesday</p>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  )
}