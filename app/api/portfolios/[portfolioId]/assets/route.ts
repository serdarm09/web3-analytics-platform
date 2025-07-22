import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/database/mongoose'
import Portfolio from '@/models/Portfolio'
import { verifyAuth } from '@/lib/auth/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, name, amount, buyPrice } = body

    if (!symbol || !name || !amount || !buyPrice) {
      return NextResponse.json(
        { error: 'Symbol, name, amount and buyPrice are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const { portfolioId } = await params

    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: authResult.userId
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const existingAssetIndex = portfolio.assets.findIndex(
      (asset: any) => asset.symbol === symbol
    )

    if (existingAssetIndex !== -1) {
      const existingAsset = portfolio.assets[existingAssetIndex]
      const totalCost = (existingAsset.amount * existingAsset.purchasePrice) + (amount * buyPrice)
      const totalAmount = existingAsset.amount + amount
      
      portfolio.assets[existingAssetIndex] = {
        ...existingAsset,
        amount: totalAmount,
        purchasePrice: totalCost / totalAmount
      }
    } else {
      portfolio.assets.push({
        projectId: new mongoose.Types.ObjectId(),
        symbol,
        amount,
        purchasePrice: buyPrice,
        purchaseDate: new Date()
      })
    }

    portfolio.lastUpdated = new Date()
    await portfolio.save()

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error adding asset:', error)
    return NextResponse.json(
      { error: 'Failed to add asset' },
      { status: 500 }
    )
  }
}