const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Import the Project model schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  website: { type: String, required: true },
  whitepaper: String,
  socialLinks: {
    twitter: String,
    telegram: String,
    discord: String,
    github: String,
    reddit: String,
  },
  marketData: {
    price: { type: Number, default: 0 },
    marketCap: { type: Number, default: 0 },
    volume24h: { type: Number, default: 0 },
    change24h: { type: Number, default: 0 },
    change7d: { type: Number, default: 0 },
    change30d: { type: Number, default: 0 },
    circulatingSupply: { type: Number, default: 0 },
    totalSupply: { type: Number, default: 0 },
    maxSupply: Number,
    ath: Number,
    athDate: Date,
    atl: Number,
    atlDate: Date,
    marketCapRank: Number,
  },
  metrics: {
    socialScore: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    hypeScore: { type: Number, default: 0 },
    holders: { type: Number, default: 0 },
    transactions24h: { type: Number, default: 0 },
    activeAddresses24h: { type: Number, default: 0 },
    tvl: { type: Number, default: 0 },
  },
  blockchain: { type: String, required: true },
  contractAddress: String,
  isTestnet: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  watchlistCount: { type: Number, default: 0 },
  addedBy: { type: String, default: 'unknown' },
  addedAt: { type: Date, default: Date.now },
  launchDate: String,
  tokenomics: mongoose.Schema.Types.Mixed,
  team: mongoose.Schema.Types.Mixed,
  audits: mongoose.Schema.Types.Mixed,
  partnerships: mongoose.Schema.Types.Mixed,
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

const testProjects = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    description: 'Decentralized platform that enables smart contracts and DApps',
    category: 'Layer1',
    blockchain: 'Ethereum',
    contractAddress: '0x0000000000000000000000000000000000000000',
    isTestnet: false,
    website: 'https://ethereum.org',
    views: 15420,
    watchlistCount: 3240,
    addedBy: 'system',
    marketData: {
      price: 2245.67,
      marketCap: 270000000000,
      volume24h: 15000000000,
      change24h: 2.45,
      change7d: 5.67,
      circulatingSupply: 120000000,
      totalSupply: 120000000
    }
  },
  {
    name: 'Polygon',
    symbol: 'MATIC',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    description: 'Ethereum scaling solution with fast and low-cost transactions',
    category: 'Layer2',
    blockchain: 'Polygon',
    contractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    isTestnet: false,
    website: 'https://polygon.technology',
    views: 8760,
    watchlistCount: 1890,
    addedBy: 'system',
    marketData: {
      price: 0.89,
      marketCap: 8200000000,
      volume24h: 320000000,
      change24h: -1.23,
      change7d: 3.45,
      circulatingSupply: 9200000000,
      totalSupply: 10000000000
    }
  },
  {
    name: 'TestNet Token',
    symbol: 'TEST',
    logo: 'https://ui-avatars.com/api/?name=TEST&background=64748b&color=fff',
    description: 'A test token for development and testing purposes',
    category: 'Other',
    blockchain: 'Ethereum',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    isTestnet: true,
    website: 'https://example.com',
    views: 234,
    watchlistCount: 45,
    addedBy: 'developer',
    marketData: {
      price: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      change7d: 0,
      circulatingSupply: 1000000,
      totalSupply: 1000000
    }
  },
  {
    name: 'Chainlink',
    symbol: 'LINK',
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    description: 'Decentralized oracle network providing real-world data to smart contracts',
    category: 'Oracle',
    blockchain: 'Ethereum',
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    isTestnet: false,
    website: 'https://chain.link',
    views: 6540,
    watchlistCount: 1234,
    addedBy: 'system',
    marketData: {
      price: 14.32,
      marketCap: 8400000000,
      volume24h: 680000000,
      change24h: 3.67,
      change7d: 12.34,
      circulatingSupply: 587000000,
      totalSupply: 1000000000
    }
  },
  {
    name: 'Uniswap',
    symbol: 'UNI',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    description: 'Decentralized exchange protocol for swapping ERC-20 tokens',
    category: 'DeFi',
    blockchain: 'Ethereum',
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    isTestnet: false,
    website: 'https://uniswap.org',
    views: 9870,
    watchlistCount: 2567,
    addedBy: 'system',
    marketData: {
      price: 6.45,
      marketCap: 4800000000,
      volume24h: 145000000,
      change24h: -2.34,
      change7d: -5.67,
      circulatingSupply: 753000000,
      totalSupply: 1000000000
    }
  },
  {
    name: 'Arbitrum Testnet',
    symbol: 'ARBT',
    logo: 'https://ui-avatars.com/api/?name=ARBT&background=64748b&color=fff',
    description: 'Test version of Arbitrum Layer 2 scaling solution',
    category: 'Layer2',
    blockchain: 'Arbitrum',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    isTestnet: true,
    website: 'https://arbitrum.io',
    views: 567,
    watchlistCount: 89,
    addedBy: 'developer',
    marketData: {
      price: 0,
      marketCap: 0,
      volume24h: 0,
      change24h: 0,
      change7d: 0,
      circulatingSupply: 0,
      totalSupply: 0
    }
  }
];

async function addTestProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Project model is already defined above

    // Clear existing projects (optional)
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      await Project.deleteMany({});
      console.log('Cleared existing projects');
    }

    // Add test projects
    for (const project of testProjects) {
      const existingProject = await Project.findOne({ symbol: project.symbol });
      if (!existingProject) {
        await Project.create({
          ...project,
          addedAt: new Date(),
          lastUpdated: new Date(),
          metrics: {
            socialScore: Math.floor(Math.random() * 100),
            trendingScore: Math.floor(Math.random() * 100),
            hypeScore: Math.floor(Math.random() * 100),
            holders: Math.floor(Math.random() * 100000)
          }
        });
        console.log(`Added project: ${project.name} (${project.symbol})`);
      } else {
        console.log(`Project already exists: ${project.name} (${project.symbol})`);
      }
    }

    console.log('Test projects added successfully!');
  } catch (error) {
    console.error('Error adding test projects:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addTestProjects();