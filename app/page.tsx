'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Shield, Activity, Zap, Users, Lock, Globe, ChartLine, Database, Rocket, Search, Wallet, LineChart, DollarSign, Coins, Sparkles, Star, Crown, Gem, Eye, PieChart, Clock } from 'lucide-react'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { Navbar } from '@/components/layout/navbar'
import { useAuth } from '@/lib/contexts/AuthContext'
// import { SplineScene } from '@/components/ui/spline'
import { Web3Hero } from '@/components/ui/web3-hero'
// import { cryptoDataService } from '@/lib/services/cryptoDataService'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    activeUsers: '0',
    projectsTracked: '0',
    walletTracker: '0'
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState(false)
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
      title: 'Project Discovery',
      description: 'Find new launches and hidden gems across all chains before they trend',
      color: 'text-gray-400',
      gradient: 'from-gray-900 via-gray-800 to-black',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: LineChart,
      title: 'Alpha Signals',
      description: 'Advanced algorithms detect early opportunities and call potential',
      color: 'text-gray-400',
      gradient: 'from-black via-gray-900 to-gray-800',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: Wallet,
      title: 'Portfolio Research',
      description: 'Track your alpha calls and measure your research performance',
      color: 'text-gray-400',
      gradient: 'from-gray-900 via-gray-800 to-black',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: Eye,
      title: 'Early Call Tracking',
      description: 'Monitor project launches, migrations, and community growth',
      color: 'text-gray-400',
      gradient: 'from-black via-gray-900 to-gray-800',
      glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(156,163,175,0.3)]'
    },
    {
      icon: PieChart,
      title: 'Project Analytics',
      description: 'Deep dive into tokenomics, roadmaps, and community metrics',
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
          badge="VelocityCrypto Analytics"
          title1="Advanced Crypto"
          title2="Alpha Discovery"
          description="Find hidden gems before they moon • Track project launches & early calls • Advanced research tools for alpha hunters • Discover the next 100x opportunities"
          onLaunchApp={() => {
            if (isAuthenticated) {
              router.push('/dashboard')
            } else {
              router.push('/register')
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-relaxed">
              {[
                { label: 'Active Users', value: stats.activeUsers },
                { label: 'Projects Tracked', value: stats.projectsTracked },
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
                Powerful Tools for <span className="bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent">Alpha Hunters</span>
              </h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
                Everything you need to discover, research, and track the next big crypto opportunities before they explode
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

        {/* About Section */}
        <section id="about" className="py-20 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/30">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                About VelocityCrypto
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Early Adopters</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                VelocityCrypto is the ultimate platform for alpha hunters, project researchers, and early crypto adopters who want to discover the next big opportunities before they go mainstream.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Alpha Project Discovery</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Find hidden gems and upcoming projects before they explode. Our advanced algorithms scan thousands of projects daily to identify the next 100x opportunities.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Early Call Intelligence</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Get ahead of the curve with our early signal detection system. Track project launches, token migrations, and community growth patterns before the masses notice.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Community-Driven Research</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Connect with fellow alpha hunters and share project insights. Build your reputation as a top caller and discover opportunities through our network of researchers.
                  </p>
                </div>
              </motion.div>

              {/* Right Content - Stats & Developer Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="text-2xl font-bold text-blue-400 mb-2">500+</div>
                    <div className="text-sm text-gray-400">New Projects Daily</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="text-2xl font-bold text-green-400 mb-2">Early</div>
                    <div className="text-sm text-gray-400">Alpha Detection</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="text-2xl font-bold text-purple-400 mb-2">24/7</div>
                    <div className="text-sm text-gray-400">Project Scanning</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">Real-time</div>
                    <div className="text-sm text-gray-400">Call Alerts</div>
                  </div>
                </div>

                {/* Developer & Support Section */}
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-8 rounded-2xl border border-gray-700/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">0x</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Built by @OxBenzen</h4>
                      <p className="text-sm text-gray-400">Blockchain Developer & Crypto Enthusiast</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    VelocityCrypto is an independent project built with passion for the crypto community and alpha hunters. 
                    Your support helps us maintain and improve the platform for discovering the next big opportunities.
                  </p>

                  {/* Donation Section */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">Support Development</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Help us keep VelocityCrypto free and continuously improving. Support the development of tools for alpha hunters and early adopters!
                    </p>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Donation Address (ETH/ERC-20)</p>
                          <p className="text-sm font-mono text-blue-400 break-all">
                            0xc8e963969D25f3d5Fd8CCf0acbe5Bb9d2Cc83693
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText('0xA2A84FbF9134Aca100999bfe83F13507269B5454')
                              setCopiedAddress(true)
                              setTimeout(() => setCopiedAddress(false), 2000)
                            } catch (err) {
                              console.error('Failed to copy address:', err)
                            }
                          }}
                          className="ml-3 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                        >
                          {copiedAddress ? 'Copied!' : 'Copy'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gradient-to-br from-black via-gray-900/50 to-black">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Get in Touch
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Find the Next <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Alpha</span>?
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Join thousands of alpha hunters and early adopters who trust VelocityCrypto for discovering the next big crypto opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    Start Hunting Alpha
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </motion.button>
                </Link>
                
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-white font-semibold rounded-xl border border-gray-600 transition-all duration-200"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>

              {/* Social Links or Additional Info */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <p className="text-gray-400 text-sm">
                  Have questions or feedback? Reach out to us at{" "}
                  <span className="text-blue-400">Soon...</span>
                </p>
                <div className="flex justify-center items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Platform Status: Online</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>24/7 Market Data</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}
