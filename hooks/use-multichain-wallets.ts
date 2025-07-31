import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface MultichainNetwork {
  id: string
  name: string
  symbol: string
  icon: string
  color: string
  explorerUrl: string
  rpcUrl?: string
  chainId?: number
  isTestnet?: boolean
}

export interface WalletAsset {
  symbol: string
  name: string
  address?: string
  balance: number
  value: number
  price: number
  change24h?: number
  logo?: string
  chain: string
  type: 'native' | 'token' | 'nft' | 'defi'
}

export interface WalletTransaction {
  hash: string
  type: 'in' | 'out' | 'swap' | 'approve' | 'transfer' | 'contract'
  amount: number
  token: string
  tokenSymbol: string
  tokenAddress?: string
  from: string
  to: string
  timestamp: Date
  value: number
  gas?: number
  gasPrice?: number
  chain: string
  status: 'success' | 'failed' | 'pending'
}

export interface ChainData {
  chain: string
  nativeBalance: string
  nativeBalanceFormatted: number
  nativeValue: number
  totalValue: number
  tokenCount: number
  transactionCount: number
  lastActivity: Date
}

export interface TrackedWallet {
  _id: string
  address: string
  label: string
  chains: ChainData[]
  totalValue: number
  assets: WalletAsset[]
  transactions: WalletTransaction[]
  portfolioChange24h: number
  isTracked: boolean
  trackingUsers: string[]
  lastActivity: Date
  totalTransactions: number
  isWhale: boolean
  riskScore: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface WalletStats {
  totalWallets: number
  totalValue: number
  whaleWallets: number
  activeWallets: number
  avgPortfolioValue: number
  topGainer: TrackedWallet | null
  topLoser: TrackedWallet | null
}

// Supported networks
export const SUPPORTED_NETWORKS: MultichainNetwork[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '🟦',
    color: '#627EEA',
    explorerUrl: 'https://etherscan.io',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '🟠',
    color: '#F7931A',
    explorerUrl: 'https://blockstream.info'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '🟣',
    color: '#9945FF',
    explorerUrl: 'https://solscan.io'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '🟪',
    color: '#8247E5',
    explorerUrl: 'https://polygonscan.com',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com'
  },
  {
    id: 'binance-smart-chain',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    icon: '🟡',
    color: '#F3BA2F',
    explorerUrl: 'https://bscscan.com',
    chainId: 56
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: '🔴',
    color: '#E84142',
    explorerUrl: 'https://snowtrace.io',
    chainId: 43114
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    icon: '🔵',
    color: '#28A0F0',
    explorerUrl: 'https://arbiscan.io',
    chainId: 42161
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    icon: '🔴',
    color: '#FF0420',
    explorerUrl: 'https://optimistic.etherscan.io',
    chainId: 10
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    icon: '🔷',
    color: '#0052FF',
    explorerUrl: 'https://basescan.org',
    chainId: 8453
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    icon: '👻',
    color: '#1969FF',
    explorerUrl: 'https://ftmscan.com',
    chainId: 250
  },
  {
    id: 'cronos',
    name: 'Cronos',
    symbol: 'CRO',
    icon: '🌙',
    color: '#002D74',
    explorerUrl: 'https://cronoscan.com',
    chainId: 25
  }
]

// Helper functions
export const getNetworkById = (id: string): MultichainNetwork | undefined => {
  return SUPPORTED_NETWORKS.find(network => network.id === id)
}

export const getNetworkDisplayName = (chainId: string): string => {
  const network = getNetworkById(chainId)
  return network?.name || chainId
}

export const getNetworkColor = (chainId: string): string => {
  const network = getNetworkById(chainId)
  return network?.color || '#6B7280'
}

export const getNetworkIcon = (chainId: string): string => {
  const network = getNetworkById(chainId)
  return network?.icon || '⚡'
}

