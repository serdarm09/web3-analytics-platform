import axios from 'axios'
import { ethers } from 'ethers'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // 5 dakika cache

interface WhaleTransaction {
  hash: string
  from: string
  to: string
  value: string
  valueUSD: number
  tokenSymbol?: string
  tokenName?: string
  timestamp: Date
  blockNumber: number
  gasUsed?: string
  gasPrice?: string
  network: string
}

interface WhaleWallet {
  address: string
  balance: string
  balanceUSD: number
  network: string
  label?: string
  transactionCount: number
  lastActive: Date
}

interface TokenTransfer {
  from: string
  to: string
  value: string
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  tokenDecimal: number
  transactionHash: string
  timeStamp: string
  blockNumber: string
}

class WhaleTrackingService {
  private providers = {
    ethereum: new ethers.JsonRpcProvider('https://eth-mainnet.public.blastapi.io'),
    bsc: new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
  }

  private scannerApis = {
    ethereum: 'https://api.etherscan.io/api',
    bsc: 'https://api.bscscan.com/api',
    polygon: 'https://api.polygonscan.com/api',
    arbitrum: 'https://api.arbiscan.io/api'
  }

  private minWhaleValueUSD = {
    ethereum: 1000000, // $1M
    bsc: 500000,      // $500K
    polygon: 250000,  // $250K
    arbitrum: 500000  // $500K
  }

  // Bilinen whale adreslerini getir
  private knownWhales: Record<string, string> = {
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8': 'Binance 7',
    '0xF977814e90dA44bFA03b6295A0616a897441aceC': 'Binance 8',
    '0x28C6c06298d514Db089934071355E5743bf21d60': 'Binance 14',
    '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549': 'Binance 15',
    '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d': 'Binance 16',
    '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F': 'Binance 17',
    '0x9696f59E4d72E237BE84fFD425DCaD154Bf96976': 'Binance 18',
    '0x4976A4A02f38326660D17bf34b431dC6e2eb2327': 'Binance 19',
    '0xd24400ae8BfEBb18cA49Be86258a3C749cf46853': 'Gemini',
    '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b': 'OKEx',
    '0x236F233dBf78341d25BBd2fDdB6C301D1E7A1B42': 'Kucoin',
    '0x2B5634C42055806a59e9107ED44D43c426E58258': 'Kucoin 2',
    '0x689C56AEf474Df92D44A1B70850f808488F9769C': 'Kucoin 3',
    '0xA929022c9107643515F5c777cE9a910F0D1e490C': 'Huobi 1',
    '0x5C985E89DDe482eFE97ea9f1950aD149Eb73829B': 'Huobi 2',
    '0xDc76CD25977E0a5Ae17155770273aD58648900D3': 'Huobi 3',
    '0xAb5C66752a9e8167967685F1450532fB96d5d24f': 'Huobi 4',
    '0xE93381fB4c4F14bDa253907b18faD305D799241a': 'Huobi 5',
    '0xFA4B5Be3f2f84f56703C42eB22142744E95a2c58': 'Huobi 6',
    '0x46340b20830761efd32832A74d7169B29FEB9758': 'Crypto.com'
  }

