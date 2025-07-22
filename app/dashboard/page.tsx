'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Eye,
  Plus,
  BarChart3,
  Users,
  Zap
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { useWallet } from '@/hooks/useWallet'
import { STORAGE_KEYS } from '@/lib/constants'

export default function DashboardPage() {
  const { address, isConnected } = useWallet()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      setUser({
        name: 'Web3 Trader',
        email: 'trader@example.com',
        subscription: 'pro'
      })
    }
  }, [])

  const portfolioData = {
    totalValue: 125420.50,
    change24h: 5.23,
    totalProjects: 24,
    activeAlerts: 7
  }

  const topGainers = [
    { symbol: 'PEPE', name: 'Pepe', price: 0.00000123, change: 45.2 },
    { symbol: 'SHIB', name: 'Shiba Inu', price: 0.00002341, change: 23.5 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.0823, change: 12.8 },
  ]

  const topLosers = [
    { symbol: 'LUNA', name: 'Terra Luna', price: 0.00012, change: -32.1 },
    { symbol: 'FTT', name: 'FTX Token', price: 1.23, change: -28.9 },
    { symbol: 'SAND', name: 'The Sandbox', price: 0.423, change: -15.2 },
  ]

  const recentActivity = [
    { type: 'buy', asset: 'BTC', amount: '0.5', value: '$22,500', time: '2 hours ago' },
    { type: 'alert', message: 'ETH reached target price of $1,800', time: '4 hours ago' },
    { type: 'whale', wallet: '0x742d...293f', amount: '10,000 ETH', time: '6 hours ago' },
    { type: 'sell', asset: 'MATIC', amount: '1,000', value: '$1,200', time: '1 day ago' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 bg-opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 bg-opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {user?.name || 'Trader'}! Here's your portfolio overview.
            </p>
            {isConnected && address && (
              <div className="flex items-center mt-2 text-sm text-green-400">
                <Wallet className="w-4 h-4 mr-2" />
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <PremiumButton variant="outline">
              <Bell className="w-4 h-4" />
            </PremiumButton>
            <PremiumButton variant="gradient">
              <Plus className="w-4 h-4" />
            </PremiumButton>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Portfolio Value"
            value={`$${portfolioData.totalValue.toLocaleString()}`}
            change={portfolioData.change24h}
            icon={<DollarSign className="w-6 h-6 text-accent-green" />}
          />
          <StatsCard
            title="Total Projects"
            value={portfolioData.totalProjects.toString()}
            change={8.5}
            icon={<BarChart3 className="w-6 h-6 text-accent-blue" />}
          />
          <StatsCard
            title="Active Alerts"
            value={portfolioData.activeAlerts.toString()}
            change={-2.3}
            icon={<Bell className="w-6 h-6 text-accent-orange" />}
          />
          <StatsCard
            title="Following"
            value="142"
            change={12.1}
            icon={<Users className="w-6 h-6 text-accent-purple" />}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - 8 cols */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Portfolio Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PremiumCard className="glassmorphism border border-white border-opacity-10">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Portfolio Performance</h3>
                      <p className="text-gray-400 text-sm">Last 30 days overview</p>
                    </div>
                    <PremiumBadge variant="gradient">
                      Live
                    </PremiumBadge>
                  </div>
                  
                  {/* Mock Chart Area */}
                  <div className="h-64 bg-gradient-to-br from-purple-500 from-opacity-10 to-blue-500 to-opacity-10 rounded-lg border border-white border-opacity-5 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Interactive Chart Coming Soon</p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PremiumCard className="glassmorphism border border-white border-opacity-10">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                    <PremiumButton variant="outline" size="sm">
                      View All
                    </PremiumButton>
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'buy' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                            activity.type === 'sell' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                            activity.type === 'alert' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                            'bg-blue-500 bg-opacity-20 text-blue-400'
                          }`}>
                            {activity.type === 'buy' && <ArrowUpRight className="w-5 h-5" />}
                            {activity.type === 'sell' && <ArrowDownRight className="w-5 h-5" />}
                            {activity.type === 'alert' && <Bell className="w-5 h-5" />}
                            {activity.type === 'whale' && <Eye className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {activity.type === 'buy' && (
                                <span>Bought {activity.amount} {activity.asset}</span>
                              )}
                              {activity.type === 'sell' && (
                                <span>Sold {activity.amount} {activity.asset}</span>
                              )}
                              {activity.type === 'alert' && activity.message}
                              {activity.type === 'whale' && (
                                <span>Whale movement detected</span>
                              )}
                            </p>
                            <p className="text-gray-400 text-sm">{activity.time}</p>
                          </div>
                        </div>
                        {(activity.type === 'buy' || activity.type === 'sell') && (
                          <div className="text-right">
                            <p className="text-white font-medium">{activity.value}</p>
                            <p className="text-gray-400 text-sm">{activity.amount} {activity.asset}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Right Column - 4 cols */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Top Gainers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PremiumCard className="glassmorphism border border-white border-opacity-10">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Gainers</h3>
                  <div className="space-y-4">
                    {topGainers.map((token, index) => (
                      <motion.div
                        key={token.symbol}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 hover:bg-green-500 hover:bg-opacity-20 transition-all duration-200"
                      >
                        <div>
                          <p className="text-white font-medium">{token.symbol}</p>
                          <p className="text-gray-400 text-sm">{token.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${token.price}</p>
                          <p className="text-green-400 text-sm flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            +{token.change}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Top Losers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <PremiumCard className="glassmorphism border border-white border-opacity-10">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Losers</h3>
                  <div className="space-y-4">
                    {topLosers.map((token, index) => (
                      <motion.div
                        key={token.symbol}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200"
                      >
                        <div>
                          <p className="text-white font-medium">{token.symbol}</p>
                          <p className="text-gray-400 text-sm">{token.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${token.price}</p>
                          <p className="text-red-400 text-sm flex items-center">
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                            {token.change}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <PremiumCard className="glassmorphism border border-white border-opacity-10">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <PremiumButton variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <Plus className="w-6 h-6 mb-2" />
                      <span className="text-sm">Add Alert</span>
                    </PremiumButton>
                    <PremiumButton variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <Eye className="w-6 h-6 mb-2" />
                      <span className="text-sm">Watch Whale</span>
                    </PremiumButton>
                    <PremiumButton variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <BarChart3 className="w-6 h-6 mb-2" />
                      <span className="text-sm">Analytics</span>
                    </PremiumButton>
                    <PremiumButton variant="gradient" className="flex flex-col items-center p-4 h-auto">
                      <Zap className="w-6 h-6 mb-2" />
                      <span className="text-sm">Upgrade</span>
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}