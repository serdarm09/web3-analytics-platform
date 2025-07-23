import { useState, useEffect } from 'react'

export interface WalletAsset {
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  balance: string
  balanceUSD: number
  decimals: number
  logo?: string
  price?: number
  priceChange24h?: number
}

export interface WalletTransaction {
  hash: string
  blockNumber: number
  timestamp: string
  from: string
  to: string
  value: string
  valueUSD: number
  gasUsed: number
  gasPrice: string
  gasFee: string
  gasFeeUSD: number
  tokenSymbol?: string
  tokenName?: string
  tokenAddress?: string
  type: 'send' | 'receive' | 'swap' | 'contract_interaction' | 'nft_transfer'
  status: 'success' | 'failed' | 'pending'
  methodId?: string
  functionName?: string
}

export interface TrackedWallet {
  _id: string
  address: string
  network: string
  label?: string
  isOwned: boolean
  nativeBalance: string
  nativeBalanceUSD: number
  totalValueUSD: number
  assets: WalletAsset[]
  transactions: WalletTransaction[]
  lastSynced: string
  isActive: boolean
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WalletStats {
  byNetwork: Array<{
    _id: string
    walletCount: number
    totalValue: number
    ownedWallets: number
    trackedWallets: number
  }>
  total: {
    totalWallets: number
    totalValue: number
    totalOwned: number
    totalTracked: number
  }
}

export function useTrackedWallets(network?: string, isOwned?: boolean) {
  const [wallets, setWallets] = useState<TrackedWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallets = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (network) params.append('network', network)
      if (typeof isOwned === 'boolean') params.append('isOwned', isOwned.toString())

      const response = await fetch(`/api/tracked-wallets?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallets')
      }

      const data = await response.json()
      setWallets(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addWallet = async (
    address: string,
    network: string,
    label?: string,
    isOwned: boolean = false
  ) => {
    try {
      const response = await fetch('/api/tracked-wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          network,
          label,
          isOwned
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add wallet')
      }

      // Refresh wallets after adding new one
      await fetchWallets()

      return await response.json()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchWallets()
  }, [network, isOwned])

  return {
    wallets,
    loading,
    error,
    fetchWallets,
    addWallet
  }
}

export function useWalletStats() {
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/tracked-wallets/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet stats')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}

// Helper functions
export function formatWalletAddress(address: string, length: number = 8): string {
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function getNetworkDisplayName(network: string): string {
  const networkMap: { [key: string]: string } = {
    'ethereum': 'Ethereum',
    'bitcoin': 'Bitcoin',
    'solana': 'Solana',
    'polygon': 'Polygon',
    'binance-smart-chain': 'BSC',
    'avalanche': 'Avalanche',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism',
    'fantom': 'Fantom',
    'cardano': 'Cardano',
    'polkadot': 'Polkadot',
    'cosmos': 'Cosmos'
  }

  return networkMap[network] || network
}

export function getNetworkColor(network: string): string {
  const colorMap: { [key: string]: string } = {
    'ethereum': 'text-blue-400',
    'bitcoin': 'text-orange-400',
    'solana': 'text-purple-400',
    'polygon': 'text-indigo-400',
    'binance-smart-chain': 'text-yellow-400',
    'avalanche': 'text-red-400',
    'arbitrum': 'text-blue-500',
    'optimism': 'text-red-500',
    'fantom': 'text-blue-300',
    'cardano': 'text-blue-600',
    'polkadot': 'text-pink-400',
    'cosmos': 'text-purple-500'
  }

  return colorMap[network] || 'text-gray-400'
}

export function getNetworkIcon(network: string): string {
  const iconMap: { [key: string]: string } = {
    'ethereum': '🟦',
    'bitcoin': '🟠',
    'solana': '🟣',
    'polygon': '🟪',
    'binance-smart-chain': '🟡',
    'avalanche': '🔴',
    'arbitrum': '🔵',
    'optimism': '🔴',
    'fantom': '🔷',
    'cardano': '🔵',
    'polkadot': '🩷',
    'cosmos': '🟣'
  }

  return iconMap[network] || '⚪'
}

export function formatBalance(balance: string, decimals: number = 18): string {
  const value = parseFloat(balance) / Math.pow(10, decimals)
  
  if (value < 0.001) return '< 0.001'
  if (value < 1) return value.toFixed(6)
  if (value < 1000) return value.toFixed(4)
  if (value < 1000000) return `${(value / 1000).toFixed(2)}K`
  return `${(value / 1000000).toFixed(2)}M`
}

export function formatUSDValue(value: number): string {
  if (value < 0.01) return '< $0.01'
  if (value < 1000) return `$${value.toFixed(2)}`
  if (value < 1000000) return `$${(value / 1000).toFixed(2)}K`
  return `$${(value / 1000000).toFixed(2)}M`
}
