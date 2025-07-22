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
import { toast } from 'sonner'
import { getTopCryptos, getTrendingCryptos, getGlobalMarketData } from '@/lib/services/crypto-api'

export default function DashboardPage() {
  const { address, isConnected } = useWallet()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    setPortfolioData(prev => ({
      ...prev,
      activeAlerts: 0
    }))
  }, [])

  useEffect(() => {
    if (authUser) {
      setUser(authUser)
    }
    fetchMarketData()
    fetchPortfolioData()
    fetchTrendingData()
    fetchUserProjects()
  }, [authUser])

  const fetchTrendingData = async () => {
    try {
      const response = await fetch('/api/market-data/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingCoins(data.coins || [])
      }
    } catch (error) {
      console.error('Error fetching trending data:', error)
    }
  }

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      
      // Fetch real-time crypto data
      const [cryptos, globalData] = await Promise.all([
        getTopCryptos(20),
        getGlobalMarketData()
      ])
      
      if (cryptos.length > 0) {
        // Sort by 24h change to get gainers and losers
        const sorted = [...cryptos].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        
        setMarketData({
          topGainers: sorted.slice(0, 5).map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change: coin.price_change_percentage_24h,
            image: coin.image,
            marketCap: coin.market_cap,
            volume: coin.volume_24h
          })),
          topLosers: sorted.slice(-5).reverse().map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change: coin.price_change_percentage_24h,
            image: coin.image,
            marketCap: coin.market_cap,
            volume: coin.volume_24h
          })),
          globalStats: globalData
        })
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
      // Fallback to mock data if API fails
      setMarketData({
        topGainers: [
          { symbol: 'BTC', name: 'Bitcoin', price: 45000, change: 2.5 },
          { symbol: 'ETH', name: 'Ethereum', price: 2500, change: 3.2 },
          { symbol: 'BNB', name: 'Binance Coin', price: 320, change: 1.8 },
          { symbol: 'SOL', name: 'Solana', price: 95, change: 4.7 },
          { symbol: 'ADA', name: 'Cardano', price: 0.52, change: 2.1 }
        ],
        topLosers: [
          { symbol: 'DOGE', name: 'Dogecoin', price: 0.08, change: -4.2 },
          { symbol: 'XRP', name: 'Ripple', price: 0.52, change: -3.1 },
          { symbol: 'SHIB', name: 'Shiba Inu', price: 0.000023, change: -2.8 },
          { symbol: 'MATIC', name: 'Polygon', price: 0.84, change: -3.5 },
          { symbol: 'AVAX', name: 'Avalanche', price: 18.5, change: -2.3 }
        ],
        globalStats: null
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioData = async () => {
    try {
      // Portfolio API'sinden veri çek
      const response = await fetch('/api/portfolios')
      if (response.ok) {
        const data = await response.json()
        if (data.portfolios && data.portfolios.length > 0) {
          setHasPortfolio(true)
          setPortfolios(data.portfolios)
          // Portfolio verilerini hesapla
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
        } else {
          setHasPortfolio(false)
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
        if (data.projects && data.projects.length > 0) {
          setHasProjects(true)
          setUserProjects(data.projects)
          setPortfolioData(prev => ({
            ...prev,
            totalProjects: data.projects.length
          }))
        } else {
          setHasProjects(false)
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setHasProjects(false)
    }
  }

  const refreshData = () => {
    toast.promise(
      Promise.all([fetchMarketData(), fetchTrendingData()]), 
      {
        loading: 'Refreshing market data...',
        success: 'Market data updated!',
        error: 'Using cached data'
      }
    )
  }

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
              Welcome back, {authUser?.username || authUser?.name || 'Trader'}! Here's your Web3 overview.
            </p>
            {isConnected && address && (
              <div className="flex items-center mt-2 text-sm text-green-400">
                <Wallet className="w-4 h-4 mr-2" />
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
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
        {hasPortfolio && (
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
                    <PremiumButton className="w-full justify-start" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Portfolio
                    </PremiumButton>
                    <PremiumButton className="w-full justify-start" variant="outline">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </PremiumButton>
                    <PremiumButton className="w-full justify-start" variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Set Price Alert
                    </PremiumButton>
                    <PremiumButton className="w-full justify-start" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </motion.div>
        )}

        {/* Projects Section - Only show if user has projects */}
        {hasProjects && (
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
        )}

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
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">🔥 Top Gainers</h3>
                    <PremiumButton 
                      variant="ghost" 
                      size="sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </PremiumButton>
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-14 bg-gray-800 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : marketData.topGainers.length > 0 ? (
                      marketData.topGainers.slice(0, 5).map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-3 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20 hover:bg-green-500 hover:bg-opacity-20 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            {token.image ? (
                              <img 
                                src={token.image} 
                                alt={token.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-green-400">#{index + 1}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium">{token.symbol}</p>
                              <p className="text-gray-400 text-xs">{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${token.price < 1 ? token.price.toFixed(4) : token.price.toLocaleString()}</p>
                            <p className="text-green-400 text-sm flex items-center justify-end">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              +{token.change.toFixed(2)}%
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">Market data loading...</p>
                    )}
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
                  <h3 className="text-xl font-semibold text-white mb-6">📉 Top Losers</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-14 bg-gray-800 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : marketData.topLosers.length > 0 ? (
                      marketData.topLosers.slice(0, 5).map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            {token.image ? (
                              <img 
                                src={token.image} 
                                alt={token.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-red-400">#{index + 1}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium">{token.symbol}</p>
                              <p className="text-gray-400 text-xs">{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${token.price < 1 ? token.price.toFixed(4) : token.price.toLocaleString()}</p>
                            <p className="text-red-400 text-sm flex items-center justify-end">
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                              {token.change.toFixed(2)}%
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">Market data loading...</p>
                    )}
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Trending Coins */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <PremiumCard className="glassmorphism border border-white border-opacity-10">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">🔥 Trending Coins</h3>
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-14 bg-gray-800 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : trendingCoins.length > 0 ? (
                      trendingCoins.map((coin, index) => (
                        <motion.div
                          key={coin.coinId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-3 rounded-lg bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 hover:bg-yellow-500 hover:bg-opacity-20 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <img 
                              src={coin.thumb} 
                              alt={coin.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=eab308&color=fff`
                              }}
                            />
                            <div>
                              <p className="text-white font-medium">{coin.symbol}</p>
                              <p className="text-gray-400 text-xs">{coin.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium text-xs">#{coin.marketCapRank}</p>
                            <p className="text-yellow-400 text-xs">Score: {coin.trendingScore}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No trending data available</p>
                    )}
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