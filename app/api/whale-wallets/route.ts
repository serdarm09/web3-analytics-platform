import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import WhaleWallet from '@/models/WhaleWallet'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') || 'ethereum'
    const limit = parseInt(searchParams.get('limit') || '50')

    await dbConnect()

    const whaleWallets = await WhaleWallet.find({ chain })
      .sort({ totalValueUSD: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(whaleWallets)
  } catch (error) {
    console.error('Error fetching whale wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch whale wallets' },
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
    const { address, label, chain } = body

    if (!address || !chain) {
      return NextResponse.json(
        { error: 'Address and chain are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const existingWallet = await WhaleWallet.findOne({ address, chain })
    
    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet already exists' },
        { status: 400 }
      )
    }

    const whaleWallet = await WhaleWallet.create({
      address,
      label: label || 'Unknown Whale',
      chain,
      holdings: [],
      totalValueUSD: 0,
      lastActive: new Date(),
      transactionCount: 0
    })

    return NextResponse.json(whaleWallet, { status: 201 })
  } catch (error) {
    console.error('Error creating whale wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create whale wallet' },
      { status: 500 }
    )
  }
}