import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IActivity extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: 'login' | 'logout' | 'portfolio_update' | 'project_add' | 'project_remove' | 'watchlist_add' | 'watchlist_remove' | 'transaction' | 'wallet_connect' | 'settings_update' | 'whale_track' | 'alert_create' | 'alert_trigger'
  description: string
  metadata: {
    ip?: string
    userAgent?: string
    location?: string
    projectId?: Types.ObjectId
    walletAddress?: string
    transactionHash?: string
    network?: string
    amount?: number
    tokenSymbol?: string
    fromAddress?: string
    toAddress?: string
    gasUsed?: number
    gasPrice?: string
    blockNumber?: number
    chainId?: number
    [key: string]: any
  }
  status: 'success' | 'failed' | 'pending'
  createdAt: Date
  updatedAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: [
          'login',
          'logout', 
          'portfolio_update',
          'project_add',
          'project_remove',
          'watchlist_add',
          'watchlist_remove',
          'transaction',
          'wallet_connect',
          'settings_update',
          'whale_track',
          'alert_create',
          'alert_trigger'
        ],
        message: 'Invalid activity type'
      },
      required: [true, 'Activity type is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: {
        values: ['success', 'failed', 'pending'],
        message: 'Status must be success, failed, or pending'
      },
      default: 'success',
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'activities'
  }
)

// Indexes for performance
activitySchema.index({ userId: 1, createdAt: -1 })
activitySchema.index({ type: 1, createdAt: -1 })
activitySchema.index({ userId: 1, type: 1, createdAt: -1 })
activitySchema.index({ createdAt: -1 })

// Static methods
activitySchema.statics.createActivity = async function(
  userId: Types.ObjectId,
  type: string,
  description: string,
  metadata: any = {},
  status: string = 'success'
) {
  return await this.create({
    userId,
    type,
    description,
    metadata,
    status
  })
}

activitySchema.statics.getUserActivities = async function(
  userId: Types.ObjectId,
  limit: number = 50,
  page: number = 1,
  type?: string
) {
  const query: any = { userId }
  if (type) {
    query.type = type
  }

  const skip = (page - 1) * limit

  const [activities, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ])

  return {
    activities,
    total,
    page,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  }
}

activitySchema.statics.getActivityStats = async function(
  userId: Types.ObjectId,
  days: number = 30
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])

  const totalActivities = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startDate }
  })

  return {
    stats,
    totalActivities,
    period: days
  }
}

// Create the model
const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema)

export default Activity
