import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/middleware'
import { BlockchainService } from '@/lib/blockchain/walletService'
import { rateLimitPresets } from '@/lib/middleware/rateLimiter'

export async function POST(request: NextRequest) {
  return rateLimitPresets.read(request, async (req) => {
    try {
      // Verify authentication
      const auth = await verifyAuth(req)
      if (!auth.authenticated) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const { address } = await req.json()

      if (!address) {
        return NextResponse.json(
          { error: 'Wallet address is required' },
          { status: 400 }
        )
      }

      const blockchainService = BlockchainService.getInstance()
      
      try {
        // Search wallet across all supported chains
        const walletInfos = await blockchainService.searchWallet(address)
        
        if (walletInfos.length === 0) {
          return NextResponse.json(
            { error: 'No wallet data found on supported chains' },
            { status: 404 }
          )
        }

        const multiChainSummary = await blockchainService.getMultiChainSummary(address)

        return NextResponse.json({
          address,
          chains: walletInfos,
          summary: multiChainSummary,
          isWhale: multiChainSummary.totalValue >= 100000
        })

      } catch (error) {
        console.error('Blockchain service error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch wallet data from blockchain' },
          { status: 500 }
        )
      }

    } catch (error) {
      console.error('Error searching wallet:', error)
      return NextResponse.json(
        { error: 'Failed to search wallet' },
        { status: 500 }
      )
    }
  })
}
