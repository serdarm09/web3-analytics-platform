// Temporary database adapter for development without MongoDB
import * as bcrypt from 'bcryptjs'

interface User {
  _id: string
  email?: string
  username: string
  password?: string
  name: string
  walletAddress?: string
  registrationMethod: 'email' | 'wallet'
  subscription: {
    plan: string
    status: string
    expiresAt?: Date
  }
  isVerified: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// In-memory storage
const users: Map<string, User> = new Map()
const projects: Map<string, any> = new Map()
const portfolios: Map<string, any> = new Map()

// Helper to generate MongoDB-like IDs
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// User model replacement
export const TempUser = {
  async create(userData: any): Promise<User> {
    const user: User = {
      _id: generateId(),
      ...userData,
      password: userData.password ? await bcrypt.hash(userData.password, 10) : undefined,
      subscription: userData.subscription || {
        plan: 'free',
        status: 'active'
      },
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    users.set(user._id, user)
    return user
  },

  async findOne(query: any): Promise<User | null> {
    for (const user of users.values()) {
      if (query.email && user.email === query.email) return user
      if (query.username && user.username === query.username) return user
      if (query.walletAddress && user.walletAddress === query.walletAddress) return user
      if (query._id && user._id === query._id) return user
    }
    return null
  },

  async findById(id: string): Promise<User | null> {
    return users.get(id) || null
  },

  async comparePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false
    return bcrypt.compare(password, user.password)
  }
}

// Project model replacement
export const TempProject = {
  async create(projectData: any): Promise<any> {
    const project = {
      _id: generateId(),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    projects.set(project._id, project)
    return project
  },

  async find(query: any = {}): Promise<any[]> {
    let results = Array.from(projects.values())
    
    // Simple filtering
    if (query.category) {
      results = results.filter(p => p.category === query.category)
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase()
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.symbol.toLowerCase().includes(searchLower)
      )
    }
    
    return results
  }
}

// Portfolio model replacement
export const TempPortfolio = {
  async create(portfolioData: any): Promise<any> {
    const portfolio = {
      _id: generateId(),
      ...portfolioData,
      assets: [],
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    portfolios.set(portfolio._id, portfolio)
    return portfolio
  },

  async findOne(query: any): Promise<any | null> {
    for (const portfolio of portfolios.values()) {
      if (query.userId && portfolio.userId === query.userId) return portfolio
      if (query._id && portfolio._id === query._id) return portfolio
    }
    return null
  }
}

// Export a flag to check if using temporary database
export const isUsingTempDatabase = true