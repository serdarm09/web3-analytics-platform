"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Eye, 
  Search, 
  Filter, 
  Plus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Copy,
  Bell,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Zap
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumInput } from "@/components/ui/premium-input"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from 'sonner'
import { logCryptoStatus } from "@/lib/utils/crypto-test"

interface Transaction {
  id: string
  type: string
  token: string
  value: number
  timestamp: string
  hash?: string
}

interface TokenHolding {
  symbol: string
  name: string
  balance: number
  value: number
  change24h: number
  price: number
  logo?: string
}

interface WalletData {
  address: string
  label?: string
  balance: number
  value: number
  change24h: number
  lastActivity: string
  holdings: TokenHolding[]
  recentTransactions: Transaction[]
  isWhale?: boolean
  tags?: string[]
}

interface WalletSearchResult {
  address: string
  chains: any[]
  summary: {
    totalValue: number
    chainCount: number
    totalTransactions: number
    topChains: {
      chain: string
      value: number
      share: number
    }[]
    isWhale: boolean
    riskScore: number
  }
  isWhale: boolean
}

export default function WalletTrackerPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentWallet, setCurrentWallet] = useState<WalletData | null>(null)
  const [trackedWallets, setTrackedWallets] = useState<WalletData[]>([])
  const [searchAddress, setSearchAddress] = useState("")
  const [searchResults, setSearchResults] = useState<WalletSearchResult[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "transactions" | "analytics">("overview")

  const [selectedChain, setSelectedChain] = useState<string>("all")
  const [walletDetails, setWalletDetails] = useState<any>(null)

  useEffect(() => {
    // Test crypto polyfill on component mount
    if (crypto?.randomUUID) {
      try {
        const testUuid = crypto.randomUUID()
      } catch (error) {
        console.error('❌ crypto.randomUUID test failed:', error)
      }
    }
    
    logCryptoStatus()
    
    if (!authLoading && user) {
      fetchTrackedWallets()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (currentWallet) {
      fetchWalletDetails(currentWallet.address)
    }
  }, [currentWallet])

  const fetchWalletDetails = async (address: string) => {
    try {
      const response = await fetch('/api/wallet/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      })
      
      if (response.ok) {
        const data = await response.json()
        setWalletDetails(data)
        
        // Update current wallet with fresh data
        if (currentWallet) {
          setCurrentWallet({
            ...currentWallet,
            holdings: data.chains.flatMap((chain: any) => 
              chain.tokenBalances.map((token: any) => ({
                symbol: token.symbol,
                name: token.name,
                balance: token.balanceFormatted,
                value: token.value,
                change24h: token.change24h,
                price: token.price
              }))
            ),
            recentTransactions: data.chains.flatMap((chain: any) => 
              chain.transactions.slice(0, 10).map((tx: any) => ({
                id: tx.hash,
                type: tx.type,
                token: tx.tokenSymbol || chain.chain.toUpperCase(),
                value: tx.value || tx.valueFormatted * (chain.nativeValue / chain.nativeBalanceFormatted || 1),
                timestamp: new Date(tx.timestamp).toISOString()
              }))
            )
          })
        }
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error)
    }
  }

  const fetchTrackedWallets = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/whale-wallets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const formattedWallets = data.wallets.map((wallet: any) => ({
          address: wallet.address,
          label: wallet.label,
          balance: wallet.currentValue,
          value: wallet.currentValue,
          change24h: wallet.valueChange24h || 0,
          lastActivity: wallet.lastUpdated ? new Date(wallet.lastUpdated).toLocaleString() : 'Unknown',
          isWhale: wallet.isWhale,
          tags: wallet.tags || [],
          holdings: [], // Will be populated when wallet is selected
          recentTransactions: [] // Will be populated when wallet is selected
        }))
        setTrackedWallets(formattedWallets)
        if (formattedWallets.length > 0) {
          setCurrentWallet(formattedWallets[0])
        }
      } else {
        toast.error('Failed to fetch tracked wallets')
      }
    } catch (error) {
      console.error("Error fetching wallets:", error)
      toast.error("Failed to fetch tracked wallets")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchWallet = async () => {
    if (!searchAddress.trim()) return
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/wallet/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: searchAddress })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults([data])
        toast.success(`Found wallet data on ${data.summary.chainCount} chains`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to search wallet')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error("Error searching wallet")
    } finally {
      setLoading(false)
    }
  }

  const handleAddWallet = async (address: string, label?: string) => {
    try {
      const walletAddress = address || searchAddress.trim()
      if (!walletAddress) {
        toast.error('Please enter a wallet address')
        return
      }

      setLoading(true)
      
      const response = await fetch('/api/whale-wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: walletAddress, 
          label: label || `Wallet ${walletAddress.slice(0, 8)}...`,
          tags: []
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success('Wallet added successfully!')
        setSearchAddress('')
        setSearchResults([])
        fetchTrackedWallets() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add wallet')
      }
    } catch (error) {
      console.error('Add wallet error:', error)
      toast.error("Error adding wallet to tracking")
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M` 
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "swap": return <RefreshCw className="w-4 h-4 text-blue-400" />
      case "transfer": return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case "liquidity": return <Target className="w-4 h-4 text-purple-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <PremiumSkeleton className="h-8 w-48 mb-2" />
            <PremiumSkeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <PremiumSkeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Wallet Tracker
          </h1>
          <p className="text-gray-400 mt-2">
            Track and analyze whale wallets and interesting addresses
          </p>
        </div>
        <PremiumButton onClick={() => handleAddWallet("")} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Wallet
        </PremiumButton>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="flex-1">
          <PremiumInput
            placeholder="Enter wallet address (0x...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            icon={Search}
          />
        </div>
        <PremiumButton onClick={handleSearchWallet} className="gap-2">
          <Search className="w-4 h-4" />
          Search
        </PremiumButton>
      </motion.div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PremiumCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Address:</p>
                    <p className="font-mono text-white">{result.address}</p>
                  </div>
                  <PremiumButton 
                    onClick={() => handleAddWallet(result.address)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Track Wallet
                  </PremiumButton>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                    <div className="text-xl font-bold text-white">{formatValue(result.summary.totalValue)}</div>
                    <div className="text-xs text-gray-400">Total Value</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg">
                    <div className="text-xl font-bold text-white">{result.summary.chainCount}</div>
                    <div className="text-xs text-gray-400">Active Chains</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                    <div className="text-xl font-bold text-white">{result.isWhale ? '🐋' : '🐟'}</div>
                    <div className="text-xs text-gray-400">{result.isWhale ? 'Whale' : 'Regular'}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Chain Distribution:</p>
                  {result.summary.topChains.map((chain: any) => (
                    <div key={chain.chain} className="flex items-center justify-between p-2 bg-gray-secondary rounded">
                      <span className="capitalize text-white">{chain.chain}</span>
                      <div className="text-right">
                        <p className="text-white">{formatValue(chain.value)}</p>
                        <p className="text-xs text-gray-400">{chain.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </PremiumCard>
        </motion.div>
      )}

      {/* Tracked Wallets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* Wallet List */}
        <div className="lg:col-span-1">
          <PremiumCard className="p-4">
            <h3 className="text-lg font-semibold mb-4">Tracked Wallets</h3>
            <div className="space-y-2">
              {trackedWallets.map((wallet) => (
                <motion.div
                  key={wallet.address}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentWallet?.address === wallet.address
                      ? "bg-accent-blue/20 border border-accent-blue/30"
                      : "bg-gray-secondary hover:bg-gray-secondary/80"
                  }`}
                  onClick={() => setCurrentWallet(wallet)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {wallet.label || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                      </p>
                      <p className="text-xs text-gray-400">{formatValue(wallet.value)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {wallet.isWhale && <PremiumBadge variant="outline" size="sm">Whale</PremiumBadge>}
                      <div className={`flex items-center gap-1 ${
                        wallet.change24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {wallet.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-xs">{Math.abs(wallet.change24h).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </div>

        {/* Wallet Details */}
        <div className="lg:col-span-3">
          {currentWallet ? (
            <div className="space-y-6">
              {/* Wallet Overview */}
              <PremiumCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {currentWallet.label || "Wallet Details"}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-gray-400 font-mono text-sm">{currentWallet.address}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentWallet.address)
                          toast.success("Address copied!")
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentWallet.tags?.map(tag => (
                      <PremiumBadge key={tag} variant="outline">{tag}</PremiumBadge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">{formatValue(currentWallet.value)}</div>
                    <div className="text-xs text-gray-400">Total Value</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg">
                    <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                      currentWallet.change24h >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {currentWallet.change24h >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {Math.abs(currentWallet.change24h).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">24h Change</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">{currentWallet.holdings.length}</div>
                    <div className="text-xs text-gray-400">Tokens</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">{currentWallet.lastActivity}</div>
                    <div className="text-xs text-gray-400">Last Activity</div>
                  </div>
                </div>
              </PremiumCard>

              {/* Chain Selector */}
              {walletDetails && (
                <div className="flex gap-2 flex-wrap">
                  <PremiumButton
                    variant={selectedChain === "all" ? "glow" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedChain("all")}
                  >
                    All Chains
                  </PremiumButton>
                  {walletDetails.chains.map((chain: any) => (
                    <PremiumButton
                      key={chain.chain}
                      variant={selectedChain === chain.chain ? "glow" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedChain(chain.chain)}
                      className="capitalize"
                    >
                      {chain.chain} ({formatValue(chain.totalValue)})
                    </PremiumButton>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2">
                {["overview", "holdings", "transactions", "analytics"].map((tab) => (
                  <PremiumButton
                    key={tab}
                    variant={activeTab === tab ? "glow" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab as any)}
                    className="capitalize"
                  >
                    {tab}
                  </PremiumButton>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {/* Top Holdings */}
                    <PremiumCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Top Holdings</h3>
                        <PieChart className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          let holdings = currentWallet.holdings || []
                          if (selectedChain !== "all" && walletDetails) {
                            const chainData = walletDetails.chains.find((c: any) => c.chain === selectedChain)
                            holdings = chainData ? chainData.tokenBalances.map((token: any) => ({
                              symbol: token.symbol,
                              name: token.name,
                              balance: token.balanceFormatted,
                              value: token.value,
                              change24h: token.change24h,
                              price: token.price
                            })) : []
                          }
                          
                          return holdings.slice(0, 5).map((holding, index) => (
                            <div key={holding.symbol} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                  <span className="text-xs font-bold">{holding.symbol.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{holding.symbol}</p>
                                  <p className="text-xs text-gray-400">{holding.balance.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatValue(holding.value)}</p>
                                <p className={`text-xs ${holding.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {holding.change24h >= 0 ? "+" : ""}{holding.change24h.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    </PremiumCard>

                    {/* Recent Activity */}
                    <PremiumCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                        <Activity className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          let transactions = currentWallet.recentTransactions || []
                          if (selectedChain !== "all" && walletDetails) {
                            const chainData = walletDetails.chains.find((c: any) => c.chain === selectedChain)
                            transactions = chainData ? chainData.transactions.slice(0, 3).map((tx: any) => ({
                              id: tx.hash,
                              type: tx.type,
                              token: tx.tokenSymbol || chainData.chain.toUpperCase(),
                              value: tx.valueFormatted * (chainData.nativeValue / chainData.nativeBalanceFormatted || 1),
                              timestamp: new Date(tx.timestamp).toISOString()
                            })) : []
                          }
                          
                          return transactions.slice(0, 3).map(tx => (
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
                                  {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          ))
                        })()}
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
                    <PremiumCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4">All Holdings</h3>
                      <div className="space-y-4">
                        {currentWallet.holdings.map((holding) => (
                          <div key={holding.symbol} className="flex items-center justify-between p-4 bg-gray-secondary rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="font-bold">{holding.symbol.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-lg">{holding.symbol}</p>
                                <p className="text-gray-400">{holding.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-lg">{holding.balance.toFixed(4)}</p>
                              <p className="text-gray-400">{formatValue(holding.value)}</p>
                              <p className={`text-sm ${holding.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {holding.change24h >= 0 ? "+" : ""}{holding.change24h.toFixed(2)}% (24h)
                              </p>
                            </div>
                          </div>
                        ))}
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
                    <PremiumCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                      <div className="space-y-4">
                        {(currentWallet.recentTransactions || []).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-secondary rounded-lg">
                            <div className="flex items-center gap-4">
                              {getTransactionIcon(tx.type)}
                              <div>
                                <p className="font-medium capitalize">{tx.type}</p>
                                <p className="text-gray-400">{tx.token}</p>
                                <p className="text-xs text-gray-400">
                                  {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatValue(tx.value)}</p>
                              {tx.hash && (
                                <button className="text-xs text-accent-blue hover:underline">
                                  View on Explorer
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
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
                  >
                    <PremiumCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                      <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Analytics features coming soon!</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Portfolio performance, risk analysis, and trading patterns
                        </p>
                      </div>
                    </PremiumCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <PremiumCard className="p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Wallet Selected</h3>
              <p className="text-gray-400">
                Select a wallet from the list or search for a new address to start tracking
              </p>
            </PremiumCard>
          )}
        </div>
      </motion.div>
    </div>
  )
}