import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const portfolios = await Portfolio.find({ userId: authResult.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(portfolios)
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
    const { name, description } = body

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

    const portfolio = await Portfolio.create({
      userId: authResult.userId,
      name,
      description,
      assets: [],
      totalValue: 0,
      totalCost: 0,
      totalProfitLoss: 0,
      totalProfitLossPercentage: 0
    })

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}