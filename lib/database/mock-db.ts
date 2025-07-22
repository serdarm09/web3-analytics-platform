// Mock database for development when MongoDB is not available
interface MockUser {
  id: string
  email?: string
  username: string
  password?: string
  name: string
  walletAddress?: string
  registrationMethod: 'email' | 'wallet'
  subscription: {
    plan: string
    status: string
  }
  isVerified: boolean
  avatar?: string
  createdAt: Date
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map()

  async createUser(userData: any): Promise<MockUser> {
    const user: MockUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      subscription: {
        plan: 'free',
        status: 'active'
      },
      isVerified: false,
      createdAt: new Date()
    }
    
    this.users.set(user.id, user)
    return user
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async findUserByUsername(username: string): Promise<MockUser | null> {
    for (const user of this.users.values()) {
      if (user.username === username) return user
    }
    return null
  }

  async findUserByWallet(walletAddress: string): Promise<MockUser | null> {
    for (const user of this.users.values()) {
      if (user.walletAddress === walletAddress) return user
    }
    return null
  }
}

export const mockDb = new MockDatabase()