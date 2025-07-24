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
  Zap,
  RefreshCw,
  PieChart,
  Target,
  Clock,
  AlertTriangle,
  Shield,
  Coins
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { useWallet } from '@/hooks/useWallet'
import { useAuth } from '@/hooks/use-auth'
import { STORAGE_KEYS } from '@/lib/constants'
import { cryptoDataService } from '@/lib/services/cryptoDataService'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { address, isConnected } = useWallet()
  const { user: authUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [userProjects, setUserProjects] = useState<any[]>([])
  const [hasPortfolio, setHasPortfolio] = useState(false)
  const [hasProjects, setHasProjects] = useState(false)
  const [marketData, setMarketData] = useState<{
    topGainers: any[]
    topLosers: any[]
    globalStats: any
  }>({
    topGainers: [],
    topLosers: [],
    globalStats: null
  })
  const [trendingCoins, setTrendingCoins] = useState<any[]>([])
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    change24h: 0,
    totalProjects: 0,
    activeAlerts: 0,
    totalPnL: 0,
    bestPerforming: null,
    worstPerforming: null,
    totalAssets: 0
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [whaleActivities, setWhaleActivities] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    joinDate: null as string | null,
    totalTrades: 0,
    successRate: 0,
    totalProfit: 0
  })

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true)
      await Promise.all([
        fetchUserData(),
        fetchPortfolioData(),
        fetchUserProjects(),
        fetchMarketData(),
        fetchTrendingData(),
        fetchRecentActivities(),
        fetchAlerts(),
        fetchWhaleActivities()
      ])
      setLoading(false)
    }

    initializeDashboard()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMarketData()
      fetchTrendingData()
      fetchWhaleActivities()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      if (authUser) {
        setUserStats({
          joinDate: authUser.createdAt,
          totalTrades: 0, // These stats will be calculated from portfolios
          successRate: 0,
          totalProfit: 0
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolios')
      if (response.ok) {
        const data = await response.json()
        setPortfolios(data.portfolios || [])
        setHasPortfolio(data.portfolios && data.portfolios.length > 0)
        
        if (data.portfolios && data.portfolios.length > 0) {
          // Calculate portfolio summary
          const totalValue = data.portfolios.reduce((sum: number, portfolio: any) => 
            sum + (portfolio.totalValue || 0), 0)
          const totalChange = data.portfolios.reduce((sum: number, portfolio: any) => 
            sum + (portfolio.change24h || 0), 0) / data.portfolios.length
          
          setPortfolioData(prev => ({
            ...prev,
            totalValue,
            change24h: totalChange,
            totalAssets: data.portfolios.reduce((sum: number, portfolio: any) => 
              sum + (portfolio.assets?.length || 0), 0)
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setHasPortfolio(false)
    }
  }

  const fetchUserProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setUserProjects(data.projects || [])
        setHasProjects(data.projects && data.projects.length > 0)
        
        setPortfolioData(prev => ({
          ...prev,
          totalProjects: data.projects?.length || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setHasProjects(false)
    }
  }

  const fetchMarketData = async () => {
    try {
      const [gainersLosers, globalData] = await Promise.all([
        cryptoDataService.getTopGainersLosers(10),
        cryptoDataService.getGlobalMarketData()
      ])

      setMarketData({
        topGainers: gainersLosers.gainers.map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change: coin.price_change_percentage_24h,
          image: (coin as any).image || ''
        })),
        topLosers: gainersLosers.losers.map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change: coin.price_change_percentage_24h,
          image: (coin as any).image || ''
        })),
        globalStats: globalData
      })
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
  }

  const fetchTrendingData = async () => {
    try {
      const response = await fetch('/api/trending?limit=5')
      if (response.ok) {
        const data = await response.json()
        setTrendingCoins(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching trending data:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/activities/recent')
      if (response.ok) {
        const data = await response.json()
        setRecentActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      // Mock data for demo
      setRecentActivities([
        { type: 'portfolio_update', message: 'Portfolio synced with wallet', time: '5 min ago' },
        { type: 'project_added', message: 'Added SOL to watchlist', time: '1 hour ago' },
        { type: 'alert_triggered', message: 'BTC reached $45,000', time: '2 hours ago' }
      ])
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
        setPortfolioData(prev => ({
          ...prev,
          activeAlerts: data.alerts?.length || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const fetchWhaleActivities = async () => {
    try {
      const response = await fetch('/api/whale-wallets')
      if (response.ok) {
        const data = await response.json()
        setWhaleActivities(data.activities?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error fetching whale activities:', error)
      // Mock data
      setWhaleActivities([
        { wallet: '0x742d...293f', amount: '1,500 BTC', value: '$67.5M', time: '15 min ago' },
        { wallet: '0x8a2b...194c', amount: '50,000 ETH', value: '$125M', time: '1 hour ago' },
        { wallet: '0x9f4e...582a', amount: '2M USDT', value: '$2M', time: '3 hours ago' }
      ])
    }
  }

  const refreshData = () => {
    toast.promise(
      Promise.all([fetchMarketData(), fetchTrendingData(), fetchPortfolioData()]), 
      {
        loading: 'Refreshing data...',
        success: 'Data updated!',
        error: 'Failed to update data'
      }
    )
  }

  // Portfolio Performance Component
  const PortfolioSection = () => {
    if (!hasPortfolio) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Portfolio Overview */}
        <div className="lg:col-span-2">
          <PremiumCard className="glassmorphism border border-white border-opacity-10">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Portfolio Overview</h3>
                  <p className="text-gray-400 text-sm">Your crypto holdings performance</p>
                </div>
                <PremiumBadge variant="gradient">Live</PremiumBadge>
              </div>
              
              {/* Portfolio Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">${portfolioData.totalValue.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Total Value</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{portfolioData.change24h > 0 ? '+' : ''}{portfolioData.change24h.toFixed(2)}%</div>
                  <div className="text-xs text-gray-400">24h Change</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                  <Coins className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{portfolioData.totalAssets}</div>
                  <div className="text-xs text-gray-400">Assets</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{portfolios.length}</div>
                  <div className="text-xs text-gray-400">Portfolios</div>
                </div>
              </div>

              {/* Portfolio List */}
              <div className="space-y-3">
                {portfolios.slice(0, 3).map((portfolio, index) => (
                  <motion.div
                    key={portfolio._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{portfolio.name}</div>
                        <div className="text-gray-400 text-sm">{portfolio.assets?.length || 0} assets</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">${(portfolio.totalValue || 0).toLocaleString()}</div>
                      <div className={`text-sm ${(portfolio.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(portfolio.change24h || 0) > 0 ? '+' : ''}{(portfolio.change24h || 0).toFixed(2)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Quick Actions */}
        <div>
          <PremiumCard className="glassmorphism border border-white border-opacity-10">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <PremiumButton className="w-full" variant="glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Portfolio
                </PremiumButton>
                <PremiumButton className="w-full" variant="glow">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </PremiumButton>
                <PremiumButton className="w-full" variant="glow">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Price Alert
                </PremiumButton>
                <PremiumButton className="w-full" variant="glow">
                  <Eye className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </motion.div>
    )
  }

  // Projects Section Component
  const ProjectsSection = () => {
    if (!hasProjects) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6"
      >
        <PremiumCard className="glassmorphism border border-white border-opacity-10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">Tracked Projects</h3>
                <p className="text-gray-400 text-sm">Your cryptocurrency watchlist</p>
              </div>
              <PremiumBadge variant="outline">{userProjects.length} Projects</PremiumBadge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProjects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{project.symbol?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{project.name}</div>
                        <div className="text-gray-400 text-xs">{project.symbol}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      (project.marketData?.price_change_percentage_24h || 0) >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {(project.marketData?.price_change_percentage_24h || 0) > 0 ? '+' : ''}
                      {(project.marketData?.price_change_percentage_24h || 0).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    ${(project.marketData?.price || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    Market Cap: ${(project.marketData?.market_cap || 0).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    )
  }

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
              Welcome back, {authUser?.name || 'Trader'}! Here's your Web3 overview.
            </p>
            {isConnected && address && (
              <div className="flex items-center mt-2 text-sm text-green-400">
                <Wallet className="w-4 h-4 mr-2" />
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PremiumButton onClick={refreshData} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </PremiumButton>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {hasPortfolio && (
            <StatsCard
              title="Portfolio Value"
              value={`$${portfolioData.totalValue.toLocaleString()}`}
              change={portfolioData.change24h}
              icon={<DollarSign className="w-6 h-6 text-accent-green" />}
            />
          )}
          {hasProjects && (
            <StatsCard
              title="Tracked Projects"
              value={portfolioData.totalProjects.toString()}
              change={8.5}
              icon={<BarChart3 className="w-6 h-6 text-accent-blue" />}
            />
          )}
          <StatsCard
            title="Active Alerts"
            value={portfolioData.activeAlerts.toString()}
            change={-2.3}
            icon={<Bell className="w-6 h-6 text-accent-orange" />}
          />
          <StatsCard
            title="Whale Alerts"
            value={whaleActivities.length.toString()}
            change={12.1}
            icon={<Eye className="w-6 h-6 text-accent-purple" />}
          />
        </motion.div>

        {/* Portfolio Section - Only show if user has portfolios */}
        <PortfolioSection />

        {/* Projects Section - Only show if user has projects */}
        <ProjectsSection />

        {/* Market Data & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <PremiumCard className="glassmorphism border border-white border-opacity-10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Top Gainers</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-3">
                  {marketData.topGainers.slice(0, 5).map((coin, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{coin.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{coin.symbol}</div>
                          <div className="text-gray-400 text-xs">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">${coin.price.toFixed(4)}</div>
                        <div className="text-green-500 text-sm">+{coin.change.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Whale Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <PremiumCard className="glassmorphism border border-white border-opacity-10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Whale Activity</h3>
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <div className="space-y-3">
                  {whaleActivities.map((activity, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <div className="text-white text-sm font-medium">{activity.wallet}</div>
                        <div className="text-gray-400 text-xs">{activity.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-400 font-medium">{activity.amount}</div>
                        <div className="text-gray-300 text-xs">{activity.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <PremiumCard className="glassmorphism border border-white border-opacity-10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{activity.message}</div>
                        <div className="text-gray-400 text-xs">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