export const formatWalletAddress = (address: string, length: number = 8): string => {
  if (!address) return ''
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export const formatBalance = (balance: number, decimals: number = 4): string => {
  if (balance === 0) return '0'
  if (balance < 0.0001) return '<0.0001'
  return balance.toFixed(decimals)
}

export const formatUSDValue = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export const calculateRiskScore = (wallet: TrackedWallet): number => {
  let score = 0
  
  // Large portfolio increases risk score
  if (wallet.totalValue > 10000000) score += 30 // $10M+
  else if (wallet.totalValue > 1000000) score += 20 // $1M+
  else if (wallet.totalValue > 100000) score += 10 // $100K+
  
  // High transaction activity
  if (wallet.totalTransactions > 1000) score += 20
  else if (wallet.totalTransactions > 100) score += 10
  
  // Volatile portfolio changes
  const absChange = Math.abs(wallet.portfolioChange24h)
  if (absChange > 50) score += 25
  else if (absChange > 20) score += 15
  else if (absChange > 10) score += 10
  
  // Multiple chains increases complexity
  const chainCount = wallet.chains.length
  if (chainCount > 5) score += 15
  else if (chainCount > 3) score += 10
  else if (chainCount > 1) score += 5
  
  return Math.min(score, 100) // Cap at 100
}

export const isWhaleWallet = (wallet: TrackedWallet): boolean => {
  return wallet.totalValue >= 1000000 || // $1M+ portfolio
         wallet.totalTransactions >= 500 || // High activity
         wallet.chains.length >= 3 // Multi-chain presence
}

// Custom hook for tracked wallets
export function useTrackedWallets() {
  const [wallets, setWallets] = useState<TrackedWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/whale-wallets')
      if (!response.ok) {
        throw new Error('Failed to fetch wallets')
      }

      const data = await response.json()
      const walletsWithCalculations = data.wallets.map((wallet: TrackedWallet) => ({
        ...wallet,
        riskScore: calculateRiskScore(wallet),
        isWhale: isWhaleWallet(wallet)
      }))
      
      setWallets(walletsWithCalculations)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load tracked wallets')
    } finally {
      setLoading(false)
    }
  }, [])

  const addWallet = async (address: string, network: string, label?: string, isOwned: boolean = false) => {
    try {
      const response = await fetch('/api/whale-wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address.trim(),
          network,
          label: label?.trim(),
          isOwned
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add wallet')
      }

      const data = await response.json()
      const newWallet = {
        ...data.wallet,
        riskScore: calculateRiskScore(data.wallet),
        isWhale: isWhaleWallet(data.wallet)
      }
      
      setWallets(prev => [newWallet, ...prev])
      toast.success('Wallet added successfully!')
      
      return data.wallet
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add wallet'
      toast.error(errorMessage)
      throw error
    }
  }

  const removeWallet = async (walletId: string) => {
    try {
      const response = await fetch(`/api/whale-wallets/${walletId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove wallet')
      }

      setWallets(prev => prev.filter(w => w._id !== walletId))
      toast.success('Wallet removed successfully!')
    } catch (error) {
      toast.error('Failed to remove wallet')
      throw error
    }
  }

  const updateWallet = async (walletId: string, updates: Partial<TrackedWallet>) => {
    try {
      const response = await fetch(`/api/whale-wallets/${walletId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update wallet')
      }

      const data = await response.json()
      const updatedWallet = {
        ...data.wallet,
        riskScore: calculateRiskScore(data.wallet),
        isWhale: isWhaleWallet(data.wallet)
      }
      
      setWallets(prev => prev.map(w => w._id === walletId ? updatedWallet : w))
      toast.success('Wallet updated successfully!')
      
      return data.wallet
    } catch (error) {
      toast.error('Failed to update wallet')
      throw error
    }
  }

  const refreshWallet = async (walletId: string) => {
    try {
      const response = await fetch(`/api/whale-wallets/${walletId}/refresh`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh wallet')
      }

      const data = await response.json()
      const refreshedWallet = {
        ...data.wallet,
        riskScore: calculateRiskScore(data.wallet),
        isWhale: isWhaleWallet(data.wallet)
      }
      
      setWallets(prev => prev.map(w => w._id === walletId ? refreshedWallet : w))
      toast.success('Wallet data refreshed!')
      
      return data.wallet
    } catch (error) {
      toast.error('Failed to refresh wallet data')
      throw error
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  return {
    wallets,
    loading,
    error,
    refetch: fetchWallets,
    addWallet,
    removeWallet,
    updateWallet,
    refreshWallet
  }
}

// Custom hook for wallet statistics
export function useWalletStats(wallets: TrackedWallet[]): WalletStats {
  const [stats, setStats] = useState<WalletStats>({
    totalWallets: 0,
    totalValue: 0,
    whaleWallets: 0,
    activeWallets: 0,
    avgPortfolioValue: 0,
    topGainer: null,
    topLoser: null
  })

  useEffect(() => {
    if (wallets.length === 0) {
      setStats({
        totalWallets: 0,
        totalValue: 0,
        whaleWallets: 0,
        activeWallets: 0,
        avgPortfolioValue: 0,
        topGainer: null,
        topLoser: null
      })
      return
    }

    const totalValue = wallets.reduce((sum, wallet) => sum + wallet.totalValue, 0)
    const whaleWallets = wallets.filter(wallet => wallet.isWhale).length
    const activeWallets = wallets.filter(wallet => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(wallet.lastActivity) > dayAgo
    }).length

    const sortedByGain = wallets
      .filter(wallet => wallet.portfolioChange24h !== 0)
      .sort((a, b) => b.portfolioChange24h - a.portfolioChange24h)

    const newStats: WalletStats = {
      totalWallets: wallets.length,
      totalValue,
      whaleWallets,
      activeWallets,
      avgPortfolioValue: totalValue / wallets.length,
      topGainer: sortedByGain[0] || null,
      topLoser: sortedByGain[sortedByGain.length - 1] || null
    }

    setStats(newStats)
  }, [wallets])

  return stats
}
