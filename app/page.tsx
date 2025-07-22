'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Shield, Activity, Zap, Users, Lock, Globe, ChartLine, Database, Rocket, Search, Bell, Wallet, LineChart, DollarSign, Coins, Sparkles, Star, Crown, Gem, Eye, AlertCircle, PieChart } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { Navbar } from '@/components/layout/navbar'
import { AuthModal } from '@/components/auth/AuthModal'
// import { SplineScene } from '@/components/ui/spline'
import { Web3Hero } from '@/components/ui/web3-hero'
// import { cryptoDataService } from '@/lib/services/cryptoDataService'

export default function Home() {
  const router = useRouter()
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ 
    isOpen: false, 
    mode: 'register' 
  })
  const [stats, setStats] = useState({
    activeUsers: '0',
    projectsTracked: '0',
    totalVolume: '$0',
    whaleWallets: '0'
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [liveData, setLiveData] = useState({
    topGainers: [] as any[],
    trending: [] as any[],
    newListings: [] as any[]
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    
    const fetchTrendingData = async () => {
      try {
        const response = await fetch('/api/trending?limit=3')
        if (response.ok) {
          const data = await response.json()
          setLiveData(prev => ({
            ...prev,
            trending: data.data || []
          }))
        }
      } catch (error) {
        console.error('Error fetching trending data:', error)
      }
    }
    
    // Fetch immediately
    fetchStats()
    fetchTrendingData()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
      fetchTrendingData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // const fetchLiveData = async () => {
  //   try {
  //     const [gainersLosers, trending] = await Promise.all([
  //       cryptoDataService.getTopGainersLosers(3),
  //       cryptoDataService.getTrendingCryptos()
  //     ])

  //     setLiveData({
  //       topGainers: gainersLosers.gainers.slice(0, 3),
  //       trending: trending.slice(0, 3),
  //       newListings: gainersLosers.gainers.slice(3, 6) // Temporary - ideally would be actual new listings
  //     })
  //   } catch (error) {
  //     console.error('Error fetching live data:', error)
  //   }
  // }

  const features = [
    {
      icon: Search,
      title: 'Token Discovery',
      description: 'Search 20,000+ tokens across all major chains',
      color: 'text-gray-300',
      gradient: 'from-gray-600 to-gray-800'
    },
    {
      icon: LineChart,
      title: 'Live Charts',
      description: 'Professional TradingView charts with indicators',
      color: 'text-gray-300',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Price alerts and whale movement notifications',
      color: 'text-gray-300',
      gradient: 'from-gray-800 to-black'
    },
    {
      icon: Wallet,
      title: 'Portfolio Tracker',
      description: 'Connect wallet and track your P&L in real-time',
      color: 'text-gray-300',
      gradient: 'from-gray-600 to-gray-800'
    },
    {
      icon: Eye,
      title: 'Whale Watcher',
      description: 'Track smart money and large transactions',
      color: 'text-gray-300',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      icon: PieChart,
      title: 'DeFi Analytics',
      description: 'TVL, yield farming, and liquidity analysis',
      color: 'text-gray-300',
      gradient: 'from-gray-800 to-black'
    }
  ]

  return (
    <>
      <main className="min-h-screen bg-black overflow-hidden">
        <Navbar />
        
        {/* Hero Section with new Web3Hero component */}
        <Web3Hero 
          badge="Live Web3 Analytics"
          title1="Real-Time Crypto"
          title2="Analytics Platform"
          description="Track 20,000+ tokens across all major chains • Analyze whale movements • Professional trading tools • DeFi ecosystem insights"
          onLaunchApp={() => router.push('/register')}
          onViewDemo={() => router.push('/login')}
        />


        {/* Stats Section */}
        <section className="relative z-10 container-relaxed section-comfortable">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative"
            >
              {!statsLoading && (
                <motion.div 
                  className="absolute -top-8 right-0 flex items-center gap-2 text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Activity className="w-3 h-3" />
                  <span>Live data</span>
                </motion.div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-relaxed">
              {[
                { label: 'Active Users', value: stats.activeUsers },
                { label: 'Projects Tracked', value: stats.projectsTracked },
                { label: 'Total Volume', value: stats.totalVolume },
                { label: 'Whale Wallets', value: stats.whaleWallets }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  <PremiumCard variant="glass" className="text-center p-6 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-800 rounded w-24 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-800 rounded w-20 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <motion.h3 
                          className="text-2xl md:text-3xl font-bold text-white"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={stat.value}
                        >
                          {stat.value}
                        </motion.h3>
                        <p className="text-gray-500 mt-2 text-sm group-hover:text-gray-400 transition-colors">{stat.label}</p>
                      </>
                    )}
                  </PremiumCard>
                </motion.div>
              ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 container-relaxed section-comfortable">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center mb-16 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Powerful Features for <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Web3 Success</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Everything you need to track, analyze, and succeed in the Web3 ecosystem
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-relaxed">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PremiumCard variant="hover-lift" className="h-full p-8 bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 group overflow-hidden relative">
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      />
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                        className="inline-block"
                      >
                        <feature.icon className={`w-12 h-12 ${feature.color} mb-6`} />
                      </motion.div>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">{feature.title}</h3>
                      <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{feature.description}</p>
                    </PremiumCard>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Data Showcase */}
        <section className="relative z-10 container-relaxed section-comfortable">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center mb-16 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Live Market <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Intelligence</span>
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <PremiumCard className="p-6 bg-gray-900/50 border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Top Gainers</h3>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    {liveData.topGainers.length > 0 ? (
                      liveData.topGainers.map((coin, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-gray-400">{coin.symbol.toUpperCase()}</span>
                          <span className="text-green-500 font-mono">+{coin.price_change_percentage_24h.toFixed(2)}%</span>
                        </div>
                      ))
                    ) : (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex justify-between items-center">
                          <div className="h-4 bg-gray-800 rounded w-16"></div>
                          <div className="h-4 bg-gray-800 rounded w-12"></div>
                        </div>
                      ))
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <PremiumCard className="p-6 bg-gray-900/50 border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Trending Now</h3>
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="space-y-3">
                    {liveData.trending.length > 0 ? (
                      liveData.trending.map((coin, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-gray-400">{coin.symbol}</span>
                          <span className="text-yellow-500 font-mono text-sm">#{coin.marketCapRank}</span>
                        </div>
                      ))
                    ) : (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex justify-between items-center">
                          <div className="h-4 bg-gray-800 rounded w-16"></div>
                          <div className="h-4 bg-gray-800 rounded w-20"></div>
                        </div>
                      ))
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <PremiumCard className="p-6 bg-gray-900/50 border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">New Listings</h3>
                    <Sparkles className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {liveData.newListings.length > 0 ? (
                      liveData.newListings.map((coin, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-gray-400">{coin.symbol.toUpperCase()}</span>
                          <span className="text-gray-500 text-sm">${coin.current_price.toFixed(4)}</span>
                        </div>
                      ))
                    ) : (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex justify-between items-center">
                          <div className="h-4 bg-gray-800 rounded w-16"></div>
                          <div className="h-4 bg-gray-800 rounded w-16"></div>
                        </div>
                      ))
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
      />
    </>
  )
}
