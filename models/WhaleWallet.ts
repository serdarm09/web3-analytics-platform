import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITransaction {
  hash: string
  type: 'in' | 'out' | 'swap' | 'approve' | 'transfer' | 'contract'
  amount: number
  token: string
  tokenSymbol: string
  tokenAddress?: string
  from: string
  to: string
  timestamp: Date
  value: number
  gas?: number
  gasPrice?: number
  chain: string
  status: 'success' | 'failed' | 'pending'
}

export interface IAsset {
  symbol: string
  name: string
  address?: string
  balance: number
  value: number
  price: number
  change24h?: number
  logo?: string
  chain: string
  type: 'native' | 'token' | 'nft' | 'defi'
}

export interface IChainData {
  chain: string
  nativeBalance: string
  nativeBalanceFormatted: number
  nativeValue: number
  totalValue: number
  tokenCount: number
  transactionCount: number
  lastActivity: Date
}

export interface IWhaleWallet extends Document {
  address: string
  label: string
  chains: IChainData[]
  totalValue: number
  assets: IAsset[]
  transactions: ITransaction[]
  portfolioChange24h: number
  isTracked: boolean
  trackingUsers: string[]
  lastActivity: Date
  totalTransactions: number
  isWhale: boolean
  riskScore: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const assetSchema = new Schema<IAsset>({
  symbol: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  value: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  change24h: {
    type: Number,
    default: 0,
  },
  logo: {
    type: String,
  },
  chain: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['native', 'token', 'nft', 'defi'],
    default: 'token',
  },
})

const chainDataSchema = new Schema<IChainData>({
  chain: {
    type: String,
    required: true,
  },
  nativeBalance: {
    type: String,
    required: true,
  },
  nativeBalanceFormatted: {
    type: Number,
    required: true,
  },
  nativeValue: {
    type: Number,
    required: true,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  tokenCount: {
    type: Number,
    default: 0,
  },
  transactionCount: {
    type: Number,
    default: 0,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
})

const transactionSchema = new Schema<ITransaction>({
  hash: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['in', 'out', 'swap', 'approve', 'transfer', 'contract'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  tokenSymbol: {
    type: String,
    required: true,
  },
  tokenAddress: {
    type: String,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  gas: {
    type: Number,
  },
  gasPrice: {
    type: Number,
  },
  chain: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success',
  },
})

const whaleWalletSchema = new Schema<IWhaleWallet>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
    },
    chains: [chainDataSchema],
    totalValue: {
      type: Number,
      default: 0,
    },
    assets: [assetSchema],
    transactions: [transactionSchema],
    portfolioChange24h: {
      type: Number,
      default: 0,
    },
    isTracked: {
      type: Boolean,
      default: false,
    },
    trackingUsers: [{
      type: String,
    }],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    totalTransactions: {
      type: Number,
      default: 0,
    },
    isWhale: {
      type: Boolean,
      default: false,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
)

// Create indexes for better performance
whaleWalletSchema.index({ address: 1 })
whaleWalletSchema.index({ isTracked: 1 })
whaleWalletSchema.index({ trackingUsers: 1 })
whaleWalletSchema.index({ totalValue: -1 })
whaleWalletSchema.index({ isWhale: 1 })
whaleWalletSchema.index({ 'chains.chain': 1 })

const WhaleWallet: Model<IWhaleWallet> = 
  mongoose.models.WhaleWallet || mongoose.model<IWhaleWallet>('WhaleWallet', whaleWalletSchema)

export default WhaleWallet