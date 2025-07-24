import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User'
import Project from '../models/Project'
import TrackedWallet from '../models/TrackedWallet'

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
    await TrackedWallet.deleteMany({})

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

    // Create sample tracked wallets (whale wallets)
    console.log('🐋 Creating sample tracked wallets...')
    const trackedWallets = await TrackedWallet.create([
      {
        userId: (users[1] as any)._id,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        network: 'ethereum',
        label: 'Ethereum Foundation',
        isOwned: false,
        nativeBalance: '3500000000000000000000000',
        nativeBalanceUSD: 9800000000,
        totalValueUSD: 9850000000,
        assets: [
          {
            tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            tokenName: 'USD Coin',
            tokenSymbol: 'USDC',
            balance: '50000000000000',
            balanceUSD: 50000000,
            decimals: 6
          }
        ],
        tags: ['whale', 'foundation'],
        lastSynced: new Date()
      },
      {
        userId: (users[1] as any)._id,
        address: '0x8f8e8b3c4de76a31971fe6a87297d8f703be8570',
        network: 'ethereum',
        label: 'DeFi Whale #1',
        isOwned: false,
        nativeBalance: '125500000000000000000',
        nativeBalanceUSD: 351400,
        totalValueUSD: 816400,
        assets: [
          {
            tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            tokenName: 'Uniswap',
            tokenSymbol: 'UNI',
            balance: '50000000000000000000000',
            balanceUSD: 310000,
            decimals: 18
          },
          {
            tokenAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            tokenName: 'ChainLink Token',
            tokenSymbol: 'LINK',
            balance: '10000000000000000000000',
            balanceUSD: 155000,
            decimals: 18
          }
        ],
        tags: ['whale', 'defi'],
        lastSynced: new Date()
      },
      {
        userId: (users[2] as any)._id,
        address: '0x28c6c06298d514db089934071355e5743bf21d60',
        network: 'ethereum',
        label: 'Binance Hot Wallet',
        isOwned: false,
        nativeBalance: '250000000000000000000000',
        nativeBalanceUSD: 700000000,
        totalValueUSD: 925000000,
        assets: [
          {
            tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            tokenName: 'Wrapped BTC',
            tokenSymbol: 'WBTC',
            balance: '500000000000',
            balanceUSD: 225000000,
            decimals: 8
          }
        ],
        tags: ['whale', 'exchange'],
        lastSynced: new Date()
      }
    ])
    console.log(`✅ Created ${trackedWallets.length} tracked wallets`)

    console.log('✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Projects: ${projects.length}`)
    console.log(`   - Tracked Wallets: ${trackedWallets.length}`)
    
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