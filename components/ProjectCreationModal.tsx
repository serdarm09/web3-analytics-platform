'use client'

import { useState } from 'react'
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

interface ProjectCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: () => void
}

export default function ProjectCreationModal({ isOpen, onClose, onProjectCreated }: ProjectCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: ProjectFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create project')
      }

      const result = await response.json()
      
      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
        onProjectCreated?.()
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
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl sm:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
                Add New Project
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Add a new cryptocurrency project to the platform
              </p>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto">
            {success ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Project Created Successfully!</h3>
                <p className="text-gray-400 text-sm sm:text-base">The project has been added to the platform.</p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
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
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}