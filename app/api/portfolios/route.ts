import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'

// Get current crypto prices using the market-data API with dynamic ID resolution
async function getCryptoPrices(symbols: string[]) {
  try {
    if (symbols.length === 0) return {}
    
    // Use the existing market-data endpoint which now has dynamic search
    const symbolsString = symbols.join(',')
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/crypto/market-data?symbols=${symbolsString}`)
    
    if (!response.ok) {
      console.error('Failed to fetch market data:', response.status)
      return {}
    }
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('Market data API error:', data.error)
      return {}
    }
    
    // Convert new API format to compatible format
    const priceMap: Record<string, any> = {}
    data.data.forEach((coin: any) => {
      priceMap[coin.symbol.toLowerCase()] = {
        usd: coin.price,
        usd_24h_change: coin.change24h
      }
    })
    
    return priceMap
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return {}
  }
}

// Update portfolio with current market prices
async function updatePortfolioMetrics(portfolio: any) {
  if (!portfolio.assets || portfolio.assets.length === 0) {
    const updateData = {
      totalValue: 0,
      totalCost: 0,
      totalProfitLoss: 0,
      totalProfitLossPercentage: 0,
      lastUpdated: new Date()
    }
    
    // Update in database
    await Portfolio.findByIdAndUpdate(portfolio._id, updateData)
    
    // Update local object
    Object.assign(portfolio, updateData)
    return portfolio
  }

  // Get unique symbols from portfolio assets
  const symbols = portfolio.assets.map((asset: any) => asset.symbol.toLowerCase())
  const prices = await getCryptoPrices(symbols)

  let totalValue = 0
  let totalCost = 0

  // Update each asset with current prices
  const updatedAssets = portfolio.assets.map((asset: any) => {
    const symbolLower = asset.symbol.toLowerCase()
    const priceData = prices[symbolLower]
    const currentPrice = priceData?.usd || asset.purchasePrice // Fallback to purchase price
    const change24h = priceData?.usd_24h_change || 0
    
    const currentValue = asset.amount * currentPrice
    const cost = asset.amount * asset.purchasePrice
    const profitLoss = currentValue - cost
    
    totalCost += cost
    totalValue += currentValue
    

    
    return {
      ...asset,
      currentPrice,
      currentValue,
      change24h,
      profitLoss,
      profitLossPercentage: cost > 0 ? (profitLoss / cost) * 100 : 0
    }
  })

  const totalProfitLoss = totalValue - totalCost
  const totalProfitLossPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
  
  const updateData = {
    assets: updatedAssets,
    totalValue,
    totalCost,
    totalProfitLoss,
    totalProfitLossPercentage,
    lastUpdated: new Date()
  }

  // Update in database
  await Portfolio.findByIdAndUpdate(portfolio._id, updateData)

  // Update local object
  Object.assign(portfolio, updateData)

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

    // Transform portfolios to include id field for frontend compatibility
    const transformedPortfolios = updatedPortfolios.map(portfolio => ({
      ...portfolio,
      id: portfolio._id.toString(),
      assets: portfolio.assets.map((asset: any) => ({
        ...asset,
        _id: asset._id?.toString() || undefined
      }))
    }))

    return NextResponse.json(transformedPortfolios)
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
