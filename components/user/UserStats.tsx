'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useEffect, useState } from 'react'
import {
  Wallet,
  TrendingUp,
  Eye,
  Activity,
  PieChart,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { StatsCard } from '@/components/dashboard/stats-card'

interface UserStats {
  totalValue: number
  dayChange: number
  dayChangePercent: number
  totalProjects: number
  totalTransactions: number
}

interface UserStatsData {
  totalPortfolioValue: number
  totalPortfolios: number
  totalAssets: number
  totalProjects: number
  watchlistItems: number
  totalTransactions: number
  profitLoss: number
  lastLoginDate: string
  accountAge: number
  subscription: string
  verificationStatus: boolean
  twoFactorEnabled: boolean
  apiCalls: number
}

export function UserStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStatsData>({
    totalPortfolioValue: 0,
    totalPortfolios: 0,
    totalAssets: 0,
    totalProjects: 0,
    watchlistItems: 0,
    totalTransactions: 0,
    profitLoss: 0,
    lastLoginDate: '',
    accountAge: 0,
    subscription: 'free',
    verificationStatus: false,
    twoFactorEnabled: false,
    apiCalls: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      
      // Fetch portfolios
      const portfoliosRes = await fetch('/api/portfolios')
      const portfoliosData = portfoliosRes.ok ? await portfoliosRes.json() : { portfolios: [] }
      
      // Fetch projects
      const projectsRes = await fetch('/api/projects')
      const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] }

      // Calculate stats
      const portfolios = portfoliosData.portfolios || []
      const projects = projectsData.projects || []

      const totalPortfolioValue = portfolios.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0)
      const totalAssets = portfolios.reduce((sum: number, p: any) => sum + (p.assets?.length || 0), 0)
      const accountAge = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0

      setStats({
        totalPortfolioValue,
        totalPortfolios: portfolios.length,
        totalAssets,
        totalProjects: projects.length,
        watchlistItems: projects.filter((p: any) => p.isWatching).length,
        totalTransactions: portfolios.reduce((sum: number, p: any) => sum + (p.transactions?.length || 0), 0),
        profitLoss: portfolios.reduce((sum: number, p: any) => sum + (p.totalPnL || 0), 0),
        lastLoginDate: new Date().toISOString(),
        accountAge,
        subscription: user?.subscription || 'free',
        verificationStatus: user?.isVerified || false,
        twoFactorEnabled: user?.twoFactorEnabled || false,
        apiCalls: Math.floor(Math.random() * 1000) + 500 // Mock data
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Portfolio Value"
            value={`$${stats.totalPortfolioValue.toLocaleString()}`}
            change={stats.profitLoss >= 0 ? 5.2 : -2.1}
            icon={<DollarSign className="w-6 h-6 text-green-400" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Portfolios"
            value={stats.totalPortfolios.toString()}
            change={12.5}
            icon={<Wallet className="w-6 h-6 text-blue-400" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Tracked Projects"
            value={stats.totalProjects.toString()}
            change={8.3}
            icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
          />
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <motion.div variants={itemVariants}>
        <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Account Overview</h3>
              <PremiumBadge variant="outline">
                {stats.subscription.toUpperCase()} Plan
              </PremiumBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
                <PieChart className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.totalAssets}</div>
                <div className="text-sm text-gray-400">Total Assets</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                <Eye className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.watchlistItems}</div>
                <div className="text-sm text-gray-400">Watchlist Items</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.totalTransactions}</div>
                <div className="text-sm text-gray-400">Transactions</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                <Clock className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.accountAge}</div>
                <div className="text-sm text-gray-400">Days Active</div>
              </div>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Security & Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                Security Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stats.verificationStatus ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-white">Account Verification</span>
                  </div>
                  <PremiumBadge variant={stats.verificationStatus ? "default" : "error"}>
                    {stats.verificationStatus ? 'Verified' : 'Unverified'}
                  </PremiumBadge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stats.twoFactorEnabled ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <span className="text-white">Two-Factor Auth</span>
                  </div>
                  <PremiumBadge variant={stats.twoFactorEnabled ? "default" : "outline"}>
                    {stats.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </PremiumBadge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-white">Registration Method</span>
                  </div>
                  <PremiumBadge variant="outline" className="capitalize">
                    {user?.registrationMethod || 'Email'}
                  </PremiumBadge>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Usage Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-gray-400">API Calls This Month</span>
                  <div className="text-right">
                    <div className="text-white font-bold">{stats.apiCalls.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">
                      {stats.subscription === 'free' ? '/ 1,000' : '/ Unlimited'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-gray-400">Last Login</span>
                  <div className="text-white font-bold">
                    {new Date(stats.lastLoginDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-gray-400">Total P&L</span>
                  <div className={`font-bold ${stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.profitLoss >= 0 ? '+' : ''}${stats.profitLoss.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    </motion.div>
  )
}