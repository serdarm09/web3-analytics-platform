'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Shield, Activity, Zap, Users, Lock, Globe, ChartLine, Database, Rocket, Search, Bell, Wallet, LineChart, DollarSign, Coins, Sparkles, Star, Crown, Gem, Eye, AlertCircle, PieChart } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { Navbar } from '@/components/layout/navbar'
import { AuthModal } from '@/components/auth/AuthModal'
import { SplineScene } from '@/components/ui/spline'

export default function Home() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ 
    isOpen: false, 
    mode: 'register' 
  })
  const [stats, setStats] = useState({
    activeUsers: '50K+',
    projectsTracked: '10K+',
    totalVolume: '$2.5B',
    whaleWallets: '5K+'
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
      }
    }
    fetchStats()
  }, [])

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
      
        {/* Animated Background Effects */}
        <div className="fixed inset-0 z-0">
          <motion.div 
            className="absolute top-0 -left-4 w-72 h-72 bg-gray-800/30 rounded-full blur-[128px]"
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -top-4 right-0 w-96 h-96 bg-gray-700/20 rounded-full blur-[128px]"
            animate={{ 
              x: [0, -30, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-800/20 rounded-full blur-[128px]"
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

      {/* Hero Section */}
      <section className="relative z-10 container-relaxed section-loose">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-loose"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            >
              <PremiumBadge variant="default" className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
                <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                <span className="text-gray-300">Live Data</span>
              </PremiumBadge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.span 
                className="inline-block bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Real-Time Crypto
              </motion.span>
              <br />
              <motion.span 
                className="text-white inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Analytics
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Track 20,000+ tokens • Live charts • Whale alerts • DeFi analytics
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-comfortable justify-center pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PremiumButton 
                  size="lg" 
                  variant="gradient" 
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 group"
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                >
                  Launch App
                </PremiumButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PremiumButton 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-gray-700 hover:border-gray-500 hover:bg-gray-900/50 group"
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                >
                  View Demo
                </PremiumButton>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3D Visualization Section */}
      <section className="relative z-10 container-relaxed py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                {/* Left content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <PremiumBadge variant="outline" className="mb-4 inline-flex">
                      <Zap className="w-3 h-3 mr-1" />
                      Interactive Experience
                    </PremiumBadge>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Visualize the Web3 Ecosystem
                    </h2>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      Experience real-time data visualization with our interactive 3D interface. 
                      Track market movements, analyze trends, and discover opportunities in an immersive environment.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                        <span className="text-gray-300">Real-time market data</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                        <span className="text-gray-300">Interactive 3D charts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                        <span className="text-gray-300">Smart analytics engine</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right content - 3D Scene */}
                <div className="relative h-[500px] lg:h-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-slate/20 to-accent-teal/20"></div>
                  <SplineScene 
                    scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container-relaxed section-comfortable">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-relaxed"
          >
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
                  <motion.h3 
                    className="text-2xl md:text-3xl font-bold text-white"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-gray-500 mt-2 text-sm group-hover:text-gray-400 transition-colors">{stat.label}</p>
                </PremiumCard>
              </motion.div>
            ))}
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

      {/* Advanced Features Grid */}
      <section className="relative z-10 container-relaxed section-comfortable">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mb-16 space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Everything You Need to <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Succeed</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ChartLine, title: 'Real-time Data', description: 'Live price updates and market movements' },
              { icon: Lock, title: 'Secure Platform', description: 'Bank-level security for your data' },
              { icon: Database, title: 'Data Analytics', description: 'Advanced metrics and insights' },
              { icon: Rocket, title: 'Fast Performance', description: 'Lightning-fast data processing' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <PremiumCard variant="glass" className="p-6 text-center h-full bg-gray-900/50 border-gray-800">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </PremiumCard>
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
                  {['+245%', '+189%', '+156%'].map((gain, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-gray-400">Token {i + 1}</span>
                      <span className="text-green-500 font-mono">{gain}</span>
                    </div>
                  ))}
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
                  <h3 className="text-lg font-semibold text-white">Whale Alerts</h3>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  {['$2.5M ETH', '$1.8M BTC', '$950K USDT'].map((alert, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-gray-400">Transfer</span>
                      <span className="text-yellow-500 font-mono text-sm">{alert}</span>
                    </div>
                  ))}
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
                  {['Just Now', '5 min ago', '1 hour ago'].map((time, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-gray-400">Token {i + 4}</span>
                      <span className="text-gray-500 text-sm">{time}</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container-relaxed section-loose">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <PremiumCard variant="gradient" className="text-center bg-gradient-to-r from-gray-900 to-black border-gray-800 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: [-1000, 1000] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.h2 
                className="text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Ready to Start?
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Get instant access to professional crypto analytics
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PremiumButton 
                  size="lg" 
                  variant="glow" 
                  className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 group"
                  onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Launch App
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </PremiumButton>
              </motion.div>
            </PremiumCard>
          </motion.div>
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