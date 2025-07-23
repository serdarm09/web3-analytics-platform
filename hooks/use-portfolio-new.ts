'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { usePortfolioPrices, formatPrice, formatPercentage } from './use-market-data'
import { useAuth } from './use-auth'

export interface PortfolioAsset {
  _id?: string
  symbol: string
  name: string
  amount: number
  averagePrice?: number
  currentPrice?: number
  value?: number
  change24h?: number
  changePercent24h?: number
  image?: string
  notes?: string
}

export interface Portfolio {
  _id?: string
  name: string
  description?: string
  assets: PortfolioAsset[]
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioStats {
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  topGainer?: PortfolioAsset
  topLoser?: PortfolioAsset
  bestPerforming?: PortfolioAsset
  worstPerforming?: PortfolioAsset
}

export function usePortfolio() {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get all unique symbols from all portfolios for price fetching
  const allSymbols = portfolios.flatMap(p => p.assets.map(a => a.symbol))
  const uniqueSymbols = [...new Set(allSymbols)]
  
  const { prices, loading: pricesLoading } = usePortfolioPrices(uniqueSymbols)

  const fetchPortfolios = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/portfolios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }

      const data = await response.json()
      setPortfolios(data.portfolios || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios')
      toast.error('Failed to fetch portfolios')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createPortfolio = useCallback(async (portfolioData: {
    name: string
    description?: string
    isPublic?: boolean
  }) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(portfolioData),
      })

      if (!response.ok) {
        throw new Error('Failed to create portfolio')
      }

      const data = await response.json()
      setPortfolios(prev => [...prev, data.portfolio])
      toast.success('Portfolio created successfully')
      return data.portfolio
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create portfolio')
      throw err
    }
  }, [])

  const updatePortfolio = useCallback(async (portfolioId: string, updates: Partial<Portfolio>) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update portfolio')
      }

      const data = await response.json()
      setPortfolios(prev => 
        prev.map(p => p._id === portfolioId ? data.portfolio : p)
      )
      toast.success('Portfolio updated successfully')
      return data.portfolio
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update portfolio')
      throw err
    }
  }, [])

  const deletePortfolio = useCallback(async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete portfolio')
      }

      setPortfolios(prev => prev.filter(p => p._id !== portfolioId))
      toast.success('Portfolio deleted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete portfolio')
      throw err
    }
  }, [])

  const addAsset = useCallback(async (portfolioId: string, asset: {
    symbol: string
    name: string
    amount: number
    averagePrice?: number
    notes?: string
  }) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(asset),
      })

      if (!response.ok) {
        throw new Error('Failed to add asset')
      }

      const data = await response.json()
      setPortfolios(prev => 
        prev.map(p => p._id === portfolioId ? data.portfolio : p)
      )
      toast.success('Asset added successfully')
      return data.portfolio
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add asset')
      throw err
    }
  }, [])

  const updateAsset = useCallback(async (portfolioId: string, assetId: string, updates: Partial<PortfolioAsset>) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/assets/${assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update asset')
      }

      const data = await response.json()
      setPortfolios(prev => 
        prev.map(p => p._id === portfolioId ? data.portfolio : p)
      )
      toast.success('Asset updated successfully')
      return data.portfolio
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update asset')
      throw err
    }
  }, [])

  const removeAsset = useCallback(async (portfolioId: string, assetId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to remove asset')
      }

      const data = await response.json()
      setPortfolios(prev => 
        prev.map(p => p._id === portfolioId ? data.portfolio : p)
      )
      toast.success('Asset removed successfully')
      return data.portfolio
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove asset')
      throw err
    }
  }, [])

  // Calculate portfolio stats with real-time prices
  const calculatePortfolioStats = useCallback((portfolio: Portfolio): PortfolioStats => {
    let totalValue = 0
    let totalCost = 0
    let topGainer: PortfolioAsset | undefined
    let topLoser: PortfolioAsset | undefined
    let bestPerforming: PortfolioAsset | undefined
    let worstPerforming: PortfolioAsset | undefined

    const updatedAssets = portfolio.assets.map(asset => {
      const priceData = prices[asset.symbol]
      const currentPrice = priceData?.current_price || asset.currentPrice || 0
      const change24h = priceData?.price_change_percentage_24h || 0
      
      const value = asset.amount * currentPrice
      const cost = (asset.averagePrice || 0) * asset.amount
      const profitLoss = value - cost
      const profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0

      totalValue += value
      totalCost += cost

      const updatedAsset = {
        ...asset,
        currentPrice,
        value,
        change24h,
        changePercent24h: change24h,
        image: priceData?.image
      }

      // Track top performers
      if (!topGainer || change24h > (topGainer.changePercent24h || 0)) {
        topGainer = updatedAsset
      }
      if (!topLoser || change24h < (topLoser.changePercent24h || 0)) {
        topLoser = updatedAsset
      }
      if (!bestPerforming || profitLossPercentage > (bestPerforming.changePercent24h || 0)) {
        bestPerforming = updatedAsset
      }
      if (!worstPerforming || profitLossPercentage < (worstPerforming.changePercent24h || 0)) {
        worstPerforming = updatedAsset
      }

      return updatedAsset
    })

    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercentage,
      topGainer,
      topLoser,
      bestPerforming,
      worstPerforming
    }
  }, [prices])

  // Update portfolios with current prices
  const portfoliosWithPrices = portfolios.map(portfolio => ({
    ...portfolio,
    assets: portfolio.assets.map(asset => {
      const priceData = prices[asset.symbol]
      return {
        ...asset,
        currentPrice: priceData?.current_price || asset.currentPrice || 0,
        value: asset.amount * (priceData?.current_price || asset.currentPrice || 0),
        change24h: priceData?.price_change_percentage_24h || 0,
        changePercent24h: priceData?.price_change_percentage_24h || 0,
        image: priceData?.image
      }
    })
  }))

  useEffect(() => {
    if (user) {
      fetchPortfolios()
    }
  }, [user, fetchPortfolios])

  return {
    portfolios: portfoliosWithPrices,
    loading: loading || pricesLoading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    addAsset,
    updateAsset,
    removeAsset,
    calculatePortfolioStats,
    refresh: fetchPortfolios,
    formatPrice,
    formatPercentage
  }
}

// Hook for a specific portfolio
export function usePortfolioById(portfolioId: string) {
  const { portfolios, loading, error, ...actions } = usePortfolio()
  const portfolio = portfolios.find(p => p._id === portfolioId)

  return {
    portfolio,
    loading,
    error,
    ...actions
  }
}
