import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/middleware'
import dbConnect from '@/lib/database/mongoose'
import TrackedWallet from '@/models/TrackedWallet'
import Activity from '@/models/Activity'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = await verifyAuth(request)
    if (!user || !user.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network') || undefined
    const isOwned = searchParams.get('isOwned') ? 
      searchParams.get('isOwned') === 'true' : undefined

    const wallets = await (TrackedWallet as any).getUserWallets(
      new mongoose.Types.ObjectId(user.userId),
      network,
      isOwned
    )

    return NextResponse.json({
      success: true,
      data: wallets
    })

  } catch (error) {
    console.error('Wallet fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch wallets' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = await verifyAuth(request)
    if (!user || !user.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address, network, label, isOwned } = await request.json()

    if (!address || !network) {
      return NextResponse.json(
        { error: 'Address and network are required' },
        { status: 400 }
      )
    }

    // Validate network
    const supportedNetworks = [
      'ethereum', 'bitcoin', 'solana', 'polygon', 'binance-smart-chain', 
      'avalanche', 'arbitrum', 'optimism', 'fantom', 'cardano', 'polkadot', 'cosmos'
    ]
    
    if (!supportedNetworks.includes(network)) {
      return NextResponse.json(
        { error: 'Unsupported network' },
        { status: 400 }
      )
    }

    const wallet = await (TrackedWallet as any).addWallet(
      new mongoose.Types.ObjectId(user.userId),
      address,
      network,
      label,
      isOwned || false
    )

    // Create activity log
    await (Activity as any).createActivity(
      new mongoose.Types.ObjectId(user.userId),
      'wallet_connect',
      `Added ${network} wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
      {
        walletAddress: address,
        network,
        isOwned: isOwned || false,
        label
      }
    )

    return NextResponse.json({
      success: true,
      data: wallet
    })

  } catch (error) {
    console.error('Wallet creation error:', error)
    if (error instanceof Error && error.message === 'Wallet already being tracked') {
      return NextResponse.json(
        { error: 'Wallet is already being tracked' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add wallet' 
      }, 
      { status: 500 }
    )
  }
}
