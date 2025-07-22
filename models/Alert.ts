import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IAlertCondition {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number
}

export interface IAlert extends Document {
  userId: Types.ObjectId
  type: 'price' | 'volume' | 'whale' | 'social'
  projectId?: Types.ObjectId
  whaleWalletId?: Types.ObjectId
  name: string
  description?: string
  condition: IAlertCondition
  notificationChannels: ('email' | 'sms' | 'push' | 'telegram')[]
  isActive: boolean
  lastTriggered?: Date
  triggerCount: number
  createdAt: Date
  updatedAt: Date
}

const alertConditionSchema = new Schema<IAlertCondition>({
  field: {
    type: String,
    required: true,
  },
  operator: {
    type: String,
    enum: ['gt', 'lt', 'eq', 'gte', 'lte'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
})

const alertSchema = new Schema<IAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['price', 'volume', 'whale', 'social'],
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    whaleWalletId: {
      type: Schema.Types.ObjectId,
      ref: 'WhaleWallet',
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    condition: {
      type: alertConditionSchema,
      required: true,
    },
    notificationChannels: [{
      type: String,
      enum: ['email', 'sms', 'push', 'telegram'],
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggered: Date,
    triggerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
alertSchema.index({ userId: 1, isActive: 1 })
alertSchema.index({ type: 1, isActive: 1 })
alertSchema.index({ projectId: 1 })
alertSchema.index({ whaleWalletId: 1 })

const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>('Alert', alertSchema)

export default Alert