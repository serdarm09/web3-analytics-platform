import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IMarketData extends Document {
  coinId: string
  name: string
  symbol: string
  currentPrice: number
  marketCap: number
  marketCapRank: number
  totalVolume: number
  high24h: number
  low24h: number
  priceChange24h: number
  priceChangePercentage24h: number
  priceChangePercentage7d: number
  priceChangePercentage30d: number
  circulatingSupply: number
  totalSupply: number
  maxSupply?: number
  ath: number
  athChangePercentage: number
  athDate: Date
  atl: number
  atlChangePercentage: number
  atlDate: Date
  lastUpdated: Date
}

const marketDataSchema = new Schema<IMarketData>(
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
    currentPrice: {
      type: Number,
      required: true,
      default: 0
    },
    marketCap: {
      type: Number,
      required: true,
      default: 0
    },
    marketCapRank: {
      type: Number,
      required: true
    },
    totalVolume: {
      type: Number,
      required: true,
      default: 0
    },
    high24h: {
      type: Number,
      required: true,
      default: 0
    },
    low24h: {
      type: Number,
      required: true,
      default: 0
    },
    priceChange24h: {
      type: Number,
      required: true,
      default: 0
    },
    priceChangePercentage24h: {
      type: Number,
      required: true,
      default: 0
    },
    priceChangePercentage7d: {
      type: Number,
      default: 0
    },
    priceChangePercentage30d: {
      type: Number,
      default: 0
    },
    circulatingSupply: {
      type: Number,
      required: true,
      default: 0
    },
    totalSupply: {
      type: Number,
      required: true,
      default: 0
    },
    maxSupply: {
      type: Number
    },
    ath: {
      type: Number,
      required: true,
      default: 0
    },
    athChangePercentage: {
      type: Number,
      required: true,
      default: 0
    },
    athDate: {
      type: Date,
      required: true
    },
    atl: {
      type: Number,
      required: true,
      default: 0
    },
    atlChangePercentage: {
      type: Number,
      required: true,
      default: 0
    },
    atlDate: {
      type: Date,
      required: true
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
marketDataSchema.index({ marketCapRank: 1 })
marketDataSchema.index({ totalVolume: -1 })
marketDataSchema.index({ priceChangePercentage24h: -1 })

const MarketData: Model<IMarketData> = mongoose.models.MarketData || mongoose.model<IMarketData>('MarketData', marketDataSchema)

export default MarketData