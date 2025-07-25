import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface TrendingProject {
  _id: string
  name: string
  symbol: string
  description?: string
  logo?: string
  category?: string
  blockchain?: string
  website?: string
  twitter?: string
  marketCap?: number
  price?: number
  priceChange24h?: number
  volume24h?: number
  trendingScore: number
  stats: {
    views: number
    adds: number
    engagement: string
  }
  creator?: {
    id: string
    name: string
    email?: string
  }
  addedAt?: Date
  likeCount?: number
}

export function useTrendingProjects(period: '24h' | '7d' | '30d' = '7d') {
  const [projects, setProjects] = useState<TrendingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrendingProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/projects/trending?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch trending projects')
      }

      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load trending projects')
    } finally {
      setLoading(false)
    }
  }, [period])

  const trackProjectView = async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to track project view:', error)
    }
  }

  useEffect(() => {
    fetchTrendingProjects()
  }, [fetchTrendingProjects])

  return {
    projects,
    loading,
    error,
    refresh: fetchTrendingProjects,
    trackProjectView
  }
}