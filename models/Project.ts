import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IProject extends Document {
  name: string
  symbol: string
  logo: string
  description: string
  category: string
  website: string
  whitepaper?: string
  social: {
    twitter?: string
    telegram?: string
    discord?: string
  }
  socialLinks?: {
    twitter?: string
    telegram?: string
    discord?: string
    github?: string
    reddit?: string
  }
  marketData: {
    price: number
    marketCap: number
    volume24h: number
    change24h: number
    change7d: number
    change30d?: number
    circulatingSupply: number
    totalSupply: number
    maxSupply?: number
    ath?: number
    athDate?: Date
    atl?: number
    atlDate?: Date
    marketCapRank?: number
  }
  metrics: {
    socialScore: number
    trendingScore: number
    hypeScore: number
    holders: number
    transactions24h?: number
    activeAddresses24h?: number
    tvl?: number
  }
  blockchain: string
  contractAddress?: string
  isActive: boolean
  lastUpdated?: Date
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'Other'],
    },
    website: {
      type: String,
      required: true,
    },
    whitepaper: {
      type: String,
    },
    social: {
      twitter: String,
      telegram: String,
      discord: String,
    },
    socialLinks: {
      twitter: String,
      telegram: String,
      discord: String,
      github: String,
      reddit: String,
    },
    marketData: {
      price: {
        type: Number,
        default: 0,
      },
      marketCap: {
        type: Number,
        default: 0,
      },
      volume24h: {
        type: Number,
        default: 0,
      },
      change24h: {
        type: Number,
        default: 0,
      },
      change7d: {
        type: Number,
        default: 0,
      },
      change30d: {
        type: Number,
        default: 0,
      },
      circulatingSupply: {
        type: Number,
        default: 0,
      },
      totalSupply: {
        type: Number,
        default: 0,
      },
      maxSupply: {
        type: Number,
      },
      ath: {
        type: Number,
      },
      athDate: {
        type: Date,
      },
      atl: {
        type: Number,
      },
      atlDate: {
        type: Date,
      },
      marketCapRank: {
        type: Number,
      },
    },
    metrics: {
      socialScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      trendingScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      hypeScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      holders: {
        type: Number,
        default: 0,
      },
      transactions24h: {
        type: Number,
        default: 0,
      },
      activeAddresses24h: {
        type: Number,
        default: 0,
      },
      tvl: {
        type: Number,
        default: 0,
      },
    },
    blockchain: {
      type: String,
      required: true,
      enum: ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'Solana', 'Other'],
    },
    contractAddress: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
projectSchema.index({ symbol: 1 })
projectSchema.index({ category: 1 })
projectSchema.index({ 'marketData.marketCap': -1 })
projectSchema.index({ 'metrics.trendingScore': -1 })

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema)

export default Project