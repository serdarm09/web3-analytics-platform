'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import ProjectCreationFormEnhanced from './ProjectCreationFormEnhanced'

interface ProjectFormData {
  name: string
  symbol: string
  logo: string
  description: string
  category: string
  website: string
  isPublic: boolean
  social: {
    twitter: string
    telegram: string
    discord: string
    github: string
    reddit: string
    medium: string
  }
  blockchain: string
  contractAddress: string
  marketData: {
    price: number
    marketCap: number
    volume24h: number
    change24h: number
    change7d: number
    circulatingSupply: number
    totalSupply: number
    maxSupply: number
    fullyDilutedValuation: number
  }
  metrics: {
    starRating: number
    holders: number
    socialScore?: number
    trendingScore?: number
    hypeScore?: number
  }
  tokenomics: {
    publicSale: number
    privateSale: number
    team: number
    advisors: number
    liquidity: number
    marketing: number
    ecosystem: number
    staking: number
  }
  team: {
    members: Array<{
      name: string
      role: string
      linkedin: string
      twitter: string
    }>
  }
  exchanges: string[]
  audits: Array<{
    auditor: string
    date: string
    reportUrl: string
  }>
  launchDate: string
  whitepaperUrl: string
  tags: string[]
}

interface ProjectEditModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onProjectUpdated?: () => void
}

export default function ProjectEditModal({ isOpen, onClose, projectId, onProjectUpdated }: ProjectEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [initialData, setInitialData] = useState<ProjectFormData | null>(null)

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProject()
    }
  }, [isOpen, projectId])

  const fetchProject = async () => {
    console.log('fetchProject called with projectId:', projectId)
    setIsLoadingProject(true)
    setError(null)

    try {
      console.log('Making fetch request to:', `/api/projects/${projectId}`)
      const response = await fetch(`/api/projects/${projectId}`)
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error('Failed to fetch project')
      }

      const response_data = await response.json()
      
      // Extract the actual project data from the nested structure
      const project = response_data.project || response_data
      
      console.log('Fetched project for editing:', project)
      console.log('Project keys:', Object.keys(project))
      console.log('Project details:', { 
        id: project._id, 
        name: project.name,
        symbol: project.symbol,
        description: project.description,
        category: project.category,
        website: project.website,
        isPublic: project.isPublic,
        hasIsPublic: 'isPublic' in project,
        socialLinks: project.socialLinks,
        marketData: project.marketData
      })

      // Transform the project data to match the form structure
      const formData: ProjectFormData = {
        name: project.name || '',
        symbol: project.symbol || '',
        logo: project.logo || '',
        description: project.description || '',
        category: project.category || '',
        website: project.website || '',
        isPublic: project.isPublic ?? false,
        social: {
          twitter: project.socialLinks?.twitter || '',
          telegram: project.socialLinks?.telegram || '',
          discord: project.socialLinks?.discord || '',
          github: project.socialLinks?.github || '',
          reddit: project.socialLinks?.reddit || '',
          medium: project.socialLinks?.medium || '',
        },
        blockchain: project.blockchain || '',
        contractAddress: project.contractAddress || '',
        marketData: {
          price: project.marketData?.price || 0,
          marketCap: project.marketData?.marketCap || 0,
          volume24h: project.marketData?.volume24h || 0,
          change24h: project.marketData?.change24h || 0,
          change7d: project.marketData?.change7d || 0,
          circulatingSupply: project.marketData?.circulatingSupply || 0,
          totalSupply: project.marketData?.totalSupply || 0,
          maxSupply: project.marketData?.maxSupply || 0,
          fullyDilutedValuation: project.marketData?.fullyDilutedValuation || 0,
        },
        metrics: {
          starRating: project.metrics?.starRating || 0,
          holders: project.metrics?.holders || 0,
          socialScore: project.metrics?.socialScore || 0,
          trendingScore: project.metrics?.trendingScore || 0,
          hypeScore: project.metrics?.hypeScore || 0,
        },
        tokenomics: project.tokenomics || {
          publicSale: 0,
          privateSale: 0,
          team: 0,
          advisors: 0,
          liquidity: 0,
          marketing: 0,
          ecosystem: 0,
          staking: 0,
        },
        team: {
          members: project.team || []
        },
        exchanges: project.exchanges || [],
        audits: project.audits || [],
        launchDate: project.launchDate ? new Date(project.launchDate).toISOString().split('T')[0] : '',
        whitepaperUrl: project.whitepaper || '',
        tags: project.tags || []
      }

      console.log('Transformed form data:', formData)
      console.log('Setting initial data...')
      setInitialData(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setIsLoadingProject(false)
    }
  }

  const handleSubmit = async (formData: ProjectFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Transform the form data back to API format
      const apiData = {
        ...formData,
        socialLinks: formData.social,
        whitepaper: formData.whitepaperUrl,
        team: formData.team.members,
      }
      
      console.log('Submitting project update:', {
        id: projectId,
        name: apiData.name,
        isPublic: apiData.isPublic,
        hasIsPublic: 'isPublic' in apiData
      })

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }

      const result = await response.json()
      
      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
        onProjectUpdated?.()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      setSuccess(false)
      setInitialData(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 flex min-h-full items-center justify-center p-4">
        <div className="relative bg-black/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Edit Project
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Update your cryptocurrency project details
              </p>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto bg-black">
            {isLoadingProject ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 border border-gray-800 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
                <p className="text-gray-500">Loading project details...</p>
              </div>
            ) : success ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Project Updated Successfully!</h3>
                <p className="text-gray-400">Your changes have been saved.</p>
              </div>
            ) : initialData ? (
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <ProjectCreationFormEnhanced
                  onSubmit={handleSubmit}
                  onCancel={handleClose}
                  isLoading={isLoading}
                  initialData={initialData}
                  isEditMode={true}
                />
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-lg font-medium">Failed to load project data</p>
                  <p className="text-gray-400 text-sm">Please try refreshing the page or contact support</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}