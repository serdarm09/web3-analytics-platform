'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Shield, Activity, Zap, Users, Lock, Globe, ChartLine, Database, Rocket } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { Navbar } from '@/components/layout/navbar'
import { AuthModal } from '@/components/auth/AuthModal'

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
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time market data and technical indicators for informed trading decisions',
      color: 'text-gray-300'
    },
    {
      icon: TrendingUp,
      title: 'Trend Detection',
      description: 'AI-powered algorithms to identify trending projects before they explode',
      color: 'text-gray-300'
    },
    {
      icon: Shield,
      title: 'Whale Tracking',
      description: 'Monitor large wallet movements and copy successful trading strategies',
      color: 'text-gray-300'
    }
  ]

  return (
    <>
      <main className="min-h-screen bg-black overflow-hidden">
        <Navbar />
      
        {/* Background Effects */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-800/30 rounded-full blur-[128px]" />
          <div className="absolute -top-4 right-0 w-96 h-96 bg-gray-700/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-800/20 rounded-full blur-[128px]" />
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
            <PremiumBadge variant="info" pulse>
              <Activity className="w-3 h-3 mr-1" />
              Live Now
            </PremiumBadge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Web3 Analytics</span>
              <br />
              <span className="text-white">Platform</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track crypto projects, monitor whale movements, analyze trends, and manage your portfolio with our cutting-edge platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-comfortable justify-center pt-8">
              <PremiumButton 
                size="md" 
                variant="gradient" 
                className="w-full sm:w-auto bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
              >
                Get Started 
              </PremiumButton>
              <PremiumButton 
                size="md" 
                variant="outline" 
                className="w-full sm:w-auto border-gray-700 hover:border-gray-600"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              >
                Open
              </PremiumButton>
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
M            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <PremiumCard variant="glass" className="text-center p-6 bg-gray-900/50 border-gray-800">
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">{stat.value}</h3>
                  <p className="text-gray-500 mt-2 text-sm">{stat.label}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-relaxed">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <PremiumCard variant="hover-lift" className="h-full p-8 bg-gray-900/50 border-gray-800 hover:bg-gray-900/70">
                  <feature.icon className={`w-10 h-10 ${feature.color} mb-6`} />
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 container-relaxed section-comfortable">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mb-16 space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-relaxed">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for getting started',
                features: [
                  '5 Projects tracking',
                  'Basic analytics',
                  '24h price alerts',
                  'Community support'
                ],
                variant: 'glass' as const,
                buttonVariant: 'outline' as const,
              },
              {
                name: 'Pro',
                price: '$29',
                description: 'For serious crypto investors',
                features: [
                  'Unlimited projects',
                  'Advanced analytics',
                  'Real-time alerts',
                  'Whale tracking',
                  'API access',
                  'Priority support'
                ],
                variant: 'gradient' as const,
                buttonVariant: 'gradient' as const,
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For teams and institutions',
                features: [
                  'Everything in Pro',
                  'Custom integrations',
                  'Dedicated account manager',
                  'SLA guarantee',
                  'White-label options'
                ],
                variant: 'glass' as const,
                buttonVariant: 'glow' as const,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <PremiumBadge variant="info" pulse>
                      Most Popular
                    </PremiumBadge>
                  </div>
                )}
                <PremiumCard variant={plan.variant} className="h-full pt-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="text-4xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent mb-1">
                      {plan.price}
                      {plan.price !== 'Custom' && <span className="text-lg text-gray-500">/month</span>}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-400">
                        <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-accent-green" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <PremiumButton 
                    variant={plan.buttonVariant} 
                    className={`w-full ${
                      plan.buttonVariant === 'gradient' 
                        ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800' 
                        : plan.buttonVariant === 'outline'
                        ? 'border-gray-700 hover:border-gray-600'
                        : ''
                    }`}
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </PremiumButton>
                </PremiumCard>
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

      {/* CTA Section */}
      <section className="relative z-10 container-relaxed section-loose">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <PremiumCard variant="gradient" className="text-center bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
              <h2 className="text-4xl font-bold text-white mb-4">
                Start Your Journey Today
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of traders making smarter decisions with our platform
              </p>
              <PremiumButton 
                size="lg" 
                variant="glow" 
                className="bg-gray-700 hover:bg-gray-600"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
              >
                Create Free Account
              </PremiumButton>
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