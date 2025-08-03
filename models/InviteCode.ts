import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IInviteCode extends Document {
  _id: Types.ObjectId
  code: string
  createdBy: Types.ObjectId
  usedBy?: Types.ObjectId[]
  isUsed: boolean
  usageLimit: number
  usageCount: number
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const inviteCodeSchema = new Schema<IInviteCode>(
  {
    code: {
      type: String,
      required: [true, 'Invite code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [6, 'Code must be at least 6 characters'],
      maxlength: [20, 'Code cannot exceed 20 characters']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    usedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isUsed: {
      type: Boolean,
      default: false
    },
    usageLimit: {
      type: Number,
      required: [true, 'Usage limit is required'],
      min: [1, 'Usage limit must be at least 1'],
      default: 1
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative']
    },
    expiresAt: {
      type: Date,
      default: null // null means no expiration
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Index for efficient queries
inviteCodeSchema.index({ code: 1 })
inviteCodeSchema.index({ createdBy: 1 })
inviteCodeSchema.index({ isUsed: 1 })
inviteCodeSchema.index({ expiresAt: 1 })

// Generate random invite code
inviteCodeSchema.statics.generateCode = function(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Check if code is valid and not expired
inviteCodeSchema.methods.isValid = function(): boolean {
  if (this.usageCount >= this.usageLimit) return false
  if (this.expiresAt && this.expiresAt < new Date()) return false
  return true
}

// Mark code as used
inviteCodeSchema.methods.markAsUsed = function(userId: Types.ObjectId) {
  this.usedBy.push(userId)
  this.usageCount += 1
  if (this.usageCount >= this.usageLimit) {
    this.isUsed = true
  }
  return this.save()
}

const InviteCode: Model<IInviteCode> = mongoose.models.InviteCode || mongoose.model<IInviteCode>('InviteCode', inviteCodeSchema)

export default InviteCode
