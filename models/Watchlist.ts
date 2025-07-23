import mongoose from 'mongoose'

const WatchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coinId: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  alertPrice: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Compound index to prevent duplicate entries
WatchlistSchema.index({ userId: 1, coinId: 1 }, { unique: true })

const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema)

export default Watchlist