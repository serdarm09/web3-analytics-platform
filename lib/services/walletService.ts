import axios from 'axios'
import { ethers } from 'ethers'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // 5 minutes cache

interface TokenBalance {
  symbol: string
  name: string
  address: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
  logo?: string
}

interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap' | 'contract'
  token: string
  tokenAddress: string
  amount: number
  value: number
  from: string
  to: string
  timestamp: Date
  txHash: string
  gasUsed: number
  status: 'success' | 'failed' | 'pending'
}

interface WalletData {
  address: string
  ens?: string
  totalValue: number
  totalChange24h: number
  transactionCount: number
  firstSeen: Date
  lastActive: Date
  isContract: boolean
  tags: string[]
  holdings: TokenBalance[]
  recentTransactions: Transaction[]
  profitLoss: number
  realizedPnL: number
  unrealizedPnL: number
  chain: string
}

class WalletService {
  private providers = {
    ethereum: new ethers.JsonRpcProvider('https://eth-mainnet.public.blastapi.io'),
    bsc: new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/'),
    polygon: new ethers.JsonRpcProvider('https://polygon-rpc.com/'),
    arbitrum: new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')
  }

  private scannerApis = {
    ethereum: 'https://api.etherscan.io/api',
    bsc: 'https://api.bscscan.com/api',
    polygon: 'https://api.polygonscan.com/api',
    arbitrum: 'https://api.arbiscan.io/api'
  }

  private coingeckoAPI = 'https://api.coingecko.com/api/v3'
  private moralisAPI = 'https://deep-index.moralis.io/api/v2'
  private defiLlamaAPI = 'https://api.llama.fi'

  // Get wallet balance and token holdings
  async getWalletData(address: string, chain: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' = 'ethereum'): Promise<WalletData | null> {
    const cacheKey = `wallet_${address}_${chain}`
    const cached = cache.get<WalletData>(cacheKey)
    if (cached) return cached

    try {
      const provider = this.providers[chain]
      
      // Get native token balance
      const balance = await provider.getBalance(address)
      const balanceInNative = parseFloat(ethers.formatEther(balance))
      
      // Get native token price
      const nativeTokenPrice = await this.getNativeTokenPrice(chain)
      const nativeTokenValue = balanceInNative * nativeTokenPrice
      
      // Get transaction count
      const transactionCount = await provider.getTransactionCount(address)
      
      // Check if it's a contract
      const code = await provider.getCode(address)
      const isContract = code !== '0x'
      
      // Get ENS name (only for Ethereum)
      let ens = null
      if (chain === 'ethereum') {
        try {
          ens = await provider.lookupAddress(address)
        } catch (error) {
          // ENS lookup failed, continue without it
        }
      }
      
      // Get token balances
      const tokenBalances = await this.getTokenBalances(address, chain)
      
      // Get recent transactions
      const recentTransactions = await this.getRecentTransactions(address, chain)
      
      // Calculate holdings including native token
      const holdings: TokenBalance[] = [
        {
          symbol: this.getNativeTokenSymbol(chain),
          name: this.getNativeTokenName(chain),
          address: '0x0000000000000000000000000000000000000000',
          balance: balanceInNative,
          value: nativeTokenValue,
          price: nativeTokenPrice,
          change24h: await this.getNativeTokenChange24h(chain),
          allocation: 0, // Will be calculated later
          logo: this.getNativeTokenLogo(chain)
        },
        ...tokenBalances
      ]
      
      // Calculate total value and allocations
      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
      holdings.forEach(h => {
        h.allocation = totalValue > 0 ? (h.value / totalValue) * 100 : 0
      })
      
      // Calculate 24h change
      const totalChange24h = holdings.reduce((sum, h) => 
        sum + (h.value * (h.change24h / 100)), 0
      ) / totalValue * 100
      
      // Calculate P&L (simplified - in production, would track historical data)
      const profitLoss = totalValue * 0.15 // Mock 15% profit
      const realizedPnL = profitLoss * 0.3
      const unrealizedPnL = profitLoss * 0.7
      
      // Determine wallet tags
      const tags = this.determineWalletTags(totalValue, holdings, recentTransactions)
      
      const walletData: WalletData = {
        address,
        ens,
        totalValue,
        totalChange24h,
        transactionCount,
        firstSeen: await this.getFirstTransactionDate(address, chain),
        lastActive: recentTransactions[0]?.timestamp || new Date(),
        isContract,
        tags,
        holdings: holdings.filter(h => h.value > 0.01), // Filter dust
        recentTransactions,
        profitLoss,
        realizedPnL,
        unrealizedPnL,
        chain
      }
      
      cache.set(cacheKey, walletData)
      return walletData
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      return null
    }
  }

