"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  ExternalLink, 
  Twitter, 
  Github, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Plus, 
  Star, 
  Users, 
  Activity,
  Clock,
  DollarSign,
  BarChart3,
  Share2,
  Bookmark,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Network,
  Zap,
  Copy
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { toast } from 'sonner'
import Image from "next/image"

interface ProjectData {
  _id: string
  name: string
  symbol?: string
  description: string
  logo?: string
  category: string
  blockchain: string[]
  website?: string
  socialLinks: {
    twitter?: string
    telegram?: string
    discord?: string
    github?: string
  }
  contractAddress?: string
  marketData?: {
    price: number
    marketCap: number
    volume24h: number
    priceChange24h: number
    priceChange7d: number
    circulatingSupply?: number
    totalSupply?: number
  }
  metrics?: {
    viewCount: number
    addCount: number
    likeCount: number
    trendingScore: number
  }
  addedBy: {
    _id: string
    name: string
    username?: string
    email: string
  }
  addedAt: string
  lastUpdated: string
  isPublic: boolean
  tags?: string[]
  roadmap?: {
    milestone: string
    status: 'completed' | 'in-progress' | 'planned'
    date?: string
  }[]
  team?: {
    name: string
    role: string
    avatar?: string
    linkedin?: string
    twitter?: string
  }[]
  funding?: {
    round: string
    amount: string
    date: string
    investors?: string[]
  }[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isTracked, setIsTracked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'team' | 'roadmap'>('overview')

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      
      // Track project view
      await fetch(`/api/projects/${projectId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        throw new Error('Project not found')
      }

      const data = await response.json()
      setProject(data.project)
      
      // Check if user has liked, tracked, or bookmarked this project
      await checkUserInteractions()
      
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Failed to load project details')
      router.push('/dashboard/trending')
    } finally {
      setLoading(false)
    }
  }

  const checkUserInteractions = async () => {
    try {
      // Check if liked
      const likeResponse = await fetch(`/api/projects/${projectId}/like`)
      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        setIsLiked(likeData.isLiked)
      }

      // Check if tracked
      const trackResponse = await fetch(`/api/projects/user`)
      if (trackResponse.ok) {
        const trackData = await trackResponse.json()
        setIsTracked(trackData.projects.some((p: any) => p._id === projectId))
      }
    } catch (error) {
      console.error('Error checking user interactions:', error)
    }
  }

  const handleLike = async () => {
    if (liking) return
    
    setLiking(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        
        // Update local metrics
        if (project) {
          setProject({
            ...project,
            metrics: {
              ...project.metrics!,
              likeCount: data.likeCount
            }
          })
        }
        
        toast.success(data.isLiked ? 'Project liked!' : 'Project unliked!')
      }
    } catch (error) {
      toast.error('Failed to update like status')
    } finally {
      setLiking(false)
    }
  }

  const handleTrack = async () => {
    if (tracking) return
    
    setTracking(true)
    try {
      const response = await fetch('/api/projects/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      
      if (response.ok) {
        setIsTracked(true)
        toast.success('Project added to your list!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to track project')
      }
    } catch (error) {
      toast.error('Failed to track project')
    } finally {
      setTracking(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: project?.name,
          text: project?.description,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatCompactNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PremiumSkeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PremiumSkeleton className="h-64" />
            <PremiumSkeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <PremiumSkeleton className="h-32" />
            <PremiumSkeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
        <p className="text-gray-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <PremiumButton onClick={() => router.push('/dashboard/trending')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trending
        </PremiumButton>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PremiumButton 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600"
          >
          <ArrowLeft className="w-4 h-4" />
          Back
        </PremiumButton>
        
        <div className="flex items-center gap-3">
          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </PremiumButton>
          
          <PremiumButton
            variant={isLiked ? "glow" : "ghost"}
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-2"
          >
            {liking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            )}
            {project.metrics?.likeCount || 0}
          </PremiumButton>
          
          {!isTracked && (
            <PremiumButton
              variant="gradient"
              size="sm"
              onClick={handleTrack}
              disabled={tracking}
              className="flex items-center gap-2"
            >
              {tracking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Track Project
            </PremiumButton>
          )}
          
          {isTracked && (
            <PremiumBadge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Tracked
            </PremiumBadge>
          )}
        </div>
      </div>

      {/* Project Header */}
      <PremiumCard className="p-8 bg-gray-900/50 border-gray-800 backdrop-blur-xl">
        <div className="flex items-start gap-6">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700 flex-shrink-0">
            {project.logo ? (
              <Image
                src={project.logo}
                alt={project.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <Star className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{project.name}</h1>
              {project.symbol && (
                <PremiumBadge variant="outline" size="lg" className="border-gray-600 text-gray-300">
                  {project.symbol}
                </PremiumBadge>
              )}
              <PremiumBadge variant="default" className="bg-gray-800 text-gray-300 border-gray-700">
                {project.category}
              </PremiumBadge>
            </div>
            
            <p className="text-gray-400 text-lg mb-4 leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>By {project.addedBy.name || project.addedBy.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Added {new Date(project.addedAt).toLocaleDateString()}</span>
              </div>
              {project.blockchain && project.blockchain.length > 0 && (
                <div className="flex items-center gap-1">
                  <Network className="w-4 h-4" />
                  <span>{project.blockchain.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'roadmap', label: 'Roadmap', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Market Data */}
              {project.marketData && (
                <PremiumCard className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-xl">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    Market Data
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Price</p>
                      <p className="text-lg font-bold text-white">
                        ${project.marketData.price?.toFixed(6) || '0.000000'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">24h Change</p>
                      <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
                        (project.marketData.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(project.marketData.priceChange24h || 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(project.marketData.priceChange24h || 0).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                      <p className="text-lg font-bold text-white">
                        {formatNumber(project.marketData.marketCap || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Volume 24h</p>
                      <p className="text-lg font-bold text-white">
                        {formatNumber(project.marketData.volume24h || 0)}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              )}

              {/* Description & Details */}
              <PremiumCard className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  About {project.name}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-400 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <PremiumBadge key={index} variant="outline" size="sm" className="border-gray-600 text-gray-400">
                          {tag}
                        </PremiumBadge>
                      ))}
                    </div>
                  </div>
                )}
              </PremiumCard>
            </div>
          )}

          {activeTab === 'metrics' && (
            <PremiumCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Project Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCompactNumber(project.metrics?.viewCount || 0)}</p>
                  <p className="text-sm text-gray-400">Views</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCompactNumber(project.metrics?.likeCount || 0)}</p>
                  <p className="text-sm text-gray-400">Likes</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <Plus className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCompactNumber(project.metrics?.addCount || 0)}</p>
                  <p className="text-sm text-gray-400">Added</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{project.metrics?.trendingScore || 0}</p>
                  <p className="text-sm text-gray-400">Trend Score</p>
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'team' && (
            <PremiumCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Team</h3>
              {project.team && project.team.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{member.name}</h4>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                      <div className="flex gap-2">
                        {member.twitter && (
                          <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No team information available</p>
                </div>
              )}
            </PremiumCard>
          )}

          {activeTab === 'roadmap' && (
            <PremiumCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Roadmap</h3>
              {project.roadmap && project.roadmap.length > 0 ? (
                <div className="space-y-4">
                  {project.roadmap.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                        milestone.status === 'completed' 
                          ? 'bg-green-500' 
                          : milestone.status === 'in-progress'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}>
                        {milestone.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                        {milestone.status === 'in-progress' && <Zap className="w-4 h-4 text-white" />}
                        {milestone.status === 'planned' && <Clock className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{milestone.milestone}</h4>
                        <div className="flex items-center gap-3">
                          <PremiumBadge 
                            variant={
                              milestone.status === 'completed' 
                                ? 'success' 
                                : milestone.status === 'in-progress'
                                ? 'warning'
                                : 'outline'
                            }
                            size="sm"
                          >
                            {milestone.status.replace('-', ' ')}
                          </PremiumBadge>
                          {milestone.date && (
                            <span className="text-sm text-gray-400">{milestone.date}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No roadmap information available</p>
                </div>
              )}
            </PremiumCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <PremiumCard className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <span className="text-gray-500 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Views
                </span>
                <span className="text-white font-medium">{formatCompactNumber(project.metrics?.viewCount || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <span className="text-gray-500 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Likes
                </span>
                <span className="text-white font-medium">{formatCompactNumber(project.metrics?.likeCount || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <span className="text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Tracked by
                </span>
                <span className="text-white font-medium">{formatCompactNumber(project.metrics?.addCount || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <span className="text-gray-500 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Category
                </span>
                <span className="text-white font-medium">{project.category}</span>
              </div>
            </div>
          </PremiumCard>

          {/* Links */}
          <PremiumCard className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              Links
            </h3>
            <div className="space-y-3">
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Website</span>
                  <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                </a>
              )}
              {project.socialLinks?.twitter && (
                <a
                  href={project.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Twitter</span>
                  <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                </a>
              )}
              {project.socialLinks?.github && (
                <a
                  href={project.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-400" />
                  <span className="text-white">GitHub</span>
                  <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                </a>
              )}
              {project.socialLinks?.telegram && (
                <a
                  href={project.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Telegram</span>
                  <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                </a>
              )}
            </div>
          </PremiumCard>

          {/* Contract Address */}
          {project.contractAddress && (
            <PremiumCard className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                Contract
              </h3>
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-sm flex-1 truncate">
                    {project.contractAddress}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(project.contractAddress!)
                      toast.success('Address copied!')
                    }}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </PremiumCard>
          )}

          {/* Funding */}
          {project.funding && project.funding.length > 0 && (
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Funding</h3>
              <div className="space-y-3">
                {project.funding.map((round, index) => (
                  <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{round.round}</span>
                      <span className="text-green-400 font-bold">{round.amount}</span>
                    </div>
                    <p className="text-xs text-gray-400">{round.date}</p>
                    {round.investors && round.investors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Investors:</p>
                        <div className="flex flex-wrap gap-1">
                          {round.investors.map((investor, idx) => (
                            <PremiumBadge key={idx} variant="outline" size="sm">
                              {investor}
                            </PremiumBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
