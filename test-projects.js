const testProjects = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    description: 'The first and most well-known cryptocurrency',
    category: 'Layer1',
    blockchain: 'Bitcoin',
    contractAddress: '',
    website: 'https://bitcoin.org',
    social: {
      twitter: 'https://twitter.com/bitcoin',
      telegram: '',
      discord: ''
    },
    marketData: {
      price: 45000,
      marketCap: 870000000000,
      volume24h: 25000000000,
      change24h: 2.5,
      change7d: 1.8,
      circulatingSupply: 19700000,
      totalSupply: 21000000
    },
    metrics: {
      socialScore: 95,
      trendingScore: 88,
      hypeScore: 90,
      holders: 106000000
    },
    isActive: true
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    description: 'Smart contract platform and cryptocurrency',
    category: 'Layer1',
    blockchain: 'Ethereum',
    contractAddress: '',
    website: 'https://ethereum.org',
    social: {
      twitter: 'https://twitter.com/ethereum',
      telegram: '',
      discord: ''
    },
    marketData: {
      price: 2500,
      marketCap: 300000000000,
      volume24h: 15000000000,
      change24h: 3.2,
      change7d: 2.1,
      circulatingSupply: 120000000,
      totalSupply: 120000000
    },
    metrics: {
      socialScore: 92,
      trendingScore: 85,
      hypeScore: 88,
      holders: 97000000
    },
    isActive: true
  },
  {
    name: 'Chainlink',
    symbol: 'LINK',
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    description: 'Decentralized oracle network',
    category: 'Infrastructure',
    blockchain: 'Ethereum',
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    website: 'https://chain.link',
    social: {
      twitter: 'https://twitter.com/chainlink',
      telegram: '',
      discord: ''
    },
    marketData: {
      price: 14.5,
      marketCap: 8500000000,
      volume24h: 350000000,
      change24h: -1.2,
      change7d: 4.8,
      circulatingSupply: 586000000,
      totalSupply: 1000000000
    },
    metrics: {
      socialScore: 78,
      trendingScore: 72,
      hypeScore: 75,
      holders: 720000
    },
    isActive: true
  }
]

async function createTestProjects() {
  const authResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'serdarserdar@gmail.com',
      password: '123456'
    })
  })

  const authData = await authResponse.json()
  const token = authData.token

  console.log('Auth token:', token ? 'received' : 'failed')

  for (const project of testProjects) {
    try {
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(project)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Created project: ${project.name} (ID: ${result._id})`)
      } else {
        const error = await response.text()
        console.error(`❌ Failed to create ${project.name}:`, error)
      }
    } catch (error) {
      console.error(`❌ Error creating ${project.name}:`, error.message)
    }
  }
}

createTestProjects()
