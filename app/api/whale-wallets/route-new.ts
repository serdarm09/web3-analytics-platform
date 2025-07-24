import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import TrackedWallet from '@/models/TrackedWallet'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network') // 'ethereum' or 'solana'
    const limit = parseInt(searchParams.get('limit') || '50')

    await dbConnect()

    const query = network ? { network } : {}
    // Get all tracked wallets with high portfolio value (whale wallets)
    const whaleWallets = await TrackedWallet.find({
      ...query,
      totalValueUSD: { $gte: 1000000 } // Consider wallets with $1M+ as whale wallets
    })
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
    const { 
      address, 
      label, 
      network, 
      balance, 
      balanceUSD, 
      assets, 
      transactions, 
      portfolioValue, 
      portfolioChange24h 
    } = body

    if (!address || !network) {
      return NextResponse.json(
        { error: 'Address and network are required' },
        { status: 400 }
      )
    }

    // Check if network is supported
    if (!['ethereum', 'solana'].includes(network)) {
      return NextResponse.json(
        { error: 'Unsupported network. Only ethereum and solana are supported' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if wallet already exists
    const existingWallet = await TrackedWallet.findOne({ address, network })
    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet is already being tracked' },
        { status: 409 }
      )
    }

    const newWallet = new TrackedWallet({
      userId: authResult.userId,
      address,
      label: label || `${network} Wallet`,
      network,
      nativeBalance: balance?.toString() || '0',
      nativeBalanceUSD: balanceUSD || 0,
      totalValueUSD: portfolioValue || balanceUSD || 0,
      assets: assets || [],
      transactions: transactions || [],
      isOwned: false,
      tags: ['whale'],
      lastSynced: new Date()
    })

    await newWallet.save()

    return NextResponse.json(newWallet)
  } catch (error) {
    console.error('Error creating whale wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create whale wallet' },
      { status: 500 }
    )
  }
}
