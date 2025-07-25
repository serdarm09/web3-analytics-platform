'use client'

import { useState, useEffect } from 'react'
import { FormInput } from '@/components/ui/form-input'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { Plus, Trash2, Upload, Calendar, FileText, Shield, Globe, Users, Coins, LineChart, X, Search, RefreshCw, Star } from 'lucide-react'
import { toast } from 'sonner'

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

interface ProjectCreationFormProps {
  onSubmit: (data: ProjectFormData) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: ProjectFormData
  isEditMode?: boolean
}

export default function ProjectCreationFormEnhanced({ onSubmit, onCancel, isLoading = false, initialData, isEditMode = false }: ProjectCreationFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(initialData || {
    name: '',
    symbol: '',
    logo: '',
    description: '',
    category: '',
    website: '',
    isPublic: false,
    social: {
      twitter: '',
      telegram: '',
      discord: '',
      github: '',
      reddit: '',
      medium: '',
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
      maxSupply: 0,
      fullyDilutedValuation: 0,
    },
    metrics: {
      starRating: 0,
      holders: 0,
    },
    tokenomics: {
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
      members: []
    },
    exchanges: [],
    audits: [],
    launchDate: '',
    whitepaperUrl: '',
    tags: []
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})
  const [currentTag, setCurrentTag] = useState('')
  const [currentExchange, setCurrentExchange] = useState('')
  const [activeSection, setActiveSection] = useState('basic')
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const categories = ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'DAO', 'Oracle', 'Privacy', 'Exchange', 'Other']
  const blockchains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'Solana', 'Cardano', 'Polkadot', 'Cosmos', 'Near', 'Other']
  const popularExchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Gate.io', 'Huobi', 'OKX', 'Bybit', 'Bitget', 'MEXC']

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Globe },
    { id: 'social', label: 'Social Links', icon: Users },
    { id: 'market', label: 'Market Data', icon: LineChart },
    { id: 'tokenomics', label: 'Tokenomics', icon: Coins },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'security', label: 'Security & Exchanges', icon: Shield },
  ]

  const getBlockchainPlatform = (blockchain: string): string => {
    const platformMap: Record<string, string> = {
      'Ethereum': 'ethereum',
      'BSC': 'binance-smart-chain',
      'Polygon': 'polygon-pos',
      'Arbitrum': 'arbitrum-one',
      'Optimism': 'optimistic-ethereum',
      'Avalanche': 'avalanche',
      'Solana': 'solana',
    }
    return platformMap[blockchain] || 'ethereum'
  }

  const fetchMarketData = async () => {
    if (!formData.contractAddress || !formData.blockchain) {
      setFetchError('Please enter contract address and select blockchain')
      return
    }

    setIsFetchingData(true)
    setFetchError('')

    try {
      const platform = getBlockchainPlatform(formData.blockchain)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${platform}/contract/${formData.contractAddress}`
      )

      if (!response.ok) {
        throw new Error('Token not found or API error')
      }

      const data = await response.json()

      // Update form data with fetched values
      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        symbol: data.symbol?.toUpperCase() || prev.symbol,
        logo: data.image?.large || prev.logo,
        marketData: {
          price: data.market_data?.current_price?.usd || 0,
          marketCap: data.market_data?.market_cap?.usd || 0,
          volume24h: data.market_data?.total_volume?.usd || 0,
          change24h: data.market_data?.price_change_percentage_24h || 0,
          change7d: data.market_data?.price_change_percentage_7d || 0,
          circulatingSupply: data.market_data?.circulating_supply || 0,
          totalSupply: data.market_data?.total_supply || 0,
          maxSupply: data.market_data?.max_supply || 0,
          fullyDilutedValuation: data.market_data?.fully_diluted_valuation?.usd || 0,
        }
      }))

      setFetchError('')
      toast.success('Market data fetched successfully from CoinGecko!')
    } catch (error) {
      setFetchError('Unable to fetch token data. You can enter details manually.')
      toast.error('Failed to fetch token data. You can enter details manually.')
      console.error('Error fetching market data:', error)
    } finally {
      setIsFetchingData(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    const fieldParts = field.split('.')
    
    if (fieldParts.length === 1) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
      
      // Clear market data when blockchain changes
      if (field === 'blockchain' && formData.marketData.price > 0) {
        setFormData(prev => ({
          ...prev,
          marketData: {
            price: 0,
            marketCap: 0,
            volume24h: 0,
            change24h: 0,
            change7d: 0,
            circulatingSupply: 0,
            totalSupply: 0,
            maxSupply: 0,
            fullyDilutedValuation: 0,
          }
        }))
        toast.info('Blockchain changed. Please fetch market data again.')
      }
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

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: {
        members: [...prev.team.members, { name: '', role: '', linkedin: '', twitter: '' }]
      }
    }))
  }

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team: {
        members: prev.team.members.filter((_, i) => i !== index)
      }
    }))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        members: prev.team.members.map((member, i) => 
          i === index ? { ...member, [field]: value } : member
        )
      }
    }))
  }

  const addAudit = () => {
    setFormData(prev => ({
      ...prev,
      audits: [...prev.audits, { auditor: '', date: '', reportUrl: '' }]
    }))
  }

  const removeAudit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      audits: prev.audits.filter((_, i) => i !== index)
    }))
  }

  const updateAudit = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      audits: prev.audits.map((audit, i) => 
        i === index ? { ...audit, [field]: value } : audit
      )
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addExchange = () => {
    if (currentExchange && !formData.exchanges.includes(currentExchange)) {
      setFormData(prev => ({
        ...prev,
        exchanges: [...prev.exchanges, currentExchange]
      }))
      setCurrentExchange('')
    }
  }

  const removeExchange = (exchange: string) => {
    setFormData(prev => ({
      ...prev,
      exchanges: prev.exchanges.filter(e => e !== exchange)
    }))
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

    // Validate tokenomics total
    const tokenomicsTotal = Object.values(formData.tokenomics).reduce((sum, val) => sum + val, 0)
    if (tokenomicsTotal > 0 && tokenomicsTotal !== 100) {
      newErrors.tokenomics = `Tokenomics must add up to 100% (currently ${tokenomicsTotal}%)`
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

  const renderBasicInfo = () => (
    <div className="space-y-6">
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
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-teal focus:border-transparent resize-none h-32"
          placeholder="Enter a detailed project description"
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
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-teal focus:border-transparent"
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
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-teal focus:border-transparent"
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Project Visibility</label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.isPublic}
                onChange={() => handleInputChange('isPublic', true)}
                className="mr-2 text-accent-teal focus:ring-accent-teal"
              />
              <span className="text-sm text-gray-300">Public</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={!formData.isPublic}
                onChange={() => handleInputChange('isPublic', false)}
                className="mr-2 text-accent-teal focus:ring-accent-teal"
              />
              <span className="text-sm text-gray-300">Private</span>
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Public projects will appear in trending and search results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Contract Address (CA)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x..."
              value={formData.contractAddress}
              onChange={(e) => handleInputChange('contractAddress', e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-teal focus:border-transparent"
            />
            <PremiumButton
              type="button"
              onClick={fetchMarketData}
              disabled={isFetchingData || !formData.contractAddress || !formData.blockchain}
              size="sm"
            >
              {isFetchingData ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </PremiumButton>
          </div>
          {fetchError && (
            <p className="text-yellow-400 text-xs">{fetchError}</p>
          )}
          <p className="text-xs text-gray-400">
            Enter contract address to auto-fetch price data from CoinGecko
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Launch Date"
          type="date"
          value={formData.launchDate}
          onChange={(e) => handleInputChange('launchDate', e.target.value)}
        />

        <FormInput
          label="Whitepaper URL"
          placeholder="https://example.com/whitepaper.pdf"
          value={formData.whitepaperUrl}
          onChange={(e) => handleInputChange('whitepaperUrl', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-teal focus:border-transparent"
            placeholder="Add a tag (e.g., yield-farming, staking)"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <PremiumButton type="button" onClick={addTag} size="sm">
            <Plus className="w-4 h-4" />
          </PremiumButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-400 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSocialLinks = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <FormInput
          label="GitHub"
          placeholder="https://github.com/..."
          value={formData.social.github}
          onChange={(e) => handleInputChange('social.github', e.target.value)}
        />

        <FormInput
          label="Reddit"
          placeholder="https://reddit.com/r/..."
          value={formData.social.reddit}
          onChange={(e) => handleInputChange('social.reddit', e.target.value)}
        />

        <FormInput
          label="Medium"
          placeholder="https://medium.com/@..."
          value={formData.social.medium}
          onChange={(e) => handleInputChange('social.medium', e.target.value)}
        />
      </div>
    </div>
  )

  const renderMarketData = () => (
    <div className="space-y-6">
      {!formData.contractAddress && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            💡 Enter a contract address in the Basic Info section to auto-fetch market data from CoinGecko
          </p>
        </div>
      )}
      
      {formData.marketData.price > 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">
            ✓ Market data fetched successfully from CoinGecko
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormInput
          label="Price (USD)"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          value={formData.marketData.price || ''}
          onChange={(e) => handleInputChange('marketData.price', parseFloat(e.target.value) || 0)}
          disabled={formData.marketData.price > 0 && formData.contractAddress !== ''}
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

        <FormInput
          label="Total Supply"
          type="number"
          placeholder="0"
          value={formData.marketData.totalSupply || ''}
          onChange={(e) => handleInputChange('marketData.totalSupply', parseFloat(e.target.value) || 0)}
        />

        <FormInput
          label="Max Supply"
          type="number"
          placeholder="0"
          value={formData.marketData.maxSupply || ''}
          onChange={(e) => handleInputChange('marketData.maxSupply', parseFloat(e.target.value) || 0)}
        />

        <FormInput
          label="FDV (USD)"
          type="number"
          placeholder="0"
          value={formData.marketData.fullyDilutedValuation || ''}
          onChange={(e) => handleInputChange('marketData.fullyDilutedValuation', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Project Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleInputChange('metrics.starRating', rating)}
                className={`p-1 transition-colors ${
                  formData.metrics.starRating >= rating
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-gray-600 hover:text-gray-500'
                }`}
              >
                <Star 
                  className="w-6 h-6" 
                  fill={formData.metrics.starRating >= rating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">Rate this project from 1 to 10 stars</p>
        </div>

        <FormInput
          label="Token Holders"
          type="number"
          placeholder="0"
          value={formData.metrics.holders || ''}
          onChange={(e) => handleInputChange('metrics.holders', parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  )

  const renderTokenomics = () => {
    const total = Object.values(formData.tokenomics).reduce((sum, val) => sum + val, 0)
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Token Distribution</p>
          <p className={`text-lg font-semibold ${total === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
            Total: {total}%
          </p>
          {errors.tokenomics && <p className="text-red-400 text-sm mt-1">{errors.tokenomics}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormInput
            label="Public Sale (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.publicSale || ''}
            onChange={(e) => handleInputChange('tokenomics.publicSale', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Private Sale (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.privateSale || ''}
            onChange={(e) => handleInputChange('tokenomics.privateSale', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Team (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.team || ''}
            onChange={(e) => handleInputChange('tokenomics.team', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Advisors (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.advisors || ''}
            onChange={(e) => handleInputChange('tokenomics.advisors', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Liquidity (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.liquidity || ''}
            onChange={(e) => handleInputChange('tokenomics.liquidity', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Marketing (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.marketing || ''}
            onChange={(e) => handleInputChange('tokenomics.marketing', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Ecosystem (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.ecosystem || ''}
            onChange={(e) => handleInputChange('tokenomics.ecosystem', parseFloat(e.target.value) || 0)}
          />

          <FormInput
            label="Staking (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={formData.tokenomics.staking || ''}
            onChange={(e) => handleInputChange('tokenomics.staking', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    )
  }

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-white">Team Members</h4>
        <PremiumButton type="button" onClick={addTeamMember} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </PremiumButton>
      </div>

      {formData.team.members.map((member, index) => (
        <div key={index} className="bg-gray-800/50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="text-white">Member {index + 1}</h5>
            <button
              type="button"
              onClick={() => removeTeamMember(index)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Name"
              placeholder="John Doe"
              value={member.name}
              onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
            />
            
            <FormInput
              label="Role"
              placeholder="CEO"
              value={member.role}
              onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
            />
            
            <FormInput
              label="LinkedIn"
              placeholder="https://linkedin.com/in/..."
              value={member.linkedin}
              onChange={(e) => updateTeamMember(index, 'linkedin', e.target.value)}
            />
            
            <FormInput
              label="Twitter"
              placeholder="https://twitter.com/..."
              value={member.twitter}
              onChange={(e) => updateTeamMember(index, 'twitter', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderSecurityExchanges = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Security Audits</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Add security audit information</p>
            <PremiumButton type="button" onClick={addAudit} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Audit
            </PremiumButton>
          </div>

          {formData.audits.map((audit, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="text-white">Audit {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeAudit(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Auditor"
                  placeholder="CertiK"
                  value={audit.auditor}
                  onChange={(e) => updateAudit(index, 'auditor', e.target.value)}
                />
                
                <FormInput
                  label="Date"
                  type="date"
                  value={audit.date}
                  onChange={(e) => updateAudit(index, 'date', e.target.value)}
                />
                
                <FormInput
                  label="Report URL"
                  placeholder="https://..."
                  value={audit.reportUrl}
                  onChange={(e) => updateAudit(index, 'reportUrl', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Exchange Listings</h4>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-teal focus:border-transparent"
              value={currentExchange}
              onChange={(e) => setCurrentExchange(e.target.value)}
            >
              <option value="">Select exchange</option>
              {popularExchanges.map(exchange => (
                <option key={exchange} value={exchange}>{exchange}</option>
              ))}
            </select>
            <PremiumButton type="button" onClick={addExchange} size="sm">
              <Plus className="w-4 h-4" />
            </PremiumButton>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.exchanges.map(exchange => (
              <span key={exchange} className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-1">
                {exchange}
                <button
                  type="button"
                  onClick={() => removeExchange(exchange)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-accent-slate to-accent-teal text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <PremiumCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {activeSection === 'basic' && renderBasicInfo()}
              {activeSection === 'social' && renderSocialLinks()}
              {activeSection === 'market' && renderMarketData()}
              {activeSection === 'tokenomics' && renderTokenomics()}
              {activeSection === 'team' && renderTeam()}
              {activeSection === 'security' && renderSecurityExchanges()}

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
      </div>
    </div>
  )
}