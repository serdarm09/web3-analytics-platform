'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, TrendingUp, TrendingDown, Star, ExternalLink, Plus, Heart, HeartOff, Edit2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'
import ProjectCreationModal from '@/components/ProjectCreationModal'
import ProjectEditModal from '@/components/ProjectEditModal'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'

const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'Oracle', 'Exchange', 'Other']

export default function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [showTrendingProjects, setShowTrendingProjects] = useState(false)
  
  const { user } = useAuth()
  const { projects, loading, error, refetch } = useProjects({
    search: searchQuery,
    category: selectedCategory === 'All' ? '' : selectedCategory
  })

  const handleProjectCreated = () => {
    refetch()
  }

  const handleProjectUpdated = () => {
    refetch()
    setIsEditModalOpen(false)
    setEditingProjectId(null)
  }

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId)
    setIsEditModalOpen(true)
  }

  const handleTrackProject = async (projectId: string) => {
    try {
      const response = await fetch('/api/projects/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      if (response.ok) {
        refetch()
      }
    } catch (error) {
      console.error('Error tracking project:', error)
    }
  }

  const handleUntrackProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/track?projectId=${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        refetch()
      }
    } catch (error) {
      console.error('Error untracking project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        refetch()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Projects</h1>
          <p className="text-gray-400 mt-1">Discover and track cryptocurrency projects</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <PremiumButton
            onClick={() => setIsModalOpen(true)}
            variant="gradient"
            size="md"
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </PremiumButton>
          
          <PremiumButton
            onClick={() => router.push('/dashboard/trending')}
            variant="outline"
            size="md"
            className="gap-2 w-full sm:w-auto"
          >
            <TrendingUp className="w-4 h-4" />
            Browse Trending
          </PremiumButton>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PremiumInput
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <PremiumButton
          variant="outline"
          size="md"
          className="gap-2 w-full md:w-auto"
        >
          <Filter className="w-4 h-4" />
          Filters
        </PremiumButton>
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

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <PremiumCard key={i} className="p-6">
              <div className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
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
      ) : (
        <div className="grid gap-4">
          {projects.length === 0 ? (
            <PremiumCard className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tracked projects found</h3>
              <p className="text-gray-400 mb-6">Start tracking projects to see them here</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PremiumButton
                  onClick={() => setIsModalOpen(true)}
                  variant="gradient"
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Project
                </PremiumButton>
                
                <PremiumButton
                  onClick={() => setShowTrendingProjects(!showTrendingProjects)}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  {showTrendingProjects ? 'Hide' : 'Browse'} Trending Projects
                </PremiumButton>
              </div>
              
              {showTrendingProjects && (
                <div className="mt-8 text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">Trending Projects</h3>
                  <p className="text-gray-400 text-sm mb-4">Popular projects you can track:</p>
                  {/* Burada trending projeler için basit bir liste gösterebiliriz */}
                  <div className="grid gap-3">
                    {[
                      { name: 'Bitcoin', symbol: 'BTC', category: 'Layer1' },
                      { name: 'Ethereum', symbol: 'ETH', category: 'Layer1' },
                      { name: 'Solana', symbol: 'SOL', category: 'Layer1' },
                      { name: 'Cardano', symbol: 'ADA', category: 'Layer1' },
                      { name: 'Polygon', symbol: 'MATIC', category: 'Layer2' }
                    ].map((trendingProject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {trendingProject.symbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{trendingProject.name}</p>
                            <p className="text-gray-400 text-sm">{trendingProject.symbol} • {trendingProject.category}</p>
                          </div>
                        </div>
                        <PremiumButton
                          onClick={() => setIsModalOpen(true)}
                          variant="outline"
                          size="sm"
                          className="gap-1 px-3"
                        >
                          <Plus className="w-3 h-3" />
                          Track
                        </PremiumButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PremiumCard>
          ) : (
            projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-medium w-8">{index + 1}</span>
                        <Image src={project.logo} alt={project.name} width={40} height={40} className="rounded-full" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                            <span className="text-gray-400">{project.symbol}</span>
                            <PremiumBadge variant="outline" size="sm">
                              {project.category}
                            </PremiumBadge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{project.blockchain}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xl font-semibold text-white">
                          ${(project.marketData?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                        </p>
                        <div className={`flex items-center justify-end gap-1 ${(project.marketData?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(project.marketData?.change24h || 0) >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {Math.abs(project.marketData?.change24h || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-400">Market Cap</p>
                        <p className="text-lg font-medium text-white">{formatMarketCap(project.marketData?.marketCap || 0)}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-400">24h Volume</p>
                        <p className="text-lg font-medium text-white">{formatMarketCap(project.marketData?.volume24h || 0)}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-400">Rating</p>
                        <div className="flex items-center gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < (project.metrics?.starRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.website && (
                          <a
                            href={project.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        
                        {user?.id === project.addedBy && (
                          <>
                            <PremiumButton
                              onClick={() => handleEditProject(project._id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 gap-1"
                              title="Edit project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </PremiumButton>
                            <PremiumButton
                              onClick={() => handleDeleteProject(project._id)}
                              variant="ghost"
                              size="sm"
                              className="p-2 gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </PremiumButton>
                          </>
                        )}
                        
                        <PremiumButton
                          onClick={() => handleUntrackProject(project._id)}
                          variant="outline"
                          size="sm"
                          className="gap-1 px-3"
                          title="Remove from tracking"
                        >
                          <HeartOff className="w-4 h-4" />
                          Untrack
                        </PremiumButton>
                        
                        <PremiumButton 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 gap-1"
                          title="Add to favorites"
                        >
                          <Star className="w-4 h-4" />
                        </PremiumButton>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))
          )}
        </div>
      )}

      <ProjectCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {editingProjectId && (
        <ProjectEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingProjectId(null)
          }}
          projectId={editingProjectId}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  )
}