// Wallet tracking service for Ethereum and Solana
import { toast } from 'sonner'

// Types for wallet data
export interface WalletAsset {
  symbol: string
  name: string
  address?: string
  balance: number
  value: number
  price: number
  change24h?: number
  logo?: string
}

export interface WalletTransaction {
  hash: string
  type: 'in' | 'out' | 'swap' | 'approve'
  amount: number
  token: string
  tokenSymbol: string
  from: string
  to: string
  timestamp: Date
  value: number
  gas?: number
  gasPrice?: number
  network: 'ethereum' | 'solana'
}

export interface TrackedWallet {
  _id?: string
  address: string
  label: string
  network: 'ethereum' | 'solana'
  balance: number
  balanceUSD: number
  assets: WalletAsset[]
  transactions: WalletTransaction[]
  isTracked: boolean
  lastActivity: Date
  totalTransactions: number
  portfolioValue: number
  portfolioChange24h: number
  createdAt: Date
  updatedAt: Date
}

class WalletTrackingService {
  private static instance: WalletTrackingService
  private baseURL = process.env.NODE_ENV === 'production' ? '' : ''
  
  static getInstance(): WalletTrackingService {
    if (!WalletTrackingService.instance) {
      WalletTrackingService.instance = new WalletTrackingService()
    }
    return WalletTrackingService.instance
  }

  // Get Ethereum wallet data using Alchemy/Etherscan
  async getEthereumWalletData(address: string): Promise<Partial<TrackedWallet>> {
    try {
      // For now, we'll use a mock service but in production, integrate with:
      // - Alchemy API for token balances
      // - Etherscan API for transactions
      // - CoinGecko for price data

      const mockEthData: Partial<TrackedWallet> = {
        address,
        network: 'ethereum',
        balance: 2.5, // ETH balance
        balanceUSD: 5000,
        portfolioValue: 15000,
        portfolioChange24h: 5.2,
        assets: [
          {
            symbol: 'ETH',
            name: 'Ethereum',
            balance: 2.5,
            value: 5000,
            price: 2000,
            change24h: 3.2,
            logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0xa0b86a33e6ba4f632f4f7b8db4e7b6a2c20c74b8',
            balance: 5000,
            value: 5000,
            price: 1,
            change24h: 0.1,
            logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
          },
          {
            symbol: 'UNI',
            name: 'Uniswap',
            address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
            balance: 500,
            value: 3000,
            price: 6,
            change24h: -2.1,
            logo: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png'
          },
          {
            symbol: 'LINK',
            name: 'Chainlink',
            address: '0x514910771af9ca656af840dff83e8264ecf986ca',
            balance: 150,
            value: 2000,
            price: 13.33,
            change24h: 1.8,
            logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png'
          }
        ],
        transactions: [
          {
            hash: '0x1234...abcd',
            type: 'in',
            amount: 500,
            token: 'UNI',
            tokenSymbol: 'UNI',
            from: '0x742d35Cc732C4b75b8a93E7F1e3e8b1f5D7C3D3C',
            to: address,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            value: 3000,
            gas: 21000,
            gasPrice: 20,
            network: 'ethereum'
          },
          {
            hash: '0x5678...efgh',
            type: 'out',
            amount: 0.5,
            token: 'ETH',
            tokenSymbol: 'ETH',
            from: address,
            to: '0x8ba1f109551bD432803012645Hac136c',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            value: 1000,
            gas: 21000,
            gasPrice: 18,
            network: 'ethereum'
          }
        ],
        lastActivity: new Date(),
        totalTransactions: 45,
        isTracked: false
      }

      return mockEthData
    } catch (error) {
      console.error('Error fetching Ethereum wallet data:', error)
      throw new Error('Failed to fetch Ethereum wallet data')
    }
  }

