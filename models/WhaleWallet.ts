import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITransaction {
  hash: string
  type: 'in' | 'out'
  amount: number
  token: string
  tokenAddress?: string
  from: string
  to: string
  timestamp: Date
  value: number
  gas?: number
  gasPrice?: number
}

export interface IWhaleWallet extends Document {
  address: string
  label: string
  balance: number
  balanceUSD: number
  transactions: ITransaction[]
  tokens: {
    symbol: string
    balance: number
    valueUSD: number
  }[]
  isTracked: boolean
  trackingUsers: string[]
  lastActivity: Date
  totalTransactions: number
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>({
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['in', 'out'],
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
  tokenAddress: String,
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
  gas: Number,
  gasPrice: Number,
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
    balance: {
      type: Number,
      default: 0,
    },
    balanceUSD: {
      type: Number,
      default: 0,
    },
    transactions: [transactionSchema],
    tokens: [{
      symbol: String,
      balance: Number,
      valueUSD: Number,
    }],
    isTracked: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
// Note: address field already has an index due to unique: true
whaleWalletSchema.index({ balanceUSD: -1 })
whaleWalletSchema.index({ lastActivity: -1 })
whaleWalletSchema.index({ 'transactions.timestamp': -1 })

const WhaleWallet: Model<IWhaleWallet> = mongoose.models.WhaleWallet || mongoose.model<IWhaleWallet>('WhaleWallet', whaleWalletSchema)

export default WhaleWallet