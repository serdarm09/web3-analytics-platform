'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface WatchlistItem {
  _id: string
  coinId: string
  symbol: string
  name: string
  currentPrice?: number
  priceChange24h?: number
  priceChange7d?: number
  volume24h?: number
  marketCap?: number
  alertPrice?: number
  notes?: string
  addedAt: Date
}

export function useWatchlist() {
  const queryClient = useQueryClient()

  // Fetch watchlist
  const { data: watchlist = [], isLoading, error } = useQuery<WatchlistItem[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist')
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist')
      }
      const data = await response.json()
      return data.watchlist || []
    }
  })

  // Add to watchlist
  const addToWatchlistMutation = useMutation({
    mutationFn: async (item: { coinId: string; symbol: string; name: string; alertPrice?: number; notes?: string }) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to watchlist')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      toast.success('Watchlist\'e eklendi!')
    },
    onError: (error) => {
      toast.error(error.message || 'Watchlist\'e eklenemedi')
    }
  })

  // Remove from watchlist
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove from watchlist')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      toast.success('Watchlist\'ten kaldırıldı')
    },
    onError: () => {
      toast.error('Kaldırma işlemi başarısız')
    }
  })

  // Update watchlist item
  const updateWatchlistMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; alertPrice?: number; notes?: string }) => {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update watchlist item')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      toast.success('Güncellendi')
    },
    onError: () => {
      toast.error('Güncelleme başarısız')
    }
  })

  return {
    watchlist,
    isLoading,
    error,
    addToWatchlist: addToWatchlistMutation.mutate,
    removeFromWatchlist: removeFromWatchlistMutation.mutate,
    updateWatchlistItem: updateWatchlistMutation.mutate,
    isAdding: addToWatchlistMutation.isPending,
    isRemoving: removeFromWatchlistMutation.isPending,
    isUpdating: updateWatchlistMutation.isPending
  }
}