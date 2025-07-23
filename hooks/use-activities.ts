import { useState, useEffect } from 'react'

export interface Activity {
  _id: string
  type: string
  description: string
  metadata: {
    ip?: string
    userAgent?: string
    location?: string
    projectId?: string
    walletAddress?: string
    transactionHash?: string
    network?: string
    amount?: number
    tokenSymbol?: string
    fromAddress?: string
    toAddress?: string
    gasUsed?: number
    gasPrice?: string
    blockNumber?: number
    chainId?: number
    [key: string]: any
  }
  status: 'success' | 'failed' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface ActivityResponse {
  activities: Activity[]
  total: number
  page: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ActivityStats {
  stats: Array<{
    _id: string
    count: number
    lastActivity: string
  }>
  totalActivities: number
  period: number
}

export function useUserActivities(page: number = 1, limit: number = 20, type?: string) {
  const [activities, setActivities] = useState<ActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`/api/user/activities?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      setActivities(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createActivity = async (
    type: string, 
    description: string, 
    metadata?: any, 
    status?: string
  ) => {
    try {
      const response = await fetch('/api/user/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          description,
          metadata,
          status
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create activity')
      }

      // Refresh activities after creating new one
      await fetchActivities()

      return await response.json()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [page, limit, type])

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity
  }
}

export function useActivityStats(days: number = 30) {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/user/activities/stats?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity stats')
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
  }, [days])

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}

// Helper function to format activity type for display
export function formatActivityType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'login': 'Login',
    'logout': 'Logout',
    'portfolio_update': 'Portfolio Update',
    'project_add': 'Project Added',
    'project_remove': 'Project Removed',
    'watchlist_add': 'Added to Watchlist',
    'watchlist_remove': 'Removed from Watchlist',
    'transaction': 'Transaction',
    'wallet_connect': 'Wallet Connected',
    'settings_update': 'Settings Updated',
    'whale_track': 'Whale Tracked',
    'alert_create': 'Alert Created',
    'alert_trigger': 'Alert Triggered'
  }

  return typeMap[type] || type
}

// Helper function to get activity icon
export function getActivityIcon(type: string): string {
  const iconMap: { [key: string]: string } = {
    'login': '🔐',
    'logout': '🚪',
    'portfolio_update': '📊',
    'project_add': '➕',
    'project_remove': '➖',
    'watchlist_add': '⭐',
    'watchlist_remove': '❌',
    'transaction': '💰',
    'wallet_connect': '👛',
    'settings_update': '⚙️',
    'whale_track': '🐋',
    'alert_create': '🔔',
    'alert_trigger': '📢'
  }

  return iconMap[type] || '📝'
}

// Helper function to get activity color
export function getActivityColor(type: string): string {
  const colorMap: { [key: string]: string } = {
    'login': 'text-green-400',
    'logout': 'text-gray-400',
    'portfolio_update': 'text-blue-400',
    'project_add': 'text-emerald-400',
    'project_remove': 'text-red-400',
    'watchlist_add': 'text-yellow-400',
    'watchlist_remove': 'text-orange-400',
    'transaction': 'text-purple-400',
    'wallet_connect': 'text-indigo-400',
    'settings_update': 'text-gray-400',
    'whale_track': 'text-cyan-400',
    'alert_create': 'text-amber-400',
    'alert_trigger': 'text-pink-400'
  }

  return colorMap[type] || 'text-gray-400'
}
