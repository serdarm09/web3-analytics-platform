'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Shield, Activity, Zap, Users, Lock, Globe, ChartLine, Database, Rocket, Search, Bell, Wallet, LineChart, DollarSign, Coins, Sparkles, Star, Crown, Gem, Eye, AlertCircle, PieChart } from 'lucide-react'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { Navbar } from '@/components/layout/navbar'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/hooks/use-auth'
// import { SplineScene } from '@/components/ui/spline'
import { Web3Hero } from '@/components/ui/web3-hero'
// import { cryptoDataService } from '@/lib/services/cryptoDataService'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ 
    isOpen: false, 
    mode: 'register' 
  })
  const [stats, setStats] = useState({
    activeUsers: '0',
    projectsTracked: '0',
    totalVolume: '$0',
    walletTracker: '0'
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [liveData, setLiveData] = useState({
    topGainers: [] as any[],
    trending: [] as any[],
    newListings: [] as any[]
  })

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

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
    
    const fetchLandingData = async () => {
      try {
        const response = await fetch('/api/landing-data')
        if (response.ok) {
          const data = await response.json()
          setLiveData({
            topGainers: data.topGainers || [],
            trending: data.trending || [],
            newListings: data.newListings || []
          })
        }
      } catch (error) {
        console.error('Error fetching landing data:', error)
      }
    }
    
    // Fetch immediately
    fetchStats()
    fetchLandingData()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
      fetchLandingData()
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
      color: 'text-gray-400',
      gradient: 'from-gray-900 via-gray-800 to-black',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: LineChart,
      title: 'Live Charts',
      description: 'Professional TradingView charts with indicators',
      color: 'text-gray-400',
      gradient: 'from-black via-gray-900 to-gray-800',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Price alerts and whale movement notifications',
      color: 'text-gray-400',
      gradient: 'from-gray-800 via-black to-gray-900',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: Wallet,
      title: 'Portfolio Tracker',
      description: 'Connect wallet and track your P&L in real-time',
      color: 'text-gray-400',
      gradient: 'from-gray-900 via-gray-800 to-black',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: Eye,
      title: 'Wallet Tracker',
      description: 'Track smart money and wallet movements',
      color: 'text-gray-400',
      gradient: 'from-black via-gray-900 to-gray-800',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: PieChart,
      title: 'DeFi Analytics',
      description: 'TVL, yield farming, and liquidity analysis',
      color: 'text-gray-400',
      gradient: 'from-gray-800 via-black to-gray-900',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
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
          onLaunchApp={() => {
            if (isAuthenticated) {
              router.push('/dashboard')
            } else {
              setAuthModal({ isOpen: true, mode: 'register' })
            }
          }}
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
                { label: 'Wallet Tracker', value: stats.walletTracker }
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
                Powerful Features for <span className="bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent">Web3 Success</span>
              </h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
                Everything you need to track, analyze, and succeed in the Web3 ecosystem
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="h-full"
                  >
                    <div className={`h-full p-8 bg-gradient-to-br ${feature.gradient} border border-gray-900 rounded-2xl group overflow-hidden relative transition-all duration-500 ${feature.glow}`}>
                      {/* Gradient overlay on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-gray-800/0 via-gray-700/0 to-gray-600/0 group-hover:from-gray-800/20 group-hover:via-gray-700/10 group-hover:to-gray-600/5 transition-all duration-700"
                      />
                      
                      {/* Icon with glow effect */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="relative inline-block mb-6"
                      >
                        <div className="absolute inset-0 bg-gray-600/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <feature.icon className={`w-12 h-12 ${feature.color} relative z-10 group-hover:text-gray-300 transition-colors duration-300`} />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-gray-200 mb-4 group-hover:text-white transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      {/* Bottom gradient line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
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
