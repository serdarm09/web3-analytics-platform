import { NextRequest, NextResponse } from 'next/server'
import { cryptoDataService } from '@/lib/services/cryptoDataService'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'

// Bu endpoint düzenli olarak çağrılarak verileri günceller
// Vercel Cron Jobs veya harici bir cron servisi ile kullanılabilir
export async function GET(request: NextRequest) {
  try {
    // Cron secret kontrolü
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Sırayla güncelleme işlemlerini yap
    const results = {
      cryptoDataSync: false,
      whaleDataSync: false,
      portfolioUpdate: false,
      timestamp: new Date().toISOString()
    }

    // 1. Kripto verilerini güncelle
    try {
      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync/crypto-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      })
      
      if (syncResponse.ok) {
        results.cryptoDataSync = true
      }
    } catch (error) {
      console.error('Crypto data sync error:', error)
    }

    // 2. Whale verilerini güncelle (gelecekte eklenecek)
    // try {
    //   const whaleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync/whale-data`, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${process.env.CRON_SECRET}`
    //     }
    //   })
    //   
    //   if (whaleResponse.ok) {
    //     results.whaleDataSync = true
    //   }
    // } catch (error) {
    //   console.error('Whale data sync error:', error)
    // }

    // 3. Portfolio değerlerini güncelle (gelecekte eklenecek)
    // try {
    //   const portfolioResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync/portfolio-values`, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${process.env.CRON_SECRET}`
    //     }
    //   })
    //   
    //   if (portfolioResponse.ok) {
    //     results.portfolioUpdate = true
    //   }
    // } catch (error) {
    //   console.error('Portfolio update error:', error)
    // }

    return NextResponse.json({
      success: true,
      message: 'Cron job completed',
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    )
  }
}