  // Son büyük transferleri getir
  async getRecentWhaleTransactions(network: 'ethereum' | 'bsc' = 'ethereum', limit: number = 20): Promise<WhaleTransaction[]> {
    const cacheKey = `whale_txs_${network}_${limit}`
    const cached = cache.get<WhaleTransaction[]>(cacheKey)
    if (cached) return cached

    try {
      const provider = this.providers[network]
      const currentBlock = await provider.getBlockNumber()
      const transactions: WhaleTransaction[] = []

      // Son 10 bloğu kontrol et
      for (let i = 0; i < 10; i++) {
        const block = await provider.getBlock(currentBlock - i, true)
        if (!block || !block.transactions) continue

        for (const tx of block.transactions) {
          if (typeof tx === 'string') continue
          
          const value = ethers.formatEther((tx as any).value)
          const valueNum = parseFloat(value)
          
          // ETH fiyatını tahmin et (gerçek uygulamada API'den alınmalı)
          const ethPrice = network === 'ethereum' ? 2500 : 300 // ETH vs BNB tahmini fiyat
          const valueUSD = valueNum * ethPrice

          if (valueUSD >= this.minWhaleValueUSD[network]) {
            const fromLabel = this.knownWhales[(tx as any).from] || null
            const toLabel = this.knownWhales[(tx as any).to || ''] || null

            transactions.push({
              hash: (tx as any).hash,
              from: (tx as any).from,
              to: (tx as any).to || '',
              value: value,
              valueUSD: valueUSD,
              tokenSymbol: network === 'ethereum' ? 'ETH' : 'BNB',
              timestamp: new Date(block.timestamp * 1000),
              blockNumber: block.number,
              network: network
            })

            if (transactions.length >= limit) break
          }
        }

        if (transactions.length >= limit) break
      }

      cache.set(cacheKey, transactions)
      return transactions.slice(0, limit)
    } catch (error) {
      console.error('Error fetching whale transactions:', error)
      return []
    }
  }

