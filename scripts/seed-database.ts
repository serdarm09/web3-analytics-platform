import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User'
import Project from '../models/Project'
import WhaleWallet from '../models/WhaleWallet'

dotenv.config()

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await User.deleteMany({})
    await Project.deleteMany({})
    await WhaleWallet.deleteMany({})

    // Create test users
    console.log('👤 Creating test users...')
    const users = await User.create([
      {
        email: 'admin@web3platform.com',
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        registrationMethod: 'email',
        subscription: 'enterprise',
        isVerified: true
      },
      {
        email: 'john@example.com',
        username: 'john_trader',
        password: 'password123',
        name: 'John Doe',
        registrationMethod: 'email',
        subscription: 'pro',
        isVerified: true
      },
      {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5dD12',
        username: 'whale_user',
        name: 'Whale Trader',
        registrationMethod: 'wallet',
        subscription: 'pro',
        isVerified: true
      }
    ])
    console.log(`✅ Created ${users.length} users`)

    // Create sample projects
    console.log('🚀 Creating sample projects...')
    const projects = await Project.create([
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        description: 'The first and most well-known cryptocurrency',
        category: 'Layer1',
        website: 'https://bitcoin.org',
        whitepaper: 'https://bitcoin.org/bitcoin.pdf',
        blockchain: 'Other',
        socialLinks: {
          twitter: 'https://twitter.com/bitcoin',
          reddit: 'https://reddit.com/r/bitcoin',
          github: 'https://github.com/bitcoin/bitcoin'
        },
        marketData: {
          price: 45000,
          marketCap: 880000000000,
          volume24h: 28000000000,
          change24h: 2.5,
          change7d: 8.3,
          change30d: 15.2,
          circulatingSupply: 19500000,
          totalSupply: 21000000,
          maxSupply: 21000000,
          ath: 69000,
          athDate: new Date('2021-11-10'),
          atl: 3200,
          atlDate: new Date('2018-12-15'),
          marketCapRank: 1
        },
        metrics: {
          socialScore: 95,
          trendingScore: 88,
          hypeScore: 75,
          holders: 50000000,
          transactions24h: 280000,
          activeAddresses24h: 850000,
          tvl: 15000000000
        }
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        description: 'A decentralized platform for smart contracts',
        category: 'Layer1',
        website: 'https://ethereum.org',
        whitepaper: 'https://ethereum.org/en/whitepaper/',
        blockchain: 'Ethereum',
        contractAddress: '0x0000000000000000000000000000000000000000',
        socialLinks: {
          twitter: 'https://twitter.com/ethereum',
          reddit: 'https://reddit.com/r/ethereum',
          github: 'https://github.com/ethereum'
        },
        marketData: {
          price: 2800,
          marketCap: 336000000000,
          volume24h: 15000000000,
          change24h: 3.2,
          change7d: 10.5,
          change30d: 18.7,
          circulatingSupply: 120000000,
          totalSupply: 120000000,
          ath: 4878,
          athDate: new Date('2021-11-10'),
          atl: 80,
          atlDate: new Date('2018-12-15'),
          marketCapRank: 2
        },
        metrics: {
          socialScore: 92,
          trendingScore: 90,
          hypeScore: 85,
          holders: 80000000,
          transactions24h: 1200000,
          activeAddresses24h: 500000,
          tvl: 45000000000
        }
      },
      {
        name: 'Chainlink',
        symbol: 'LINK',
        logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
        description: 'Decentralized oracle network',
        category: 'Infrastructure',
        website: 'https://chain.link',
        blockchain: 'Ethereum',
        contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        socialLinks: {
          twitter: 'https://twitter.com/chainlink',
          reddit: 'https://reddit.com/r/Chainlink',
          github: 'https://github.com/smartcontractkit/chainlink'
        },
        marketData: {
          price: 15.5,
          marketCap: 8500000000,
          volume24h: 450000000,
          change24h: 1.8,
          change7d: 5.2,
          change30d: -2.3,
          circulatingSupply: 550000000,
          totalSupply: 1000000000,
          maxSupply: 1000000000,
          marketCapRank: 15
        },
        metrics: {
          socialScore: 78,
          trendingScore: 65,
          hypeScore: 60,
          holders: 650000,
          transactions24h: 25000,
          activeAddresses24h: 15000,
          tvl: 0
        }
      },
      {
        name: 'Uniswap',
        symbol: 'UNI',
        logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
        description: 'Leading decentralized exchange protocol',
        category: 'DeFi',
        website: 'https://uniswap.org',
        blockchain: 'Ethereum',
        contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        socialLinks: {
          twitter: 'https://twitter.com/Uniswap',
          discord: 'https://discord.gg/FCfyBSbCU5',
          github: 'https://github.com/Uniswap'
        },
        marketData: {
          price: 6.2,
          marketCap: 4700000000,
          volume24h: 125000000,
          change24h: 2.1,
          change7d: 7.8,
          change30d: 12.5,
          circulatingSupply: 753000000,
          totalSupply: 1000000000,
          maxSupply: 1000000000,
          marketCapRank: 25
        },
        metrics: {
          socialScore: 82,
          trendingScore: 75,
          hypeScore: 70,
          holders: 380000,
          transactions24h: 85000,
          activeAddresses24h: 35000,
          tvl: 3500000000
        }
      },
      {
        name: 'Shiba Inu',
        symbol: 'SHIB',
        logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
        description: 'Popular meme cryptocurrency',
        category: 'Meme',
        website: 'https://shibatoken.com',
        blockchain: 'Ethereum',
        contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        socialLinks: {
          twitter: 'https://twitter.com/Shibtoken',
          telegram: 'https://t.me/shibainuthedogecoinkiller',
          reddit: 'https://reddit.com/r/SHIBArmy'
        },
        marketData: {
          price: 0.000012,
          marketCap: 7000000000,
          volume24h: 350000000,
          change24h: -1.2,
          change7d: 3.5,
          change30d: 25.8,
          circulatingSupply: 589000000000000,
          totalSupply: 1000000000000000,
          marketCapRank: 18
        },
        metrics: {
          socialScore: 88,
          trendingScore: 92,
          hypeScore: 95,
          holders: 1300000,
          transactions24h: 45000,
          activeAddresses24h: 25000,
          tvl: 0
        }
      }
    ])
    console.log(`✅ Created ${projects.length} projects`)

    // Create sample whale wallets
    console.log('🐋 Creating sample whale wallets...')
    const whaleWallets = await WhaleWallet.create([
      {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        label: 'Ethereum Foundation',
        balance: 3500000,
        balanceUSD: 9800000000,
        tokens: [
          { symbol: 'ETH', balance: 3500000, valueUSD: 9800000000 },
          { symbol: 'USDC', balance: 50000000, valueUSD: 50000000 }
        ],
        isTracked: true,
        trackingUsers: [(users[1] as any)._id.toString()],
        totalTransactions: 15420,
        transactions: [
          {
            hash: '0x123abc456def789',
            type: 'out',
            amount: 1000,
            token: 'ETH',
            from: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            to: '0x742d35Cc6634C0532925a3b844Bc9e7595f5d12',
            timestamp: new Date(Date.now() - 3600000),
            value: 2800000,
            gas: 21000,
            gasPrice: 30
          }
        ]
      },
      {
        address: '0x8f8e8b3c4de76a31971fe6a87297d8f703be8570',
        label: 'DeFi Whale #1',
        balance: 125.5,
        balanceUSD: 351400,
        tokens: [
          { symbol: 'ETH', balance: 125.5, valueUSD: 351400 },
          { symbol: 'UNI', balance: 50000, valueUSD: 310000 },
          { symbol: 'LINK', balance: 10000, valueUSD: 155000 }
        ],
        isTracked: true,
        trackingUsers: [(users[1] as any)._id.toString(), (users[2] as any)._id.toString()],
        totalTransactions: 3842
      },
      {
        address: '0x28c6c06298d514db089934071355e5743bf21d60',
        label: 'Binance Hot Wallet',
        balance: 250000,
        balanceUSD: 700000000,
        tokens: [
          { symbol: 'ETH', balance: 250000, valueUSD: 700000000 },
          { symbol: 'BTC', balance: 5000, valueUSD: 225000000 }
        ],
        isTracked: true,
        trackingUsers: [],
        totalTransactions: 285420
      }
    ])
    console.log(`✅ Created ${whaleWallets.length} whale wallets`)

    console.log('✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Projects: ${projects.length}`)
    console.log(`   - Whale Wallets: ${whaleWallets.length}`)
    
    console.log('\n🔑 Test Credentials:')
    console.log('   Admin: admin@web3platform.com / admin123')
    console.log('   User: john@example.com / password123')
    console.log('   Wallet User: 0x742d35Cc6634C0532925a3b844Bc9e7595f5d12')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()