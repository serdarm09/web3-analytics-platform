import { ChainKey, getChainConfig, SUPPORTED_CHAINS } from './chains'

export interface TokenBalance {
  contractAddress: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: number
  value: number
  price: number
  change24h: number
  logo?: string
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueFormatted: number
  gasPrice: string
  gasUsed: string
  gasLimit: string
  timestamp: number
  blockNumber: number
  tokenSymbol?: string
  tokenName?: string
  tokenDecimals?: number
  type: 'native' | 'token' | 'nft' | 'defi'
  status: 'success' | 'failed' | 'pending'
}

export interface WalletInfo {
  address: string
  chain: ChainKey
  nativeBalance: string
  nativeBalanceFormatted: number
  nativeValue: number
  totalValue: number
  tokenBalances: TokenBalance[]
  transactions: Transaction[]
  lastActivity: number
  transactionCount: number
}

export class BlockchainService {
  private static instance: BlockchainService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService()
    }
    return BlockchainService.instance
  }

  private getCacheKey(method: string, ...params: any[]): string {
    return `${method}:${params.join(':')}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getWalletInfo(address: string, chain: ChainKey): Promise<WalletInfo> {
    const cacheKey = this.getCacheKey('walletInfo', address, chain)
    const cached = this.getFromCache<WalletInfo>(cacheKey)
    if (cached) return cached

    try {
      const [nativeBalance, tokenBalances, transactions] = await Promise.all([
        this.getNativeBalance(address, chain),
        this.getTokenBalances(address, chain),
        this.getTransactions(address, chain, 20)
      ])

      const totalValue = nativeBalance.value + tokenBalances.reduce((sum, token) => sum + token.value, 0)
      const lastActivity = transactions.length > 0 ? transactions[0].timestamp : 0

      const walletInfo: WalletInfo = {
        address,
        chain,
        nativeBalance: nativeBalance.balance,
        nativeBalanceFormatted: nativeBalance.balanceFormatted,
        nativeValue: nativeBalance.value,
        totalValue,
        tokenBalances,
        transactions,
        lastActivity,
        transactionCount: await this.getTransactionCount(address, chain)
      }

      this.setCache(cacheKey, walletInfo)
      return walletInfo
    } catch (error) {
      console.error(`Error fetching wallet info for ${address} on ${chain}:`, error)
      throw error
    }
  }

  private async getNativeBalance(address: string, chain: ChainKey): Promise<{
    balance: string
    balanceFormatted: number
    value: number
  }> {
    const chainConfig = getChainConfig(chain)
    
    try {
      // Get native balance using RPC
      const response = await fetch(chainConfig.rpcUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      })

      const data = await response.json()
      const balanceWei = BigInt(data.result)
      const balanceFormatted = Number(balanceWei) / Math.pow(10, 18)

      // Get native token price
      const price = await this.getNativeTokenPrice(chain)
      const value = balanceFormatted * price

      return {
        balance: balanceWei.toString(),
        balanceFormatted,
        value
      }
    } catch (error) {
      console.error(`Error getting native balance for ${address} on ${chain}:`, error)
      return { balance: '0', balanceFormatted: 0, value: 0 }
    }
  }

  private async getTokenBalances(address: string, chain: ChainKey): Promise<TokenBalance[]> {
    try {
      // This would typically use services like Alchemy, Moralis, or chain-specific APIs
      // For now, we'll use a simplified approach with etherscan-like APIs
      
      const chainConfig = getChainConfig(chain)
      if (!chainConfig.apiKey) {
        console.warn(`No API key configured for ${chain}`)
        return []
      }

      let apiUrl = ''
      if (chain === 'ethereum') {
        apiUrl = `https://api.etherscan.io/api?module=account&action=tokenlist&address=${address}&apikey=${chainConfig.apiKey}`
      } else if (chain === 'bsc') {
        apiUrl = `https://api.bscscan.com/api?module=account&action=tokenlist&address=${address}&apikey=${chainConfig.apiKey}`
      } else if (chain === 'polygon') {
        apiUrl = `https://api.polygonscan.com/api?module=account&action=tokenlist&address=${address}&apikey=${chainConfig.apiKey}`
      } else {
        return [] // Fallback for other chains
      }

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.status !== '1' || !data.result) {
        return []
      }

      // Process token balances and get prices
      const tokenBalances: TokenBalance[] = []
      for (const token of data.result.slice(0, 20)) { // Limit to top 20 tokens
        const balanceFormatted = Number(token.balance) / Math.pow(10, Number(token.decimals))
        
        if (balanceFormatted > 0) {
          const price = await this.getTokenPrice(token.contractAddress, chain)
          const value = balanceFormatted * price

          tokenBalances.push({
            contractAddress: token.contractAddress,
            symbol: token.symbol,
            name: token.name,
            decimals: Number(token.decimals),
            balance: token.balance,
            balanceFormatted,
            value,
            price,
            change24h: 0 // Would need additional API call for price changes
          })
        }
      }

      return tokenBalances.sort((a, b) => b.value - a.value)
    } catch (error) {
      console.error(`Error getting token balances for ${address} on ${chain}:`, error)
      return []
    }
  }

  private async getTransactions(address: string, chain: ChainKey, limit: number = 20): Promise<Transaction[]> {
    try {
      const chainConfig = getChainConfig(chain)
      if (!chainConfig.apiKey) {
        console.warn(`No API key configured for ${chain}`)
        return []
      }

      let apiUrl = ''
      if (chain === 'ethereum') {
        apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${chainConfig.apiKey}`
      } else if (chain === 'bsc') {
        apiUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${chainConfig.apiKey}`
      } else if (chain === 'polygon') {
        apiUrl = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${chainConfig.apiKey}`
      } else {
        return []
      }

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.status !== '1' || !data.result) {
        return []
      }

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        valueFormatted: Number(tx.value) / Math.pow(10, 18),
        gasPrice: tx.gasPrice,
        gasUsed: tx.gasUsed,
        gasLimit: tx.gas,
        timestamp: Number(tx.timeStamp) * 1000,
        blockNumber: Number(tx.blockNumber),
        type: 'native' as const,
        status: tx.txreceipt_status === '1' ? 'success' as const : 'failed' as const
      }))
    } catch (error) {
      console.error(`Error getting transactions for ${address} on ${chain}:`, error)
      return []
    }
  }

  private async getTransactionCount(address: string, chain: ChainKey): Promise<number> {
    try {
      const chainConfig = getChainConfig(chain)
      
      const response = await fetch(chainConfig.rpcUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
          id: 1
        })
      })

      const data = await response.json()
      return parseInt(data.result, 16)
    } catch (error) {
      console.error(`Error getting transaction count for ${address} on ${chain}:`, error)
      return 0
    }
  }

  private async getNativeTokenPrice(chain: ChainKey): Promise<number> {
    const cacheKey = this.getCacheKey('nativePrice', chain)
    const cached = this.getFromCache<number>(cacheKey)
    if (cached) return cached

    try {
      let coinId = ''
      switch (chain) {
        case 'ethereum':
        case 'arbitrum':
        case 'optimism':
          coinId = 'ethereum'
          break
        case 'bsc':
          coinId = 'binancecoin'
          break
        case 'polygon':
          coinId = 'matic-network'
          break
        default:
          return 0
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      )
      const data = await response.json()
      const price = data[coinId]?.usd || 0
      
      this.setCache(cacheKey, price)
      return price
    } catch (error) {
      console.error(`Error getting native token price for ${chain}:`, error)
      return 0
    }
  }

  private async getTokenPrice(contractAddress: string, chain: ChainKey): Promise<number> {
    const cacheKey = this.getCacheKey('tokenPrice', contractAddress, chain)
    const cached = this.getFromCache<number>(cacheKey)
    if (cached) return cached

    try {
      let platform = ''
      switch (chain) {
        case 'ethereum':
          platform = 'ethereum'
          break
        case 'bsc':
          platform = 'binance-smart-chain'
          break
        case 'polygon':
          platform = 'polygon-pos'
          break
        case 'arbitrum':
          platform = 'arbitrum-one'
          break
        case 'optimism':
          platform = 'optimistic-ethereum'
          break
        default:
          return 0
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd`
      )
      const data = await response.json()
      const price = data[contractAddress.toLowerCase()]?.usd || 0
      
      this.setCache(cacheKey, price)
      return price
    } catch (error) {
      console.error(`Error getting token price for ${contractAddress} on ${chain}:`, error)
      return 0
    }
  }

  async searchWallet(address: string): Promise<WalletInfo[]> {
    if (!this.isValidAddress(address)) {
      throw new Error('Invalid wallet address')
    }

    try {
      // Get wallet info from all supported chains in parallel
      const chainKeys = Object.keys(SUPPORTED_CHAINS) as ChainKey[]
      const walletPromises = chainKeys.map(chain => 
        this.getWalletInfo(address, chain).catch(error => {
          console.warn(`Failed to fetch ${chain} data for ${address}:`, error)
          return null
        })
      )

      const results = await Promise.all(walletPromises)
      return results.filter((wallet): wallet is WalletInfo => 
        wallet !== null && wallet.totalValue > 0
      )
    } catch (error) {
      console.error(`Error searching wallet ${address}:`, error)
      throw error
    }
  }

  private isValidAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  async getMultiChainSummary(address: string): Promise<{
    totalValue: number
    chainCount: number
    topChains: Array<{ chain: ChainKey; value: number; percentage: number }>
  }> {
    try {
      const walletInfos = await this.searchWallet(address)
      const totalValue = walletInfos.reduce((sum, wallet) => sum + wallet.totalValue, 0)
      const chainCount = walletInfos.length

      const chainValues = walletInfos.map(wallet => ({
        chain: wallet.chain,
        value: wallet.totalValue,
        percentage: totalValue > 0 ? (wallet.totalValue / totalValue) * 100 : 0
      })).sort((a, b) => b.value - a.value)

      return {
        totalValue,
        chainCount,
        topChains: chainValues.slice(0, 5)
      }
    } catch (error) {
      console.error(`Error getting multi-chain summary for ${address}:`, error)
      throw error
    }
  }
}
