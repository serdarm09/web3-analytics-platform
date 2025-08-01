'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
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
  Shield,
  Coins
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { StarBorder } from '@/components/ui/star-border'
import { useWallet } from '@/hooks/useWallet'
import { useAuth } from '@/lib/contexts/AuthContext'
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
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    change24h: 0,
    totalProjects: 0,
    trendingProjects: 0,
    marketChange: 0,
    totalPnL: 0,
    bestPerforming: null,
    worstPerforming: null,
    totalAssets: 0
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [trendingProjects, setTrendingProjects] = useState<any[]>([])
  const [globalMarketChange, setGlobalMarketChange] = useState(0)

  useEffect(() => {
    if (authUser) {
      setUser(authUser)
    }
    fetchMarketData()
    fetchPortfolioData()
    fetchUserProjects()
    fetchTrendingProjects()
    fetchRecentActivities()
  }, [authUser])

  const fetchTrendingProjects = async () => {
    try {
      const response = await fetch('/api/projects/trending?period=7d')
      if (response.ok) {
        const data = await response.json()
        setTrendingProjects(data.projects || [])
        setPortfolioData(prev => ({
          ...prev,
          trendingProjects: data.projects?.length || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching trending projects:', error)
      setTrendingProjects([])
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/activities?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error)
    }
  }

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      
      const [cryptos, globalData] = await Promise.all([
        getTopCryptos(20),
        getGlobalMarketData()
      ])
      
      if (cryptos.length > 0) {
        const sorted = [...cryptos].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        
        // Calculate global market change average
        const avgMarketChange = cryptos.reduce((sum, coin) => 
          sum + coin.price_change_percentage_24h, 0) / cryptos.length
        
        setGlobalMarketChange(avgMarketChange)
        setPortfolioData(prev => ({
          ...prev,
          marketChange: avgMarketChange
        }))
        
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
      // Set fallback market change
      setGlobalMarketChange(2.1)
      setPortfolioData(prev => ({
        ...prev,
        marketChange: 2.1
      }))
      
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
      const response = await fetch('/api/portfolios')
      if (response.ok) {
        const data = await response.json()
        if (data.portfolios && data.portfolios.length > 0) {
          setHasPortfolio(true)
          setPortfolios(data.portfolios)
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

  const handleRefreshMarketData = async () => {
    await toast.promise(
      Promise.all([
        fetchMarketData(),
        fetchPortfolioData(),
        fetchUserProjects(),
        fetchTrendingProjects(),
        fetchRecentActivities()
      ]), 
      {
        loading: 'Refreshing data...',
        success: 'Data updated successfully!',
        error: 'Using cached data'
      }
    )
  }

  return (
    <div className="space-y-8">
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
          title="Trending Projects"
          value={portfolioData.trendingProjects.toString()}
          change={trendingProjects.length > 0 ? 12.5 : 0}
          icon={<TrendingUp className="w-6 h-6 text-accent-green" />}
        />
        <StatsCard
          title="Market Sentiment"
          value={globalMarketChange >= 0 ? "Bullish" : "Bearish"}
          change={portfolioData.marketChange}
          icon={<Activity className="w-6 h-6 text-accent-purple" />}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Overview */}
        {hasPortfolio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <PremiumCard>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Portfolio Overview</h2>
                    <p className="text-gray-400 text-sm">Your investment performance</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">${portfolioData.totalValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Total Value</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">{portfolioData.change24h > 0 ? '+' : ''}{portfolioData.change24h.toFixed(2)}%</div>
                    <div className="text-xs text-gray-400">24h Change</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">{portfolioData.totalAssets}</div>
                    <div className="text-xs text-gray-400">Assets</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-white">{portfolios.length}</div>
                    <div className="text-xs text-gray-400">Portfolios</div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={hasPortfolio ? "" : "lg:col-span-3"}
        >
          <PremiumCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Market Overview</h2>
                  <p className="text-gray-400 text-sm">Top gainers and losers</p>
                </div>
                <PremiumButton
                  onClick={handleRefreshMarketData}
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </PremiumButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Top Gainers
                  </h3>
                  <div className="space-y-3">
                    {marketData.topGainers.length > 0 ? (
                      marketData.topGainers.map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-secondary rounded-lg hover:bg-gray-secondary/80 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {token.image ? (
                              <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">#{index + 1}</span>
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

                {/* Top Losers */}
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Top Losers
                  </h3>
                  <div className="space-y-3">
                    {marketData.topLosers.length > 0 ? (
                      marketData.topLosers.map((token, index) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-secondary rounded-lg hover:bg-gray-secondary/80 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {token.image ? (
                              <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">#{index + 1}</span>
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
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Trending Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Trending Projects */}
        <PremiumCard>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Trending Projects</h2>
                <p className="text-gray-400 text-sm">Most popular projects this week</p>
              </div>
              <PremiumBadge variant="gradient" className="text-xs">
                {trendingProjects.length} Active
              </PremiumBadge>
            </div>
            
            <div className="space-y-3">
              {trendingProjects.length > 0 ? (
                trendingProjects.slice(0, 5).map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-secondary rounded-lg hover:bg-gray-secondary/80 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/trending`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{project.name}</p>
                        <p className="text-gray-400 text-xs">{project.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{project.stats?.views || 0} views</p>
                      <p className="text-green-400 text-sm flex items-center justify-end">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Score: {project.trendingScore || 0}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No trending projects yet</p>
                  <p className="text-gray-500 text-sm">Projects will appear here as they gain popularity</p>
                </div>
              )}
            </div>
            
            {trendingProjects.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <PremiumButton
                  onClick={() => window.location.href = '/dashboard/trending'}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  View All Trending Projects
                </PremiumButton>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Market Sentiment */}
        <PremiumCard>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Market Sentiment</h2>
                <p className="text-gray-400 text-sm">Overall market performance</p>
              </div>
              <PremiumBadge 
                variant={globalMarketChange >= 0 ? "success" : "error"}
                className="text-xs"
              >
                {globalMarketChange >= 0 ? "Bullish" : "Bearish"}
              </PremiumBadge>
            </div>
            
            <div className="space-y-4">
              {/* Market Change Indicator */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                <div className={`text-3xl font-bold ${globalMarketChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {globalMarketChange >= 0 ? '+' : ''}{globalMarketChange.toFixed(2)}%
                </div>
                <p className="text-gray-400 text-sm mt-1">24h Average Change</p>
                <div className="flex items-center justify-center mt-2">
                  {globalMarketChange >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
                  )}
                  <span className="text-gray-300 text-sm">
                    Market is {globalMarketChange >= 0 ? 'rising' : 'declining'}
                  </span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-secondary rounded-lg">
                  <div className="text-lg font-bold text-green-400">
                    {marketData.topGainers.length}
                  </div>
                  <div className="text-xs text-gray-400">Top Gainers</div>
                </div>
                <div className="text-center p-3 bg-gray-secondary rounded-lg">
                  <div className="text-lg font-bold text-red-400">
                    {marketData.topLosers.length}
                  </div>
                  <div className="text-xs text-gray-400">Top Losers</div>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="pt-4">
                <PremiumButton
                  onClick={() => window.location.href = '/dashboard/analytics'}
                  variant="gradient"
                  size="sm"
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Market Analytics
                </PremiumButton>
              </div>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}
