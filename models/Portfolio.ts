import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IAsset {
  projectId: Types.ObjectId
  symbol: string
  amount: number
  purchasePrice: number
  purchaseDate: Date
  currentPrice?: number
  currentValue?: number
  profitLoss?: number
  profitLossPercentage?: number
}

export interface IPortfolio extends Document {
  userId: Types.ObjectId
  name: string
  description?: string
  assets: IAsset[]
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  lastUpdated: Date
  calculateMetrics(): void
}

const assetSchema = new Schema<IAsset>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  currentPrice: Number,
  currentValue: Number,
  profitLoss: Number,
  profitLossPercentage: Number,
})

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assets: [assetSchema],
    totalValue: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    totalProfitLoss: {
      type: Number,
      default: 0,
    },
    totalProfitLossPercentage: {
      type: Number,
      default: 0,
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
portfolioSchema.index({ userId: 1, name: 1 }, { unique: true })
portfolioSchema.index({ userId: 1, createdAt: -1 })
portfolioSchema.index({ totalValue: -1 })

// Method to calculate portfolio metrics
portfolioSchema.methods.calculateMetrics = function () {
  let totalValue = 0
  let totalCost = 0

  this.assets.forEach((asset: IAsset) => {
    const cost = asset.amount * asset.purchasePrice
    // Use currentValue if available, otherwise use purchase price * amount
    const value = asset.currentValue || (asset.amount * (asset.currentPrice || asset.purchasePrice))
    
    totalCost += cost
    totalValue += value
    
    // Update asset's currentValue
    asset.currentValue = value
    asset.profitLoss = value - cost
    asset.profitLossPercentage = cost > 0 ? ((value - cost) / cost) * 100 : 0
  })

  this.totalValue = totalValue
  this.totalCost = totalCost
  this.totalProfitLoss = totalValue - totalCost
  this.totalProfitLossPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
  this.lastUpdated = new Date()
}

const Portfolio: Model<IPortfolio> = mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', portfolioSchema)

export default Portfolio