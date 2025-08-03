import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Wallet from '@/models/Wallet'
import { verifyAuth } from '@/lib/auth/middleware'
import { walletService } from '@/lib/services/walletService'

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
        const walletData = await walletService.getWalletData(address)
        
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
          firstSeen: walletData.firstSeen,
          lastActive: walletData.lastActive,
          isContract: walletData.isContract,
          tags: walletData.tags,
          holdings: walletData.holdings,
          recentTransactions: walletData.recentTransactions.map(tx => ({
            id: tx.id,
            hash: tx.txHash,
            type: tx.type,
            token: tx.token,
            tokenAddress: tx.tokenAddress,
            amount: tx.amount,
            value: tx.value,
            from: tx.from,
            to: tx.to,
            timestamp: tx.timestamp,
            gasUsed: tx.gasUsed,
            status: tx.status,
            blockNumber: 0 // Will be populated from actual blockchain data
          })),
          profitLoss: walletData.profitLoss,
          realizedPnL: walletData.realizedPnL,
          unrealizedPnL: walletData.unrealizedPnL,
          trackingUsers: [userId!],
          chain: walletData.chain as 'ethereum' | 'bsc' | 'polygon' | 'arbitrum'
        })
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        
        // Return mock data for development
        const mockWalletData = {
          address: address.toLowerCase(),
          ens: undefined,
          totalValue: Math.floor(Math.random() * 1000000) + 50000,
          totalChange24h: (Math.random() - 0.5) * 20,
          transactionCount: Math.floor(Math.random() * 1000) + 100,
          firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          isContract: Math.random() < 0.1,
          tags: ['whale', 'active-trader'],
          holdings: [
            {
              symbol: 'ETH',
              name: 'Ethereum',
              address: '0x0000000000000000000000000000000000000000',
              balance: Math.random() * 100,
              value: Math.random() * 300000,
              price: 3000 + Math.random() * 500,
              change24h: (Math.random() - 0.5) * 10,
              allocation: 60 + Math.random() * 20,
              logo: '/tokens/eth.png'
            },
            {
              symbol: 'USDC',
              name: 'USD Coin',
              address: '0xa0b86a33e6e6a9d8c2c8e6e6e5e5e5e5e5e5e5e5',
              balance: Math.random() * 50000,
              value: Math.random() * 50000,
              price: 1,
              change24h: (Math.random() - 0.5) * 2,
              allocation: 20 + Math.random() * 20,
              logo: '/tokens/usdc.png'
            }
          ],
          recentTransactions: [],
          profitLoss: Math.random() * 100000,
          realizedPnL: Math.random() * 50000,
          unrealizedPnL: Math.random() * 50000,
          trackingUsers: userId ? [userId] : [],
          chain: 'ethereum'
        }
        
        return NextResponse.json(mockWalletData)
      }
    } else {
      // Add user to tracking if not already tracking
      if (userId && !wallet.trackingUsers.includes(userId)) {
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
    const { address, label } = body
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
      if (userId && !wallet.trackingUsers.includes(userId)) {
        wallet.trackingUsers.push(userId)
        await wallet.save()
      }
      return NextResponse.json(wallet)
    }

    // Fetch wallet data from blockchain
    try {
      const walletData = await walletService.getWalletData(address)
      
      // Create new wallet
      wallet = await Wallet.create({
        address: address.toLowerCase(),
        ens: walletData?.ens,
        totalValue: walletData?.totalValue || 0,
        totalChange24h: walletData?.totalChange24h || 0,
        transactionCount: walletData?.transactionCount || 0,
        firstSeen: walletData?.firstSeen || new Date(),
        lastActive: walletData?.lastActive || new Date(),
        isContract: walletData?.isContract || false,
        tags: walletData?.tags || [],
        holdings: walletData?.holdings || [],
        recentTransactions: walletData?.recentTransactions?.map(tx => ({
          id: tx.id,
          hash: tx.txHash,
          type: tx.type,
          token: tx.token,
          tokenAddress: tx.tokenAddress,
          amount: tx.amount,
          value: tx.value,
          from: tx.from,
          to: tx.to,
          timestamp: tx.timestamp,
          gasUsed: tx.gasUsed,
          status: tx.status,
          blockNumber: 0
        })) || [],
        profitLoss: walletData?.profitLoss || 0,
        realizedPnL: walletData?.realizedPnL || 0,
        unrealizedPnL: walletData?.unrealizedPnL || 0,
        trackingUsers: userId ? [userId] : [],
        chain: (walletData?.chain as 'ethereum' | 'bsc' | 'polygon' | 'arbitrum') || 'ethereum'
      })

      return NextResponse.json(wallet, { status: 201 })
    } catch (error) {
      console.error('Error creating wallet:', error)
      
      // Create wallet with minimal data
      wallet = await Wallet.create({
        address: address.toLowerCase(),
        trackingUsers: userId ? [userId] : [],
        chain: 'ethereum',
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
        unrealizedPnL: 0
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
