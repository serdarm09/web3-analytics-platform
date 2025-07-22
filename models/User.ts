import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import * as bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: Types.ObjectId
  email?: string
  username: string
  password?: string
  name?: string
  walletAddress?: string
  registrationMethod: 'email' | 'wallet'
  avatar?: string
  isVerified: boolean
  twoFactorEnabled: boolean
  subscription: 'free' | 'pro' | 'enterprise'
  trackedProjects: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: function() {
        return this.registrationMethod === 'email'
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(email: string) {
          if (!email) return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        },
        message: 'Please provide a valid email address'
      }
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      validate: {
        validator: function(username: string) {
          return /^[a-zA-Z0-9_-]+$/.test(username)
        },
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
      }
    },
    password: {
      type: String,
      required: function() {
        return this.registrationMethod === 'email'
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    walletAddress: {
      type: String,
      required: function() {
        return this.registrationMethod === 'wallet'
      },
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function(address: string) {
          if (!address) return true
          return /^0x[a-fA-F0-9]{40}$/.test(address)
        },
        message: 'Please provide a valid Ethereum wallet address'
      }
    },
    registrationMethod: {
      type: String,
      enum: {
        values: ['email', 'wallet'],
        message: 'Registration method must be email or wallet'
      },
      required: [true, 'Registration method is required'],
      default: 'email'
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    subscription: {
      type: String,
      enum: {
        values: ['free', 'pro', 'enterprise'],
        message: 'Subscription must be free, pro, or enterprise'
      },
      default: 'free',
    },
    trackedProjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Hash password before saving (only for email registration)
userSchema.pre('save', async function (next) {
  if (this.registrationMethod === 'wallet' || !this.isModified('password')) return next()
  
  try {
    // Type guard to ensure password exists
    if (!this.password) {
      return next(new Error('Password is required for email registration'))
    }
    
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    if (this.registrationMethod === 'wallet' || !this.password) {
      throw new Error('Password comparison not available for wallet users')
    }
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User