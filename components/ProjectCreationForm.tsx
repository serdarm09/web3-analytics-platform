'use client'

import { useState } from 'react'
import { FormInput } from '@/components/ui/form-input'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'

interface ProjectFormData {
  name: string
  symbol: string
  logo: string
  description: string
  category: string
  website: string
  social: {
    twitter: string
    telegram: string
    discord: string
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
  }
  metrics: {
    socialScore: number
    trendingScore: number
    hypeScore: number
    holders: number
  }
}

interface ProjectCreationFormProps {
  onSubmit: (data: ProjectFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ProjectCreationForm({ onSubmit, onCancel, isLoading = false }: ProjectCreationFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    symbol: '',
    logo: '',
    description: '',
    category: '',
    website: '',
    social: {
      twitter: '',
      telegram: '',
      discord: '',
    },
    blockchain: '',
    contractAddress: '',
    marketData: {
      price: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      change7d: 0,
      circulatingSupply: 0,
      totalSupply: 0,
    },
    metrics: {
      socialScore: 0,
      trendingScore: 0,
      hypeScore: 0,
      holders: 0,
    },
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})

  const categories = ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'Oracle', 'Exchange', 'Other']
  const blockchains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'Solana', 'Other']

  const handleInputChange = (field: string, value: string | number) => {
    const fieldParts = field.split('.')
    
    if (fieldParts.length === 1) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    } else if (fieldParts.length === 2) {
      const [parent, child] = fieldParts
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProjectFormData] as object || {}),
          [child]: value
        }
      }))
    }

    if (errors[field as keyof ProjectFormData]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required'
    if (!formData.logo.trim()) newErrors.logo = 'Logo URL is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.website.trim()) newErrors.website = 'Website URL is required'
    if (!formData.blockchain) newErrors.blockchain = 'Blockchain is required'

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }

    if (formData.logo && !isValidUrl(formData.logo)) {
      newErrors.logo = 'Please enter a valid logo URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PremiumCard className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Add New Project
          </h2>
          <p className="text-gray-400">Fill in the details to add a new crypto project to the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Project Name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
              />
              
              <FormInput
                label="Symbol"
                placeholder="Enter token symbol (e.g., BTC)"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                error={errors.symbol}
                required
              />
            </div>

            <FormInput
              label="Logo URL"
              placeholder="Enter logo image URL"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              error={errors.logo}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
              {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Blockchain</label>
                <select
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.blockchain}
                  onChange={(e) => handleInputChange('blockchain', e.target.value)}
                  required
                >
                  <option value="">Select blockchain</option>
                  {blockchains.map(blockchain => (
                    <option key={blockchain} value={blockchain}>{blockchain}</option>
                  ))}
                </select>
                {errors.blockchain && <p className="text-red-400 text-sm">{errors.blockchain}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                error={errors.website}
                required
              />

              <FormInput
                label="Contract Address (Optional)"
                placeholder="0x..."
                value={formData.contractAddress}
                onChange={(e) => handleInputChange('contractAddress', e.target.value)}
              />
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Social Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="Twitter"
                placeholder="https://twitter.com/..."
                value={formData.social.twitter}
                onChange={(e) => handleInputChange('social.twitter', e.target.value)}
              />

              <FormInput
                label="Telegram"
                placeholder="https://t.me/..."
                value={formData.social.telegram}
                onChange={(e) => handleInputChange('social.telegram', e.target.value)}
              />

              <FormInput
                label="Discord"
                placeholder="https://discord.gg/..."
                value={formData.social.discord}
                onChange={(e) => handleInputChange('social.discord', e.target.value)}
              />
            </div>
          </div>

          {/* Market Data Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Market Data (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormInput
                label="Price (USD)"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={formData.marketData.price || ''}
                onChange={(e) => handleInputChange('marketData.price', parseFloat(e.target.value) || 0)}
              />

              <FormInput
                label="Market Cap (USD)"
                type="number"
                placeholder="0"
                value={formData.marketData.marketCap || ''}
                onChange={(e) => handleInputChange('marketData.marketCap', parseFloat(e.target.value) || 0)}
              />

              <FormInput
                label="24h Volume (USD)"
                type="number"
                placeholder="0"
                value={formData.marketData.volume24h || ''}
                onChange={(e) => handleInputChange('marketData.volume24h', parseFloat(e.target.value) || 0)}
              />

              <FormInput
                label="24h Change (%)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.marketData.change24h || ''}
                onChange={(e) => handleInputChange('marketData.change24h', parseFloat(e.target.value) || 0)}
              />

              <FormInput
                label="7d Change (%)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.marketData.change7d || ''}
                onChange={(e) => handleInputChange('marketData.change7d', parseFloat(e.target.value) || 0)}
              />

              <FormInput
                label="Circulating Supply"
                type="number"
                placeholder="0"
                value={formData.marketData.circulatingSupply || ''}
                onChange={(e) => handleInputChange('marketData.circulatingSupply', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Metrics Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Project Metrics (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormInput
                label="Social Score (0-100)"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.metrics.socialScore || ''}
                onChange={(e) => handleInputChange('metrics.socialScore', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              />

              <FormInput
                label="Trending Score (0-100)"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.metrics.trendingScore || ''}
                onChange={(e) => handleInputChange('metrics.trendingScore', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              />

              <FormInput
                label="Hype Score (0-100)"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.metrics.hypeScore || ''}
                onChange={(e) => handleInputChange('metrics.hypeScore', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              />

              <FormInput
                label="Token Holders"
                type="number"
                placeholder="0"
                value={formData.metrics.holders || ''}
                onChange={(e) => handleInputChange('metrics.holders', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <PremiumButton
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </PremiumButton>
            
            <PremiumButton
              type="submit"
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Project...' : 'Create Project'}
            </PremiumButton>
          </div>
        </form>
      </PremiumCard>
    </div>
  )
}