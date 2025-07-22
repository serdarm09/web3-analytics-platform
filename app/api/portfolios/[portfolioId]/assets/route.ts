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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { portfolioId } = await params
    const body = await request.json()
    const { symbol, amount, purchasePrice, purchaseDate, projectId } = body

    if (!symbol || !amount || !purchasePrice) {
      return NextResponse.json(
        { error: 'Symbol, amount, and purchase price are required' },
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
          description: `Custom entry for ${symbol.toUpperCase()}`,
          category: 'DeFi',
          chain: 'ethereum',
          status: 'active',
          isVerified: false,
          marketCap: 0,
          price: parseFloat(purchasePrice),
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

    // Create new asset
    const newAsset = {
      projectId: new Types.ObjectId(validProjectId),
      symbol: symbol.toUpperCase(),
      amount: parseFloat(amount),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      currentPrice: parseFloat(purchasePrice), // Will be updated with market data
      currentValue: parseFloat(amount) * parseFloat(purchasePrice),
      profitLoss: 0,
      profitLossPercentage: 0
    }

    portfolio.assets.push(newAsset)

    // Recalculate portfolio metrics
    portfolio.calculateMetrics()
    await portfolio.save()

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Error adding asset to portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to add asset to portfolio' },
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