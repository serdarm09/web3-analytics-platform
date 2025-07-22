'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Shield, Activity, Zap, Users, Lock, Globe } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time market data and technical indicators for informed trading decisions',
      color: 'text-accent-blue'
    },
    {
      icon: TrendingUp,
      title: 'Trend Detection',
      description: 'AI-powered algorithms to identify trending projects before they explode',
      color: 'text-accent-green'
    },
    {
      icon: Shield,
      title: 'Whale Tracking',
      description: 'Monitor large wallet movements and copy successful trading strategies',
      color: 'text-accent-purple'
    }
  ]

  return (
    <main className="min-h-screen bg-black-primary overflow-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-accent-purple/30 rounded-full blur-[128px]" />
        <div className="absolute -top-4 right-0 w-96 h-96 bg-accent-blue/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-green/20 rounded-full blur-[128px]" />
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
              <span className="text-gradient">Web3 Analytics</span>
              <br />
              <span className="text-white">Redefined</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track crypto projects, monitor whale movements, analyze trends, and manage your portfolio with our cutting-edge platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-comfortable justify-center pt-8">
              <Link href="/register">
                <PremiumButton size="md" variant="gradient" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </PremiumButton>
              </Link>
              <Link href="/dashboard">
                <PremiumButton size="md" variant="outline" className="w-full sm:w-auto">
                  View Demo
                </PremiumButton>
              </Link>
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
              { label: 'Active Users', value: '50K+' },
              { label: 'Projects Tracked', value: '10K+' },
              { label: 'Total Volume', value: '$2.5B' },
              { label: 'Whale Wallets', value: '5K+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <PremiumCard variant="glass" className="text-center p-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</h3>
                  <p className="text-gray-400 mt-2 text-sm">{stat.label}</p>
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
              Powerful Features for <span className="text-gradient">Web3 Success</span>
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
                <PremiumCard variant="hover-lift" className="h-full p-8">
                  <feature.icon className={`w-10 h-10 ${feature.color} mb-6`} />
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
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
                    <div className="text-4xl font-bold text-gradient mb-1">
                      {plan.price}
                      {plan.price !== 'Custom' && <span className="text-lg text-gray-400">/month</span>}
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
                  
                  <Link href="/register">
                    <PremiumButton variant={plan.buttonVariant} className="w-full">
                      {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                    </PremiumButton>
                  </Link>
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
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Real-time Data', description: 'Live price updates and market movements' },
              { icon: Lock, title: 'Secure Platform', description: 'Bank-level security for your data' },
              { icon: Users, title: 'Community Insights', description: 'Learn from successful traders' },
              { icon: Globe, title: 'Global Coverage', description: 'Track projects across all chains' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <PremiumCard variant="glass" className="p-6 text-center h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-teal/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-accent-purple" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.description}</p>
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
            <PremiumCard variant="gradient" className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Start Your Journey Today
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Join thousands of traders making smarter decisions with our platform
              </p>
              <Link href="/register">
                <PremiumButton size="lg" variant="glow">
                  Create Free Account
                </PremiumButton>
              </Link>
            </PremiumCard>
          </motion.div>
        </div>
      </section>
    </main>
  )
}