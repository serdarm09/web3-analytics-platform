import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'
import { Types } from 'mongoose'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      console.error('Auth failed in portfolio assets POST:', authResult)
      return NextResponse.json({ error: 'Authentication failed. Please login again.' }, { status: 401 })
    }

    const resolvedParams = await params
    const portfolioId = resolvedParams.portfolioId
    console.log('POST /api/portfolios/[portfolioId]/assets - portfolioId:', portfolioId)
    console.log('userId:', authResult.userId)
    
    if (!portfolioId || portfolioId === 'undefined') {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { symbol, amount, purchasePrice, purchaseDate, projectId } = body
    console.log('Request body:', { symbol, amount, purchasePrice, purchaseDate })

    if (!symbol || !amount || !purchasePrice) {
      return NextResponse.json(
        { error: 'Sembol, miktar ve alış fiyatı zorunludur' },
        { status: 400 }
      )
    }

    await dbConnect()

    console.log('Looking for portfolio with:', {
      _id: portfolioId,
      userId: authResult.userId
    })

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: authResult.userId
    })

    console.log('Found portfolio:', portfolio ? 'YES' : 'NO')

    if (!portfolio) {
      console.error('Portfolio not found:', {
        portfolioId,
        userId: authResult.userId
      })
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Handle project ID - find or create project
    let validProjectId = projectId
    if (!projectId) {
      // Try to find existing project by symbol
      let project = await Project.findOne({ symbol: symbol.toUpperCase() })
      if (!project) {
        // Create a new project entry for unknown tokens
        project = await Project.create({
          name: symbol.toUpperCase(),
          symbol: symbol.toUpperCase(),
          logo: 'https://via.placeholder.com/32x32/cccccc/666666?text=' + symbol.charAt(0).toUpperCase(),
          description: `Custom entry for ${symbol.toUpperCase()}`,
          category: 'DeFi',
          website: 'https://serdar.com',
          blockchain: 'Ethereum',
          status: 'active',
          isVerified: false,
          marketData: {
            price: parseFloat(purchasePrice),
            marketCap: 0,
            volume24h: 0,
            change24h: 0,
            change7d: 0,
            circulatingSupply: 0,
            totalSupply: 0
          },
          metrics: {
            starRating: 0,
            holders: 0
          },
          views: 0,
          socialStats: {
            twitterFollowers: 0,
            discordMembers: 0,
            telegramMembers: 0
          }
        })
      }
      validProjectId = project._id
    }

    // Create new asset
    const parsedAmount = parseFloat(amount)
    const parsedPrice = parseFloat(purchasePrice)
    
    const newAsset = {
      projectId: new Types.ObjectId(validProjectId),
      symbol: symbol.toUpperCase(),
      amount: parsedAmount,
      purchasePrice: parsedPrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      currentPrice: parsedPrice, // Will be updated with market data
      currentValue: parsedAmount * parsedPrice,
      profitLoss: 0,
      profitLossPercentage: 0
    }

    portfolio.assets.push(newAsset)

    // Recalculate portfolio metrics
    portfolio.calculateMetrics()
    await portfolio.save()

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error: any) {
    console.error('Error adding asset to portfolio:', error)
    
    // MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This asset already exists in your portfolio' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while adding asset to portfolio' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { portfolioId } = await params

    await dbConnect()

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: authResult.userId
    })
      .populate('assets.projectId', 'name symbol logo')
      .lean()

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    return NextResponse.json(portfolio.assets)
  } catch (error) {
    console.error('Error fetching portfolio assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio assets' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { portfolioId } = await params
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    await dbConnect()

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: authResult.userId
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Find and remove the asset
    const assetIndex = portfolio.assets.findIndex((asset: any) => asset._id.toString() === assetId)
    if (assetIndex === -1) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    portfolio.assets.splice(assetIndex, 1)

    // Recalculate portfolio metrics manually
    let totalValue = 0
    let totalCost = 0

    portfolio.assets.forEach((asset: any) => {
      const cost = asset.amount * asset.purchasePrice
      const value = asset.currentValue || cost
      
      totalCost += cost
      totalValue += value
    })

    portfolio.totalValue = totalValue
    portfolio.totalCost = totalCost
    portfolio.totalProfitLoss = totalValue - totalCost
    portfolio.totalProfitLossPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    portfolio.lastUpdated = new Date()

    await portfolio.save()

    return NextResponse.json({ message: 'Asset removed successfully' })
  } catch (error) {
    console.error('Error removing asset from portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to remove asset from portfolio' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Authentication failed. Please login again.' }, { status: 401 })
    }

    const resolvedParams = await params
    const portfolioId = resolvedParams.portfolioId
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    
    if (!portfolioId || portfolioId === 'undefined') {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { symbol, amount, purchasePrice, purchaseDate } = body

    if (!symbol || !amount || !purchasePrice) {
      return NextResponse.json(
        { error: 'Symbol, amount and purchase price are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: authResult.userId
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Find the asset to update
    const assetIndex = portfolio.assets.findIndex((asset: any) => asset._id.toString() === assetId)
    if (assetIndex === -1) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Update asset properties
    portfolio.assets[assetIndex].symbol = symbol.toUpperCase()
    portfolio.assets[assetIndex].amount = parseFloat(amount)
    portfolio.assets[assetIndex].purchasePrice = parseFloat(purchasePrice)
    if (purchaseDate) {
      portfolio.assets[assetIndex].purchaseDate = new Date(purchaseDate)
    }

    // Recalculate current value and P&L based on current price if available
    const asset = portfolio.assets[assetIndex]
    const currentPrice = asset.currentPrice || asset.purchasePrice
    asset.currentValue = asset.amount * currentPrice
    
    const cost = asset.amount * asset.purchasePrice
    asset.profitLoss = asset.currentValue - cost
    asset.profitLossPercentage = cost > 0 ? (asset.profitLoss / cost) * 100 : 0

    // Recalculate portfolio totals
    let totalValue = 0
    let totalCost = 0

    portfolio.assets.forEach((asset: any) => {
      const assetCost = asset.amount * asset.purchasePrice
      const assetValue = asset.currentValue || assetCost
      
      totalCost += assetCost
      totalValue += assetValue
    })

    portfolio.totalValue = totalValue
    portfolio.totalCost = totalCost
    portfolio.totalProfitLoss = totalValue - totalCost
    portfolio.totalProfitLossPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    portfolio.lastUpdated = new Date()

    await portfolio.save()

    return NextResponse.json({ 
      message: 'Asset updated successfully',
      asset: portfolio.assets[assetIndex]
    })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}