  // Get token balances using scanner API
  private async getTokenBalances(address: string, chain: string): Promise<TokenBalance[]> {
    const apiKey = this.getScannerApiKey(chain)
    if (!apiKey) return []

    try {
      // Get top token balances
      const response = await axios.get(this.scannerApis[chain as keyof typeof this.scannerApis], {
        params: {
          module: 'account',
          action: 'tokenlist',
          address,
          apikey: apiKey
        }
      })

      if (response.data.status !== '1') return []

      const tokens = response.data.result
      const tokenBalances: TokenBalance[] = []

      // Get token prices from CoinGecko
      const tokenAddresses = tokens.map((t: any) => t.contractAddress).slice(0, 20) // Limit to 20 tokens
      const prices = await this.getTokenPrices(tokenAddresses, chain)

      for (const token of tokens.slice(0, 20)) {
        const balance = parseFloat(ethers.formatUnits(token.balance, token.tokenDecimal || 18))
        const price = prices[token.contractAddress.toLowerCase()] || 0
        const value = balance * price

        if (value > 1) { // Filter tokens worth less than $1
          tokenBalances.push({
            symbol: token.tokenSymbol,
            name: token.tokenName,
            address: token.contractAddress,
            balance,
            value,
            price,
            change24h: Math.random() * 20 - 10, // Mock data - in production, get from price API
            allocation: 0,
            logo: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain}/assets/${token.contractAddress}/logo.png`
          })
        }
      }

      return tokenBalances.sort((a, b) => b.value - a.value)
    } catch (error) {
      console.error('Error fetching token balances:', error)
      return []
    }
  }

  // Get recent transactions
  private async getRecentTransactions(address: string, chain: string): Promise<Transaction[]> {
    const apiKey = this.getScannerApiKey(chain)
    if (!apiKey) return []

    try {
      const response = await axios.get(this.scannerApis[chain as keyof typeof this.scannerApis], {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 20,
          sort: 'desc',
          apikey: apiKey
        }
      })

      if (response.data.status !== '1') return []

      const transactions: Transaction[] = []
      const nativeTokenPrice = await this.getNativeTokenPrice(chain as any)

      for (const tx of response.data.result) {
        const value = parseFloat(ethers.formatEther(tx.value))
        const valueUSD = value * nativeTokenPrice
        const type = tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive'

        transactions.push({
          id: tx.hash,
          type,
          token: this.getNativeTokenSymbol(chain as any),
          tokenAddress: '0x0000000000000000000000000000000000000000',
          amount: value,
          value: valueUSD,
          from: tx.from,
          to: tx.to,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          txHash: tx.hash,
          gasUsed: parseInt(tx.gasUsed),
          status: tx.isError === '0' ? 'success' : 'failed'
        })
      }

      return transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  // Get token prices from CoinGecko
  private async getTokenPrices(addresses: string[], chain: string): Promise<Record<string, number>> {
    const platform = this.getCoingeckoPlatform(chain)
    if (!platform) return {}

    try {
      const addressList = addresses.join(',')
      const response = await axios.get(`${this.coingeckoAPI}/simple/token_price/${platform}`, {
        params: {
          contract_addresses: addressList,
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      })

      const prices: Record<string, number> = {}
      for (const [address, data] of Object.entries(response.data)) {
        prices[address.toLowerCase()] = (data as any).usd || 0
      }

      return prices
    } catch (error) {
      console.error('Error fetching token prices:', error)
      return {}
    }
  }

  // Get first transaction date
  private async getFirstTransactionDate(address: string, chain: string): Promise<Date> {
    const apiKey = this.getScannerApiKey(chain)
    if (!apiKey) return new Date()

    try {
      const response = await axios.get(this.scannerApis[chain as keyof typeof this.scannerApis], {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 1,
          sort: 'asc',
          apikey: apiKey
        }
      })

      if (response.data.status === '1' && response.data.result.length > 0) {
        return new Date(parseInt(response.data.result[0].timeStamp) * 1000)
      }

      return new Date()
    } catch (error) {
      console.error('Error fetching first transaction:', error)
      return new Date()
    }
  }

  // Helper methods
  private getNativeTokenSymbol(chain: string): string {
    const symbols: Record<string, string> = {
      ethereum: 'ETH',
      bsc: 'BNB',
      polygon: 'MATIC',
      arbitrum: 'ETH'
    }
    return symbols[chain] || 'ETH'
  }

  private getNativeTokenName(chain: string): string {
    const names: Record<string, string> = {
      ethereum: 'Ethereum',
      bsc: 'BNB',
      polygon: 'Polygon',
      arbitrum: 'Ethereum'
    }
    return names[chain] || 'Ethereum'
  }

  private getNativeTokenLogo(chain: string): string {
    const logos: Record<string, string> = {
      ethereum: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      bsc: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      polygon: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      arbitrum: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
    }
    return logos[chain] || ''
  }

  private async getNativeTokenPrice(chain: string): Promise<number> {
    const cacheKey = `price_${chain}`
    const cached = cache.get<number>(cacheKey)
    if (cached) return cached

    try {
      const tokenIds: Record<string, string> = {
        ethereum: 'ethereum',
        bsc: 'binancecoin',
        polygon: 'matic-network',
        arbitrum: 'ethereum'
      }

      const response = await axios.get(`${this.coingeckoAPI}/simple/price`, {
        params: {
          ids: tokenIds[chain],
          vs_currencies: 'usd'
        }
      })

      const price = response.data[tokenIds[chain]]?.usd || 0
      cache.set(cacheKey, price)
      return price
    } catch (error) {
      console.error('Error fetching native token price:', error)
      return 0
    }
  }

  private async getNativeTokenChange24h(chain: string): Promise<number> {
    try {
      const tokenIds: Record<string, string> = {
        ethereum: 'ethereum',
        bsc: 'binancecoin',
        polygon: 'matic-network',
        arbitrum: 'ethereum'
      }

      const response = await axios.get(`${this.coingeckoAPI}/simple/price`, {
        params: {
          ids: tokenIds[chain],
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      })

      return response.data[tokenIds[chain]]?.usd_24h_change || 0
    } catch (error) {
      console.error('Error fetching native token change:', error)
      return 0
    }
  }

  private getScannerApiKey(chain: string): string | undefined {
    const apiKeys: Record<string, string | undefined> = {
      ethereum: process.env.ETHERSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      arbitrum: process.env.ARBISCAN_API_KEY
    }
    return apiKeys[chain]
  }

  private getCoingeckoPlatform(chain: string): string | null {
    const platforms: Record<string, string> = {
      ethereum: 'ethereum',
      bsc: 'binance-smart-chain',
      polygon: 'polygon-pos',
      arbitrum: 'arbitrum-one'
    }
    return platforms[chain] || null
  }

  private determineWalletTags(totalValue: number, holdings: TokenBalance[], transactions: Transaction[]): string[] {
    const tags: string[] = []

    // Value-based tags
    if (totalValue >= 10000000) tags.push('Mega Whale')
    else if (totalValue >= 1000000) tags.push('Whale')
    else if (totalValue >= 100000) tags.push('Dolphin')
    else if (totalValue >= 10000) tags.push('Fish')
    else tags.push('Shrimp')

    // Activity-based tags
    if (transactions.length > 1000) tags.push('High Activity')
    else if (transactions.length > 100) tags.push('Active Trader')

    // Portfolio-based tags
    if (holdings.length > 20) tags.push('Diversified')
    if (holdings.some(h => h.symbol.includes('UNI') || h.symbol.includes('SUSHI'))) tags.push('DeFi User')
    if (holdings.some(h => h.symbol.includes('NFT'))) tags.push('NFT Collector')

    return tags
  }
}

export const walletService = new WalletService()