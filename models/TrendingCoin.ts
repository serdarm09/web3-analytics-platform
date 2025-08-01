import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITrendingCoin extends Document {
  coinId: string
  name: string
  symbol: string
  thumb: string
  marketCapRank: number
  price: number
  priceChange24h: number
  volume24h: number
  trendingScore: number
  socialMentions: number
  searchVolume: number
  category: string
  lastUpdated: Date
}

const trendingCoinSchema = new Schema<ITrendingCoin>(
  {
    coinId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    thumb: {
      type: String,
      required: true
    },
    marketCapRank: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    priceChange24h: {
      type: Number,
      required: true,
      default: 0
    },
    volume24h: {
      type: Number,
      required: true,
      default: 0
    },
    trendingScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    },
    socialMentions: {
      type: Number,
      default: 0
    },
    searchVolume: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      required: true,
      enum: ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Layer1', 'Layer2', 'Meme', 'Metaverse', 'AI', 'Oracle', 'Exchange', 'Other']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Indexes for performance
trendingCoinSchema.index({ trendingScore: -1 })
trendingCoinSchema.index({ socialMentions: -1 })
trendingCoinSchema.index({ searchVolume: -1 })

const TrendingCoin: Model<ITrendingCoin> = mongoose.models.TrendingCoin || mongoose.model<ITrendingCoin>('TrendingCoin', trendingCoinSchema)

export default TrendingCoin