import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import WhaleWallet from '@/models/WhaleWallet'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'totalValue'
    const order = searchParams.get('order') || 'desc'

    await dbConnect()

    const skip = (page - 1) * limit
    const sortOrder = order === 'desc' ? -1 : 1

    const wallets = await WhaleWallet.find({ trackingUsers: auth.userId })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await WhaleWallet.countDocuments({ trackingUsers: auth.userId })

    // Simulate fresh data for demo (in real app, fetch from blockchain APIs)
    const walletsWithFreshData = wallets.map((wallet) => ({
      ...wallet,
      portfolioChange24h: (Math.random() - 0.5) * 20, // Random change between -10% and +10%
    }))

    return NextResponse.json({
      wallets: walletsWithFreshData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching whale wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch whale wallets', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { address, network, label, isOwned } = await request.json()

    if (!address || !network) {
      return NextResponse.json(
        { error: 'Wallet address and network are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if wallet is already being tracked by this user
    let existingWallet = await WhaleWallet.findOne({
      address: address.toLowerCase()
    })

    if (existingWallet) {
      // Add user to tracking list if not already tracking
      if (auth.userId && !existingWallet.trackingUsers.includes(auth.userId)) {
        existingWallet.trackingUsers.push(auth.userId)
        existingWallet.isTracked = true
        await existingWallet.save()
      }
      return NextResponse.json({ 
        message: 'Wallet added to tracking list', 
        wallet: existingWallet 
      })
    }

    // Create demo wallet data (in real app, fetch from blockchain APIs)
    const totalValue = 100000 + Math.random() * 900000 // Random value between 100k and 1M
    const isWhale = totalValue >= 1000000

    // Create chain data for the selected network
    const chainData = {
      chain: network,
      nativeBalance: (Math.random() * 100).toFixed(6),
      nativeBalanceFormatted: parseFloat((Math.random() * 100).toFixed(6)),
      nativeValue: Math.random() * 50000,
      totalValue: totalValue,
      tokenCount: Math.floor(Math.random() * 20) + 1,
      transactionCount: Math.floor(Math.random() * 1000) + 10,
      lastActivity: new Date()
    }

    // Create demo assets
    const demoAssets = [
      {
        symbol: network === 'ethereum' ? 'ETH' : network === 'solana' ? 'SOL' : 'BTC',
        name: network === 'ethereum' ? 'Ethereum' : network === 'solana' ? 'Solana' : 'Bitcoin',
        balance: chainData.nativeBalanceFormatted,
        value: chainData.nativeValue,
        price: Math.random() * 1000,
        change24h: (Math.random() - 0.5) * 20,
        chain: network,
        type: 'native' as const
      },
      ...Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
        symbol: `TOKEN${i + 1}`,
        name: `Demo Token ${i + 1}`,
        balance: Math.random() * 1000,
        value: Math.random() * 10000,
        price: Math.random() * 100,
        change24h: (Math.random() - 0.5) * 30,
        chain: network,
        type: 'token' as const
      }))
    ]

    // Create demo transactions
    const demoTransactions = Array.from({ length: 10 }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      type: Math.random() > 0.5 ? 'in' : 'out' as 'in' | 'out',
      amount: Math.random() * 10,
      token: demoAssets[0].symbol,
      tokenSymbol: demoAssets[0].symbol,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      value: Math.random() * 1000,
      chain: network,
      status: 'success' as const
    }))

    // Create whale wallet entry
    const whaleWallet = await WhaleWallet.create({
      address: address.toLowerCase(),
      label: label || `${isOwned ? 'My' : 'Tracked'} Wallet`,
      totalValue: totalValue,
      chains: [chainData],
      assets: demoAssets,
      transactions: demoTransactions,
      portfolioChange24h: (Math.random() - 0.5) * 20,
      isTracked: true,
      trackingUsers: auth.userId ? [auth.userId] : [],
      lastActivity: new Date(),
      totalTransactions: chainData.transactionCount,
      isWhale: isWhale,
      riskScore: Math.floor(Math.random() * 100),
      tags: isOwned ? ['owned'] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: 'Wallet added successfully',
      wallet: whaleWallet
    })

  } catch (error: any) {
    console.error('Error adding whale wallet:', error)
    return NextResponse.json(
      { error: 'Failed to add wallet', details: error.message },
      { status: 500 }
    )
  }
}
