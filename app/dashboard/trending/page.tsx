"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
  import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Users, 
  Star, 
  RefreshCw, 
  Clock, 
  ArrowUp,
  ExternalLink,
  Plus,
  Activity,
  User,
  Heart,
  X,
  Calendar,
  Globe,
  Filter,
  ChevronDown
} from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { PremiumButton } from "@/components/ui/premium-button"
import { useTrendingProjects } from "@/hooks/use-trending-projects"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import Image from "next/image"

export default function UserBasedTrendingPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'trending' | 'views' | 'likes' | 'recent'>('trending')
  const [showFilters, setShowFilters] = useState(false)
  const { projects, loading, refresh, trackProjectView } = useTrendingProjects(period)
  const [refreshing, setRefreshing] = useState(false)
  const [addingProjects, setAddingProjects] = useState<Set<string>>(new Set())
  const [likingProjects, setLikingProjects] = useState<Set<string>>(new Set())
  const [projectLikes, setProjectLikes] = useState<Record<string, { likeCount: number; isLiked: boolean }>>({})
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
      toast.success('Trending data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleProjectClick = async (project: any) => {
    // Track view first
    await trackProjectView(project._id)
    
    // Open modal instead of navigating
    setSelectedProject(project)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedProject(null)
  }

  const handleAddToMyProjects = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    
    if (addingProjects.has(projectId)) return
    
    setAddingProjects(prev => new Set(prev).add(projectId))
    
    try {
      const response = await fetch('/api/projects/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      if (response.ok) {
        toast.success('Project added to your list!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add project')
      }
    } catch (error) {
      toast.error('Failed to add project')
    } finally {
      setAddingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const handleLikeProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    
    if (likingProjects.has(projectId)) return
    
    setLikingProjects(prev => new Set(prev).add(projectId))
    
    try {
      const response = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setProjectLikes(prev => ({
          ...prev,
          [projectId]: {
            likeCount: data.likeCount,
            isLiked: data.isLiked
          }
        }))
        toast.success(data.isLiked ? 'Project liked!' : 'Project unliked!')
      } else {
        toast.error('Failed to update like status')
      }
    } catch (error) {
      toast.error('Failed to update like status')
    } finally {
      setLikingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const periodOptions = [
    { value: '24h', label: '24 Hours', icon: Clock },
    { value: '7d', label: '7 Days', icon: Activity },
    { value: '30d', label: '30 Days', icon: TrendingUp }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'DeFi', label: 'DeFi' },
    { value: 'NFT', label: 'NFT' },
    { value: 'Gaming', label: 'Gaming' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Exchange', label: 'Exchange' },
    { value: 'Layer1', label: 'Layer 1' },
    { value: 'Layer2', label: 'Layer 2' },
    { value: 'Metaverse', label: 'Metaverse' },
    { value: 'DAO', label: 'DAO' },
    { value: 'AI', label: 'AI' },
    { value: 'Other', label: 'Other' }
  ]

  const sortOptions = [
    { value: 'trending', label: 'Trending Score', icon: TrendingUp },
    { value: 'views', label: 'Most Viewed', icon: Eye },
    { value: 'likes', label: 'Most Liked', icon: Heart },
    { value: 'recent', label: 'Recently Added', icon: Clock }
  ]

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    let filtered = projects

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.stats?.views || 0) - (a.stats?.views || 0)
        case 'likes':
          return (b.likeCount || 0) - (a.likeCount || 0)
        case 'recent':
          return new Date(b.addedAt || Date.now()).getTime() - new Date(a.addedAt || Date.now()).getTime()
        case 'trending':
        default:
          return (b.trendingScore || 0) - (a.trendingScore || 0)
      }
    })

    return filtered
  }, [projects, categoryFilter, sortBy])

  // Fetch like statuses for all projects
  useEffect(() => {
    const fetchLikeStatuses = async () => {
      for (const project of projects) {
        try {
          const response = await fetch(`/api/projects/${project._id}/like`)
          if (response.ok) {
            const data = await response.json()
            setProjectLikes(prev => ({
              ...prev,
              [project._id]: {
                likeCount: data.likeCount,
                isLiked: data.isLiked
              }
            }))
          }
        } catch (error) {
          console.error('Error fetching like status for project:', project._id, error)
        }
      }
    }

    if (projects.length > 0) {
      fetchLikeStatuses()
    }
  }, [projects])

  if (loading) {
    return (
      <div className="space-y-6">
        <PremiumSkeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Trending Projects</h1>
          <p className="text-gray-400 mt-1">
            {filteredAndSortedProjects.length} projects ranked by trend score
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Add Project Button */}
          <PremiumButton
            onClick={() => router.push('/dashboard/projects')}
            variant="gradient"
            size="md"
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </PremiumButton>
          
          {/* Filters Toggle */}
          <PremiumButton
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "glow" : "outline"}
            size="md"
            className="gap-2 w-full sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </PremiumButton>
          
          {/* Refresh Button */}
          <PremiumButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="glow"
            size="md"
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </PremiumButton>
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <PremiumCard className="glassmorphism p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Period Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">Time Period</label>
                  <div className="flex flex-col gap-2">
                    {periodOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <PremiumButton
                          key={option.value}
                          onClick={() => setPeriod(option.value as any)}
                          variant={period === option.value ? "gradient" : "ghost"}
                          size="sm"
                          className="gap-2 justify-start"
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </PremiumButton>
                      )
                    })}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">Category</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categoryOptions.map((option) => (
                      <PremiumButton
                        key={option.value}
                        onClick={() => setCategoryFilter(option.value)}
                        variant={categoryFilter === option.value ? "gradient" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                      >
                        {option.label}
                      </PremiumButton>
                    ))}
                  </div>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">Sort By</label>
                  <div className="flex flex-col gap-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <PremiumButton
                          key={option.value}
                          onClick={() => setSortBy(option.value as any)}
                          variant={sortBy === option.value ? "gradient" : "ghost"}
                          size="sm"
                          className="gap-2 justify-start"
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </PremiumButton>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              <div className="mt-6 pt-4 border-t border-gray-700/30">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-400">Active filters:</span>
                  <PremiumBadge variant="outline" size="sm">
                    {periodOptions.find(p => p.value === period)?.label}
                  </PremiumBadge>
                  {categoryFilter !== 'all' && (
                    <PremiumBadge variant="outline" size="sm">
                      {categoryOptions.find(c => c.value === categoryFilter)?.label}
                    </PremiumBadge>
                  )}
                  <PremiumBadge variant="outline" size="sm">
                    {sortOptions.find(s => s.value === sortBy)?.label}
                  </PremiumBadge>
                  {(categoryFilter !== 'all' || sortBy !== 'trending') && (
                    <PremiumButton
                      onClick={() => {
                        setCategoryFilter('all')
                        setSortBy('trending')
                      }}
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                    >
                      <X className="w-3 h-3" />
                      Clear Filters
                    </PremiumButton>
                  )}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumCard className="glassmorphism p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">
                {filteredAndSortedProjects.reduce((sum, p) => sum + (p.stats?.views || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="glassmorphism p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
              <Plus className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Additions</p>
              <p className="text-2xl font-bold text-white">
                {filteredAndSortedProjects.reduce((sum, p) => sum + (p.stats?.adds || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="glassmorphism p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Filtered Projects</p>
              <p className="text-2xl font-bold text-white">{filteredAndSortedProjects.length}</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Trending Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProjects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PremiumCard 
              className="glassmorphism hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden group"
              onClick={() => handleProjectClick(project)}
            >
              {/* Trending Rank Badge */}
              <div className="absolute top-4 right-4 z-10">
                <PremiumBadge variant="gradient" className="text-xs font-bold">
                  #{index + 1}
                </PremiumBadge>
              </div>

              <div className="p-6">
                {/* Project Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800">
                    {project.logo ? (
                      <Image
                        src={project.logo}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Star className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{project.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-sm">{project.symbol}</p>
                      {project.category && (
                        <PremiumBadge variant="outline" size="sm">
                          {project.category}
                        </PremiumBadge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                {project.creator && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Created by</span>
                    <span className="text-sm text-white font-medium">
                      {project.creator.name}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Views</span>
                    </div>
                    <span className="text-white font-medium">
                      {project.stats.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Added</span>
                    </div>
                    <span className="text-white font-medium">
                      {project.stats.adds.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Engagement</span>
                    </div>
                    <span className="text-white font-medium">
                      {project.stats.engagement}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Likes</span>
                    </div>
                    <span className="text-white font-medium">
                      {projectLikes[project._id]?.likeCount || project.likeCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Trend Score</span>
                    </div>
                    <span className="text-white font-medium">
                      {project.trendingScore || 0}
                    </span>
                  </div>
                </div>

                {/* Market Data (if available) */}
                {project.price && (
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Price</span>
                      <span className="text-white font-medium">
                        ${project.price.toFixed(6)}
                      </span>
                    </div>
                    {project.priceChange24h && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">24h Change</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          project.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {project.priceChange24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {Math.abs(project.priceChange24h).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {project.website && (
                      <a
                        href={project.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                        title="Visit Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <PremiumButton
                      variant={projectLikes[project._id]?.isLiked ? "glow" : "ghost"}
                      size="sm"
                      onClick={(e) => handleLikeProject(e, project._id)}
                      disabled={likingProjects.has(project._id)}
                      className="gap-1 px-3"
                    >
                      {likingProjects.has(project._id) ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className={`w-4 h-4 ${projectLikes[project._id]?.isLiked ? 'fill-current' : ''}`} />
                      )}
                      <span className="text-xs">{projectLikes[project._id]?.likeCount || project.likeCount || 0}</span>
                    </PremiumButton>
                  </div>
                  
                  <PremiumButton
                    variant="gradient"
                    size="sm"
                    onClick={(e) => handleAddToMyProjects(e, project._id)}
                    disabled={addingProjects.has(project._id)}
                    className="gap-1 px-4"
                  >
                    {addingProjects.has(project._id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add
                  </PremiumButton>
                </div>
              </div>

              {/* Hover Effect Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent-slate/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedProjects.length === 0 && !loading && (
        <PremiumCard className="glassmorphism p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {projects.length === 0 ? 'No trending projects yet' : 'No projects match your filters'}
          </h3>
          <p className="text-gray-400">
            {projects.length === 0 
              ? 'Start exploring and adding projects to see them trend here'
              : 'Try adjusting your filters to see more results'
            }
          </p>
        </PremiumCard>
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/30 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Project Details
                </h2>
                <button
                  onClick={closeDetailModal}
                  className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Project Header */}
                <div className="flex items-start space-x-4">
                  {selectedProject.logo ? (
                    <img 
                      src={selectedProject.logo} 
                      alt={selectedProject.name}
                      className="w-20 h-20 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedProject.name}&background=6366f1&color=fff&size=80`
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {selectedProject.symbol?.charAt(0) || selectedProject.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedProject.name}
                    </h3>
                    <p className="text-lg text-gray-300 mb-2">
                      ${selectedProject.symbol}
                    </p>
                    <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium inline-block">
                      {selectedProject.category}
                    </div>
                  </div>
                </div>

                {/* Trending Badge */}
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Trending #{filteredAndSortedProjects.findIndex(p => p._id === selectedProject._id) + 1}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">Score: {selectedProject.trendingScore || 0}</span>
                </div>

                {/* Publisher Information */}
                {selectedProject.addedBy && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <User className="w-5 h-5 text-purple-400 mr-2" />
                      Added By
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-lg">
                          {selectedProject.addedBy.name || selectedProject.addedBy.username || 'Anonymous User'}
                        </p>
                        {selectedProject.addedBy.username && selectedProject.addedBy.name && (
                          <p className="text-gray-400 text-sm">
                            @{selectedProject.addedBy.username}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {new Date(selectedProject.createdAt || selectedProject.addedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Description */}
                {selectedProject.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                {/* Project Website */}
                {selectedProject.website && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Website</h4>
                    <a
                      href={selectedProject.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{selectedProject.website}</span>
                      <ExternalLink className="w-4 w-4" />
                    </a>
                  </div>
                )}

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{projectLikes[selectedProject._id]?.likeCount || selectedProject.likeCount || 0}</p>
                    <p className="text-gray-400 text-sm">Likes</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedProject.totalViews || selectedProject.viewCount || selectedProject.views || 0}</p>
                    <p className="text-gray-400 text-sm">Views</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedProject.totalAdds || selectedProject.addCount || selectedProject.watchlistCount || 0}</p>
                    <p className="text-gray-400 text-sm">Adds</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <PremiumButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLikeProject(e, selectedProject._id)
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 ${
                      projectLikes[selectedProject._id]?.isLiked
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : ''
                    }`}
                    variant={projectLikes[selectedProject._id]?.isLiked ? "outline" : "gradient"}
                    disabled={likingProjects.has(selectedProject._id)}
                  >
                    {likingProjects.has(selectedProject._id) ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 ${projectLikes[selectedProject._id]?.isLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>{projectLikes[selectedProject._id]?.isLiked ? 'Liked' : 'Like'}</span>
                  </PremiumButton>
                  
                  <PremiumButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToMyProjects(e, selectedProject._id)
                    }}
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-2"
                    disabled={addingProjects.has(selectedProject._id)}
                  >
                    {addingProjects.has(selectedProject._id) ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>Add to My Projects</span>
                  </PremiumButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}