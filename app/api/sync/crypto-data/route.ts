import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'
import MarketData from '@/models/MarketData'
import { cryptoDataService } from '@/lib/services/cryptoDataService'

// Projeleri gerçek verilerle güncelle
export async function POST(request: NextRequest) {
  try {
    // Cron secret kontrolü (güvenlik için)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // 1. Top 100 kripto parayı getir
    const topCryptos = await cryptoDataService.getTopCryptoPrices(100)
    
    // 2. Trending coinleri getir
    const trendingCoins = await cryptoDataService.getTrendingCryptos()
    
    // 3. Global market verilerini getir
    const globalData = await cryptoDataService.getGlobalMarketData()

    let updatedCount = 0
    let addedCount = 0

    // 4. Her kripto para için veritabanını güncelle
    for (const crypto of topCryptos) {
      try {
        // Mevcut projeyi bul veya yeni oluştur
        const existingProject = await Project.findOne({
          $or: [
            { symbol: crypto.symbol.toUpperCase() },
            { name: { $regex: new RegExp(`^${crypto.name}$`, 'i') } }
          ]
        })

        const projectData = {
          name: crypto.name,
          symbol: crypto.symbol.toUpperCase(),
          logo: `https://ui-avatars.com/api/?name=${crypto.symbol}&background=64748b&color=fff`,
          description: `${crypto.name} is a cryptocurrency ranked #${crypto.market_cap_rank} by market cap.`,
          category: determineCategory(crypto.id),
          website: `https://www.coingecko.com/en/coins/${crypto.id}`,
          blockchain: 'Multi-chain',
          marketData: {
            price: crypto.current_price,
            marketCap: crypto.market_cap,
            volume24h: crypto.total_volume,
            change24h: crypto.price_change_percentage_24h || 0,
            change7d: crypto.price_change_percentage_7d_in_currency || 0,
            change30d: crypto.price_change_percentage_30d_in_currency || 0,
            circulatingSupply: crypto.circulating_supply,
            totalSupply: crypto.total_supply,
            maxSupply: crypto.max_supply,
            ath: crypto.ath,
            athDate: new Date(crypto.ath_date),
            atl: crypto.atl,
            atlDate: new Date(crypto.atl_date),
            marketCapRank: crypto.market_cap_rank
          },
          metrics: {
            socialScore: Math.floor(Math.random() * 100), // Gerçek sosyal veriler için ayrı API gerekli
            trendingScore: trendingCoins.some(t => t.item.id === crypto.id) ? 90 : Math.floor(Math.random() * 50),
            hypeScore: Math.abs(crypto.price_change_percentage_24h || 0) > 10 ? 80 : Math.floor(Math.random() * 60),
            holders: Math.floor(crypto.market_cap / crypto.current_price / 1000) // Tahmini
          },
          isActive: true,
          lastUpdated: new Date()
        }

        if (existingProject) {
          await Project.findByIdAndUpdate(existingProject._id, projectData)
          updatedCount++
        } else {
          await Project.create({
            ...projectData,
            addedBy: 'system-sync',
            addedAt: new Date()
          })
          addedCount++
        }

        // Market data geçmişini de kaydet
        await MarketData.create({
          projectId: existingProject?._id || crypto.id,
          symbol: crypto.symbol.toUpperCase(),
          price: crypto.current_price,
          marketCap: crypto.market_cap,
          volume24h: crypto.total_volume,
          change24h: crypto.price_change_percentage_24h || 0,
          timestamp: new Date()
        })

      } catch (error) {
        console.error(`Error updating ${crypto.name}:`, error)
      }
    }

    // 5. Global istatistikleri güncelle (cache için)
    const stats = {
      totalMarketCap: globalData.total_market_cap,
      totalVolume: globalData.total_volume,
      marketCapChange24h: globalData.market_cap_change_percentage_24h,
      activeCryptos: globalData.active_cryptocurrencies,
      lastSync: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto data synced successfully',
      stats: {
        updated: updatedCount,
        added: addedCount,
        total: topCryptos.length,
        globalStats: stats
      }
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync crypto data' },
      { status: 500 }
    )
  }
}

// Manuel senkronizasyon için GET endpoint'i
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Son güncelleme zamanını kontrol et
    const lastProject = await Project.findOne().sort({ lastUpdated: -1 })
    const lastUpdate = lastProject?.lastUpdated || new Date(0)
    const timeSinceUpdate = Date.now() - lastUpdate.getTime()
    const minutesSinceUpdate = Math.floor(timeSinceUpdate / 1000 / 60)

    // Proje istatistikleri
    const projectCount = await Project.countDocuments({ isActive: true })
    const testnetCount = await Project.countDocuments({ isTestnet: true })
    
    return NextResponse.json({
      lastUpdate: lastUpdate,
      minutesSinceUpdate,
      projectCount,
      testnetCount,
      needsUpdate: minutesSinceUpdate > 30, // 30 dakikadan eskiyse güncelleme gerekli
      message: 'Use POST method with proper authorization to sync data'
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}

// Kategori belirleme fonksiyonu
function determineCategory(coinId: string): string {
  const categories: Record<string, string[]> = {
    'DeFi': ['uniswap', 'aave', 'compound', 'maker', 'curve-dao-token', 'sushi', 'yearn-finance'],
    'Layer1': ['bitcoin', 'ethereum', 'cardano', 'solana', 'avalanche-2', 'cosmos', 'near'],
    'Layer2': ['polygon', 'arbitrum', 'optimism', 'immutable-x', 'loopring'],
    'Oracle': ['chainlink', 'band-protocol', 'tellor'],
    'Gaming': ['axie-infinity', 'the-sandbox', 'decentraland', 'gala', 'enjincoin'],
    'NFT': ['apecoin', 'flow', 'theta-network', 'chiliz'],
    'Meme': ['dogecoin', 'shiba-inu', 'pepe', 'floki', 'baby-doge-coin'],
    'AI': ['fetch-ai', 'singularitynet', 'ocean-protocol']
  }

  for (const [category, coins] of Object.entries(categories)) {
    if (coins.includes(coinId)) {
      return category
    }
  }

  return 'Other'
}
