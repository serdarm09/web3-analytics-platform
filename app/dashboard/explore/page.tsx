'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, TrendingDown, Star, ExternalLink, Plus, Globe, Users, Calendar } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PremiumCard } from '@/components/ui/premium-card'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumInput } from '@/components/ui/premium-input'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'Other']

interface PublicProject {
  _id: string
  name: string
  symbol: string
  logo: string
  description: string
  category: string
  blockchain: string
  website?: string
  marketData?: {
    price: number
    marketCap: number
    volume24h: number
    change24h: number
  }
  metrics?: {
    starRating: number
  }
  views: number
  watchlistCount: number
  addedBy: {
    _id?: string
    name?: string
    username?: string
    email?: string
  }
  addedAt: Date
  isTracked?: boolean
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingProjects, setTrackingProjects] = useState<Set<string>>(new Set())
  
  const { user } = useAuth()

  const fetchPublicProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        public: 'true',
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/projects?${params}`)
      if (!response.ok) throw new Error('Failed to fetch projects')

      const data = await response.json()
      
      // Check which projects are already tracked by the user
      if (user && data.projects.length > 0) {
        const trackedResponse = await fetch('/api/projects')
        if (trackedResponse.ok) {
          const trackedData = await trackedResponse.json()
          const trackedIds = new Set(trackedData.projects.map((p: any) => p._id))
          
          data.projects = data.projects.map((project: PublicProject) => ({
            ...project,
            isTracked: trackedIds.has(project._id)
          }))
        }
      }

      setProjects(data.projects)
    } catch (error) {
      console.error('Error fetching public projects:', error)
      toast.error('Failed to load public projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicProjects()
  }, [selectedCategory, searchQuery])

  const handleTrackProject = async (projectId: string) => {
    if (!user) {
      toast.error('Please login to track projects')
      return
    }

    setTrackingProjects(prev => new Set(prev).add(projectId))

    try {
      const response = await fetch('/api/projects/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      if (response.ok) {
        toast.success('Project added to your watchlist')
        // Update the project's tracked status
        setProjects(prev => prev.map(p => 
          p._id === projectId ? { ...p, isTracked: true } : p
        ))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to track project')
      }
    } catch (error) {
      console.error('Error tracking project:', error)
      toast.error('Failed to track project')
    } finally {
      setTrackingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Projects</h1>
          <p className="text-gray-400 mt-1">Discover public projects created by the community</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Globe className="w-4 h-4" />
          <span>{projects.length} public projects</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PremiumInput
            placeholder="Search public projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="flex gap-2">
          <StarBorder
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </StarBorder>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <PremiumBadge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </PremiumBadge>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <PremiumCard key={i} className="p-6">
              <div className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-700 rounded w-24"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <PremiumCard className="p-12 text-center">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No public projects found</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to create a public project!</p>
        </PremiumCard>
      ) : (
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PremiumCard className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image 
                      src={project.logo} 
                      alt={project.name} 
                      width={48} 
                      height={48} 
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <span className="text-gray-400">{project.symbol}</span>
                        <PremiumBadge variant="outline" size="sm">
                          {project.category}
                        </PremiumBadge>
                        <PremiumBadge variant="outline" size="sm" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {project.blockchain}
                        </PremiumBadge>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Created by {project.addedBy?.name || project.addedBy?.username || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(project.addedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{project.watchlistCount} watching</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {project.marketData && (
                      <>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-white">
                            ${(project.marketData.price || 0).toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 8 
                            })}
                          </p>
                          <div className={`flex items-center justify-end gap-1 ${
                            (project.marketData.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(project.marketData.change24h || 0) >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                              {Math.abs(project.marketData.change24h || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-400">Market Cap</p>
                          <p className="text-lg font-medium text-white">
                            {formatMarketCap(project.marketData.marketCap || 0)}
                          </p>
                        </div>
                      </>
                    )}

                    <div className="text-right">
                      <p className="text-sm text-gray-400">Rating</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < (project.metrics?.starRating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {project.isTracked ? (
                        <PremiumBadge variant="outline" className="text-green-400 border-green-400/20">
                          <Star className="w-3 h-3 mr-1" />
                          Tracked
                        </PremiumBadge>
                      ) : (
                        <PremiumButton
                          size="sm"
                          onClick={() => handleTrackProject(project._id)}
                          disabled={trackingProjects.has(project._id)}
                        >
                          {trackingProjects.has(project._id) ? (
                            <>Adding...</>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Track
                            </>
                          )}
                        </PremiumButton>
                      )}
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}