  // Get Solana wallet data using Solana RPC
  async getSolanaWalletData(address: string): Promise<Partial<TrackedWallet>> {
    try {
      // For now, we'll use a mock service but in production, integrate with:
      // - Solana RPC for SOL balance and transactions
      // - Solana Token List for token metadata
      // - Jupiter API for token prices

      const mockSolData: Partial<TrackedWallet> = {
        address,
        network: 'solana',
        balance: 150, // SOL balance
        balanceUSD: 3000,
        portfolioValue: 8500,
        portfolioChange24h: -1.8,
        assets: [
          {
            symbol: 'SOL',
            name: 'Solana',
            balance: 150,
            value: 3000,
            price: 20,
            change24h: -2.5,
            logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            balance: 2500,
            value: 2500,
            price: 1,
            change24h: 0.05,
            logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
          },
          {
            symbol: 'RAY',
            name: 'Raydium',
            address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
            balance: 1000,
            value: 2000,
            price: 2,
            change24h: 5.2,
            logo: 'https://assets.coingecko.com/coins/images/13928/small/PSigc4yFbR8IJBUK7ZVHDIYvbj75AoFYi1C3h1sB7tfMSF1Q_raydium.png'
          },
          {
            symbol: 'JUP',
            name: 'Jupiter',
            address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
            balance: 5000,
            value: 1000,
            price: 0.2,
            change24h: 3.7,
            logo: 'https://assets.coingecko.com/coins/images/34189/small/jupiter-exchange-logo.png'
          }
        ],
        transactions: [
          {
            hash: '5KzGhB...x9Mft',
            type: 'swap',
            amount: 1000,
            token: 'RAY',
            tokenSymbol: 'RAY',
            from: address,
            to: 'SwapProgram123...xyz',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            value: 2000,
            network: 'solana'
          },
          {
            hash: '8NpLqA...y2Rct',
            type: 'in',
            amount: 50,
            token: 'SOL',
            tokenSymbol: 'SOL',
            from: 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq',
            to: address,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            value: 1000,
            network: 'solana'
          }
        ],
        lastActivity: new Date(),
        totalTransactions: 78,
        isTracked: false
      }

      return mockSolData
    } catch (error) {
      console.error('Error fetching Solana wallet data:', error)
      throw new Error('Failed to fetch Solana wallet data')
    }
  }

  // Get wallet data based on network
  async getWalletData(address: string, network: 'ethereum' | 'solana'): Promise<Partial<TrackedWallet>> {
    if (network === 'ethereum') {
      return this.getEthereumWalletData(address)
    } else if (network === 'solana') {
      return this.getSolanaWalletData(address)
    } else {
      throw new Error('Unsupported network')
    }
  }

  // Track a wallet
  async trackWallet(address: string, network: 'ethereum' | 'solana', label?: string): Promise<TrackedWallet> {
    try {
      const walletData = await this.getWalletData(address, network)
      
      const response = await fetch('/api/whale-wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          network,
          label: label || `${network} Wallet`,
          ...walletData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to track wallet')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error tracking wallet:', error)
      throw error
    }
  }

  // Get tracked wallets
  async getTrackedWallets(network?: 'ethereum' | 'solana'): Promise<TrackedWallet[]> {
    try {
      const url = new URL('/api/whale-wallets', window.location.origin)
      if (network) {
        url.searchParams.set('network', network)
      }

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracked wallets')
      }

      const wallets = await response.json()
      return wallets
    } catch (error) {
      console.error('Error fetching tracked wallets:', error)
      throw error
    }
  }

  // Remove wallet from tracking
  async untrackWallet(walletId: string): Promise<void> {
    try {
      const response = await fetch(`/api/whale-wallets/${walletId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to untrack wallet')
      }
    } catch (error) {
      console.error('Error untracking wallet:', error)
      throw error
    }
  }

  // Refresh wallet data
  async refreshWalletData(address: string, network: 'ethereum' | 'solana'): Promise<TrackedWallet> {
    try {
      const walletData = await this.getWalletData(address, network)
      
      const response = await fetch(`/api/whale-wallets/${address}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh wallet data')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error refreshing wallet data:', error)
      throw error
    }
  }
}

// Utility functions
export const formatWalletAddress = (address: string): string => {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getNetworkDisplayName = (network: string): string => {
  switch (network) {
    case 'ethereum': return 'Ethereum'
    case 'solana': return 'Solana'
    default: return network
  }
}

export const getNetworkColor = (network: string): string => {
  switch (network) {
    case 'ethereum': return 'bg-blue-500'
    case 'solana': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

export const formatBalance = (balance: number, decimals = 4): string => {
  return balance.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  })
}

export const formatUSDValue = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const walletTrackingService = WalletTrackingService.getInstance()
