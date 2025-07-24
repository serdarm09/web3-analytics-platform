import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IWalletAsset extends Document {
  tokenAddress: string
  tokenName: string
  tokenSymbol: string
  balance: string
  balanceUSD: number
  decimals: number
  logo?: string
  price?: number
  priceChange24h?: number
}

export interface IWalletTransaction extends Document {
  hash: string
  blockNumber: number
  timestamp: Date
  from: string
  to: string
  value: string
  valueUSD: number
  gasUsed: number
  gasPrice: string
  gasFee: string
  gasFeeUSD: number
  tokenSymbol?: string
  tokenName?: string
  tokenAddress?: string
  type: 'send' | 'receive' | 'swap' | 'contract_interaction' | 'nft_transfer'
  status: 'success' | 'failed' | 'pending'
  methodId?: string
  functionName?: string
}

export interface ITrackedWallet extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  address: string
  network: string
  label?: string
  isOwned: boolean
  nativeBalance: string
  nativeBalanceUSD: number
  totalValueUSD: number
  assets: IWalletAsset[]
  transactions: IWalletTransaction[]
  lastSynced: Date
  isActive: boolean
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const walletAssetSchema = new Schema<IWalletAsset>({
  tokenAddress: {
    type: String,
    required: true
  },
  tokenName: {
    type: String,
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true
  },
  balance: {
    type: String,
    required: true
  },
  balanceUSD: {
    type: Number,
    default: 0
  },
  decimals: {
    type: Number,
    required: true
  },
  logo: String,
  price: Number,
  priceChange24h: Number
})

const walletTransactionSchema = new Schema<IWalletTransaction>({
  hash: {
    type: String,
    required: true,
    index: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  from: {
    type: String,
    required: true,
    index: true
  },
  to: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: String,
    required: true
  },
  valueUSD: {
    type: Number,
    default: 0
  },
  gasUsed: {
    type: Number,
    required: true
  },
  gasPrice: {
    type: String,
    required: true
  },
  gasFee: {
    type: String,
    required: true
  },
  gasFeeUSD: {
    type: Number,
    default: 0
  },
  tokenSymbol: String,
  tokenName: String,
  tokenAddress: String,
  type: {
    type: String,
    enum: ['send', 'receive', 'swap', 'contract_interaction', 'nft_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  methodId: String,
  functionName: String
})

const trackedWalletSchema = new Schema<ITrackedWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    address: {
      type: String,
      required: [true, 'Wallet address is required'],
      index: true,
      validate: {
        validator: function(address: string) {
          // Support multiple address formats (Ethereum, Bitcoin, Solana, etc.)
          return /^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|[a-km-zA-HJ-NP-Z1-9]{32,44})$/.test(address)
        },
        message: 'Invalid wallet address format'
      }
    },
    network: {
      type: String,
      required: [true, 'Network is required'],
      enum: {
        values: ['ethereum', 'bitcoin', 'solana', 'polygon', 'binance-smart-chain', 'avalanche', 'arbitrum', 'optimism', 'fantom', 'cardano', 'polkadot', 'cosmos'],
        message: 'Unsupported network'
      },
      index: true
    },
    label: {
      type: String,
      maxlength: [50, 'Label cannot exceed 50 characters']
    },
    isOwned: {
      type: Boolean,
      default: false,
      index: true
    },
    nativeBalance: {
      type: String,
      default: '0'
    },
    nativeBalanceUSD: {
      type: Number,
      default: 0
    },
    totalValueUSD: {
      type: Number,
      default: 0,
      index: true
    },
    assets: [walletAssetSchema],
    transactions: [walletTransactionSchema],
    lastSynced: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    tags: [{
      type: String,
      maxlength: [20, 'Tag cannot exceed 20 characters']
    }],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true,
    collection: 'tracked_wallets'
  }
)

// Compound indexes for performance
trackedWalletSchema.index({ userId: 1, network: 1 })
trackedWalletSchema.index({ address: 1, network: 1 }, { unique: true })
trackedWalletSchema.index({ userId: 1, isOwned: 1 })
trackedWalletSchema.index({ userId: 1, totalValueUSD: -1 })
trackedWalletSchema.index({ lastSynced: 1 })

// Static methods
trackedWalletSchema.statics.addWallet = async function(
  userId: Types.ObjectId,
  address: string,
  network: string,
  label?: string,
  isOwned: boolean = false
) {
  // Check if wallet already exists for this user
  const existingWallet = await this.findOne({ userId, address, network })
  if (existingWallet) {
    throw new Error('Wallet already being tracked')
  }

  return await this.create({
    userId,
    address,
    network,
    label,
    isOwned,
    tags: isOwned ? ['owned'] : ['tracking']
  })
}

trackedWalletSchema.statics.getUserWallets = async function(
  userId: Types.ObjectId,
  network?: string,
  isOwned?: boolean
) {
  const query: any = { userId, isActive: true }
  if (network) query.network = network
  if (typeof isOwned === 'boolean') query.isOwned = isOwned

  return await this.find(query)
    .sort({ totalValueUSD: -1, createdAt: -1 })
    .lean()
}

trackedWalletSchema.statics.updateWalletData = async function(
  walletId: Types.ObjectId,
  data: {
    nativeBalance?: string
    nativeBalanceUSD?: number
    totalValueUSD?: number
    assets?: IWalletAsset[]
    newTransactions?: IWalletTransaction[]
  }
) {
  const updateData: any = {
    lastSynced: new Date()
  }

  if (data.nativeBalance) updateData.nativeBalance = data.nativeBalance
  if (data.nativeBalanceUSD) updateData.nativeBalanceUSD = data.nativeBalanceUSD
  if (data.totalValueUSD) updateData.totalValueUSD = data.totalValueUSD
  if (data.assets) updateData.assets = data.assets

  const wallet = await this.findByIdAndUpdate(
    walletId,
    updateData,
    { new: true }
  )

  // Add new transactions if provided
  if (data.newTransactions && data.newTransactions.length > 0) {
    await this.findByIdAndUpdate(
      walletId,
      { $push: { transactions: { $each: data.newTransactions, $position: 0 } } }
    )
  }

  return wallet
}

trackedWalletSchema.statics.getWalletStats = async function(userId: Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true }
    },
    {
      $group: {
        _id: '$network',
        walletCount: { $sum: 1 },
        totalValue: { $sum: '$totalValueUSD' },
        ownedWallets: {
          $sum: { $cond: [{ $eq: ['$isOwned', true] }, 1, 0] }
        },
        trackedWallets: {
          $sum: { $cond: [{ $eq: ['$isOwned', false] }, 1, 0] }
        }
      }
    },
    {
      $sort: { totalValue: -1 }
    }
  ])

  const totalStats = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true }
    },
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        totalValue: { $sum: '$totalValueUSD' },
        totalOwned: {
          $sum: { $cond: [{ $eq: ['$isOwned', true] }, 1, 0] }
        },
        totalTracked: {
          $sum: { $cond: [{ $eq: ['$isOwned', false] }, 1, 0] }
        }
      }
    }
  ])

  return {
    byNetwork: stats,
    total: totalStats[0] || {
      totalWallets: 0,
      totalValue: 0,
      totalOwned: 0,
      totalTracked: 0
    }
  }
}

// Create the model
const TrackedWallet: Model<ITrackedWallet> = mongoose.models.TrackedWallet || mongoose.model<ITrackedWallet>('TrackedWallet', trackedWalletSchema)

export default TrackedWallet
