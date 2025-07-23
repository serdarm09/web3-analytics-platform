"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Star, Clock, DollarSign, BarChart3, Eye, Users, Activity, Zap, Filter, Rocket, TestTube } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { toast } from 'sonner'
import Link from 'next/link'

interface TrendingProject {
  id: string
  name: string
  symbol: string
  logo: string
  description: string
  category: string
  blockchain: string
  contractAddress: string
  website: string
  isTestnet?: boolean
  price: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
  addedBy: string
  addedAt: Date
  views: number
  watchlistCount: number
  isInWatchlist?: boolean
  lastUpdated: Date
  launchDate?: string
  social?: {
    twitter?: string
    telegram?: string
    discord?: string
  }
}

export default function TrendingPage() {
  const [projects, setProjects] = useState<TrendingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("24h")
  const [category, setCategory] = useState("all")
  const [showTestnet, setShowTestnet] = useState(true)
  const [sortBy, setSortBy] = useState("views")

  const categories = ["all", "Layer1", "Layer2", "DeFi", "NFT", "Gaming", "Meme", "AI", "DAO", "Oracle", "Privacy"]
  const sortOptions = [
    { value: "views", label: "Most Viewed" },
    { value: "recent", label: "Recently Added" },
    { value: "watchlist", label: "Most Watched" },
    { value: "gainers", label: "Top Gainers" },
    { value: "volume", label: "Volume" }
  ]

  useEffect(() => {
    fetchTrendingProjects()
  }, [])

  const fetchTrendingProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects?sort=trending&limit=50')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching trending projects:', error)
      toast.error('Failed to load trending projects')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (!price || price === 0) return 'N/A'
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 0.01 ? 8 : price < 1 ? 6 : 2
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (!volume || volume === 0) return 'N/A'
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const formatNumber = (num: number) => {
    if (!num || num === 0) return '0'
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const toggleWatchlist = (projectId: string) => {
    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (project.id === projectId) {
          const isInWatchlist = !project.isInWatchlist
          if (isInWatchlist) {
            toast.success(`${project.symbol} added to watchlist`)
          } else {
            toast.success(`${project.symbol} removed from watchlist`)
          }
          return { 
            ...project, 
            isInWatchlist,
            watchlistCount: isInWatchlist 
              ? project.watchlistCount + 1 
              : project.watchlistCount - 1
          }
        }
        return project
      })
    )
  }

  const filteredAndSortedProjects = projects
    .filter(project => {
      if (category !== "all" && project.category !== category) return false
      if (!showTestnet && project.isTestnet) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views
        case "recent":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        case "watchlist":
          return b.watchlistCount - a.watchlistCount
        case "gainers":
          return (b.change24h || 0) - (a.change24h || 0)
        case "volume":
          return (b.volume24h || 0) - (a.volume24h || 0)
        default:
          return b.views - a.views
      }
    })

  const topProject = filteredAndSortedProjects[0]
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0)
  const testnetProjects = projects.filter(p => p.isTestnet).length

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
                Trending Projects
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover projects added by our community
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/projects">
                <PremiumButton variant="gradient">
                  Add Project
                </PremiumButton>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showTestnet"
                checked={showTestnet}
                onChange={(e) => setShowTestnet(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-accent-teal focus:ring-accent-teal"
              />
              <label htmlFor="showTestnet" className="text-sm text-gray-300 flex items-center gap-1">
                <TestTube className="h-3 w-3" />
                Show Testnet Projects
              </label>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <PremiumButton
                  key={cat}
                  variant={category === cat ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </PremiumButton>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-accent-teal focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-gray-400">{testnetProjects} on testnet</p>
              </div>
              <Rocket className="h-8 w-8 text-accent-teal" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Viewed</p>
                <p className="text-2xl font-bold">{topProject?.symbol || 'N/A'}</p>
                <p className="text-sm text-gray-400">{formatNumber(topProject?.views || 0)} views</p>
              </div>
              <Eye className="h-8 w-8 text-accent-slate" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
                <p className="text-sm text-green-500">All time</p>
              </div>
              <Activity className="h-8 w-8 text-accent-teal" />
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Added Today</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => {
                    const addedDate = new Date(p.addedAt)
                    const today = new Date()
                    return addedDate.toDateString() === today.toDateString()
                  }).length}
                </p>
                <p className="text-sm text-gray-400">New projects</p>
              </div>
              <Clock className="h-8 w-8 text-accent-slate" />
            </div>
          </PremiumCard>
        </motion.div>

        {/* Projects Grid */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
                <span>Loading trending projects...</span>
              </div>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <PremiumCard className="p-12 text-center">
              <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-gray-400 mb-4">Be the first to add a project!</p>
              <Link href="/dashboard/projects">
                <PremiumButton variant="gradient">
                  Add Project
                </PremiumButton>
              </Link>
            </PremiumCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {project.logo ? (
                          <img 
                            src={project.logo} 
                            alt={project.name}
                            className="w-12 h-12 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${project.symbol}&background=64748b&color=fff`
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-slate to-accent-teal flex items-center justify-center text-white font-bold">
                            {project.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {project.name}
                            {project.isTestnet && (
                              <PremiumBadge size="sm" variant="outline" className="text-yellow-400 border-yellow-400">
                                <TestTube className="h-3 w-3 mr-1" />
                                Testnet
                              </PremiumBadge>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">{project.symbol}</span>
                            <PremiumBadge size="sm" variant="outline">{project.blockchain}</PremiumBadge>
                            <PremiumBadge size="sm" variant="outline">{project.category}</PremiumBadge>
                          </div>
                        </div>
                      </div>
                      <PremiumButton 
                        size="sm" 
                        variant={project.isInWatchlist ? "gradient" : "ghost"}
                        onClick={() => toggleWatchlist(project.id)}
                      >
                        <Star className={`h-4 w-4 ${project.isInWatchlist ? 'fill-current' : ''}`} />
                      </PremiumButton>
                    </div>

                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.description || 'No description available'}
                    </p>

                    {/* Price Info */}
                    {project.price > 0 ? (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Price</p>
                          <p className="font-mono">{formatPrice(project.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">24h Change</p>
                          <p className={`font-mono ${project.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {project.change24h > 0 ? '+' : ''}{project.change24h?.toFixed(2) || '0'}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg text-center">
                        <p className="text-sm text-gray-400">Price data not available</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-400" />
                          <span>{formatNumber(project.views || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span>{formatNumber(project.watchlistCount || 0)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        Added {new Date(project.addedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="flex gap-2 mt-4">
                      {project.website && (
                        <a href={project.website} target="_blank" rel="noopener noreferrer">
                          <PremiumButton size="sm" variant="outline">
                            Website
                          </PremiumButton>
                        </a>
                      )}
                      {project.social?.twitter && (
                        <a href={project.social.twitter} target="_blank" rel="noopener noreferrer">
                          <PremiumButton size="sm" variant="outline">
                            Twitter
                          </PremiumButton>
                        </a>
                      )}
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}