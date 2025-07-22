'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Eye,
  Wallet,
  Plus,
  Minus,
  Settings,
  RefreshCw,
  TrendingUp,
  Clock,
  Filter,
  ExternalLink
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'

interface ActivityItem {
  id: string
  type: 'trade' | 'alert' | 'portfolio' | 'watchlist' | 'login' | 'security' | 'system'
  action: string
  description: string
  timestamp: string
  metadata?: {
    amount?: number
    asset?: string
    price?: number
    portfolioName?: string
    alertType?: string
    value?: number
  }
  status?: 'success' | 'pending' | 'failed'
}

export function UserActivity() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (user) {
      fetchActivities()
    }
  }, [user, filter])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      
      // Mock data since we don't have a real activity API yet
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'trade',
          action: 'buy',
          description: 'Purchased Bitcoin',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          metadata: { amount: 0.5, asset: 'BTC', price: 45000, value: 22500 },
          status: 'success'
        },
        {
          id: '2',
          type: 'alert',
          action: 'triggered',
          description: 'Price alert triggered for ETH',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          metadata: { asset: 'ETH', price: 2800, alertType: 'price_above' },
          status: 'success'
        },
        {
          id: '3',
          type: 'portfolio',
          action: 'created',
          description: 'Created new portfolio "DeFi Holdings"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          metadata: { portfolioName: 'DeFi Holdings' },
          status: 'success'
        },
        {
          id: '4',
          type: 'watchlist',
          action: 'added',
          description: 'Added Solana to watchlist',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          metadata: { asset: 'SOL' },
          status: 'success'
        },
        {
          id: '5',
          type: 'trade',
          action: 'sell',
          description: 'Sold Cardano',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          metadata: { amount: 1000, asset: 'ADA', price: 0.52, value: 520 },
          status: 'success'
        },
        {
          id: '6',
          type: 'security',
          action: 'login',
          description: 'Successful login from new device',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          status: 'success'
        },
        {
          id: '7',
          type: 'system',
          action: 'update',
          description: 'Profile information updated',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          status: 'success'
        },
        {
          id: '8',
          type: 'alert',
          action: 'created',
          description: 'Created whale movement alert',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          metadata: { alertType: 'whale_movement' },
          status: 'success'
        }
      ]

      // Filter activities based on selected filter
      const filteredActivities = filter === 'all' 
        ? mockActivities 
        : mockActivities.filter(activity => activity.type === filter)

      setActivities(filteredActivities)
      setHasMore(filteredActivities.length >= 8)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'trade':
        return activity.action === 'buy' 
          ? <ArrowUpRight className="w-5 h-5 text-green-400" />
          : <ArrowDownRight className="w-5 h-5 text-red-400" />
      case 'alert':
        return <Bell className="w-5 h-5 text-yellow-400" />
      case 'portfolio':
        return <Wallet className="w-5 h-5 text-blue-400" />
      case 'watchlist':
        return <Eye className="w-5 h-5 text-purple-400" />
      case 'security':
        return <Settings className="w-5 h-5 text-orange-400" />
      case 'system':
        return <RefreshCw className="w-5 h-5 text-gray-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getActivityColor = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'trade':
        return activity.action === 'buy' 
          ? 'from-green-500/20 to-emerald-500/20 border-green-500/30'
          : 'from-red-500/20 to-rose-500/20 border-red-500/30'
      case 'alert':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
      case 'portfolio':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      case 'watchlist':
        return 'from-purple-500/20 to-violet-500/20 border-purple-500/30'
      case 'security':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30'
      case 'system':
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffMs = now.getTime() - activityTime.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  const filters = [
    { key: 'all', label: 'All Activities', icon: Activity },
    { key: 'trade', label: 'Trades', icon: TrendingUp },
    { key: 'alert', label: 'Alerts', icon: Bell },
    { key: 'portfolio', label: 'Portfolio', icon: Wallet },
    { key: 'watchlist', label: 'Watchlist', icon: Eye },
    { key: 'security', label: 'Security', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-400" />
              Activity History
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Your recent account activities and transactions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={() => fetchActivities()}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </PremiumButton>
            <PremiumBadge variant="outline">
              {activities.length} Activities
            </PremiumBadge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-800/30 rounded-lg">
          {filters.map((filterOption) => {
            const Icon = filterOption.icon
            return (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === filterOption.key
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filterOption.label}
              </button>
            )
          })}
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-400 mb-2">No Activities Found</h4>
              <p className="text-gray-500 text-sm">
                {filter === 'all' 
                  ? 'Start using the platform to see your activity history here.'
                  : `No ${filter} activities found. Try a different filter.`
                }
              </p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg bg-gradient-to-r ${getActivityColor(activity)} border hover:bg-opacity-30 transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-gray-800/50 rounded-lg">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium capitalize">
                          {activity.action} {activity.type}
                        </h4>
                        {activity.status && (
                          <PremiumBadge
                            variant={activity.status === 'success' ? 'default' : 'error'}
                            className="text-xs"
                          >
                            {activity.status}
                          </PremiumBadge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{activity.description}</p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          {activity.metadata.asset && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              Asset: {activity.metadata.asset}
                            </span>
                          )}
                          {activity.metadata.amount && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              Amount: {activity.metadata.amount}
                            </span>
                          )}
                          {activity.metadata.value && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              Value: ${activity.metadata.value.toLocaleString()}
                            </span>
                          )}
                          {activity.metadata.portfolioName && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              Portfolio: {activity.metadata.portfolioName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                    {activity.metadata?.value && (
                      <div className={`text-sm font-medium mt-1 ${
                        activity.action === 'buy' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {activity.action === 'buy' ? '-' : '+'}${activity.metadata.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && activities.length > 0 && (
          <div className="text-center mt-6">
            <PremiumButton
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Load More Activities
            </PremiumButton>
          </div>
        )}
      </div>
    </PremiumCard>
  )
}