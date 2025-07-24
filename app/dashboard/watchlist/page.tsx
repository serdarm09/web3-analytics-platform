"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Plus, Trash2, Bell, TrendingUp, TrendingDown, Search, Filter, Eye, Loader2, Heart, RefreshCw, User, ExternalLink } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { StarBorder } from "@/components/ui/star-border"
import { PremiumInput } from "@/components/ui/premium-input"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumSkeleton } from "@/components/ui/premium-skeleton"
import { PremiumButton } from "@/components/ui/premium-button"
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import Image from "next/image"



export default function WatchlistPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [addingProjects, setAddingProjects] = useState<Set<string>>(new Set())
  const [likingProjects, setLikingProjects] = useState<Set<string>>(new Set())
  const [projectLikes, setProjectLikes] = useState<Record<string, { likeCount: number; isLiked: boolean }>>({})

  const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'Other']

  useEffect(() => {
    fetchPublicProjects()
  }, [])

  const fetchPublicProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects?public=true')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        // Fetch like statuses
        fetchLikeStatuses(data.projects || [])
      } else {
        toast.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchLikeStatuses = async (projectsList: any[]) => {
    for (const project of projectsList) {
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
        console.error('Error fetching like status:', error)
      }
    }
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
        toast.error(error.error || 'Failed to add project')
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

  const handleProjectClick = (project: any) => {
    router.push(`/dashboard/projects/${project._id}`)
  }

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PremiumSkeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <PremiumSkeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    )
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
                Public Projects
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover and track community-shared crypto projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton
                variant="gradient"
                onClick={() => fetchPublicProjects()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </PremiumButton>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <PremiumInput
                placeholder="Search in watch projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex gap-2">
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                {projects.length} Projects
              </PremiumBadge>
              <PremiumBadge variant="outline" className="px-4 py-2">
                <Heart className="h-4 w-4 mr-2" />
                {Object.values(projectLikes).filter(p => p.isLiked).length} Liked
              </PremiumBadge>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
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
        </motion.div>

        {/* Projects Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard 
                  className="glassmorphism hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden group"
                  onClick={() => handleProjectClick(project)}
                >
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
                    {project.addedBy && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Created by</span>
                        <span className="text-sm text-white font-medium">
                          {project.addedBy.name || project.addedBy.username || 'Anonymous'}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Views</span>
                        </div>
                        <span className="text-white font-medium">
                          {project.viewCount || 0}
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
                    </div>

                    {/* Market Data (if available) */}
                    {project.marketData?.price && (
                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Price</span>
                          <span className="text-white font-medium">
                            ${project.marketData.price.toFixed(6)}
                          </span>
                        </div>
                        {project.marketData?.change24h !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">24h Change</span>
                            <span className={`font-medium flex items-center gap-1 ${
                              project.marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {project.marketData.change24h >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {Math.abs(project.marketData.change24h).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <PremiumButton
                        variant={projectLikes[project._id]?.isLiked ? "glow" : "ghost"}
                        size="sm"
                        onClick={(e) => handleLikeProject(e, project._id)}
                        disabled={likingProjects.has(project._id)}
                        className="gap-1"
                      >
                        {likingProjects.has(project._id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={`w-4 h-4 ${projectLikes[project._id]?.isLiked ? 'fill-current' : ''}`} />
                        )}
                        <span className="text-xs">{projectLikes[project._id]?.likeCount || project.likeCount || 0}</span>
                      </PremiumButton>
                      <PremiumButton
                        variant="gradient"
                        size="sm"
                        className="ml-auto"
                        onClick={(e) => handleAddToMyProjects(e, project._id)}
                        disabled={addingProjects.has(project._id)}
                      >
                        {addingProjects.has(project._id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Add to My Projects
                      </PremiumButton>
                    </div>
                  </div>

                  {/* Hover Effect Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-slate/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No public projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No results found" : "No public projects have been shared yet"}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}