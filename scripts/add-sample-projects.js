// Script to add sample projects to MongoDB
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const sampleProjects = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    description: 'The first and most well-known cryptocurrency',
    category: 'Currency',
    website: 'https://bitcoin.org',
    social: {
      twitter: 'https://twitter.com/bitcoin'
    },
    marketData: {
      price: 43250.50,
      marketCap: 847000000000,
      volume24h: 18500000000,
      change24h: 2.45,
      change7d: -1.23,
      circulatingSupply: 19600000,
      totalSupply: 19600000,
      maxSupply: 21000000
    },
    metrics: {
      socialScore: 95,
      trendingScore: 88,
      hypeScore: 92,
      holders: 106000000
    },
    blockchain: 'Bitcoin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    description: 'Smart contract platform and cryptocurrency',
    category: 'Smart Contract Platform',
    website: 'https://ethereum.org',
    social: {
      twitter: 'https://twitter.com/ethereum'
    },
    marketData: {
      price: 2650.75,
      marketCap: 318000000000,
      volume24h: 12800000000,
      change24h: 1.85,
      change7d: 3.42,
      circulatingSupply: 120000000,
      totalSupply: 120000000
    },
    metrics: {
      socialScore: 92,
      trendingScore: 95,
      hypeScore: 89,
      holders: 86000000
    },
    blockchain: 'Ethereum',
    contractAddress: '0x0000000000000000000000000000000000000000',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Chainlink',
    symbol: 'LINK',
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    description: 'Decentralized oracle network',
    category: 'Oracle',
    website: 'https://chain.link',
    social: {
      twitter: 'https://twitter.com/chainlink'
    },
    marketData: {
      price: 14.52,
      marketCap: 8500000000,
      volume24h: 485000000,
      change24h: -0.85,
      change7d: 5.67,
      circulatingSupply: 585000000,
      totalSupply: 1000000000
    },
    metrics: {
      socialScore: 78,
      trendingScore: 82,
      hypeScore: 75,
      holders: 678000
    },
    blockchain: 'Ethereum',
    contractAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function addSampleProjects() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected successfully')

    // Clear existing projects
    await mongoose.connection.db.collection('projects').deleteMany({})
    console.log('Cleared existing projects')

    // Add sample projects
    const result = await mongoose.connection.db.collection('projects').insertMany(sampleProjects)
    console.log(`Added ${result.insertedCount} sample projects`)

    console.log('Sample projects added successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error adding sample projects:', error)
    process.exit(1)
  }
}

addSampleProjects()
