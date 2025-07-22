import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Wallet from '@/models/Wallet'
import { verifyAuth } from '@/lib/auth/middleware'
import { whaleTrackingService } from '@/lib/services/whaleTrackingService'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const userId = authResult.userId

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    await dbConnect()

    // Check if wallet exists in database
    let wallet = await Wallet.findOne({ address: address.toLowerCase() })

    if (!wallet) {
      // Fetch wallet data from blockchain
      try {
        const walletData = await whaleTrackingService.getWalletDetails(address)
        
        if (!walletData) {
          return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
        }

        // Create new wallet entry
        wallet = await Wallet.create({
          address: address.toLowerCase(),
          ens: walletData.ens,
          totalValue: walletData.totalValue,
          totalChange24h: walletData.totalChange24h,
          transactionCount: walletData.transactionCount,
          holdings: walletData.holdings,
          recentTransactions: walletData.recentTransactions,
          trackingUsers: [userId],
          chain: 'ethereum',
          lastActive: new Date()
        })
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        // Return mock data for now
        wallet = {
          address: address.toLowerCase(),
          ens: null,
          totalValue: 0,
          totalChange24h: 0,
          transactionCount: 0,
          firstSeen: new Date(),
          lastActive: new Date(),
          isContract: false,
          tags: [],
          holdings: [],
          recentTransactions: [],
          profitLoss: 0,
          realizedPnL: 0,
          unrealizedPnL: 0,
          trackingUsers: [userId],
          chain: 'ethereum'
        }
      }
    } else {
      // Add user to tracking if not already tracking
      if (!wallet.trackingUsers.includes(userId)) {
        wallet.trackingUsers.push(userId)
        await wallet.save()
      }
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
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
    const { address } = body
    const userId = authResult.userId

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if wallet already exists
    let wallet = await Wallet.findOne({ address: address.toLowerCase() })

    if (wallet) {
      // Add user to tracking list if not already tracking
      if (!wallet.trackingUsers.includes(userId)) {
        wallet.trackingUsers.push(userId)
        await wallet.save()
      }
      return NextResponse.json(wallet)
    }

    // Fetch wallet data from blockchain
    try {
      const walletData = await whaleTrackingService.getWalletDetails(address)
      
      // Create new wallet
      wallet = await Wallet.create({
        address: address.toLowerCase(),
        ens: walletData?.ens,
        totalValue: walletData?.totalValue || 0,
        totalChange24h: walletData?.totalChange24h || 0,
        transactionCount: walletData?.transactionCount || 0,
        holdings: walletData?.holdings || [],
        recentTransactions: walletData?.recentTransactions || [],
        trackingUsers: [userId],
        chain: 'ethereum'
      })

      return NextResponse.json(wallet, { status: 201 })
    } catch (error) {
      console.error('Error creating wallet:', error)
      
      // Create wallet with minimal data
      wallet = await Wallet.create({
        address: address.toLowerCase(),
        trackingUsers: [userId],
        chain: 'ethereum'
      })

      return NextResponse.json(wallet, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const userId = authResult.userId

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    await dbConnect()

    const wallet = await Wallet.findOne({ address: address.toLowerCase() })
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Remove user from tracking list
    wallet.trackingUsers = wallet.trackingUsers.filter(id => id !== userId)
    
    // If no users are tracking, delete the wallet
    if (wallet.trackingUsers.length === 0) {
      await wallet.deleteOne()
    } else {
      await wallet.save()
    }

    return NextResponse.json({ message: 'Wallet removed from tracking' })
  } catch (error) {
    console.error('Error removing wallet:', error)
    return NextResponse.json(
      { error: 'Failed to remove wallet' },
      { status: 500 }
    )
  }
}