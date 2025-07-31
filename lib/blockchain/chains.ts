// Supported blockchain networks
export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    explorer: 'https://etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
    logo: '/chains/ethereum.svg',
    color: '#627EEA'
  },
  bsc: {
    id: 56,
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrl: process.env.BSC_RPC_URL,
    explorer: 'https://bscscan.com',
    apiKey: process.env.BSCSCAN_API_KEY,
    logo: '/chains/bsc.svg',
    color: '#F3BA2F'
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: process.env.POLYGON_RPC_URL,
    explorer: 'https://polygonscan.com',
    apiKey: process.env.POLYGONSCAN_API_KEY,
    logo: '/chains/polygon.svg',
    color: '#8247E5'
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: process.env.ARBITRUM_RPC_URL,
    explorer: 'https://arbiscan.io',
    apiKey: process.env.ARBISCAN_API_KEY,
    logo: '/chains/arbitrum.svg',
    color: '#2D374B'
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: process.env.OPTIMISM_RPC_URL,
    explorer: 'https://optimistic.etherscan.io',
    apiKey: process.env.OPTIMISM_API_KEY,
    logo: '/chains/optimism.svg',
    color: '#FF0420'
  }
} as const

export type ChainKey = keyof typeof SUPPORTED_CHAINS
export type ChainConfig = typeof SUPPORTED_CHAINS[ChainKey]

export function getChainConfig(chainKey: ChainKey): ChainConfig {
  return SUPPORTED_CHAINS[chainKey]
}

export function getAllChains(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS)
}

export function getChainByNetworkId(networkId: number): ChainConfig | undefined {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === networkId)
}
