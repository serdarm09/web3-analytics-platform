import { useState, useEffect, useCallback } from 'react'
import { 
  walletTrackingService, 
  TrackedWallet, 
  WalletAsset, 
  WalletTransaction,
  formatWalletAddress,
  getNetworkDisplayName,
  getNetworkColor,
  formatBalance,
  formatUSDValue
} from '@/lib/services/walletTrackingService'
import { toast } from 'sonner'

export interface UseWalletTrackingReturn {
  wallets: TrackedWallet[]
  loading: boolean
  error: string | null
  trackWallet: (address: string, network: 'ethereum' | 'solana', label?: string) => Promise<void>
  untrackWallet: (walletId: string) => Promise<void>
  refreshWallet: (address: string, network: 'ethereum' | 'solana') => Promise<void>
  refreshAll: () => Promise<void>
  getWalletsByNetwork: (network: 'ethereum' | 'solana') => TrackedWallet[]
  getTotalPortfolioValue: () => number
  getTotalPortfolioChange: () => number
}

export function useWalletTracking(): UseWalletTrackingReturn {
  const [wallets, setWallets] = useState<TrackedWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tracked wallets
  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedWallets = await walletTrackingService.getTrackedWallets()
      setWallets(fetchedWallets)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallets'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Track a new wallet
  const trackWallet = useCallback(async (address: string, network: 'ethereum' | 'solana', label?: string) => {
    try {
      setLoading(true)
      const newWallet = await walletTrackingService.trackWallet(address, network, label)
      setWallets(prev => [...prev, newWallet])
      toast.success(`${getNetworkDisplayName(network)} wallet tracked successfully`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Untrack a wallet
  const untrackWallet = useCallback(async (walletId: string) => {
    try {
      await walletTrackingService.untrackWallet(walletId)
      setWallets(prev => prev.filter(wallet => wallet._id !== walletId))
      toast.success('Wallet removed from tracking')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to untrack wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Refresh a specific wallet
  const refreshWallet = useCallback(async (address: string, network: 'ethereum' | 'solana') => {
    try {
      const refreshedWallet = await walletTrackingService.refreshWalletData(address, network)
      setWallets(prev => prev.map(wallet => 
        wallet.address === address && wallet.network === network 
          ? refreshedWallet 
          : wallet
      ))
      toast.success('Wallet data refreshed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Refresh all wallets
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true)
      const promises = wallets.map(wallet => 
        walletTrackingService.refreshWalletData(wallet.address, wallet.network)
      )
      const refreshedWallets = await Promise.all(promises)
      setWallets(refreshedWallets)
      toast.success('All wallets refreshed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh wallets'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [wallets])

  // Get wallets by network
  const getWalletsByNetwork = useCallback((network: 'ethereum' | 'solana') => {
    return wallets.filter(wallet => wallet.network === network)
  }, [wallets])

  // Calculate total portfolio value
  const getTotalPortfolioValue = useCallback(() => {
    return wallets.reduce((total, wallet) => total + (wallet.portfolioValue || 0), 0)
  }, [wallets])

  // Calculate total portfolio change
  const getTotalPortfolioChange = useCallback(() => {
    const totalValue = getTotalPortfolioValue()
    if (totalValue === 0) return 0

    const totalChange = wallets.reduce((total, wallet) => {
      const walletValue = wallet.portfolioValue || 0
      const walletChange = wallet.portfolioChange24h || 0
      return total + (walletValue * walletChange / 100)
    }, 0)

    return (totalChange / totalValue) * 100
  }, [wallets, getTotalPortfolioValue])

  // Initial fetch
  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  return {
    wallets,
    loading,
    error,
    trackWallet,
    untrackWallet,
    refreshWallet,
    refreshAll,
    getWalletsByNetwork,
    getTotalPortfolioValue,
    getTotalPortfolioChange
  }
}

// Export utility functions
export {
  formatWalletAddress,
  getNetworkDisplayName,
  getNetworkColor,
  formatBalance,
  formatUSDValue,
  type TrackedWallet,
  type WalletAsset,
  type WalletTransaction
}
