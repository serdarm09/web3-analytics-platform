import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITokenHolding {
  symbol: string
  name: string
  address: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
  logo?: string
}

export interface IWalletTransaction {
  id: string
  hash: string
  type: 'send' | 'receive' | 'swap' | 'contract'
  token: string
  tokenAddress: string
  amount: number
  value: number
  from: string
  to: string
  timestamp: Date
  gasUsed: number
  gasPrice?: number
  status: 'success' | 'failed' | 'pending'
  blockNumber: number
}

export interface IWallet extends Document {
  address: string
  ens?: string
  totalValue: number
  totalChange24h: number
  transactionCount: number
  firstSeen: Date
  lastActive: Date
  isContract: boolean
  tags: string[]
  holdings: ITokenHolding[]
  recentTransactions: IWalletTransaction[]
  profitLoss: number
  realizedPnL: number
  unrealizedPnL: number
  trackingUsers: string[]
  chain: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum'
  createdAt: Date
  updatedAt: Date
}

const tokenHoldingSchema = new Schema<ITokenHolding>({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  balance: { type: Number, required: true },
  value: { type: Number, required: true },
  price: { type: Number, required: true },
  change24h: { type: Number, default: 0 },
  allocation: { type: Number, required: true },
  logo: String
})

const walletTransactionSchema = new Schema<IWalletTransaction>({
  id: { type: String, required: true },
  hash: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['send', 'receive', 'swap', 'contract'],
    required: true
  },
  token: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  value: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, required: true },
  gasUsed: { type: Number, required: true },
  gasPrice: Number,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  blockNumber: { type: Number, required: true }
})

const walletSchema = new Schema<IWallet>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    ens: String,
    totalValue: { type: Number, default: 0 },
    totalChange24h: { type: Number, default: 0 },
    transactionCount: { type: Number, default: 0 },
    firstSeen: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    isContract: { type: Boolean, default: false },
    tags: [String],
    holdings: [tokenHoldingSchema],
    recentTransactions: [walletTransactionSchema],
    profitLoss: { type: Number, default: 0 },
    realizedPnL: { type: Number, default: 0 },
    unrealizedPnL: { type: Number, default: 0 },
    trackingUsers: [String],
    chain: {
      type: String,
      enum: ['ethereum', 'bsc', 'polygon', 'arbitrum'],
      default: 'ethereum'
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better query performance
// Note: address field already has an index due to unique: true
// Only add compound indexes and non-unique indexes here
walletSchema.index({ totalValue: -1 })
walletSchema.index({ lastActive: -1 })
walletSchema.index({ 'trackingUsers': 1 })
walletSchema.index({ 'ens': 1 })

const Wallet: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', walletSchema)

export default Wallet