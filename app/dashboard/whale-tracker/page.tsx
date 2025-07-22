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
  ExternalLink
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumInput } from "@/components/ui/premium-input"
import { whaleTrackingService } from "@/lib/services/whaleTrackingService"
import { toast } from "sonner"

interface WhaleTransaction {
  hash: string
  from: string
  to: string
  value: string
  valueUSD: number
  tokenSymbol?: string
  tokenName?: string
  timestamp: Date
  blockNumber: number
  network: string
  fromLabel?: string
  toLabel?: string
}

interface WhaleWallet {
  address: string
  balance: string
  balanceUSD: number
  network: string
  label?: string
  transactionCount: number
  lastActive: Date
}

export default function WhaleTrackerPage() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [whaleWallets, setWhaleWallets] = useState<WhaleWallet[]>([])
  const [filter, setFilter] = useState<"all" | "ethereum" | "bsc">("all")
  const [searchAddress, setSearchAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState<"ethereum" | "bsc">("ethereum")

  useEffect(() => {
    fetchWhaleData()
    const interval = setInterval(fetchWhaleData, 60000) // Her dakika güncelle
    return () => clearInterval(interval)
  }, [selectedNetwork])

  const fetchWhaleData = async () => {
    try {
      setLoading(true)
      
      // Paralel olarak whale verilerini getir
      const [txs, wallets, tokenTxs] = await Promise.all([
        whaleTrackingService.getRecentWhaleTransactions(selectedNetwork, 20),
        whaleTrackingService.getTopWhaleWallets(selectedNetwork, 10),
        whaleTrackingService.getTokenWhaleTransfers(selectedNetwork, 10)
      ])

      // İşlemleri birleştir ve sırala
      const allTransactions = [...txs, ...tokenTxs].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )

      setTransactions(allTransactions)
      setWhaleWallets(wallets)
    } catch (error) {
      console.error('Error fetching whale data:', error)
      toast.error('Failed to fetch whale data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    toast.promise(fetchWhaleData(), {
      loading: 'Refreshing whale data...',
      success: 'Whale data updated!',
      error: 'Failed to refresh data'
    })
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTransactionType = (tx: WhaleTransaction) => {
    // Basit bir mantık - gerçek uygulamada daha detaylı olmalı
    if (tx.from === tx.to) return "transfer"
    if (tx.from.toLowerCase() === searchAddress.toLowerCase()) return "sell"
    if (tx.to.toLowerCase() === searchAddress.toLowerCase()) return "buy"
    return "transfer"
  }

  const getExplorerUrl = (hash: string, network: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/tx/${hash}`,
      bsc: `https://bscscan.com/tx/${hash}`
    }
    return explorers[network] || '#'
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

  const filteredTransactions = transactions.filter(tx => 
    filter === "all" || tx.network === filter
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
                Whale Tracker
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor large cryptocurrency movements and whale wallets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton 
                variant="ghost" 
                size="sm"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </PremiumButton>
              <PremiumButton variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Set Alert
              </PremiumButton>
              <PremiumButton>
                <Wallet className="h-4 w-4 mr-2" />
                Track Wallet
              </PremiumButton>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Whales</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-green-500">+12 today</p>
              </div>
              <Fish className="h-8 w-8 text-accent-slate" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">$1.2B</p>
                <p className="text-sm text-muted-foreground">Whale trades</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">$5.6M</p>
                <p className="text-sm text-blue-500">↑ 23%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alert Triggers</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-orange-500">Last hour</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </PremiumCard>
        </motion.div>

        {/* Recent Whale Activity */}
        <motion.div variants={itemVariants}>
          <PremiumCard>
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Recent Whale Activity</h2>
                <div className="flex gap-2">
                  {["all", "buy", "sell", "transfer"].map((f) => (
                    <PremiumButton
                      key={f}
                      size="sm"
                      variant={filter === f ? "gradient" : "outline"}
                      onClick={() => setFilter(f as any)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </PremiumButton>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <AnimatePresence>
                {filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        tx.type === "buy" ? "bg-green-500/20 text-green-500" :
                        tx.type === "sell" ? "bg-red-500/20 text-red-500" :
                        "bg-blue-500/20 text-blue-500"
                      }`}>
                        {tx.type === "buy" ? <ArrowDownLeft className="h-5 w-5" /> :
                         tx.type === "sell" ? <ArrowUpRight className="h-5 w-5" /> :
                         <Activity className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {tx.walletName || tx.walletAddress}
                          </p>
                          <PremiumBadge variant="outline" className="text-xs">
                            {tx.type.toUpperCase()}
                          </PremiumBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tx.amount.toLocaleString()} {tx.token} • {formatValue(tx.value)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(tx.timestamp)}</p>
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-slate hover:underline"
                      >
                        View TX →
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Top Whale Wallets */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumCard>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Top Whale Wallets</h2>
            </div>
            <div className="p-6 space-y-4">
              {whaleWallets.map((wallet, index) => (
                <motion.div
                  key={wallet.address}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3 p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center text-white">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{wallet.name || wallet.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet.totalTransactions.toLocaleString()} transactions
                        </p>
                      </div>
                    </div>
                    <PremiumButton size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </PremiumButton>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-semibold">{formatValue(wallet.balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">P&L:</span>
                    <span className={wallet.profitLoss > 0 ? "text-green-500" : "text-red-500"}>
                      {wallet.profitLoss > 0 ? "+" : ""}{formatValue(wallet.profitLoss)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last active {formatTimeAgo(wallet.lastActive)}
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Whale Alert Settings</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Track Wallet Address</label>
                <PremiumInput
                  placeholder="Enter wallet address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Large transactions (&gt; $1M)</span>
                  <PremiumBadge variant="default">Active</PremiumBadge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">New whale wallets</span>
                  <PremiumBadge variant="outline">Inactive</PremiumBadge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Unusual activity patterns</span>
                  <PremiumBadge variant="default">Active</PremiumBadge>
                </div>
              </div>
              <PremiumButton className="w-full">
                Save Alert Settings
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </div>
  )
}