"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Clock,
  Filter,
  Search,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Eye,
  RefreshCw
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumInput } from "@/components/ui/premium-input"
import { 
  useUserActivities, 
  useActivityStats,
  formatActivityType,
  getActivityIcon,
  getActivityColor,
  type Activity
} from "@/hooks/use-activities"

interface ActivityHistoryProps {
  userId: string
}

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateDetailed(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function ActivityHistory({ userId }: ActivityHistoryProps) {
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const { activities, loading, error, fetchActivities } = useUserActivities(page, 20, filterType || undefined)
  const { stats, loading: statsLoading } = useActivityStats(30)

  // Filter activities based on search term
  const filteredActivities = activities?.activities?.filter(activity =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatActivityType(activity.type).toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const activityTypes = [
    { value: '', label: 'All Activities' },
    { value: 'login', label: 'Login' },
    { value: 'portfolio_update', label: 'Portfolio Updates' },
    { value: 'transaction', label: 'Transactions' },
    { value: 'wallet_connect', label: 'Wallet Connections' },
    { value: 'project_add', label: 'Project Actions' },
    { value: 'settings_update', label: 'Settings Changes' }
  ]

  const handleRefresh = () => {
    fetchActivities()
  }

  return (
    <div className="space-y-6">
      {/* Activity Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Activities</p>
                <p className="text-2xl font-bold text-white">{stats.totalActivities}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                📊
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Most Active</p>
                <p className="text-2xl font-bold text-white">
                  {stats.stats[0] ? formatActivityType(stats.stats[0]._id) : 'No Data'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                {stats.stats[0] ? getActivityIcon(stats.stats[0]._id) : '📝'}
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-4 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Last 30 Days</p>
                <p className="text-2xl font-bold text-white">{stats.period} days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                🗓️
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Filters and Search */}
      <PremiumCard className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <PremiumInput
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-gray-900/50 border-gray-600 text-white focus:outline-none focus:border-accent-slate"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </PremiumButton>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800/50 h-16 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <PremiumButton onClick={handleRefresh}>Try Again</PremiumButton>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No activities found</p>
              {searchTerm && (
                <PremiumButton onClick={() => setSearchTerm('')}>
                  Clear Search
                </PremiumButton>
              )}
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div 
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {formatActivityType(activity.type)}
                      </p>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'success' 
                          ? 'bg-green-500/20 text-green-400'
                          : activity.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {activities && activities.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, activities.total)} of {activities.total} activities
            </p>
            
            <div className="flex items-center gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!activities.hasPrev}
              >
                Previous
              </PremiumButton>
              
              <span className="px-3 py-1 text-sm text-gray-400">
                {page} of {activities.pages}
              </span>
              
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!activities.hasNext}
              >
                Next
              </PremiumButton>
            </div>
          </div>
        )}
      </PremiumCard>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Activity Details</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-xl">
                  {getActivityIcon(selectedActivity.type)}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {formatActivityType(selectedActivity.type)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDateDetailed(selectedActivity.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Description</p>
                <p className="text-gray-400">{selectedActivity.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  selectedActivity.status === 'success' 
                    ? 'bg-green-500/20 text-green-400'
                    : selectedActivity.status === 'failed'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedActivity.status}
                </span>
              </div>

              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Additional Information</p>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
