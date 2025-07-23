'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import { fetchWithAuth } from '@/lib/api/fetch-with-auth'

interface Asset {
  symbol: string
  name: string
  amount: number
  avgBuyPrice: number
  currentPrice?: number
}

interface Portfolio {
  id: string
  userId: string
  name: string
  description?: string
  assets: Asset[]
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  lastUpdated: string
  createdAt: string
}

interface CreatePortfolioData {
  name: string
  description?: string
}

interface AddAssetData {
  portfolioId: string
  symbol: string
  name: string
  amount: number
  buyPrice: number
}

interface UpdateAssetData {
  portfolioId: string
  assetSymbol: string
  amount: number
  avgBuyPrice: number
}

export function usePortfolio() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: portfolios, isLoading } = useQuery<Portfolio[]>({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/portfolios')
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }
      
      return response.json()
    },
    enabled: !!user,
    staleTime: 30 * 1000
  })

  const createPortfolioMutation = useMutation({
    mutationFn: async (data: CreatePortfolioData) => {
      const response = await fetchWithAuth('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portfolio')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    }
  })

  const deletePortfolioMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      const response = await fetchWithAuth(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete portfolio')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    }
  })

  const addAssetMutation = useMutation({
    mutationFn: async ({ portfolioId, ...assetData }: AddAssetData) => {
      const response = await fetchWithAuth(`/api/portfolios/${portfolioId}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add asset')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    }
  })

  const updateAssetMutation = useMutation({
    mutationFn: async ({ portfolioId, assetSymbol, ...updateData }: UpdateAssetData) => {
      const response = await fetchWithAuth(`/api/portfolios/${portfolioId}/assets/${assetSymbol}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update asset')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    }
  })

  const removeAssetMutation = useMutation({
    mutationFn: async ({ portfolioId, assetSymbol }: { portfolioId: string; assetSymbol: string }) => {
      const response = await fetchWithAuth(`/api/portfolios/${portfolioId}/assets/${assetSymbol}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove asset')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    }
  })

  const refreshPricesMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      const response = await fetchWithAuth(`/api/portfolios/${portfolioId}/refresh-prices`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to refresh prices')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    }
  })

  return {
    portfolios,
    isLoading,
    createPortfolio: createPortfolioMutation.mutate,
    deletePortfolio: deletePortfolioMutation.mutate,
    addAsset: addAssetMutation.mutate,
    updateAsset: updateAssetMutation.mutate,
    removeAsset: removeAssetMutation.mutate,
    refreshPrices: refreshPricesMutation.mutate,
    isCreating: createPortfolioMutation.isPending,
    isDeleting: deletePortfolioMutation.isPending,
    isAddingAsset: addAssetMutation.isPending,
    isUpdatingAsset: updateAssetMutation.isPending,
    isRemovingAsset: removeAssetMutation.isPending,
    isRefreshingPrices: refreshPricesMutation.isPending
  }
}