import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'
import axios from 'axios'

// Get current crypto prices from CoinGecko
async function getCryptoPrices(symbols: string[]) {
  try {
    const symbolsString = symbols.join(',')
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsString}&vs_currencies=usd&include_24hr_change=true`
    )
    return response.data
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

  let totalValue = 0
  let totalCost = 0

  // Update each asset with current prices
  portfolio.assets.forEach((asset: any) => {
    const symbolLower = asset.symbol.toLowerCase()
    const currentPrice = prices[symbolLower]?.usd || asset.purchasePrice // Fallback to purchase price
    
    asset.currentPrice = currentPrice
    asset.currentValue = asset.amount * currentPrice
    
    const cost = asset.amount * asset.purchasePrice
    const profitLoss = asset.currentValue - cost
    
    asset.profitLoss = profitLoss
    asset.profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0
    
    totalCost += cost
    totalValue += asset.currentValue
  })

  portfolio.totalValue = totalValue
  portfolio.totalCost = totalCost
  portfolio.totalProfitLoss = totalValue - totalCost
  portfolio.totalProfitLossPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
  portfolio.lastUpdated = new Date()

  return portfolio
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

    await dbConnect()

    const { portfolioId } = await params

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: authResult.userId
    })
      .populate('assets.projectId', 'name symbol logo')
      .lean()

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Update with current market data
    const updatedPortfolio = await updatePortfolioMetrics(portfolio)

    return NextResponse.json(updatedPortfolio)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    await dbConnect()

    const { portfolioId } = await params

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: portfolioId, userId: authResult.userId },
      { 
        $set: { 
          ...(name && { name }),
          ...(description !== undefined && { description }),
          lastUpdated: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
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

    await dbConnect()

    const { portfolioId } = await params

    const portfolio = await Portfolio.findOneAndDelete({
      _id: portfolioId,
      userId: authResult.userId
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Portfolio deleted successfully' })
  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    )
  }
}