import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'
import axios from 'axios'

// Symbol to CoinGecko ID mapping
const symbolToCoinGeckoId: Record<string, string> = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'xrp': 'ripple',
  'ada': 'cardano',
  'avax': 'avalanche-2',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'matic': 'matic-network',
  'shib': 'shiba-inu',
  'trx': 'tron',
  'link': 'chainlink',
  'uni': 'uniswap',
  'atom': 'cosmos',
  'ltc': 'litecoin',
  'etc': 'ethereum-classic',
  'xlm': 'stellar',
  'near': 'near',
  'algo': 'algorand',
  'usdt': 'tether',
  'usdc': 'usd-coin',
  'dai': 'dai',
  'busd': 'binance-usd'
}

// Get current crypto prices from CoinGecko
async function getCryptoPrices(symbols: string[]) {
  try {
    // Map symbols to CoinGecko IDs
    const coinIds = symbols.map(symbol => {
      const id = symbolToCoinGeckoId[symbol.toLowerCase()]
      return id || symbol.toLowerCase()
    })
    
    const uniqueIds = [...new Set(coinIds)]
    const idsString = uniqueIds.join(',')
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true`
    )
    
    // Map the response back to symbols
    const priceData: Record<string, any> = {}
    symbols.forEach(symbol => {
      const coinId = symbolToCoinGeckoId[symbol.toLowerCase()] || symbol.toLowerCase()
      if (response.data[coinId]) {
        priceData[symbol.toLowerCase()] = response.data[coinId]
      }
    })
    
    return priceData
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return {}
  }
}

// Update portfolio with current market prices
async function updatePortfolioMetrics(portfolio: any) {
  if (!portfolio.assets || portfolio.assets.length === 0) {
    portfolio.totalValue = 0
    portfolio.totalCost = 0
    portfolio.totalProfitLoss = 0
    portfolio.totalProfitLossPercentage = 0
    return portfolio
  }

  // Get unique symbols from portfolio assets
  const symbols = portfolio.assets.map((asset: any) => asset.symbol.toLowerCase())
  const prices = await getCryptoPrices(symbols)
  
  console.log('Fetched prices:', prices)

  let totalValue = 0
  let totalCost = 0

  // Update each asset with current prices
  portfolio.assets.forEach((asset: any) => {
    const symbolLower = asset.symbol.toLowerCase()
    const priceData = prices[symbolLower]
    const currentPrice = priceData?.usd || asset.purchasePrice // Fallback to purchase price
    const change24h = priceData?.usd_24h_change || 0
    
    asset.currentPrice = currentPrice
    asset.currentValue = asset.amount * currentPrice
    asset.change24h = change24h
    
    const cost = asset.amount * asset.purchasePrice
    const profitLoss = asset.currentValue - cost
    
    asset.profitLoss = profitLoss
    asset.profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0
    
    totalCost += cost
    totalValue += asset.currentValue
    
    console.log(`Asset ${asset.symbol}: Purchase Price: $${asset.purchasePrice}, Current Price: $${currentPrice}, P&L: $${profitLoss}`)
  })

  portfolio.totalValue = totalValue
  portfolio.totalCost = totalCost
  portfolio.totalProfitLoss = totalValue - totalCost
  portfolio.totalProfitLossPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
  portfolio.lastUpdated = new Date()

  return portfolio
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const portfolios = await Portfolio.find({ userId: authResult.userId })
      .populate('assets.projectId', 'name symbol logo')
      .sort({ createdAt: -1 })
      .lean()

    // Update all portfolios with current market data
    const updatedPortfolios = await Promise.all(
      portfolios.map(portfolio => updatePortfolioMetrics(portfolio))
    )

    return NextResponse.json(updatedPortfolios)
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, assets = [] } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Portfolio name is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const existingPortfolio = await Portfolio.findOne({
      userId: authResult.userId,
      name
    })

    if (existingPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio with this name already exists' },
        { status: 400 }
      )
    }

    // Process and validate assets if provided
    const processedAssets = []
    if (assets.length > 0) {
      for (const asset of assets) {
        const { symbol, amount, purchasePrice, purchaseDate, projectId } = asset

        if (!symbol || !amount || !purchasePrice) {
          return NextResponse.json(
            { error: 'Asset must have symbol, amount, and purchase price' },
            { status: 400 }
          )
        }

        // If projectId is provided, verify it exists
        let validProjectId = projectId
        if (!projectId) {
          // Try to find or create project by symbol
          let project = await Project.findOne({ symbol: symbol.toUpperCase() })
          if (!project) {
            // Create a new project entry for unknown tokens
            project = await Project.create({
              name: symbol.toUpperCase(),
              symbol: symbol.toUpperCase(),
              description: `Custom entry for ${symbol.toUpperCase()}`,
              category: 'DeFi',
              chain: 'ethereum',
              status: 'active',
              isVerified: false,
              marketCap: 0,
              price: purchasePrice,
              change24h: 0,
              volume24h: 0,
              socialStats: {
                twitterFollowers: 0,
                discordMembers: 0,
                telegramMembers: 0
              }
            })
          }
          validProjectId = project._id
        }

        processedAssets.push({
          projectId: validProjectId,
          symbol: symbol.toUpperCase(),
          amount: parseFloat(amount),
          purchasePrice: parseFloat(purchasePrice),
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          currentPrice: parseFloat(purchasePrice), // Will be updated with market data
          currentValue: parseFloat(amount) * parseFloat(purchasePrice),
          profitLoss: 0,
          profitLossPercentage: 0
        })
      }
    }

    const portfolio = await Portfolio.create({
      userId: authResult.userId,
      name,
      description,
      assets: processedAssets,
      totalValue: 0,
      totalCost: 0,
      totalProfitLoss: 0,
      totalProfitLossPercentage: 0
    })

    // Update with current market prices
    const updatedPortfolio = await updatePortfolioMetrics(portfolio)
    await portfolio.save()

    return NextResponse.json(updatedPortfolio, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}