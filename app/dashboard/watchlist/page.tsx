'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, Search, Filter, RefreshCw, User, Plus, TrendingUp, ExternalLink, X, Calendar, Globe } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'

interface Project {
  _id: string
  name: string
  symbol: string
  category: string
  description?: string
  logo?: string
  website?: string
  addedBy?: {
    username?: string
    name?: string
  }
  createdBy?: {
    userId: string
    username?: string
    email?: string
  }
  createdAt: string
  likes: number
  views: number
  likeCount?: number  // New field from database
  viewCount?: number  // New field from database
}

export default function WatchlistPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set())
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects?public=true&_t=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      const data = await response.json()
      
      if (response.ok && data.projects) {
        setProjects(data.projects)
        // Fetch user's liked projects
        await fetchUserLikedProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserLikedProjects = async (projects: Project[]) => {
    try {
      const likedProjectIds = new Set<string>()
      
      // Check each project's like status
      const likePromises = projects.map(async (project) => {
        try {
          const response = await fetch(`/api/projects/${project._id}/like`, {
            method: 'GET',
          })
          if (response.ok) {
            const data = await response.json()
            if (data.isLiked) {
              likedProjectIds.add(project._id)
            }
          }
        } catch (error) {
          console.error(`Error checking like status for project ${project._id}:`, error)
        }
      })
      
      await Promise.all(likePromises)
      setLikedProjects(likedProjectIds)
    } catch (error) {
      console.error('Error fetching user liked projects:', error)
    }
  }

  const handleLikeProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    
    try {
      const response = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state based on server response
        if (data.isLiked) {
          setLikedProjects(prev => new Set(prev).add(projectId))
        } else {
          setLikedProjects(prev => {
            const newSet = new Set(prev)
            newSet.delete(projectId)
            return newSet
          })
        }
        
        // Update project in list with server-side count
        setProjects(prev => prev.map(p => 
          p._id === projectId 
            ? { 
                ...p, 
                likeCount: data.likeCount,
                likes: data.likeCount
              }
            : p
        ))

        // Update selected project if it's open in modal
        if (selectedProject && selectedProject._id === projectId) {
          setSelectedProject(prev => prev ? {
            ...prev,
            likeCount: data.likeCount,
            likes: data.likeCount
          } : null)
        }
      } else {
        console.error('Failed to like/unlike project')
      }
    } catch (error) {
      console.error('Error liking project:', error)
    }
  }

  const handleAddToMyProjects = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    console.log('Adding project to watchlist:', projectId)
  }

  const handleViewProjectDetails = async (project: Project) => {
    // Track view when opening project details
    try {
      await fetch(`/api/projects/${project._id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Failed to track project view:', error)
    }
    
    setSelectedProject(project)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedProject(null)
  }

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))]
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
            <p className="text-gray-400">Loading community projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Watch Projects
          </h1>
          <p className="text-gray-400 mt-1">
            Discover and track community shared projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
            {projects.length} Projects
          </div>
          <PremiumButton
            onClick={fetchProjects}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </PremiumButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <PremiumInput
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={Search}
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No projects found
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No community projects have been shared yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard className="p-6 h-full hover:scale-[1.02] transition-transform cursor-pointer"
                  onClick={() => handleViewProjectDetails(project)}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {project.logo ? (
                        <img 
                          src={project.logo} 
                          alt={project.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${project.name}&background=6366f1&color=fff`
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {project.symbol.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          ${project.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                      {project.category}
                    </div>
                  </div>

                  {/* Project Description */}
                  {project.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Added By */}
                  {(project.createdBy || project.addedBy) && (
                    <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-800/20 rounded-lg">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">
                        By {project.createdBy?.username || project.createdBy?.email || project.addedBy?.username || project.addedBy?.name || 'Anonymous'}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-400 ml-auto">
                        <span className="text-xs">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => handleLikeProject(e, project._id)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                          likedProjects.has(project._id)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedProjects.has(project._id) ? 'fill-current' : ''}`} />
                        <span className="text-sm">{project.likeCount || project.likes || 0}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{project.viewCount || project.views || 0}</span>
                      </div>
                    </div>

                    <PremiumButton
                      onClick={(e) => handleAddToMyProjects(e, project._id)}
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
                  Proje Detayları
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
                        {selectedProject.symbol.charAt(0)}
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

                {/* Publisher Information */}
                {selectedProject.addedBy && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <User className="w-5 h-5 text-purple-400 mr-2" />
                      Yayınlayan
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-lg">
                          {selectedProject.createdBy?.username || selectedProject.createdBy?.email || selectedProject.addedBy?.name || selectedProject.addedBy?.username || 'Anonymous User'}
                        </p>
                        {(selectedProject.createdBy?.username || selectedProject.addedBy?.username) && (
                          <p className="text-gray-400 text-sm">
                            @{selectedProject.createdBy?.username || selectedProject.addedBy?.username}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {new Date(selectedProject.createdAt).toLocaleDateString('tr-TR', {
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
                    <h4 className="text-lg font-semibold text-white mb-3">Açıklama</h4>
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
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedProject.likeCount || selectedProject.likes || 0}</p>
                    <p className="text-gray-400 text-sm">Beğeni</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedProject.viewCount || selectedProject.views || 0}</p>
                    <p className="text-gray-400 text-sm">Görüntülenme</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {Math.floor(((selectedProject.likeCount || selectedProject.likes || 0) / Math.max((selectedProject.viewCount || selectedProject.views || 1), 1)) * 100)}%
                    </p>
                    <p className="text-gray-400 text-sm">Beğeni Oranı</p>
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
                      likedProjects.has(selectedProject._id)
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : ''
                    }`}
                    variant={likedProjects.has(selectedProject._id) ? "outline" : "gradient"}
                  >
                    <Heart className={`h-4 w-4 ${likedProjects.has(selectedProject._id) ? 'fill-current' : ''}`} />
                    <span>{likedProjects.has(selectedProject._id) ? 'Beğenildi' : 'Beğen'}</span>
                  </PremiumButton>
                  
                  <PremiumButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToMyProjects(e, selectedProject._id)
                    }}
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Watchlist</span>
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
