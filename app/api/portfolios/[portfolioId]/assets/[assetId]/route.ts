import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import { verifyAuth } from '@/lib/auth/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string; assetId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 })
    }

    const resolvedParams = await params
    const { portfolioId, assetId } = resolvedParams
    
    if (!portfolioId || !assetId) {
      return NextResponse.json(
        { error: 'Portfolio ID and Asset ID are required' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string; assetId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 })
    }

    const resolvedParams = await params
    const { portfolioId, assetId } = resolvedParams
    
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

    // Recalculate portfolio metrics
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
    console.error('Error removing asset:', error)
    return NextResponse.json(
      { error: 'Failed to remove asset' },
      { status: 500 }
    )
  }
}
