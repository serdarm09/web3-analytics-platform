'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { ethers } from 'ethers'
import { useHydrated } from './useHydrated'
import { STORAGE_KEYS } from '@/lib/constants'

interface WalletContextType {
  address: string | null
  balance: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  provider: ethers.BrowserProvider | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  const connectWallet = async () => {
    if (!hydrated) return
    
    try {
      setIsConnecting(true)
      setError(null)

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed')
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum)
      const signer = await newProvider.getSigner()
      const userAddress = await signer.getAddress()
      const userBalance = await newProvider.getBalance(userAddress)

      setProvider(newProvider)
      setAddress(userAddress)
      setBalance(ethers.formatEther(userBalance))
      setIsConnected(true)

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true')
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, userAddress)

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Wallet connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setBalance(null)
    setIsConnected(false)
    setProvider(null)
    setError(null)
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED)
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
  }

  // Auto-connect on load if previously connected
  useEffect(() => {
    if (!hydrated) return
    
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED)
      const savedAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
      
      if (wasConnected && savedAddress && typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })
          
          if (accounts.length > 0 && accounts[0] === savedAddress) {
            await connectWallet()
          } else {
            // Clear localStorage if accounts don't match
            localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED)
            localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
          }
        } catch (err) {
          console.error('Auto-connect failed:', err)
        }
      }
    }

    autoConnect()
  }, [hydrated])

  // Listen for account changes
  useEffect(() => {
    if (!hydrated || typeof window.ethereum === 'undefined') return
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== address) {
        connectWallet()
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [address])

  const value: WalletContextType = {
    address,
    balance,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    provider,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