  // Token transferlerini getir (ERC20)
  async getTokenWhaleTransfers(network: 'ethereum' | 'bsc' = 'ethereum', limit: number = 20): Promise<WhaleTransaction[]> {
    const apiKey = network === 'ethereum' ? process.env.ETHERSCAN_API_KEY : process.env.BSCSCAN_API_KEY
    if (!apiKey) {
      console.warn(`No API key for ${network}scan`)
      return []
    }

    const cacheKey = `whale_token_transfers_${network}_${limit}`
    const cached = cache.get<WhaleTransaction[]>(cacheKey)
    if (cached) return cached

    try {
      // USDT contract adresi
      const usdtContract = network === 'ethereum' 
        ? '0xdac17f958d2ee523a2206206994597c13d831ec7'
        : '0x55d398326f99059ff775485246999027b3197955'

      const response = await axios.get(this.scannerApis[network], {
        params: {
          module: 'account',
          action: 'tokentx',
          contractaddress: usdtContract,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: apiKey
        }
      })

      if (response.data.status !== '1') return []

      const transfers: WhaleTransaction[] = []
      const tokenPrice = 1 // USDT = $1

      for (const tx of response.data.result) {
        const value = parseFloat(ethers.formatUnits(tx.value, tx.tokenDecimal))
        const valueUSD = value * tokenPrice

        if (valueUSD >= this.minWhaleValueUSD[network]) {
          transfers.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: value.toString(),
            valueUSD: valueUSD,
            tokenSymbol: tx.tokenSymbol,
            tokenName: tx.tokenName,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000),
            blockNumber: parseInt(tx.blockNumber),
            network: network
          })

          if (transfers.length >= limit) break
        }
      }

      cache.set(cacheKey, transfers)
      return transfers
    } catch (error) {
      console.error('Error fetching token whale transfers:', error)
      return []
    }
  }

  // En büyük cüzdanları getir
  async getTopWhaleWallets(network: 'ethereum' | 'bsc' = 'ethereum', limit: number = 10): Promise<WhaleWallet[]> {
    const cacheKey = `top_whales_${network}_${limit}`
    const cached = cache.get<WhaleWallet[]>(cacheKey)
    if (cached) return cached

    try {
      const provider = this.providers[network]
      const whales: WhaleWallet[] = []

      // Bilinen whale adreslerini kontrol et
      const addressesToCheck = Object.keys(this.knownWhales).slice(0, limit * 2)
      
      for (const address of addressesToCheck) {
        try {
          const balance = await provider.getBalance(address)
          const balanceETH = ethers.formatEther(balance)
          const ethPrice = network === 'ethereum' ? 2500 : 300
          const balanceUSD = parseFloat(balanceETH) * ethPrice

          if (balanceUSD >= 1000000) { // $1M minimum
            const txCount = await provider.getTransactionCount(address)
            
            whales.push({
              address: address,
              balance: balanceETH,
              balanceUSD: balanceUSD,
              network: network,
              label: this.knownWhales[address],
              transactionCount: txCount,
              lastActive: new Date() // Gerçek uygulamada son işlem zamanı alınmalı
            })
          }
        } catch (error) {
          console.error(`Error checking whale ${address}:`, error)
        }
      }

      // Bakiyeye göre sırala
      whales.sort((a, b) => b.balanceUSD - a.balanceUSD)
      const topWhales = whales.slice(0, limit)

      cache.set(cacheKey, topWhales)
      return topWhales
    } catch (error) {
      console.error('Error fetching top whale wallets:', error)
      return []
    }
  }


  // Whale alert oluştur
  async checkForWhaleAlerts(minValueUSD: number = 5000000): Promise<WhaleTransaction[]> {
    const alerts: WhaleTransaction[] = []
    
    try {
      // Ethereum ve BSC'den son transferleri al
      const [ethTransfers, bscTransfers] = await Promise.all([
        this.getRecentWhaleTransactions('ethereum', 50),
        this.getRecentWhaleTransactions('bsc', 50)
      ])

      // Büyük transferleri filtrele
      const allTransfers = [...ethTransfers, ...bscTransfers]
      
      for (const tx of allTransfers) {
        if (tx.valueUSD >= minValueUSD) {
          alerts.push(tx)
        }
      }

      return alerts.sort((a, b) => b.valueUSD - a.valueUSD)
    } catch (error) {
      console.error('Error checking whale alerts:', error)
      return []
    }
  }

  // Get wallet details including holdings and transactions
  async getWalletDetails(address: string, network: 'ethereum' | 'bsc' = 'ethereum') {
    const cacheKey = `wallet_details_${address}_${network}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const provider = this.providers[network]
      
      // Get ETH balance
      const balance = await provider.getBalance(address)
      const ethPrice = 2456.78 // In production, fetch from price API
      const balanceInEth = parseFloat(ethers.formatEther(balance))
      const balanceUSD = balanceInEth * ethPrice

      // Get transaction count
      const transactionCount = await provider.getTransactionCount(address)

      // Check if ENS name exists
      let ens = null
      if (network === 'ethereum') {
        try {
          ens = await provider.lookupAddress(address)
        } catch (error) {
          // ENS lookup failed, continue without it
        }
      }

      // Get recent transactions
      const currentBlock = await provider.getBlockNumber()
      const recentTransactions: any[] = []
      
      // Mock data for holdings (in production, fetch from token balance APIs)
      const holdings = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          address: '0x0000000000000000000000000000000000000000',
          balance: balanceInEth,
          value: balanceUSD,
          price: ethPrice,
          change24h: -2.15,
          allocation: 100
        }
      ]

      // Calculate total value and P&L (mock data)
      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
      const totalChange24h = -2.15 // Mock 24h change
      const profitLoss = totalValue * 0.25 // Mock 25% profit
      const realizedPnL = profitLoss * 0.4
      const unrealizedPnL = profitLoss * 0.6

      const walletData = {
        address,
        ens,
        totalValue,
        totalChange24h,
        transactionCount,
        firstSeen: new Date('2020-01-01'), // Mock data
        lastActive: new Date(),
        isContract: false,
        tags: ['DeFi User', 'Early Adopter'],
        holdings,
        recentTransactions,
        profitLoss,
        realizedPnL,
        unrealizedPnL
      }

      cache.set(cacheKey, walletData)
      return walletData
    } catch (error) {
      console.error('Error fetching wallet details:', error)
      return null
    }
  }
}

export const whaleTrackingService = new WhaleTrackingService()